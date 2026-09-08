import { z } from "zod";

import { KnowledgeDatasetSchema, type KnowledgeDataset } from "@/domain/knowledge/schema";
import { lensEntityNamesMatch, normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { JourneyPlaceReviewDraft } from "./journey-place-review";

export const JourneyEntityResolutionDraftSchema = z.object({
  schemaVersion: z.literal("0.1.0"), status: z.literal("reviewed_entity_resolution"),
  journey: z.object({ id: z.string().min(1), label: z.string().min(1) }), packId: z.string().min(1),
  links: z.array(z.object({ candidateKey: z.string().min(1), candidateName: z.string().min(1), candidateEntityId: z.string().min(1).optional(), entityId: z.string().min(1), entityLabel: z.string().min(1), claimIds: z.array(z.string().min(1)) })),
  unresolved: z.array(z.object({ candidateKey: z.string().min(1), candidateName: z.string().min(1), reason: z.enum(["not_found", "ambiguous"]), matchingEntityIds: z.array(z.string().min(1)) })),
});
export type JourneyEntityResolutionDraft = z.infer<typeof JourneyEntityResolutionDraftSchema>;

export function buildJourneyEntityResolutionDraft(review: JourneyPlaceReviewDraft, pack: LensKnowledgePack): JourneyEntityResolutionDraft {
  const links: JourneyEntityResolutionDraft["links"] = [];
  const unresolved: JourneyEntityResolutionDraft["unresolved"] = [];
  for (const candidate of review.places.filter((place) => place.classification === "historical_candidate")) {
    const candidateName = normalizeLensEntityName(candidate.name);
    const exactMatches = pack.entities.filter((entity) => [entity.label, ...entity.aliases].some((name) => normalizeLensEntityName(name) === candidateName));
    const matches = exactMatches.length > 0 ? exactMatches : pack.entities.filter((entity) => [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(candidate.name, name)));
    if (matches.length !== 1) {
      unresolved.push({ candidateKey: candidate.key, candidateName: candidate.name, reason: matches.length === 0 ? "not_found" : "ambiguous", matchingEntityIds: matches.map((entity) => entity.id) });
      continue;
    }
    links.push({ candidateKey: candidate.key, candidateName: candidate.name, candidateEntityId: candidate.entityId, entityId: matches[0].id, entityLabel: matches[0].label, claimIds: candidate.claimIds });
  }
  return JourneyEntityResolutionDraftSchema.parse({ schemaVersion: "0.1.0", status: "reviewed_entity_resolution", journey: review.journey, packId: pack.id, links, unresolved });
}

function matchesReference(name: string, id: string | undefined, link: JourneyEntityResolutionDraft["links"][number]) {
  if (id) return id === link.candidateEntityId || id === link.entityId;
  return lensEntityNamesMatch(name, link.candidateName) || lensEntityNamesMatch(name, link.entityLabel);
}
function resolvedId(name: string, currentId: string | undefined, link: JourneyEntityResolutionDraft["links"][number]) {
  if (!matchesReference(name, currentId, link)) return currentId;
  if (currentId && currentId !== link.candidateEntityId && currentId !== link.entityId) throw new Error(`Entity reference already has a different stable ID: ${currentId}`);
  return link.entityId;
}

export function applyJourneyEntityResolutionDraft(dataset: KnowledgeDataset, draft: JourneyEntityResolutionDraft) {
  if (draft.unresolved.length > 0) throw new Error("Entity resolution has unresolved candidates.");
  const claimIds = new Set(draft.links.flatMap((link) => link.claimIds));
  const foundClaimIds = new Set<string>();
  const claims = dataset.claims.map((claim) => {
    if (!claimIds.has(claim.id)) return claim;
    foundClaimIds.add(claim.id);
    return draft.links.filter((link) => link.claimIds.includes(claim.id)).reduce((current, link) => ({
      ...current,
      subject: { ...current.subject, id: resolvedId(current.subject.name, current.subject.id, link) },
      object: current.object.kind === "entity" ? { ...current.object, entity: { ...current.object.entity, id: resolvedId(current.object.entity.name, current.object.entity.id, link) } } : current.object,
      places: current.places.map((place) => ({ ...place, entityId: resolvedId(place.name, place.entityId, link) })),
    }), claim);
  });
  if ([...claimIds].some((id) => !foundClaimIds.has(id))) throw new Error("Entity resolution references an unknown Claim.");
  return KnowledgeDatasetSchema.parse({ ...dataset, claims });
}

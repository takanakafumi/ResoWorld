import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import { registeredLensKnowledgePacks, registeredLensTopics } from "./knowledge-registry";
import { projectLensPreset } from "./projection";
import { lensEntityNamesMatch } from "./entity-identity";

const relationFamilyLabels: Record<string, string> = {
  "historical-context": "歴史的文脈",
  association: "関連",
  ritual: "祭礼・行事",
  enshrinement: "祭神・鎮座",
  syncretism: "習合・再構成",
  influence: "影響",
  identification: "比定",
  route: "経路",
};

export type SpotKnowledgeContext = {
  id: string;
  packId: string;
  packLabel: string;
  lensId: string;
  topicId?: string;
  topicLabel?: string;
  entityId: string;
  entityLabel: string;
  basis: "spot_identity" | "claim_entity";
  claimIds: string[];
  relations: {
    id: string;
    relatedEntityLabel: string;
    relationFamily: string;
    relationLabel: string;
    note?: string;
  }[];
  sources: {
    id: string;
    title: string;
    url?: string;
    publisher?: string;
  }[];
};

const topicEntitiesCache = new Map<string, Set<string>>();

function getTopicEntityIds(pack: (typeof registeredLensKnowledgePacks)[number]["pack"], presetId: string): Set<string> {
  const cacheKey = `${pack.id}:${presetId}`;
  const cached = topicEntitiesCache.get(cacheKey);
  if (cached) return cached;
  try {
    const projection = projectLensPreset(pack, presetId);
    const ids = new Set(projection.nodes.map((n) => n.id));
    topicEntitiesCache.set(cacheKey, ids);
    return ids;
  } catch {
    const preset = pack.presets.find((p) => p.id === presetId);
    const ids = new Set(preset?.rootEntityIds ?? []);
    topicEntitiesCache.set(cacheKey, ids);
    return ids;
  }
}

export function resolveSpotKnowledgeContexts(
  spot: ReviewAtlasSpot,
  claims: ReviewDataset["claims"] = [],
): SpotKnowledgeContext[] {
  const relevantClaims = claims.filter((claim) => spot.claimIds.includes(claim.id));
  const claimReferences = relevantClaims.flatMap((claim) => [
    claim.subject,
    ...(claim.object.kind === "entity" ? [claim.object.entity] : []),
    ...claim.places.map((place) => ({ id: place.entityId, name: place.name })),
  ]);
  return registeredLensKnowledgePacks.flatMap(({ pack, lensId }) => {
    const entityById = new Map(pack.entities.map((entity) => [entity.id, entity]));
    const sourceById = new Map(pack.sources.map((source) => [source.id, source]));
    return pack.entities.flatMap((entity) => {
      const spotIdentityMatch = [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(spot.name, name));
      const matchingClaims = relevantClaims.filter((claim) => {
        const references = [claim.subject, ...(claim.object.kind === "entity" ? [claim.object.entity] : []), ...claim.places.map((place) => ({ id: place.entityId, name: place.name }))];
        return references.some((reference) => reference.id === entity.id || (!reference.id && [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(reference.name, name))));
      });
      const claimEntityMatch = claimReferences.some((reference) => reference.id === entity.id || (!reference.id && [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(reference.name, name))));
      if (!spotIdentityMatch && !claimEntityMatch) return [];
      const assertions = pack.assertions.filter(
        (assertion) => assertion.subjectId === entity.id || assertion.objectId === entity.id,
      );
      if (assertions.length === 0) return [];
      const sourceIds = [...new Set(assertions.flatMap((assertion) => assertion.sourceIds))];
      const candidateTopics = registeredLensTopics.filter(
        (topic) => topic.perspectiveId === lensId && topic.pack.id === pack.id,
      );
      const matchingTopic = candidateTopics.find((topic) =>
        getTopicEntityIds(pack, topic.presetId).has(entity.id),
      );
      return [{
        id: `${pack.id}:${lensId}:${entity.id}`,
        packId: pack.id,
        packLabel: pack.label,
        lensId,
        topicId: matchingTopic?.id,
        topicLabel: matchingTopic?.label,
        entityId: entity.id,
        entityLabel: entity.label,
        basis: spotIdentityMatch ? "spot_identity" : "claim_entity",
        claimIds: matchingClaims.map((claim) => claim.id),
        relations: assertions.map((assertion) => ({
          id: assertion.id,
          relatedEntityLabel: entityById.get(
            assertion.subjectId === entity.id ? assertion.objectId : assertion.subjectId,
          )?.label ?? "関連対象",
          relationFamily: assertion.relationFamily,
          relationLabel: relationFamilyLabels[assertion.relationFamily] ?? "知識上の接続",
          note: assertion.note,
        })),
        sources: sourceIds.flatMap((sourceId) => {
          const source = sourceById.get(sourceId);
          return source ? [{ id: source.id, title: source.title, url: source.url, publisher: source.publisher }] : [];
        }),
      }];
    });
  });
}

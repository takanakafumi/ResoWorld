import { z } from "zod";

import { PlaceRoleSchema } from "@/domain/knowledge/schema";
import { PlaceResolutionSelectionSchema } from "./place-resolution";
import type { JourneyImportCandidate } from "./journey-candidate";

export const JourneyPlaceClassificationSchema = z.enum([
  "visited",
  "mentioned",
  "historical_candidate",
  "wanted_unvisited",
  "excluded",
]);

export const JourneyPlaceReviewDraftSchema = z.object({
  schemaVersion: z.literal("0.1.0"),
  status: z.literal("reviewed_place_classification"),
  journey: z.object({ id: z.string().min(1), label: z.string().min(1) }),
  documentIds: z.array(z.string().min(1)).min(1),
  places: z.array(z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    entityId: z.string().min(1).optional(),
    classification: JourneyPlaceClassificationSchema,
    roles: z.array(PlaceRoleSchema),
    claimIds: z.array(z.string().min(1)),
    positionCandidate: PlaceResolutionSelectionSchema.optional(),
  }).superRefine((place, context) => {
    if (place.positionCandidate && place.classification !== "visited" && place.classification !== "wanted_unvisited") {
      context.addIssue({ code: "custom", path: ["positionCandidate"], message: "Only visited or wanted-unvisited places can have a position candidate." });
    }
    if (place.classification === "visited" && place.claimIds.length === 0) {
      context.addIssue({ code: "custom", path: ["claimIds"], message: "A visited place needs at least one supporting Claim." });
    }
  })),
});

export type JourneyPlaceReviewDraft = z.infer<typeof JourneyPlaceReviewDraftSchema>;
export type JourneyPlaceClassification = z.infer<typeof JourneyPlaceClassificationSchema>;

export function assertJourneyPlaceReviewMatchesCandidate(
  candidate: JourneyImportCandidate,
  draft: JourneyPlaceReviewDraft,
) {
  if (draft.journey.id !== candidate.id || draft.journey.label !== candidate.label) {
    throw new Error("Journey identity does not match the candidate.");
  }
  if (JSON.stringify(draft.documentIds) !== JSON.stringify(candidate.documentIds)) {
    throw new Error("Journey documents do not match the candidate.");
  }
  const expected = new Map(candidate.placeCandidates.map((place) => [
    place.entityId ?? place.name.normalize("NFKC").toLocaleLowerCase("ja"),
    place,
  ]));
  if (draft.places.length !== expected.size) throw new Error("Journey place count does not match the candidate.");
  for (const place of draft.places) {
    const source = expected.get(place.key);
    if (!source || source.name !== place.name || source.entityId !== place.entityId ||
      JSON.stringify(source.roles) !== JSON.stringify(place.roles) ||
      JSON.stringify(source.claimIds) !== JSON.stringify(place.claimIds)) {
      throw new Error("Journey place references do not match the candidate.");
    }
  }
  return draft;
}

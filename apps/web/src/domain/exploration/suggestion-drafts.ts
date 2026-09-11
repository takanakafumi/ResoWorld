import { z } from "zod";

import type { ReviewDataset } from "@/domain/review/types";

export const SuggestionDraftOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().trim().min(1).max(240),
    targetName: z.string().trim().min(1).max(160),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    question: z.string().trim().min(1).max(500),
    missingInformation: z.string().trim().min(1).max(700),
    reason: z.string().trim().min(1).max(900),
    expectedObservation: z.string().trim().min(1).max(700),
    uncertainty: z.string().trim().min(1).max(700),
    claimIds: z.array(z.string().min(1)).min(1).max(12),
    anchorSpotIds: z.array(z.string().min(1)).min(1).max(8),
    connectionIds: z.array(z.string().min(1)).min(1).max(6),
  })).min(1).max(3),
});

export type SuggestionDraftOutput = z.infer<typeof SuggestionDraftOutputSchema>;

export function buildJourneySuggestionContext(dataset: ReviewDataset, journeyId: string) {
  const atlas = dataset.atlas;
  const journey = atlas?.journeys?.find((candidate) => candidate.id === journeyId);
  if (!atlas || !journey) throw new Error("Unknown Journey: " + journeyId);
  const documentIds = new Set(journey.documentIds);
  const spotIds = new Set(journey.spotIds);
  const connectionIds = new Set(journey.connectionIds);
  const claims = dataset.claims.filter((claim) =>
    claim.reviewStatus === "confirmed" &&
    claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
  );
  return {
    journey: { id: journey.id, label: journey.label },
    spots: atlas.spots.filter((spot) => spotIds.has(spot.id)).map(({ id, name, region, kind, claimIds }) => ({ id, name, region, kind, claimIds })),
    claims: claims.map(({ id, statement, claimKind, historicalTime }) => ({ id, statement, claimKind, historicalTime })),
    connections: atlas.connections.filter((connection) => connectionIds.has(connection.id)).map(({ id, title, summary, claimIds, spotIds: relatedSpotIds, concepts, facets }) => ({
      id, title, summary, claimIds, spotIds: relatedSpotIds, concepts, facets,
    })),
  };
}

export function validateSuggestionDraftReferences(
  output: SuggestionDraftOutput,
  context: ReturnType<typeof buildJourneySuggestionContext>,
) {
  const allowed = {
    claimIds: new Set(context.claims.map(({ id }) => id)),
    anchorSpotIds: new Set(context.spots.map(({ id }) => id)),
    connectionIds: new Set(context.connections.map(({ id }) => id)),
  };
  for (const [index, suggestion] of output.suggestions.entries()) {
    for (const key of ["claimIds", "anchorSpotIds", "connectionIds"] as const) {
      const unknown = suggestion[key].filter((id) => !allowed[key].has(id));
      if (unknown.length > 0) throw new Error("Suggestion " + (index + 1) + " has unknown " + key + ": " + unknown.join(", "));
    }
  }
  return output;
}

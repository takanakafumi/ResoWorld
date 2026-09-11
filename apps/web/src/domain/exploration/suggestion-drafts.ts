import { z } from "zod";

import type { ReviewDataset } from "@/domain/review/types";

export const SuggestionDraftOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().trim().min(1).max(240),
    targetName: z.string().trim().min(1).max(160),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    question: z.string().trim().min(1).max(240),
    missingInformation: z.string().trim().min(1).max(320),
    reason: z.string().trim().min(1).max(420),
    expectedObservation: z.string().trim().min(1).max(320),
    uncertainty: z.string().trim().min(1).max(320),
    claimIds: z.array(z.string().min(1)).min(1).max(6),
    anchorSpotIds: z.array(z.string().min(1)).min(1).max(4),
    connectionIds: z.array(z.string().min(1)).min(1).max(3),
  })).min(1).max(2),
});
export const SuggestionDraftJsonSchema = z.toJSONSchema(SuggestionDraftOutputSchema, {
  target: "draft-7",
  unrepresentable: "throw",
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
    (claim.reviewStatus === "confirmed" || claim.reviewStatus === "needs_review") &&
    claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
  );
  const journeyConnections = atlas.connections.filter((connection) => connectionIds.has(connection.id));
  const connectionClaimIds = new Set(journeyConnections.flatMap((connection) => connection.claimIds));
  const prioritizedClaims = [...claims].sort((left, right) => {
    const connectionDifference = Number(connectionClaimIds.has(right.id)) - Number(connectionClaimIds.has(left.id));
    if (connectionDifference !== 0) return connectionDifference;
    const kindScore = (claim: typeof left) => claim.claimKind === "question" ? 2 : claim.claimKind === "hypothesis" ? 1 : 0;
    return kindScore(right) - kindScore(left);
  }).slice(0, 60);
  return {
    journey: { id: journey.id, label: journey.label },
    spots: atlas.spots.filter((spot) => spotIds.has(spot.id)).map(({ id, name, region, kind, claimIds }) => ({ id, name, region, kind, claimIds })),
    claims: prioritizedClaims.map(({ id, statement, claimKind, historicalTime, reviewStatus }) => ({ id, statement, claimKind, historicalTime, reviewStatus })),
    connections: journeyConnections.map(({ id, title, summary, claimIds, spotIds: relatedSpotIds, concepts, facets }) => ({
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
    const prose = [
      suggestion.title,
      suggestion.targetName,
      suggestion.question,
      suggestion.missingInformation,
      suggestion.reason,
      suggestion.expectedObservation,
      suggestion.uncertainty,
    ].join("\n");
    if (/(?:claim|spot|connection|itinerary)-[a-zA-Z0-9]/.test(prose)) {
      throw new Error("Suggestion " + (index + 1) + " exposes an internal ID in reader-facing prose.");
    }
  }
  return output;
}

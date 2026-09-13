import { createHash } from "node:crypto";

import { z } from "zod";

import { knowledgeSuggestionConnectionsForVisitedSpots, knowledgeVisitFrontiersForVisitedSpots } from "@/domain/map/registry";
import type { ReviewAtlas, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

export const SuggestionDraftItemSchema = z.object({
    title: z.string().trim().min(1).max(240),
    targetName: z.string().trim().min(1).max(160),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    question: z.string().trim().min(1).max(240).regex(/[？?]$/, "Question must end with a question mark."),
    missingInformation: z.string().trim().min(1).max(320),
    reason: z.string().trim().min(1).max(420),
    expectedObservation: z.string().trim().min(1).max(320),
    uncertainty: z.string().trim().min(1).max(320),
    claimIds: z.array(z.string().min(1)).min(1).max(6),
    anchorSpotIds: z.array(z.string().min(1)).min(1).max(4),
    connectionIds: z.array(z.string().min(1)).min(1).max(3),
    targetPlaceId: z.string().min(1).optional(),
    targetLatitude: z.number().min(-90).max(90).optional(),
    targetLongitude: z.number().min(-180).max(180).optional(),
    targetKind: z.enum(["knowledge_unvisited", "missed_visit", "critical_revisit", "research"]).optional(),
});

export const SuggestionDraftOutputSchema = z.object({
  suggestions: z.array(SuggestionDraftItemSchema).min(1).max(2),
});
export const SuggestionDraftJsonSchema = z.toJSONSchema(SuggestionDraftOutputSchema, {
  target: "draft-7",
  unrepresentable: "throw",
});

export type SuggestionDraftOutput = z.infer<typeof SuggestionDraftOutputSchema>;
export const SuggestionDraftFileSchema = z.object({
  schemaVersion: z.literal("0.1.0"),
  createdAt: z.iso.datetime(),
  journeyId: z.string().min(1),
  provider: z.literal("ollama"),
  model: z.enum(["qwen3.5:9b", "gpt-oss:20b"]),
  attempts: z.number().int().min(1).max(3),
  usage: z.object({ inputTokens: z.number().int().nonnegative().nullable(), outputTokens: z.number().int().nonnegative().nullable() }),
  suggestions: SuggestionDraftOutputSchema.shape.suggestions,
});
export type SuggestionDraftFile = z.infer<typeof SuggestionDraftFileSchema>;

const INTERNAL_EDITORIAL_PHRASES = /(?:構造上の空白|入力(?:内|データ|情報|文)|件数合わせ|選択したConnection|この(?:記録|接続|訪問地)|問いは何か|詳細情報を追加|AIナレーター|旅行者)/;
const PLACEHOLDER_VALUE = /^(?:none|null|n\/a|unknown|needs_review|不明|なし|未確認)[。.]?$/i;

export function buildJourneySuggestionContext(dataset: ReviewDataset, journeyId: string) {
  const atlas = dataset.atlas;
  const journey = atlas?.journeys?.find((candidate) => candidate.id === journeyId);
  if (!atlas || !journey) throw new Error("Unknown Journey: " + journeyId);
  const documentIds = new Set(journey.documentIds);
  const spotIds = new Set(journey.spotIds);
  const connectionIds = new Set(journey.connectionIds);
  const journeySpots = atlas.spots.filter((spot) => spotIds.has(spot.id));
  const frontierPlaces = [
    ...(journey.unvisitedPlaces ?? []).map((place) => ({
      placeId: place.id, label: place.name, latitude: place.latitude, longitude: place.longitude,
      connectionId: `missed-visit:${place.id}`, connectionTitle: `${journey.label}で行けなかった場所`,
      anchorSpotIds: journey.spotIds, claimIds: place.claimIds,
      relationFamilies: ["missed-visit"], reviewStatus: "reviewed" as const, targetKind: "missed_visit" as const,
    })),
    ...knowledgeVisitFrontiersForVisitedSpots(journeySpots),
  ];
  const claims = dataset.claims.filter((claim) =>
    (claim.reviewStatus === "confirmed" || claim.reviewStatus === "needs_review") &&
    claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
  );
  const atlasConnections = atlas.connections.filter((connection) =>
    connectionIds.has(connection.id) &&
    connection.connectionKind !== "itinerary" &&
    connection.initialStatus !== "rejected",
  );
  const frontierConnections = [...new Map(frontierPlaces.map((frontier) => [frontier.connectionId, frontier])).values()].map((frontier) => ({
    id: frontier.connectionId,
    connectionKind: "documented" as const,
    initialStatus: frontier.reviewStatus === "reviewed" ? "confirmed" as const : "suggested" as const,
    eyebrow: "KNOWLEDGE FRONTIER",
    title: frontier.connectionTitle,
    summary: `訪問済み地点から未訪問の${frontier.label}へつながるKnowledge接続。`,
    spotIds: frontier.anchorSpotIds,
    claimIds: frontier.claimIds,
    concepts: frontierPlaces.filter(({ connectionId: id }) => id === frontier.connectionId).map(({ label }) => label),
    facets: frontier.relationFamilies.map((id) => ({ id, label: id, weight: 5 })),
    eras: [],
  }));
  const journeyConnections = [...new Map(
    [...atlasConnections, ...knowledgeSuggestionConnectionsForVisitedSpots(journeySpots), ...frontierConnections]
      .map((connection) => [connection.id, connection]),
  ).values()];
  const connectionClaimIds = new Set(journeyConnections.flatMap((connection) => connection.claimIds));
  const prioritizedClaims = [...claims].sort((left, right) => {
    const connectionDifference = Number(connectionClaimIds.has(right.id)) - Number(connectionClaimIds.has(left.id));
    if (connectionDifference !== 0) return connectionDifference;
    const kindScore = (claim: typeof left) => claim.claimKind === "question" ? 2 : claim.claimKind === "hypothesis" ? 1 : 0;
    return kindScore(right) - kindScore(left);
  }).slice(0, 60);
  return {
    journey: { id: journey.id, label: journey.label },
    spots: journeySpots.map(({ id, name, region, kind, claimIds }) => ({ id, name, region, kind, claimIds })),
    claims: prioritizedClaims.map(({ id, statement, claimKind, historicalTime, reviewStatus }) => ({ id, statement, claimKind, historicalTime, reviewStatus })),
    connections: journeyConnections.map(({ id, title, summary, claimIds, spotIds: relatedSpotIds, concepts, facets }) => ({
      id, title, summary, claimIds, spotIds: relatedSpotIds, concepts, facets,
    })),
    frontierPlaces,
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
    targetPlaceIds: new Set(context.frontierPlaces.map(({ placeId }) => placeId)),
  };
  for (const [index, suggestion] of output.suggestions.entries()) {
    if (suggestion.title === suggestion.question || /[？?]$/.test(suggestion.title)) {
      throw new Error("Suggestion " + (index + 1) + " uses its question as the title.");
    }
    for (const key of ["missingInformation", "reason", "expectedObservation", "uncertainty"] as const) {
      if (PLACEHOLDER_VALUE.test(suggestion[key])) {
        throw new Error("Suggestion " + (index + 1) + " uses a placeholder for " + key + ".");
      }
      if (suggestion[key].length >= 140 && !/[。！？?]$/.test(suggestion[key])) {
        throw new Error("Suggestion " + (index + 1) + " has an incomplete sentence in " + key + ".");
      }
    }
    for (const key of ["claimIds", "anchorSpotIds", "connectionIds"] as const) {
      const unknown = suggestion[key].filter((id) => !allowed[key].has(id));
      if (unknown.length > 0) throw new Error("Suggestion " + (index + 1) + " has unknown " + key + ": " + unknown.join(", "));
    }
    if (suggestion.targetPlaceId && !allowed.targetPlaceIds.has(suggestion.targetPlaceId)) {
      throw new Error("Suggestion " + (index + 1) + " has an unknown targetPlaceId: " + suggestion.targetPlaceId);
    }
    const selectedConnections = context.connections.filter(({ id }) => suggestion.connectionIds.includes(id));
    const connectedClaimIds = new Set(selectedConnections.flatMap((connection) => connection.claimIds));
    const connectedSpotIds = new Set(selectedConnections.flatMap((connection) => connection.spotIds));
    if (!suggestion.claimIds.some((id) => connectedClaimIds.has(id))) {
      throw new Error("Suggestion " + (index + 1) + " has no Claim shared with its Connections.");
    }
    if (!suggestion.anchorSpotIds.some((id) => connectedSpotIds.has(id))) {
      throw new Error("Suggestion " + (index + 1) + " has no Spot shared with its Connections.");
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
    if (/\b[a-f0-9]{20}\b/i.test(prose)) {
      throw new Error("Suggestion " + (index + 1) + " exposes a bare internal ID in reader-facing prose.");
    }
    if (INTERNAL_EDITORIAL_PHRASES.test(prose)) {
      throw new Error("Suggestion " + (index + 1) + " exposes internal editorial language in reader-facing prose.");
    }
    if (!/(?:史料|資料|記録|年代|発掘|経路|展示|典拠|祭祀|出土|由来|根拠|確認|比較|調査)/.test(suggestion.missingInformation)) {
      throw new Error("Suggestion " + (index + 1) + " does not name concrete missing evidence.");
    }
    if (!/(?:史料|資料|展示|説明|出土|形態|素材|年代|痕跡|位置|経路|比較|確認|観察|記述|遺構|地形|祭祀)/.test(suggestion.expectedObservation)) {
      throw new Error("Suggestion " + (index + 1) + " does not name a concrete observation.");
    }
    if (!/(?:史料|資料|展示|解釈|伝承|年代|比定|学説|更新|保存|発掘|記録|出典|地域差)/.test(suggestion.uncertainty)) {
      throw new Error("Suggestion " + (index + 1) + " does not name a concrete uncertainty.");
    }
  }
  return output;
}

export function suggestionDraftId(journeyId: string, suggestion: z.infer<typeof SuggestionDraftItemSchema>) {
  const identity = JSON.stringify({ journeyId, title: suggestion.title, question: suggestion.question, claimIds: [...suggestion.claimIds].sort(), anchorSpotIds: [...suggestion.anchorSpotIds].sort(), connectionIds: [...suggestion.connectionIds].sort() });
  return "suggestion-local-" + createHash("sha256").update(identity, "utf8").digest("hex").slice(0, 20);
}

export function applySuggestionDraftSelection(input: {
  atlas: ReviewAtlas;
  draft: SuggestionDraftFile;
  selectedIndexes: number[];
  allowedConnectionIds?: string[];
}) {
  const journey = input.atlas.journeys?.find(({ id }) => id === input.draft.journeyId);
  if (!journey) throw new Error("Suggestion draft Journey is not present in the Atlas.");
  const indexes = [...new Set(input.selectedIndexes)].sort((left, right) => left - right);
  if (indexes.length === 0) throw new Error("Select at least one Suggestion draft.");
  const spotById = new Map(input.atlas.spots.map((spot) => [spot.id, spot]));
  const allowedSpotIds = new Set(journey.spotIds);
  const allowedConnectionIds = new Set(input.allowedConnectionIds ?? journey.connectionIds);
  const additions: ReviewExplorationSuggestion[] = indexes.map((index) => {
    const suggestion = input.draft.suggestions[index];
    if (!suggestion) throw new Error("Suggestion draft selection is out of range.");
    if (suggestion.anchorSpotIds.some((id) => !allowedSpotIds.has(id))) throw new Error("Suggestion draft references a Spot outside its Journey.");
    if (suggestion.connectionIds.some((id) => !allowedConnectionIds.has(id))) throw new Error("Suggestion draft references a Connection outside its Journey.");
    const anchors = suggestion.anchorSpotIds.map((id) => spotById.get(id));
    if (anchors.some((spot) => !spot)) throw new Error("Suggestion draft references an unknown Spot.");
    const resolvedAnchors = anchors.filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
    const { targetLatitude, targetLongitude, ...suggestionData } = suggestion;
    return {
      id: suggestionDraftId(journey.id, suggestion),
      ...suggestionData,
      latitude: targetLatitude ?? resolvedAnchors.reduce((total, spot) => total + spot.latitude, 0) / resolvedAnchors.length,
      longitude: targetLongitude ?? resolvedAnchors.reduce((total, spot) => total + spot.longitude, 0) / resolvedAnchors.length,
      initialStatus: "accepted" as const,
    };
  });
  const existingIds = new Set(input.atlas.suggestions.map(({ id }) => id));
  const added = additions.filter(({ id }) => !existingIds.has(id));
  return { atlas: { ...input.atlas, suggestions: [...input.atlas.suggestions, ...added] }, added };
}

import type {
  ReviewAtlasConnection,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

export function resolveLensContinuations({
  suggestions,
  connections,
  facetIds,
  limit = 2,
}: {
  suggestions: ReviewExplorationSuggestion[];
  connections: ReviewAtlasConnection[];
  facetIds: readonly string[];
  limit?: number;
}) {
  if (facetIds.length === 0 || limit <= 0) return [];
  const acceptedFacets = new Set(facetIds);
  const connectionsById = new Map(connections.map((connection) => [connection.id, connection]));

  return suggestions
    .map((suggestion, index) => {
      const relatedConnections = suggestion.connectionIds
        .map((id) => connectionsById.get(id))
        .filter((connection): connection is ReviewAtlasConnection => Boolean(connection));
      const score = relatedConnections.reduce((total, connection) =>
        total + connection.facets.reduce((facetTotal, facet) =>
          facetTotal + (acceptedFacets.has(facet.id) ? facet.weight : 0), 0), 0);
      return { suggestion, score, index };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ suggestion }) => suggestion);
}

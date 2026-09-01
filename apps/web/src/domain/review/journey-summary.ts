import type { ReviewDataset } from "./types";

export type JourneySummary = {
  id: string;
  label: string;
  spotCount: number;
  connectionCount: number;
  claimCount: number;
  dominantFacets: { id: string; label: string; weight: number }[];
  entityTypes: string[];
};

export function buildJourneySummaries(dataset: ReviewDataset) {
  const atlas = dataset.atlas;
  if (!atlas?.journeys?.length) return { summaries: [] as JourneySummary[], commonEntityTypes: [] as string[] };

  const summaries = atlas.journeys.map((journey): JourneySummary => {
    const documentIds = new Set(journey.documentIds);
    const connectionIds = new Set(journey.connectionIds);
    const claims = dataset.claims.filter((claim) => claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)));
    const facetTotals = new Map<string, { label: string; weight: number }>();
    for (const connection of atlas.connections) {
      if (!connectionIds.has(connection.id)) continue;
      for (const facet of connection.facets) {
        const current = facetTotals.get(facet.id) ?? { label: facet.label, weight: 0 };
        current.weight += facet.weight;
        facetTotals.set(facet.id, current);
      }
    }
    return {
      id: journey.id,
      label: journey.label,
      spotCount: journey.spotIds.length,
      connectionCount: journey.connectionIds.length,
      claimCount: claims.length,
      dominantFacets: [...facetTotals.entries()].map(([id, value]) => ({ id, ...value })).sort((left, right) => right.weight - left.weight).slice(0, 3),
      entityTypes: [...new Set(claims.map((claim) => claim.subject.type))],
    };
  });
  const commonEntityTypes = summaries.length < 2 ? [] : summaries[0].entityTypes.filter((type) => summaries.slice(1).every((summary) => summary.entityTypes.includes(type)));
  return { summaries, commonEntityTypes };
}

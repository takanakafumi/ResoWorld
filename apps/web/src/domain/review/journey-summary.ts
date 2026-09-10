import type { ReviewDataset } from "./types";

export type JourneySummary = {
  id: string;
  label: string;
  spotCount: number;
  connectionCount: number;
  itineraryCount: number;
  claimCount: number;
  dominantFacets: { id: string; label: string; weight: number }[];
  entityTypes: string[];
  leadConnection?: {
    id: string;
    title: string;
    summary: string;
    claimCount: number;
  };
};

function connectionPriority(connection: NonNullable<ReviewDataset["atlas"]>["connections"][number]) {
  const statusWeight = connection.initialStatus === "confirmed" ? 10_000 : connection.initialStatus === "suggested" ? 1_000 : 0;
  const facetWeight = connection.facets.reduce((total, facet) => total + facet.weight, 0);
  return statusWeight + connection.claimIds.length * 100 + connection.spotIds.length * 10 + facetWeight;
}

export function buildJourneySummaries(dataset: ReviewDataset) {
  const atlas = dataset.atlas;
  if (!atlas?.journeys?.length) return { summaries: [] as JourneySummary[], commonEntityTypes: [] as string[] };

  const summaries = atlas.journeys.map((journey): JourneySummary => {
    const documentIds = new Set(journey.documentIds);
    const connectionIds = new Set(journey.connectionIds);
    const claims = dataset.claims.filter((claim) => claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)));
    const allJourneyConnections = atlas.connections.filter((connection) => connectionIds.has(connection.id));
    const journeyConnections = allJourneyConnections
      .filter((connection) => connection.connectionKind !== "itinerary")
      .sort((left, right) => connectionPriority(right) - connectionPriority(left));
    const facetTotals = new Map<string, { label: string; weight: number }>();
    for (const connection of journeyConnections) {
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
      connectionCount: journeyConnections.length,
      itineraryCount: allJourneyConnections.filter((connection) => connection.connectionKind === "itinerary").length,
      claimCount: claims.length,
      dominantFacets: [...facetTotals.entries()].map(([id, value]) => ({ id, ...value })).sort((left, right) => right.weight - left.weight).slice(0, 3),
      entityTypes: [...new Set(claims.map((claim) => claim.subject.type))],
      leadConnection: journeyConnections[0] ? {
        id: journeyConnections[0].id,
        title: journeyConnections[0].title,
        summary: journeyConnections[0].summary,
        claimCount: journeyConnections[0].claimIds.length,
      } : undefined,
    };
  });
  const commonEntityTypes = summaries.length < 2 ? [] : summaries[0].entityTypes.filter((type) => summaries.slice(1).every((summary) => summary.entityTypes.includes(type)));
  return { summaries, commonEntityTypes };
}

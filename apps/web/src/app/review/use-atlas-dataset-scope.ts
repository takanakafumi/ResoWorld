"use client";

import { useMemo, useState } from "react";

import { currentSuggestions } from "@/domain/exploration/suggestion-policy";
import { isMapVisitSpot } from "@/domain/map/spot-presentation";
import { orderSpotsByJourney } from "@/domain/review/journeys";
import type {
  ReviewAtlas,
  ReviewDataset,
} from "@/domain/review/types";

import { useConnectionStatuses, usePositionStatuses } from "./use-atlas-statuses";

export function makeFallbackAtlas(dataset: ReviewDataset): ReviewAtlas {
  return {
    title: `${dataset.documents.length}件の記録・位置未確認`,
    spots: [],
    connections: [],
    suggestions: [],
  };
}

export type UseAtlasDatasetScopeOptions = {
  dataset: ReviewDataset;
  initialJourneyId?: string;
};

export function useAtlasDatasetScope({
  dataset,
  initialJourneyId,
}: UseAtlasDatasetScopeOptions) {
  const atlas = useMemo(() => {
    const source = dataset.atlas ?? makeFallbackAtlas(dataset);
    return { ...source, suggestions: currentSuggestions(source.suggestions) };
  }, [dataset]);

  const [selectedJourneyId, setSelectedJourneyId] = useState(() =>
    atlas.journeys?.some(({ id }) => id === initialJourneyId) ? initialJourneyId! : "all",
  );
  const [includeRejectedConnections, setIncludeRejectedConnections] = useState(false);
  const { statuses: connectionStatuses, updateStatus: updateConnectionStatus } =
    useConnectionStatuses(dataset.datasetId);

  const selectedJourney = atlas.journeys?.find((journey) => journey.id === selectedJourneyId);

  const scopedClaims = useMemo(() => {
    if (!selectedJourney) return dataset.claims;
    const documentIds = new Set(selectedJourney.documentIds);
    return dataset.claims.filter((claim) =>
      claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
    );
  }, [dataset.claims, selectedJourney]);

  const mapVisitSpotIds = useMemo(
    () => new Set(atlas.spots.filter(isMapVisitSpot).map(({ id }) => id)),
    [atlas.spots],
  );

  const journeySpotCount = (spotIds: string[]) =>
    spotIds.filter((id) => mapVisitSpotIds.has(id)).length;

  const scopedAtlas = useMemo(() => {
    if (!selectedJourney) return atlas;
    const spotIds = new Set(selectedJourney.spotIds);
    const connectionIds = new Set(selectedJourney.connectionIds);
    return {
      ...atlas,
      spots: orderSpotsByJourney(atlas.spots, selectedJourney.spotIds),
      connections: atlas.connections.filter((connection) => connectionIds.has(connection.id)),
      suggestions: atlas.suggestions.filter((suggestion) =>
        suggestion.anchorSpotIds.some((spotId) => spotIds.has(spotId)) ||
        suggestion.connectionIds.some((connectionId) => connectionIds.has(connectionId)),
      ),
    };
  }, [atlas, selectedJourney]);

  const visibleConnections = useMemo(
    () => scopedAtlas.connections
      .map((connection) => ({
        ...connection,
        initialStatus: connectionStatuses[connection.id] ?? connection.initialStatus,
      }))
      .filter((connection) =>
        (includeRejectedConnections || connection.initialStatus !== "rejected"),
      ),
    [connectionStatuses, includeRejectedConnections, scopedAtlas.connections],
  );

  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);

  const displaySpots = useMemo(
    () => scopedAtlas.spots
      .filter((spot) => isMapVisitSpot(spot) || spot.mapRole === "candidate-place")
      .map((spot) => ({
        ...spot,
        positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
      })),
    [scopedAtlas.spots, positionStatuses],
  );

  const claimById = useMemo(
    () => new Map(scopedClaims.map((claim) => [claim.id, claim])),
    [scopedClaims],
  );

  const spotById = useMemo(
    () => new Map(scopedAtlas.spots.map((spot) => [
      spot.id,
      {
        ...spot,
        positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
      },
    ])),
    [scopedAtlas.spots, positionStatuses],
  );

  return {
    atlas,
    selectedJourneyId,
    setSelectedJourneyId,
    selectedJourney,
    scopedClaims,
    mapVisitSpotIds,
    journeySpotCount,
    scopedAtlas,
    connectionStatuses,
    updateConnectionStatus,
    includeRejectedConnections,
    setIncludeRejectedConnections,
    visibleConnections,
    positionStatuses,
    updatePositionStatus,
    displaySpots,
    claimById,
    spotById,
  };
}

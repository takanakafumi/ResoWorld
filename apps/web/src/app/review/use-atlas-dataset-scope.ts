"use client";

import { useMemo, useState } from "react";

import { currentSuggestions } from "@/domain/exploration/suggestion-policy";
import { isMapVisitSpot } from "@/domain/map/spot-presentation";
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
};

export function useAtlasDatasetScope({
  dataset,
}: UseAtlasDatasetScopeOptions) {
  const atlas = useMemo(() => {
    const source = dataset.atlas ?? makeFallbackAtlas(dataset);
    return { ...source, suggestions: currentSuggestions(source.suggestions) };
  }, [dataset]);

  const [includeRejectedConnections, setIncludeRejectedConnections] = useState(false);
  const { statuses: connectionStatuses, updateStatus: updateConnectionStatus } =
    useConnectionStatuses(dataset.datasetId);

  const scopedClaims = dataset.claims;
  const scopedAtlas = atlas;

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
    () => new Map(dataset.claims.map((claim) => [claim.id, claim])),
    [dataset.claims],
  );

  const spotById = useMemo(
    () => new Map(atlas.spots.map((spot) => [
      spot.id,
      {
        ...spot,
        positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
      },
    ])),
    [atlas.spots, positionStatuses],
  );

  return {
    atlas,
    scopedClaims,
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

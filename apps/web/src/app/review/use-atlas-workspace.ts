"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { placeMatchesSpot } from "@/domain/map/registry";
import { projectMapScene } from "@/domain/map/scene";
import { reduceAtlasSelection } from "@/domain/map/selection";
import type { TopicMapScope } from "@/domain/map/markers";
import type {
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import { dominantFacet, facetColor } from "./atlas-lenses";
import { useAtlasDatasetScope, makeFallbackAtlas } from "./use-atlas-dataset-scope";
import {
  recognitionLensDefinitions,
  useAtlasLensState,
  type RecognitionLensDefinition,
} from "./use-atlas-lens-state";
import { useAtlasKnowledgeConnections } from "./use-atlas-knowledge-connections";
import { useAtlasSuggestions } from "./use-atlas-suggestions";

export { recognitionLensDefinitions, makeFallbackAtlas };
export type { RecognitionLensDefinition };

export type UseAtlasWorkspaceOptions = {
  dataset: ReviewDataset;
  initialJourneyId?: string;
  initialLensId?: string;
};

export function useAtlasWorkspace({
  dataset,
  initialJourneyId,
  initialLensId,
}: UseAtlasWorkspaceOptions) {
  // 1. Dataset & Scoping (Journeys, Claims, Atlas Spots, Connections)
  const {
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
  } = useAtlasDatasetScope({ dataset, initialJourneyId });

  // 2. Map Selection Reducer
  const [selection, dispatchSelection] = useReducer(reduceAtlasSelection, {
    spotId: "",
    focus: { kind: "none" },
  });

  const [spotInspectorOpen, setSpotInspectorOpen] = useState(false);

  // Spot selection resolution
  const selectedSpot =
    selection.focus.kind === "spot" ||
    (selection.focus.kind === "exploration-connection" && selection.focus.focusSpot)
      ? spotById.get(selection.spotId)
      : undefined;

  const selectedSpotClaims = useMemo(
    () =>
      (selectedSpot?.claimIds ?? [])
        .map((id) => claimById.get(id))
        .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim)),
    [selectedSpot?.claimIds, claimById],
  );

  const selectedSpotKnowledge = useMemo(
    () => (selectedSpot ? resolveSpotKnowledgeContexts(selectedSpot, selectedSpotClaims) : []),
    [selectedSpot, selectedSpotClaims],
  );

  const spotConnections = useMemo(
    () => visibleConnections.filter((connection) => connection.spotIds.includes(selectedSpot?.id ?? "")),
    [visibleConnections, selectedSpot?.id],
  );

  // 3. Lens & Topic State
  const {
    selectedRecognitionLens,
    setSelectedRecognitionLens,
    selectedLensTopicId,
    setSelectedLensTopicId,
    selectedLensDefinition,
    effectiveTopicId,
    isOverview,
    currentLensTopics,
    systemLensActive,
    availableRecognitionLenses,
    lensLayout,
    setLensLayout,
    selectRecognitionLens,
    selectLensById,
  } = useAtlasLensState({
    initialLensId,
    scopedClaims,
    displaySpots,
    scopedAtlasSpots: scopedAtlas.spots,
    selectedSpotId: selectedSpot?.id,
    dispatchSelection,
    setSpotInspectorOpen,
  });

  // 4. Knowledge Connections & Active Connections
  const {
    visibleKnowledgeMapConnections,
    topicFilteredKnowledgeConnections,
    activeConnections,
  } = useAtlasKnowledgeConnections({
    isOverview,
    selectedRecognitionLens,
    selectedLensDefinition,
    displaySpots,
    visibleConnections,
    effectiveTopicId,
    currentLensTopics,
  });

  // 5. Suggestions & Frontier Exploration
  const {
    suggestionStatuses,
    updateSuggestionStatus,
    suggestionsVisible,
    setSuggestionsVisible,
    frontierSuggestions,
    allSuggestions,
    topicScopedSuggestions,
    visibleSuggestions,
    selectedSuggestion,
    selectedRouteNodeId,
    selectedSuggestionStatus,
    selectedSuggestionClaims,
    selectedSuggestionConnections,
    selectedSuggestionSpots,
    activeSuggestion,
    suggestionConnectionCatalog,
    selectSuggestion,
  } = useAtlasSuggestions({
    datasetId: dataset.datasetId,
    displaySpots,
    scopedAtlas,
    selectedJourney,
    isOverview,
    effectiveTopicId,
    selectedLensTopicId,
    currentLensTopics,
    topicFilteredKnowledgeConnections,
    activeConnections,
    visibleConnections,
    selection,
    selectedRecognitionLens,
    claimById,
    spotById,
    visibleKnowledgeMapConnections,
    dispatchSelection,
    setSelectedLensTopicId,
    setSpotInspectorOpen,
  });

  // 6. Connection & Era Focus
  const pinnedExploration =
    selection.pinnedConnection?.kind === "exploration"
      ? selection.pinnedConnection
      : undefined;

  const selectedConnection = pinnedExploration
    ? visibleConnections.find((connection) => connection.id === pinnedExploration.id)
    : undefined;

  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === pinnedExploration?.eraId,
  );
  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
  const connectionColor = facetColor(primaryFacet?.id);
  const eraSpotIds = selectedEra?.spotIds ?? selectedConnection?.spotIds ?? [];

  // 7. Topic Spatial Map Scope
  const topicScope = useMemo<TopicMapScope | null>(() => {
    if (isOverview || !effectiveTopicId) return null;

    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);
    const relatedSpotIds = new Set<string>(currentTopic?.spotIds ?? []);

    for (const connection of topicFilteredKnowledgeConnections) {
      for (const place of connection.places) {
        const matchedSpot = displaySpots.find((spot) => placeMatchesSpot(place, spot));
        if (matchedSpot) relatedSpotIds.add(matchedSpot.id);
      }
    }

    for (const connection of activeConnections) {
      if (connection.connectionKind !== "itinerary") {
        for (const spotId of connection.spotIds) {
          relatedSpotIds.add(spotId);
        }
      }
    }

    const relatedSuggestionIds = new Set<string>(
      topicScopedSuggestions.map((s) => s.id),
    );

    return {
      spotIds: relatedSpotIds,
      suggestionIds: relatedSuggestionIds,
    };
  }, [
    isOverview,
    effectiveTopicId,
    currentLensTopics,
    topicFilteredKnowledgeConnections,
    activeConnections,
    displaySpots,
    topicScopedSuggestions,
  ]);

  const highlightedSpotIds = eraSpotIds;

  const viewportKnowledgeConnectionIds = useMemo(
    () =>
      isOverview
        ? []
        : [...new Set(topicFilteredKnowledgeConnections.map((connection) => connection.id))],
    [isOverview, topicFilteredKnowledgeConnections],
  );

  // 8. 2D Map Scene Projection
  const mapScene = useMemo(
    () =>
      projectMapScene({
        reviewConnections: activeConnections,
        knowledgeConnections: topicFilteredKnowledgeConnections,
        selectedSuggestion: activeSuggestion,
        spots: displaySpots,
        selection,
        viewportKnowledgeConnectionIds,
      }),
    [
      activeConnections,
      topicFilteredKnowledgeConnections,
      activeSuggestion,
      displaySpots,
      selection,
      viewportKnowledgeConnectionIds,
    ],
  );

  useEffect(() => {
    if (
      selection.pinnedConnection &&
      !mapScene.connections.some((connection) => connection.selected)
    ) {
      dispatchSelection({ type: "clear-pinned-connection" });
    }
  }, [mapScene.connections, selection.pinnedConnection]);

  const selectedClaimIds = useMemo(
    () => new Set(selectedEra?.claimIds ?? selectedConnection?.claimIds ?? []),
    [selectedEra?.claimIds, selectedConnection?.claimIds],
  );

  const selectedClaims = useMemo(
    () =>
      [...selectedClaimIds]
        .map((id) => claimById.get(id))
        .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim)),
    [selectedClaimIds, claimById],
  );

  const connectedSpots = useMemo(
    () =>
      eraSpotIds
        .map((id) => spotById.get(id))
        .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot)),
    [eraSpotIds, spotById],
  );

  const lensContinuations = useMemo(
    () =>
      systemLensActive
        ? resolveLensContinuations({
            suggestions: topicScopedSuggestions,
            connections: suggestionConnectionCatalog,
            facetIds: selectedLensDefinition?.facetIds ?? [],
          })
        : [],
    [systemLensActive, topicScopedSuggestions, suggestionConnectionCatalog, selectedLensDefinition?.facetIds],
  );

  // 9. Actions
  const selectJourney = (journeyId: string) => {
    const journey = atlas.journeys?.find((candidate) => candidate.id === journeyId);
    setSelectedJourneyId(journey?.id ?? "all");
    setSelectedRecognitionLens("overview");
    setSpotInspectorOpen(false);
    if (journey) {
      dispatchSelection({
        type: "reset",
        spotId: "",
        focus: { kind: "none" },
      });
    } else {
      dispatchSelection({ type: "reset", spotId: "" });
    }
  };

  const selectSpot = (spotId: string, options?: { panCamera?: boolean }) => {
    if (selectedSpot?.id === spotId) setSpotInspectorOpen(false);
    else if (systemLensActive) setSpotInspectorOpen(true);
    dispatchSelection({ type: "select-spot", spotId, panCamera: options?.panCamera });
  };

  const selectConnection = (connection: ReviewAtlasConnection) => {
    dispatchSelection({
      type: "select-exploration-connection",
      id: connection.id,
      eraId: connection.eras[0]?.id ?? "",
      spotId: connection.spotIds.includes(selectedSpot?.id ?? "")
        ? selectedSpot?.id
        : connection.spotIds[0],
    });
  };

  const selectSuggestionConnection = (connection: ReviewAtlasConnection) => {
    if (visibleConnections.some(({ id }) => id === connection.id)) {
      selectConnection(connection);
      return;
    }
    dispatchSelection({ type: "select-knowledge-connection", id: connection.id });
  };

  return {
    atlas,
    selectedJourneyId,
    selectedJourney,
    includeRejectedConnections,
    setIncludeRejectedConnections,
    selectLensById,
    connectionStatuses,
    updateConnectionStatus,
    positionStatuses,
    updatePositionStatus,
    scopedClaims,
    mapVisitSpotIds,
    journeySpotCount,
    scopedAtlas,
    visibleConnections,
    displaySpots,
    selection,
    dispatchSelection,
    selectedRecognitionLens,
    setSelectedRecognitionLens,
    selectedLensDefinition,
    selectedLensTopicId: effectiveTopicId,
    setSelectedLensTopicId,
    currentLensTopics,
    topicScope,
    lensLayout,
    setLensLayout,
    spotInspectorOpen,
    setSpotInspectorOpen,
    suggestionStatuses,
    updateSuggestionStatus,
    suggestionsVisible,
    setSuggestionsVisible,
    selectedSpot,
    selectedSpotClaims,
    selectedSpotKnowledge,
    spotConnections,
    selectedConnection,
    selectedEra,
    connectionColor,
    allSuggestions,
    visibleSuggestions,
    activeSuggestion,
    selectedSuggestion,
    selectedRouteNodeId,
    selectedSuggestionStatus,
    selectedSuggestionClaims,
    selectedSuggestionConnections,
    selectedSuggestionSpots,
    highlightedSpotIds,
    systemLensActive,
    mapScene,
    selectedClaims,
    connectedSpots,
    lensContinuations,
    availableRecognitionLenses,
    selectJourney,
    selectSuggestion,
    selectSpot,
    selectConnection,
    selectRecognitionLens,
    selectSuggestionConnection,
  };
}

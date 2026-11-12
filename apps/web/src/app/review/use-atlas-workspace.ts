"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { placeMatchesSpot } from "@/domain/map/registry";
import { projectMapScene } from "@/domain/map/scene";
import { reduceAtlasSelection } from "@/domain/map/selection";
import type { TopicMapScope } from "@/domain/map/markers";
import type {
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import { dominantFacet, facetColor } from "./atlas-lenses";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
  getSpotStratumMemberships,
  type SpotStratumMembership,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import {
  buildStratumPatternProjection,
  type StratumPatternProjection,
} from "@/domain/review/stratum-patterns";
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
  initialLensId?: string;
  initialMode?: "lens" | "stratum";
};

export function useAtlasWorkspace({
  dataset,
  initialLensId,
  initialMode,
}: UseAtlasWorkspaceOptions) {
  // 1. Dataset & Scoping (Claims, Atlas Spots, Connections)
  const {
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
  } = useAtlasDatasetScope({ dataset });

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
    () => atlas.connections.filter((connection) => connection.spotIds.includes(selectedSpot?.id ?? "")),
    [atlas.connections, selectedSpot?.id],
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

  // 3.1 Exploration Mode (STRATUM vs LENS) & Stratigraphy State
  const [explorationMode, setExplorationMode] = useState<"lens" | "stratum">(() => {
    if (initialMode) return initialMode;
    if (initialLensId && initialLensId !== "overview") return "lens";
    return "stratum";
  });
  const [selectedStratumIds, setSelectedStratumIds] = useState<string[]>(() =>
    CHRONOLOGICAL_STRATA.map((s) => s.id),
  );

  const stratumContext = useMemo<StratumResolutionContext>(() => {
    return {
      claimsById: buildClaimsByIdMap(dataset.claims),
      connections: scopedAtlas.connections,
    };
  }, [dataset.claims, scopedAtlas.connections]);

  const selectedStrata = useMemo(() => {
    const matched = CHRONOLOGICAL_STRATA.filter((s) => selectedStratumIds.includes(s.id));
    return matched.length > 0 ? matched : CHRONOLOGICAL_STRATA;
  }, [selectedStratumIds]);

  const spotStratumMemberships = useMemo<Map<string, SpotStratumMembership>>(() => {
    return getSpotStratumMemberships(scopedAtlas.spots, selectedStrata, stratumContext);
  }, [scopedAtlas.spots, selectedStrata, stratumContext]);

  // 重層パターンは構造全体の性質のため、地層フィルタに依存しない全層分の所属から事前実体化する
  const stratumPatternProjection = useMemo<StratumPatternProjection | undefined>(() => {
    if (explorationMode !== "stratum") return undefined;
    return buildStratumPatternProjection(
      scopedAtlas.spots,
      getSpotStratumMemberships(scopedAtlas.spots, CHRONOLOGICAL_STRATA, stratumContext),
    );
  }, [explorationMode, scopedAtlas.spots, stratumContext]);

  const stratumCountBySpotId = useMemo<ReadonlyMap<string, number> | undefined>(() => {
    if (explorationMode !== "stratum") return undefined;
    const map = new Map<string, number>();
    for (const [spotId, membership] of spotStratumMemberships) {
      if (membership.strataCount >= 1) {
        map.set(spotId, membership.strataCount);
      }
    }
    return map;
  }, [explorationMode, spotStratumMemberships]);

  const stratumMatchingSpotIds = useMemo(() => {
    if (selectedStrata.length !== 1) return [];
    return scopedAtlas.spots
      .filter((spot) => (spotStratumMemberships.get(spot.id)?.strataCount ?? 0) >= 1)
      .map((s) => s.id);
  }, [scopedAtlas.spots, spotStratumMemberships, selectedStrata.length]);

  const handleToggleStratum = (stratumId: string) => {
    setSelectedStratumIds((prev) => {
      const exists = prev.includes(stratumId);
      if (exists) {
        const next = prev.filter((id) => id !== stratumId);
        return next.length > 0 ? next : CHRONOLOGICAL_STRATA.map((s) => s.id);
      }
      return [...prev, stratumId];
    });
  };

  const handleSelectOnlyStratum = (stratumId: string) => {
    setSelectedStratumIds((prev) => {
      if (prev.length === 1 && prev[0] === stratumId) {
        return CHRONOLOGICAL_STRATA.map((s) => s.id);
      }
      return [stratumId];
    });
  };

  const handleSelectAllStrata = () => {
    setSelectedStratumIds(CHRONOLOGICAL_STRATA.map((s) => s.id));
  };

  const handleSelectMode = (mode: "lens" | "stratum") => {
    if (selection.spotId) {
      dispatchSelection({ type: "clear-focus", preserveCamera: true, resetSpot: false, clearPinned: true });
    } else {
      dispatchSelection({ type: "clear-focus", preserveCamera: false, resetSpot: true, clearPinned: true });
    }
    setExplorationMode(mode);
  };

  const selectRecognitionLensWithMode = (
    lens: (typeof recognitionLensDefinitions)[number],
    topicId?: string,
    nodeId?: string,
  ) => {
    setExplorationMode("lens");
    selectRecognitionLens(lens, topicId, nodeId);
  };

  const selectLensByIdWithMode = (lensId: string, topicId?: string, nodeId?: string) => {
    setExplorationMode("lens");
    selectLensById(lensId, topicId, nodeId);
  };

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
    isOverview,
    effectiveTopicId,
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
    if (explorationMode === "stratum" || isOverview || !effectiveTopicId) return null;

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
    explorationMode,
  ]);

  const activeKnowledgeConnectionId =
    selection.pinnedConnection?.kind === "knowledge"
      ? selection.pinnedConnection.id
      : selection.focus.kind === "knowledge-connection"
        ? selection.focus.id
        : "";

  const activeKnowledgeConnection = useMemo(() => {
    if (!activeKnowledgeConnectionId) return undefined;
    return (
      topicFilteredKnowledgeConnections.find((c) => c.id === activeKnowledgeConnectionId) ??
      visibleKnowledgeMapConnections.find((c) => c.id === activeKnowledgeConnectionId)
    );
  }, [activeKnowledgeConnectionId, topicFilteredKnowledgeConnections, visibleKnowledgeMapConnections]);

  const knowledgeConnectionSpotIds = useMemo(() => {
    if (!activeKnowledgeConnection) return [];
    const matchedIds: string[] = [];
    for (const place of activeKnowledgeConnection.places) {
      if (place.primarySpotId) {
        matchedIds.push(place.primarySpotId);
        continue;
      }
      const names = [place.label, ...(place.aliases ?? [])];
      const matched = displaySpots.find(
        (spot) =>
          spot.mapRole !== "candidate-place" &&
          names.some((name) => lensEntityNamesMatch(name, spot.name)),
      );
      if (matched) {
        matchedIds.push(matched.id);
      }
    }
    return matchedIds;
  }, [activeKnowledgeConnection, displaySpots]);

  const routeNodeSpotIds = useMemo(() => {
    if (selection.focus.kind !== "route-node") return [];
    const nodeId = selection.focus.id;
    const ids = new Set<string>();
    for (const conn of topicFilteredKnowledgeConnections) {
      for (const place of conn.places) {
        if (conn.pointFocusEntityIds[place.id] === nodeId) {
          if (place.primarySpotId) {
            ids.add(place.primarySpotId);
          } else {
            const names = [place.label, ...(place.aliases ?? [])];
            const matched = displaySpots.find(
              (spot) =>
                spot.mapRole !== "candidate-place" &&
                names.some((name) => lensEntityNamesMatch(name, spot.name)),
            );
            if (matched) ids.add(matched.id);
          }
        }
      }
    }
    return [...ids];
  }, [selection.focus, topicFilteredKnowledgeConnections, displaySpots]);

  const highlightedSpotIds = useMemo(() => {
    if (explorationMode === "stratum") {
      return stratumMatchingSpotIds;
    }
    if (knowledgeConnectionSpotIds.length > 0) {
      return knowledgeConnectionSpotIds;
    }
    if (selection.focus.kind === "suggestion" && selectedSuggestionSpots.length > 0) {
      return selectedSuggestionSpots.map((s) => s.id);
    }
    if (routeNodeSpotIds.length > 0) {
      return routeNodeSpotIds;
    }
    return eraSpotIds;
  }, [
    explorationMode,
    stratumMatchingSpotIds,
    knowledgeConnectionSpotIds,
    selection.focus.kind,
    selectedSuggestionSpots,
    routeNodeSpotIds,
    eraSpotIds,
  ]);

  // 7.1 Scope Clusters (Scale & Camera Zoom Alignment: Issue 1-A)
  const currentTopic = useMemo(
    () => currentLensTopics.find((t) => t.id === effectiveTopicId),
    [currentLensTopics, effectiveTopicId],
  );

  const availableScopeClusters = useMemo(
    () => currentTopic?.scopeClusters ?? [],
    [currentTopic],
  );

  const [selectedScopeClusterId, setSelectedScopeClusterId] = useState<string | null>(null);

  const handleSelectScopeCluster = useCallback((scopeClusterId: string) => {
    setSelectedScopeClusterId(scopeClusterId);
    dispatchSelection({
      type: "clear-focus",
      preserveCamera: false,
    });
  }, [dispatchSelection]);

  const effectiveScopeClusterId = useMemo(() => {
    if (availableScopeClusters.length === 0) return null;
    if (selectedScopeClusterId && availableScopeClusters.some((c) => c.id === selectedScopeClusterId)) {
      return selectedScopeClusterId;
    }
    const defaultCluster = availableScopeClusters.find((c) => c.default) ?? availableScopeClusters[0];
    return defaultCluster?.id ?? null;
  }, [availableScopeClusters, selectedScopeClusterId]);

  const activeScopeCluster = useMemo(
    () => availableScopeClusters.find((c) => c.id === effectiveScopeClusterId),
    [availableScopeClusters, effectiveScopeClusterId],
  );

  const viewportKnowledgeConnectionIds = useMemo(() => {
    if (isOverview) return [];
    const allTopicConnectionIds = topicFilteredKnowledgeConnections.map((connection) => connection.id);
    if (!activeScopeCluster) {
      return [...new Set(allTopicConnectionIds)];
    }
    const allowed = new Set(activeScopeCluster.connectionIds);
    const filtered = allTopicConnectionIds.filter((id) => allowed.has(id));
    return [...new Set(filtered.length > 0 ? filtered : allTopicConnectionIds)];
  }, [isOverview, topicFilteredKnowledgeConnections, activeScopeCluster]);

  const activeTopicNodes = useMemo(() => {
    if (!effectiveTopicId || isOverview) return [];
    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);
    if (!currentTopic) return [];
    const projection = projectLensPreset(currentTopic.pack, currentTopic.presetId);
    const packEntityMap = new Map(currentTopic.pack.entities.map((e) => [e.id, e]));
    return projection.nodes.map((node) => {
      const entity = packEntityMap.get(node.id);
      return {
        id: node.id,
        label: node.label,
        coordinates: node.coordinates ?? entity?.coordinates,
      };
    });
  }, [effectiveTopicId, isOverview, currentLensTopics]);

  const activeSpatialOverlay = useMemo(() => {
    if (!effectiveTopicId || isOverview) return undefined;
    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);
    if (!currentTopic) return undefined;
    const preset = currentTopic.pack.presets.find((p) => p.id === currentTopic.presetId);
    return preset?.spatialOverlay;
  }, [effectiveTopicId, isOverview, currentLensTopics]);

  // 8. 2D Map Scene Projection
  const mapScene = useMemo(() => {
    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);
    const rawScene = projectMapScene({
      reviewConnections: activeConnections,
      knowledgeConnections: topicFilteredKnowledgeConnections,
      selectedSuggestion: activeSuggestion,
      spots: displaySpots,
      selection,
      viewportKnowledgeConnectionIds,
      activeLensNodes: activeTopicNodes,
      activeTopicId: effectiveTopicId,
      activeScopeClusterId: effectiveScopeClusterId ?? undefined,
      topicSpotIds: currentTopic?.spotIds,
    });
    if (explorationMode === "stratum") {
      return {
        ...rawScene,
        connections: [],
      };
    }
    return rawScene;
  }, [
    explorationMode,
    activeConnections,
    topicFilteredKnowledgeConnections,
    activeSuggestion,
    displaySpots,
    selection,
    viewportKnowledgeConnectionIds,
    activeTopicNodes,
    effectiveTopicId,
    effectiveScopeClusterId,
    currentLensTopics,
  ]);

  const modeScopedVisibleSuggestions = useMemo(() => {
    if (explorationMode === "stratum") {
      return [];
    }
    return visibleSuggestions;
  }, [explorationMode, visibleSuggestions]);

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
  const selectSpot = (
    spotId: string,
    options?: { panCamera?: boolean; preventToggle?: boolean },
  ) => {
    if (!options?.preventToggle && selectedSpot?.id === spotId) {
      setSpotInspectorOpen(false);
    } else {
      setSpotInspectorOpen(true);
    }
    dispatchSelection({
      type: "select-spot",
      spotId,
      panCamera: options?.panCamera,
      preventToggle: options?.preventToggle,
    });
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
    includeRejectedConnections,
    setIncludeRejectedConnections,
    selectLensById,
    connectionStatuses,
    updateConnectionStatus,
    positionStatuses,
    updatePositionStatus,
    scopedClaims,
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
    allSuggestions: explorationMode === "stratum" ? [] : allSuggestions,
    visibleSuggestions: modeScopedVisibleSuggestions,
    activeSuggestion: explorationMode === "stratum" ? undefined : activeSuggestion,
    selectedSuggestion: explorationMode === "stratum" ? undefined : selectedSuggestion,
    suggestionCount: explorationMode === "stratum" ? 0 : scopedAtlas.suggestions.length,
    companionActive: systemLensActive || explorationMode === "stratum",
    selectedRouteNodeId,
    selectedSuggestionStatus,
    selectedSuggestionClaims,
    selectedSuggestionConnections,
    selectedSuggestionSpots,
    highlightedSpotIds,
    systemLensActive,
    activeSpatialOverlay,
    mapScene,
    selectedClaims,
    connectedSpots,
    lensContinuations,
    availableRecognitionLenses,
    selectSuggestion,
    selectSpot,
    selectConnection,
    selectRecognitionLens: selectRecognitionLensWithMode,
    selectSuggestionConnection,
    explorationMode,
    setExplorationMode,
    handleSelectMode,
    selectedStratumIds,
    selectedStrata,
    handleToggleStratum,
    handleSelectOnlyStratum,
    handleSelectAllStrata,
    spotStratumMemberships,
    stratumPatternProjection,
    stratumCountBySpotId,
    stratumContext,
    scopeClusters: availableScopeClusters,
    activeScopeClusterId: effectiveScopeClusterId,
    selectScopeCluster: handleSelectScopeCluster,
  };
}

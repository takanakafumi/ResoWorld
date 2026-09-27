"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import { currentSuggestions } from "@/domain/exploration/suggestion-policy";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import {
  knowledgeMapConnectionsForGroup,
  knowledgeMapConnectionsForLens,
  knowledgeSuggestionConnectionsForVisitedSpots,
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
} from "@/domain/map/registry";
import { projectMapScene } from "@/domain/map/scene";
import { reduceAtlasSelection } from "@/domain/map/selection";
import { isMapVisitSpot } from "@/domain/map/spot-presentation";
import { orderSpotsByJourney } from "@/domain/review/journeys";
import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import { dominantFacet, facetColor } from "./atlas-lenses";
import { useSuggestionStatuses } from "./exploration-suggestions";
import { useConnectionStatuses, usePositionStatuses } from "./use-atlas-statuses";

export type RecognitionLensDefinition = {
  id: "overview" | LensPerspectiveId;
  label: string;
  facetIds: readonly string[];
  companionPanel?: boolean;
  focusMapConnectionId?: string;
  mapConnectionGroupId?: string;
};

export const recognitionLensDefinitions: readonly RecognitionLensDefinition[] = [
  { id: "overview", label: "標準（全体俯瞰）", facetIds: [] },
  { id: "mythology", label: "神・系譜", facetIds: ["myth"], companionPanel: true },
  { id: "religion", label: "宗教", facetIds: ["belief", "ritual"], companionPanel: true },
  { id: "route", label: "ルート", facetIds: ["route", "exchange"], companionPanel: true, mapConnectionGroupId: "wajinden-routes" },
  { id: "politics", label: "政治・社会", facetIds: ["politics", "military", "society"], companionPanel: true },
  { id: "people", label: "人物", facetIds: ["people", "figure", "individual"], companionPanel: true },
];

function makeFallbackAtlas(dataset: ReviewDataset): ReviewAtlas {
  return {
    title: `${dataset.documents.length}件の記録・位置未確認`,
    spots: [],
    connections: [],
    suggestions: [],
  };
}

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

  const journeySpotCount = (spotIds: string[]) => spotIds.filter((id) => mapVisitSpotIds.has(id)).length;

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
        (includeRejectedConnections || connection.initialStatus !== "rejected")
      ),
    [connectionStatuses, includeRejectedConnections, scopedAtlas.connections],
  );

  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);

  const displaySpots = useMemo(
    () => scopedAtlas.spots
      .filter(isMapVisitSpot)
      .map((spot) => ({
        ...spot,
        positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
      })),
    [scopedAtlas.spots, positionStatuses],
  );

  const [selection, dispatchSelection] = useReducer(reduceAtlasSelection, {
    spotId: "",
    focus: { kind: "none" },
  });

  const [selectedRecognitionLens, setSelectedRecognitionLens] =
    useState<string>(() => recognitionLensDefinitions.some(({ id }) => id === initialLensId) ? initialLensId! : "overview");
  const [selectedLensTopicId, setSelectedLensTopicId] = useState("");
  const [lensLayout, setLensLayout] = useState<"balanced" | "focus">("focus");
  const [spotInspectorOpen, setSpotInspectorOpen] = useState(false);
  const { statuses: suggestionStatuses, updateStatus: updateSuggestionStatus } =
    useSuggestionStatuses(dataset.datasetId);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  const claimById = useMemo(
    () => new Map(scopedClaims.map((claim) => [claim.id, claim])),
    [scopedClaims],
  );
  const spotById = useMemo(
    () => new Map(displaySpots.map((spot) => [spot.id, spot])),
    [displaySpots],
  );

  const selectedSpot = spotById.get(selection.spotId);
  const selectedSpotClaims = (selectedSpot?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSpotKnowledge = useMemo(
    () => selectedSpot ? resolveSpotKnowledgeContexts(selectedSpot, selectedSpotClaims) : [],
    [selectedSpot, selectedSpotClaims],
  );

  const spotConnections = visibleConnections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );

  const pinnedExploration = selection.pinnedConnection?.kind === "exploration"
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

  const frontierSuggestions = useMemo(
    () => knowledgeVisitFrontierSuggestionsForVisitedSpots(displaySpots, { includeUnanchored: true }),
    [displaySpots],
  );

  const allSuggestions = useMemo(() => {
    const existingTargetPlaceIds = new Set(
      scopedAtlas.suggestions.map((s) => s.targetPlaceId).filter(Boolean),
    );
    const existingIds = new Set(scopedAtlas.suggestions.map((s) => s.id));
    const newFrontiers = frontierSuggestions.filter(
      (f) => !existingIds.has(f.id) && (!f.targetPlaceId || !existingTargetPlaceIds.has(f.targetPlaceId)),
    );
    return [...scopedAtlas.suggestions, ...newFrontiers];
  }, [scopedAtlas.suggestions, frontierSuggestions]);

  const focusedSuggestionId = selection.focus.kind === "suggestion"
    ? selection.focus.id
    : "";
  const selectedSuggestion = focusedSuggestionId
    ? allSuggestions.find((suggestion) => suggestion.id === focusedSuggestionId)
    : undefined;
  const selectedRouteNodeId = selection.focus.kind === "route-node"
    ? selection.focus.id
    : "route-overview";
  const selectedSuggestionStatus = selectedSuggestion
    ? suggestionStatuses[selectedSuggestion.id] ?? selectedSuggestion.initialStatus
    : "suggested";
  const selectedSuggestionClaims = (selectedSuggestion?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const suggestionKnowledgeConnections = knowledgeSuggestionConnectionsForVisitedSpots(displaySpots);
  const suggestionConnectionCatalog = [...visibleConnections, ...suggestionKnowledgeConnections];
  const selectedSuggestionConnections = suggestionConnectionCatalog.filter((connection) =>
    selectedSuggestion?.connectionIds.includes(connection.id),
  );
  const selectedSuggestionSpots = (selectedSuggestion?.anchorSpotIds ?? [])
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));

  const selectedLensDefinition = recognitionLensDefinitions.find(
    (lens) => lens.id === selectedRecognitionLens,
  );
  const isOverview = selectedRecognitionLens === "overview";

  const currentLensTopics = useMemo(() => {
    if (isOverview) return [];
    return resolveLensTopics({
      perspectiveId: selectedRecognitionLens as LensPerspectiveId,
      claims: scopedClaims,
      spots: displaySpots,
      includeUnvisited: true,
    });
  }, [isOverview, selectedRecognitionLens, scopedClaims, displaySpots]);

  const effectiveTopicId = useMemo(() => {
    if (isOverview) return "";
    if (selectedLensTopicId && currentLensTopics.some((t) => t.id === selectedLensTopicId)) {
      return selectedLensTopicId;
    }
    return currentLensTopics[0]?.id ?? "";
  }, [isOverview, selectedLensTopicId, currentLensTopics]);

  const activeConnections = isOverview
    ? visibleConnections.filter((connection) => connection.connectionKind === "itinerary")
    : visibleConnections.filter((connection) => {
        const lensMatch = connection.lensId
          ? connection.lensId === selectedRecognitionLens
          : connection.facets?.some((facet) => facet.id === selectedRecognitionLens);
        if (!lensMatch) return false;
        if (effectiveTopicId && connection.topicId) {
          return connection.topicId === effectiveTopicId;
        }
        return true;
      });

  const selectedLensMapConnections = isOverview
    ? []
    : knowledgeMapConnectionsForGroup(selectedLensDefinition?.mapConnectionGroupId);
  const baseLensMapConnections = isOverview
    ? []
    : knowledgeMapConnectionsForLens(selectedRecognitionLens, displaySpots);
  const visibleKnowledgeMapConnections = isOverview
    ? []
    : [...new Map(
        [...baseLensMapConnections, ...selectedLensMapConnections]
          .map((connection) => [connection.id, connection]),
      ).values()];

  const topicFilteredKnowledgeConnections = useMemo(() => {
    if (isOverview || !effectiveTopicId) return [];
    return visibleKnowledgeMapConnections.filter((connection) =>
      connection.lensRefs?.some(
        (ref) => ref.topicId === effectiveTopicId || ref.presetId === effectiveTopicId,
      ),
    );
  }, [isOverview, effectiveTopicId, visibleKnowledgeMapConnections]);

  const visibleSuggestions = useMemo(() => {
    if (isOverview) {
      return allSuggestions;
    }
    return allSuggestions.filter((s) => {
      if (effectiveTopicId) {
        if (s.topicId === effectiveTopicId) return true;
        if (s.connectionIds.some((cid) => topicFilteredKnowledgeConnections.some((c) => c.id === cid))) return true;
        return false;
      }
      return s.lensId === selectedRecognitionLens;
    });
  }, [isOverview, allSuggestions, effectiveTopicId, topicFilteredKnowledgeConnections, selectedRecognitionLens]);

  const activeSuggestion = suggestionsVisible ? selectedSuggestion : undefined;
  const highlightedSpotIds = activeSuggestion?.anchorSpotIds ?? eraSpotIds;

  const viewportKnowledgeConnectionIds = isOverview
    ? []
    : [...new Set(topicFilteredKnowledgeConnections.map((connection) => connection.id))];

  const mapScene = projectMapScene({
    reviewConnections: activeConnections,
    knowledgeConnections: topicFilteredKnowledgeConnections,
    selectedSuggestion: activeSuggestion,
    spots: displaySpots,
    selection,
    viewportKnowledgeConnectionIds,
  });

  useEffect(() => {
    if (selection.pinnedConnection && !mapScene.connections.some((connection) => connection.selected)) {
      dispatchSelection({ type: "clear-pinned-connection" });
    }
  }, [mapScene.connections, selection.pinnedConnection]);

  const selectedClaimIds = new Set(
    selectedEra?.claimIds ?? selectedConnection?.claimIds ?? [],
  );
  const selectedClaims = [...selectedClaimIds]
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));

  const connectedSpots = eraSpotIds
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));

  const systemLensActive = selectedLensDefinition?.companionPanel ?? false;
  const lensContinuations = systemLensActive
    ? resolveLensContinuations({
        suggestions: visibleSuggestions,
        connections: suggestionConnectionCatalog,
        facetIds: selectedLensDefinition?.facetIds ?? [],
      })
    : [];

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

  const selectSuggestion = (suggestionId: string) => {
    setSpotInspectorOpen(false);
    dispatchSelection({ type: "select-suggestion", id: suggestionId });
  };

  const selectSpot = (spotId: string) => {
    if (selectedSpot?.id === spotId) setSpotInspectorOpen(false);
    else if (systemLensActive) setSpotInspectorOpen(true);
    dispatchSelection({ type: "select-spot", spotId });
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

  const availableRecognitionLenses = recognitionLensDefinitions.filter((lens) =>
    lens.id === "overview"
      ? true
      : resolveLensTopics({ perspectiveId: lens.id, claims: scopedClaims, spots: scopedAtlas.spots, includeUnvisited: true }).length > 0,
  );

  const selectRecognitionLens = (
    lens: (typeof recognitionLensDefinitions)[number],
    topicId?: string,
  ) => {
    setSpotInspectorOpen(false);
    dispatchSelection({ type: "clear-focus" });
    if (lens.id === "overview") {
      setSelectedRecognitionLens("overview");
      setSelectedLensTopicId("");
      return;
    }
    const topicsForLens = resolveLensTopics({
      perspectiveId: lens.id,
      claims: scopedClaims,
      spots: displaySpots,
      includeUnvisited: true,
    });
    setSelectedRecognitionLens(lens.id);
    setSelectedLensTopicId(topicId || topicsForLens[0]?.id || "");
    if (lens.focusMapConnectionId) {
      dispatchSelection({ type: "select-knowledge-connection", id: lens.focusMapConnectionId });
    }
  };

  const selectLensById = (lensId: string, topicId?: string) => {
    const lens = recognitionLensDefinitions.find((l) => l.id === lensId);
    if (lens) {
      selectRecognitionLens(lens, topicId);
    }
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

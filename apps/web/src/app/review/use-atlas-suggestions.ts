"use client";

import { useMemo, useState } from "react";
import type { Dispatch } from "react";

import { normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { KnowledgeMapConnectionItem } from "./use-atlas-knowledge-connections";
import {
  knowledgeSuggestionConnectionsForVisitedSpots,
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
} from "@/domain/map/registry";
import type { AtlasSelection, AtlasSelectionEvent } from "@/domain/map/selection";
import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
  ReviewJourney,
} from "@/domain/review/types";

import { useSuggestionStatuses } from "./exploration-suggestions";

export type UseAtlasSuggestionsOptions = {
  datasetId: string;
  displaySpots: ReviewAtlasSpot[];
  scopedAtlas: ReviewAtlas;
  selectedJourney?: ReviewJourney;
  isOverview: boolean;
  effectiveTopicId: string;
  currentLensTopics: ResolvedLensTopic[];
  topicFilteredKnowledgeConnections: KnowledgeMapConnectionItem[];
  activeConnections: ReviewAtlasConnection[];
  visibleConnections: ReviewAtlasConnection[];
  selection: AtlasSelection;
  selectedRecognitionLens: string;
  claimById: Map<string, ReviewDataset["claims"][number]>;
  spotById: Map<string, ReviewAtlasSpot>;
  visibleKnowledgeMapConnections: KnowledgeMapConnectionItem[];
  dispatchSelection: Dispatch<AtlasSelectionEvent>;
  setSpotInspectorOpen: (open: boolean) => void;
};

export function useAtlasSuggestions({
  datasetId,
  displaySpots,
  scopedAtlas,
  selectedJourney,
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
}: UseAtlasSuggestionsOptions) {
  const { statuses: suggestionStatuses, updateStatus: updateSuggestionStatus } =
    useSuggestionStatuses(datasetId);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  const frontierSuggestions = useMemo(
    () =>
      knowledgeVisitFrontierSuggestionsForVisitedSpots(displaySpots, {
        includeUnanchored: !selectedJourney,
      }),
    [displaySpots, selectedJourney],
  );

  const allSuggestions = useMemo(() => {
    const existingTargetPlaceIds = new Set(
      scopedAtlas.suggestions.map((s) => s.targetPlaceId).filter(Boolean),
    );
    const existingIds = new Set(scopedAtlas.suggestions.map((s) => s.id));
    const newFrontiers = frontierSuggestions.filter(
      (f) =>
        !existingIds.has(f.id) &&
        (!f.targetPlaceId || !existingTargetPlaceIds.has(f.targetPlaceId)),
    );
    return [...scopedAtlas.suggestions, ...newFrontiers];
  }, [scopedAtlas.suggestions, frontierSuggestions]);

  const topicScopedSuggestions = useMemo(() => {
    if (isOverview) return allSuggestions;
    if (!effectiveTopicId) return [];

    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);

    return allSuggestions.filter((s) => {
      // 1. Direct topic match
      if (
        s.topicId === effectiveTopicId ||
        (currentTopic && s.topicId === currentTopic.presetId)
      ) {
        return true;
      }

      // 2. Cross-Topic Portal structural match (does this suggestion's entity belong to the current topic's graph?)
      const portals = resolveCrossTopicPortals({
        id: s.targetPlaceId || s.id,
        name: s.targetName,
      });
      if (
        portals.some(
          (p) =>
            p.topicId === effectiveTopicId ||
            (currentTopic && p.topicId === currentTopic.presetId),
        )
      ) {
        return true;
      }

      // 3. Connection match
      if (s.connectionIds && s.connectionIds.length > 0) {
        const matchesKnowledge = topicFilteredKnowledgeConnections.some((c) =>
          s.connectionIds.some((cid) => c.id.includes(cid) || c.id === cid),
        );
        if (matchesKnowledge) return true;

        const matchesReview = activeConnections.some((c) =>
          s.connectionIds.includes(c.id),
        );
        if (matchesReview) return true;
      }
      return false;
    });
  }, [
    isOverview,
    allSuggestions,
    effectiveTopicId,
    currentLensTopics,
    topicFilteredKnowledgeConnections,
    activeConnections,
  ]);

  const visibleSuggestions = isOverview ? allSuggestions : topicScopedSuggestions;

  const focusedSuggestionId =
    selection.focus.kind === "suggestion" ? selection.focus.id : "";

  const suggestionKnowledgeConnections = useMemo(
    () => knowledgeSuggestionConnectionsForVisitedSpots(displaySpots),
    [displaySpots],
  );
  const suggestionConnectionCatalog = useMemo(
    () => [...visibleConnections, ...suggestionKnowledgeConnections],
    [visibleConnections, suggestionKnowledgeConnections],
  );

  const selectedSuggestion = useMemo<ReviewExplorationSuggestion | undefined>(() => {
    if (!focusedSuggestionId) return undefined;
    const found = allSuggestions.find((suggestion) => suggestion.id === focusedSuggestionId);
    if (found) return found;

    const matchesEntity = (suggestion: ReviewExplorationSuggestion) =>
      focusedSuggestionId.startsWith(normalizeLensEntityName(suggestion.targetName)) ||
      suggestion.targetPlaceId === focusedSuggestionId ||
      suggestion.targetName === focusedSuggestionId;

    const foundInTopic = topicScopedSuggestions.find(matchesEntity);
    if (foundInTopic) return foundInTopic;

    const foundByName = allSuggestions.find(matchesEntity);
    if (foundByName) return foundByName;

    const candidateConnectionSources = [
      ...visibleKnowledgeMapConnections,
      ...activeConnections,
      ...suggestionConnectionCatalog,
    ];

    for (const conn of candidateConnectionSources) {
      const places =
        "places" in conn && Array.isArray((conn as any).places) ? (conn as any).places : [];
      const place = places.find(
        (p: any) =>
          p.id === focusedSuggestionId ||
          p.label === focusedSuggestionId ||
          (p.coordinates &&
            `${normalizeLensEntityName(p.label)}:${p.coordinates.latitude.toFixed(5)}:${p.coordinates.longitude.toFixed(5)}` ===
              focusedSuggestionId),
      );
      if (place && place.coordinates) {
        const enrichedQuestion = (conn as any).explorationQuestions?.[place.id];
        const anchorSpots = displaySpots.filter((s) =>
          places.some(
            (cp: any) =>
              cp.id !== place.id &&
              (cp.label === s.name || (cp.aliases && cp.aliases.includes(s.name))),
          ),
        );
        return {
          id: focusedSuggestionId,
          title: conn.title,
          targetName: place.label,
          targetPlaceId: place.id,
          targetKind: "knowledge_unvisited" as const,
          actionType: "field_visit" as const,
          latitude: place.coordinates.latitude,
          longitude: place.coordinates.longitude,
          question:
            enrichedQuestion?.question ??
            `${place.label}を実際に訪れることで、${conn.title}のどのような痕跡や空間的特徴が確認できるか？`,
          missingInformation: "現地での空間配置・地形の観察、および周辺の関連史跡・遺構の確認",
          reason:
            enrichedQuestion?.reason ??
            place.description ??
            (conn as any).summary ??
            (conn as any).description,
          expectedObservation: "文献上の記述と実際の地形・位置関係の整合性",
          uncertainty: "文献と現地の比定に関する異説や時代差",
          claimIds: [...new Set(anchorSpots.flatMap((s) => s.claimIds))],
          anchorSpotIds: anchorSpots.map((s) => s.id),
          connectionIds: [conn.id],
          lensId:
            (conn as any).lensRefs?.[0]?.lensId ??
            (conn as any).lensId ??
            selectedRecognitionLens,
          topicId:
            (conn as any).lensRefs?.[0]?.topicId ??
            (conn as any).presetId ??
            (conn as any).topicId ??
            effectiveTopicId,
          initialStatus: "suggested" as const,
        };
      }
    }
    return undefined;
  }, [
    focusedSuggestionId,
    allSuggestions,
    topicScopedSuggestions,
    visibleKnowledgeMapConnections,
    activeConnections,
    suggestionConnectionCatalog,
    displaySpots,
    selectedRecognitionLens,
    effectiveTopicId,
  ]);

  const selectedRouteNodeId = useMemo(() => {
    if (selection.focus.kind === "route-node") {
      return selection.focus.id;
    }
    if (selectedSuggestion) {
      return selectedSuggestion.targetPlaceId || selectedSuggestion.id;
    }
    return "route-overview";
  }, [selection.focus, selectedSuggestion]);

  const selectedSuggestionStatus = selectedSuggestion
    ? suggestionStatuses[selectedSuggestion.id] ?? selectedSuggestion.initialStatus
    : "suggested";

  const selectedSuggestionClaims = useMemo(
    () =>
      ((selectedSuggestion?.claimIds ?? []) as string[])
        .map((id: string) => claimById.get(id))
        .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim)),
    [selectedSuggestion?.claimIds, claimById],
  );

  const selectedSuggestionConnections = useMemo(
    () =>
      suggestionConnectionCatalog.filter((connection) =>
        selectedSuggestion?.connectionIds.includes(connection.id),
      ),
    [suggestionConnectionCatalog, selectedSuggestion?.connectionIds],
  );

  const selectedSuggestionSpots = useMemo(
    () =>
      ((selectedSuggestion?.anchorSpotIds ?? []) as string[])
        .map((id: string) => spotById.get(id))
        .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot)),
    [selectedSuggestion?.anchorSpotIds, spotById],
  );

  const activeSuggestion = suggestionsVisible ? selectedSuggestion : undefined;

  const selectSuggestion = (suggestionId: string, options?: { panCamera?: boolean }) => {
    setSpotInspectorOpen(false);
    dispatchSelection({
      type: "select-suggestion",
      id: suggestionId,
      panCamera: options?.panCamera,
    });
  };

  return {
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
  };
}

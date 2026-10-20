"use client";

import { useMemo, useState } from "react";
import type { Dispatch } from "react";

import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { resolveLensTopics, type ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { AtlasSelectionEvent } from "@/domain/map/selection";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

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

export type UseAtlasLensStateOptions = {
  initialLensId?: string;
  scopedClaims: ReviewDataset["claims"];
  displaySpots: ReviewAtlasSpot[];
  scopedAtlasSpots: ReviewAtlasSpot[];
  selectedSpotId?: string;
  dispatchSelection: Dispatch<AtlasSelectionEvent>;
  setSpotInspectorOpen: (open: boolean) => void;
};

export function useAtlasLensState({
  initialLensId,
  scopedClaims,
  displaySpots,
  scopedAtlasSpots,
  selectedSpotId,
  dispatchSelection,
  setSpotInspectorOpen,
}: UseAtlasLensStateOptions) {
  const [selectedRecognitionLens, setSelectedRecognitionLens] = useState<string>(() =>
    recognitionLensDefinitions.some(({ id }) => id === initialLensId) ? initialLensId! : "overview",
  );
  const [selectedLensTopicId, setSelectedLensTopicId] = useState("");
  const [lensLayout, setLensLayout] = useState<"balanced" | "focus">("focus");

  const selectedLensDefinition = recognitionLensDefinitions.find(
    (lens) => lens.id === selectedRecognitionLens,
  );
  const isOverview = selectedRecognitionLens === "overview";

  const currentLensTopics = useMemo<ResolvedLensTopic[]>(() => {
    if (isOverview) return [];
    return resolveLensTopics({
      perspectiveId: selectedRecognitionLens as LensPerspectiveId,
      claims: scopedClaims,
      spots: displaySpots,
      selectedSpotId,
      includeUnvisited: true,
    });
  }, [isOverview, selectedRecognitionLens, scopedClaims, displaySpots, selectedSpotId]);

  const effectiveTopicId = useMemo(() => {
    if (isOverview) return "";
    if (selectedLensTopicId && currentLensTopics.some((t) => t.id === selectedLensTopicId)) {
      return selectedLensTopicId;
    }
    return currentLensTopics[0]?.id ?? "";
  }, [isOverview, selectedLensTopicId, currentLensTopics]);

  const systemLensActive = selectedLensDefinition?.companionPanel ?? false;

  const availableRecognitionLenses = useMemo(() => {
    return recognitionLensDefinitions.filter((lens) =>
      lens.id === "overview"
        ? true
        : resolveLensTopics({
            perspectiveId: lens.id,
            claims: scopedClaims,
            spots: scopedAtlasSpots,
            includeUnvisited: true,
          }).length > 0,
    );
  }, [scopedClaims, scopedAtlasSpots]);

  const selectRecognitionLens = (
    lens: (typeof recognitionLensDefinitions)[number],
    topicId?: string,
    nodeId?: string,
  ) => {
    setSpotInspectorOpen(false);
    if (lens.id === "overview") {
      dispatchSelection({ type: "clear-focus" });
      setSelectedRecognitionLens("overview");
      setSelectedLensTopicId("");
      return;
    }
    const topicsForLens = resolveLensTopics({
      perspectiveId: lens.id,
      claims: scopedClaims,
      spots: displaySpots,
      selectedSpotId,
      includeUnvisited: true,
    });
    setSelectedRecognitionLens(lens.id);
    setSelectedLensTopicId(topicId || topicsForLens[0]?.id || "");
    if (nodeId) {
      dispatchSelection({ type: "select-route-node", id: nodeId });
    } else if (lens.focusMapConnectionId) {
      dispatchSelection({ type: "select-knowledge-connection", id: lens.focusMapConnectionId });
    }
  };

  const selectLensById = (lensId: string, topicId?: string, nodeId?: string) => {
    const lens = recognitionLensDefinitions.find((l) => l.id === lensId);
    if (lens) {
      selectRecognitionLens(lens, topicId, nodeId);
    }
  };

  return {
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
  };
}

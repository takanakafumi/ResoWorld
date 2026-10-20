"use client";

import { useMemo } from "react";

import {
  knowledgeMapConnectionsForGroup,
  knowledgeMapConnectionsForLens,
} from "@/domain/map/registry";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasConnection, ReviewAtlasSpot } from "@/domain/review/types";
import type { RecognitionLensDefinition } from "./use-atlas-lens-state";

export type KnowledgeMapConnectionItem = ReturnType<typeof knowledgeMapConnectionsForLens>[number];

export type UseAtlasKnowledgeConnectionsOptions = {
  isOverview: boolean;
  selectedRecognitionLens: string;
  selectedLensDefinition?: RecognitionLensDefinition;
  displaySpots: ReviewAtlasSpot[];
  visibleConnections: ReviewAtlasConnection[];
  effectiveTopicId: string;
  currentLensTopics: ResolvedLensTopic[];
};

export function useAtlasKnowledgeConnections({
  isOverview,
  selectedRecognitionLens,
  selectedLensDefinition,
  displaySpots,
  visibleConnections,
  effectiveTopicId,
  currentLensTopics,
}: UseAtlasKnowledgeConnectionsOptions) {
  const selectedLensMapConnections = useMemo(() => {
    if (isOverview) return [];
    return knowledgeMapConnectionsForGroup(selectedLensDefinition?.mapConnectionGroupId);
  }, [isOverview, selectedLensDefinition?.mapConnectionGroupId]);

  const baseLensMapConnections = useMemo(() => {
    if (isOverview) return [];
    return knowledgeMapConnectionsForLens(selectedRecognitionLens, displaySpots);
  }, [isOverview, selectedRecognitionLens, displaySpots]);

  const visibleKnowledgeMapConnections = useMemo(() => {
    if (isOverview) return [];
    return [
      ...new Map(
        [...baseLensMapConnections, ...selectedLensMapConnections].map((connection) => [
          connection.id,
          connection,
        ]),
      ).values(),
    ];
  }, [isOverview, baseLensMapConnections, selectedLensMapConnections]);

  const topicFilteredKnowledgeConnections = useMemo(() => {
    if (isOverview || !effectiveTopicId) return [];
    return visibleKnowledgeMapConnections.filter((connection) =>
      connection.lensRefs?.some(
        (ref) => ref.topicId === effectiveTopicId || ref.presetId === effectiveTopicId,
      ),
    );
  }, [isOverview, effectiveTopicId, visibleKnowledgeMapConnections]);

  const activeConnections = useMemo(() => {
    if (isOverview) {
      return visibleConnections.filter((connection) => connection.connectionKind === "itinerary");
    }
    const currentTopic = currentLensTopics.find((t) => t.id === effectiveTopicId);
    const topicSpotIds = new Set(currentTopic?.spotIds ?? []);

    return visibleConnections.filter((connection) => {
      const lensMatch = connection.lensId
        ? connection.lensId === selectedRecognitionLens
        : connection.facets?.some((facet) => facet.id === selectedRecognitionLens);
      if (!lensMatch) return false;

      if (effectiveTopicId) {
        if (connection.topicId) {
          return connection.topicId === effectiveTopicId;
        }
        if (topicSpotIds.size > 0) {
          return connection.spotIds.some((id) => topicSpotIds.has(id));
        }
        return false;
      }
      return true;
    });
  }, [isOverview, visibleConnections, selectedRecognitionLens, effectiveTopicId, currentLensTopics]);

  return {
    visibleKnowledgeMapConnections,
    topicFilteredKnowledgeConnections,
    activeConnections,
  };
}

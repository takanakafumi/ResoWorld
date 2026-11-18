"use client";

import { useMemo } from "react";

import {
  knowledgeMapConnectionsForGroup,
  knowledgeMapConnectionsForLens,
  registeredKnowledgeMapConnections,
} from "@/domain/map/registry";
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
};

export function useAtlasKnowledgeConnections({
  isOverview,
  selectedRecognitionLens,
  selectedLensDefinition,
  displaySpots,
  visibleConnections,
  effectiveTopicId,
}: UseAtlasKnowledgeConnectionsOptions) {
  const selectedLensMapConnections = useMemo(() => {
    if (isOverview) return [];
    return knowledgeMapConnectionsForGroup(selectedLensDefinition?.mapConnectionGroupId);
  }, [isOverview, selectedLensDefinition?.mapConnectionGroupId]);

  const baseLensMapConnections = useMemo(() => {
    if (isOverview) return [];
    return knowledgeMapConnectionsForLens(selectedRecognitionLens, displaySpots);
  }, [isOverview, selectedRecognitionLens, displaySpots]);

  const topicFilteredKnowledgeConnections = useMemo(() => {
    if (isOverview || !effectiveTopicId) return [];
    return registeredKnowledgeMapConnections.filter((connection) =>
      connection.lensRefs?.some(
        (ref) => ref.topicId === effectiveTopicId || ref.presetId === effectiveTopicId,
      ),
    );
  }, [isOverview, effectiveTopicId]);

  const visibleKnowledgeMapConnections = useMemo(() => {
    if (isOverview) return [];
    return [
      ...new Map(
        [...baseLensMapConnections, ...selectedLensMapConnections, ...topicFilteredKnowledgeConnections].map((connection) => [
          connection.id,
          connection,
        ]),
      ).values(),
    ];
  }, [isOverview, baseLensMapConnections, selectedLensMapConnections, topicFilteredKnowledgeConnections]);

  const activeConnections = useMemo(() => {
    if (isOverview) {
      return visibleConnections.filter((connection) => connection.connectionKind === "itinerary");
    }

    return visibleConnections.filter((connection) => {
      if (effectiveTopicId) {
        return (
          connection.lensId === selectedRecognitionLens &&
          connection.topicId === effectiveTopicId
        );
      }

      return connection.lensId
        ? connection.lensId === selectedRecognitionLens
        : Boolean(connection.facets?.some((facet) => facet.id === selectedRecognitionLens));
    });
  }, [isOverview, visibleConnections, selectedRecognitionLens, effectiveTopicId]);

  return {
    visibleKnowledgeMapConnections,
    topicFilteredKnowledgeConnections,
    activeConnections,
  };
}

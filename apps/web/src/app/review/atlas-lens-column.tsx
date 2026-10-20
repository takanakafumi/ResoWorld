"use client";

import type { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import type { ExplorationSuggestionStatus, ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import { ContextualPerspectiveLens } from "./contextual-perspective-lens";
import { LensContinuationQueue } from "./exploration-suggestions";
import styles from "./atlas.module.css";

export type AtlasLensColumnProps = {
  selectedLensId: string;
  selectedConnection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  displaySpots?: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedRouteNodeId: string;
  selectedTopicId: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  lensContinuations: ReturnType<typeof resolveLensContinuations>;
  suggestionStatuses: Record<string, ExplorationSuggestionStatus>;
  onSelectTopic: (topicId: string) => void;
  onSelectRouteNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
};

export function AtlasLensColumn({
  selectedLensId,
  selectedConnection,
  spots,
  claims,
  selectedSpotId,
  selectedRouteNodeId,
  selectedTopicId,
  selectedSuggestion,
  suggestions = [],
  lensContinuations,
  suggestionStatuses,
  onSelectTopic,
  onSelectRouteNode,
  onSelectSpot,
  onSelectSuggestion,
}: AtlasLensColumnProps) {
  return (
    <div className={styles.lensColumn}>
      {["mythology", "religion", "route", "politics", "people"].includes(selectedLensId) ? (
        <ContextualPerspectiveLens
          perspectiveId={selectedLensId as LensPerspectiveId}
          connection={selectedConnection}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedRouteNodeId}
          selectedTopicId={selectedTopicId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectTopic={onSelectTopic}
          onSelectNode={onSelectRouteNode}
          onSelectSpot={onSelectSpot}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : null}
      <LensContinuationQueue
        suggestions={lensContinuations}
        statuses={suggestionStatuses}
        onSelect={onSelectSuggestion}
      />
    </div>
  );
}

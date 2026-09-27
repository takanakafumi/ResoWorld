"use client";

import type { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import type { ExplorationSuggestionStatus, ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import { KnowledgeGenealogyLens } from "./knowledge-genealogy-lens";
import { RouteLens } from "./route-lens";
import { ReligionLens } from "./religion-lens";
import { PoliticsSocialLens } from "./politics-social-lens";
import { PeopleNetworkLens } from "./people-network-lens";
import { LensContinuationQueue } from "./exploration-suggestions";
import styles from "./atlas.module.css";

export type AtlasLensColumnProps = {
  selectedLensId: string;
  selectedConnection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  displaySpots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedRouteNodeId: string;
  selectedTopicId: string;
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
  displaySpots,
  claims,
  selectedSpotId,
  selectedRouteNodeId,
  selectedTopicId,
  lensContinuations,
  suggestionStatuses,
  onSelectTopic,
  onSelectRouteNode,
  onSelectSpot,
  onSelectSuggestion,
}: AtlasLensColumnProps) {
  return (
    <div className={styles.lensColumn}>
      {selectedLensId === "mythology" ? (
        <KnowledgeGenealogyLens
          connection={selectedConnection}
          spots={spots}
          claims={claims}
          selectedSpotId={selectedSpotId}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
          onSelectSpot={onSelectSpot}
        />
      ) : selectedLensId === "route" ? (
        <RouteLens
          connection={selectedConnection}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedRouteNodeId}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
          onSelectNode={onSelectRouteNode}
          onSelectSpot={onSelectSpot}
        />
      ) : selectedLensId === "religion" ? (
        <ReligionLens
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
          onSelectSpot={onSelectSpot}
        />
      ) : selectedLensId === "politics" ? (
        <PoliticsSocialLens
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
          onSelectSpot={onSelectSpot}
        />
      ) : selectedLensId === "people" ? (
        <PeopleNetworkLens
          claims={claims}
          spots={displaySpots}
          selectedSpotId={selectedSpotId}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
          onSelectSpot={onSelectSpot}
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

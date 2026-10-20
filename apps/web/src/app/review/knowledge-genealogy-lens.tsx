"use client";

import { useMemo, useState } from "react";

import { resolveLensTopics, selectLensTopic, type ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";
import { SequenceRouteLens } from "./sequence-route-lens";
import { FactionNetworkLens } from "./faction-network-lens";
import { GenealogyTreeLens } from "./genealogy-tree-lens";
import { ComparisonMatrixLens } from "./comparison-matrix-lens";
import { HubSpokeTopologyLens } from "./hub-spoke-topology-lens";

export function KnowledgeGenealogyLens({
  connection,
  spots,
  claims,
  selectedSpotId,
  selectedNodeId = "",
  selectedTopicId = "",
  selectedSuggestion,
  suggestions = [],
  onSelectTopic,
  onSelectNode,
  onSelectSpot,
  onSelectSuggestion,
}: {
  connection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedNodeId?: string;
  selectedTopicId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  onSelectTopic?: (topicId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
}) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "mythology", claims, spots, selectedSpotId, includeUnvisited: true }),
    [claims, spots, selectedSpotId],
  );

  const selectedTopic = selectLensTopic(topics, selectedTopicId);

  const handleSelectTopic = (topicId: string) => {
    onSelectTopic?.(topicId);
  };

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label="神と系譜レンズ">
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.panelIndex}>LENS</span>
            <h2>神・系譜</h2>
          </div>
        </div>
        <div className={styles.lensEmptyTopic}>
          <strong>この探索範囲に対応する神話・系譜はまだありません</strong>
          <p>神・人物・系譜のKnowledgeへ接続されると、ここに関係図が現れます。</p>
        </div>
      </aside>
    );
  }

  return (
    <div className={styles.contextualLens}>
      <LensTopicBar
        topics={topics}
        selectedTopicId={selectedTopic.id}
        onSelectTopic={handleSelectTopic}
        lensLabel="神・系譜"
      />
      {selectedTopic.archetype === "sequence" ? (
        <SequenceRouteLens
          lensLabel="神・系譜"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
          connection={connection}
        />
      ) : selectedTopic.archetype === "faction" ? (
        <FactionNetworkLens
          lensLabel="神・系譜"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "genealogy" ? (
        <GenealogyTreeLens
          lensLabel="神・系譜"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "matrix" ? (
        <ComparisonMatrixLens
          lensLabel="神・系譜"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "hub-spoke" ? (
        <HubSpokeTopologyLens
          key={selectedTopic.id}
          lensLabel="神・系譜"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : (
        <PackRelationshipLens
          lensLabel="神・系譜"
          topicId={selectedTopic.id}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      )}
    </div>
  );
}

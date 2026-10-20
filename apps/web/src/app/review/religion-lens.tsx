"use client";

import { useMemo } from "react";

import { resolveLensTopics, selectLensTopic, type ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";
import { SequenceRouteLens } from "./sequence-route-lens";
import { FactionNetworkLens } from "./faction-network-lens";
import { GenealogyTreeLens } from "./genealogy-tree-lens";
import { ComparisonMatrixLens } from "./comparison-matrix-lens";
import { HubSpokeTopologyLens } from "./hub-spoke-topology-lens";

export function ReligionLens({
  claims,
  spots,
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
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
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
    () => resolveLensTopics({ perspectiveId: "religion", claims, spots, selectedSpotId, includeUnvisited: true }),
    [claims, spots, selectedSpotId],
  );
  const selectedTopic = selectLensTopic(topics, selectedTopicId);
  const activeNodeId = selectedNodeId;

  const handleSelectTopic = (topicId: string, nodeId = "") => {
    onSelectTopic?.(topicId);
    if (nodeId) onSelectNode?.(nodeId);
  };

  const handleSelectNode = (nodeId: string) => {
    onSelectNode?.(nodeId);
  };

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label="宗教レンズ">
        <div className={styles.panelHeader}>
          <div><span className={styles.panelIndex}>LENS</span><h2>宗教</h2></div>
        </div>
        <div className={styles.lensEmptyTopic}>
          <strong>この探索範囲に対応する宗教的なつながりはまだありません</strong>
          <p>信仰・祭祀・習合・宗教概念のKnowledgeへ接続されると、ここに関係図が現れます。</p>
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
        lensLabel="宗教"
      />
      {selectedTopic.archetype === "sequence" ? (
        <SequenceRouteLens
          lensLabel="宗教"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "faction" ? (
        <FactionNetworkLens
          lensLabel="宗教"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "genealogy" ? (
        <GenealogyTreeLens
          lensLabel="宗教"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "matrix" ? (
        <ComparisonMatrixLens
          lensLabel="宗教"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "hub-spoke" ? (
        <HubSpokeTopologyLens
          key={selectedTopic.id}
          lensLabel="宗教"
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : (
        <PackRelationshipLens
          lensLabel="宗教"
          topicId={selectedTopic.id}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={activeNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";

import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { resolveLensTopics, selectLensTopic } from "@/domain/lenses/topic-resolver";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { ComparisonMatrixLens } from "./comparison-matrix-lens";
import { FactionNetworkLens } from "./faction-network-lens";
import { GenealogyTreeLens } from "./genealogy-tree-lens";
import { HubSpokeTopologyLens } from "./hub-spoke-topology-lens";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";
import { SequenceRouteLens } from "./sequence-route-lens";

export type ContextualPerspectiveLensProps = {
  perspectiveId: LensPerspectiveId;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId?: string;
  selectedTopicId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  connection?: ReviewAtlasConnection;
  onSelectTopic?: (topicId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
};

const perspectiveConfig: Record<
  LensPerspectiveId,
  {
    label: string;
    emptyStrong: string;
    emptyText: string;
  }
> = {
  mythology: {
    label: "神・系譜",
    emptyStrong: "この探索範囲に対応する神話・系譜はまだありません",
    emptyText: "神・人物・系譜のKnowledgeへ接続されると、ここに関係図が現れます。",
  },
  religion: {
    label: "宗教",
    emptyStrong: "この探索範囲に対応する宗教的なつながりはまだありません",
    emptyText: "信仰・祭祀・習合・宗教概念のKnowledgeへ接続されると、ここに関係図が現れます。",
  },
  route: {
    label: "ルート",
    emptyStrong: "この探索範囲に対応するルートはまだありません",
    emptyText: "交通路や比定のKnowledgeへ接続されると、ここに関係図が現れます。",
  },
  politics: {
    label: "政治・社会",
    emptyStrong: "この探索範囲に対応するテーマはまだありません",
    emptyText: "訪問やClaimは残したまま、接続できるKnowledge Packを追加するとここへ現れます。",
  },
  people: {
    label: "人物",
    emptyStrong: "この探索範囲に対応する人物網はまだありません",
    emptyText: "人物・組織・事件のKnowledgeへ接続されると、ここに関係図が現れます。",
  },
};

export function ContextualPerspectiveLens({
  perspectiveId,
  claims,
  spots,
  selectedSpotId,
  selectedNodeId = "",
  selectedTopicId = "",
  selectedSuggestion,
  suggestions = [],
  connection,
  onSelectTopic,
  onSelectNode,
  onSelectSpot,
  onSelectSuggestion,
}: ContextualPerspectiveLensProps) {
  const config = perspectiveConfig[perspectiveId] ?? {
    label: "構造",
    emptyStrong: "この探索範囲に対応する構造はまだありません",
    emptyText: "Knowledgeへ接続されると、ここに関係図が現れます。",
  };

  const topics = useMemo(
    () =>
      resolveLensTopics({
        perspectiveId,
        claims,
        spots,
        selectedSpotId,
        includeUnvisited: true,
      }),
    [perspectiveId, claims, spots, selectedSpotId],
  );

  const selectedTopic = selectLensTopic(topics, selectedTopicId);

  const handleSelectTopic = (topicId: string, nodeId = "") => {
    onSelectTopic?.(topicId);
    if (nodeId) onSelectNode?.(nodeId);
  };

  const handleSelectNode = (nodeId: string) => {
    onSelectNode?.(nodeId);
  };

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label={`${config.label}レンズ`}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.panelIndex}>LENS</span>
            <h2>{config.label}</h2>
          </div>
        </div>
        <div className={styles.lensEmptyTopic}>
          <strong>{config.emptyStrong}</strong>
          <p>{config.emptyText}</p>
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
        lensLabel={config.label}
      />
      {selectedTopic.archetype === "sequence" ? (
        <SequenceRouteLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
          connection={connection}
        />
      ) : selectedTopic.archetype === "faction" ? (
        <FactionNetworkLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "genealogy" ? (
        <GenealogyTreeLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "matrix" ? (
        <ComparisonMatrixLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.archetype === "hub-spoke" ? (
        <HubSpokeTopologyLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : (
        <PackRelationshipLens
          key={selectedTopic.id}
          lensLabel={config.label}
          topicId={selectedTopic.id}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
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

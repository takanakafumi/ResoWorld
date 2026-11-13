"use client";

import { memo, useCallback, useMemo } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { buildTopicHoverIndex } from "@/domain/lenses/topic-hover-index";
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
import { LensTopicSidebar } from "./lens-topic-sidebar";
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
  selectedKnowledgeConnectionId?: string;
  activeScopeClusterId?: string | null;
  onSelectScopeCluster?: (id: string) => void;
  onSelectTopic?: (topicId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
  onSelectRecognitionLens?: (lensId: string, topicId?: string, nodeId?: string) => void;
  onSelectKnowledgeConnection?: (connectionId: string) => void;
  hoveredSpotId?: string | null;
  hoveredSuggestionId?: string | null;
  onHoverSpotIds?: (spotIds: readonly string[]) => void;
  onHoverSuggestionIds?: (suggestionIds: readonly string[]) => void;
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

export const ContextualPerspectiveLens = memo(function ContextualPerspectiveLens({
  perspectiveId,
  claims,
  spots,
  selectedSpotId,
  selectedNodeId = "",
  selectedTopicId = "",
  selectedSuggestion,
  suggestions = [],
  connection,
  selectedKnowledgeConnectionId,
  activeScopeClusterId,
  onSelectScopeCluster,
  onSelectTopic,
  onSelectNode,
  onSelectSpot,
  onSelectSuggestion,
  onSelectRecognitionLens,
  onSelectKnowledgeConnection,
  hoveredSpotId,
  hoveredSuggestionId,
  onHoverSpotIds,
  onHoverSuggestionIds,
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

  const hoverIndex = useMemo(() => {
    if (!selectedTopic) return null;
    const projection = projectLensPreset(selectedTopic.pack, selectedTopic.presetId);
    const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);
    return buildTopicHoverIndex({
      pack: selectedTopic.pack,
      presetId: selectedTopic.presetId,
      spots,
      suggestions,
      explorationLinks: links,
    });
  }, [selectedTopic, claims, spots, suggestions]);

  const hoveredNodeIds = useMemo<ReadonlySet<string>>(() => {
    if (!hoverIndex) return new Set();
    const ids = new Set<string>();
    if (hoveredSpotId) {
      for (const nodeId of hoverIndex.spotToNodeIds.get(hoveredSpotId) ?? []) {
        ids.add(nodeId);
      }
    }
    if (hoveredSuggestionId) {
      for (const nodeId of hoverIndex.suggestionToNodeIds.get(hoveredSuggestionId) ?? []) {
        ids.add(nodeId);
      }
    }
    return ids;
  }, [hoverIndex, hoveredSpotId, hoveredSuggestionId]);

  const handleHoverNode = useCallback(
    (nodeId: string | null) => {
      if (!nodeId || !hoverIndex) {
        onHoverSpotIds?.([]);
        onHoverSuggestionIds?.([]);
        return;
      }
      onHoverSpotIds?.(hoverIndex.nodeToSpotIds.get(nodeId) ?? []);
      onHoverSuggestionIds?.(hoverIndex.nodeToSuggestionIds.get(nodeId) ?? []);
    },
    [hoverIndex, onHoverSpotIds, onHoverSuggestionIds],
  );

  const handleSelectTopic = (topicId: string, nodeId = "") => {
    onSelectTopic?.(topicId);
    if (nodeId) onSelectNode?.(nodeId);
  };

  const handleSelectNode = (nodeId: string) => {
    onSelectNode?.(nodeId);
  };

  const handleSelectPortal = (lensId: string, topicId: string, nodeId = "") => {
    if (onSelectRecognitionLens) {
      onSelectRecognitionLens(lensId, topicId, nodeId || undefined);
    } else {
      handleSelectTopic(topicId, nodeId);
    }
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
      <div className={styles.contextualLensSplitLayout}>
        <LensTopicSidebar
          topics={topics}
          selectedTopicId={selectedTopic.id}
          onSelectTopic={handleSelectTopic}
          lensLabel={config.label}
        />
        <div className={styles.contextualLensMainArea}>
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
          activeScopeClusterId={activeScopeClusterId}
          onSelectScopeCluster={onSelectScopeCluster}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
          onSelectPortal={handleSelectPortal}
          connection={connection}
          selectedKnowledgeConnectionId={selectedKnowledgeConnectionId}
          onSelectKnowledgeConnection={onSelectKnowledgeConnection}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
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
          activeScopeClusterId={activeScopeClusterId}
          onSelectScopeCluster={onSelectScopeCluster}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
          onSelectPortal={handleSelectPortal}
          connection={connection}
          selectedKnowledgeConnectionId={selectedKnowledgeConnectionId}
          onSelectKnowledgeConnection={onSelectKnowledgeConnection}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
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
          onSelectPortal={handleSelectPortal}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
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
          activeScopeClusterId={activeScopeClusterId}
          onSelectScopeCluster={onSelectScopeCluster}
          onSelectSpot={onSelectSpot}
          onSelectNode={handleSelectNode}
          onSelectSuggestion={onSelectSuggestion}
          onSelectPortal={handleSelectPortal}
          connection={connection}
          selectedKnowledgeConnectionId={selectedKnowledgeConnectionId}
          onSelectKnowledgeConnection={onSelectKnowledgeConnection}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
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
          onSelectPortal={handleSelectPortal}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
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
          onSelectPortal={handleSelectPortal}
          hoveredNodeIds={hoveredNodeIds}
          onHoverNode={handleHoverNode}
        />
      )}
        </div>
      </div>
    </div>
  );
});

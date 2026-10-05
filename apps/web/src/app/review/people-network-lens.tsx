"use client";

import { useEffect, useMemo, useState } from "react";

import { resolveLensTopics, selectLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { IshinFiguresLens } from "./ishin-figures-lens";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";

export function PeopleNetworkLens({
  claims,
  spots,
  selectedSpotId,
  selectedNodeId = "",
  selectedTopicId = "",
  selectedSuggestion,
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
  onSelectTopic?: (topicId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
}) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "people", claims, spots, selectedSpotId, includeUnvisited: true }),
    [claims, spots, selectedSpotId],
  );
  const [manualTopicId, setManualTopicId] = useState("");
  useEffect(() => {
    if (selectedTopicId) setManualTopicId(selectedTopicId);
  }, [selectedTopicId]);

  const handleSelectTopic = (topicId: string) => {
    setManualTopicId(topicId);
    onSelectTopic?.(topicId);
  };

  const selectedTopic = selectLensTopic(topics, manualTopicId || selectedTopicId);

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label="人物レンズ">
        <div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>人物</h2></div></div>
        <div className={styles.lensEmptyTopic}><strong>この探索範囲に対応する人物網はまだありません</strong><p>人物・組織・事件のKnowledgeへ接続されると、ここに関係図が現れます。</p></div>
      </aside>
    );
  }

  return (
    <div className={styles.contextualLens}>
      <LensTopicBar
        topics={topics}
        selectedTopicId={selectedTopic.id}
        onSelectTopic={handleSelectTopic}
        lensLabel="人物"
      />
      {selectedTopic.renderer === "ishin-network" ? (
        <IshinFiguresLens claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} />
      ) : (
        <PackRelationshipLens
          lensLabel="人物"
          topicId={selectedTopic.id}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      )}
    </div>
  );
}

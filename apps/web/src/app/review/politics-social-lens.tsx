"use client";

import { useEffect, useMemo, useState } from "react";

import { resolveLensTopics, selectLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { BakumatsuLens } from "./bakumatsu-lens";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";
import { WajindenPoliticsLens } from "./wajinden-politics-lens";

export function PoliticsSocialLens({
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
    () => resolveLensTopics({ perspectiveId: "politics", claims, spots, selectedSpotId, includeUnvisited: true }),
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
    return <aside className={styles.genealogyPanel} aria-label="政治・社会レンズ"><div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>政治・社会</h2></div></div><div className={styles.lensEmptyTopic}><strong>この探索範囲に対応するテーマはまだありません</strong><p>訪問やClaimは残したまま、接続できるKnowledge Packを追加するとここへ現れます。</p></div></aside>;
  }

  return (
    <div className={styles.contextualLens}>
      <LensTopicBar
        topics={topics}
        selectedTopicId={selectedTopic.id}
        onSelectTopic={handleSelectTopic}
        lensLabel="政治・社会"
      />
      {selectedTopic.renderer === "wajinden-politics" ? (
        <WajindenPoliticsLens
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : selectedTopic.renderer === "bakumatsu-structure" ? (
        <BakumatsuLens
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          selectedSuggestion={selectedSuggestion}
          onSelectSpot={onSelectSpot}
          onSelectNode={onSelectNode}
          onSelectSuggestion={onSelectSuggestion}
        />
      ) : (
        <PackRelationshipLens
          lensLabel="政治・社会"
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

"use client";

import { useEffect, useMemo, useState } from "react";

import { resolveLensTopics, selectLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { BakumatsuLens } from "./bakumatsu-lens";
import { PackRelationshipLens } from "./pack-relationship-lens";
import { WajindenPoliticsLens } from "./wajinden-politics-lens";

export function PoliticsSocialLens({
  claims,
  spots,
  selectedSpotId,
  selectedTopicId = "",
  onSelectTopic,
  onSelectSpot,
}: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedTopicId?: string;
  onSelectTopic?: (topicId: string) => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "politics", claims, spots, selectedSpotId }),
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

  return <div className={styles.contextualLens}>
    <nav className={styles.contextualLensTopics} aria-label="政治・社会で見るテーマ">
      <span>TOPIC</span>
      {topics.map((topic) => <button type="button" key={topic.id} data-active={topic.id === selectedTopic.id} onClick={() => handleSelectTopic(topic.id)}><strong>{topic.label}</strong><small>{topic.directlyConnectedToSelection ? "選択地点に接続" : `${topic.claimIds.length}件の探索と接続`}</small></button>)}
    </nav>
    {selectedTopic.renderer === "wajinden-politics" ? <WajindenPoliticsLens claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} /> : selectedTopic.renderer === "bakumatsu-structure" ? <BakumatsuLens claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} /> : <PackRelationshipLens topicId={selectedTopic.id} claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} />}
  </div>;
}

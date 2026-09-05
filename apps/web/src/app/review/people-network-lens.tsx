"use client";

import { useMemo } from "react";

import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { IshinFiguresLens } from "./ishin-figures-lens";

export function PeopleNetworkLens({ claims, spots, selectedSpotId, onSelectSpot }: { claims: ReviewDataset["claims"]; spots: ReviewAtlasSpot[]; selectedSpotId: string; onSelectSpot: (spotId: string) => void }) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "people", claims, spots, selectedSpotId }),
    [claims, spots, selectedSpotId],
  );
  const topic = topics[0];

  if (!topic) {
    return <aside className={styles.genealogyPanel} aria-label="人物レンズ"><div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>人物</h2></div></div><div className={styles.lensEmptyTopic}><strong>この探索範囲に対応する人物網はまだありません</strong><p>人物・組織・事件のKnowledgeへ接続されると、ここに関係図が現れます。</p></div></aside>;
  }

  return <div className={styles.contextualLens}>
    <nav className={styles.contextualLensTopics} aria-label="人物として見るテーマ">
      <span>TOPIC</span>
      <button type="button" data-active="true"><strong>{topic.label}</strong><small>{topic.directlyConnectedToSelection ? "選択地点に接続" : `${topic.claimIds.length}件の探索と接続`}</small></button>
    </nav>
    <IshinFiguresLens claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} />
  </div>;
}

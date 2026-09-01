"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildBakumatsuThreads } from "@/domain/lenses/bakumatsu";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";

export function BakumatsuLens({ claims, spots, onSelectSpot }: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  onSelectSpot: (spotId: string) => void;
}) {
  const threads = useMemo(() => buildBakumatsuThreads(claims), [claims]);
  const [selectedId, setSelectedId] = useState(threads[0]?.id ?? "education");
  const selected = threads.find((thread) => thread.id === selectedId) ?? threads[0];
  const linkedSpots = spots.filter((spot) =>
    selected?.placeNames.some((name) => spot.name.includes(name) || name.includes(spot.name)),
  );
  const linkedClaims = (selected?.claimIds ?? [])
    .map((id) => claims.find((claim) => claim.id === id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));

  return (
    <aside className={styles.genealogyPanel} aria-label="幕末の再認識レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>幕末</h2></div>
        <span>EXPLORATION CLAIMS / DRAFT</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.bakumatsuLensBody}`}>
        <div className={styles.lensContext}>
          <span>旅で触れた幕末を組み直す</span>
          <strong>場所から、変化の構造を見る</strong>
          <p>旅行記にある観察と関心だけを再編しています。史実の補完はKnowledge Pack追加後に分離して表示します。</p>
        </div>
        <nav className={styles.bakumatsuThreads} aria-label="幕末の接続テーマ">
          {threads.map((thread) => (
            <button key={thread.id} type="button" data-active={thread.id === selected?.id} onClick={() => setSelectedId(thread.id)}>
              <span>{thread.index}</span><strong>{thread.label}</strong><small>{thread.claimIds.length} CLAIMS</small>
            </button>
          ))}
        </nav>
        {selected ? (
          <section className={styles.bakumatsuDetail}>
            <div><span>{selected.index} / THREAD</span><h3>{selected.label}</h3></div>
            <p>{selected.description}</p>
            <div className={styles.bakumatsuPlaces}>
              {linkedSpots.map((spot) => <button type="button" key={spot.id} onClick={() => onSelectSpot(spot.id)}>{spot.name}<small>地図へ →</small></button>)}
            </div>
            <ul className={styles.lensClaimList}>
              {linkedClaims.slice(0, 4).map((claim) => <li key={claim.id}><Link href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}>{claim.statement}<span>根拠を見る →</span></Link></li>)}
            </ul>
            <small>表示中: ユーザーの探索記録から抽出したClaim。幕末史の基礎情報とは未統合です。</small>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

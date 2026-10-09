"use client";

import { useMemo } from "react";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import { CHRONOLOGICAL_STRATA, type StratumLayer } from "@/domain/review/stratum-types";
import styles from "./atlas.module.css";

export function StratumLandscapeLens({
  selectedStratumId,
  spots,
  selectedSpotId,
  onSelectStratum,
  onSelectSpot,
}: {
  selectedStratumId: string;
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
  onSelectStratum: (stratumId: string) => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const currentStratum = useMemo<StratumLayer>(() => {
    return (
      CHRONOLOGICAL_STRATA.find((s) => s.id === selectedStratumId) ??
      CHRONOLOGICAL_STRATA[0]
    );
  }, [selectedStratumId]);

  // 地層断面の法則に従い、上部を表層（第5層：近代）、下部を基底層（第1層：先史）として表示
  const stratigraphicStack = useMemo(() => {
    return [...CHRONOLOGICAL_STRATA].reverse();
  }, []);

  const matchingSpots = useMemo(() => {
    return spots.filter(currentStratum.spotMatchers);
  }, [spots, currentStratum]);

  return (
    <aside className={styles.stratumPanel} aria-label="祭祀景観の垂直地層断面">
      {/* パネルヘッダー */}
      <div className={styles.stratumPanelHeader}>
        <div className={styles.stratumPanelHeaderTitle}>
          <span>STRATIGRAPHY · 垂直地層断面</span>
          <h2>祭祀景観の時代地層</h2>
        </div>
        <div className={styles.stratumOrderIndicator}>
          第{currentStratum.order}層 露頭中
        </div>
      </div>

      {/* 垂直地層断面スタック（ボーリングコア・地層累重ビュー） */}
      <section className={styles.stratumColumnSection} aria-label="時代地層スタック">
        <div className={styles.stratumDepthIndicator}>
          <span className={styles.stratumDepthIndicatorTop}>▲ 地表 · 近代・近世 (Surface)</span>
          <span>深度目盛</span>
        </div>

        <div className={styles.stratumStack} role="tablist" aria-label="地層スライス一覧">
          {stratigraphicStack.map((stratum) => {
            const isActive = stratum.id === currentStratum.id;
            const spotCount = spots.filter(stratum.spotMatchers).length;
            return (
              <button
                key={stratum.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={styles.stratumSlice}
                data-active={isActive ? "true" : undefined}
                onClick={() => onSelectStratum(stratum.id)}
                title={`${stratum.title} (${stratum.eraName})`}
              >
                <div className={styles.stratumSliceHeader}>
                  <div className={styles.stratumSliceDepthBadge}>
                    <span className={styles.stratumSliceOrder}>L{stratum.order}</span>
                    <span className={styles.stratumSliceEra}>{stratum.eraName}</span>
                  </div>
                  <span className={styles.stratumSliceSpotsCount}>
                    {spotCount}地点
                  </span>
                </div>
                <div className={styles.stratumSliceTitle}>{stratum.title}</div>
                <div className={styles.stratumSliceSubtitle}>{stratum.subtitle}</div>
                {isActive && (
                  <div className={styles.stratumSliceActiveIndicator}>
                    ◆ 露頭中 · 地図連動
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.stratumDepthIndicator}>
          <span className={styles.stratumDepthIndicatorBottom}>▼ 最深古層 · 原初基底 (Bedrock)</span>
          <span>先史・縄文弥生</span>
        </div>
      </section>

      {/* 選択した地層の露頭詳細（解説・核心概念・該当スポット） */}
      <div className={styles.stratumOutcrop}>
        <article className={styles.stratumOutcropCard}>
          <div className={styles.stratumOutcropCardHeader}>
            <span>第{currentStratum.order}層 · {currentStratum.eraName}</span>
            <strong>{currentStratum.title}</strong>
            <p>{currentStratum.subtitle}</p>
          </div>
          <p className={styles.stratumOutcropDescription}>{currentStratum.description}</p>

          <div>
            <span className={styles.microLabel}>核心概念・キーターム：</span>
            <div className={styles.stratumChips}>
              {currentStratum.keyConcepts.map((concept) => (
                <span key={concept} className={styles.stratumChip}>
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* 痕跡を宿すスポット一覧 */}
        <section className={styles.stratumOutcropCard}>
          <div className={styles.stratumOutcropCardHeader}>
            <span>痕跡を宿す訪問スポット</span>
            <strong>この地層に合致する地点（{matchingSpots.length}箇所）</strong>
            <p>地図上で金色に光っているスポットです。クリックすると地図が移動します。</p>
          </div>

          {matchingSpots.length > 0 ? (
            <div className={styles.stratumSpotChips}>
              {matchingSpots.map((spot) => {
                const isSelected = spot.id === selectedSpotId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    className={styles.stratumSpotChip}
                    data-active={isSelected ? "true" : undefined}
                    onClick={() => onSelectSpot(spot.id)}
                    title={`${spot.name} (${spot.region} / ${spot.kind})`}
                  >
                    <span className={styles.spotKindBadge}>{spot.kind}</span>
                    <strong>{spot.name}</strong>
                    <small>{spot.region}</small>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyNote}>
              この地層に合致する訪問地は現在ありません。
            </p>
          )}
        </section>
      </div>
    </aside>
  );
}

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

  const matchingSpots = useMemo(() => {
    return spots.filter(currentStratum.spotMatchers);
  }, [spots, currentStratum]);

  return (
    <aside className={styles.genealogyPanel} aria-label="祭祀景観の地層">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>STRATUM</span>
          <h2>祭祀景観の地層</h2>
        </div>
        <span>第{currentStratum.order}層 / 全5層</span>
      </div>

      <div className={styles.contextualLens}>
        {/* 地層セレクター（横並びバー） */}
        <div className={styles.contextualLensTopics} aria-label="時代地層の切り替え">
          <span>地層:</span>
          {CHRONOLOGICAL_STRATA.map((stratum) => {
            const isActive = stratum.id === currentStratum.id;
            const spotCount = spots.filter(stratum.spotMatchers).length;
            return (
              <button
                key={stratum.id}
                type="button"
                data-active={isActive ? "true" : undefined}
                onClick={() => onSelectStratum(stratum.id)}
                title={stratum.subtitle}
              >
                <strong>第{stratum.order}層</strong>
                <span>{stratum.title}</span>
                {spotCount > 0 && <small>({spotCount})</small>}
              </button>
            );
          })}
        </div>

        {/* 選択した地層の詳細コンテンツ */}
        <div className={styles.genealogyBody}>
          <div className={styles.lensContext}>
            <span>第{currentStratum.order}層 · {currentStratum.eraName}</span>
            <strong>{currentStratum.title}</strong>
            <p>{currentStratum.subtitle}</p>
          </div>

          <section className={styles.lensNodeDetail}>
            <div>
              <span>地層の景観と変遷</span>
              <strong>{currentStratum.title}</strong>
            </div>
            <p>{currentStratum.description}</p>

            <div className={styles.lensConnectedEntities}>
              <span className={styles.microLabel}>核心概念・キーターム：</span>
              <div className={styles.lensConnectedEntityList}>
                {currentStratum.keyConcepts.map((concept) => (
                  <span key={concept} className={styles.stratumChip}>
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 該当する訪問スポット一覧 */}
          <section className={styles.lensNodeDetail}>
            <div>
              <span>痕跡を宿すスポット</span>
              <strong>この地層に合致する訪問地（{matchingSpots.length}地点）</strong>
            </div>
            <p>
              地図上に光っているスポットです。クリックすると地図カメラが移動し詳細を確認できます。
            </p>

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
                現在ロードされているアトラスには、この地層に合致するスポットがありません。
              </p>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}

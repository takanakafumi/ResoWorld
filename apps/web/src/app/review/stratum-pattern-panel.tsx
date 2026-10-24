"use client";

import { memo } from "react";
import { CHRONOLOGICAL_STRATA } from "@/domain/review/stratum-types";
import type {
  StratumPatternProjection,
  StratumPatternSpot,
} from "@/domain/review/stratum-patterns";
import { StratumIndicatorDots } from "./stratigraphic-column-card";
import styles from "./atlas.module.css";

const STRIP_MAX_LEVEL = 3;

/** 充足地点の割合を 0〜STRIP_MAX_LEVEL の濃淡段階に量子化する */
function toStripLevel(hitCount: number, memberCount: number): number {
  if (hitCount === 0 || memberCount === 0) return 0;
  return Math.max(1, Math.round((hitCount / memberCount) * STRIP_MAX_LEVEL));
}

/**
 * STRATUM 初期インスペクターの「重層パターン」ビュー。
 * ① 地層のつながり方（パターン別の地点群）／② 同じ聖域内で層を分け合う地点の対比。
 * 事前実体化済みの projection を描画するだけで、ここでは走査・照合を行わない（ADR-0021）。
 */
export const StratumPatternPanel = memo(function StratumPatternPanel({
  projection,
  selectedSpotId,
  onPickSpot,
}: {
  projection: StratumPatternProjection;
  selectedSpotId?: string;
  onPickSpot: (spotId: string) => void;
}) {
  const renderDepthLabel = (member: StratumPatternSpot) =>
    member.membership.strataCount > 0 ? `${member.membership.strataCount}層` : "根拠未登録";

  return (
    <div className={styles.stratumPatternPanel}>
      <div className={styles.stratumPatternSectionHeader}>
        <strong>① 地層のつながり方</strong>
        <span>{projection.totalSpots}拠点</span>
      </div>

      {projection.groups.map((group) => (
        <details key={group.rule.id} className={styles.stratumPatternGroup}>
          <summary className={styles.stratumPatternGroupSummary}>
            <span className={styles.stratumPatternGroupLabel}>{group.rule.label}</span>
            <span
              className={styles.stratumPatternStrip}
              role="img"
              aria-label={`${CHRONOLOGICAL_STRATA.map(
                (layer, index) => `L${layer.order}:${group.layerHitCounts[index]}地点`,
              ).join(" ")}`}
            >
              {CHRONOLOGICAL_STRATA.map((layer, index) => (
                <span
                  key={layer.id}
                  className={styles.stratumPatternStripCell}
                  data-level={toStripLevel(group.layerHitCounts[index], group.members.length)}
                  title={`L${layer.order} ${layer.eraName}: ${group.layerHitCounts[index]}地点`}
                />
              ))}
            </span>
            <span className={styles.stratumPatternGroupCount}>{group.members.length}地点</span>
            <p className={styles.stratumPatternInsight}>{group.rule.insight}</p>
          </summary>
          <div className={styles.stratumPatternGroupBody}>
            <div className={styles.stratumSpotChips}>
              {group.members.map(({ spot, membership }) => (
                <button
                  key={spot.id}
                  type="button"
                  className={styles.stratumSpotChip}
                  data-active={spot.id === selectedSpotId ? "true" : undefined}
                  data-multilayer={membership.strataCount >= 2 ? "true" : undefined}
                  onClick={() => onPickSpot(spot.id)}
                  title={`${spot.name} (${spot.region} / ${spot.kind})`}
                >
                  <span className={styles.spotKindBadge}>{spot.kind}</span>
                  <strong>{spot.name}</strong>
                  <StratumIndicatorDots details={membership.details ?? []} />
                  <small>{spot.region}</small>
                </button>
              ))}
            </div>
          </div>
        </details>
      ))}

      {projection.complexes.length > 0 ? (
        <>
          <div className={styles.stratumPatternSectionHeader}>
            <strong>② 聖域の分業（同じ聖域内で層を分け合う地点）</strong>
            <span>{projection.complexes.length}聖域</span>
          </div>
          {projection.complexes.map((complex) => (
            <section
              key={complex.profileId}
              className={styles.stratumComplexCard}
              aria-label={complex.title}
            >
              <strong>{complex.title}</strong>
              <ul className={styles.stratumComplexMembers}>
                {complex.members.map((member) => (
                  <li key={member.spot.id}>
                    <button
                      type="button"
                      className={styles.stratumComplexMember}
                      data-active={member.spot.id === selectedSpotId ? "true" : undefined}
                      onClick={() => onPickSpot(member.spot.id)}
                    >
                      <span>{member.spot.name}</span>
                      <StratumIndicatorDots details={member.membership.details ?? []} />
                      <span className={styles.stratumComplexMemberDepth}>
                        {renderDepthLabel(member)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : null}

      <p className={styles.stratumPatternNote}>
        ⓘ 重層度は、登録済みの根拠（史料・観察記録・遺構の種別）から判定した層の数です。祭祀史プロファイルの整備が進んでいない地点は、実際より浅く表示されます。
      </p>
    </div>
  );
});

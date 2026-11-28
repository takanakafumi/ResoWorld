"use client";

import { memo, useState } from "react";
import {
  SURFACE_HORIZON_META,
  SURFACE_HORIZON_ORDER,
  type SurfaceContrastObservationDensity,
  type SurfaceHorizonIndex,
  type SurfaceHorizonKind,
} from "@/domain/knowledge/surface-horizon";
import type { SpotStratumMembership } from "@/domain/review/stratum-types";
import { StratumIndicatorDots } from "./stratigraphic-column-card";
import styles from "./atlas.module.css";
import localStyles from "./surface-horizon-panel.module.css";

const DENSITY_META: Record<
  SurfaceContrastObservationDensity,
  { label: string; tone: "rich" | "partial" | "structural" }
> = {
  rich: { label: "現地観察対比（充実）", tone: "rich" },
  partial: { label: "観察一部記録・拡充中", tone: "partial" },
  structural: { label: "景観モデル構造対比", tone: "structural" },
};

/**
 * STRATUM パネル内の「🔍 表層対比（4象限・現在の地表面）」ビュー。
 * 全データの解決は事前実体化された surfaceHorizonIndex を $O(1)$ で参照して描画する（ADR-0021）。
 */
export const SurfaceHorizonPanel = memo(function SurfaceHorizonPanel({
  index,
  stratumMemberships,
  selectedSpotId,
  hoveredSpotId,
  onSelectSpot,
  onHoverSpotIds,
}: {
  index: SurfaceHorizonIndex;
  stratumMemberships?: ReadonlyMap<string, SpotStratumMembership>;
  selectedSpotId?: string;
  hoveredSpotId?: string | null;
  onSelectSpot: (spotId: string) => void;
  onHoverSpotIds?: (spotIds: readonly string[]) => void;
}) {
  const [activeQuadrant, setActiveQuadrant] = useState<SurfaceHorizonKind | "all">("all");

  const visibleQuadrants =
    activeQuadrant === "all" ? SURFACE_HORIZON_ORDER : [activeQuadrant];

  return (
    <div className={localStyles.surfaceHorizonPanel}>
      <section className={styles.stratigraphyCard} aria-label="表層動態（Surface Horizon）4象限と現代対比">
        <header className={styles.stratigraphyCardHeader}>
          <div className={styles.stratigraphyCardEyebrow}>
            <span>SURFACE HORIZON · 現在の地表面（L1〜L5と直交）</span>
            <span className={styles.stratigraphyStrictRuleNote}>
              歴史地層数を歪めず現在相を比較
            </span>
          </div>
          <h3>表層動態 4象限 × 表層対比ビュー</h3>
          <p className={styles.stratigraphyCardSummary}>
            同じ土地や異なる地域が「現在の地表面でどう立ち現れているか」を、現地観察（field_observation）と景観形成モデルから4象限で対比します。博物館・資料館（{index.museumArchiveSpots.length}箇所）は学術展示枠として別管理し、4象限には混在させません。
          </p>
        </header>

        {/* ① 表層対比ペア（クロスリージョン・同一島内分岐） */}
        <div className={localStyles.surfaceContrastSection}>
          <div className={styles.stratumPatternSectionHeader}>
            <strong>① 現代の立ち現れ方・対比ペア</strong>
            <span>{index.contrastPairs.length}組</span>
          </div>

          <div className={localStyles.surfaceContrastList}>
            {index.contrastPairs.map(({ pair, leftSpot, rightSpot, leftResolution, rightResolution }) => {
              const density = DENSITY_META[pair.observationDensity];
              const pairSpotIds = [leftSpot?.id, rightSpot?.id].filter((id): id is string => Boolean(id));
              const leftMeta = SURFACE_HORIZON_META[pair.leftKind];
              const rightMeta = SURFACE_HORIZON_META[pair.rightKind];
              const leftDepth = leftSpot ? stratumMemberships?.get(leftSpot.id)?.strataCount ?? 0 : 0;
              const rightDepth = rightSpot ? stratumMemberships?.get(rightSpot.id)?.strataCount ?? 0 : 0;

              return (
                <article
                  key={pair.id}
                  className={localStyles.surfaceContrastCard}
                  onPointerEnter={(event) => {
                    if (event.pointerType && event.pointerType !== "mouse") return;
                    if (pairSpotIds.length > 0) onHoverSpotIds?.(pairSpotIds);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType && event.pointerType !== "mouse") return;
                    onHoverSpotIds?.([]);
                  }}
                >
                  <div className={localStyles.surfaceContrastCardHeader}>
                    <div>
                      <span className={localStyles.surfaceContrastAxis}>{pair.axisLabel}</span>
                      <h4>{pair.title}</h4>
                    </div>
                    <span className={localStyles.surfaceDensityBadge} data-tone={density.tone}>
                      {density.label}
                    </span>
                  </div>

                  <div className={localStyles.surfaceContrastVersusGrid}>
                    {[
                      {
                        spot: leftSpot,
                        name: pair.leftSpotName,
                        meta: leftMeta,
                        res: leftResolution,
                        depth: leftDepth,
                      },
                      {
                        spot: rightSpot,
                        name: pair.rightSpotName,
                        meta: rightMeta,
                        res: rightResolution,
                        depth: rightDepth,
                      },
                    ].map((side) => {
                      const isSelected = Boolean(side.spot && side.spot.id === selectedSpotId);
                      const isHovered = Boolean(side.spot && side.spot.id === hoveredSpotId);
                      const firstObs =
                        side.res?.status === "resolved" ? side.res.observationClaims[0]?.statement : undefined;
                      return (
                        <button
                          key={side.name}
                          type="button"
                          className={localStyles.surfaceContrastSideBtn}
                          data-surface-kind={side.meta.kind}
                          data-active={isSelected ? "true" : undefined}
                          data-hovered={isHovered ? "true" : undefined}
                          disabled={!side.spot}
                          onClick={() => side.spot && onSelectSpot(side.spot.id)}
                          onPointerEnter={(event) => {
                            if (event.pointerType && event.pointerType !== "mouse") return;
                            if (side.spot) onHoverSpotIds?.([side.spot.id]);
                          }}
                          onPointerLeave={(event) => {
                            if (event.pointerType && event.pointerType !== "mouse") return;
                            if (pairSpotIds.length > 0) onHoverSpotIds?.(pairSpotIds);
                          }}
                        >
                          <span className={styles.surfaceHorizonKindChip} data-surface-kind={side.meta.kind}>
                            {side.meta.icon} {side.meta.shortLabel}
                          </span>
                          <div className={localStyles.surfaceContrastSpotTitleRow}>
                            <strong>{side.spot?.name ?? side.name}</strong>
                            <small>{side.depth > 0 ? `${side.depth}層` : "地層外"}</small>
                          </div>
                          {firstObs ? (
                            <p className={localStyles.surfaceContrastObsSnippet}>{firstObs}</p>
                          ) : (
                            <p className={localStyles.surfaceContrastObsSnippet}>
                              {side.res?.summary ?? "景観プロファイルによる分類"}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className={localStyles.surfaceContrastBody}>{pair.contrastSummary}</p>
                  <small className={localStyles.surfaceContrastCaveat}>{pair.caveatNote}</small>
                </article>
              );
            })}
          </div>
        </div>

        {/* ② 4象限別スポット分類 */}
        <div className={localStyles.surfaceQuadrantsSection}>
          <div className={styles.stratumPatternSectionHeader}>
            <strong>② 4象限別スポット一覧</strong>
            <span>{index.resolvedCount}拠点</span>
          </div>

          <div className={localStyles.surfaceQuadrantFilterBar} role="group" aria-label="表層動態4象限フィルター">
            <button
              type="button"
              className={styles.stratumDepthFilterBtn}
              data-active={activeQuadrant === "all" ? "true" : undefined}
              onClick={() => setActiveQuadrant("all")}
            >
              <span>全4象限</span>
              <strong>({index.resolvedCount})</strong>
            </button>
            {SURFACE_HORIZON_ORDER.map((kind) => {
              const meta = SURFACE_HORIZON_META[kind];
              const count = index.byKind.get(kind)?.length ?? 0;
              return (
                <button
                  key={kind}
                  type="button"
                  className={styles.stratumDepthFilterBtn}
                  data-active={activeQuadrant === kind ? "true" : undefined}
                  onClick={() => setActiveQuadrant(kind)}
                >
                  <span>
                    {meta.icon} {meta.shortLabel}
                  </span>
                  <strong>({count})</strong>
                </button>
              );
            })}
          </div>

          <div className={localStyles.surfaceQuadrantCards}>
            {visibleQuadrants.map((kind) => {
              const meta = SURFACE_HORIZON_META[kind];
              const entries = index.byKind.get(kind) ?? [];
              return (
                <section
                  key={kind}
                  className={localStyles.surfaceQuadrantCard}
                  data-surface-kind={kind}
                  aria-label={meta.label}
                >
                  <header className={localStyles.surfaceQuadrantCardHeader}>
                    <div>
                      <strong>{meta.label}</strong>
                      <p>{meta.subtitle}</p>
                    </div>
                    <span className={styles.stratumPatternGroupCount}>{entries.length}拠点</span>
                  </header>

                  {entries.length > 0 ? (
                    <div className={styles.stratumSpotChips}>
                      {entries.map(({ spot, resolution }) => {
                        const membership = stratumMemberships?.get(spot.id);
                        return (
                          <button
                            key={spot.id}
                            type="button"
                            className={styles.stratumSpotChip}
                            data-active={spot.id === selectedSpotId ? "true" : undefined}
                            data-hovered={hoveredSpotId === spot.id ? "true" : undefined}
                            onClick={() => onSelectSpot(spot.id)}
                            onPointerEnter={(event) => {
                              if (event.pointerType && event.pointerType !== "mouse") return;
                              onHoverSpotIds?.([spot.id]);
                            }}
                            onPointerLeave={(event) => {
                              if (event.pointerType && event.pointerType !== "mouse") return;
                              onHoverSpotIds?.([]);
                            }}
                            title={resolution.summary}
                          >
                            <span className={styles.spotKindBadge}>{spot.kind}</span>
                            <strong>{spot.name}</strong>
                            {membership?.details ? (
                              <StratumIndicatorDots details={membership.details} />
                            ) : (
                              <span className={localStyles.surfaceNonStratumChipTag}>地層外</span>
                            )}
                            {resolution.observationClaims.length > 0 ? (
                              <span className={styles.stratumClaimCountBadge}>
                                観察{resolution.observationClaims.length}
                              </span>
                            ) : null}
                            <small>{spot.region}</small>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.emptyNote}>該当スポットは現在ありません。</p>
                  )}
                </section>
              );
            })}
          </div>

          <p className={localStyles.surfaceMuseumExclusionNote}>
            ※ 博物館・資料館・祈念館（{index.museumArchiveSpots.length}箇所）は、土地の現場景観を分類する4象限とは別枠の「学術展示・アーカイブ拠点」として維持しています。
          </p>
        </div>
      </section>
    </div>
  );
});

"use client";

import Link from "next/link";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import {
  CHRONOLOGICAL_STRATA,
  formatStratumDepthSummary,
  getSpotStratumDetailReport,
  resolveNonStratumReason,
  type SpotStratumLayerDetail,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import {
  SURFACE_HORIZON_META,
  resolveSpotSurfaceHorizon,
  type SurfaceHorizonResolution,
} from "@/domain/knowledge/surface-horizon";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
import styles from "./atlas.module.css";
import localStyles from "./stratigraphic-column-card.module.css";

const BASIS_KIND_LABELS: Record<string, { label: string; icon: string; className: string }> = {
  claim_observation: { label: "現地観察Claim", icon: "📖", className: localStyles.stratumBasisClaim },
  historical_source: { label: "由緒史料・記録", icon: "📜", className: localStyles.stratumBasisSource },
  spot_kind: { label: "遺構形態・種別", icon: "⛩️", className: localStyles.stratumBasisKind },
  topic_link: { label: "探索トピック", icon: "🏷️", className: localStyles.stratumBasisTopic },
  known_tradition: { label: "公知由緒・伝統", icon: "🏛️", className: localStyles.stratumBasisTradition },
};

/**
 * スポットチップや一覧で直感的にどの層を満たしているかが一目でわかるミニインジケーター [① ② ③ · ⑤]
 */
export function StratumIndicatorDots({
  details,
}: {
  details: readonly SpotStratumLayerDetail[];
}) {
  const layerMap = new Map<number, boolean>();
  for (const d of details) {
    layerMap.set(d.layer.order, d.matched);
  }

  const CIRCLE_NUMBERS: Record<number, string> = {
    1: "①",
    2: "②",
    3: "③",
    4: "④",
    5: "⑤",
  };

  return (
    <span className={localStyles.stratumIndicatorDots} aria-label="充足地層インジケーター">
      {[1, 2, 3, 4, 5].map((order) => {
        const isMatched = layerMap.get(order) ?? false;
        return (
          <span
            key={order}
            className={localStyles.stratumIndicatorDot}
            data-active={isMatched ? "true" : "false"}
            title={`第${order}層: ${isMatched ? "充足" : "未確認"}`}
          >
            {isMatched ? CIRCLE_NUMBERS[order] : "·"}
          </span>
        );
      })}
    </span>
  );
}

/**
 * L5の上端（地層数カウント外）に表示する「🌱 現在の地表面（Surface Horizon）」バンド
 */
function SurfaceHorizonBand({
  resolution,
  compact,
}: {
  resolution: SurfaceHorizonResolution;
  compact: boolean;
}) {
  if (resolution.status !== "resolved") {
    if (resolution.observationClaims.length === 0) {
      return null;
    }
    return (
      <div
        className={styles.surfaceHorizonBand}
        data-surface-status="excluded"
        data-compact={compact ? "true" : undefined}
        aria-label="現在の地表面の現地観察記録"
      >
        <div className={localStyles.surfaceHorizonBandHeader}>
          <span className={localStyles.surfaceHorizonEyebrow}>🌱 現在の地表面（現地観察）</span>
          <span className={localStyles.surfaceHorizonCountBadge}>
            観察{resolution.observationClaims.length}件
          </span>
        </div>
        <details
          className={localStyles.stratigraphicLayerClaimsDetails}
          onClick={(event) => event.stopPropagation()}
        >
          <summary className={localStyles.stratigraphicLayerClaimsSummary}>
            現地観察（field_observation）を見る（{resolution.observationClaims.length}件）
          </summary>
          <ul className={localStyles.stratigraphicLayerClaimsList}>
            {resolution.observationClaims.map((claim) => (
              <li key={claim.id} className={localStyles.stratigraphicLayerClaimItem}>
                <p>{claim.statement}</p>
                <div className={localStyles.stratigraphicLayerClaimItemFooter}>
                  <Link
                    href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}
                    className={localStyles.stratigraphicClaimLink}
                  >
                    根拠Claimを見る →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }

  const meta = SURFACE_HORIZON_META[resolution.kind];
  const obsCount = resolution.observationClaims.length;

  return (
    <section
      className={styles.surfaceHorizonBand}
      data-surface-status="resolved"
      data-surface-kind={resolution.kind}
      data-compact={compact ? "true" : undefined}
      aria-label="現在の地表面（Surface Horizon）"
    >
      <div className={localStyles.surfaceHorizonBandHeader}>
        <span className={localStyles.surfaceHorizonEyebrow}>
          🌱 現在の地表面（Surface · 4象限）
        </span>
        <div className={localStyles.surfaceHorizonBadgeRow}>
          <span
            className={styles.surfaceHorizonKindChip}
            data-surface-kind={resolution.kind}
            title={meta.subtitle}
          >
            {meta.icon} {meta.shortLabel}
          </span>
          {obsCount > 0 ? (
            <span className={localStyles.surfaceHorizonCountBadge}>観察{obsCount}件</span>
          ) : null}
        </div>
      </div>

      <p className={localStyles.surfaceHorizonBandSummary}>{resolution.summary}</p>

      {obsCount > 0 ? (
        <details
          className={localStyles.stratigraphicLayerClaimsDetails}
          onClick={(event) => event.stopPropagation()}
        >
          <summary className={localStyles.stratigraphicLayerClaimsSummary}>
            現地観察（field_observation）を見る（{obsCount}件）
          </summary>
          <ul className={localStyles.stratigraphicLayerClaimsList}>
            {resolution.observationClaims.map((claim) => (
              <li key={claim.id} className={localStyles.stratigraphicLayerClaimItem}>
                <p>{claim.statement}</p>
                <div className={localStyles.stratigraphicLayerClaimItemFooter}>
                  <Link
                    href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}
                    className={localStyles.stratigraphicClaimLink}
                  >
                    根拠Claimを見る →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/**
 * 時代地層の柱状図（Stratigraphic Column）カード
 * 表層（第5層：近世近代）から基底層（第1層：原初先史）への積層構造と充足理由を視覚化し、
 * L5の上端（地層数カウント外）に直交する「🌱 現在の地表面（Surface Horizon）」を表示する
 */
export function StratigraphicColumnCard({
  spot,
  stratumContext,
  surfaceResolution,
  onSelectStratum,
  selectedStratumId,
  compact = false,
}: {
  spot: ReviewAtlasSpot;
  stratumContext?: StratumResolutionContext;
  surfaceResolution?: SurfaceHorizonResolution;
  onSelectStratum?: (stratumId: string) => void;
  selectedStratumId?: string;
  compact?: boolean;
}) {
  const report = getSpotStratumDetailReport(
    spot,
    CHRONOLOGICAL_STRATA,
    stratumContext,
  );
  const resolvedSurface =
    surfaceResolution ?? resolveSpotSurfaceHorizon(spot, stratumContext);

  if (report.matchedCount === 0) {
    const profile = resolveSpotStratigraphyProfile(spot);
    const reason = resolveNonStratumReason(spot, profile);

    let bannerNode: React.ReactNode;
    if (reason === "museum_archive" && resolvedSurface.status === "excluded") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="museum"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>🏛️ [学術展示・ガイダンス拠点 / 地層・4象限の対象外]</strong>
          <p>
            本スポットは周辺の考古遺構・出土品や歴史文化を保存・展示・解説する現代の学術・展示拠点です。時代地層柱状図（STRATUM）および表層動態4象限とは別枠のアーカイブとして管理しています。
          </p>
        </div>
      );
    } else if (reason === "museum_archive" && resolvedSurface.status === "resolved") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="heritage-surface"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>🏛️ [近現代の歴史遺構 / 古代〜近世地層対象外]</strong>
          <p>
            本スポットは近現代の歴史記憶・遺構として保存されている現場です。古代〜近世の祭祀地層（L1〜L5）とは別軸として、直下の「現在の地表面（Surface Horizon）」で現在相を管理しています。
          </p>
        </div>
      );
    } else if (reason === "modern_conception_religious") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="modern-religious"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>⚠️ [現代宗教景観 / 時代地層の対象外] 性格C（後世再構成）· 構想先行型</strong>
          <p>
            本スポットは近現代の宗教的構想に基づき新造された景観です。土地の古代祭祀連続性を担保する物証が存在しないため、L1〜L5の時代地層（STRATUM）からは独立して表層動態で記録されています。
          </p>
        </div>
      );
    } else if (reason === "modern_infrastructure") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="infrastructure"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>🧭 [現代拠点・インフラ / 時代地層L1〜L5対象外]</strong>
          <p>
            古代〜近世の宗教・歴史地層を直接計測する対象外の現代拠点です（文化的観察がある場合は直下の表層動態に表示します）。
          </p>
        </div>
      );
    } else if (reason === "scenic_landscape") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="scenic-landscape"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>🌊 [自然景勝・展望地 / 時代地層L1〜L5対象外]</strong>
          <p>
            本スポットは自然地形・眺望を記録する景勝地です。古代〜近世の祭祀・生活地層（STRATUM）とは別軸として、直下の「現在の地表面（Surface Horizon）」で風景・現地観察を管理しています。
          </p>
        </div>
      );
    } else if (reason === "area_context") {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="area-context"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>🗺️ [広域地域コンテキスト / 個別地点地層の対象外]</strong>
          <p>
            本スポットは特定の個別社寺・遺構ではなく広域地域を代表する参照点です。時代地層は地域内の各個別スポット単位で計測します。
          </p>
        </div>
      );
    } else {
      bannerNode = (
        <div
          className={styles.nonStratumNoticeBanner}
          data-reason="under-investigation"
          style={{ margin: compact ? "4px 0" : "8px 0" }}
        >
          <strong>ℹ️ [時代地層の直接物証なし / 判定保留]</strong>
          <p>
            本地点において直接確認できる古代〜近世の祭祀・生活地層（STRATUM）の物証データが現在登録されていません。
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bannerNode}
        <SurfaceHorizonBand resolution={resolvedSurface} compact={compact} />
      </div>
    );
  }

  return (
    <section
      className={localStyles.stratigraphicColumnCard}
      aria-label={`${spot.name}の時代地層柱状図`}
      data-compact={compact ? "true" : undefined}
    >
      {!compact ? (
        <header className={localStyles.stratigraphicColumnHeader}>
          <div className={localStyles.stratigraphicColumnEyebrow}>
            <span>STRATIGRAPHIC COLUMN · 時代地層柱状図</span>
            <span className={localStyles.stratigraphicColumnBadge}>
              {formatStratumDepthSummary(report.matchedCount, spot.claimIds?.length)}
            </span>
          </div>
          <div className={localStyles.stratigraphicColumnTitleRow}>
            <h4>{spot.name}</h4>
            <StratumIndicatorDots details={report.details} />
          </div>
          <p className={localStyles.stratigraphicColumnLead}>
            現在の地表面（Surface）と、表層（第5層）から基底（第1層）への地層断面
          </p>
        </header>
      ) : null}

      {/* 地層数（L1〜L5）カウント外の直交バンド：現在の地表面（Surface Horizon） */}
      <SurfaceHorizonBand resolution={resolvedSurface} compact={compact} />

      <div className={localStyles.stratigraphicColumnStack}>
        {report.details.map((detail) => {
          const { layer, matched, basis, layerClaims = [] } = detail;
          const isSelected = selectedStratumId === layer.id;
          const basisMeta = basis ? BASIS_KIND_LABELS[basis.kind] : undefined;
          const extraClaims =
            basis?.kind === "claim_observation" && basis.claimId
              ? layerClaims.filter((lc) => lc.claimId !== basis.claimId)
              : layerClaims;

          // compactモードで未確認の層は1行スリム表示にしてスペース効率を最大化
          if (compact && !matched) {
            return (
              <div
                key={layer.id}
                className={localStyles.stratigraphicLayerItem}
                data-matched="false"
                data-compact="true"
              >
                <div className={localStyles.stratigraphicLayerItemCompactRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={localStyles.stratigraphicLayerOrderBadge}>L{layer.order}</span>
                    <span className={localStyles.stratigraphicLayerEra}>{layer.eraName}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>
                      {layer.title}
                    </span>
                  </div>
                  <span className={localStyles.stratigraphicUnmatchedBadge}>未確認</span>
                </div>
              </div>
            );
          }

          return (
            <article
              key={layer.id}
              className={localStyles.stratigraphicLayerItem}
              data-matched={matched ? "true" : "false"}
              data-selected={isSelected ? "true" : undefined}
              data-layer-order={layer.order}
              data-compact={compact ? "true" : undefined}
            >
              {/* 上段バー: 左にオーダー・時代、右に根拠バッジ＆層内記録件数 */}
              <div className={localStyles.stratigraphicLayerTopBar}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className={localStyles.stratigraphicLayerOrderBadge}>
                    L{layer.order}
                  </span>
                  <span className={localStyles.stratigraphicLayerEra}>
                    {layer.eraName}
                  </span>
                </div>

                <div className={localStyles.stratigraphicLayerStatusCol}>
                  {matched && layerClaims.length >= 2 ? (
                    <span
                      className={localStyles.stratigraphicDensityBadge}
                      title={`この地層に紐づく観察記録: ${layerClaims.length}件`}
                    >
                      記録{layerClaims.length}件
                    </span>
                  ) : null}
                  {matched ? (
                    basisMeta ? (
                      <span className={localStyles.stratigraphicBasisBadge}>
                        <span>{basisMeta.icon}</span>
                        <span>{basisMeta.label}</span>
                      </span>
                    ) : (
                      <span className={localStyles.stratigraphicMatchedBadge}>充足</span>
                    )
                  ) : (
                    <span className={localStyles.stratigraphicUnmatchedBadge}>
                      未確認
                    </span>
                  )}
                </div>
              </div>

              {/* タイトル行: 横幅100%をフルに使って折り返しを防ぐ */}
              <div className={localStyles.stratigraphicLayerTitleFull}>
                <strong className={localStyles.stratigraphicLayerTitle}>
                  {layer.title}
                </strong>
                {!compact && layer.subtitle ? (
                  <span className={localStyles.stratigraphicLayerSubtitle}>
                    {layer.subtitle}
                  </span>
                ) : null}
              </div>

              {matched && basis ? (
                <div className={localStyles.stratigraphicEvidenceBlock}>
                  <p className={localStyles.stratigraphicEvidenceQuote}>
                    「{basis.evidenceQuote}」
                  </p>
                  <div className={localStyles.stratigraphicEvidenceMeta}>
                    {basis.matchedToken ? (
                      <span className={localStyles.stratigraphicTokenTag}>
                        検出語: {basis.matchedToken}
                      </span>
                    ) : null}
                    {basis.sourceTitle ? (
                      <span className={localStyles.stratigraphicSourceTag}>
                        史料: {basis.sourceTitle}
                      </span>
                    ) : null}
                    {basis.claimId ? (
                      <Link
                        href={`/review?view=graph&claim=${encodeURIComponent(basis.claimId)}`}
                        className={localStyles.stratigraphicClaimLink}
                        title="Evidence GraphでこのClaimの根拠を確認"
                      >
                        根拠Claimを見る →
                      </Link>
                    ) : null}
                  </div>
                  {extraClaims.length > 0 ? (
                    <details
                      className={localStyles.stratigraphicLayerClaimsDetails}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <summary className={localStyles.stratigraphicLayerClaimsSummary}>
                        {basis.kind === "claim_observation"
                          ? `同層の記録・時代変遷を見る（ほか${extraClaims.length}件 / 計${layerClaims.length}件）`
                          : `同層の観察記録を見る（${extraClaims.length}件）`}
                      </summary>
                      <ul className={localStyles.stratigraphicLayerClaimsList}>
                        {extraClaims.map((lc) => (
                          <li key={lc.claimId} className={localStyles.stratigraphicLayerClaimItem}>
                            {lc.historicalTimeLabel ? (
                              <span className={localStyles.stratigraphicTimeTag}>
                                {lc.historicalTimeLabel}
                              </span>
                            ) : null}
                            <p>{lc.statement}</p>
                            <div className={localStyles.stratigraphicLayerClaimItemFooter}>
                              {lc.matchedToken ? (
                                <span className={localStyles.stratigraphicTokenTag}>
                                  検出語: {lc.matchedToken}
                                </span>
                              ) : null}
                              <Link
                                href={`/review?view=graph&claim=${encodeURIComponent(lc.claimId)}`}
                                className={localStyles.stratigraphicClaimLink}
                              >
                                根拠Claimを見る →
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              ) : !compact ? (
                <div className={localStyles.stratigraphicEmptyBlock}>
                  <small>
                    この時代地層に該当する観察記録・史料は現時点で確認されていません（不整合・空白期）。
                  </small>
                </div>
              ) : null}

              {onSelectStratum ? (
                <button
                  type="button"
                  className={localStyles.stratigraphicSelectLayerBtn}
                  onClick={() => onSelectStratum(layer.id)}
                  title={`第${layer.order}層のみを地図上で確認`}
                >
                  第{layer.order}層でフィルター →
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import {
  CHRONOLOGICAL_STRATA,
  getSpotStratumDetailReport,
  type SpotStratumLayerDetail,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import styles from "./atlas.module.css";

const BASIS_KIND_LABELS: Record<string, { label: string; icon: string; className: string }> = {
  claim_observation: { label: "現地観察Claim", icon: "📖", className: styles.stratumBasisClaim },
  historical_source: { label: "由緒史料・記録", icon: "📜", className: styles.stratumBasisSource },
  spot_kind: { label: "遺構形態・種別", icon: "⛩️", className: styles.stratumBasisKind },
  topic_link: { label: "探索トピック", icon: "🏷️", className: styles.stratumBasisTopic },
  known_tradition: { label: "公知由緒・伝統", icon: "🏛️", className: styles.stratumBasisTradition },
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
    <span className={styles.stratumIndicatorDots} aria-label="充足地層インジケーター">
      {[1, 2, 3, 4, 5].map((order) => {
        const isMatched = layerMap.get(order) ?? false;
        return (
          <span
            key={order}
            className={styles.stratumIndicatorDot}
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
 * 時代地層の柱状図（Stratigraphic Column）カード
 * 表層（第5層：近世近代）から基底層（第1層：原初先史）への積層構造と充足理由を視覚化する
 */
export function StratigraphicColumnCard({
  spot,
  stratumContext,
  onSelectStratum,
  selectedStratumId,
  compact = false,
}: {
  spot: ReviewAtlasSpot;
  stratumContext?: StratumResolutionContext;
  onSelectStratum?: (stratumId: string) => void;
  selectedStratumId?: string;
  compact?: boolean;
}) {
  const report = getSpotStratumDetailReport(
    spot,
    CHRONOLOGICAL_STRATA,
    stratumContext,
  );

  if (report.matchedCount === 0) {
    return (
      <div className={styles.nonStratumNoticeBanner} style={{ margin: compact ? "4px 0" : "8px 0" }}>
        <strong>⚠️ [時代地層の対象外 / 現代宗教景観]</strong>
        <p>
          本スポットは土地の古代祭祀連続性を欠く現代宗教景観（性格C・構想先行型）として判定されているため、古代〜近世の時代地層（STRATUM）からは独立して記録されています。
        </p>
      </div>
    );
  }

  return (
    <section
      className={styles.stratigraphicColumnCard}
      aria-label={`${spot.name}の時代地層柱状図`}
      data-compact={compact ? "true" : undefined}
    >
      {!compact ? (
        <header className={styles.stratigraphicColumnHeader}>
          <div className={styles.stratigraphicColumnEyebrow}>
            <span>STRATIGRAPHIC COLUMN · 時代地層柱状図</span>
            <span className={styles.stratigraphicColumnBadge}>
              {report.matchedCount >= 2
                ? `${report.matchedCount}層累重`
                : `${report.matchedCount}層`}
            </span>
          </div>
          <div className={styles.stratigraphicColumnTitleRow}>
            <h4>{spot.name}</h4>
            <StratumIndicatorDots details={report.details} />
          </div>
          <p className={styles.stratigraphicColumnLead}>
            表層（第5層）から基底（第1層）への地層断面と、各層を満たす観察根拠・史料
          </p>
        </header>
      ) : null}

      <div className={styles.stratigraphicColumnStack}>
        {report.details.map((detail) => {
          const { layer, matched, basis } = detail;
          const isSelected = selectedStratumId === layer.id;
          const basisMeta = basis ? BASIS_KIND_LABELS[basis.kind] : undefined;

          // compactモードで未確認の層は1行スリム表示にしてスペース効率を最大化
          if (compact && !matched) {
            return (
              <div
                key={layer.id}
                className={styles.stratigraphicLayerItem}
                data-matched="false"
                data-compact="true"
              >
                <div className={styles.stratigraphicLayerItemCompactRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={styles.stratigraphicLayerOrderBadge}>L{layer.order}</span>
                    <span className={styles.stratigraphicLayerEra}>{layer.eraName}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>
                      {layer.title}
                    </span>
                  </div>
                  <span className={styles.stratigraphicUnmatchedBadge}>未確認</span>
                </div>
              </div>
            );
          }

          return (
            <article
              key={layer.id}
              className={styles.stratigraphicLayerItem}
              data-matched={matched ? "true" : "false"}
              data-selected={isSelected ? "true" : undefined}
              data-layer-order={layer.order}
              data-compact={compact ? "true" : undefined}
            >
              {/* 上段バー: 左にオーダー・時代、右に根拠バッジ */}
              <div className={styles.stratigraphicLayerTopBar}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className={styles.stratigraphicLayerOrderBadge}>
                    L{layer.order}
                  </span>
                  <span className={styles.stratigraphicLayerEra}>
                    {layer.eraName}
                  </span>
                </div>

                <div className={styles.stratigraphicLayerStatusCol}>
                  {matched ? (
                    basisMeta ? (
                      <span className={styles.stratigraphicBasisBadge}>
                        <span>{basisMeta.icon}</span>
                        <span>{basisMeta.label}</span>
                      </span>
                    ) : (
                      <span className={styles.stratigraphicMatchedBadge}>充足</span>
                    )
                  ) : (
                    <span className={styles.stratigraphicUnmatchedBadge}>
                      未確認
                    </span>
                  )}
                </div>
              </div>

              {/* タイトル行: 横幅100%をフルに使って折り返しを防ぐ */}
              <div className={styles.stratigraphicLayerTitleFull}>
                <strong className={styles.stratigraphicLayerTitle}>
                  {layer.title}
                </strong>
                {!compact && layer.subtitle ? (
                  <span className={styles.stratigraphicLayerSubtitle}>
                    {layer.subtitle}
                  </span>
                ) : null}
              </div>

              {matched && basis ? (
                <div className={styles.stratigraphicEvidenceBlock}>
                  <p className={styles.stratigraphicEvidenceQuote}>
                    「{basis.evidenceQuote}」
                  </p>
                  <div className={styles.stratigraphicEvidenceMeta}>
                    {basis.matchedToken ? (
                      <span className={styles.stratigraphicTokenTag}>
                        検出語: {basis.matchedToken}
                      </span>
                    ) : null}
                    {basis.sourceTitle ? (
                      <span className={styles.stratigraphicSourceTag}>
                        史料: {basis.sourceTitle}
                      </span>
                    ) : null}
                    {basis.claimId ? (
                      <Link
                        href={`/review?view=graph&claim=${encodeURIComponent(basis.claimId)}`}
                        className={styles.stratigraphicClaimLink}
                        title="Evidence GraphでこのClaimの根拠を確認"
                      >
                        根拠Claimを見る →
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : !compact ? (
                <div className={styles.stratigraphicEmptyBlock}>
                  <small>
                    この時代地層に該当する観察記録・史料は現時点で確認されていません（不整合・空白期）。
                  </small>
                </div>
              ) : null}

              {onSelectStratum ? (
                <button
                  type="button"
                  className={styles.stratigraphicSelectLayerBtn}
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

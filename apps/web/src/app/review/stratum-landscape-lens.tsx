"use client";

import { memo, useMemo, useState } from "react";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import {
  REGIONAL_COMPARISON_ENTRIES,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  SOURCE_TRADITION_COMPARISON_ENTRIES,
  resolveSpotStratigraphyProfile,
} from "@/domain/knowledge/stratigraphy-profiles";
import {
  CHRONOLOGICAL_STRATA,
  type StratumLayer,
  type SpotStratumMembership,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import {
  RegionalComparisonPanel,
  SourceTraditionComparisonPanel,
  StratigraphyProfileCard,
} from "./stratigraphy-profile-card";
import type { StratumPatternProjection } from "@/domain/review/stratum-patterns";
import { StratumIndicatorDots } from "./stratigraphic-column-card";
import { StratumPatternPanel } from "./stratum-pattern-panel";
import styles from "./atlas.module.css";

export const StratumLandscapeLens = memo(function StratumLandscapeLens({
  selectedStratumIds,
  spots,
  selectedSpotId,
  selectedSpotClaims = [],
  stratumMemberships,
  patternProjection,
  stratumContext,
  onToggleStratum,
  onSelectOnlyStratum,
  onSelectAllStrata,
  onSelectSpot,
  onClearSpot,
}: {
  selectedStratumIds: readonly string[];
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
  selectedSpotClaims?: ReviewDataset["claims"];
  stratumMemberships?: ReadonlyMap<string, SpotStratumMembership>;
  patternProjection?: StratumPatternProjection;
  stratumContext?: StratumResolutionContext;
  onToggleStratum: (stratumId: string) => void;
  onSelectOnlyStratum: (stratumId: string) => void;
  onSelectAllStrata: () => void;
  onSelectSpot: (spotId: string) => void;
  onClearSpot?: () => void;
}) {
  // 手動選択された聖地7項目プロファイルID
  const [manualProfileId, setManualProfileId] = useState<string | undefined>(
    undefined,
  );
  // 最上部固定の分析タブ：重層度・パターン("patterns") / 地域6観点比較("regional") / 史料A・B・C異伝比較("tradition")
  const [globalTab, setGlobalTab] = useState<
    "patterns" | "regional" | "tradition"
  >("patterns");
  // 歴史の厚み・重層度フィルター（全層 / 5層 / 4層 / 3層 / 2層 / 1層）
  const [depthFilter, setDepthFilter] = useState<number | "all">("all");
  // 時代地層スタックの折りたたみ状態（デフォルトは閉じる）
  const [isStrataStackOpen, setIsStrataStackOpen] = useState(false);

  const selectedStrata = useMemo<readonly StratumLayer[]>(() => {
    const matched = CHRONOLOGICAL_STRATA.filter((s) =>
      selectedStratumIds.includes(s.id),
    );
    return matched.length > 0 ? matched : CHRONOLOGICAL_STRATA;
  }, [selectedStratumIds]);

  const isAllSelected = selectedStrata.length === CHRONOLOGICAL_STRATA.length;
  const singleStratum = selectedStrata.length === 1 ? selectedStrata[0] : null;

  // 地層断面の法則に従い、上部を表層（第5層：近代）、下部を基底層（第1層：先史）として表示
  const stratigraphicStack = useMemo(() => {
    return [...CHRONOLOGICAL_STRATA].reverse();
  }, []);

  const matchingSpots = useMemo(() => {
    const filtered = spots.filter((spot) => {
      if (stratumMemberships) {
        return (stratumMemberships.get(spot.id)?.strataCount ?? 0) >= 1;
      }
      return selectedStrata.some((s) => s.spotMatchers(spot, stratumContext));
    });
    // 重層度の高い順（5層→4層→3層→2層→1層）にソート
    return [...filtered].sort((a, b) => {
      const aCount = stratumMemberships?.get(a.id)?.strataCount ?? 1;
      const bCount = stratumMemberships?.get(b.id)?.strataCount ?? 1;
      return bCount - aCount;
    });
  }, [spots, selectedStrata, stratumMemberships, stratumContext]);

  // 重層度ごとのスポット分類（フィルターボタンの件数バッジ用）
  const spotsByStrataCount = useMemo(() => {
    const map = new Map<number, ReviewAtlasSpot[]>();
    for (let i = 1; i <= 5; i++) map.set(i, []);
    for (const spot of matchingSpots) {
      const count = stratumMemberships?.get(spot.id)?.strataCount ?? 1;
      const clamped = Math.max(1, Math.min(5, count));
      map.get(clamped)?.push(spot);
    }
    return map;
  }, [matchingSpots, stratumMemberships]);

  // 選択された重層度フィルター（5層〜1層）に応じた表示スポット一覧
  const displayedSpots = useMemo(() => {
    if (depthFilter === "all") return matchingSpots;
    return matchingSpots.filter((s) => {
      const count = stratumMemberships?.get(s.id)?.strataCount ?? 1;
      return count === depthFilter;
    });
  }, [matchingSpots, depthFilter, stratumMemberships]);

  const selectedSpot = useMemo(() => {
    return spots.find((spot) => spot.id === selectedSpotId);
  }, [spots, selectedSpotId]);

  const spotMatchedProfile = useMemo(() => {
    if (selectedSpot) {
      const profile = resolveSpotStratigraphyProfile(selectedSpot);
      if (profile) return profile;
    }
    return undefined;
  }, [selectedSpot]);

  const activeStratigraphyProfile = useMemo(() => {
    if (manualProfileId) {
      const manual = SACRED_SITE_STRATIGRAPHY_PROFILES.find(
        (profile) => profile.id === manualProfileId,
      );
      if (manual) return manual;
    }
    if (spotMatchedProfile) {
      return spotMatchedProfile;
    }
    for (const spot of matchingSpots) {
      const profile = resolveSpotStratigraphyProfile(spot);
      if (profile) return profile;
    }
    return SACRED_SITE_STRATIGRAPHY_PROFILES[0];
  }, [manualProfileId, spotMatchedProfile, matchingSpots]);

  // 時代地層スタック（5層スライス）
  const renderStratumStack = () => (
    <section className={styles.stratumColumnSection} aria-label="時代地層スタック">
      <div className={styles.stratumFilterToolbar}>
        <span className={styles.stratumFilterHint}>
          層をクリックでON/OFF重ね合わせ
        </span>
        <button
          type="button"
          className={styles.stratumResetAllBtn}
          data-active={isAllSelected ? "true" : undefined}
          onClick={onSelectAllStrata}
        >
          {isAllSelected ? "✓ 全5層 重畳表示中" : "🌐 全5層を重ねて表示"}
        </button>
      </div>

      <div className={styles.stratumDepthIndicator}>
        <span className={styles.stratumDepthIndicatorTop}>▲ 地表 · 近代・近世 (Surface)</span>
        <span>深度目盛</span>
      </div>

      <div className={styles.stratumStack} role="group" aria-label="地層スライス一覧">
        {stratigraphicStack.map((stratum) => {
          const isActive = selectedStratumIds.includes(stratum.id);
          const isSolo = singleStratum?.id === stratum.id;
          const spotCount = spots.filter((spot) =>
            stratum.spotMatchers(spot, stratumContext),
          ).length;
          return (
            <div
              key={stratum.id}
              className={styles.stratumSlice}
              data-active={isActive ? "true" : undefined}
            >
              <div className={styles.stratumSliceHeader}>
                <button
                  type="button"
                  className={styles.stratumSliceToggleHeaderBtn}
                  aria-pressed={isActive}
                  onClick={() => onToggleStratum(stratum.id)}
                >
                  <span className={styles.stratumSliceCheck} data-checked={isActive ? "true" : undefined}>
                    {isActive ? "✓" : ""}
                  </span>
                  <span className={styles.stratumSliceOrder}>L{stratum.order}</span>
                  <span className={styles.stratumSliceEra}>{stratum.eraName}</span>
                </button>
                <div className={styles.stratumSliceHeaderRight}>
                  <button
                    type="button"
                    className={styles.stratumSliceSoloBtn}
                    data-solo={isSolo ? "true" : undefined}
                    onClick={() => onSelectOnlyStratum(stratum.id)}
                    title={
                      isSolo
                        ? "全5層の重ね合わせ表示に戻す"
                        : `第${stratum.order}層（${stratum.title}）のみを単独で抽出表示する`
                    }
                  >
                    {isSolo ? "全層へ戻す" : "この層のみ"}
                  </button>
                  <span className={styles.stratumSliceSpotsCount}>
                    {spotCount}地点
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.stratumSliceBodyBtn}
                onClick={() => onToggleStratum(stratum.id)}
              >
                <div className={styles.stratumSliceTitle}>{stratum.title}</div>
                <div className={styles.stratumSliceSubtitle}>{stratum.subtitle}</div>
                {isActive && (
                  <div className={styles.stratumSliceActiveIndicator}>
                    {isSolo ? "◆ 単独露頭中 · 地図連動" : "◆ 重畳ON · 地図連動"}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.stratumDepthIndicator}>
        <span className={styles.stratumDepthIndicatorBottom}>▼ 最深古層 · 原初基底 (Bedrock)</span>
        <span>先史・縄文弥生</span>
      </div>
    </section>
  );

  return (
    <aside className={styles.stratumPanel} aria-label="祭祀景観の垂直地層断面">
      {/* ① TOP固定ヘッダー (Sticky Header: パネルヘッダー ＋ 分析タブ) */}
      <div className={styles.stratumStickyHeader}>
        <div className={styles.stratumPanelHeaderTitle} style={{ marginBottom: 8 }}>
          <span>STRATIGRAPHY · 垂直地層断面</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: "15px" }}>祭祀景観の時代地層</h2>
            <div className={styles.stratumOrderIndicator}>
              {isAllSelected
                ? "全5層 重畳中"
                : singleStratum
                  ? `第${singleStratum.order}層 露頭中`
                  : `${selectedStrata.length}層 重畳中`}
            </div>
          </div>
        </div>

        {/* TOP固定分析タブ */}
        <div
          className={styles.stratumAnalysisTabs}
          role="tablist"
          aria-label="地層分析ビュー切替"
          style={{ margin: 0 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={globalTab === "patterns"}
            data-active={globalTab === "patterns" ? "true" : undefined}
            onClick={() => setGlobalTab("patterns")}
          >
            🧬 重層度・パターン
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={globalTab === "regional"}
            data-active={globalTab === "regional" ? "true" : undefined}
            onClick={() => setGlobalTab("regional")}
          >
            🌏 地域6観点比較 ({REGIONAL_COMPARISON_ENTRIES.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={globalTab === "tradition"}
            data-active={globalTab === "tradition" ? "true" : undefined}
            onClick={() => setGlobalTab("tradition")}
          >
            📜 史料A・B・C異伝比較 ({SOURCE_TRADITION_COMPARISON_ENTRIES.length})
          </button>
        </div>
      </div>

      {/* ② スクロール領域（画面遷移せず、ポチポチ見比べを維持） */}
      <div
        className={styles.stratumScrollContent}
        style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}
      >
        {/* 時代地層スタック（折りたたみアコーディオン） */}
        <div
          className={styles.stratumAccordionBox}
          aria-label="時代地層スタック折りたたみ"
          style={{ margin: "10px 14px 0" }}
        >
          <button
            type="button"
            className={styles.stratumAccordionHeader}
            onClick={() => setIsStrataStackOpen((prev) => !prev)}
            aria-expanded={isStrataStackOpen}
          >
            <div className={styles.stratumAccordionHeaderLeft}>
              <span className={styles.stratumSummaryBadge}>
                {isAllSelected
                  ? "全5層 重畳中"
                  : singleStratum
                    ? `第${singleStratum.order}層 抽出中`
                    : `${selectedStrata.length}層 選択中`}
              </span>
              <strong>時代地層スタック (L1 先史〜L5 近代)</strong>
              <span className={styles.stratumAccordionSubtext}>
                {isAllSelected
                  ? "先史・古代・中世・近世・近代の全痕跡をオーバーレイ表示"
                  : selectedStrata.map((s) => s.eraName).join(" + ")}
              </span>
            </div>
            <span className={styles.stratumAccordionToggleText}>
              {isStrataStackOpen ? "▲ 閉じる" : "▼ 時代フィルタを展開"}
            </span>
          </button>
          {isStrataStackOpen ? renderStratumStack() : null}
        </div>

        {/* タブ1: 重層度・パターン */}
        {globalTab === "patterns" ? (
          <div className={styles.stratumOutcrop}>
            {/* 歴史の厚み・重層度クイックフィルターバー */}
            <div style={{ margin: "10px 14px 4px" }}>
              <div
                className={styles.stratumDepthFilterBar}
                role="group"
                aria-label="歴史の厚み・重層度フィルター"
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginRight: 4,
                  }}
                >
                  歴史の厚み:
                </span>
                <button
                  type="button"
                  className={styles.stratumDepthFilterBtn}
                  data-active={depthFilter === "all" ? "true" : undefined}
                  onClick={() => setDepthFilter("all")}
                >
                  <span>すべて</span>
                  <strong>({matchingSpots.length})</strong>
                </button>
                {[5, 4, 3, 2, 1].map((depth) => {
                  const count = spotsByStrataCount.get(depth)?.length ?? 0;
                  return (
                    <button
                      key={depth}
                      type="button"
                      className={styles.stratumDepthFilterBtn}
                      data-active={depthFilter === depth ? "true" : undefined}
                      onClick={() => setDepthFilter(depth)}
                    >
                      <span>{depth === 5 ? "5層フル" : `${depth}層`}</span>
                      <strong>({count})</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ① 重層パターン（地層のつながり方・聖域の分業） */}
            {patternProjection ? (
              <StratumPatternPanel
                projection={patternProjection}
                selectedSpotId={selectedSpotId}
                onPickSpot={(spotId) => {
                  onSelectSpot(spotId);
                }}
              />
            ) : null}

            {/* ② 痕跡を宿す訪問スポット（ポチポチ見比べ一覧・重層度順） */}
            <section
              className={styles.stratumOutcropCard}
              style={{ margin: "10px 14px 0" }}
              aria-label="重層度順スポット一覧"
            >
              <div className={styles.stratumOutcropCardHeader}>
                <span>SPOT LIST · 痕跡を宿す訪問スポット（重層度順）</span>
                <strong>
                  {depthFilter === "all"
                    ? isAllSelected
                      ? `全5層のいずれかに合致する地点（${matchingSpots.length}箇所）`
                      : singleStratum
                        ? `第${singleStratum.order}層に合致する地点（${matchingSpots.length}箇所）`
                        : `選択中の${selectedStrata.length}層に合致する地点（${matchingSpots.length}箇所）`
                    : `${depthFilter}層の時代地層を宿す地点（${displayedSpots.length}箇所）`}
                </strong>
                <p>
                  クリックすると地図が移動し、地図上に柱状図・Claimが展開します（リストは維持されます）。
                </p>
              </div>

              {displayedSpots.length > 0 ? (
                <div className={styles.stratumSpotChips}>
                  {displayedSpots.map((spot) => {
                    const isSelected = spot.id === selectedSpotId;
                    const membership = stratumMemberships?.get(spot.id);
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        className={styles.stratumSpotChip}
                        data-active={isSelected ? "true" : undefined}
                        data-multilayer={
                          (membership?.strataCount ?? 1) >= 2
                            ? "true"
                            : undefined
                        }
                        onClick={() => onSelectSpot(spot.id)}
                        title={`${spot.name} (${spot.region} / ${spot.kind})`}
                      >
                        <span className={styles.spotKindBadge}>
                          {spot.kind}
                        </span>
                        <strong>{spot.name}</strong>
                        {membership?.details ? (
                          <StratumIndicatorDots details={membership.details} />
                        ) : null}
                        <small>{spot.region}</small>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.emptyNote}>
                  条件に合致する地点はありません。
                </p>
              )}
            </section>

            {/* ③ コンパクト化された主要聖地7項目プロファイル（アコーディオン＋セレクト） */}
            <details className={styles.stratumProfileSelectorBox}>
              <summary className={styles.stratumProfileSelectorHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--gold)",
                      fontWeight: 600,
                    }}
                  >
                    🏛️ 主要聖域7項目 祭祀史プロファイル (
                    {SACRED_SITE_STRATIGRAPHY_PROFILES.length}拠点)
                  </span>
                </div>
                <select
                  className={styles.stratumProfileSelect}
                  value={activeStratigraphyProfile?.id ?? ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const targetId = e.target.value;
                    setManualProfileId(targetId);
                    const prof = SACRED_SITE_STRATIGRAPHY_PROFILES.find(
                      (p) => p.id === targetId,
                    );
                    if (prof) {
                      const matchingSpot = spots.find((spot) =>
                        prof.spotNames.some(
                          (name) =>
                            spot.name.includes(name) || name.includes(spot.name),
                        ),
                      );
                      if (matchingSpot) {
                        onSelectSpot(matchingSpot.id);
                      }
                    }
                  }}
                >
                  {SACRED_SITE_STRATIGRAPHY_PROFILES.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.spotNames[0]}
                    </option>
                  ))}
                </select>
              </summary>
              <div className={styles.stratumProfileSelectorContent}>
                {activeStratigraphyProfile ? (
                  <StratigraphyProfileCard
                    profile={activeStratigraphyProfile}
                  />
                ) : null}
              </div>
            </details>
          </div>
        ) : null}

        {/* タブ2: 地域6観点比較 */}
        {globalTab === "regional" ? (
          <div className={styles.stratumOutcrop}>
            <RegionalComparisonPanel entries={REGIONAL_COMPARISON_ENTRIES} />
          </div>
        ) : null}

        {/* タブ3: 史料A・B・C異伝比較 */}
        {globalTab === "tradition" ? (
          <div className={styles.stratumOutcrop}>
            <SourceTraditionComparisonPanel
              entries={SOURCE_TRADITION_COMPARISON_ENTRIES}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
});

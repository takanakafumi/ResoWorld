"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import {
  REGIONAL_COMPARISON_ENTRIES,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  SOURCE_TRADITION_COMPARISON_ENTRIES,
  isPrimarySiteForStratigraphy,
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
import {
  StratigraphicColumnCard,
  StratumIndicatorDots,
} from "./stratigraphic-column-card";
import styles from "./atlas.module.css";

export const StratumLandscapeLens = memo(function StratumLandscapeLens({
  selectedStratumIds,
  spots,
  selectedSpotId,
  selectedSpotClaims = [],
  stratumMemberships,
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
  stratumContext?: StratumResolutionContext;
  onToggleStratum: (stratumId: string) => void;
  onSelectOnlyStratum: (stratumId: string) => void;
  onSelectAllStrata: () => void;
  onSelectSpot: (spotId: string) => void;
  onClearSpot?: () => void;
}) {
  const [manualProfileId, setManualProfileId] = useState<string | undefined>(
    undefined,
  );
  // 全体俯瞰時の分析タブ：ランキング("ranking") / 地域6観点比較("regional") / 史料A・B・C異伝比較("tradition")
  const [globalTab, setGlobalTab] = useState<
    "ranking" | "regional" | "tradition"
  >("ranking");
  // 重層度フィルター（全体、5層、4層、3層、2層、1層）
  const [depthFilter, setDepthFilter] = useState<number | "all">("all");
  // 時代地層スタックの折りたたみ状態（デフォルトは閉じる）
  const [isStrataStackOpen, setIsStrataStackOpen] = useState(false);

  // 表示モード：選択地点フォーカス("spot") または 全体地層・一覧俯瞰("global")
  const [panelMode, setPanelMode] = useState<"spot" | "global">("global");
  // 選択地点フォーカス時のサブタブ：聖地7項目歴史解説("profile") または 現地観察Claim("claims")
  const [spotSubTab, setSpotSubTab] = useState<"profile" | "claims">("profile");

  // 地点が選択された場合は自動的に「地点フォーカス」モードへ切り替える
  useEffect(() => {
    if (selectedSpotId) {
      setPanelMode("spot");
      setSpotSubTab("profile");
    } else {
      setPanelMode("global");
    }
  }, [selectedSpotId]);

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
    // 重層度の高い順（5層→4層→3層→2層→1層）にソートして重みを一覧でも直感的に把握できるようにする
    return [...filtered].sort((a, b) => {
      const aCount = stratumMemberships?.get(a.id)?.strataCount ?? 1;
      const bCount = stratumMemberships?.get(b.id)?.strataCount ?? 1;
      return bCount - aCount;
    });
  }, [spots, selectedStrata, stratumMemberships, stratumContext]);

  // 重層度ごとのスポット分類
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

  // 選択された重層度フィルター（5層〜1層）に応じた表示スポット
  const displayedSpots = useMemo(() => {
    if (depthFilter === "all") return matchingSpots;
    return matchingSpots.filter((s) => {
      const count = stratumMemberships?.get(s.id)?.strataCount ?? 1;
      return count === depthFilter;
    });
  }, [matchingSpots, depthFilter, stratumMemberships]);

  // 5層フル累重の主要深層聖域（上位ハイライト）
  const topMultiStratumSpots = useMemo(() => {
    return matchingSpots
      .filter((s) => (stratumMemberships?.get(s.id)?.strataCount ?? 1) >= 5)
      .slice(0, 6);
  }, [matchingSpots, stratumMemberships]);

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
    if (spotMatchedProfile) {
      return spotMatchedProfile;
    }
    if (manualProfileId) {
      const manual = SACRED_SITE_STRATIGRAPHY_PROFILES.find(
        (profile) => profile.id === manualProfileId,
      );
      if (manual) return manual;
    }
    for (const spot of matchingSpots) {
      const profile = resolveSpotStratigraphyProfile(spot);
      if (profile) return profile;
    }
    return SACRED_SITE_STRATIGRAPHY_PROFILES[0];
  }, [spotMatchedProfile, manualProfileId, matchingSpots]);

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

  // 合致スポット一覧（重層度順）
  const renderMatchingSpotsList = () => (
    <section className={styles.stratumOutcropCard}>
      <div className={styles.stratumOutcropCardHeader}>
        <span>痕跡を宿す訪問スポット（重層度順）</span>
        <strong>
          {depthFilter === "all"
            ? isAllSelected
              ? `全5層のいずれかに合致する地点（${matchingSpots.length}箇所）`
              : singleStratum
                ? `第${singleStratum.order}層に合致する地点（${matchingSpots.length}箇所）`
                : `選択中の${selectedStrata.length}層に合致する地点（${matchingSpots.length}箇所）`
            : `${depthFilter}つの時代地層を宿す地点（${displayedSpots.length}箇所）`}
        </strong>
        <p>重層度の高い順（5層→1層）に並んでいます。クリックすると地図が移動し、垂直柱状図が展開します。</p>
      </div>

      {displayedSpots.length > 0 ? (
        <div className={styles.stratumSpotChips}>
          {displayedSpots.map((spot) => {
            const isSelected = spot.id === selectedSpotId;
            const membership = stratumMemberships?.get(spot.id);
            const isMultiLayered = membership ? membership.strataCount >= 2 : false;
            const layerCount = membership?.strataCount ?? 1;

            return (
              <button
                key={spot.id}
                type="button"
                className={styles.stratumSpotChip}
                data-active={isSelected ? "true" : undefined}
                data-multilayer={isMultiLayered ? "true" : undefined}
                onClick={() => {
                  setManualProfileId(undefined);
                  setPanelMode("spot");
                  setSpotSubTab("profile");
                  onSelectSpot(spot.id);
                }}
                title={`${spot.name} (${spot.region} / ${spot.kind})${isMultiLayered ? ` · 累重する${layerCount}つの時代地層` : ""}`}
              >
                <span className={styles.spotKindBadge}>{spot.kind}</span>
                <strong>{spot.name}</strong>
                {isMultiLayered ? (
                  <span className={styles.stratumMultiBadge} title={`${layerCount}層累重`}>
                    {layerCount}層
                  </span>
                ) : null}
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
          {depthFilter === "all"
            ? "この地層に合致する訪問地は現在ありません。"
            : `${depthFilter}層累重に該当する訪問地は現在ありません。`}
        </p>
      )}
    </section>
  );

  return (
    <aside className={styles.stratumPanel} aria-label="祭祀景観の垂直地層断面">
      {/* パネルヘッダー */}
      <div className={styles.stratumPanelHeader}>
        <div className={styles.stratumPanelHeaderTitle}>
          <span>STRATIGRAPHY · 垂直地層断面</span>
          <h2>
            {selectedSpot && panelMode === "spot"
              ? selectedSpot.name
              : "祭祀景観の時代地層"}
          </h2>
        </div>
        <div className={styles.stratumOrderIndicator}>
          {isAllSelected
            ? "全5層 重畳中"
            : singleStratum
              ? `第${singleStratum.order}層 露頭中`
              : `${selectedStrata.length}層 重畳中`}
        </div>
      </div>

      {/* モード切替タブ（地点が選択されている場合に表示） */}
      {selectedSpot ? (
        <nav className={styles.stratumModeTabs} aria-label="表示モード切替">
          <button
            type="button"
            className={styles.stratumModeTab}
            data-active={panelMode === "spot" ? "true" : undefined}
            onClick={() => setPanelMode("spot")}
          >
            📍 選択地点: {selectedSpot.name}
          </button>
          <button
            type="button"
            className={styles.stratumModeTab}
            data-active={panelMode === "global" ? "true" : undefined}
            onClick={() => setPanelMode("global")}
          >
            🌐 {globalTab === "regional" ? "地域比較に戻る" : globalTab === "tradition" ? "史料比較に戻る" : `全体一覧 (${matchingSpots.length}箇所)`}
          </button>
          {onClearSpot && (
            <button
              type="button"
              className={styles.clearSpotBackBtn}
              onClick={() => {
                onClearSpot();
                setPanelMode("global");
              }}
              title={globalTab === "regional" ? "地域比較に戻る" : globalTab === "tradition" ? "史料比較に戻る" : "選択を解除して全体俯瞰へ"}
            >
              ← {globalTab === "regional" ? "地域比較に戻る" : globalTab === "tradition" ? "史料比較に戻る" : "全体一覧へ"}
            </button>
          )}
        </nav>
      ) : null}

      {/* 1. 地点フォーカスモード (panelMode === "spot" かつ selectedSpot が存在) */}
      {selectedSpot && panelMode === "spot" ? (
        <section
          className={styles.selectedSpotPrioritySection}
          aria-label="選択中地点の地層・詳細"
        >
          {/* スポット情報バー */}
          <div className={styles.selectedSpotHeaderBar}>
            <div className={styles.selectedSpotHeaderLeft}>
              <span className={styles.spotKindBadge}>{selectedSpot.kind}</span>
              <span className={styles.selectedSpotRegion}>
                {selectedSpot.region}
              </span>
              {stratumMemberships?.get(selectedSpot.id)?.strataCount ? (
                <span
                  className={styles.stratumMultiBadge}
                  title={`${stratumMemberships.get(selectedSpot.id)!.strataCount}層累重`}
                >
                  {stratumMemberships.get(selectedSpot.id)!.strataCount}層累重
                </span>
              ) : null}
            </div>
            {onClearSpot && (
              <button
                type="button"
                className={styles.clearSpotBackBtn}
                onClick={() => {
                  onClearSpot();
                  setPanelMode("global");
                }}
                title={globalTab === "regional" ? "地域比較に戻る" : globalTab === "tradition" ? "史料比較に戻る" : "全体一覧に戻る"}
              >
                ← {globalTab === "regional" ? "地域比較に戻る" : globalTab === "tradition" ? "史料比較に戻る" : "ランキングに戻る"}
              </button>
            )}
          </div>

          {/* 選択中スポットの時代地層柱状図 */}
          <StratigraphicColumnCard
            spot={selectedSpot}
            stratumContext={stratumContext}
            selectedStratumId={singleStratum?.id}
            onSelectStratum={onSelectOnlyStratum}
          />

          {/* サブタブ切替：聖地7項目・祭祀史 vs 現地観察Claim */}
          <div
            className={styles.spotDetailSubTabs}
            role="tablist"
            aria-label="地点詳細ビュー切替"
          >
            <button
              type="button"
              role="tab"
              aria-selected={spotSubTab === "profile"}
              data-active={spotSubTab === "profile" ? "true" : undefined}
              className={styles.spotDetailSubTab}
              onClick={() => setSpotSubTab("profile")}
            >
              🏛️ 聖地7項目・祭祀史 {spotMatchedProfile ? "✓" : ""}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={spotSubTab === "claims"}
              data-active={spotSubTab === "claims" ? "true" : undefined}
              className={styles.spotDetailSubTab}
              onClick={() => setSpotSubTab("claims")}
            >
              📖 現地観察Claim ({selectedSpotClaims.length}件)
            </button>
          </div>

          {/* サブタブ内容: 聖地7項目・祭祀史 */}
          {spotSubTab === "profile" ? (
            spotMatchedProfile ? (
              <div className={styles.selectedSpotProfileContent}>
                {!isPrimarySiteForStratigraphy(selectedSpot, spotMatchedProfile) ? (
                  <div className={styles.spotSatelliteProfileNotice}>
                    ℹ️ 【{spotMatchedProfile.spotNames[0]} 信仰圏】の祭祀史プロファイルを表示しています
                  </div>
                ) : null}
                <StratigraphyProfileCard profile={spotMatchedProfile} />
              </div>
            ) : (
              <div className={styles.stratumOutcropCard}>
                <div className={styles.stratumOutcropCardHeader}>
                  <span>SPOT STRATIGRAPHY · 個別地点地層</span>
                  <strong>{selectedSpot.name}</strong>
                  <p>
                    この地点の時代地層（垂直柱状図）は上記カードにてご確認いただけます。
                    詳細な聖地7項目祭祀史プロファイルは主要聖域21拠点を対象に策定されています。
                  </p>
                </div>
                {selectedSpotClaims.length > 0 ? (
                  <p className={styles.stratumOutcropDescription}>
                    この地点には {selectedSpotClaims.length} 件の現地観察記録（Claim）が登録されています。「現地観察Claim」タブからご確認いただけます。
                  </p>
                ) : null}
              </div>
            )
          ) : null}

          {/* サブタブ内容: 現地観察・訪問記録（Claim） */}
          {spotSubTab === "claims" ? (
            <div className={styles.selectedSpotClaimsCard}>
              <div className={styles.selectedSpotClaimsHeader}>
                <span>現地観察・訪問記録</span>
                <strong>{selectedSpotClaims.length}件の記録</strong>
              </div>
              {selectedSpotClaims.length > 0 ? (
                <ul className={styles.selectedSpotClaimsList}>
                  {selectedSpotClaims.map((claim) => (
                    <li key={claim.id} className={styles.selectedSpotClaimItem}>
                      <p>{claim.statement}</p>
                      <Link
                        href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}
                        className={styles.claimLink}
                      >
                        根拠グラフで確認 →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyNote}>
                  この地点に紐づく現地観察Claimはまだ登録されていません。
                </p>
              )}
            </div>
          ) : null}
        </section>
      ) : (
        /* 2. 全体俯瞰モード (panelMode === "global" または 地点未選択) */
        <div className={styles.stratumGlobalOverview}>
          {/* ① 時代地層スタック（折りたたみアコーディオン） */}
          <div className={styles.stratumAccordionBox} aria-label="時代地層スタック折りたたみ">
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

          {/* ② 地層探索の3大分析ビュー切替タブ */}
          <div
            className={styles.stratumAnalysisTabs}
            role="tablist"
            aria-label="地層分析ビュー切替"
            style={{ margin: "4px 14px 0" }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={globalTab === "ranking"}
              data-active={globalTab === "ranking" ? "true" : undefined}
              onClick={() => setGlobalTab("ranking")}
            >
              🏆 聖地・重層度ランキング
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

          {/* ③ 各タブの内容 */}
          {globalTab === "ranking" ? (
            <div className={styles.stratumOutcrop}>
              {/* 重層度サマリーメーター（Depth Tier Quick Selector） */}
              <div className={styles.stratumDepthCensus}>
                <div className={styles.stratumDepthCensusHeader}>
                  <span className={styles.microLabel}>歴史の厚み・重層度フィルター：</span>
                  <span className={styles.stratumCensusNote}>
                    {depthFilter === "all"
                      ? `全${matchingSpots.length}拠点`
                      : `${depthFilter}層累重（${displayedSpots.length}拠点）`}
                  </span>
                </div>
                <div className={styles.stratumDepthCensusButtons}>
                  <button
                    type="button"
                    className={styles.stratumDepthTierBtn}
                    data-active={depthFilter === "all" ? "true" : undefined}
                    onClick={() => setDepthFilter("all")}
                  >
                    全体 ({matchingSpots.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((depth) => {
                    const count = spotsByStrataCount.get(depth)?.length ?? 0;
                    return (
                      <button
                        key={depth}
                        type="button"
                        className={styles.stratumDepthTierBtn}
                        data-active={depthFilter === depth ? "true" : undefined}
                        onClick={() => setDepthFilter(depthFilter === depth ? "all" : depth)}
                      >
                        <span className={styles.stratumTierBadge}>{depth}層</span>
                        <span>{count}拠点</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5層フル累重・代表聖地殿堂カード */}
              {topMultiStratumSpots.length > 0 && (depthFilter === "all" || depthFilter === 5) ? (
                <section className={styles.stratumTopSanctuarySection} aria-label="5層累重の主要聖域">
                  <div className={styles.stratumTopSanctuaryHeader}>
                    <strong>👑 5層フル累重の深層聖域（先史〜近代の完全重畳）</strong>
                    <span>最深の歴史蓄積</span>
                  </div>
                  <div className={styles.stratumTopSanctuaryGrid}>
                    {topMultiStratumSpots.map((spot) => {
                      const membership = stratumMemberships?.get(spot.id);
                      const profile = resolveSpotStratigraphyProfile(spot);
                      return (
                        <button
                          key={spot.id}
                          type="button"
                          className={styles.stratumTopSanctuaryCard}
                          onClick={() => {
                            setManualProfileId(undefined);
                            setPanelMode("spot");
                            setSpotSubTab("profile");
                            onSelectSpot(spot.id);
                          }}
                        >
                          <div className={styles.stratumTopSanctuaryCardTop}>
                            <span className={styles.spotKindBadge}>{spot.kind}</span>
                            <span className={styles.stratumMultiBadge}>5層フル累重</span>
                            <small style={{ color: "var(--muted)", marginLeft: "auto", fontSize: "10.5px" }}>
                              {spot.region}
                            </small>
                          </div>
                          <h4 className={styles.stratumTopSanctuaryCardTitle}>{spot.name}</h4>
                          <p className={styles.stratumTopSanctuaryCardSnippet}>
                            {profile?.summary ??
                              `${spot.region}に鎮座し、先史から近代に至る5つの時代地層を完全に重層化させた中核聖域。`}
                          </p>
                          <div className={styles.stratumTopSanctuaryCardFooter}>
                            {membership?.details ? (
                              <StratumIndicatorDots details={membership.details} />
                            ) : null}
                            <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600 }}>
                              地層断面を見る →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* 痕跡を宿すスポット一覧（重層度順） */}
              {renderMatchingSpotsList()}

              {/* 主要聖地7項目プロファイル一覧 */}
              <section
                className={styles.stratumOutcropCard}
                aria-label="聖地層序プロファイル選択"
                style={{ marginTop: 14 }}
              >
                <div className={styles.stratumOutcropCardHeader}>
                  <span>
                    SACRED SITES · 主要聖地プロファイル（
                    {SACRED_SITE_STRATIGRAPHY_PROFILES.length}拠点）
                  </span>
                  <strong>祭祀史7項目で比較する聖域を選択</strong>
                  <p>
                    現在の祭神・社伝の主張と、考古・古代基礎史料の基底層を分解して確認できます。
                  </p>
                </div>
                <div
                  className={styles.stratumSpotChips}
                  role="tablist"
                  aria-label="聖地7項目プロファイル一覧"
                >
                  {SACRED_SITE_STRATIGRAPHY_PROFILES.map((profile) => {
                    const isSelected = activeStratigraphyProfile?.id === profile.id;
                    const matchingSpot = spots.find((spot) =>
                      profile.spotNames.some(
                        (name) => spot.name.includes(name) || name.includes(spot.name),
                      ),
                    );
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        className={styles.stratumSpotChip}
                        data-active={isSelected ? "true" : undefined}
                        onClick={() => {
                          setManualProfileId(profile.id);
                          if (matchingSpot) {
                            onSelectSpot(matchingSpot.id);
                            setPanelMode("spot");
                            setSpotSubTab("profile");
                          }
                        }}
                      >
                        <span className={styles.spotKindBadge}>7項目</span>
                        <strong>{profile.spotNames[0]}</strong>
                      </button>
                    );
                  })}
                </div>
              </section>

              {activeStratigraphyProfile ? (
                <StratigraphyProfileCard profile={activeStratigraphyProfile} />
              ) : null}
            </div>
          ) : null}

          {globalTab === "regional" ? (
            <div className={styles.stratumOutcrop}>
              <RegionalComparisonPanel entries={REGIONAL_COMPARISON_ENTRIES} />
            </div>
          ) : null}

          {globalTab === "tradition" ? (
            <div className={styles.stratumOutcrop}>
              <SourceTraditionComparisonPanel
                entries={SOURCE_TRADITION_COMPARISON_ENTRIES}
              />
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
});

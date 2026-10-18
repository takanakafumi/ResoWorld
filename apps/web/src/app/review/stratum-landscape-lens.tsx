"use client";

import { useMemo, useState } from "react";
import type { ReviewAtlasSpot } from "@/domain/review/types";
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
import styles from "./atlas.module.css";

export function StratumLandscapeLens({
  selectedStratumIds,
  spots,
  selectedSpotId,
  stratumMemberships,
  stratumContext,
  onToggleStratum,
  onSelectOnlyStratum,
  onSelectAllStrata,
  onSelectSpot,
}: {
  selectedStratumIds: readonly string[];
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
  stratumMemberships?: ReadonlyMap<string, SpotStratumMembership>;
  stratumContext?: StratumResolutionContext;
  onToggleStratum: (stratumId: string) => void;
  onSelectOnlyStratum: (stratumId: string) => void;
  onSelectAllStrata: () => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const [manualProfileId, setManualProfileId] = useState<string | undefined>(
    undefined,
  );
  const [analysisTab, setAnalysisTab] = useState<
    "profile" | "regional" | "tradition"
  >("profile");

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

  const spotMatchedProfile = useMemo(() => {
    const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
    if (selectedSpot) {
      const profile = resolveSpotStratigraphyProfile(selectedSpot);
      if (profile) return profile;
    }
    return undefined;
  }, [spots, selectedSpotId]);

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

  return (
    <aside className={styles.stratumPanel} aria-label="祭祀景観の垂直地層断面">
      {/* パネルヘッダー */}
      <div className={styles.stratumPanelHeader}>
        <div className={styles.stratumPanelHeaderTitle}>
          <span>STRATIGRAPHY · 垂直地層断面</span>
          <h2>祭祀景観の時代地層</h2>
        </div>
        <div className={styles.stratumOrderIndicator}>
          {isAllSelected
            ? "全5層 重畳中"
            : singleStratum
              ? `第${singleStratum.order}層 露頭中`
              : `${selectedStrata.length}層 重畳中`}
        </div>
      </div>

      {/* 垂直地層断面スタック（ボーリングコア・地層累重ビュー） */}
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

      {/* 選択した地層の露頭詳細（解説・核心概念・該当スポット） */}
      <div className={styles.stratumOutcrop}>
        {singleStratum ? (
          <article className={styles.stratumOutcropCard}>
            <div className={styles.stratumOutcropCardHeader}>
              <span>第{singleStratum.order}層 · {singleStratum.eraName}</span>
              <strong>{singleStratum.title}</strong>
              <p>{singleStratum.subtitle}</p>
            </div>
            <p className={styles.stratumOutcropDescription}>{singleStratum.description}</p>

            <div>
              <span className={styles.microLabel}>核心概念・キーターム：</span>
              <div className={styles.stratumChips}>
                {singleStratum.keyConcepts.map((concept) => (
                  <span key={concept} className={styles.stratumChip}>
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ) : (
          <article className={styles.stratumOutcropCard}>
            <div className={styles.stratumOutcropCardHeader}>
              <span>
                {isAllSelected
                  ? "ALL 5 STRATA · 全時代地層の重畳俯瞰"
                  : `MULTI-STRATA · 選択中の${selectedStrata.length}層 重畳俯瞰`}
              </span>
              <strong>
                {isAllSelected
                  ? "先史基層から近代社格まで（全5層オーバーレイ）"
                  : `${selectedStrata.map((s) => `L${s.order}`).join(" + ")} の重畳断面`}
              </strong>
              <p>
                選択中の時代地層を重ね合わせ、各聖地に何層分の歴史的根拠が蓄積しているか（重層度）を地図上の金色の光輪とバッジでフラットに可視化しています。
              </p>
            </div>
            <div>
              <span className={styles.microLabel}>現在重ね合わせ中の時代地層：</span>
              <div className={styles.stratumChips}>
                {selectedStrata.map((s) => (
                  <span key={s.id} className={styles.stratumChip}>
                    L{s.order} {s.title}
                  </span>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* 痕跡を宿すスポット一覧 */}
        <section className={styles.stratumOutcropCard}>
          <div className={styles.stratumOutcropCardHeader}>
            <span>痕跡を宿す訪問スポット（重層度順）</span>
            <strong>
              {isAllSelected
                ? `全5層のいずれかに合致する地点（${matchingSpots.length}箇所）`
                : singleStratum
                  ? `第${singleStratum.order}層に合致する地点（${matchingSpots.length}箇所）`
                  : `選択中の${selectedStrata.length}層に合致する地点（${matchingSpots.length}箇所）`}
            </strong>
            <p>重層度の高い順（5層→1層）に並んでいます。クリックすると地図が移動します。</p>
          </div>

          {matchingSpots.length > 0 ? (
            <div className={styles.stratumSpotChips}>
              {matchingSpots.map((spot) => {
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

        {/* 深掘り比較タブ切替（7項目層序 / 地域間6観点 / 史料A・B・C比較） */}
        <div
          className={styles.stratumAnalysisTabs}
          role="tablist"
          aria-label="地層・史料比較ビュー切替"
        >
          <button
            type="button"
            role="tab"
            aria-selected={analysisTab === "profile"}
            data-active={analysisTab === "profile" ? "true" : undefined}
            onClick={() => setAnalysisTab("profile")}
          >
            🏛️ 聖地7項目 ({SACRED_SITE_STRATIGRAPHY_PROFILES.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={analysisTab === "regional"}
            data-active={analysisTab === "regional" ? "true" : undefined}
            onClick={() => setAnalysisTab("regional")}
          >
            🌏 地域6観点比較 ({REGIONAL_COMPARISON_ENTRIES.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={analysisTab === "tradition"}
            data-active={analysisTab === "tradition" ? "true" : undefined}
            onClick={() => setAnalysisTab("tradition")}
          >
            📜 史料A・B・C比較 ({SOURCE_TRADITION_COMPARISON_ENTRIES.length})
          </button>
        </div>

        {analysisTab === "profile" ? (
          <>
            {/* 主要聖地の7項目層序プロファイル切替 */}
            <section
              className={styles.stratumOutcropCard}
              aria-label="聖地層序プロファイル選択"
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
                      (name) =>
                        spot.name.includes(name) || name.includes(spot.name),
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
          </>
        ) : null}

        {analysisTab === "regional" ? (
          <RegionalComparisonPanel entries={REGIONAL_COMPARISON_ENTRIES} />
        ) : null}

        {analysisTab === "tradition" ? (
          <SourceTraditionComparisonPanel
            entries={SOURCE_TRADITION_COMPARISON_ENTRIES}
          />
        ) : null}
      </div>
    </aside>
  );
}


"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CERTAINTY_TIER_META,
  HISTORICAL_NATURE_META,
  LANDSCAPE_FORMATION_META,
  SOURCE_CATEGORY_META,
  type CertaintyTier,
  type HistoricalNatureLabel,
  type LandscapeFormationModel,
  type RegionalComparisonEntry,
  type SacredSiteStratigraphyProfile,
  type SourceCategory,
  type SourceTraditionComparisonEntry,
} from "@/domain/knowledge/source-evaluation";
import styles from "./atlas.module.css";

export function SourceCategoryBadge({ category }: { category: SourceCategory }) {
  const meta = SOURCE_CATEGORY_META[category];
  return (
    <span
      className={styles.epistemicBadge}
      data-source-category={category}
      title={meta.description}
    >
      {meta.shortLabel}
    </span>
  );
}

export function CertaintyTierBadge({ tier }: { tier: CertaintyTier }) {
  const meta = CERTAINTY_TIER_META[tier];
  return (
    <span
      className={styles.epistemicBadge}
      data-certainty-tier={tier}
      title={meta.description}
    >
      {meta.shortLabel}
    </span>
  );
}

export function HistoricalNatureBadge({ nature }: { nature?: HistoricalNatureLabel }) {
  if (!nature) return null;
  const meta = HISTORICAL_NATURE_META[nature];
  return (
    <span
      className={styles.epistemicBadge}
      data-historical-nature={nature}
      title={meta.description}
    >
      {meta.shortLabel}
    </span>
  );
}

export function LandscapeFormationBadge({ model }: { model?: LandscapeFormationModel }) {
  if (!model) return null;
  const meta = LANDSCAPE_FORMATION_META[model];
  return (
    <span
      className={styles.epistemicBadge}
      data-formation-model={model}
      title={meta.description}
    >
      動態: {meta.label}
    </span>
  );
}

export function StratigraphyProfileCard({
  profile,
  compact = false,
  placeNameForNote,
  journeyId,
}: {
  profile: SacredSiteStratigraphyProfile;
  compact?: boolean;
  placeNameForNote?: string;
  journeyId?: string;
}) {
  const targetPlaceName = placeNameForNote ?? profile.spotNames[0] ?? profile.title;
  return (
    <section
      className={styles.stratigraphyCard}
      aria-label={`${profile.title}（祭祀史7項目分解）`}
      data-compact={compact ? "true" : undefined}
    >
      <header className={styles.stratigraphyCardHeader}>
        <div className={styles.stratigraphyCardEyebrow}>
          <span>SACRED SITE STRATIGRAPHY · 祭祀史7項目分解</span>
          <span className={styles.stratigraphyStrictRuleNote}>
            基底層と後世再編・社伝を分離
          </span>
        </div>
        <h3>{profile.title}</h3>
        <div className={styles.stratigraphyMetaBadgeRow}>
          {profile.historicalNature ? (
            <HistoricalNatureBadge nature={profile.historicalNature} />
          ) : null}
          {profile.formationModel ? (
            <LandscapeFormationBadge model={profile.formationModel} />
          ) : null}
        </div>
        <p className={styles.stratigraphyCardSummary}>{profile.summary}</p>
        {profile.historicalNature === "C_LATER_RECONSTITUTION" && profile.formationModel === "conception_driven" ? (
          <div className={styles.nonStratumNoticeBanner}>
            <strong>⚠️ [地層対象外 / 現代宗教景観] 性格C（後世再構成）· 構想先行型</strong>
            <p>
              本施設は近現代の宗教的構想に基づき新造された景観です。土地の古代祭祀連続性を担保する物証が存在しないため、5層の時代地層（STRATUM）からは独立した現代景観として記録・分析しています。
            </p>
          </div>
        ) : null}
      </header>

      <div className={styles.stratigraphyGrid}>
        {/* ① 現在の祭神 */}
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>① 現在の祭神（現在形）</span>
          </div>
          <p className={styles.stratigraphyItemBody}>{profile.currentDeities}</p>
        </div>

        {/* 対比ブロック：⑥・③ 基底層（考古・最古史料） vs ② 由緒・社伝の主張 */}
        <div className={styles.stratigraphyContrastGroup}>
          {/* ⑥ 関連遺跡・古墳・自然祭祀対象（基底層） */}
          <div className={styles.stratigraphyItem} data-layer-kind="bedrock">
            <div className={styles.stratigraphyItemHeader}>
              <span className={styles.stratigraphyItemNumber}>
                ⑥ 関連遺跡・古墳・自然祭祀対象（基底物証）
              </span>
              <CertaintyTierBadge tier={profile.archaeologyAndNaturalTarget.certaintyTier} />
            </div>
            <p className={styles.stratigraphyItemBody}>
              {profile.archaeologyAndNaturalTarget.statement}
            </p>
            <div className={styles.stratigraphyFeatureChips}>
              {profile.archaeologyAndNaturalTarget.features.map((feature) => (
                <span key={feature} className={styles.stratigraphyFeatureChip}>
                  🏺 {feature}
                </span>
              ))}
            </div>
          </div>

          {/* ③ 祭祀が確認できる最古史料 */}
          <div className={styles.stratigraphyItem} data-layer-kind="attested">
            <div className={styles.stratigraphyItemHeader}>
              <span className={styles.stratigraphyItemNumber}>
                ③ 祭祀が確認できる最古史料
              </span>
              <div className={styles.stratigraphyBadgeGroup}>
                <SourceCategoryBadge category={profile.oldestAttestedRecord.sourceCategory} />
                <CertaintyTierBadge tier={profile.oldestAttestedRecord.certaintyTier} />
              </div>
            </div>
            <p className={styles.stratigraphyItemBody}>
              {profile.oldestAttestedRecord.statement}
            </p>
            <dl className={styles.stratigraphyChronologyList}>
              <div>
                <dt>典拠史料</dt>
                <dd>{profile.oldestAttestedRecord.sourceTitle}</dd>
              </div>
              {profile.oldestAttestedRecord.chronology.compilationEra ? (
                <div>
                  <dt>作品成立年代</dt>
                  <dd>{profile.oldestAttestedRecord.chronology.compilationEra}</dd>
                </div>
              ) : null}
              {profile.oldestAttestedRecord.chronology.extantManuscriptEra ? (
                <div>
                  <dt>現存写本年代</dt>
                  <dd>{profile.oldestAttestedRecord.chronology.extantManuscriptEra}</dd>
                </div>
              ) : null}
              {profile.oldestAttestedRecord.chronology.targetEra ? (
                <div>
                  <dt>記述対象年代</dt>
                  <dd>{profile.oldestAttestedRecord.chronology.targetEra}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* ② 由緒が主張する創建・起源（社伝・縁起等） */}
          <div className={styles.stratigraphyItem} data-layer-kind="claimed">
            <div className={styles.stratigraphyItemHeader}>
              <span className={styles.stratigraphyItemNumber}>
                ② 由緒・社伝が主張する創建・起源
              </span>
              <div className={styles.stratigraphyBadgeGroup}>
                <SourceCategoryBadge category={profile.claimedOrigin.sourceCategory} />
                <CertaintyTierBadge tier={profile.claimedOrigin.certaintyTier} />
              </div>
            </div>
            <p className={styles.stratigraphyItemBody}>
              {profile.claimedOrigin.statement}
            </p>
            <small className={styles.stratigraphySourceSubnote}>
              典拠：{profile.claimedOrigin.sourceTitle}
              {profile.claimedOrigin.chronology?.compilationEra
                ? `（成立：${profile.claimedOrigin.chronology.compilationEra} / 対象：${profile.claimedOrigin.chronology.targetEra ?? "伝承期"}）`
                : ""}
            </small>
          </div>
        </div>

        {/* ④ 現在地での祭祀が確認できる最古記録 */}
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ④ 現在地での最古確認（旧鎮座地との区別）
            </span>
            <CertaintyTierBadge tier={profile.oldestCurrentSiteRecord.certaintyTier} />
          </div>
          <p className={styles.stratigraphyItemBody}>
            {profile.oldestCurrentSiteRecord.statement}
          </p>
        </div>

        {/* ⑤ 遷座・合祀・祭神変更・習合・近代再編の履歴 */}
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ⑤ 遷座・習合・近代再編の履歴
            </span>
          </div>
          <ol className={styles.stratigraphyTimeline}>
            {profile.reorganizationHistory.map((step) => (
              <li key={step.era}>
                <div className={styles.stratigraphyTimelineHeader}>
                  <strong>{step.era}</strong>
                  <CertaintyTierBadge tier={step.certaintyTier} />
                </div>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ⑦ 関与した氏族・政治権力・交通路 */}
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ⑦ 関与した氏族・政治権力・交通路
            </span>
            <CertaintyTierBadge tier={profile.clanAndRouteContext.certaintyTier} />
          </div>
          <div className={styles.stratigraphyFeatureChips} style={{ marginBottom: 6 }}>
            {profile.clanAndRouteContext.clans.map((clan) => (
              <span key={clan} className={styles.stratigraphyFeatureChip}>
                👥 {clan}
              </span>
            ))}
          </div>
          <p className={styles.stratigraphyItemBody}>
            {profile.clanAndRouteContext.routeAndPoliticalContext}
          </p>
        </div>

        {/* 現地観察・層序メモ連携リンク */}
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              FIELD OBSERVATION · 層序視点での現地観察・記録追記
            </span>
          </div>
          <p className={styles.stratigraphyItemBody} style={{ marginBottom: 6 }}>
            現地で実見した「⑥磐座・自然地形」「④旧鎮座地・現在地」「⑤神仏習合・再編の痕跡」を訪問メモとして記録できます。
          </p>
          <div className={styles.stratigraphyFeatureChips}>
            <Link
              href={`/imports?mode=new&placeName=${encodeURIComponent(targetPlaceName)}${journeyId ? `&journeyId=${encodeURIComponent(journeyId)}` : ""}`}
              className={styles.stratigraphyFeatureChip}
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              ✍️ {targetPlaceName}の層序観察メモを追記 →
            </Link>
          </div>
        </div>

        {/* 宗教景観の意味形成・提示過程分析（7項目） */}
        {profile.formationAnalysis ? (
          <div className={styles.stratigraphyFormationSection}>
            <div className={styles.stratigraphyFormationHeader}>
              <span className={styles.stratigraphyFormationIcon}>💡</span>
              <div>
                <h4>宗教景観の意味形成・提示過程分析（7項目）</h4>
                <small>シンクレティズム・霊威提示・作法構成の分析モデル</small>
              </div>
            </div>
            <dl className={styles.stratigraphyFormationList}>
              {profile.formationAnalysis.meaningOrigin ? (
                <div>
                  <dt>① 意味の起源（土地・自然・生活・伝承・宗教的啓示）</dt>
                  <dd>{profile.formationAnalysis.meaningOrigin}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.elementsIntroduction ? (
                <div>
                  <dt>② 要素の導入過程（神格・巨石・樹木・鳥居・仏教要素等）</dt>
                  <dd>{profile.formationAnalysis.elementsIntroduction}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.historicalRelation ? (
                <div>
                  <dt>③ 要素間の歴史的関係（当初の結合 vs 後世の結合）</dt>
                  <dd>{profile.formationAnalysis.historicalRelation}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.presentationMethod ? (
                <div>
                  <dt>④ 意味の統合・提示方法（世界観へのまとめ方）</dt>
                  <dd>{profile.formationAnalysis.presentationMethod}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.ritualPracticeOrigin ? (
                <div>
                  <dt>⑤ 祭祀作法の形成過程（祈願・唱句・回数・順序の根拠）</dt>
                  <dd>{profile.formationAnalysis.ritualPracticeOrigin}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.spatialExperience ? (
                <div>
                  <dt>⑥ 空間体験と動線構成（参道・結界・案内表示）</dt>
                  <dd>{profile.formationAnalysis.spatialExperience}</dd>
                </div>
              ) : null}
              {profile.formationAnalysis.formationVisibility ? (
                <div>
                  <dt>⑦ 成立過程の可視性（成立年代・不確実性の開示度）</dt>
                  <dd>{profile.formationAnalysis.formationVisibility}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function RegionalComparisonPanel({
  entries,
}: {
  entries: readonly RegionalComparisonEntry[];
}) {
  const [selectedId, setSelectedId] = useState<string>(entries[0]?.id ?? "");
  const activeEntry =
    entries.find((entry) => entry.id === selectedId) ?? entries[0];

  if (!activeEntry) return null;

  return (
    <section
      className={styles.stratigraphyCard}
      aria-label="地域間比較（6観点分析）"
    >
      <header className={styles.stratigraphyCardHeader}>
        <div className={styles.stratigraphyCardEyebrow}>
          <span>CROSS-REGIONAL COMPARISON · 地域間比較6観点</span>
          <span className={styles.stratigraphyStrictRuleNote}>
            類似から直ちに同一性を断定せず6観点で比較
          </span>
        </div>
        <h3>聖域・祭祀圏の地域間比較マトリクス</h3>
        <div
          className={styles.stratigraphyFeatureChips}
          role="tablist"
          aria-label="比較テーマ選択"
          style={{ marginTop: 6 }}
        >
          {entries.map((entry, idx) => {
            const isSelected = entry.id === activeEntry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(entry.id)}
                className={styles.stratumSpotChip}
                data-active={isSelected ? "true" : undefined}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.spotKindBadge}>比較{idx + 1}</span>
                <strong>{entry.title}</strong>
              </button>
            );
          })}
        </div>
      </header>

      <div className={styles.stratigraphyGrid}>
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              比較対象地域・聖域
            </span>
          </div>
          <div className={styles.stratigraphyFeatureChips}>
            {activeEntry.regions.map((region) => (
              <span key={region} className={styles.stratigraphyFeatureChip}>
                📍 {region}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="bedrock">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              1. 共通点（地形条件・空間構造の共通性）
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>{activeEntry.commonality}</p>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="attested">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              2. 相違点（物証・神名・祭祀形態の差異）
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>{activeEntry.difference}</p>
        </div>

        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              3. 成立時期・文献初見の前後関係
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>{activeEntry.chronology}</p>
        </div>

        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              4. 交流経路・媒介氏族の可能性
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.contactPossibility}
          </p>
        </div>

        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              5. 独立発生の可能性（普遍的な景観条件）
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>{activeEntry.independence}</p>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="claimed">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              6. 別説明・後世再編（習合・付会・規格化）の可能性
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.alternativeExplanation}
          </p>
        </div>
      </div>
    </section>
  );
}

export function SourceTraditionComparisonPanel({
  entries,
}: {
  entries: readonly SourceTraditionComparisonEntry[];
}) {
  const [selectedId, setSelectedId] = useState<string>(entries[0]?.id ?? "");
  const activeEntry =
    entries.find((entry) => entry.id === selectedId) ?? entries[0];

  if (!activeEntry) return null;

  return (
    <section
      className={styles.stratigraphyCard}
      aria-label="史料種別横断の異伝・史料層比較（史料A・B・C）"
    >
      <header className={styles.stratigraphyCardHeader}>
        <div className={styles.stratigraphyCardEyebrow}>
          <span>SOURCE STRATUM COMPARISON · 史料A・B・C 異伝比較</span>
          <span className={styles.stratigraphyStrictRuleNote}>
            古代基礎史料(A)・中近世社伝(B)・古史古伝(C)を混同せず対比
          </span>
        </div>
        <h3>史料階層別の伝承比較（正史・社伝・要検証文献の分離）</h3>
        <div
          className={styles.stratigraphyFeatureChips}
          role="tablist"
          aria-label="史料比較テーマ選択"
          style={{ marginTop: 6 }}
        >
          {entries.map((entry, idx) => {
            const isSelected = entry.id === activeEntry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(entry.id)}
                className={styles.stratumSpotChip}
                data-active={isSelected ? "true" : undefined}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.spotKindBadge}>史料比較{idx + 1}</span>
                <strong>{entry.title}</strong>
              </button>
            );
          })}
        </div>
      </header>

      <div className={styles.stratigraphyGrid}>
        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>対象テーマ</span>
          </div>
          <p className={styles.stratigraphyItemBody}>{activeEntry.targetTheme}</p>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="bedrock">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ① 古代基礎史料・考古物証での確認範囲
            </span>
            <div className={styles.stratigraphyBadgeGroup}>
              <SourceCategoryBadge category="A" />
              <CertaintyTierBadge tier={activeEntry.categoryABedrock.certaintyTier} />
            </div>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.categoryABedrock.statement}
          </p>
          <small className={styles.stratigraphySourceSubnote}>
            典拠：{activeEntry.categoryABedrock.sources}
          </small>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="attested">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ② 中世〜近世の社伝・縁起・習合書での展開
            </span>
            <div className={styles.stratigraphyBadgeGroup}>
              <SourceCategoryBadge category="B" />
              <CertaintyTierBadge tier={activeEntry.categoryBTradition.certaintyTier} />
            </div>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.categoryBTradition.statement}
          </p>
          <small className={styles.stratigraphySourceSubnote}>
            典拠：{activeEntry.categoryBTradition.sources}
          </small>
        </div>

        <div className={styles.stratigraphyItem} data-layer-kind="claimed">
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ③ 古史古伝・要検証文献・近代言説での主張
            </span>
            <div className={styles.stratigraphyBadgeGroup}>
              <SourceCategoryBadge category="C" />
              <CertaintyTierBadge tier={activeEntry.categoryCContested.certaintyTier} />
            </div>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.categoryCContested.statement}
          </p>
          <small className={styles.stratigraphySourceSubnote}>
            対象文献：{activeEntry.categoryCContested.sources}
          </small>
        </div>

        <div className={styles.stratigraphyItem}>
          <div className={styles.stratigraphyItemHeader}>
            <span className={styles.stratigraphyItemNumber}>
              ⚖️ 分析・記録上の分離原則（混同防止ルール）
            </span>
          </div>
          <p className={styles.stratigraphyItemBody}>
            {activeEntry.handlingPrinciple}
          </p>
        </div>
      </div>
    </section>
  );
}



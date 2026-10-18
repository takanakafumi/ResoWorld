"use client";

import {
  CERTAINTY_TIER_META,
  SOURCE_CATEGORY_META,
  type CertaintyTier,
  type SacredSiteStratigraphyProfile,
  type SourceCategory,
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

export function StratigraphyProfileCard({
  profile,
  compact = false,
}: {
  profile: SacredSiteStratigraphyProfile;
  compact?: boolean;
}) {
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
        <p className={styles.stratigraphyCardSummary}>{profile.summary}</p>
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
      </div>
    </section>
  );
}

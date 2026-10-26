"use client";

import { memo } from "react";
import styles from "./atlas.module.css";

export type LensDirectoryPerspective = {
  id: "mythology" | "religion" | "route" | "politics" | "people";
  label: string;
  icon: string;
  tag: string;
  color: string;
  title: string;
  archetype: string;
  description: string;
  highlightTopics: Array<{
    id: string;
    label: string;
  }>;
};

export const LENS_PERSPECTIVE_GUIDES: readonly LensDirectoryPerspective[] = [
  {
    id: "mythology",
    label: "神・系譜",
    icon: "⛩️",
    tag: "MYTHOLOGY",
    color: "#e2a866",
    title: "神話・系譜と祭神ネットワーク",
    archetype: "DAG層化ツリー · 同心円軌道",
    description:
      "記紀神話の神統譜、天津神・国津神の対峙、宗像三女神や日向三代の降臨伝承を幾何学的な系譜と空間配置で読み解きます。",
    highlightTopics: [
      { id: "munakata-genealogy", label: "宗像三女神系譜" },
      { id: "izumo-kunitsukami-preset", label: "出雲国譲り決着" },
      { id: "marine-deities-preset", label: "海神三神（綿津見・住吉・宗像）" },
      { id: "hyuga-mythology-preset", label: "日向三代降臨" },
    ],
  },
  {
    id: "religion",
    label: "宗教",
    icon: "📜",
    tag: "RITUAL & BELIEF",
    color: "#ba68c8",
    title: "祭祀景観の変遷と動態モデル",
    archetype: "5層垂直地層 · 比較マトリクス",
    description:
      "巨岩・海進期の原初自然祭祀から、律令国家祭祀・神仏習合・中世修験・現代構想型景観に至る重層的な信仰変遷を多角的に比較します。",
    highlightTopics: [
      { id: "munakata-three-shrines", label: "沖ノ島三宮・国家祭祀" },
      { id: "miyajima-sacred-relations", label: "厳島・弥山神域景観" },
      { id: "shikinaisha-network-preset", label: "延喜式神名帳・式内社制度" },
      { id: "archaic-local-shrines", label: "弥生重層・古層地域祭礼" },
    ],
  },
  {
    id: "route",
    label: "ルート",
    icon: "🧭",
    tag: "ROUTES & EXCHANGE",
    color: "#72b7e8",
    title: "古代交通・遠征伝承と交易路",
    archetype: "シーケンス回廊 · 路線トポロジー",
    description:
      "『魏志倭人伝』の邪馬台国比定ルート、古代官道・駅路網、瀬戸内海路など、陸海交通の痕跡を路線図的に検証します。",
    highlightTopics: [
      { id: "wajinden-route-comparison", label: "魏志倭人伝・比定ルート" },
      { id: "ancient-highways-preset", label: "古代官道・七道駅路網" },
      { id: "jinmu-setouchi-route-preset", label: "神武東征・瀬戸内海路" },
      { id: "miyajima-current-paths", label: "厳島・弥山登拝回廊" },
    ],
  },
  {
    id: "politics",
    label: "政治・社会",
    icon: "🏛️",
    tag: "POLITICS & SOCIETY",
    color: "#79c58c",
    title: "国家形成と古代生産・支配回廊",
    archetype: "多極ファクション · ハブ＆スポーク",
    description:
      "邪馬台国連合の一大率統治、白村江後の水城・大野城防衛網、低湿地多重環濠の社会構造など、古代から近世の統治と生産ネットワークを捉えます。",
    highlightTopics: [
      { id: "yamatai-politics", label: "邪馬台国連合・一大率統治" },
      { id: "dazaifu-defense-preset", label: "古代国防・水城大野城山城網" },
      { id: "asakura-social-structure", label: "低湿地多重環濠・集落構造" },
      { id: "hagi-domain-politics", label: "長州藩政改革・海防近代化" },
    ],
  },
  {
    id: "people",
    label: "人物",
    icon: "👥",
    tag: "HISTORICAL FIGURES",
    color: "#d5b46d",
    title: "歴史的人物・氏族の活動網",
    archetype: "人物ネットワーク · 相関マトリクス",
    description:
      "阿曇氏・宗像氏・磐井ら古代海人首長、源平壇ノ浦の将兵、そして幕末長州・松下村塾の志士たちまで、時代を動かした人々の相関と行動軌跡を辿ります。",
    highlightTopics: [
      { id: "ancient-chieftains-network", label: "古代海人首長・大和王権同盟" },
      { id: "ishin-figures-network", label: "幕末維新志士・師弟同盟網" },
      { id: "genpei-dannoura-network", label: "源平合戦・壇ノ浦決戦相関" },
      { id: "shoka-sonjuku-action-preset", label: "松下村塾門下生行動軌跡" },
    ],
  },
];

export type AtlasLensDirectoryProps = {
  onSelectRecognitionLens: (lensId: string, topicId?: string, nodeId?: string) => void;
  onSelectMode?: (mode: "lens" | "stratum") => void;
};

export const AtlasLensDirectory = memo(function AtlasLensDirectory({
  onSelectRecognitionLens,
  onSelectMode,
}: AtlasLensDirectoryProps) {
  return (
    <div className={styles.lensDirectoryContainer} aria-label="LENS探索視点ディレクトリ">
      <p className={styles.lensDirectoryLead}>
        地図上の地点だけでなく、神話・祭祀・交通路・政治・人物などの構造的レンズを通して、列島史の重層性を多角的に読み解くことができます。
      </p>

      {/* 時代地層（STRATUM）特集カード */}
      <section className={styles.lensDirectoryStratumCard}>
        <div className={styles.lensDirectoryStratumHeader}>
          <span className={styles.lensDirectoryStratumTag}>STRATUM MODE</span>
          <span className={styles.lensDirectoryStratumArchetype}>全5層の垂直地層断面</span>
        </div>
        <h3 className={styles.lensDirectoryStratumTitle}>
          📜 祭祀景観の時代地層断面 (STRATUM)
        </h3>
        <p className={styles.lensDirectoryStratumDesc}>
          原初アニミズム層から律令祭祀、神仏習合、近世再興、現代構想型景観に至る5つの時代層と、15大聖地の史料A〜D×確度A〜D（祭祀史7項目）を垂直比較します。
        </p>
        <button
          type="button"
          className={styles.lensDirectoryStratumBtn}
          onClick={() => onSelectMode?.("stratum")}
        >
          <span>📜 時代地層 (STRATUM) を開く</span>
          <span>→</span>
        </button>
      </section>

      {/* 5大知識レンズ一覧 */}
      <div className={styles.lensDirectoryGrid}>
        {LENS_PERSPECTIVE_GUIDES.map((lens) => (
          <article
            key={lens.id}
            className={styles.lensDirectoryCard}
            style={{ "--lens-accent": lens.color } as React.CSSProperties}
          >
            <div className={styles.lensDirectoryCardHeader}>
              <div className={styles.lensDirectoryCardTitleGroup}>
                <span className={styles.lensDirectoryIcon} aria-hidden="true">
                  {lens.icon}
                </span>
                <div>
                  <span className={styles.lensDirectoryTag}>{lens.tag}</span>
                  <h3 className={styles.lensDirectoryName}>{lens.label}</h3>
                </div>
              </div>
              <span className={styles.lensDirectoryArchetypeBadge}>
                {lens.archetype}
              </span>
            </div>

            <h4 className={styles.lensDirectoryTitle}>{lens.title}</h4>
            <p className={styles.lensDirectoryDesc}>{lens.description}</p>

            <div className={styles.lensDirectoryTopicsSection}>
              <span className={styles.lensDirectoryTopicsLabel}>代表トピック:</span>
              <div className={styles.lensDirectoryTopicPills}>
                {lens.highlightTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className={styles.lensDirectoryTopicPill}
                    onClick={() => onSelectRecognitionLens(lens.id, topic.id)}
                    title={`「${topic.label}」トピックを直接開きます`}
                  >
                    <span>{topic.label}</span>
                    <span className={styles.lensDirectoryPillArrow}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.lensDirectoryActionBtn}
              onClick={() => onSelectRecognitionLens(lens.id)}
            >
              <span>🔍 {lens.label}レンズを開く</span>
              <span>→</span>
            </button>
          </article>
        ))}
      </div>

      <div className={styles.lensDirectoryFooterTip}>
        <span aria-hidden="true">💡</span>
        <span>
          地図上の任意のピン（古層・現代景観・資料館・候補地）をクリックすると、いつでもその地点の訪問記録や祭祀史7項目インスペクターを閲覧できます。
        </span>
      </div>
    </div>
  );
});

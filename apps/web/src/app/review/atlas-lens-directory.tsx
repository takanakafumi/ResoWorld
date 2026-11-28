"use client";

import { memo } from "react";
import styles from "./atlas-lens-directory.module.css";

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
    title: "神話物語・神統譜と伝承サーガ",
    archetype: "DAG層化ツリー · 伝承サーガ · 比較表",
    description:
      "記紀・風土記に描かれた神統譜、天津神と国津神の対峙、海神三系統や神武東征・神功皇后の伝承サーガを系譜と空間配置で読み解きます。",
    highlightTopics: [
      { id: "munakata-genealogy", label: "宗像三女神・皇統譜" },
      { id: "marine-deities-preset", label: "海神三神（綿津見・住吉・宗像）" },
      { id: "jinmu-yamato-conquest-preset", label: "神武東征・大和建国サーガ" },
      { id: "jingu-kogo-legend-preset", label: "神功皇后伝承・筑紫降誕" },
      { id: "izumo-kunitsukami-preset", label: "出雲国譲り決着" },
    ],
  },
  {
    id: "religion",
    label: "宗教",
    icon: "📜",
    tag: "RITUAL & BELIEF",
    color: "#ba68c8",
    title: "実在社寺の祭祀空間・信仰分布と宗教制度",
    archetype: "同心円軌道 · 比較マトリクス · 地層",
    description:
      "沖ノ島・厳島弥山・高良山の神域景観、大己貴信仰の西日本分布、宇佐・国東六郷満山の神仏習合、式内社・諸国一宮制度まで、実在社寺の信仰構造を比較します。",
    highlightTopics: [
      { id: "munakata-three-shrines", label: "沖ノ島三宮・国家祭祀" },
      { id: "usa-rokugo-syncretism-preset", label: "宇佐八幡・六郷満山の神仏習合" },
      { id: "korasan-sacred-landscape-preset", label: "高良山の重層聖域と神仏習合・分離" },
      { id: "miyajima-sacred-relations", label: "厳島・弥山神域景観" },
      { id: "ichinomiya-western-preset", label: "令制国体制・諸国一宮網" },
    ],
  },
  {
    id: "route",
    label: "ルート",
    icon: "🧭",
    tag: "ROUTES & EXCHANGE",
    color: "#72b7e8",
    title: "海路・官道・鉱物交易と史料比定ルート",
    archetype: "シーケンス回廊 · 流通ハブ＆スポーク",
    description:
      "瀬戸内海・周防灘の潮待ち海路、ヒスイ・朱・鉄の列島鉱物サプライチェーン、古代官道・駅路、魏志倭人伝の比定ルート、弥山登拝路など連続移動と流通を辿ります。",
    highlightTopics: [
      { id: "setouchi-maritime-route-preset", label: "瀬戸内海・周防灘の潮待ち海路" },
      { id: "prehistoric-supply-chain-preset", label: "古代列島鉱物交易サプライチェーン" },
      { id: "wajinden-route-comparison", label: "魏志倭人伝・比定ルート" },
      { id: "ancient-highways-preset", label: "古代官道・七道駅路網" },
      { id: "miyajima-current-paths", label: "厳島・弥山登拝回廊" },
    ],
  },
  {
    id: "politics",
    label: "政治・社会",
    icon: "🏛️",
    tag: "POLITICS & SOCIETY",
    color: "#79c58c",
    title: "統治構造・地域統合比較と社会基盤",
    archetype: "比較マトリクス · 多極ファクション",
    description:
      "弥生環濠集落・邪馬台国連合・ヤマト王権の地域別海上統合や白村江後の国防山城網から、平氏政権、近世対外港湾都市（長崎・鞆の浦）、幕末長州藩政まで統治構造を比較します。",
    highlightTopics: [
      { id: "setouchi-polity-integration-preset", label: "ヤマト王権と列島海上網・地域別比較" },
      { id: "yayoi-archaeology-preset", label: "弥生拠点環濠集落と首長王墓" },
      { id: "dazaifu-defense-preset", label: "白村江後の古代国防・山城網" },
      { id: "sankakubuchi-alliance-preset", label: "三角縁神獣鏡・首長同盟" },
      { id: "early-modern-port-network-preset", label: "近世港湾都市・対外管理と都市記憶" },
    ],
  },
  {
    id: "people",
    label: "人物",
    icon: "👥",
    tag: "HISTORICAL FIGURES",
    color: "#d5b46d",
    title: "歴史的人物・氏族の陣営と活動軌跡",
    archetype: "人物ネットワーク · 陣営相関",
    description:
      "筑紫君磐井や阿曇・宗像ら古代海人首長、源平壇ノ浦決戦の将兵、松下村塾と幕末維新の志士たちまで、歴史を動かした人物・氏族の相関と行動軌跡を辿ります。",
    highlightTopics: [
      { id: "ancient-chieftains-network", label: "古代海人首長・筑紫君磐井と王権" },
      { id: "genpei-dannoura-network", label: "源平合戦・壇ノ浦決戦" },
      { id: "ishin-figures-network", label: "松下村塾と維新志士の同盟網" },
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

"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import styles from "./atlas.module.css";

export type StratumLayer = {
  id: string;
  order: number;
  eraName: string;
  title: string;
  subtitle: string;
  description: string;
  keyConcepts: readonly string[];
  associatedTopicIds: readonly string[];
  spotMatchers: (spot: ReviewAtlasSpot) => boolean;
};

export const CHRONOLOGICAL_STRATA: readonly StratumLayer[] = [
  {
    id: "stratum-nature-animism",
    order: 1,
    eraName: "先史・縄文〜弥生",
    title: "原初自然崇拝・アニミズム層",
    subtitle: "巨石（磐座）・神体山・沖合孤島・海浜の自然祭祀景観",
    description:
      "社殿建築を持たず、巨石・霊山・孤島・海浜そのものを神聖領域として感得した原初の信仰景観。後世の神社祭祀の基底に眠る最古の地層です。",
    keyConcepts: ["巨石信仰（磐座）", "神体山", "島嶼祭祀", "アニミズム", "海浜清め"],
    associatedTopicIds: ["religion-concepts"],
    spotMatchers: (spot) =>
      spot.name.includes("弥山") ||
      spot.name.includes("沖ノ島") ||
      spot.name.includes("三輪") ||
      spot.name.includes("平塚川添") ||
      spot.kind === "遺跡",
  },
  {
    id: "stratum-ancient-state-ritual",
    order: 2,
    eraName: "古墳〜飛鳥・奈良",
    title: "古代国家祭祀・海人族氏族神祇層",
    subtitle: "ヤマト王権と海人族の接触、航路掌握と国家祭祀の成立",
    description:
      "ヤマト王権が玄界灘・瀬戸内海の海上交通を掌握する過程で、宗像氏・阿曇氏・津守氏などの海人族と結びつき、国家航海安全祈願として制度化された祭祀地層です。",
    keyConcepts: ["沖ノ島国家祭祀", "宗像三女神", "航路掌握", "海人族", "ヤマト王権西征"],
    associatedTopicIds: ["religion-history"],
    spotMatchers: (spot) =>
      spot.name.includes("宗像") ||
      spot.name.includes("大社") ||
      spot.name.includes("住吉") ||
      spot.name.includes("宇佐") ||
      spot.name.includes("神功") ||
      spot.name.includes("香椎"),
  },
  {
    id: "stratum-ritsuryo-shinto-network",
    order: 3,
    eraName: "平安初期・延喜式",
    title: "律令神祇・式内社・一宮制度層",
    subtitle: "延喜式神名帳と諸国一宮制による官社ネットワークの確立",
    description:
      "律令国家による神祇官体制の整備に伴い、延喜式神名帳への登載（官社・式内社）や諸国一宮制度を通じて、列島各地の有力神社が公的秩序の中に組み込まれた地層です。",
    keyConcepts: ["延喜式神名帳", "式内名神大社", "諸国一宮", "国司祭祀", "官社制度"],
    associatedTopicIds: ["shikinaisha-network-preset", "ichinomiya-western-preset"],
    spotMatchers: (spot) =>
      spot.name.includes("厳島") ||
      spot.name.includes("一宮") ||
      spot.name.includes("住吉") ||
      spot.name.includes("志賀") ||
      spot.name.includes("筥崎"),
  },
  {
    id: "stratum-syncretism-shugendo",
    order: 4,
    eraName: "平安〜鎌倉・中世",
    title: "神仏習合・修験山岳信仰層",
    subtitle: "神宮寺・本地垂迹説・密教山岳修験の重層",
    description:
      "仏教の伝来と普及により、神社境内に神宮寺が建立され神と仏が一体化。さらに空海・役行者伝説を媒介とする密教・修験道が山岳神域に重層した地層です。",
    keyConcepts: ["神宮寺", "本地垂迹説", "修験道・山岳密教", "弥山大聖院", "六郷満山"],
    associatedTopicIds: ["religion-syncretism"],
    spotMatchers: (spot) =>
      spot.name.includes("大聖院") ||
      spot.name.includes("弥山") ||
      spot.name.includes("求聞持") ||
      spot.name.includes("寺") ||
      spot.name.includes("観音") ||
      spot.name.includes("不動"),
  },
  {
    id: "stratum-early-modern-reconstruction",
    order: 5,
    eraName: "近世〜近代",
    title: "近世藩政・近代神社再編層",
    subtitle: "大名庇護・城下町鎮守・明治神仏分離・近代社格の展開",
    description:
      "戦国大名や近世藩主（毛利氏・黒田氏等）による社殿修造・城下町鎮守の整備と、明治維新時の神仏分離令・近代社格制度によって形作られた近現代の景観地層です。",
    keyConcepts: ["藩主庇護・社殿再建", "城下町鎮守", "明治神仏分離", "官幣社・国幣社", "現代参詣"],
    associatedTopicIds: ["hagi-domain-politics", "ishin-figures-network"],
    spotMatchers: (spot) =>
      spot.name.includes("白神社") ||
      spot.name.includes("城") ||
      spot.name.includes("萩") ||
      spot.name.includes("広島") ||
      spot.kind === "史跡" ||
      spot.kind === "神社",
  },
];

export function ChronologyDrawer({
  isOpen,
  spots,
  onClose,
  onSelectSpot,
}: {
  isOpen: boolean;
  spots: ReviewAtlasSpot[];
  onClose: () => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const [selectedStratumId, setSelectedStratumId] = useState<string>("stratum-nature-animism");
  const allRegisteredTopics = useMemo(() => registeredLensTopics, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStratum =
    CHRONOLOGICAL_STRATA.find((s) => s.id === selectedStratumId) ?? CHRONOLOGICAL_STRATA[0];

  const matchingSpots = spots.filter(currentStratum.spotMatchers);
  const matchingTopics = allRegisteredTopics.filter((t) =>
    currentStratum.associatedTopicIds.includes(t.id),
  );

  return (
    <div className={styles.chronologyOverlay} role="dialog" aria-modal="true" aria-label="通史・時代地層">
      <div className={styles.chronologyBackdrop} onClick={onClose} />
      <section className={styles.chronologyModal}>
        <header className={styles.chronologyHeader}>
          <div className={styles.chronologyHeaderTitle}>
            <span className={styles.chronologyBadge}>CHRONOLOGICAL STRATUM</span>
            <h2>列島通史・時代地層（5層構造）</h2>
            <p>
              水平のLENS（探索視座）とは直交する、全スポット共通の垂直な歴史・祭祀地層。
              日本の史跡・神社は単一時代のものではなく、これら5つの時代地層が重層して現在に至っています。
            </p>
          </div>
          <button
            type="button"
            className={styles.chronologyCloseButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕ 閉じる
          </button>
        </header>

        <div className={styles.chronologyBody}>
          {/* 左カラム：時代地層セレクター（地層タイムライン） */}
          <nav className={styles.chronologyTimeline} aria-label="時代地層一覧">
            {CHRONOLOGICAL_STRATA.map((stratum) => {
              const isActive = stratum.id === selectedStratumId;
              const spotCount = spots.filter(stratum.spotMatchers).length;
              return (
                <button
                  key={stratum.id}
                  type="button"
                  className={styles.stratumCard}
                  data-active={isActive}
                  onClick={() => setSelectedStratumId(stratum.id)}
                >
                  <div className={styles.stratumCardOrder}>
                    <span>第{stratum.order}層</span>
                    <small>{stratum.eraName}</small>
                  </div>
                  <div className={styles.stratumCardMain}>
                    <strong>{stratum.title}</strong>
                    <span>{stratum.subtitle}</span>
                  </div>
                  {spotCount > 0 && (
                    <span className={styles.stratumSpotBadge} title={`関連する訪問スポット ${spotCount}件`}>
                      {spotCount}地点
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 右カラム：選択した地層の詳細解説と訪問地連携 */}
          <article className={styles.chronologyDetail}>
            <div className={styles.stratumDetailHero}>
              <div className={styles.stratumDetailMeta}>
                <span className={styles.stratumTag}>第{currentStratum.order}層 · {currentStratum.eraName}</span>
                <h3>{currentStratum.title}</h3>
                <p className={styles.stratumSubtitle}>{currentStratum.subtitle}</p>
              </div>
              <p className={styles.stratumDescription}>{currentStratum.description}</p>
            </div>

            {/* 核心概念タグ */}
            <div className={styles.stratumSection}>
              <h4>核心概念・キーターム</h4>
              <div className={styles.stratumChips}>
                {currentStratum.keyConcepts.map((concept) => (
                  <span key={concept} className={styles.stratumChip}>
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* 関連する通史・ナレッジトピック */}
            {matchingTopics.length > 0 && (
              <div className={styles.stratumSection}>
                <h4>関連する歴史・制度トピック</h4>
                <div className={styles.stratumTopicList}>
                  {matchingTopics.map((topic) => (
                    <div key={topic.id} className={styles.stratumTopicItem}>
                      <strong>{topic.label}</strong>
                      <p>{topic.description}</p>
                      <small>Preset ID: {topic.presetId}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* この地層を宿す現在の訪問スポット */}
            <div className={styles.stratumSection}>
              <div className={styles.stratumSectionHeader}>
                <h4>この時代地層の痕跡を宿す訪問スポット（{matchingSpots.length}地点）</h4>
                <small>クリックすると地図でそのスポットを選択します</small>
              </div>
              {matchingSpots.length > 0 ? (
                <div className={styles.stratumSpotChips}>
                  {matchingSpots.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      className={styles.stratumSpotChip}
                      onClick={() => {
                        onSelectSpot(spot.id);
                        onClose();
                      }}
                      title={`${spot.name} (${spot.region} / ${spot.kind})`}
                    >
                      <span className={styles.spotKindBadge}>{spot.kind}</span>
                      <strong>{spot.name}</strong>
                      <small>{spot.region}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyNote}>
                  現在ロードされているアトラスには、この地層に明確に合致するスポットがありません。
                </p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

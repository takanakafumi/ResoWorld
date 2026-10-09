import { useEffect, useMemo, useState } from "react";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { CHRONOLOGICAL_STRATA, type StratumLayer } from "@/domain/review/stratum-types";
import styles from "./atlas.module.css";

export type { StratumLayer };
export { CHRONOLOGICAL_STRATA };

export function ChronologyDrawer({
  isOpen,
  spots,
  onClose,
  onSelectSpot,
  onActiveStratumChange,
}: {
  isOpen: boolean;
  spots: ReviewAtlasSpot[];
  onClose: () => void;
  onSelectSpot: (spotId: string) => void;
  onActiveStratumChange?: (stratumId: string, matchingSpotIds: string[]) => void;
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

  const currentStratum =
    CHRONOLOGICAL_STRATA.find((s) => s.id === selectedStratumId) ?? CHRONOLOGICAL_STRATA[0];

  const matchingSpots = useMemo(
    () => spots.filter(currentStratum.spotMatchers),
    [spots, currentStratum],
  );

  useEffect(() => {
    if (isOpen && onActiveStratumChange) {
      onActiveStratumChange(
        currentStratum.id,
        matchingSpots.map((s) => s.id),
      );
    }
  }, [isOpen, currentStratum.id, matchingSpots, onActiveStratumChange]);

  if (!isOpen) return null;

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

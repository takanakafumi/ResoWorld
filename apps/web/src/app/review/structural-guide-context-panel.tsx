"use client";

import { getTopicStructuralGuide } from "@/domain/lenses/structural-guides";
import styles from "./atlas.module.css";

export function StructuralGuideContextPanel({
  topic,
  projectionTitle,
}: {
  topic: {
    id: string;
    label?: string;
    description?: string;
  };
  projectionTitle?: string;
}) {
  const guide = getTopicStructuralGuide(topic);
  const title = projectionTitle ?? topic.label ?? "トピック構造解説";

  return (
    <div className={styles.lensGuideContainer} aria-label={`${title}の構造解説`}>
      <strong style={{ fontSize: "13px", color: "var(--gold)", display: "block", marginBottom: "2px" }}>
        {title}
      </strong>

      {/* ① 構造の要諦 */}
      <div className={styles.lensGuideCard}>
        <div className={styles.lensGuideCardHeader}>
          <span>💡 構造の要諦</span>
        </div>
        <p className={styles.lensGuideCardBody}>{guide.thesis}</p>
      </div>

      {/* ② 図の読み解き方 */}
      <div className={styles.lensGuideCard}>
        <div className={styles.lensGuideCardHeader}>
          <span>🧭 幾何配置・図の読み解き方</span>
        </div>
        <p className={styles.lensGuideCardBody}>{guide.readingGuide}</p>
      </div>

      {/* ③ 歴史・思想的背景 */}
      <div className={styles.lensGuideCard}>
        <div className={styles.lensGuideCardHeader}>
          <span>📜 歴史・神話的背景</span>
        </div>
        <p className={styles.lensGuideCardBody}>{guide.historicalContext}</p>
      </div>

      {/* ④ 探索スポットとの接続 */}
      <div className={styles.lensGuideCard}>
        <div className={styles.lensGuideCardHeader}>
          <span>📍 現地探索・スポットとの接続</span>
        </div>
        <p className={styles.lensGuideCardBody}>{guide.fieldInsight}</p>
      </div>
    </div>
  );
}

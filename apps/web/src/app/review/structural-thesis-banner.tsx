"use client";

import { useState } from "react";
import { getTopicStructuralGuide } from "@/domain/lenses/structural-guides";
import styles from "./atlas.module.css";

export function StructuralThesisBanner({
  topic,
}: {
  topic: {
    id: string;
    label?: string;
    description?: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const guide = getTopicStructuralGuide(topic);

  return (
    <div className={styles.lensStructuralThesisBanner}>
      <div className={styles.lensStructuralThesisHeader}>
        <span className={styles.lensStructuralThesisIcon}>💡</span>
        <span className={styles.lensStructuralThesisText}>{guide.thesis}</span>
        {guide.readingGuide ? (
          <button
            type="button"
            className={styles.lensStructuralGuideToggle}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            title="この構造図の読み方と視点を表示"
          >
            🧭 {isOpen ? "見方を閉じる" : "この図の見方"}
          </button>
        ) : null}
      </div>

      {isOpen && guide.readingGuide ? (
        <div className={styles.lensStructuralReadingGuideBox}>
          <strong>【図の読み解き方】</strong> {guide.readingGuide}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import styles from "./atlas.module.css";

export type RecognitionLensDefinition = {
  id: "overview" | LensPerspectiveId;
  label: string;
  facetIds: readonly string[];
  companionPanel?: boolean;
  focusMapConnectionId?: string;
  mapConnectionGroupId?: string;
};

export function AtlasRecognitionBar({
  availableLenses,
  selectedLensId,
  systemLensActive,
  lensLayout,
  isChronologyOpen = false,
  onSelectLens,
  onSetLensLayout,
  onToggleChronology,
}: {
  availableLenses: readonly RecognitionLensDefinition[];
  selectedLensId: string;
  systemLensActive: boolean;
  lensLayout: "balanced" | "focus";
  selectedJourneyLabel?: string;
  isChronologyOpen?: boolean;
  onSelectLens: (lens: RecognitionLensDefinition) => void;
  onSetLensLayout: (layout: "balanced" | "focus") => void;
  onToggleChronology?: () => void;
}) {
  return (
    <section className={styles.recognitionBar}>
      <div className={styles.recognitionBarTitle}>
        <span>STEP 2 · LENS</span>
        <strong>選んだ訪問を知識で見る</strong>
      </div>
      <nav aria-label="探索を見直すレンズ">
        {availableLenses.map((lens) => (
          <button
            type="button"
            key={lens.id}
            data-active={selectedLensId === lens.id}
            onClick={() => onSelectLens(lens)}
          >
            {lens.label}
          </button>
        ))}
      </nav>
      <div className={styles.recognitionBarActions}>
        {onToggleChronology ? (
          <button
            type="button"
            className={styles.chronologyTriggerButton}
            data-active={isChronologyOpen}
            onClick={onToggleChronology}
            title="水平のLENSとは独立した、全スポット共通の垂直な列島通史・時代地層（5層構造）を開く"
          >
            📜 通史・時代地層
          </button>
        ) : null}
        {systemLensActive ? (
          <div className={styles.lensLayoutControls} role="group" aria-label="地図とLENSの幅">
            <button
              type="button"
              data-active={lensLayout === "balanced"}
              onClick={() => onSetLensLayout("balanced")}
            >
              並列
            </button>
            <button
              type="button"
              data-active={lensLayout === "focus"}
              onClick={() => onSetLensLayout("focus")}
            >
              図を広く
            </button>
          </div>
        ) : (
          <p className={styles.recognitionBarHint}>特定のLENSを適用せず全体を俯瞰します。LENSを選ぶと知識の接続線と候補地が重なります。</p>
        )}
      </div>
    </section>
  );
}

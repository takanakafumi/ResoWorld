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
  explorationMode = "lens",
  onSelectLens,
  onSetLensLayout,
  onSelectMode,
}: {
  availableLenses: readonly RecognitionLensDefinition[];
  selectedLensId: string;
  systemLensActive: boolean;
  lensLayout: "balanced" | "focus";
  selectedJourneyLabel?: string;
  explorationMode?: "lens" | "stratum";
  onSelectLens: (lens: RecognitionLensDefinition) => void;
  onSetLensLayout: (layout: "balanced" | "focus") => void;
  onSelectMode?: (mode: "lens" | "stratum") => void;
}) {
  return (
    <section className={styles.recognitionBar}>
      <div className={styles.recognitionBarTitle}>
        <span>STEP 2</span>
        {onSelectMode ? (
          <div className={styles.explorationModeTabs} role="tablist" aria-label="探索モード切り替え">
            <button
              type="button"
              role="tab"
              aria-selected={explorationMode === "lens"}
              data-active={explorationMode === "lens"}
              onClick={() => onSelectMode("lens")}
              title="テーマ別（宗教・神話・航路・政治・人物）の水平レンズで訪問を見直す"
            >
              🔍 テーマ探索 (LENS)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={explorationMode === "stratum"}
              data-active={explorationMode === "stratum"}
              data-mode="stratum"
              onClick={() => onSelectMode("stratum")}
              title="原初アニミズムから近代再編までの全5層による垂直な通史・祭祀地層で観察する"
            >
              📜 祭祀景観の地層 (STRATUM)
            </button>
          </div>
        ) : (
          <strong>選んだ訪問を知識で見る</strong>
        )}
      </div>

      {explorationMode === "stratum" ? (
        <div className={styles.stratumModeNotice}>
          <span>原初アニミズムから近代再編までの垂直な時代堆積（全5層）を左パネルと地図の分布で観察します。</span>
        </div>
      ) : (
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
      )}

      <div className={styles.recognitionBarActions}>
        {explorationMode === "stratum" || systemLensActive ? (
          <div className={styles.lensLayoutControls} role="group" aria-label="地図とパネルの幅">
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

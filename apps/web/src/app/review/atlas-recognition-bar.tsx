"use client";

import { memo, useEffect, useState } from "react";
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

export const AtlasRecognitionBar = memo(function AtlasRecognitionBar({
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
  const [optimisticLensId, setOptimisticLensId] = useState<string | null>(null);
  const [optimisticMode, setOptimisticMode] = useState<"lens" | "stratum" | null>(null);

  const activeLensId = optimisticLensId ?? selectedLensId;
  const activeMode = optimisticMode ?? explorationMode;

  useEffect(() => {
    if (optimisticLensId && optimisticLensId === selectedLensId) {
      setOptimisticLensId(null);
    }
  }, [selectedLensId, optimisticLensId]);

  useEffect(() => {
    if (optimisticMode && optimisticMode === explorationMode) {
      setOptimisticMode(null);
    }
  }, [explorationMode, optimisticMode]);

  return (
    <section className={styles.recognitionBar} data-mode={activeMode}>
      <div className={styles.recognitionBarTitle}>
        <span>STEP 2</span>
        {activeMode === "stratum" ? (
          <span className={styles.stratumStatusBadge}>垂直地層スキャン中</span>
        ) : null}
        {onSelectMode ? (
          <div className={styles.explorationModeTabs} role="tablist" aria-label="探索モード切り替え">
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "stratum"}
              data-active={activeMode === "stratum"}
              data-mode="stratum"
              onClick={() => {
                setOptimisticMode("stratum");
                onSelectMode("stratum");
              }}
              title="原初アニミズムから近代再編までの全5層による垂直な通史・祭祀地層で観察する"
            >
              📜 祭祀景観の地層 (STRATUM)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "lens"}
              data-active={activeMode === "lens"}
              onClick={() => {
                setOptimisticMode("lens");
                onSelectMode("lens");
              }}
              title="テーマ別（宗教・神話・航路・政治・人物）の水平レンズで訪問を見直す"
            >
              🔍 テーマ探索 (LENS)
            </button>
          </div>
        ) : (
          <strong>選んだ訪問を知識で見る</strong>
        )}
      </div>

      {activeMode === "stratum" ? (
        <div className={styles.stratumModeNotice}>
          <span>累重する5層の垂直断面をスキャン中。左パネルで地層を切り替え、列島空間の古層分布を観察できます。</span>
        </div>
      ) : (
        <nav aria-label="探索を見直すレンズ">
          {availableLenses.map((lens) => (
            <button
              type="button"
              key={lens.id}
              data-active={activeLensId === lens.id}
              onClick={() => {
                setOptimisticLensId(lens.id);
                onSelectLens(lens);
              }}
            >
              {lens.label}
            </button>
          ))}
        </nav>
      )}

      <div className={styles.recognitionBarActions}>
        {activeMode === "stratum" || systemLensActive ? (
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
});

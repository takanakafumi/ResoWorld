"use client";

import { memo, useEffect, useState } from "react";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { CHRONOLOGICAL_STRATA } from "@/domain/review/stratum-types";
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
  splitPercent,
  isCollapsed = false,
  explorationMode = "lens",
  selectedStratumIds,
  onSelectLens,
  onSetLensLayout,
  onSetPreset,
  onToggleCollapse,
  onSelectMode,
  onToggleStratum,
  onSelectOnlyStratum,
  onSelectAllStrata,
}: {
  availableLenses: readonly RecognitionLensDefinition[];
  selectedLensId: string;
  systemLensActive: boolean;
  lensLayout: "balanced" | "focus";
  splitPercent?: number;
  isCollapsed?: boolean;
  explorationMode?: "lens" | "stratum";
  selectedStratumIds?: readonly string[];
  onSelectLens: (lens: RecognitionLensDefinition) => void;
  onSetLensLayout: (layout: "balanced" | "focus") => void;
  onSetPreset?: (preset: "map-wide" | "balanced" | "panel-wide") => void;
  onToggleCollapse?: () => void;
  onSelectMode?: (mode: "lens" | "stratum") => void;
  onToggleStratum?: (stratumId: string) => void;
  onSelectOnlyStratum?: (stratumId: string) => void;
  onSelectAllStrata?: () => void;
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
      {/* STEP 1 · 探索の次元（左端） */}
      <div className={styles.recognitionBarStep}>
        <div className={styles.recognitionBarTitle}>
          <span>STEP 1 · MODE</span>
          <strong>探索の次元</strong>
        </div>
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

      <span className={styles.recognitionBarStepDivider} aria-hidden="true" />

      {/* STEP 2 · 具体的な選択（右側区切り） */}
      <div className={styles.recognitionBarStep}>
        {activeMode === "stratum" ? (
          <>
            <div className={styles.recognitionBarTitle}>
              <span data-mode="stratum">STEP 2 · STRATUM</span>
              <strong>表示する地層</strong>
            </div>
            <nav aria-label="表示する地層" className={styles.recognitionBarNav}>
              <button
                type="button"
                data-active={!selectedStratumIds || selectedStratumIds.length === 5 || selectedStratumIds.length === 0}
                data-mode="stratum"
                onClick={() => onSelectAllStrata?.()}
                title="全5層の累重を表示"
              >
                全5層の累重
              </button>
              {CHRONOLOGICAL_STRATA.map((layer) => {
                const isOnly = selectedStratumIds?.length === 1 && selectedStratumIds[0] === layer.id;
                const isPart = (selectedStratumIds?.length ?? 0) < 5 && (selectedStratumIds?.includes(layer.id) ?? false);
                return (
                  <button
                    type="button"
                    key={layer.id}
                    data-active={isOnly || isPart}
                    data-mode="stratum"
                    onClick={() => {
                      if (onSelectOnlyStratum) {
                        onSelectOnlyStratum(layer.id);
                      } else {
                        onToggleStratum?.(layer.id);
                      }
                    }}
                    title={`第${layer.order}層：${layer.description}`}
                  >
                    第{layer.order}層 {layer.eraName}
                  </button>
                );
              })}
            </nav>
          </>
        ) : (
          <>
            <div className={styles.recognitionBarTitle}>
              <span>STEP 2 · LENS</span>
              <strong>知識レンズを選ぶ</strong>
            </div>
            <nav aria-label="探索を見直すレンズ" className={styles.recognitionBarNav}>
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
          </>
        )}
      </div>

      <div className={styles.recognitionBarActions}>
        {activeMode === "stratum" || systemLensActive ? (
          <div className={styles.lensLayoutControls} role="group" aria-label="地図とパネルの幅">
            {onSetPreset ? (
              <>
                <button
                  type="button"
                  data-mode={activeMode === "stratum" ? "stratum" : undefined}
                  data-active={!isCollapsed && (splitPercent ? splitPercent >= 60 : false)}
                  onClick={() => onSetPreset("map-wide")}
                  title="地図を広く表示します（地図 65% : パネル 35%）"
                >
                  地図を広く
                </button>
                <button
                  type="button"
                  data-mode={activeMode === "stratum" ? "stratum" : undefined}
                  data-active={
                    !isCollapsed &&
                    (splitPercent ? splitPercent >= 45 && splitPercent < 60 : lensLayout === "balanced")
                  }
                  onClick={() => {
                    onSetPreset("balanced");
                    onSetLensLayout("balanced");
                  }}
                  title={
                    activeMode === "stratum"
                      ? "地図と地層パネルを50:50の均等幅で並列表示します"
                      : "地図とレンズ図を50:50の均等幅で並列表示します"
                  }
                >
                  並列
                </button>
                <button
                  type="button"
                  data-mode={activeMode === "stratum" ? "stratum" : undefined}
                  data-active={
                    !isCollapsed &&
                    (splitPercent ? splitPercent < 45 : lensLayout === "focus")
                  }
                  onClick={() => {
                    onSetPreset("panel-wide");
                    onSetLensLayout("focus");
                  }}
                  title={
                    activeMode === "stratum"
                      ? "右側の地層断面・分析パネルを広く拡大表示します（地図 35% : パネル 65%）"
                      : "右側の関係図・系譜図を広く拡大表示します（地図 35% : パネル 65%）"
                  }
                >
                  {activeMode === "stratum" ? "地層を広く" : "図を広く"}
                </button>
                {onToggleCollapse ? (
                  <button
                    type="button"
                    data-mode={activeMode === "stratum" ? "stratum" : undefined}
                    data-active={isCollapsed}
                    onClick={onToggleCollapse}
                    title={
                      isCollapsed
                        ? "パネルを展開して地図と並列表示します"
                        : "パネルを折りたたんで地図を全画面表示します"
                    }
                  >
                    {isCollapsed ? "展開 ◀" : "全画面 ▶"}
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <button
                  type="button"
                  data-mode={activeMode === "stratum" ? "stratum" : undefined}
                  data-active={lensLayout === "balanced"}
                  onClick={() => onSetLensLayout("balanced")}
                  title={
                    activeMode === "stratum"
                      ? "地図と地層パネルを50:50の均等幅で並列表示します"
                      : "地図とレンズ図を50:50の均等幅で並列表示します"
                  }
                >
                  並列
                </button>
                <button
                  type="button"
                  data-mode={activeMode === "stratum" ? "stratum" : undefined}
                  data-active={lensLayout === "focus"}
                  onClick={() => onSetLensLayout("focus")}
                  title={
                    activeMode === "stratum"
                      ? "右側の地層断面・分析パネルを広く拡大表示します"
                      : "右側の関係図・系譜図を広く拡大表示します"
                  }
                >
                  {activeMode === "stratum" ? "地層を広く" : "図を広く"}
                </button>
              </>
            )}
          </div>
        ) : (
          <p className={styles.recognitionBarHint}>特定のLENSを適用せず全体を俯瞰します。</p>
        )}
      </div>
    </section>
  );
});

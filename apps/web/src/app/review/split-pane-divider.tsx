"use client";

import React from "react";
import styles from "./atlas.module.css";
import type { useSplitPane } from "./use-split-pane";

export type SplitPaneDividerProps = {
  splitState: ReturnType<typeof useSplitPane>;
  panelTitle?: string;
};

export const SplitPaneDivider: React.FC<SplitPaneDividerProps> = ({
  splitState,
  panelTitle = "パネル",
}) => {
  const {
    splitPercent,
    isCollapsed,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleKeyDown,
    toggleCollapse,
  } = splitState;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuenow={isCollapsed ? 100 : Math.round(splitPercent)}
      aria-valuemin={20}
      aria-valuemax={80}
      aria-label={`地図と${panelTitle}の境界バー。左右にドラッグして比率を調整、ダブルクリックで50:50にリセット`}
      title={
        isCollapsed
          ? `クリックまたはトグルで${panelTitle}を展開`
          : "ドラッグして幅を自由変更 · ダブルクリックで均等分割"
      }
      className={`${styles.splitPaneDivider} ${isDragging ? styles.splitPaneDividerDragging : ""} ${
        isCollapsed ? styles.splitPaneDividerCollapsed : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* 視覚的な縦ライン */}
      <div className={styles.splitPaneDividerLine} />

      {/* 案B：中央の折りたたみトグルボタン (IDE / Figma 風) */}
      <button
        type="button"
        tabIndex={0}
        className={styles.splitPaneCollapseBtn}
        onClick={(e) => {
          e.stopPropagation();
          toggleCollapse();
        }}
        onPointerDown={(e) => {
          // Prevent drag from triggering when clicking the collapse button
          e.stopPropagation();
        }}
        aria-label={isCollapsed ? `${panelTitle}を展開` : `${panelTitle}を折りたたむ`}
        title={isCollapsed ? `${panelTitle}を展開（並列表示）` : `${panelTitle}を折りたたむ（地図を全画面表示）`}
      >
        <span className={styles.splitPaneCollapseIcon} aria-hidden="true">
          {isCollapsed ? "◀" : "▶"}
        </span>
      </button>
    </div>
  );
};

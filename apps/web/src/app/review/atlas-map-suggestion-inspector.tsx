"use client";

import { useEffect, useRef } from "react";
import type { ReviewExplorationSuggestion } from "@/domain/review/types";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./atlas.module.css";

export type AtlasMapSuggestionInspectorProps = {
  suggestion: ReviewExplorationSuggestion;
  onClose: () => void;
  onSelectLens?: (lensId: string, topicId?: string) => void;
  onReturnToOverview: () => void;
};

export function AtlasMapSuggestionInspector({
  suggestion,
  onClose,
  onSelectLens,
  onReturnToOverview,
}: AtlasMapSuggestionInspectorProps) {
  const { isDragging, dragHandleProps, panelStyle, resetOffset } = useDraggablePanel({
    anchorOrigin: "bottom-right",
  });

  const prevSuggestionIdRef = useRef(suggestion.id);
  useEffect(() => {
    if (prevSuggestionIdRef.current !== suggestion.id) {
      prevSuggestionIdRef.current = suggestion.id;
      resetOffset();
    }
  }, [suggestion.id, resetOffset]);

  return (
    <aside
      className={styles.mapSuggestionInspector}
      style={panelStyle}
      data-dragging={isDragging}
      aria-label="選択した候補地点の情報"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={styles.mapSuggestionInspectorHeader}
        {...dragHandleProps}
        title="ドラッグして移動できます"
      >
        <div className={styles.mapSuggestionInspectorTitle}>
          <span className={styles.mapSuggestionInspectorDragHandle} aria-hidden="true">
            ⠿
          </span>
          <span>CANDIDATE SPOT</span>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="候補地点の情報を閉じる"
        >
          ×
        </button>
      </div>

      <p>未訪問候補地 · 探求フロンティア</p>
      <h3>{suggestion.targetName}</h3>
      <p>{suggestion.reason}</p>

      {suggestion.question ? (
        <div className={styles.mapSuggestionInspectorQuestion}>
          <span>探求の問い</span>
          <p>{suggestion.question}</p>
        </div>
      ) : null}

      {(() => {
        const portals = resolveCrossTopicPortals({
          id: suggestion.targetPlaceId || suggestion.id,
          name: suggestion.targetName,
        });

        if (portals.length > 0 && onSelectLens) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>この地点を照射するLENS / TOPIC</span>
              {portals.map((p) => (
                <button
                  key={p.topicId}
                  type="button"
                  className={styles.mapSuggestionInspectorLensBtn}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onSelectLens(p.lensId, p.topicId)}
                >
                  <span>{p.lensLabel}: {p.topicLabel}</span>
                  <span>開く →</span>
                </button>
              ))}
            </div>
          );
        }

        if (suggestion.lensId && onSelectLens) {
          return (
            <button
              type="button"
              className={styles.mapSuggestionInspectorLensBtn}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelectLens(suggestion.lensId!, suggestion.topicId ?? undefined)}
            >
              <span>LENS: {suggestion.lensId}{suggestion.topicId ? ` · ${suggestion.topicId}` : ""}</span>
              <span>開く →</span>
            </button>
          );
        }

        return null;
      })()}

      <button
        type="button"
        className={styles.mapSpotInspectorOverview}
        onClick={onReturnToOverview}
      >
        標準（全体俯瞰）に戻る
      </button>
    </aside>
  );
}

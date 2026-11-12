"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ExplorationSuggestionStatus,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { suggestionStatusLabels } from "./exploration-suggestions";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./atlas.module.css";

export type AtlasMapSuggestionInspectorProps = {
  suggestion: ReviewExplorationSuggestion;
  status?: ExplorationSuggestionStatus;
  anchorSpots?: ReviewAtlasSpot[];
  onStatusChange?: (status: ExplorationSuggestionStatus) => void;
  onSelectAnchorSpot?: (spotId: string) => void;
  onClose: () => void;
  onSelectLens?: (lensId: string, topicId?: string) => void;
  onReturnToOverview: () => void;
};

export function AtlasMapSuggestionInspector({
  suggestion,
  status = "suggested",
  anchorSpots = [],
  onStatusChange,
  onSelectAnchorSpot,
  onClose,
  onSelectLens,
  onReturnToOverview,
}: AtlasMapSuggestionInspectorProps) {
  const { isDragging, dragHandleProps, panelStyle, resetOffset } = useDraggablePanel({
    anchorOrigin: "bottom-right",
  });

  const [quickVisitStatus, setQuickVisitStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [quickVisitMessage, setQuickVisitMessage] = useState<string | null>(null);

  const prevSuggestionIdRef = useRef(suggestion.id);
  useEffect(() => {
    if (prevSuggestionIdRef.current !== suggestion.id) {
      prevSuggestionIdRef.current = suggestion.id;
      resetOffset();
      setQuickVisitStatus("idle");
      setQuickVisitMessage(null);
    }
  }, [suggestion.id, resetOffset]);

  const handleQuickVisit = async () => {
    setQuickVisitStatus("saving");
    setQuickVisitMessage(null);
    try {
      const response = await fetch("/api/quick-visit-spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestion.targetName,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          region: suggestion.anchorSpotIds[0]
            ? anchorSpots.find((s) => s.id === suggestion.anchorSpotIds[0])?.region
            : undefined,
          note: `${suggestion.targetName}を現地訪問済として登録。`,
          consent: "quick_register_visited_spot",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "訪問済み登録に失敗しました。");
      }
      setQuickVisitStatus("done");
      setQuickVisitMessage("訪問済みに登録しました！画面を更新します…");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      setQuickVisitStatus("error");
      setQuickVisitMessage(error instanceof Error ? error.message : "登録に失敗しました。");
    }
  };

  return (
    <aside
      className={styles.mapSuggestionInspector}
      style={{
        ...panelStyle,
        width: "min(380px, calc(100% - 32px))",
        maxHeight: "min(560px, calc(100% - 32px))",
      }}
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 8px" }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>未訪問候補地 · 探求フロンティア</p>
        <span className={styles.suggestionStatus} data-status={status}>
          {suggestionStatusLabels[status]}
        </span>
      </div>

      <h3 style={{ fontSize: "1.15rem", margin: "2px 0 6px" }}>{suggestion.targetName}</h3>
      <p style={{ fontSize: "0.85rem", lineHeight: "1.5", margin: "4px 0 8px" }}>{suggestion.reason}</p>

      {/* 接続元の訪問地（アンカー地点） */}
      {anchorSpots.length > 0 ? (
        <div style={{ margin: "6px 0 10px" }}>
          <small style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.74rem" }}>
            📍 接続元の訪問地:
          </small>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {anchorSpots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                className={styles.suggestionDrawerAnchorChip}
                onClick={() => onSelectAnchorSpot?.(spot.id)}
                title={`${spot.name}（${spot.region}）を地図で見る`}
                style={{ cursor: "pointer", border: "1px solid rgba(213, 180, 109, 0.4)", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem", background: "rgba(213, 180, 109, 0.12)", color: "#f0cf80" }}
              >
                📍 {spot.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ステータス変更（気になる／見送る） */}
      {onStatusChange ? (
        <div className={styles.drawerActions} style={{ margin: "8px 0" }}>
          <button
            type="button"
            data-active={status === "accepted"}
            onClick={() => onStatusChange(status === "accepted" ? "suggested" : "accepted")}
          >
            {status === "accepted" ? "✓ 関心あり" : "気になる"}
          </button>
          <button
            type="button"
            data-active={status === "rejected"}
            onClick={() => onStatusChange(status === "rejected" ? "suggested" : "rejected")}
          >
            {status === "rejected" ? "× 見送り中" : "見送る"}
          </button>
        </div>
      ) : null}

      {/* ワンクリック訪問登録 */}
      <div style={{ margin: "8px 0" }}>
        <button
          type="button"
          className={styles.candidateQuickVisitButton}
          disabled={quickVisitStatus === "saving" || quickVisitStatus === "done"}
          onClick={handleQuickVisit}
        >
          <span>
            {quickVisitStatus === "saving"
              ? "訪問済みに登録中…"
              : quickVisitStatus === "done"
              ? "✓ 登録完了"
              : "✓ 訪問済みにする（ワンクリック登録）"}
          </span>
          <span aria-hidden="true">📍</span>
        </button>
        {quickVisitMessage ? (
          <small
            style={{
              color: quickVisitStatus === "error" ? "var(--accent)" : "var(--gold)",
              marginTop: 4,
              display: "block",
            }}
          >
            {quickVisitMessage}
          </small>
        ) : null}
      </div>

      {suggestion.question ? (
        <div className={styles.mapSuggestionInspectorQuestion} style={{ margin: "10px 0" }}>
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


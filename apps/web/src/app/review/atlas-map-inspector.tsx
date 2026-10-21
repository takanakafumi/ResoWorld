"use client";

import { useEffect, useRef } from "react";
import type { ReviewAtlasConnection, ReviewAtlasSpot } from "@/domain/review/types";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./atlas.module.css";

const connectionKindLabels: Record<ReviewAtlasConnection["connectionKind"], string> = {
  documented: "資料で確認できる関係",
  comparative: "比較して見える共通点",
  interpretive: "解釈としての接続",
  itinerary: "旅行記に残る訪問順",
};

export type AtlasMapInspectorProps = {
  selectedSpot: ReviewAtlasSpot;
  spotConnections: readonly ReviewAtlasConnection[];
  selectedConnectionId?: string;
  onClose: () => void;
  onSelectConnection: (connection: ReviewAtlasConnection) => void;
  onReturnToOverview: () => void;
};

export function AtlasMapInspector({
  selectedSpot,
  spotConnections,
  selectedConnectionId,
  onClose,
  onSelectConnection,
  onReturnToOverview,
}: AtlasMapInspectorProps) {
  const { isDragging, dragHandleProps, panelStyle, resetOffset } = useDraggablePanel({
    anchorOrigin: "bottom-right",
  });

  const prevSpotIdRef = useRef(selectedSpot.id);
  useEffect(() => {
    if (prevSpotIdRef.current !== selectedSpot.id) {
      prevSpotIdRef.current = selectedSpot.id;
      resetOffset();
    }
  }, [selectedSpot.id, resetOffset]);

  return (
    <aside
      className={styles.mapSpotInspector}
      style={panelStyle}
      data-dragging={isDragging}
      aria-label="選択した訪問地点の情報"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={styles.mapSpotInspectorHeader}
        {...dragHandleProps}
        title="ドラッグして移動できます"
      >
        <div className={styles.mapSpotInspectorTitle}>
          <span className={styles.mapSpotInspectorDragHandle} aria-hidden="true">
            ⠿
          </span>
          <span>VISITED SPOT</span>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="地点情報を閉じる"
        >
          ×
        </button>
      </div>
      <p>{selectedSpot.kind} · {selectedSpot.region}</p>
      <h3>{selectedSpot.name}</h3>
      <div className={styles.mapSpotInspectorConnections}>
        <span>この地点からつながるテーマ</span>
        {spotConnections.map((connection) => (
          <button
            type="button"
            key={connection.id}
            data-active={connection.id === selectedConnectionId}
            onClick={() => onSelectConnection(connection)}
          >
            <strong>{connection.title}</strong>
            <span>{connectionKindLabels[connection.connectionKind]}</span>
            <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
          </button>
        ))}
      </div>
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

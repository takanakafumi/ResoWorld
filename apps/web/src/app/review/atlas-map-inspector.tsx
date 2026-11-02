"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { resolveSpotDeityContext } from "@/domain/knowledge/shrine-deity-registry";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./atlas.module.css";

const connectionKindLabels: Record<ReviewAtlasConnection["connectionKind"], string> = {
  documented: "資料で確認できる関係",
  comparative: "比較して見える共通点",
  interpretive: "解釈としての接続",
  itinerary: "旅行記に残る訪問順",
};

const historicalNatureLabels: Record<string, { label: string; color: string; desc: string }> = {
  A_BEDROCK_CONTINUITY: {
    label: "自然基層直結型 (ラベルA)",
    color: "var(--teal, #5bb2d6)",
    desc: "山岳・海洋・磐座など自然地形の古層祭祀が現代まで連続する原初聖域",
  },
  B_HISTORICAL_REORGANIZATION: {
    label: "中世近世再編型 (ラベルB)",
    color: "var(--gold, #d5b46d)",
    desc: "武家権力・神仏習合・江戸期覚書・明治合祀など歴史的再編を経た複合聖域",
  },
  C_FOLK_COMPASSION: {
    label: "民間受容・生活信仰型 (ラベルC)",
    color: "var(--purple, #b794d4)",
    desc: "国家神話の枠外で、庶民の病気平癒・安産・女性生活文化に根ざした信仰地",
  },
};

export type AtlasMapInspectorProps = {
  selectedSpot: ReviewAtlasSpot;
  spotClaims?: ReviewDataset["claims"];
  spotConnections: readonly ReviewAtlasConnection[];
  selectedConnectionId?: string;
  onClose: () => void;
  onSelectConnection: (connection: ReviewAtlasConnection) => void;
  onSelectLens?: (lensId: string, topicId?: string) => void;
  onReturnToOverview: () => void;
};

export function AtlasMapInspector({
  selectedSpot,
  spotClaims = [],
  spotConnections,
  selectedConnectionId,
  onClose,
  onSelectConnection,
  onSelectLens,
  onReturnToOverview,
}: AtlasMapInspectorProps) {
  const { isDragging, dragHandleProps, panelStyle, resetOffset } = useDraggablePanel({
    anchorOrigin: "bottom-right",
  });

  const [profileExpanded, setProfileExpanded] = useState(false);

  const prevSpotIdRef = useRef(selectedSpot.id);
  useEffect(() => {
    if (prevSpotIdRef.current !== selectedSpot.id) {
      prevSpotIdRef.current = selectedSpot.id;
      resetOffset();
      setProfileExpanded(false);
    }
  }, [selectedSpot.id, resetOffset]);

  const deityContext = useMemo(
    () => resolveSpotDeityContext(selectedSpot),
    [selectedSpot],
  );

  const stratProfile = useMemo(
    () => resolveSpotStratigraphyProfile(selectedSpot),
    [selectedSpot],
  );

  const portals = useMemo(
    () => resolveCrossTopicPortals(selectedSpot),
    [selectedSpot],
  );

  const natureBadge = stratProfile?.historicalNature
    ? historicalNatureLabels[stratProfile.historicalNature]
    : undefined;

  return (
    <aside
      className={styles.mapSpotInspector}
      style={{
        ...panelStyle,
        width: "min(380px, calc(100% - 32px))",
        maxHeight: "min(560px, calc(100% - 32px))",
      }}
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
          <span>VISITED SPOT · 訪問地点</span>
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
      <h3 style={{ fontSize: "1.15rem", margin: "2px 0 8px" }}>{selectedSpot.name}</h3>

      {natureBadge ? (
        <div
          style={{
            display: "inline-block",
            fontSize: "0.72rem",
            padding: "2px 8px",
            borderRadius: "4px",
            border: `1px solid ${natureBadge.color}`,
            color: natureBadge.color,
            background: "rgba(0, 0, 0, 0.25)",
            marginBottom: "8px",
          }}
          title={natureBadge.desc}
        >
          {natureBadge.label}
        </div>
      ) : null}

      {/* 主祭神・神格情報 */}
      {deityContext ? (
        <div style={{ margin: "6px 0 10px", padding: "8px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px", border: "1px solid var(--line)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>主祭神・神格</div>
          <p style={{ margin: "0 0 4px", fontSize: "0.82rem", color: "var(--ink)" }}>{deityContext.currentDeities}</p>
          {deityContext.ancientBedrockOrLegend ? (
            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--teal, #68c7bd)" }}>
              <span style={{ fontWeight: 600 }}>古層・伝承:</span> {deityContext.ancientBedrockOrLegend}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* この地点を照射するLENS / TOPIC ポータル */}
      {portals.length > 0 && onSelectLens ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>この地点を照射するLENS / TOPIC</span>
          {portals.map((p) => (
            <button
              key={p.topicId}
              type="button"
              className={styles.mapSuggestionInspectorLensBtn}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelectLens(p.lensId, p.topicId)}
              title={`${p.packLabel}の観点で見る`}
            >
              <span>{p.lensLabel}: {p.topicLabel}</span>
              <span>開く →</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* 7項目地層学プロファイル概要 */}
      {stratProfile ? (
        <div style={{ margin: "8px 0" }}>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setProfileExpanded(!profileExpanded)}
            style={{
              width: "100%",
              background: "rgba(104, 199, 189, 0.05)",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              padding: "6px 8px",
              color: "var(--muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>📜 聖地の7項目分解プロファイル</span>
            <span>{profileExpanded ? "▲ 閉じる" : "▼ 開く"}</span>
          </button>
          {profileExpanded ? (
            <div style={{ marginTop: "6px", padding: "8px", background: "rgba(0, 0, 0, 0.2)", borderRadius: "6px", fontSize: "0.75rem", display: "grid", gap: "6px" }}>
              <div><strong style={{ color: "var(--gold)" }}>創建伝承:</strong> {stratProfile.claimedOrigin.statement}</div>
              <div><strong style={{ color: "var(--gold)" }}>最古確実記録:</strong> {stratProfile.oldestAttestedRecord.statement} ({stratProfile.oldestAttestedRecord.sourceTitle})</div>
              {stratProfile.reorganizationHistory.length > 0 ? (
                <div>
                  <strong style={{ color: "var(--gold)" }}>再編史:</strong>
                  <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
                    {stratProfile.reorganizationHistory.slice(0, 2).map((r, i) => (
                      <li key={i}>{r.era}: {r.description}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div><strong style={{ color: "var(--gold)" }}>考古・自然実態:</strong> {stratProfile.archaeologyAndNaturalTarget.statement}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* この地点からつながるテーマ */}
      {spotConnections.length > 0 ? (
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
      ) : null}

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

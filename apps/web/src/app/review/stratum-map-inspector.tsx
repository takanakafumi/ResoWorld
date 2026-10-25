"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
import { resolveSpotDeityContext } from "@/domain/knowledge/shrine-deity-registry";
import type { SpotStratumMembership, StratumResolutionContext } from "@/domain/review/stratum-types";
import { useDraggablePanel } from "./use-draggable-panel";
import { StratigraphicColumnCard, StratumIndicatorDots } from "./stratigraphic-column-card";
import { StratigraphyProfileCard } from "./stratigraphy-profile-card";
import styles from "./atlas.module.css";

export type StratumMapInspectorProps = {
  selectedSpot: ReviewAtlasSpot;
  selectedSpotClaims?: ReviewDataset["claims"];
  membership?: SpotStratumMembership;
  stratumContext?: StratumResolutionContext;
  onClose: () => void;
};

/**
 * STRATUM モード用の地図フローティングインスペクター。
 * 右上に整列し、地図上にはみ出さないように配置。
 * 階層情報（時代地層柱状図）だけでなく、主祭神・古層神格・神社由緒情報も同時に表示する。
 */
export function StratumMapInspector({
  selectedSpot,
  selectedSpotClaims = [],
  membership,
  stratumContext,
  onClose,
}: StratumMapInspectorProps) {
  const { isDragging, dragHandleProps, panelStyle, resetOffset } = useDraggablePanel({
    anchorOrigin: "top-right",
  });

  const prevSpotIdRef = useRef(selectedSpot.id);
  useEffect(() => {
    if (prevSpotIdRef.current !== selectedSpot.id) {
      prevSpotIdRef.current = selectedSpot.id;
      resetOffset();
    }
  }, [selectedSpot.id, resetOffset]);

  const profile = resolveSpotStratigraphyProfile(selectedSpot);
  const deityContext = useMemo(
    () => resolveSpotDeityContext(selectedSpot),
    [selectedSpot],
  );
  const layerCount = membership?.strataCount ?? 0;

  return (
    <aside
      className={styles.mapSpotInspector}
      style={{
        ...panelStyle,
        top: 12,
        right: 12,
        bottom: "auto",
        width: "min(440px, calc(100vw - 24px))",
        maxWidth: 460,
        maxHeight: "calc(100% - 24px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      data-dragging={isDragging}
      aria-label="選択した地点の時代地層情報"
      onClick={(event) => event.stopPropagation()}
    >
      {/* ドラッグヘッダー（右上に揃え、ドラッグ可能） */}
      <div
        className={styles.mapSpotInspectorHeader}
        {...dragHandleProps}
        title="ドラッグして移動できます"
        style={{ flexShrink: 0 }}
      >
        <div className={styles.mapSpotInspectorTitle}>
          <span className={styles.mapSpotInspectorDragHandle} aria-hidden="true">
            ⠿
          </span>
          <span>STRATIGRAPHY · 時代地層柱状図</span>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="地層インスペクターを閉じる"
        >
          ×
        </button>
      </div>

      {/* スポット基本情報バー */}
      <div
        style={{
          padding: "6px 14px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
          flexShrink: 0,
          borderBottom: "1px solid rgba(213, 180, 109, 0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: "15px", color: "#fff", fontWeight: 700 }}>
            {selectedSpot.name}
          </h3>
          <span className={styles.spotKindBadge}>{selectedSpot.kind}</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>{selectedSpot.region}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {layerCount > 0 ? (
            <span className={styles.stratumMultiBadge}>
              {layerCount >= 5 ? "5層フル累重" : `${layerCount}層累重`}
            </span>
          ) : null}
          {membership?.details ? (
            <StratumIndicatorDots details={membership.details} />
          ) : null}
        </div>
      </div>

      {/* スクロールコンテンツ */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* 神社・主祭神・由緒情報（deityContext） */}
        {deityContext ? (
          <div
            style={{
              background: "rgba(18, 32, 32, 0.85)",
              border: "1px solid rgba(213, 180, 109, 0.35)",
              borderRadius: 6,
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}>
                ⛩️ 主祭神:
              </span>
              <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>
                {deityContext.currentDeities}
              </span>
            </div>
            {deityContext.ancientBedrockOrLegend ? (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "11px",
                  lineHeight: 1.45,
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                {deityContext.ancientBedrockOrLegend}
              </p>
            ) : null}
            {deityContext.sourceNote ? (
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>
                典拠: {deityContext.sourceNote}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 時代地層柱状図 */}
        <StratigraphicColumnCard
          spot={selectedSpot}
          stratumContext={stratumContext}
          compact={true}
        />

        {/* 聖地7項目（該当プロファイルがある場合） */}
        {profile ? (
          <details
            style={{
              background: "rgba(14, 26, 26, 0.7)",
              border: "1px solid rgba(213, 180, 109, 0.3)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: "var(--gold)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              🏛️ 聖地7項目・祭祀史プロファイルを表示
            </summary>
            <div style={{ marginTop: 8 }}>
              <StratigraphyProfileCard profile={profile} />
            </div>
          </details>
        ) : null}

        {/* 現地観察Claim */}
        {selectedSpotClaims.length > 0 ? (
          <details
            style={{
              background: "rgba(14, 26, 26, 0.7)",
              border: "1px solid rgba(213, 180, 109, 0.2)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: "var(--aqua)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              📖 現地観察記録（Claim {selectedSpotClaims.length}件）
            </summary>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: "11.5px", color: "rgba(255,255,255,0.8)" }}>
              {selectedSpotClaims.map((claim) => (
                <li key={claim.id} style={{ marginBottom: 6 }}>
                  {claim.statement}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </aside>
  );
}

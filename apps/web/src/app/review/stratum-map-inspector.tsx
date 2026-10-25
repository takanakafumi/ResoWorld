"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
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
 * 右パネルのリストから地点を次々に選択しても、リストから画面遷移せず、
 * 地図上でコンパクトに時代地層柱状図・聖地7項目・Claimを確認できるようにする。
 */
export function StratumMapInspector({
  selectedSpot,
  selectedSpotClaims = [],
  membership,
  stratumContext,
  onClose,
}: StratumMapInspectorProps) {
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

  const profile = resolveSpotStratigraphyProfile(selectedSpot);
  const layerCount = membership?.strataCount ?? 0;

  return (
    <aside
      className={styles.mapSpotInspector}
      style={{
        ...panelStyle,
        maxWidth: 420,
        maxHeight: "clamp(340px, 65vh, 600px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      data-dragging={isDragging}
      aria-label="選択した地点の時代地層情報"
      onClick={(event) => event.stopPropagation()}
    >
      {/* ドラッグヘッダー */}
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
          <span>STRATIGRAPHY · 時代地層</span>
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
      <div style={{ padding: "0 14px", flexShrink: 0 }}>
        <p style={{ margin: "6px 0 2px" }}>
          {selectedSpot.kind} · {selectedSpot.region}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 8px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", color: "#fff" }}>{selectedSpot.name}</h3>
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
          padding: "0 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
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

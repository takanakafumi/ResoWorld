"use client";

import { type CSSProperties, memo } from "react";
import type { LensSpatialOverlay } from "@/domain/lens-packs/schema";
import type { useHistoricalOverlay } from "./use-historical-overlay";
import styles from "./atlas.module.css";

type HistoricalOverlayState = ReturnType<typeof useHistoricalOverlay>;

export const MapHistoricalOverlayLayer = memo(function MapHistoricalOverlayLayer({
  historicalOverlay,
  spatialOverlay,
  selectedLensLabel,
  visible,
  labelsVisible,
  legendExpanded,
  onToggleVisible,
  onToggleLabelsVisible,
  onToggleLegendExpanded,
}: {
  historicalOverlay: HistoricalOverlayState;
  spatialOverlay?: LensSpatialOverlay;
  selectedLensLabel?: string;
  visible: boolean;
  labelsVisible: boolean;
  legendExpanded: boolean;
  onToggleVisible: () => void;
  onToggleLabelsVisible: () => void;
  onToggleLegendExpanded: () => void;
}) {
  return (
    <>
      {historicalOverlay.isActive ? (
        <svg
          className={styles.mapHistoricalOverlaySvg}
          aria-label="古地理・回廊の空間描画"
        >
          {/* 1. 防衛圏・勢力圏・条坊領域ポリゴン */}
          {historicalOverlay.projection.polygons.map((poly) => (
            <polygon
              key={poly.id}
              points={poly.points}
              className={styles.historicalOverlayPolygon}
              data-category={poly.category}
              style={{ "--overlay-color": poly.color } as CSSProperties}
            />
          ))}

          {/* 2. 水城・外濠・東西官道・視軸ライン */}
          {historicalOverlay.projection.lines.map((line) => (
            <g
              key={line.id}
              className={styles.historicalOverlayLineGroup}
              data-category={line.category}
              data-dashed={line.dashed}
            >
              {line.segments.map((pts, idx) => {
                const segKey = `${line.id}:${idx}`;
                const scale = historicalOverlay.projection.strokeScale;
                if (line.category === "moat") {
                  return (
                    <g key={segKey}>
                      <polyline
                        points={pts}
                        className={styles.historicalOverlayMoatGlow}
                        style={{ strokeWidth: 7 * scale }}
                      />
                      <polyline
                        points={pts}
                        className={styles.historicalOverlayMoatCore}
                        style={{ strokeWidth: 2.2 * scale }}
                      />
                    </g>
                  );
                }
                if (line.category === "barrier") {
                  return (
                    <g key={segKey}>
                      <polyline
                        points={pts}
                        className={styles.historicalOverlayBarrierShadow}
                        style={{ strokeWidth: 13 * scale }}
                      />
                      <polyline
                        points={pts}
                        className={styles.historicalOverlayBarrierRampart}
                        style={{ stroke: line.color, strokeWidth: 6.5 * scale }}
                        strokeDasharray={line.dashed ? "10 6" : undefined}
                      />
                      {scale >= 0.75 ? (
                        <polyline
                          points={pts}
                          className={styles.historicalOverlayBarrierTicks}
                          style={{ strokeWidth: 11 * scale }}
                        />
                      ) : null}
                    </g>
                  );
                }
                const isPrimary = line.category === "route-primary";
                return (
                  <g key={segKey}>
                    <polyline
                      points={pts}
                      className={styles.historicalOverlayRouteCasing}
                      style={{ strokeWidth: (isPrimary ? 10 : 7) * scale }}
                    />
                    <polyline
                      points={pts}
                      className={styles.historicalOverlayRouteGlow}
                      style={{
                        stroke: line.color,
                        strokeWidth: (isPrimary ? 14 : 9) * scale,
                      }}
                    />
                    <polyline
                      points={pts}
                      className={styles.historicalOverlayRouteMain}
                      style={{
                        stroke: line.color,
                        strokeWidth: (isPrimary ? 4.8 : 3.2) * scale,
                      }}
                      strokeDasharray={line.dashed ? "9 6" : undefined}
                    />
                    {isPrimary && !line.dashed && historicalOverlay.projection.showCenterline ? (
                      <polyline
                        points={pts}
                        className={styles.historicalOverlayRouteCenterline}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
          ))}

          {/* 3. 水城西門・水城東門・朱雀門・関門ゲート記号 */}
          {historicalOverlay.projection.gates.map((gate) => (
            <g
              key={gate.id}
              className={styles.historicalOverlayGate}
              transform={`translate(${gate.x}, ${gate.y})`}
            >
              <circle
                r={9}
                className={styles.historicalOverlayGateHalo}
                style={{ stroke: gate.color }}
              />
              <rect
                x={-5.5}
                y={-5.5}
                width={11}
                height={11}
                rx={2}
                className={styles.historicalOverlayGateBox}
                style={{ stroke: gate.color }}
              />
              {gate.showLabel ? (
                <text
                  y={-13}
                  className={styles.historicalOverlayGateText}
                  style={{ fill: gate.color }}
                >
                  {gate.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      ) : null}

      {historicalOverlay.hasOverlay ? (
        <div
          className={styles.mapHistoricalOverlayCard}
          data-collapsed={!legendExpanded}
          data-overlay-visible={visible}
          aria-label="LENS空間構造レイヤー凡例"
        >
          <div className={styles.mapHistoricalOverlayCardHeader}>
            <span className={styles.mapHistoricalOverlayCardBadge}>🧭 空間構造</span>
            <button
              type="button"
              className={styles.mapHistoricalOverlayToggleBtn}
              data-active={visible}
              onClick={onToggleVisible}
              aria-pressed={visible}
              title="官道・防壁・領域オーバーレイの表示/非表示を切り替えます"
            >
              構造 {visible ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              className={styles.mapHistoricalOverlayToggleBtn}
              data-active={visible && labelsVisible}
              disabled={!visible}
              onClick={onToggleLabelsVisible}
              aria-pressed={labelsVisible}
              title="地図上の空間構造注記ラベルの表示/非表示を切り替えます"
            >
              注記 {visible && labelsVisible ? "ON" : "OFF"}
            </button>
            {spatialOverlay?.legend && spatialOverlay.legend.length > 0 ? (
              <button
                type="button"
                className={styles.mapHistoricalOverlayExpandBtn}
                onClick={onToggleLegendExpanded}
                aria-expanded={legendExpanded}
                title={legendExpanded ? "凡例をたたむ" : "凡例を表示"}
              >
                凡例 {legendExpanded ? "▴" : "▾"}
              </button>
            ) : null}
          </div>
          {legendExpanded && visible && spatialOverlay?.legend && spatialOverlay.legend.length > 0 ? (
            <div className={styles.mapHistoricalOverlayLegendBody}>
              {selectedLensLabel ? (
                <div className={styles.mapHistoricalOverlayCardTitle}>{selectedLensLabel}</div>
              ) : null}
              <div className={styles.mapHistoricalOverlayLegendList}>
                {spatialOverlay.legend.map((item) => (
                  <span key={item.label} className={styles.mapHistoricalOverlayLegendItem}>
                    <i
                      className={styles.mapHistoricalOverlaySwatch}
                      data-polygon={Boolean(item.isPolygon)}
                      data-dashed={Boolean(item.dashed)}
                      style={{ "--swatch-color": item.color } as CSSProperties}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
});

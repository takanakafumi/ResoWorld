"use client";

import { type RefObject, useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { projectAreaZoneScreenCircles } from "@/domain/map/area-zones";
import type { MapAreaZoneDescriptor } from "@/domain/map/scene";

/**
 * 広域地域（spatialGranularity === "area"）の代表座標＋半径（radiusKm）を
 * 専用 2D Canvas オーバーレイへ描画し、MapLibre の毎フレーム `render` イベントに同期するフック。
 *
 * - Web Worker 依存を完全に排除（Next.js Turbopack 静的エクスポートでも確実に描画）。
 * - パン・ズーム・ピンチ操作中の React 再レンダリングはゼロ（MapLibre `render` に直接同期）。
 * - iOS Safari / Android Chrome で SVG `<circle>` + `filter: drop-shadow` が合成落ちする不具合を回避。
 * - モバイルのタブ切替（地図 ⇄ 知識レンズ）時も ResizeObserver により即時 Retina 再描画される。
 */
export function useAreaZoneOverlay({
  map,
  mapRevision,
  canvasRef,
  areaZones,
  visible,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  areaZones: readonly MapAreaZoneDescriptor[];
  visible: boolean;
}) {
  const stateRef = useRef({ areaZones, visible });
  stateRef.current = { areaZones, visible };

  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!mapRevision || !map) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const { areaZones: currentZones, visible: isVisible } = stateRef.current;
      if (!isVisible || currentZones.length === 0) return;

      const circles = projectAreaZoneScreenCircles(currentZones, map, { minRadiusPx: 26 });

      for (const circle of circles) {
        const { cx, cy, radiusPx, isActive, isExplored } = circle;
        if (
          cx + radiusPx < -24 ||
          cx - radiusPx > width + 24 ||
          cy + radiusPx < -24 ||
          cy - radiusPx > height + 24
        ) {
          continue;
        }

        // 1. Soft radial translucent fill (high-contrast against both OSM tiles and dark basemap)
        const gradient = ctx.createRadialGradient(cx, cy, radiusPx * 0.1, cx, cy, radiusPx);
        if (isActive) {
          gradient.addColorStop(0, "rgba(250, 204, 21, 0.30)");
          gradient.addColorStop(1, "rgba(250, 204, 21, 0.12)");
        } else if (isExplored) {
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.26)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.10)");
        } else {
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.24)");
          gradient.addColorStop(1, "rgba(56, 189, 248, 0.08)");
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 2. Crisp perimeter ring
        if (isActive) {
          ctx.strokeStyle = "rgba(254, 240, 138, 0.96)";
          ctx.lineWidth = 2.8;
          ctx.setLineDash([]);
        } else if (isExplored) {
          ctx.strokeStyle = "rgba(110, 231, 183, 0.92)";
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 4]);
        } else {
          ctx.strokeStyle = "rgba(125, 211, 252, 0.90)";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
        }
        ctx.stroke();

        // 3. Subtle geographic center anchor dot when zoomed in so large zones remain anchored
        if (radiusPx >= 48) {
          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = isActive
            ? "rgba(254, 240, 138, 0.9)"
            : isExplored
              ? "rgba(110, 231, 183, 0.85)"
              : "rgba(125, 211, 252, 0.85)";
          ctx.fill();
        }
        ctx.restore();
      }
    };

    drawRef.current = draw;
    draw();

    map.on("render", draw);
    map.on("resize", draw);

    const canvas = canvasRef.current;
    const resizeObserver =
      canvas && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => draw())
        : null;
    if (canvas && resizeObserver) {
      resizeObserver.observe(canvas);
    }

    return () => {
      map.off("render", draw);
      map.off("resize", draw);
      resizeObserver?.disconnect();
    };
  }, [canvasRef, map, mapRevision]);

  // Repaint immediately when areaZones or visibility toggles (even while camera is stationary)
  useEffect(() => {
    drawRef.current();
  }, [areaZones, visible]);

  return {
    activeAreaZoneCount: visible ? areaZones.filter((z) => z.radiusKm > 0).length : 0,
  };
}

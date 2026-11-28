"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  findNearestGhostDotAtPoint,
  projectGhostDotsToScreen,
  type GhostDotDescriptor,
  type ProjectedGhostDot,
} from "@/domain/map/ghost-dots";

/**
 * 背景ゴーストドット（LENS トピック外の約180地点）を専用 Retina 2D Canvas へ一括描画するフック（Issue #54 Phase 3）。
 *
 * - HTML DOM マーカー数を約200個 → トピック関連の 15〜30 個へ約 1/10 削減。
 * - MapLibre の `render` + `resize` に直接同期し、パン・ズーム中の React 再レンダリングはゼロ。
 * - `findGhostDotAtPoint` により地図クリック・ポインタホバー時のヒット判定（14px半径）を提供。
 */
export function useGhostDotOverlay({
  map,
  mapRevision,
  canvasRef,
  ghostDotsRef,
  hoveredIdsSetRef,
  isMapMovingRef,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  ghostDotsRef: RefObject<readonly GhostDotDescriptor[]>;
  hoveredIdsSetRef: RefObject<Set<string>>;
  isMapMovingRef: RefObject<boolean>;
}) {
  const projectedDotsRef = useRef<ProjectedGhostDot[]>([]);
  const pointerHoveredIdRef = useRef<string | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const repaint = useCallback(() => {
    drawRef.current();
  }, []);

  const findGhostDotAtPoint = useCallback(
    (point: { x: number; y: number }, hitRadiusPx = 14): ProjectedGhostDot | null => {
      const dots = ghostDotsRef.current;
      if (!dots.length || !map) return null;
      // Ensure we hit-test against fresh screen coordinates even if called right after camera settles
      const projected =
        projectedDotsRef.current.length === dots.length
          ? projectedDotsRef.current
          : projectGhostDotsToScreen(
              dots,
              map,
              hoveredIdsSetRef.current,
              pointerHoveredIdRef.current,
            );
      return findNearestGhostDotAtPoint(projected, point, hitRadiusPx);
    },
    [ghostDotsRef, hoveredIdsSetRef, map],
  );

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

      const dots = ghostDotsRef.current;
      if (!dots || dots.length === 0) {
        projectedDotsRef.current = [];
        return;
      }

      const projected = projectGhostDotsToScreen(
        dots,
        map,
        hoveredIdsSetRef.current,
        pointerHoveredIdRef.current,
      );
      projectedDotsRef.current = projected;

      // Pass 1: Draw all non-hovered ghost dots in minimal canvas state changes
      ctx.fillStyle = "rgba(90, 110, 114, 0.52)";
      ctx.strokeStyle = "rgba(7, 24, 24, 0.88)";
      ctx.lineWidth = 1.5;

      const hoveredDots: ProjectedGhostDot[] = [];
      for (const dot of projected) {
        if (dot.x < -16 || dot.x > width + 16 || dot.y < -16 || dot.y > height + 16) {
          continue;
        }
        if (dot.isHovered) {
          hoveredDots.push(dot);
          continue;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Pass 2: Draw hovered ghost dots on top with crisp gold highlight ring
      for (const dot of hoveredDots) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(213, 180, 109, 0.34)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = "#d5b46d";
        ctx.strokeStyle = "#071818";
        ctx.lineWidth = 1.8;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    };

    const handleMouseMove = (event: { point: { x: number; y: number } }) => {
      if (isMapMovingRef.current || map.isMoving()) return;
      const dots = ghostDotsRef.current;
      if (!dots || dots.length === 0) {
        if (pointerHoveredIdRef.current !== null) {
          pointerHoveredIdRef.current = null;
          map.getCanvas().style.cursor = "";
        }
        return;
      }

      const hit = findNearestGhostDotAtPoint(projectedDotsRef.current, event.point, 12);
      const nextId = hit ? hit.id : null;
      if (nextId !== pointerHoveredIdRef.current) {
        pointerHoveredIdRef.current = nextId;
        map.getCanvas().style.cursor = nextId ? "pointer" : "";
        draw();
      }
    };

    const handleMouseLeave = () => {
      if (pointerHoveredIdRef.current !== null) {
        pointerHoveredIdRef.current = null;
        map.getCanvas().style.cursor = "";
        draw();
      }
    };

    drawRef.current = draw;
    draw();

    map.on("render", draw);
    map.on("resize", draw);
    map.on("mousemove", handleMouseMove);
    map.getCanvasContainer().addEventListener("mouseleave", handleMouseLeave);

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
      map.off("mousemove", handleMouseMove);
      map.getCanvasContainer().removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver?.disconnect();
      projectedDotsRef.current = [];
      pointerHoveredIdRef.current = null;
    };
  }, [canvasRef, ghostDotsRef, hoveredIdsSetRef, isMapMovingRef, map, mapRevision]);

  return {
    repaint,
    findGhostDotAtPoint,
  };
}

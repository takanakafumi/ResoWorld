"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  findNearestGhostDotAtPoint,
  projectGhostDotsToScreen,
  type GhostDotDescriptor,
  type ProjectedGhostDot,
} from "@/domain/map/ghost-dots";

function drawCanvasTooltipPill(
  ctx: CanvasRenderingContext2D,
  dot: ProjectedGhostDot,
  canvasWidth: number,
) {
  const text = dot.label;
  if (!text) return;

  ctx.save();
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif';
  const metrics = ctx.measureText(text);
  const padX = 10;
  const pillHeight = 24;
  const pillWidth = Math.min(Math.ceil(metrics.width) + padX * 2 + 12, Math.max(120, canvasWidth - 16));

  let x = dot.x - pillWidth / 2;
  x = Math.max(8, Math.min(x, canvasWidth - pillWidth - 8));
  const y = Math.max(8, dot.y - 36);
  const radius = 12;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + pillWidth - radius, y);
  ctx.quadraticCurveTo(x + pillWidth, y, x + pillWidth, y + radius);
  ctx.lineTo(x + pillWidth, y + pillHeight - radius);
  ctx.quadraticCurveTo(x + pillWidth, y + pillHeight, x + pillWidth - radius, y + pillHeight);
  ctx.lineTo(x + radius, y + pillHeight);
  ctx.quadraticCurveTo(x, y + pillHeight, x, y + pillHeight - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fillStyle = "rgba(7, 24, 24, 0.94)";
  ctx.fill();
  ctx.strokeStyle = dot.variant === "overview" ? dot.color : "#d5b46d";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Category color indicator dot inside tooltip
  ctx.beginPath();
  ctx.arc(x + 11, y + pillHeight / 2, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = dot.variant === "overview" ? dot.color : "#d5b46d";
  ctx.fill();

  ctx.fillStyle = "#f2f5f3";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 19, y + pillHeight / 2 + 0.5, pillWidth - 26);
  ctx.restore();
}

/**
 * LENS 背景ゴーストドットおよび全体俯瞰（OVERVIEW）広域ズーム・画面外スポットを
 * 専用 Retina 2D Canvas へ一括描画するフック（Issue #54・#55）。
 *
 * - LENS モード: トピック外ゴースト地点を控えめなスレートドットで描画。
 * - OVERVIEW モード: 広域ズーム時は全203地点を凡例と同一の地層/性格カラーで鮮明に描画し、
 *   ホバー時は Canvas 上に地名ピルを即時表示（React 再レンダリング・DOM 生成ともにゼロ）。
 * - クリック時は 14px ヒット半径で最寄り地点を判定し詳細インスペクタへ直結。
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

      const hoveredDots: ProjectedGhostDot[] = [];
      const overviewDots: ProjectedGhostDot[] = [];

      // Pass 1: Muted LENS background ghost dots (single shared fill/stroke state)
      ctx.fillStyle = "rgba(90, 110, 114, 0.52)";
      ctx.strokeStyle = "rgba(7, 24, 24, 0.88)";
      ctx.lineWidth = 1.5;

      for (const dot of projected) {
        if (dot.x < -16 || dot.x > width + 16 || dot.y < -16 || dot.y > height + 16) {
          continue;
        }
        if (dot.isHovered) {
          hoveredDots.push(dot);
          continue;
        }
        if (dot.variant === "overview") {
          overviewDots.push(dot);
          continue;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Pass 2: OVERVIEW wide-zoom color-coded category dots
      if (overviewDots.length > 0) {
        ctx.strokeStyle = "rgba(7, 24, 24, 0.92)";
        ctx.lineWidth = 1.5;
        for (const dot of overviewDots) {
          if ((dot.stratumCount ?? 0) >= 2) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 7.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(213, 180, 109, 0.24)";
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.fill();
          ctx.stroke();
        }
      }

      // Pass 3: Hovered dots + crisp zero-DOM Canvas tooltip pill
      for (const dot of hoveredDots) {
        const accent = dot.variant === "overview" ? dot.color : "#d5b46d";
        ctx.save();
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 10.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(213, 180, 109, 0.34)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.strokeStyle = "#071818";
        ctx.lineWidth = 1.8;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (dot.isPointerHovered || dot.variant === "overview") {
          drawCanvasTooltipPill(ctx, dot, width);
        }
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

      const hit = findNearestGhostDotAtPoint(projectedDotsRef.current, event.point, 13);
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

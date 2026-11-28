import type { MapMarkerItem } from "./markers";

export type GhostDotDescriptor = {
  id: string;
  targetId: string;
  label: string;
  latitude: number;
  longitude: number;
  color: string;
};

export type ProjectedGhostDot = GhostDotDescriptor & {
  x: number;
  y: number;
  isHovered: boolean;
};

export type GhostDotProjector = {
  project: (lngLat: [number, number]) => { x: number; y: number };
};

/**
 * 統合マーカー一覧を「HTML DOM マーカーとして描画するもの」と
 * 「軽量 2D Canvas オーバーレイへオフロードする背景ゴーストドット」へ分離する（Issue #54 Phase 3）。
 *
 * - LENS 選択時にトピック外の約180地点（isGhost && !isActive）を Canvas 側へ逃がし、
 *   MapLibre が毎フレーム transform 計算する DOM 要素数を 15〜30 個へ約 1/10 削減する。
 * - クリック選択された地点（isActive === true）は単一 DOM マーカーとして即座に昇格表示する。
 */
export function partitionUnifiedMarkers(
  markers: readonly MapMarkerItem[],
): {
  domMarkers: MapMarkerItem[];
  ghostDots: GhostDotDescriptor[];
} {
  const domMarkers: MapMarkerItem[] = [];
  const ghostDots: GhostDotDescriptor[] = [];

  for (const marker of markers) {
    if (marker.isVisible && marker.isGhost && !marker.isActive) {
      ghostDots.push({
        id: marker.id,
        targetId: marker.targetId,
        label: marker.label,
        latitude: marker.latitude,
        longitude: marker.longitude,
        color: marker.color,
      });
    } else {
      domMarkers.push(marker);
    }
  }

  return { domMarkers, ghostDots };
}

export function projectGhostDotsToScreen(
  ghostDots: readonly GhostDotDescriptor[],
  projector: GhostDotProjector,
  hoveredIds?: ReadonlySet<string>,
  pointerHoveredId?: string | null,
): ProjectedGhostDot[] {
  const result: ProjectedGhostDot[] = [];
  for (const dot of ghostDots) {
    const pt = projector.project([dot.longitude, dot.latitude]);
    if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) continue;
    const isHovered =
      pointerHoveredId === dot.id ||
      Boolean(
        hoveredIds &&
          (hoveredIds.has(dot.id) ||
            hoveredIds.has(dot.targetId) ||
            hoveredIds.has(dot.label)),
      );
    result.push({
      ...dot,
      x: pt.x,
      y: pt.y,
      isHovered,
    });
  }
  return result;
}

/**
 * クリック／ホバー座標からヒット半径内の最寄りゴーストドットを返す（スクリーン空間距離判定）。
 */
export function findNearestGhostDotAtPoint(
  projectedDots: readonly ProjectedGhostDot[],
  point: { x: number; y: number },
  hitRadiusPx = 14,
): ProjectedGhostDot | null {
  const maxDistSq = hitRadiusPx * hitRadiusPx;
  let best: ProjectedGhostDot | null = null;
  let bestDistSq = maxDistSq;

  for (const dot of projectedDots) {
    const dx = dot.x - point.x;
    const dy = dot.y - point.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= bestDistSq) {
      bestDistSq = distSq;
      best = dot;
    }
  }

  return best;
}

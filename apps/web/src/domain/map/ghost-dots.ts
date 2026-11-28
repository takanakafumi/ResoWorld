import type { MapMarkerItem } from "./markers";

export const OVERVIEW_PILL_ZOOM_THRESHOLD = 10.2;

export type CanvasDotVariant = "ghost" | "overview";

export type MapViewportBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type MarkerPartitionOptions = {
  /**
   * 広域モード（OVERVIEW / STRATUM 等で topicScope が未設定のとき）に true。
   * - zoom < OVERVIEW_PILL_ZOOM_THRESHOLD の広域俯瞰時は未選択・非強調の既訪地点を
   *   カテゴリ色の Canvas ドットとして一括描画し、HTML DOM マーカー数を激減させる。
   * - zoom >= OVERVIEW_PILL_ZOOM_THRESHOLD の近接ズーム時は画面外（他県など）の
   *   オフスクリーン地点のみ Canvas 側へ逃がし、画面内の 10〜35 地点だけをリッチな HTML ピンにする。
   */
  isOverviewMode?: boolean;
  zoom?: number;
  bounds?: MapViewportBounds | null;
  pillZoomThreshold?: number;
  viewportPaddingRatio?: number;
};

export type GhostDotDescriptor = {
  id: string;
  targetId: string;
  label: string;
  latitude: number;
  longitude: number;
  color: string;
  variant: CanvasDotVariant;
  stratumCount?: number;
};

export type ProjectedGhostDot = GhostDotDescriptor & {
  x: number;
  y: number;
  isHovered: boolean;
  isPointerHovered: boolean;
};

export type GhostDotProjector = {
  project: (lngLat: [number, number]) => { x: number; y: number };
};

export function isCoordinateInPaddedBounds(
  latitude: number,
  longitude: number,
  bounds: MapViewportBounds,
  paddingRatio = 0.2,
): boolean {
  const latSpan = Math.max(bounds.north - bounds.south, 0.01);
  const lngSpan = Math.max(bounds.east - bounds.west, 0.01);
  const latPad = latSpan * paddingRatio;
  const lngPad = lngSpan * paddingRatio;
  return (
    latitude >= bounds.south - latPad &&
    latitude <= bounds.north + latPad &&
    longitude >= bounds.west - lngPad &&
    longitude <= bounds.east + lngPad
  );
}

/**
 * 統合マーカー一覧を「HTML DOM マーカーとして描画するもの」と
 * 「軽量 2D Canvas オーバーレイへオフロードするドット」へ分離する（Issue #54・#55）。
 *
 * 1. LENS モード: トピック外の非選択ゴースト地点（isGhost && !isActive）を muted Canvas ドットへ。
 * 2. OVERVIEW / 広域モード:
 *    - 広域ズーム（zoom < 10.2）時は未選択・非強調・非産地強調の既訪地点をカテゴリ色 Canvas ドットへ。
 *    - 近接ズーム（zoom >= 10.2）時はビューポート外（＋20% 余白外）のオフスクリーン既訪地点を Canvas 側へ。
 *    - 選択中（isActive）・強調中（isHighlighted）・探索候補（suggestion）は常にリッチな DOM ピンを維持。
 */
export function partitionUnifiedMarkers(
  markers: readonly MapMarkerItem[],
  options?: MarkerPartitionOptions,
): {
  domMarkers: MapMarkerItem[];
  ghostDots: GhostDotDescriptor[];
} {
  const domMarkers: MapMarkerItem[] = [];
  const ghostDots: GhostDotDescriptor[] = [];

  const isOverviewMode = Boolean(options?.isOverviewMode);
  const zoomThreshold = options?.pillZoomThreshold ?? OVERVIEW_PILL_ZOOM_THRESHOLD;
  const paddingRatio = options?.viewportPaddingRatio ?? 0.2;
  const hasZoom = typeof options?.zoom === "number" && Number.isFinite(options.zoom);
  const isWideZoom = isOverviewMode && hasZoom && (options!.zoom as number) < zoomThreshold;
  const bounds = isOverviewMode ? (options?.bounds ?? null) : null;

  for (const marker of markers) {
    if (marker.isVisible && marker.isGhost && !marker.isActive) {
      ghostDots.push({
        id: marker.id,
        targetId: marker.targetId,
        label: marker.label,
        latitude: marker.latitude,
        longitude: marker.longitude,
        color: marker.color,
        variant: "ghost",
        stratumCount: marker.stratumCount,
      });
      continue;
    }

    if (
      isOverviewMode &&
      marker.isVisible &&
      marker.kind === "visited" &&
      !marker.isActive &&
      !marker.isHighlighted &&
      !marker.isProvenanceOrigin
    ) {
      const isOffscreenAtCloseZoom =
        !isWideZoom &&
        bounds !== null &&
        !isCoordinateInPaddedBounds(marker.latitude, marker.longitude, bounds, paddingRatio);

      if (isWideZoom || isOffscreenAtCloseZoom) {
        ghostDots.push({
          id: marker.id,
          targetId: marker.targetId,
          label: marker.label,
          latitude: marker.latitude,
          longitude: marker.longitude,
          color: marker.color,
          variant: "overview",
          stratumCount: marker.stratumCount,
        });
        continue;
      }
    }

    domMarkers.push(marker);
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
    const isPointerHovered = pointerHoveredId === dot.id;
    const isHovered =
      isPointerHovered ||
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
      isPointerHovered,
    });
  }
  return result;
}

/**
 * クリック／ホバー座標からヒット半径内の最寄り Canvas ドットを返す（スクリーン空間距離判定）。
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

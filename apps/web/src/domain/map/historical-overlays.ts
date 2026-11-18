import type {
  LensSpatialFeatureCategory,
  LensSpatialOverlay,
} from "@/domain/lens-packs/schema";

export type ProjectedOverlayPolygon = {
  id: string;
  label: string;
  category: LensSpatialFeatureCategory;
  color: string;
  points: string;
};

export type ProjectedOverlayLine = {
  id: string;
  label: string;
  category: LensSpatialFeatureCategory;
  color: string;
  dashed: boolean;
  segments: string[];
};

export type ProjectedOverlayGate = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  showLabel: boolean;
};

export type ProjectedOverlayLabel = {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
  category: LensSpatialFeatureCategory;
  longitude: number;
  latitude: number;
};

export type ProjectedHistoricalOverlay = {
  polygons: ProjectedOverlayPolygon[];
  lines: ProjectedOverlayLine[];
  gates: ProjectedOverlayGate[];
  labels: ProjectedOverlayLabel[];
  strokeScale: number;
  showCenterline: boolean;
};

export type HistoricalOverlayProjectionOptions = {
  zoom?: number;
  showLabels?: boolean;
};

export const EMPTY_HISTORICAL_OVERLAY_PROJECTION: ProjectedHistoricalOverlay = {
  polygons: [],
  lines: [],
  gates: [],
  labels: [],
  strokeScale: 1,
  showCenterline: true,
};

const SUBLABEL_MIN_ZOOM = 12.4;

function resolveDefaultMinZoom(
  geometryType: LensSpatialOverlay["features"][number]["geometry"]["type"],
  category: LensSpatialFeatureCategory,
): number {
  if (geometryType === "Point") {
    return category === "gate" ? 12.0 : 10.5;
  }
  if (category === "moat" || category === "route-secondary") {
    return 10.5;
  }
  return 0;
}

function resolveStrokeScale(zoom?: number): number {
  if (zoom === undefined) return 1;
  if (zoom < 9.5) return 0.45;
  if (zoom < 11.2) return 0.65;
  if (zoom < 12.5) return 0.82;
  return 1;
}

/**
 * Projects declarative geographic spatial features from a topic's spatialOverlay
 * onto screen coordinate paths for 60fps high-performance SVG rendering.
 */
export function projectHistoricalOverlay(
  overlay: LensSpatialOverlay | undefined,
  projector: { project: (coord: [number, number]) => { x: number; y: number } },
  options?: HistoricalOverlayProjectionOptions,
): ProjectedHistoricalOverlay {
  if (!overlay || !overlay.features || overlay.features.length === 0) {
    return EMPTY_HISTORICAL_OVERLAY_PROJECTION;
  }

  const zoom = options?.zoom;
  const showLabels = options?.showLabels ?? true;
  const strokeScale = resolveStrokeScale(zoom);
  const showCenterline = zoom === undefined || zoom >= 12.0;

  const polygons: ProjectedOverlayPolygon[] = [];
  const lines: ProjectedOverlayLine[] = [];
  const gates: ProjectedOverlayGate[] = [];
  const labels: ProjectedOverlayLabel[] = [];

  for (const feature of overlay.features) {
    const {
      id,
      label,
      sublabel,
      category,
      color: customColor,
      dashed,
      minZoom,
      maxZoom,
    } = feature.properties;
    const color = customColor ?? "#38bdf8";
    const geom = feature.geometry;

    if (zoom !== undefined) {
      const effectiveMinZoom = minZoom ?? resolveDefaultMinZoom(geom.type, category);
      if (zoom < effectiveMinZoom) continue;
      if (maxZoom !== undefined && zoom > maxZoom) continue;
    }

    if (geom.type === "Polygon") {
      const outerRing = geom.coordinates[0];
      if (!outerRing || outerRing.length < 3) continue;
      const pts = outerRing
        .map(([lng, lat]) => {
          const p = projector.project([lng, lat]);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      polygons.push({
        id,
        label,
        category,
        color,
        points: pts,
      });
    } else if (geom.type === "LineString") {
      if (geom.coordinates.length < 2) continue;
      const pts = geom.coordinates
        .map(([lng, lat]) => {
          const p = projector.project([lng, lat]);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      lines.push({
        id,
        label,
        category,
        color,
        dashed: Boolean(dashed),
        segments: [pts],
      });
    } else if (geom.type === "MultiLineString") {
      const segments: string[] = [];
      for (const lineCoords of geom.coordinates) {
        if (lineCoords.length < 2) continue;
        const pts = lineCoords
          .map(([lng, lat]) => {
            const p = projector.project([lng, lat]);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(" ");
        segments.push(pts);
      }
      if (segments.length > 0) {
        lines.push({
          id,
          label,
          category,
          color,
          dashed: Boolean(dashed),
          segments,
        });
      }
    } else if (geom.type === "Point") {
      const [lng, lat] = geom.coordinates;
      if (category === "gate") {
        const p = projector.project([lng, lat]);
        gates.push({
          id,
          label,
          color,
          x: Number(p.x.toFixed(1)),
          y: Number(p.y.toFixed(1)),
          showLabel: showLabels,
        });
      } else if (showLabels) {
        const includeSublabel = zoom === undefined || zoom >= SUBLABEL_MIN_ZOOM;
        labels.push({
          id,
          label,
          sublabel: includeSublabel ? sublabel : undefined,
          color,
          category,
          longitude: lng,
          latitude: lat,
        });
      }
    }
  }

  return { polygons, lines, gates, labels, strokeScale, showCenterline };
}

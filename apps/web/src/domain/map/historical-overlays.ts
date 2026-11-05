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
};

export const EMPTY_HISTORICAL_OVERLAY_PROJECTION: ProjectedHistoricalOverlay = {
  polygons: [],
  lines: [],
  gates: [],
  labels: [],
};

/**
 * Projects declarative geographic spatial features from a topic's spatialOverlay
 * onto screen coordinate paths for 60fps high-performance SVG rendering.
 */
export function projectHistoricalOverlay(
  overlay: LensSpatialOverlay | undefined,
  projector: { project: (coord: [number, number]) => { x: number; y: number } },
): ProjectedHistoricalOverlay {
  if (!overlay || !overlay.features || overlay.features.length === 0) {
    return EMPTY_HISTORICAL_OVERLAY_PROJECTION;
  }

  const polygons: ProjectedOverlayPolygon[] = [];
  const lines: ProjectedOverlayLine[] = [];
  const gates: ProjectedOverlayGate[] = [];
  const labels: ProjectedOverlayLabel[] = [];

  for (const feature of overlay.features) {
    const { id, label, sublabel, category, color: customColor, dashed } = feature.properties;
    const color = customColor ?? "#38bdf8";
    const geom = feature.geometry;

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
        });
      } else {
        labels.push({
          id,
          label,
          sublabel,
          color,
          category,
          longitude: lng,
          latitude: lat,
        });
      }
    }
  }

  return { polygons, lines, gates, labels };
}

import type { MapAreaZoneDescriptor } from "./scene";

export type ScreenPointProjector = {
  project: (coord: [number, number]) => { x: number; y: number };
};

export type ProjectedAreaZoneCircle = {
  id: string;
  label: string;
  cx: number;
  cy: number;
  radiusPx: number;
  radiusKm: number;
  isExplored: boolean;
  visitedSpotCount: number;
  isActive: boolean;
};

const EARTH_KM_PER_DEG_LAT = 111.32;

/**
 * 広域エリア（spatialGranularity === "area"）の代表座標＋半径（radiusKm）を
 * 現在の地図投影に合わせた画面座標円へ変換する純粋関数。
 *
 * - 緯度補正（cos(lat)）により実縮尺 radiusKm を正確に投影する。
 * - 広域ズーム（特にモバイル画面）でも視認性を失わないよう最小半径（既定 26px）を保証する。
 * - 大円を背面・小円を前面に重ねるため radiusPx 降順で返す。
 */
export function projectAreaZoneScreenCircles(
  areaZones: readonly MapAreaZoneDescriptor[],
  projector: ScreenPointProjector,
  options: {
    minRadiusPx?: number;
  } = {},
): ProjectedAreaZoneCircle[] {
  const minRadiusPx = options.minRadiusPx ?? 26;
  const deduped = new Map<string, MapAreaZoneDescriptor>();

  for (const zone of areaZones) {
    if (!Number.isFinite(zone.radiusKm) || zone.radiusKm <= 0) continue;
    const existing = deduped.get(zone.id);
    if (existing) {
      deduped.set(zone.id, {
        ...existing,
        visitedSpotCount: Math.max(existing.visitedSpotCount, zone.visitedSpotCount),
        isActive: Boolean(existing.isActive || zone.isActive),
      });
    } else {
      deduped.set(zone.id, zone);
    }
  }

  const circles: ProjectedAreaZoneCircle[] = [];
  for (const zone of deduped.values()) {
    const center = projector.project([zone.longitude, zone.latitude]);
    const kmPerDegLng = Math.max(
      1e-3,
      EARTH_KM_PER_DEG_LAT * Math.cos((zone.latitude * Math.PI) / 180),
    );
    const eastEdge = projector.project([zone.longitude + zone.radiusKm / kmPerDegLng, zone.latitude]);
    const rawRadiusPx = Math.hypot(eastEdge.x - center.x, eastEdge.y - center.y);
    const radiusPx = Math.round(Math.max(minRadiusPx, rawRadiusPx) * 10) / 10;

    circles.push({
      id: zone.id,
      label: zone.label,
      cx: Math.round(center.x * 10) / 10,
      cy: Math.round(center.y * 10) / 10,
      radiusPx,
      radiusKm: zone.radiusKm,
      isExplored: zone.visitedSpotCount > 0,
      visitedSpotCount: zone.visitedSpotCount,
      isActive: Boolean(zone.isActive),
    });
  }

  return circles.sort((a, b) => b.radiusPx - a.radiusPx);
}

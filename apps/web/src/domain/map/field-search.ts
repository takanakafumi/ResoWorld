import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export type FieldSearchTargetKind = "visited" | "suggestion";
export type FieldSearchFilter = "all" | FieldSearchTargetKind;

export type FieldSearchIndexItem = {
  id: string;
  kind: FieldSearchTargetKind;
  title: string;
  subtitle: string;
  badge: string;
  latitude: number;
  longitude: number;
  claimCount: number;
  normalizedName: string;
  normalizedSearchText: string;
};

export type FieldSearchResultItem = FieldSearchIndexItem & {
  distanceKm: number | null;
};

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("ja").trim();
}

/**
 * 球面三角法（Haversine）による2点間の大円距離（km）。
 */
export function haversineDistanceKm(a: GeoCoordinate, b: GeoCoordinate): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);
  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng;
  const clamped = Math.min(1, Math.max(0, h));
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(clamped));
}

/**
 * フィールド探索時の直感的な距離表記を返す。
 */
export function formatDistanceKm(distanceKm: number): string {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return "";
  if (distanceKm < 0.05) return "現地付近";
  if (distanceKm < 1) {
    const meters = Math.round((distanceKm * 1000) / 10) * 10;
    return `${meters}m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}

/**
 * 訪問済みスポットと未訪問の探索候補から事前正規化済みの検索インデックスを構築する（原則 ⑥）。
 * mapRole / エンティティ型による厳密な判別のみを用い、自由文字列からの状態推測を行わない（原則 ⑨・⑪）。
 */
export function buildFieldSearchIndex(
  spots: readonly ReviewAtlasSpot[],
  suggestions: readonly ReviewExplorationSuggestion[],
): FieldSearchIndexItem[] {
  const items: FieldSearchIndexItem[] = [];

  for (const spot of spots) {
    if (spot.mapRole === "area-context" || spot.mapRole === "candidate-place") continue;
    if (!Number.isFinite(spot.latitude) || !Number.isFinite(spot.longitude)) continue;

    const subtitle = [spot.region, spot.kind].filter(Boolean).join(" · ");
    const normalizedName = normalizeForSearch(spot.name);
    const normalizedSearchText = normalizeForSearch(
      [spot.name, spot.region, spot.kind, spot.id].filter(Boolean).join(" "),
    );

    items.push({
      id: spot.id,
      kind: "visited",
      title: spot.name,
      subtitle,
      badge: "既訪",
      latitude: spot.latitude,
      longitude: spot.longitude,
      claimCount: spot.claimIds.length,
      normalizedName,
      normalizedSearchText,
    });
  }

  for (const suggestion of suggestions) {
    if (!Number.isFinite(suggestion.latitude) || !Number.isFinite(suggestion.longitude)) continue;

    const title = suggestion.targetName || suggestion.title;
    const subtitle =
      suggestion.title && suggestion.title !== title
        ? suggestion.title
        : suggestion.question;
    const normalizedName = normalizeForSearch(title);
    const normalizedSearchText = normalizeForSearch(
      [suggestion.targetName, suggestion.title, suggestion.question, suggestion.reason]
        .filter(Boolean)
        .join(" "),
    );

    items.push({
      id: suggestion.id,
      kind: "suggestion",
      title,
      subtitle,
      badge: "次の探索候補",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      claimCount: suggestion.claimIds.length,
      normalizedName,
      normalizedSearchText,
    });
  }

  return items;
}

export function searchFieldTargets(
  index: readonly FieldSearchIndexItem[],
  options: {
    query: string;
    filter: FieldSearchFilter;
    origin: GeoCoordinate | null;
    limit?: number;
  },
): FieldSearchResultItem[] {
  const limit = options.limit ?? 24;
  const normalizedQuery = normalizeForSearch(options.query);
  const tokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  const scored: Array<{ item: FieldSearchResultItem; rank: number }> = [];

  for (const entry of index) {
    if (options.filter !== "all" && entry.kind !== options.filter) continue;

    let rank = 0;
    if (tokens.length > 0) {
      let allMatch = true;
      for (const token of tokens) {
        if (!entry.normalizedSearchText.includes(token)) {
          allMatch = false;
          break;
        }
      }
      if (!allMatch) continue;

      if (entry.normalizedName === normalizedQuery) {
        rank = 0;
      } else if (entry.normalizedName.startsWith(tokens[0])) {
        rank = 1;
      } else if (tokens.every((token) => entry.normalizedName.includes(token))) {
        rank = 2;
      } else {
        rank = 3;
      }
    }

    const distanceKm = options.origin
      ? haversineDistanceKm(options.origin, entry)
      : null;

    scored.push({
      item: { ...entry, distanceKm },
      rank,
    });
  }

  scored.sort((left, right) => {
    if (left.rank !== right.rank) return left.rank - right.rank;
    const leftDist = left.item.distanceKm ?? Number.POSITIVE_INFINITY;
    const rightDist = right.item.distanceKm ?? Number.POSITIVE_INFINITY;
    if (Math.abs(leftDist - rightDist) > 1e-6) return leftDist - rightDist;
    if (left.item.claimCount !== right.item.claimCount) {
      return right.item.claimCount - left.item.claimCount;
    }
    return left.item.title.localeCompare(right.item.title, "ja");
  });

  return scored.slice(0, limit).map((entry) => entry.item);
}

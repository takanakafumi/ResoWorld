import type { ReviewAtlasSpot } from "@/domain/review/types";
import type { LensExplorationLink } from "./exploration-links";
import { lensEntityNamesMatch } from "./entity-identity";
import type { LensAreaScope, LensSpatialGranularity } from "./schema";

export type EntityVisitResolution = {
  isVisited: boolean;
  visitReason: "observed" | "spot_connected" | "direct_match" | "area_explored" | "unvisited";
  primarySpotId?: string;
  areaVisitedSpotCount?: number;
  areaVisitedSpotIds?: string[];
};

export const CONCRETE_PLACE_ENTITY_KINDS = new Set([
  "place",
  "sanctuary",
  "shrine",
  "temple",
  "ruins",
  "location",
  "site",
]);

const AREA_CONTEXT_SPOT_KINDS = new Set([
  "地域（行政区域）",
  "地域・行政区域",
  "広域地域",
  "行政区域",
]);

export function isConcretePlaceEntityKind(kind?: string): boolean {
  return Boolean(kind && CONCRETE_PLACE_ENTITY_KINDS.has(kind));
}

export function spotDistanceKm(
  spot: Pick<ReviewAtlasSpot, "latitude" | "longitude">,
  coordinates: { latitude: number; longitude: number },
): number {
  return Math.hypot(
    (spot.latitude - coordinates.latitude) * 111,
    (spot.longitude - coordinates.longitude) * 91,
  );
}

/**
 * 物理地点エンティティ（place / site / shrine 等）に対して、
 * 候補の Atlas Spot が「他スポット・資料館の Claim 暗黙共起」ではなく
 * その地点エンティティ自身と同一の物理スポットであることを判定する構造ガード（原則 ⑭）。
 */
export function spotMatchesConcretePlaceEntity(
  entity: {
    id: string;
    label?: string;
    aliases?: string[];
    primarySpotId?: string;
    coordinates?: { latitude: number; longitude: number };
  },
  spot: ReviewAtlasSpot,
  options?: { hasExplicitPrimarySpotInAtlas?: boolean },
): boolean {
  // 1. 宣言的 primarySpotId が一致する場合は即座に同一スポットとして認定
  if (entity.primarySpotId && spot.id === entity.primarySpotId) {
    return true;
  }

  // 2. Atlas 内に宣言的 primarySpotId の実体が存在する場合は、それを唯一の正本とし他スポットへの漏れを遮断する
  if (entity.primarySpotId && options?.hasExplicitPrimarySpotInAtlas) {
    return false;
  }

  // 3. スポット実体名の直接照合（未宣言エンティティ、またはID体系が異なるインポート／テストスポット）
  const names = [entity.label ?? entity.id, ...(entity.aliases ?? [])];
  if (!names.some((name) => lensEntityNamesMatch(spot.name, name))) {
    return false;
  }

  // 4. 双方の座標が有効（0,0 未設定ダミーを除く）な場合は、遠隔地の同名異地（> 40km）を除外する
  const spotHasCoordinates = spot.latitude !== 0 || spot.longitude !== 0;
  if (entity.coordinates && spotHasCoordinates && spotDistanceKm(spot, entity.coordinates) > 40) {
    return false;
  }

  return true;
}

function normalizeRegionText(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

/**
 * 広域エリア・比定圏エンティティ（spatialGranularity === "area"）に対して、
 * 候補の Atlas Spot がそのエリア内に属するかを宣言的 `areaScope` のみで判定する（原則 ①・⑪）。
 */
export function spotMatchesAreaEntity(
  entity: {
    id: string;
    label?: string;
    aliases?: string[];
    spatialGranularity?: LensSpatialGranularity;
    areaScope?: LensAreaScope;
  },
  spot: ReviewAtlasSpot,
): boolean {
  if (entity.spatialGranularity !== "area") return false;
  const scope = entity.areaScope;

  if (scope?.memberSpotIds?.includes(spot.id)) {
    return true;
  }

  if (scope?.regionTokens && scope.regionTokens.length > 0) {
    const normalizedRegion = normalizeRegionText(spot.region ?? "");
    const normalizedName = normalizeRegionText(spot.name ?? "");
    const isAdminSpot = AREA_CONTEXT_SPOT_KINDS.has(spot.kind) || spot.kind === "地域";
    for (const token of scope.regionTokens) {
      const normalizedToken = normalizeRegionText(token);
      if (normalizedRegion.includes(normalizedToken)) {
        return true;
      }
      if (isAdminSpot && normalizedName.includes(normalizedToken)) {
        return true;
      }
    }
  }

  if (scope?.bounds) {
    const spotHasCoordinates = spot.latitude !== 0 || spot.longitude !== 0;
    if (
      spotHasCoordinates &&
      spot.latitude >= scope.bounds.minLat &&
      spot.latitude <= scope.bounds.maxLat &&
      spot.longitude >= scope.bounds.minLng &&
      spot.longitude <= scope.bounds.maxLng
    ) {
      return true;
    }
  }

  // Fallback when an area entity has no areaScope: direct name match only
  if (!scope) {
    const names = [entity.label ?? entity.id, ...(entity.aliases ?? [])];
    return names.some((name) => lensEntityNamesMatch(spot.name, name));
  }

  return false;
}

/**
 * 広域エリアエンティティ内に含まれる訪問済みスポット群を収集する。
 * 具体施設スポットを優先カウントし、具体施設が存在しない場合のみ行政区域スポットにフォールバックする。
 */
export function resolveAreaVisitedSpots(
  entity: {
    id: string;
    label?: string;
    aliases?: string[];
    spatialGranularity?: LensSpatialGranularity;
    areaScope?: LensAreaScope;
  },
  spots?: readonly ReviewAtlasSpot[],
): ReviewAtlasSpot[] {
  if (entity.spatialGranularity !== "area" || !spots || spots.length === 0) {
    return [];
  }
  const matched = spots.filter((spot) => {
    if (spot.mapRole && spot.mapRole !== "visited-place") return false;
    return spotMatchesAreaEntity(entity, spot);
  });
  if (matched.length === 0) return [];
  const concrete = matched.filter(
    (spot) => !AREA_CONTEXT_SPOT_KINDS.has(spot.kind) && spot.kind !== "地域",
  );
  return concrete.length > 0 ? concrete : matched;
}

/**
 * 知識ノード（または地点エンティティ）が、Atlas上の実体験として訪問済みであるかを
 * 決定論的に判定する唯一の正本関数（Single Source of Truth / ADR-0021 / 原則⑭）。
 *
 * 判定優先順位（不変条件）:
 * 0. spatialGranularity === "area" の広域エリアエンティティ -> 宣言的 `areaScope` 内の既訪スポットからロールアップ (`area_explored`)
 * 1. link.observedSpotIds に有効な訪問済みスポットが1件以上存在する場合 -> observed
 * 2. link.spotIds に有効な訪問済みスポット（mapRole === "visited-place"）が存在する場合 -> spot_connected
 * 3. node.primarySpotId または directMatch が spots 内で visited-place である場合 -> direct_match
 * 4. それ以外 -> unvisited
 *
 * 構造ガード（原則 ⑭）:
 * 物理地点エンティティ（place / site / shrine 等）に対しては、他スポット・資料館の
 * Claim 暗黙共起による誤昇格を防ぐため、スポット自身が当該地点エンティティと同一である
 * （spotMatchesConcretePlaceEntity）場合のみ訪問済みとして認定する。
 */
export function resolveEntityVisitState(
  node: {
    id: string;
    label?: string;
    aliases?: string[];
    primarySpotId?: string;
    kind?: string;
    coordinates?: { latitude: number; longitude: number };
    spatialGranularity?: LensSpatialGranularity;
    areaScope?: LensAreaScope;
  },
  link?: LensExplorationLink,
  spots?: readonly ReviewAtlasSpot[],
): EntityVisitResolution {
  // 0. 広域エリア・比定圏エンティティは宣言的 areaScope 内の訪問済みスポット群から自動ロールアップする
  if (node.spatialGranularity === "area") {
    const areaVisited = resolveAreaVisitedSpots(node, spots);
    if (areaVisited.length > 0) {
      return {
        isVisited: true,
        visitReason: "area_explored",
        primarySpotId: areaVisited[0]!.id,
        areaVisitedSpotCount: areaVisited.length,
        areaVisitedSpotIds: areaVisited.map((s) => s.id),
      };
    }
    return {
      isVisited: false,
      visitReason: "unvisited",
      areaVisitedSpotCount: 0,
      areaVisitedSpotIds: [],
    };
  }

  const isConcretePlace = isConcretePlaceEntityKind(node.kind);
  const spotById = spots ? new Map(spots.map((s) => [s.id, s])) : undefined;
  const hasExplicitPrimarySpotInAtlas = Boolean(node.primarySpotId && spotById?.has(node.primarySpotId));

  const isEligibleSpotForNode = (spot: ReviewAtlasSpot): boolean => {
    if (isConcretePlace) {
      return spotMatchesConcretePlaceEntity(node, spot, { hasExplicitPrimarySpotInAtlas });
    }
    const spotHasCoordinates = spot.latitude !== 0 || spot.longitude !== 0;
    if (node.coordinates && spotHasCoordinates && spotDistanceKm(spot, node.coordinates) > 40) {
      return false;
    }
    return true;
  };

  // 1. 現地で直接観察された Claim（observed_place）が存在する場合
  if (link && link.observedSpotIds && link.observedSpotIds.length > 0) {
    const validObservedId = spotById
      ? link.observedSpotIds.find((id) => {
          const s = spotById.get(id);
          if (!s) return false;
          if (s.mapRole && s.mapRole !== "visited-place") return false;
          return isEligibleSpotForNode(s);
        })
      : link.observedSpotIds[0];

    if (validObservedId) {
      const linkPrimary = link.primarySpotId && spotById ? spotById.get(link.primarySpotId) : undefined;
      const resolvedPrimarySpotId =
        linkPrimary && isEligibleSpotForNode(linkPrimary)
          ? linkPrimary.id
          : validObservedId;
      return {
        isVisited: true,
        visitReason: "observed",
        primarySpotId: resolvedPrimarySpotId,
      };
    }
  }

  // 2. 関連する訪問スポット（mapRole === "visited-place"）が存在する場合
  if (link && link.spotIds && link.spotIds.length > 0) {
    if (spots && spots.length > 0) {
      const visitedSpot = spots.find((s) => {
        if (!link.spotIds.includes(s.id) || s.mapRole !== "visited-place") return false;
        return isEligibleSpotForNode(s);
      });
      if (visitedSpot) {
        const linkPrimary = link.primarySpotId && spotById ? spotById.get(link.primarySpotId) : undefined;
        const resolvedPrimarySpotId =
          linkPrimary && linkPrimary.mapRole === "visited-place" && isEligibleSpotForNode(linkPrimary)
            ? linkPrimary.id
            : visitedSpot.id;
        return {
          isVisited: true,
          visitReason: "spot_connected",
          primarySpotId: resolvedPrimarySpotId,
        };
      }
    }
  }

  // 3. Spots が提供されている場合、直接照合（Plan A & 昇格不変条件）
  if (spots && spots.length > 0) {
    // 3a. 宣言的 primarySpotId の直接照合
    const explicitId = node.primarySpotId ?? (!isConcretePlace ? link?.primarySpotId : undefined);
    if (explicitId) {
      const direct = spots.find((s) => s.id === explicitId && s.mapRole === "visited-place");
      if (direct) {
        return {
          isVisited: true,
          visitReason: "direct_match",
          primarySpotId: direct.id,
        };
      }
    }

    // 3b. 地点エンティティ（place / site / shrine 等）の場合の名称照合
    const isPlaceLike = !node.kind || isConcretePlace;
    if (isPlaceLike && !hasExplicitPrimarySpotInAtlas) {
      const direct = spots.find((s) => {
        if (s.mapRole !== "visited-place") return false;
        return spotMatchesConcretePlaceEntity(node, s, { hasExplicitPrimarySpotInAtlas });
      });
      if (direct) {
        return {
          isVisited: true,
          visitReason: "direct_match",
          primarySpotId: direct.id,
        };
      }
    }
  }

  return {
    isVisited: false,
    visitReason: "unvisited",
  };
}

/**
 * LENS UI 全体で一貫した訪問状態ラベル（具体地点 vs 広域エリア）を返す単一ヘルパー（原則 ⑤・⑯）。
 */
export function formatEntityVisitBadge(
  resolution: EntityVisitResolution,
  spatialGranularity?: LensSpatialGranularity,
): string {
  if (resolution.visitReason === "area_explored") {
    return resolution.areaVisitedSpotCount && resolution.areaVisitedSpotCount > 0
      ? `● 地域踏査済 (${resolution.areaVisitedSpotCount}地点)`
      : "● 地域踏査済";
  }
  if (resolution.isVisited) {
    return "● 訪問済";
  }
  if (spatialGranularity === "area") {
    return "○ 未踏査エリア";
  }
  return "○ 未訪問";
}

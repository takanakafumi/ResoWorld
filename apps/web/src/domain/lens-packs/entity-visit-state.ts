import type { ReviewAtlasSpot } from "@/domain/review/types";
import type { LensExplorationLink } from "./exploration-links";
import { lensEntityNamesMatch } from "./entity-identity";

export type EntityVisitResolution = {
  isVisited: boolean;
  visitReason: "observed" | "spot_connected" | "direct_match" | "unvisited";
  primarySpotId?: string;
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

/**
 * 知識ノード（または地点エンティティ）が、Atlas上の実体験として訪問済みであるかを
 * 決定論的に判定する唯一の正本関数（Single Source of Truth / ADR-0021 / 原則⑭）。
 *
 * 判定優先順位（不変条件）:
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
  },
  link?: LensExplorationLink,
  spots?: readonly ReviewAtlasSpot[],
): EntityVisitResolution {
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

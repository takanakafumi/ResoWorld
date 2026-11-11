import type { ReviewAtlasSpot } from "@/domain/review/types";
import type { LensExplorationLink } from "./exploration-links";
import { lensEntityNamesMatch } from "./entity-identity";

export type EntityVisitResolution = {
  isVisited: boolean;
  visitReason: "observed" | "spot_connected" | "direct_match" | "unvisited";
  primarySpotId?: string;
};

/**
 * 知識ノード（または地点エンティティ）が、Atlas上の実体験として訪問済みであるかを
 * 決定論的に判定する唯一の正本関数（Single Source of Truth / ADR-0021 / 原則⑭）。
 *
 * 判定優先順位（不変条件）:
 * 1. link.observedSpotIds に1件以上存在する場合 -> observed
 * 2. link.spotIds に1件以上存在する場合 -> spot_connected
 * 3. node.primarySpotId または directMatch が spots 内で visited-place である場合 -> direct_match
 * 4. それ以外 -> unvisited
 */
export function resolveEntityVisitState(
  node: {
    id: string;
    label?: string;
    aliases?: string[];
    primarySpotId?: string;
    kind?: string;
  },
  link?: LensExplorationLink,
  spots?: readonly ReviewAtlasSpot[],
): EntityVisitResolution {
  // 1. 現地で直接観察された Claim（observed_place）が存在する場合
  if (link && link.observedSpotIds && link.observedSpotIds.length > 0) {
    return {
      isVisited: true,
      visitReason: "observed",
      primarySpotId: link.primarySpotId ?? link.observedSpotIds[0],
    };
  }

  // 2. 関連する訪問スポット（mapRole === "visited-place"）が存在する場合
  if (link && link.spotIds && link.spotIds.length > 0) {
    if (spots && spots.length > 0) {
      const visitedSpot = spots.find(
        (s) => link.spotIds.includes(s.id) && s.mapRole === "visited-place",
      );
      if (visitedSpot) {
        return {
          isVisited: true,
          visitReason: "spot_connected",
          primarySpotId: link.primarySpotId ?? visitedSpot.id,
        };
      }
    }
  }

  // 3. Spots が提供されている場合、直接照合（Plan A & 昇格不変条件）
  if (spots && spots.length > 0) {
    // 3a. 宣言的 primarySpotId の直接照合
    const explicitId = node.primarySpotId ?? link?.primarySpotId;
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

    // 3b. 地点エンティティ（place / site / shrine）の場合の名称照合
    const isPlaceLike = !node.kind || node.kind === "place" || node.kind === "site" || node.kind === "shrine";
    if (isPlaceLike) {
      const names = [node.label ?? node.id, ...(node.aliases ?? [])];
      const direct = spots.find(
        (s) => s.mapRole === "visited-place" && names.some((n) => lensEntityNamesMatch(s.name, n)),
      );
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

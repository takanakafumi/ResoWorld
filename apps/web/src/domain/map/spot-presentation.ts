import type { ReviewAtlasSpot } from "@/domain/review/types";

export type MapSpotCategory =
  | "museum"
  | "archaeology"
  | "shrine"
  | "temple"
  | "historic"
  | "nature"
  | "other";

export const mapSpotCategoryDefinitions: Array<{
  id: MapSpotCategory;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: "museum", label: "歴史館・博物館", icon: "館", color: "#72b7e8" },
  { id: "archaeology", label: "遺跡・古墳", icon: "遺", color: "#e2a866" },
  { id: "shrine", label: "神社・神宮", icon: "社", color: "#e98579" },
  { id: "temple", label: "寺院", icon: "寺", color: "#b9a0e3" },
  { id: "historic", label: "史跡・歴史建築", icon: "史", color: "#d5b46d" },
  { id: "nature", label: "自然・景観", icon: "景", color: "#79c58c" },
  { id: "other", label: "その他", icon: "・", color: "#68c7bd" },
];

export function mapSpotPresentation(spot: Pick<ReviewAtlasSpot, "name" | "kind">) {
  const value = `${spot.kind} ${spot.name}`;
  const category: MapSpotCategory = /博物館|資料館|歴史館|記念館|ミュージアム/.test(value)
    ? "museum"
    : /遺跡|古墳|墳墓|王墓|貝塚/.test(value)
      ? "archaeology"
      : /神社|大社|神宮/.test(value)
        ? "shrine"
        : /寺院|寺\b|院\b|磨崖仏|仏閣/.test(value)
          ? "temple"
          : /史跡|城跡|城址|屋敷|生家|旧宅|塾|反射炉|造船所跡|墓所|墓\b/.test(value)
            ? "historic"
            : /自然|景観|海岸|浜|山|滝|洞窟|千畳敷/.test(value)
              ? "nature"
              : "other";
  return mapSpotCategoryDefinitions.find(({ id }) => id === category)!;
}

export function isMapVisitSpot(spot: Pick<ReviewAtlasSpot, "mapRole">) {
  return spot.mapRole !== "area-context";
}

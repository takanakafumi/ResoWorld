import { describe, expect, it } from "vitest";
import {
  isProvenanceCategoryMatchingOverlay,
  PROVENANCE_ORIGIN_ENTITIES,
  resolveProvenanceOriginMeta,
} from "./provenance-registry";

describe("Provenance Origin Registry (原産地・工房・中枢地点レジストリ)", () => {
  it("contains declarative origin metadata for all key mineral supply chain hubs", () => {
    expect(PROVENANCE_ORIGIN_ENTITIES.length).toBeGreaterThanOrEqual(10);

    const itoigawa = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === "place-itoigawa-jade");
    expect(itoigawa).toBeDefined();
    expect(itoigawa?.category).toBe("jade");
    expect(itoigawa?.badgeText).toContain("ヒスイ");

    const wakasugi = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === "place-wakasugiyama");
    expect(wakasugi).toBeDefined();
    expect(wakasugi?.category).toBe("cinnabar");
    expect(wakasugi?.badgeText).toContain("辰砂");

    const kasenyama = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === "place-kasenyama-jasper");
    expect(kasenyama).toBeDefined();
    expect(kasenyama?.category).toBe("jasper");
    expect(kasenyama?.badgeText).toContain("碧玉");

    const gaya = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === "place-gaya-iron");
    expect(gaya).toBeDefined();
    expect(gaya?.category).toBe("iron");
    expect(gaya?.badgeText).toContain("鉄");
  });

  it("resolves origin metadata by ID or targetPlaceId or label name", () => {
    // 1. Resolve by targetPlaceId
    const resByPlaceId = resolveProvenanceOriginMeta({
      id: "frontier:prehistoric-resource-corridor:place-itoigawa-jade",
      targetPlaceId: "place-itoigawa-jade",
      name: "糸魚川ヒスイ原産地",
    });
    expect(resByPlaceId?.badgeText).toContain("ヒスイ");

    // 2. Resolve by site ID
    const resBySiteId = resolveProvenanceOriginMeta({
      id: "site-wakasugiyama",
      name: "阿南若杉山辰砂採掘遺跡",
    });
    expect(resBySiteId?.badgeText).toContain("辰砂");

    // 3. Resolve by partial name match
    const resByName = resolveProvenanceOriginMeta({
      name: "出雲花仙山・玉作跡",
    });
    expect(resByName?.badgeText).toContain("碧玉");

    // 4. Non-origin spot returns undefined
    const nonOrigin = resolveProvenanceOriginMeta({
      id: "spot-dazaifu-tenmangu",
      name: "太宰府天満宮",
    });
    expect(nonOrigin).toBeUndefined();
  });

  it("matches origin categories exclusively against active artifact overlays", () => {
    // When no overlay or 'none', all categories return false (normal pin display)
    expect(isProvenanceCategoryMatchingOverlay("cinnabar", undefined)).toBe(false);
    expect(isProvenanceCategoryMatchingOverlay("cinnabar", "none")).toBe(false);
    expect(isProvenanceCategoryMatchingOverlay("jade", "none")).toBe(false);

    // Cinnabar pigments overlay
    expect(isProvenanceCategoryMatchingOverlay("cinnabar", "cinnabar-red-pigments")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("bengala", "cinnabar-red-pigments")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("jade", "cinnabar-red-pigments")).toBe(false);
    expect(isProvenanceCategoryMatchingOverlay("bronze", "cinnabar-red-pigments")).toBe(false);

    // Jade and jasper overlay
    expect(isProvenanceCategoryMatchingOverlay("jade", "jade-and-jasper")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("jasper", "jade-and-jasper")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("cinnabar", "jade-and-jasper")).toBe(false);

    // Bronze weapons & bells overlay
    expect(isProvenanceCategoryMatchingOverlay("bronze", "yayoi-bronze-weapons-bells")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("cinnabar", "yayoi-bronze-weapons-bells")).toBe(false);

    // Sankakubuchi mirrors overlay
    expect(isProvenanceCategoryMatchingOverlay("mirror", "sankakubuchi-mirrors")).toBe(true);
    expect(isProvenanceCategoryMatchingOverlay("jade", "sankakubuchi-mirrors")).toBe(false);
  });
});

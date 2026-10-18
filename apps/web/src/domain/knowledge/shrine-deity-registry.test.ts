import { describe, expect, it } from "vitest";
import {
  isShrineSpot,
  resolveSpotDeityContext,
  SHRINE_DEITY_REGISTRY,
} from "./shrine-deity-registry";

describe("shrine deity registry and spot resolver (ADR-0019)", () => {
  describe("isShrineSpot guard", () => {
    it("correctly identifies shrine spots", () => {
      expect(isShrineSpot({ name: "筑紫神社", kind: "神社" })).toBe(true);
      expect(isShrineSpot({ name: "宇佐神宮", kind: "神社・八幡信仰" })).toBe(true);
      expect(isShrineSpot({ name: "宇美八幡宮", kind: "神社・祭祀" })).toBe(true);
      expect(isShrineSpot({ name: "宗像大社 辺津宮", kind: "神社・祭祀" })).toBe(true);
      expect(isShrineSpot({ name: "和田八幡宮（刻線の石）", kind: "神社・神仏習合" })).toBe(true);
    });

    it("correctly rejects non-shrine spots", () => {
      expect(isShrineSpot({ name: "宮島口", kind: "station" })).toBe(false);
      expect(isShrineSpot({ name: "九州歴史資料館", kind: "博物館" })).toBe(false);
      expect(isShrineSpot({ name: "大野城跡", kind: "城跡" })).toBe(false);
      expect(isShrineSpot({ name: "水城跡", kind: "史跡" })).toBe(false);
      expect(isShrineSpot({ name: "岩戸山古墳", kind: "古墳" })).toBe(false);
    });
  });

  describe("resolveSpotDeityContext", () => {
    it("resolves Deep Stratigraphy profile for Chikushi Shrine with hasStratigraphyProfile = true", () => {
      const context = resolveSpotDeityContext({
        id: "spot-entity-20c6c6a47c1356d70583",
        name: "筑紫神社",
        kind: "神社",
      });

      expect(context).toBeDefined();
      expect(context?.hasStratigraphyProfile).toBe(true);
      expect(context?.stratigraphyProfileId).toBe("stratigraphy-chikushi-jinja");
      expect(context?.currentDeities).toContain("筑紫の神");
      expect(context?.currentDeities).toContain("五十猛命");
      expect(context?.ancientBedrockOrLegend).toContain("荒ぶる神");
      expect(context?.ancientBedrockOrLegend).toContain("命尽くす");
      expect(context?.sourceNote).toContain("風土記");
    });

    it("resolves Deep Stratigraphy profile for Munakata Taisha", () => {
      const context = resolveSpotDeityContext({
        id: "munakata-taisha",
        name: "宗像大社 辺津宮",
        kind: "神社・祭祀",
      });

      expect(context).toBeDefined();
      expect(context?.hasStratigraphyProfile).toBe(true);
      expect(context?.stratigraphyProfileId).toBe("stratigraphy-munakata-okinoshima");
      expect(context?.currentDeities).toContain("宗像三女神");
    });

    it("resolves Base Registry dictionary for non-profile shrines (大己貴神社, 美奈宜神社, 高祖神社)", () => {
      const oonamuchi = resolveSpotDeityContext({
        name: "大己貴神社",
        kind: "神社",
      });
      expect(oonamuchi).toBeDefined();
      expect(oonamuchi?.hasStratigraphyProfile).toBe(false);
      expect(oonamuchi?.currentDeities).toContain("大己貴命");
      expect(oonamuchi?.ancientBedrockOrLegend).toContain("日本最古の大三輪社");

      const minagi = resolveSpotDeityContext({
        name: "美奈宜神社",
        kind: "神社",
      });
      expect(minagi).toBeDefined();
      expect(minagi?.currentDeities).toContain("素戔嗚尊");
      expect(minagi?.ancientBedrockOrLegend).toContain("延喜式内名神大社");

      const koso = resolveSpotDeityContext({
        name: "高祖神社",
        kind: "神社",
      });
      expect(koso).toBeDefined();
      expect(koso?.currentDeities).toContain("彦火火出見命");
      expect(koso?.ancientBedrockOrLegend).toContain("怡土城");
    });

    it("resolves shrines in the Hisayama/Kasuya itinerary (審神者神社, 部木八幡神社, 和田八幡宮)", () => {
      const saniwa = resolveSpotDeityContext({
        name: "審神者神社",
        kind: "神社・祭祀",
      });
      expect(saniwa).toBeDefined();
      expect(saniwa?.currentDeities).toContain("中臣烏賊津使主");
      expect(saniwa?.hasStratigraphyProfile).toBe(true);


      const wada = resolveSpotDeityContext({
        name: "和田八幡宮（刻線の石）",
        kind: "神社・神仏習合",
      });
      expect(wada).toBeDefined();
      expect(wada?.currentDeities).toContain("応神天皇");
      expect(wada?.ancientBedrockOrLegend).toContain("刻線");
    });

    it("returns undefined for non-shrine spots", () => {
      expect(resolveSpotDeityContext({ name: "宮島口", kind: "station" })).toBeUndefined();
      expect(resolveSpotDeityContext({ name: "九州歴史資料館", kind: "博物館" })).toBeUndefined();
    });
  });

  describe("dictionary completeness", () => {
    it("ensures all dictionary entries have valid deities and bedrock statements", () => {
      expect(SHRINE_DEITY_REGISTRY.length).toBeGreaterThanOrEqual(40);
      for (const entry of SHRINE_DEITY_REGISTRY) {
        expect(entry.matchNames.length).toBeGreaterThan(0);
        expect(entry.currentDeities.length).toBeGreaterThan(0);
        expect(entry.ancientBedrockOrLegend.length).toBeGreaterThan(0);
        expect(entry.sourceNote.length).toBeGreaterThan(0);
      }
    });
  });
});

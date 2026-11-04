import { describe, expect, it } from "vitest";
import {
  HISTORICAL_OVERLAY_PRESETS,
  getHistoricalOverlayPreset,
} from "./historical-overlays";

describe("historical-overlays (古地理・回廊 空間構造レイヤー)", () => {
  it("provides O(1) lookup for all 4 declarative spatial presets", () => {
    const expectedIds = [
      "dazaifu-kando-defense",
      "fukuoka-yayoi-polities",
      "kanmon-strait-geopolitics",
      "genkai-maritime-corridors",
    ];

    expect(HISTORICAL_OVERLAY_PRESETS.map((p) => p.id)).toEqual(expectedIds);

    for (const id of expectedIds) {
      const preset = getHistoricalOverlayPreset(id);
      expect(preset).toBeDefined();
      expect(preset?.id).toBe(id);
      expect(preset?.legend.length).toBeGreaterThan(0);
      expect(preset?.geojson.type).toBe("FeatureCollection");
      expect(preset?.geojson.features.length).toBeGreaterThan(0);
      expect(preset?.labels.length).toBeGreaterThan(0);

      const [[minLng, minLat], [maxLng, maxLat]] = preset!.bounds;
      expect(minLng).toBeLessThan(maxLng);
      expect(minLat).toBeLessThan(maxLat);
      expect(minLng).toBeGreaterThan(129);
      expect(maxLng).toBeLessThan(132);
      expect(minLat).toBeGreaterThan(33);
      expect(maxLat).toBeLessThan(35);
    }

    expect(getHistoricalOverlayPreset("off")).toBeUndefined();
    expect(getHistoricalOverlayPreset("non-existent")).toBeUndefined();
  });

  it("includes West Kando, East Kando, Mizuki barrier, Shomizuki, and mountain fortresses in dazaifu-kando-defense", () => {
    const dazaifu = getHistoricalOverlayPreset("dazaifu-kando-defense");
    expect(dazaifu).toBeDefined();

    const featureIds = dazaifu!.geojson.features.map((f) => f.properties.id);
    expect(featureIds).toContain("barrier-mizuki-main");
    expect(featureIds).toContain("barrier-shomizuki-west");
    expect(featureIds).toContain("route-west-kando");
    expect(featureIds).toContain("route-east-kando");
    expect(featureIds).toContain("route-umi-kamado-branch");
    expect(featureIds).toContain("route-south-saikaido");
    expect(featureIds).toContain("zone-ono-castle");
    expect(featureIds).toContain("zone-kii-castle");
    expect(featureIds).toContain("zone-dazaifu-seicho");
    expect(featureIds).toContain("zone-korokan");
  });
});

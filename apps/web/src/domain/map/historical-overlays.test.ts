import { describe, expect, it } from "vitest";
import {
  HISTORICAL_OVERLAY_PRESETS,
  getHistoricalOverlayPreset,
  projectHistoricalOverlay,
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

  it("includes West Kando, East Kando, Mizuki barrier + northern moat, Shomizuki, gates, and mountain fortresses in dazaifu-kando-defense", () => {
    const dazaifu = getHistoricalOverlayPreset("dazaifu-kando-defense");
    expect(dazaifu).toBeDefined();

    const featureIds = dazaifu!.geojson.features.map((f) => f.properties.id);
    expect(featureIds).toContain("moat-mizuki-north");
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

    const gateIds = (dazaifu!.gates ?? []).map((g) => g.id);
    expect(gateIds).toContain("gate-mizuki-west");
    expect(gateIds).toContain("gate-mizuki-east");
    expect(gateIds).toContain("gate-suzaku");
    expect(gateIds).toContain("gate-kii");
  });

  it("projects polygons, Kando lines, Mizuki barrier/moat, and gates into SVG screen coordinates", () => {
    const dazaifu = getHistoricalOverlayPreset("dazaifu-kando-defense");
    const mockProjector = {
      project: ([lng, lat]: [number, number]) => ({
        x: (lng - 130) * 1000,
        y: (34 - lat) * 1000,
      }),
    };

    const projected = projectHistoricalOverlay(dazaifu, mockProjector);
    expect(projected.polygons.length).toBe(4);
    expect(projected.lines.length).toBe(7);
    expect(projected.gates.length).toBe(4);

    const mizukiBarrier = projected.lines.find((l) => l.id === "barrier-mizuki-main");
    expect(mizukiBarrier?.category).toBe("barrier");
    expect(mizukiBarrier?.segments[0]).toContain(",");

    const westKando = projected.lines.find((l) => l.id === "route-west-kando");
    expect(westKando?.category).toBe("route-primary");
    expect(westKando?.segments[0].split(" ").length).toBe(7);

    const eastKando = projected.lines.find((l) => l.id === "route-east-kando");
    expect(eastKando?.category).toBe("route-primary");
    expect(eastKando?.segments[0].split(" ").length).toBe(8);
  });
});

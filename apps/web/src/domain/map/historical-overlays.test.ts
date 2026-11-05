import { describe, expect, it } from "vitest";
import { ancientDefenseNetworkPack, yayoiArchaeologyNetworkPack } from "@/domain/lens-packs/pack-loader";
import { genpeiDannouraPack } from "@/domain/lens-packs/genpei-dannoura-pack";
import { munakataOkinoshimaSacredLandscapePack } from "@/domain/lens-packs/munakata-okinoshima-pack";
import {
  EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  projectHistoricalOverlay,
} from "./historical-overlays";

describe("historical-overlays (LENS空間構造プロジェクションエンジン)", () => {
  it("verifies declarative spatialOverlay definition across 4 core packs", () => {
    // 1. Dazaifu Defense Network Pack
    const defenseOverlay = ancientDefenseNetworkPack.presets[0]?.spatialOverlay;
    expect(defenseOverlay).toBeDefined();
    expect(defenseOverlay?.type).toBe("FeatureCollection");
    expect(defenseOverlay?.features.length).toBeGreaterThanOrEqual(11);

    const defenseIds = defenseOverlay!.features.map((f) => f.properties.id);
    expect(defenseIds).toContain("moat-mizuki-north");
    expect(defenseIds).toContain("barrier-mizuki-main");
    expect(defenseIds).toContain("barrier-shomizuki-west");
    expect(defenseIds).toContain("route-west-kando");
    expect(defenseIds).toContain("route-east-kando");
    expect(defenseIds).toContain("zone-ono-castle");
    expect(defenseIds).toContain("zone-kii-castle");
    expect(defenseIds).toContain("gate-mizuki-west");
    expect(defenseIds).toContain("gate-mizuki-east");

    // 2. Yayoi Archaeology Network Pack
    const yayoiOverlay = yayoiArchaeologyNetworkPack.presets[0]?.spatialOverlay;
    expect(yayoiOverlay).toBeDefined();
    expect(yayoiOverlay?.features.length).toBeGreaterThanOrEqual(5);
    const yayoiIds = yayoiOverlay!.features.map((f) => f.properties.id);
    expect(yayoiIds).toContain("zone-nakoku-core");
    expect(yayoiIds).toContain("zone-itatuke-hie");
    expect(yayoiIds).toContain("zone-fumi-umi");
    expect(yayoiIds).toContain("route-yayoi-corridor");

    // 3. Genpei Dannoura Pack
    const genpeiOverlay = genpeiDannouraPack.presets[0]?.spatialOverlay;
    expect(genpeiOverlay).toBeDefined();
    expect(genpeiOverlay?.features.length).toBeGreaterThanOrEqual(6);
    const genpeiIds = genpeiOverlay!.features.map((f) => f.properties.id);
    expect(genpeiIds).toContain("zone-dannoura-hinoyama");
    expect(genpeiIds).toContain("route-kanmon-current");
    expect(genpeiIds).toContain("gate-moji-seki");
    expect(genpeiIds).toContain("gate-akama-seki");

    // 4. Munakata Okinoshima Pack
    const munakataOverlay = munakataOkinoshimaSacredLandscapePack.presets[1]?.spatialOverlay;
    expect(munakataOverlay).toBeDefined();
    expect(munakataOverlay?.features.length).toBeGreaterThanOrEqual(4);
    const munakataIds = munakataOverlay!.features.map((f) => f.properties.id);
    expect(munakataIds).toContain("sightline-munakata-okinoshima");
    expect(munakataIds).toContain("zone-munakata-core");
  });

  it("projects polygons, Kando lines, Mizuki barrier/moat, and gates into SVG screen coordinates", () => {
    const defenseOverlay = ancientDefenseNetworkPack.presets[0]?.spatialOverlay;
    expect(defenseOverlay).toBeDefined();

    const mockProjector = {
      project: ([lng, lat]: [number, number]) => ({
        x: (lng - 130) * 1000,
        y: (34 - lat) * 1000,
      }),
    };

    const projected = projectHistoricalOverlay(defenseOverlay, mockProjector);
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
    expect(eastKando?.segments[0].split(" ").length).toBe(7);

    const mizukiWestGate = projected.gates.find((g) => g.id === "gate-mizuki-west");
    expect(mizukiWestGate).toBeDefined();
    expect(mizukiWestGate?.label).toBe("水城西門");
    expect(mizukiWestGate?.x).toBeGreaterThan(0);
    expect(mizukiWestGate?.y).toBeGreaterThan(0);
  });

  it("handles undefined and empty overlays safely", () => {
    const mockProjector = {
      project: ([lng, lat]: [number, number]) => ({ x: lng, y: lat }),
    };

    expect(projectHistoricalOverlay(undefined, mockProjector)).toEqual(
      EMPTY_HISTORICAL_OVERLAY_PROJECTION,
    );
    expect(
      projectHistoricalOverlay({ type: "FeatureCollection", features: [] }, mockProjector),
    ).toEqual(EMPTY_HISTORICAL_OVERLAY_PROJECTION);
  });
});

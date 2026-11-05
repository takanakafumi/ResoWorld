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

    // Invariant: Mizuki main barrier coordinates must run from southwest (Shimo-ōri) to northeast (Shioji mountain foot)
    const mizukiFeature = defenseOverlay!.features.find((f) => f.properties.id === "barrier-mizuki-main");
    expect(mizukiFeature?.geometry.type).toBe("LineString");
    if (mizukiFeature?.geometry.type === "LineString") {
      const coords = mizukiFeature.geometry.coordinates;
      expect(coords[0][0]).toBeLessThan(coords[coords.length - 1][0]); // lng increases SW -> NE
      expect(coords[0][1]).toBeLessThan(coords[coords.length - 1][1]); // lat increases SW -> NE
      expect(coords[1]).toEqual([130.4956, 33.5133]); // Mizuki West Gate alignment
      expect(coords[3]).toEqual([130.5056, 33.5186]); // Mizuki East Gate alignment
    }

    // Invariant: West Kando must pass through Mizuki West Gate
    const westKandoFeature = defenseOverlay!.features.find((f) => f.properties.id === "route-west-kando");
    if (westKandoFeature?.geometry.type === "LineString") {
      expect(westKandoFeature.geometry.coordinates).toContainEqual([130.4956, 33.5133]);
    }

    // Invariant: East Kando must pass through Mizuki East Gate
    const eastKandoFeature = defenseOverlay!.features.find((f) => f.properties.id === "route-east-kando");
    if (eastKandoFeature?.geometry.type === "LineString") {
      expect(eastKandoFeature.geometry.coordinates).toContainEqual([130.5056, 33.5186]);
    }

    // 2. Yayoi Archaeology Network Pack
    const yayoiOverlay = yayoiArchaeologyNetworkPack.presets[0]?.spatialOverlay;
    expect(yayoiOverlay).toBeDefined();
    expect(yayoiOverlay?.features.length).toBeGreaterThanOrEqual(5);
    const yayoiIds = yayoiOverlay!.features.map((f) => f.properties.id);
    expect(yayoiIds).toContain("zone-nakoku-core");
    expect(yayoiIds).toContain("zone-itatuke-hie");
    expect(yayoiIds).toContain("zone-fumi-umi");
    expect(yayoiIds).toContain("zone-kasuya-koga");
    expect(yayoiIds).toContain("route-yayoi-corridor");

    // Invariant: Yayoi Corridor links Hakata Bay to Itazuke & Sugu-Okamoto
    const yayoiCorridor = yayoiOverlay!.features.find((f) => f.properties.id === "route-yayoi-corridor");
    expect(yayoiCorridor?.geometry.type).toBe("MultiLineString");
    if (yayoiCorridor?.geometry.type === "MultiLineString") {
      expect(yayoiCorridor.geometry.coordinates.length).toBe(3);
      expect(yayoiCorridor.geometry.coordinates[0][0]).toEqual([130.4018, 33.5899]); // Hakata Bay
      expect(yayoiCorridor.geometry.coordinates[0][3]).toEqual([130.4494, 33.5377]); // Sugu-Okamoto
    }

    // 3. Genpei Dannoura Pack (Kanmon Strait)
    const genpeiOverlay = genpeiDannouraPack.presets[0]?.spatialOverlay;
    expect(genpeiOverlay).toBeDefined();
    expect(genpeiOverlay?.features.length).toBeGreaterThanOrEqual(8);
    const genpeiIds = genpeiOverlay!.features.map((f) => f.properties.id);
    expect(genpeiIds).toContain("zone-moji-fortress");
    expect(genpeiIds).toContain("zone-tonogami-fortress");
    expect(genpeiIds).toContain("zone-dannoura-hinoyama");
    expect(genpeiIds).toContain("zone-chofu-toyoura");
    expect(genpeiIds).toContain("route-kanmon-current");
    expect(genpeiIds).toContain("route-sanyodo-buzen");
    expect(genpeiIds).toContain("gate-moji-seki");
    expect(genpeiIds).toContain("gate-akama-seki");

    // Invariant: Kanmon current flows west to east (Hibiki-nada to Suo-nada)
    const currentFeature = genpeiOverlay!.features.find((f) => f.properties.id === "route-kanmon-current");
    if (currentFeature?.geometry.type === "LineString") {
      const coords = currentFeature.geometry.coordinates;
      expect(coords[0][0]).toBeLessThan(coords[coords.length - 1][0]); // lng increases west to east
    }

    // Invariant: Sanyodo Buzen route passes through Akama-seki & Moji-seki
    const sanyodoFeature = genpeiOverlay!.features.find((f) => f.properties.id === "route-sanyodo-buzen");
    if (sanyodoFeature?.geometry.type === "LineString") {
      expect(sanyodoFeature.geometry.coordinates).toContainEqual([130.948, 33.958]); // Akama-seki
      expect(sanyodoFeature.geometry.coordinates).toContainEqual([130.963, 33.96]); // Moji-seki
    }

    // 4. Munakata Okinoshima Pack
    const munakataOverlay = munakataOkinoshimaSacredLandscapePack.presets[1]?.spatialOverlay;
    expect(munakataOverlay).toBeDefined();
    expect(munakataOverlay?.features.length).toBeGreaterThanOrEqual(4);
    const munakataIds = munakataOverlay!.features.map((f) => f.properties.id);
    expect(munakataIds).toContain("sightline-munakata-okinoshima");
    expect(munakataIds).toContain("zone-munakata-core");
    expect(munakataIds).toContain("zone-shikanoshima-hakata");
    expect(munakataIds).toContain("route-genkai-coastal");

    // Invariant: Sightline connects Hetsumiya -> Nakatsumiya (Oshima) -> Okitsumiya (Okinoshima) northwestwards
    const sightlineFeature = munakataOverlay!.features.find((f) => f.properties.id === "sightline-munakata-okinoshima");
    if (sightlineFeature?.geometry.type === "LineString") {
      const coords = sightlineFeature.geometry.coordinates;
      expect(coords[0]).toEqual([130.5144, 33.8311]); // Hetsumiya (Mainland)
      expect(coords[coords.length - 1]).toEqual([130.1042, 34.2415]); // Okitsumiya (Okinoshima)
      expect(coords[0][0]).toBeGreaterThan(coords[coords.length - 1][0]); // lng decreases SE -> NW
      expect(coords[0][1]).toBeLessThan(coords[coords.length - 1][1]); // lat increases SE -> NW
    }
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
    expect(eastKando?.segments[0].split(" ").length).toBe(8);

    const mizukiWestGate = projected.gates.find((g) => g.id === "gate-mizuki-west");
    expect(mizukiWestGate).toBeDefined();
    expect(mizukiWestGate?.label).toBe("水城西門");
    expect(mizukiWestGate?.x).toBeGreaterThan(0);
    expect(mizukiWestGate?.y).toBeGreaterThan(0);

    const mizukiEastGate = projected.gates.find((g) => g.id === "gate-mizuki-east");
    expect(mizukiEastGate).toBeDefined();
    expect(mizukiEastGate?.label).toBe("水城東門");
    expect(mizukiEastGate?.x).toBeGreaterThan(0);
    expect(mizukiEastGate?.y).toBeGreaterThan(0);
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

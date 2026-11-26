import { describe, expect, it } from "vitest";
import { projectAreaZoneScreenCircles, type ScreenPointProjector } from "./area-zones";

describe("projectAreaZoneScreenCircles", () => {
  const projector: ScreenPointProjector = {
    project: ([lng, lat]) => ({ x: (lng - 130) * 500, y: (35 - lat) * 500 }),
  };

  it("projects latitude-corrected geographic radiusKm, deduplicates by id, and sorts largest-first", () => {
    const circles = projectAreaZoneScreenCircles(
      [
        {
          id: "asakura-region",
          label: "朝倉地域",
          latitude: 33.414,
          longitude: 130.665,
          radiusKm: 9,
          visitedSpotCount: 7,
          isActive: false,
        },
        {
          id: "asakura-region",
          label: "朝倉地域",
          latitude: 33.414,
          longitude: 130.665,
          radiusKm: 9,
          visitedSpotCount: 7,
          isActive: true,
        },
        {
          id: "northern-kyushu",
          label: "北部九州の候補地域",
          latitude: 33.45,
          longitude: 130.52,
          radiusKm: 42,
          visitedSpotCount: 93,
          isActive: false,
        },
        {
          id: "nara-basin",
          label: "奈良盆地周辺",
          latitude: 34.68,
          longitude: 135.8,
          radiusKm: 22,
          visitedSpotCount: 0,
          isActive: false,
        },
      ],
      projector,
    );

    expect(circles).toHaveLength(3);
    expect(circles.map((c) => c.id)).toEqual([
      "northern-kyushu",
      "nara-basin",
      "asakura-region",
    ]);
    expect(circles[0]!.radiusPx).toBeGreaterThan(circles[1]!.radiusPx);
    expect(circles[1]!.radiusPx).toBeGreaterThan(circles[2]!.radiusPx);

    expect(circles[1]).toMatchObject({
      isExplored: false,
      visitedSpotCount: 0,
      isActive: false,
    });
    expect(circles[2]).toMatchObject({
      isExplored: true,
      visitedSpotCount: 7,
      isActive: true,
    });
  });

  it("enforces minimum legible radius on wide mobile overview zoom and skips invalid radii", () => {
    const wideMobileProjector: ScreenPointProjector = {
      project: ([lng, lat]) => ({ x: (lng - 130) * 53, y: (35 - lat) * 63 }),
    };

    const circles = projectAreaZoneScreenCircles(
      [
        {
          id: "kunisaki-peninsula",
          label: "国東半島",
          latitude: 33.565,
          longitude: 131.59,
          radiusKm: 16,
          visitedSpotCount: 2,
          isActive: false,
        },
        {
          id: "invalid-zone",
          label: "無効",
          latitude: 33.5,
          longitude: 130.5,
          radiusKm: 0,
          visitedSpotCount: 0,
        },
      ],
      wideMobileProjector,
    );

    expect(circles).toHaveLength(1);
    expect(circles[0]?.id).toBe("kunisaki-peninsula");
    expect(circles[0]?.radiusPx).toBeGreaterThanOrEqual(26);
  });
});

import publishedDataset from "@/data/published-review-dataset.json";
import { registeredLensKnowledgePacks } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveEntityVisitState } from "@/domain/lens-packs/entity-visit-state";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

describe("regional LENS pack geographic area zone coverage", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];

  it("projects valid geographic area zones across Setouchi, Kunisaki, Izumo, and Yayoi flagship packs and detects contained visited spots", () => {
    const targetPresets: ReadonlyArray<{ packId: string; presetId: string; expectedVisitedZones: string[] }> = [
      {
        packId: "setouchi-maritime-network",
        presetId: "setouchi-maritime-route-preset",
        expectedVisitedZones: ["area-genkai-hakata-bay", "area-tomonoura-bingo-nada"],
      },
      {
        packId: "setouchi-maritime-network",
        presetId: "setouchi-polity-integration-preset",
        expectedVisitedZones: ["area-genkai-hakata-bay", "area-tomonoura-bingo-nada"],
      },
      {
        packId: "kunisaki-usa-syncretism-network",
        presetId: "usa-rokugo-syncretism-preset",
        expectedVisitedZones: ["area-kunisaki-rokugo", "area-usa-hachiman-basin"],
      },
      {
        packId: "izumo-kunitsukami-network",
        presetId: "izumo-kunitsukami-preset",
        expectedVisitedZones: [],
      },
      {
        packId: "yayoi-archaeology-network",
        presetId: "yayoi-archaeology-preset",
        expectedVisitedZones: ["area-chikushi-saga-plain", "area-itoshima-hakata-yayoi"],
      },
    ];

    for (const target of targetPresets) {
      const entry = registeredLensKnowledgePacks.find((item) => item.pack.id === target.packId);
      expect(entry, `Pack ${target.packId} must be registered`).toBeDefined();
      const projection = projectLensPreset(entry!.pack, target.presetId);
      const areaNodes = projection.nodes.filter(
        (node) => node.spatialGranularity === "area" && (node.areaScope?.radiusKm ?? 0) > 0,
      );
      expect(areaNodes.length, `${target.presetId} must project at least 1 area zone`).toBeGreaterThanOrEqual(1);

      for (const areaNode of areaNodes) {
        expect(areaNode.coordinates, `${areaNode.id} must have coordinates`).toBeDefined();
        expect(Number.isFinite(areaNode.coordinates!.latitude)).toBe(true);
        expect(Number.isFinite(areaNode.coordinates!.longitude)).toBe(true);
      }

      for (const visitedZoneId of target.expectedVisitedZones) {
        const node = areaNodes.find((n) => n.id === visitedZoneId);
        expect(node, `${visitedZoneId} must exist in ${target.presetId}`).toBeDefined();
        const visitState = resolveEntityVisitState(node!, undefined, spots);
        expect(visitState.granularity, `${visitedZoneId} must resolve as area granularity`).toBe("area");
        if (visitState.granularity === "area") {
          expect(
            visitState.areaVisitedSpotCount,
            `${visitedZoneId} must enclose at least 1 visited spot`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});


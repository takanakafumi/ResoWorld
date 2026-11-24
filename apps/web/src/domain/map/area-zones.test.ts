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

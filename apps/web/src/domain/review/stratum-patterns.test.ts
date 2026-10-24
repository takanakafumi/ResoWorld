import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewDataset } from "./types";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
  getSpotStratumMemberships,
} from "./stratum-types";
import {
  SANCTUARY_COMPLEX_MIN_ANCHOR_DEPTH,
  SANCTUARY_COMPLEX_MIN_SPOTS,
  STRATUM_PATTERN_RULES,
  buildStratumPatternProjection,
  classifyStratumPattern,
} from "./stratum-patterns";

const dataset = publishedDataset as unknown as ReviewDataset;
const atlasSpots = dataset.atlas!.spots;
const memberships = getSpotStratumMemberships(atlasSpots, CHRONOLOGICAL_STRATA, {
  claimsById: buildClaimsByIdMap(dataset.claims),
  connections: dataset.atlas!.connections,
});
const projection = buildStratumPatternProjection(atlasSpots, memberships);

const layersOf = (...orders: number[]) =>
  CHRONOLOGICAL_STRATA.filter((layer) => orders.includes(layer.order));

describe("stratum pattern rules (declarative classification)", () => {
  it("classifies strata purely by their shape", () => {
    expect(classifyStratumPattern(layersOf(1, 2, 3, 4, 5))?.id).toBe("full-column");
    expect(classifyStratumPattern(layersOf(2, 3, 4, 5))?.id).toBe("continuous");
    expect(classifyStratumPattern(layersOf(4, 5))?.id).toBe("continuous");
    expect(classifyStratumPattern(layersOf(1, 4))?.id).toBe("gapped");
    expect(classifyStratumPattern(layersOf(2, 4))?.id).toBe("gapped");
    expect(classifyStratumPattern(layersOf(1))?.id).toBe("ancient-only");
    expect(classifyStratumPattern(layersOf(2))?.id).toBe("ancient-only");
    expect(classifyStratumPattern(layersOf(3))?.id).toBe("ritsuryo-only");
    expect(classifyStratumPattern(layersOf(4))?.id).toBe("later-only");
    expect(classifyStratumPattern(layersOf(5))?.id).toBe("later-only");
    expect(classifyStratumPattern([])).toBeUndefined();
  });

  it("covers every possible combination of strata without gaps or overlap-by-accident", () => {
    expect(new Set(STRATUM_PATTERN_RULES.map((rule) => rule.id)).size).toBe(
      STRATUM_PATTERN_RULES.length,
    );
    const orders = CHRONOLOGICAL_STRATA.map((layer) => layer.order);
    for (let mask = 1; mask < 1 << orders.length; mask += 1) {
      const subset = layersOf(...orders.filter((_, index) => mask & (1 << index)));
      expect(classifyStratumPattern(subset), `mask=${mask}`).toBeDefined();
    }
  });
});

describe("stratum pattern projection (static materialization)", () => {
  it("assigns every spot that has at least one stratum to exactly one pattern group", () => {
    const layered = atlasSpots.filter((spot) => (memberships.get(spot.id)?.strataCount ?? 0) >= 1);
    const grouped = projection.groups.flatMap((group) => group.members.map((m) => m.spot.id));
    expect(projection.totalSpots).toBe(layered.length);
    expect(grouped.length).toBe(layered.length);
    expect(new Set(grouped).size).toBe(layered.length);
  });

  it("keeps layer hit counts consistent with the members of each group", () => {
    for (const group of projection.groups) {
      expect(group.layerHitCounts.length).toBe(CHRONOLOGICAL_STRATA.length);
      CHRONOLOGICAL_STRATA.forEach((layer, index) => {
        const expected = group.members.filter((m) =>
          m.membership.strata.some((s) => s.id === layer.id),
        ).length;
        expect(group.layerHitCounts[index]).toBe(expected);
      });
    }
  });

  it("only builds sanctuary complexes that satisfy the declared conditions", () => {
    expect(projection.complexes.length).toBeGreaterThan(0);
    for (const complex of projection.complexes) {
      expect(complex.members.length).toBeGreaterThanOrEqual(SANCTUARY_COMPLEX_MIN_SPOTS);
      expect(complex.members[0].membership.strataCount).toBeGreaterThanOrEqual(
        SANCTUARY_COMPLEX_MIN_ANCHOR_DEPTH,
      );
      const counts = complex.members.map((m) => m.membership.strataCount);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    }
  });

  it("pairs the multi-layer shrine with its less-layered companion spots", () => {
    const complexOf = (profileId: string) =>
      projection.complexes.find((complex) => complex.profileId === profileId);

    const usa = complexOf("stratigraphy-usa-omoto");
    expect(usa).toBeDefined();
    const usaDepth = new Map(usa!.members.map((m) => [m.spot.id, m.membership.strataCount]));
    expect(usaDepth.get("usa-jingu")).toBe(CHRONOLOGICAL_STRATA.length);
    expect(usaDepth.get("omoto-jinja")).toBe(1);

    expect(complexOf("stratigraphy-itsukushima-misen")).toBeDefined();
    expect(complexOf("stratigraphy-ino-yamada-saigu")).toBeDefined();
  });

  it("does not form a complex from a single mapped spot or from a shallow temple network", () => {
    const profileIds = projection.complexes.map((complex) => complex.profileId);
    // 宗像: 地図上のスポットが辺津宮のみ（沖ノ島は未登録）
    expect(profileIds).not.toContain("stratigraphy-munakata-okinoshima");
    // 国東: 寺院ネットワークで中核の層数が条件未満
    expect(profileIds).not.toContain("stratigraphy-kunisaki-rokugo");
  });

  it("never mixes the Shikanoshima spots into a Munakata complex", () => {
    const memberIds = projection.complexes.flatMap((complex) =>
      complex.members.map((m) => m.spot.id),
    );
    expect(memberIds).not.toContain("spot-okitsumiya");
    expect(memberIds).not.toContain("spot-nakatsumiya-kofun");
  });
});

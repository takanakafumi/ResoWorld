import { describe, expect, it } from "vitest";
import { CHRONOLOGICAL_STRATA, spotMatchesStratum, filterSpotsByStratum, type StratumLayer } from "./stratum-types";
import type { ReviewAtlasSpot } from "./types";

describe("Chronological Stratum System (祭祀景観の時代地層)", () => {
  const getStratum = (code: string): StratumLayer => {
    const found = CHRONOLOGICAL_STRATA.find((s) => s.code === code);
    if (!found) throw new Error(`Stratum with code ${code} not found`);
    return found;
  };

  const animismLayer = getStratum("animism");
  const ancientStateLayer = getStratum("ancient-state");
  const ritsuryoLayer = getStratum("ritsuryo");
  const syncretismLayer = getStratum("syncretism");
  const modernLayer = getStratum("modern-reconstruction");

  it("maintains 5 orderly strata from prehistoric animism to modern reconstruction", () => {
    expect(CHRONOLOGICAL_STRATA).toHaveLength(5);
    expect(CHRONOLOGICAL_STRATA.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
  });

  describe("Spot matching and stratigraphic overlap (重層性)", () => {
    const spots: ReviewAtlasSpot[] = [
      {
        id: "spot-okinoshima",
        name: "沖ノ島（沖津宮）",
        region: "宗像・玄界灘",
        kind: "神社",
        latitude: 34.24,
        longitude: 130.1,
        claimIds: [],
      },
      {
        id: "spot-munakata-taisha",
        name: "宗像大社（辺津宮）",
        region: "宗像",
        kind: "大社",
        latitude: 33.83,
        longitude: 130.51,
        claimIds: [],
      },
      {
        id: "spot-hiratsuka-kawazoe",
        name: "平塚川添遺跡",
        region: "朝倉",
        kind: "遺跡・歴史公園",
        latitude: 33.4,
        longitude: 130.65,
        claimIds: [],
      },
      {
        id: "spot-itsukushima",
        name: "厳島神社",
        region: "宮島",
        kind: "神社",
        latitude: 34.29,
        longitude: 132.31,
        claimIds: [],
      },
      {
        id: "spot-misen-daishoin",
        name: "弥山大聖院",
        region: "宮島",
        kind: "寺院",
        latitude: 34.29,
        longitude: 132.31,
        claimIds: [],
      },
      {
        id: "spot-shirakami",
        name: "白神社",
        region: "広島城下",
        kind: "神社",
        latitude: 34.39,
        longitude: 132.45,
        claimIds: [],
      },
    ];

    it("matches Layer 1 (Animism & Prehistoric Nature Worship)", () => {
      // 沖ノ島（孤島巨石祭祀）、平塚川添（弥生拠点遺跡）、厳島（島嶼神域）
      expect(spotMatchesStratum(spots[0], animismLayer)).toBe(true); // 沖ノ島
      expect(spotMatchesStratum(spots[2], animismLayer)).toBe(true); // 平塚川添遺跡
      expect(spotMatchesStratum(spots[3], animismLayer)).toBe(true); // 厳島
      expect(spotMatchesStratum(spots[5], animismLayer)).toBe(false); // 白神社は近世城下
    });

    it("matches Layer 2 (Ancient State Ritual & Marine Chieftains)", () => {
      // 宗像大社、沖ノ島（国家航海祭祀）
      expect(spotMatchesStratum(spots[0], ancientStateLayer)).toBe(true); // 沖ノ島
      expect(spotMatchesStratum(spots[1], ancientStateLayer)).toBe(true); // 宗像大社
      expect(spotMatchesStratum(spots[2], ancientStateLayer)).toBe(false); // 平塚川添は先史
    });

    it("matches Layer 3 (Ritsuryo Shinto, Shikinaisha & Ichinomiya)", () => {
      // 厳島神社（安芸国一宮・式内名神大社）、宗像大社（式内大社）
      expect(spotMatchesStratum(spots[1], ritsuryoLayer)).toBe(true); // 宗像
      expect(spotMatchesStratum(spots[3], ritsuryoLayer)).toBe(true); // 厳島
      expect(spotMatchesStratum(spots[2], ritsuryoLayer)).toBe(false); // 遺跡
    });

    it("matches Layer 4 (Syncretism & Shugendo Mountain Asceticism)", () => {
      // 弥山大聖院（修験・神宮寺）
      expect(spotMatchesStratum(spots[4], syncretismLayer)).toBe(true); // 弥山大聖院
      expect(spotMatchesStratum(spots[2], syncretismLayer)).toBe(false); // 遺跡
    });

    it("matches Layer 5 (Early Modern Feudal & Modern Shinto Restructuring)", () => {
      // 白神社（広島城下鎮守）
      expect(spotMatchesStratum(spots[5], modernLayer)).toBe(true); // 白神社
    });

    it("demonstrates stratigraphic overlap on multi-layered sacred places (沖ノ島 / 厳島)", () => {
      // 沖ノ島は第1層（孤島巨石）と第2層（国家航海祭祀）の複層性を持つ
      expect(spotMatchesStratum(spots[0], animismLayer)).toBe(true);
      expect(spotMatchesStratum(spots[0], ancientStateLayer)).toBe(true);

      // 厳島は第1層（島嶼神域）と第3層（安芸国一宮・延喜式）の複層性を持つ
      expect(spotMatchesStratum(spots[3], animismLayer)).toBe(true);
      expect(spotMatchesStratum(spots[3], ritsuryoLayer)).toBe(true);
    });

    it("filters spots collection by stratum layer correctly", () => {
      const animismSpots = filterSpotsByStratum(spots, animismLayer);
      expect(animismSpots.map((s) => s.id)).toContain("spot-okinoshima");
      expect(animismSpots.map((s) => s.id)).toContain("spot-hiratsuka-kawazoe");
      expect(animismSpots.map((s) => s.id)).toContain("spot-itsukushima");
      expect(animismSpots.map((s) => s.id)).not.toContain("spot-shirakami");
    });
  });
});

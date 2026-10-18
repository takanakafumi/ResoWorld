import { describe, expect, it } from "vitest";
import {
  CHRONOLOGICAL_STRATA,
  spotMatchesStratum,
  filterSpotsByStratum,
  getSpotStratumMemberships,
  type StratumLayer,
} from "./stratum-types";
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

    it("computes spot stratum memberships and flags multi-layered sacred places", () => {
      const memberships = getSpotStratumMemberships(spots);
      const okinoshima = memberships.get("spot-okinoshima");
      expect(okinoshima?.isMultiLayered).toBe(true);
      expect(okinoshima?.strataCount).toBeGreaterThanOrEqual(2);

      const shirakami = memberships.get("spot-shirakami");
      expect(shirakami?.isMultiLayered).toBe(false);
      expect(shirakami?.strataCount).toBe(1);
    });
  });

  describe("Dataset-wide Historical Invariants & Cross-Journey Balance (再発防止ガード)", () => {
    it("never matches modern utility spots (museums, stations, hotels, restaurants, michi-no-eki)", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const utilitySpots = dataset.atlas.spots.filter(
        (s) =>
          s.kind.includes("博物館") ||
          s.kind.includes("資料館") ||
          s.kind.includes("道の駅") ||
          s.kind === "station" ||
          s.kind === "hotel" ||
          s.kind === "restaurant" ||
          s.name.includes("体験学習館") ||
          s.name.includes("資料館") ||
          s.name.includes("博物館"),
      );
      expect(utilitySpots.length).toBeGreaterThan(0);

      for (const spot of utilitySpots) {
        for (const stratum of CHRONOLOGICAL_STRATA) {
          expect(
            spotMatchesStratum(spot as ReviewAtlasSpot, stratum),
            `Utility spot "${spot.name}" (${spot.kind}) must not match ${stratum.code}`,
          ).toBe(false);
        }
      }
    });

    it("restricts Layer 3 (ritsuryo: 延喜式内社・一宮) strictly to attested Shikinaisha/Ichinomiya shrines", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const hisayamaJourney = dataset.atlas.journeys.find(
        (j) => j.id === "journey-hisayama-kasuya",
      );
      expect(hisayamaJourney).toBeDefined();

      const hisayamaSpots = dataset.atlas.spots.filter((s) =>
        hisayamaJourney!.spotIds.includes(s.id),
      );
      const hisayamaL3Matches = hisayamaSpots.filter((s) =>
        spotMatchesStratum(s as ReviewAtlasSpot, ritsuryoLayer),
      );
      // 久山・糟屋・篠栗エリアには延喜式内社・一宮が存在しないため必ず0件であること
      expect(hisayamaL3Matches.map((s) => s.name)).toEqual([]);
    });

    it("ensures major national sacred sites have >= 3 strata and outrank local shrine journeys in stratigraphic density", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const spots = dataset.atlas.spots as ReviewAtlasSpot[];
      const memberships = getSpotStratumMemberships(spots);

      // 全国級の大社（厳島・宗像・宇佐・志賀海）は3層以上の重層性を持つこと
      for (const majorName of ["厳島神社", "宗像大社 辺津宮", "宇佐神宮", "志賀海神社"]) {
        const spot = spots.find((s) => s.name === majorName);
        expect(spot, `${majorName} should exist in dataset`).toBeDefined();
        const m = memberships.get(spot!.id);
        expect(
          m?.strataCount ?? 0,
          `${majorName} should span >= 3 chronological strata`,
        ).toBeGreaterThanOrEqual(3);
      }

      // 旅程ごとの平均地層数（有効スポットあたり）で、宗像・国東や海の中道・志賀島が久山・糟屋・篠栗を上回ること
      const avgStrataForJourney = (journeyId: string): number => {
        const j = dataset.atlas.journeys.find((x) => x.id === journeyId)!;
        const jSpots = spots.filter((s) => j.spotIds.includes(s.id));
        const activeSpots = jSpots.filter(
          (s) => (memberships.get(s.id)?.strataCount ?? 0) > 0,
        );
        const totalStrata = activeSpots.reduce(
          (acc, s) => acc + (memberships.get(s.id)?.strataCount ?? 0),
          0,
        );
        return activeSpots.length > 0 ? totalStrata / activeSpots.length : 0;
      };

      const munakataDensity = avgStrataForJourney("munakata-kunisaki");
      const miyajimaDensity = avgStrataForJourney("journey-miyajima-misen-review-draft");
      const hisayamaDensity = avgStrataForJourney("journey-hisayama-kasuya");

      expect(munakataDensity).toBeGreaterThan(hisayamaDensity);
      expect(miyajimaDensity).toBeGreaterThan(hisayamaDensity);
    });
  });
});

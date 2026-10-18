import { describe, expect, it } from "vitest";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
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

  describe("Evidence-Driven Invariants & Anti-Bias Guards (順方向の因果ガード)", () => {
    it("Guard 1 (根拠駆動の公平性): evaluates spots strictly by their Claim evidence without journey or shrine-name bias", () => {
      const claimId = "claim-test-evidence-1";
      const claimsById = buildClaimsByIdMap([
        {
          schemaVersion: "0.2.0",
          id: claimId,
          statement:
            "本殿背後に巨岩の磐座と前方後円墳が存在し、江戸時代には宝満派の山伏が祭祀を司り、福岡藩主黒田光之により再建された。",
          subject: { name: "テスト社", type: "Place" },
          predicate: "has_feature",
          object: { kind: "literal", value: "重層祭祀" },
          qualifiers: {},
          claimKind: "observation",
          originType: "imported",
          reviewStatus: "confirmed",
          epistemic: { verification: "unverified", modality: "asserted" },
          historicalTime: { kind: "unknown" },
          places: [],
          evidence: [],
          createdAt: "2026-10-18T00:00:00Z",
        },
      ]);

      const spotInOldJourney: ReviewAtlasSpot = {
        id: "spot-old-unknown",
        name: "無名古社A",
        region: "朝倉",
        kind: "神社",
        latitude: 33.4,
        longitude: 130.6,
        claimIds: [claimId],
      };

      const spotInNewJourney: ReviewAtlasSpot = {
        id: "spot-new-unknown",
        name: "無名村社B",
        region: "糟屋",
        kind: "神社",
        latitude: 33.6,
        longitude: 130.5,
        claimIds: [claimId],
      };

      const memberships = getSpotStratumMemberships(
        [spotInOldJourney, spotInNewJourney],
        CHRONOLOGICAL_STRATA,
        { claimsById },
      );

      // 社名リスト（knownSpotTokens）に無くても、同じClaim根拠を持つ神社は旅程を問わず全く同じ地層（L1:巨岩/磐座, L2:前方後円墳, L4:山伏, L5:黒田光之再建）として判定されること
      expect(memberships.get("spot-old-unknown")?.strata.map((s) => s.order)).toEqual([1, 2, 4, 5]);
      expect(memberships.get("spot-new-unknown")?.strata.map((s) => s.order)).toEqual([1, 2, 4, 5]);
    });

    it("Guard 2 (比較接続からの汚染防止): does not leak Layer 3 (ritsuryo) onto a spot merely because it is an endpoint of a comparative connection", () => {
      const localShrine: ReviewAtlasSpot = {
        id: "spot-local-village-shrine",
        name: "テスト村社",
        region: "糟屋",
        kind: "神社",
        latitude: 33.6,
        longitude: 130.5,
        claimIds: [],
      };

      const matched = spotMatchesStratum(localShrine, ritsuryoLayer, {
        connections: [
          {
            id: "conn-comparative",
            connectionKind: "comparative",
            initialStatus: "confirmed",
            eyebrow: "比較",
            title: "延喜式神名帳との祭神構成比較",
            summary: "比較接続",
            spotIds: ["spot-local-village-shrine"],
            claimIds: [],
            concepts: [],
            facets: [],
            topicId: "shikinaisha-network-preset",
            eras: [],
          },
        ],
      });

      expect(matched).toBe(false);
    });

    it("recognizes Koso Shrine as a multi-layered site (sacred mountain + ancient fortress + ritsuryo + castle defense)", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);
      const koso = dataset.atlas.spots.find((s) => s.name === "高祖神社");
      expect(koso).toBeDefined();

      const memberships = getSpotStratumMemberships([koso as ReviewAtlasSpot], CHRONOLOGICAL_STRATA, { claimsById });
      const kosoMembership = memberships.get(koso!.id);

      expect(kosoMembership).toBeDefined();
      expect(kosoMembership?.isMultiLayered).toBe(true);
      expect(kosoMembership?.strataCount).toBeGreaterThanOrEqual(4);
      const codes = kosoMembership?.strata.map((s) => s.code) ?? [];
      // Animism (自然の聖地・神体山)
      expect(codes.includes("animism")).toBe(true);
      // Ancient State (怡土城跡・古代山城)
      expect(codes.includes("ancient-state")).toBe(true);
      // Ritsuryo (式内社)
      expect(codes.includes("ritsuryo")).toBe(true);
      // Modern / Defensive Castle (防衛拠点・山城)
      expect(codes.includes("modern-reconstruction")).toBe(true);
    });


    it("Guard 3 (非祭祀施設の除外): never matches modern utility spots (museums, stations, hotels, restaurants, michi-no-eki)", async () => {

      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);
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
            spotMatchesStratum(spot as ReviewAtlasSpot, stratum, { claimsById }),
            `Utility spot "${spot.name}" (${spot.kind}) must not match ${stratum.code}`,
          ).toBe(false);
        }
      }
    });
  });
});

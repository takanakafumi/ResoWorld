import { describe, expect, it } from "vitest";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
  detectSpotStratumMatch,
  getSpotStratumDetailReport,
  spotMatchesStratum,
  filterSpotsByStratum,
  getSpotStratumMemberships,
  isClaimEvidenceExemptOrNegated,
  resolveNonStratumReason,
  type StratumLayer,
} from "./stratum-types";
import {
  isPrimarySiteForStratigraphy,
  resolveSpotStratigraphyProfile,
} from "../knowledge/stratigraphy-profiles";
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

    it("recognizes Koso Shrine as a multi-layered site (sacred mountain + ancient fortress + ritsuryo + medieval castle defense)", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);
      const koso = dataset.atlas.spots.find((s) => s.name === "高祖神社");
      expect(koso).toBeDefined();

      const memberships = getSpotStratumMemberships([koso as ReviewAtlasSpot], CHRONOLOGICAL_STRATA, { claimsById });
      const kosoMembership = memberships.get(koso!.id);

      expect(kosoMembership).toBeDefined();
      expect(kosoMembership?.isMultiLayered).toBe(true);
      expect(kosoMembership?.strataCount).toBe(4);
      const codes = kosoMembership?.strata.map((s) => s.code) ?? [];
      // Animism (自然の聖地・神体山)
      expect(codes.includes("animism")).toBe(true);
      // Ancient State (怡土城跡・古代山城)
      expect(codes.includes("ancient-state")).toBe(true);
      // Ritsuryo (式内社)
      expect(codes.includes("ritsuryo")).toBe(true);
      // Syncretism / Medieval Warrior Defense (防衛拠点・中世山城・高祖城)
      expect(codes.includes("syncretism")).toBe(true);

      // Verify detailed stratigraphic column report with grounded evidence
      const report = getSpotStratumDetailReport(koso as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(report.matchedCount).toBe(4);
      expect(report.details).toHaveLength(5);

      // L4 is syncretism / medieval warrior fortress (高祖山防衛拠点・高祖城)
      const l4 = report.details.find((d) => d.layer.order === 4);
      expect(l4?.matched).toBe(true);
      expect(l4?.basis?.kind).toBe("claim_observation");
      expect(l4?.basis?.evidenceQuote).toContain("防衛拠点");

      // L2 is ancient state (order 2, 怡土城)
      const l2 = report.details.find((d) => d.layer.order === 2);
      expect(l2?.matched).toBe(true);
      expect(l2?.basis?.kind).toBe("claim_observation");
      expect(l2?.basis?.evidenceQuote).toContain("怡土城");
    });

    it("verifies 5-layer complete stratigraphy on Munakata Taisha and Usa Jingu via profile and claim grounding", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // Munakata Taisha (宗像大社)
      const munakata = dataset.atlas.spots.find((s) => s.name === "宗像大社 辺津宮");
      expect(munakata).toBeDefined();
      const munakataReport = getSpotStratumDetailReport(munakata as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(munakataReport.matchedCount).toBe(5);
      expect(munakataReport.details.every((d) => d.matched)).toBe(true);

      // Usa Jingu (宇佐神宮)
      const usa = dataset.atlas.spots.find((s) => s.name === "宇佐神宮");
      expect(usa).toBeDefined();
      const usaReport = getSpotStratumDetailReport(usa as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(usaReport.matchedCount).toBe(5);
      expect(usaReport.details.every((d) => d.matched)).toBe(true);
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

    it("Guard 4 (エンティティ汚染防止 / Strict Entity Resolution): prevents substring hazards and cross-regional profile inheritance", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // 1. 和白・大神神社 (福岡市東区) must not inherit 大和・三輪山 大神神社 (5 strata)
      const wajiro = dataset.atlas.spots.find((s) => s.id === "spot-wajiro-oogami");
      expect(wajiro).toBeDefined();
      const wajiroProfile = resolveSpotStratigraphyProfile(wajiro!);
      expect(wajiroProfile).toBeUndefined(); // Strictly isolated from Yamato Miwa profile

      const wajiroReport = getSpotStratumDetailReport(wajiro as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(wajiroReport.matchedCount).toBe(1); // Exactly 1 stratum: L2 (宮前古墳)
      expect(wajiroReport.details.find((d) => d.layer.order === 1)?.matched).toBe(false);
      expect(wajiroReport.details.find((d) => d.layer.order === 2)?.matched).toBe(true);
      expect(wajiroReport.details.find((d) => d.layer.order === 3)?.matched).toBe(false);
      expect(wajiroReport.details.find((d) => d.layer.order === 4)?.matched).toBe(false);
      expect(wajiroReport.details.find((d) => d.layer.order === 5)?.matched).toBe(false);

      // 2. 広島・宮島の大元神社 must not match 宇佐神宮・御許山大元神社
      const miyajimaOmoto = dataset.atlas.spots.find((s) => s.id === "spot-import-93854014");
      expect(miyajimaOmoto).toBeDefined();
      const miyajimaOmotoProfile = resolveSpotStratigraphyProfile(miyajimaOmoto!);
      expect(miyajimaOmotoProfile?.id).not.toBe("stratigraphy-usa-omoto");

      // 3. 志賀島・勝馬の沖津宮 must not match 宗像大社・沖ノ島 沖津宮
      const shikaOkitsu = dataset.atlas.spots.find((s) => s.id === "spot-okitsumiya");
      expect(shikaOkitsu).toBeDefined();
      const shikaOkitsuProfile = resolveSpotStratigraphyProfile(shikaOkitsu!);
      expect(shikaOkitsuProfile?.id).not.toBe("stratigraphy-munakata-okinoshima");

      // 4. Hisayama local village kofun shrines must not inherit the Ino/Hisayama complex profile
      const independentVillageIds = [
        "spot-hebi-hachiman",
        "spot-otomiya-kofun",
      ];
      for (const spotId of independentVillageIds) {
        const spot = dataset.atlas.spots.find((s) => s.id === spotId);
        expect(spot).toBeDefined();
        const profile = resolveSpotStratigraphyProfile(spot!);
        expect(profile).toBeUndefined();
      }

      // The 4 shrines forming the documented Hisayama sanctuary complex resolve to stratigraphy-ino-yamada-saigu
      const hisayamaComplexIds = [
        "spot-ino-tenshoko-daijingu",
        "spot-yamada-saigu",
        "spot-saniwa-jinja",
        "spot-rokushogu-ato",
      ];
      for (const spotId of hisayamaComplexIds) {
        const spot = dataset.atlas.spots.find((s) => s.id === spotId);
        expect(spot).toBeDefined();
        expect(resolveSpotStratigraphyProfile(spot!)?.id).toBe("stratigraphy-ino-yamada-saigu");
      }
    });

    it("Guard 5 (コンテキスト極性・除外ガード / Context Polarity & Exemption): correctly distinguishes pre-separation survival (L4) from modern reconstruction (L5)", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // Unit test polarity exemption helper
      expect(
        isClaimEvidenceExemptOrNegated(
          "境内に阿弥陀堂や鐘を存置し、神仏分離以前の習合景観を色濃く残している。",
          "modern-reconstruction",
          "神仏分離",
        ),
      ).toBe(true);

      expect(
        isClaimEvidenceExemptOrNegated(
          "廃仏毀釈を免れ阿弥陀堂が現存",
          "modern-reconstruction",
          "廃仏毀釈",
        ),
      ).toBe(true);

      expect(
        isClaimEvidenceExemptOrNegated(
          "明治の神仏分離を経て官幣大社へ列格した",
          "modern-reconstruction",
          "神仏分離",
        ),
      ).toBe(false);

      // 和田八幡宮（刻線の石） must be exactly 3 strata (L1: 刻線の石, L2: 八幡神功, L4: 阿弥陀堂習合), NOT L5
      const wada = dataset.atlas.spots.find((s) => s.id === "spot-wada-hachimangu");
      expect(wada).toBeDefined();

      const wadaReport = getSpotStratumDetailReport(wada as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(wadaReport.matchedCount).toBe(3);

      const l1 = wadaReport.details.find((d) => d.layer.order === 1);
      expect(l1?.matched).toBe(true);
      expect(l1?.basis?.matchedToken).toContain("刻線の石");

      const l2 = wadaReport.details.find((d) => d.layer.order === 2);
      expect(l2?.matched).toBe(true);

      const l3 = wadaReport.details.find((d) => d.layer.order === 3);
      expect(l3?.matched).toBe(false);

      const l4 = wadaReport.details.find((d) => d.layer.order === 4);
      expect(l4?.matched).toBe(true);
      expect(l4?.basis?.matchedToken).toMatch(/阿弥陀堂|神仏習合/);

      const l5 = wadaReport.details.find((d) => d.layer.order === 5);
      expect(l5?.matched).toBe(false); // Suppressed by Guard 5!
    });

    it("Guard 6 (主座・衛星スポットの地層二層分離 / Primary vs Satellite Stratum Decoupling): calculates spot strata strictly on spot evidence while preserving context profile reading", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // --- 1. 久山・糟屋聖域群（伊野・山田・審神者・六所） ---
      const ino = dataset.atlas.spots.find((s) => s.id === "spot-ino-tenshoko-daijingu");
      const yamada = dataset.atlas.spots.find((s) => s.id === "spot-yamada-saigu");
      const saniwa = dataset.atlas.spots.find((s) => s.id === "spot-saniwa-jinja");
      const rokusho = dataset.atlas.spots.find((s) => s.id === "spot-rokushogu-ato");

      expect(ino).toBeDefined();
      expect(yamada).toBeDefined();
      expect(saniwa).toBeDefined();
      expect(rokusho).toBeDefined();

      // 全スポットが同一の広域聖域プロファイルを参照（UIでの背景解説7項目は一切損なわれない）
      const inoProfile = resolveSpotStratigraphyProfile(ino!);
      expect(inoProfile?.id).toBe("stratigraphy-ino-yamada-saigu");
      expect(resolveSpotStratigraphyProfile(yamada!)?.id).toBe("stratigraphy-ino-yamada-saigu");
      expect(resolveSpotStratigraphyProfile(saniwa!)?.id).toBe("stratigraphy-ino-yamada-saigu");
      expect(resolveSpotStratigraphyProfile(rokusho!)?.id).toBe("stratigraphy-ino-yamada-saigu");

      // 主座判定：伊野天照皇大神宮のみが主座（primary）
      expect(isPrimarySiteForStratigraphy(ino!, inoProfile!)).toBe(true);
      expect(isPrimarySiteForStratigraphy(yamada!, inoProfile!)).toBe(false);
      expect(isPrimarySiteForStratigraphy(saniwa!, inoProfile!)).toBe(false);
      expect(isPrimarySiteForStratigraphy(rokusho!, inoProfile!)).toBe(false);

      // 地層判定：主座は全5層、衛星スポットは個別物証のみで判定
      const inoReport = getSpotStratumDetailReport(ino as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(inoReport.matchedCount).toBe(5);

      // 山田邑斎宮：『日本書紀』神功皇后・斎宮伝承（L2）の1層（社殿改変等の物証はなく古代祭祀地に純化）
      const yamadaReport = getSpotStratumDetailReport(yamada as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(yamadaReport.matchedCount).toBe(1);
      expect(yamadaReport.matchedLayers.map((l) => l.code)).toEqual(["ancient-state"]);

      // 審神者神社：『日本書紀』神功皇后・中臣（L2）＋ 慶長（L5）の2層
      const saniwaReport = getSpotStratumDetailReport(saniwa as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(saniwaReport.matchedCount).toBe(2);
      expect(saniwaReport.matchedLayers.map((l) => l.code).sort()).toEqual(["ancient-state", "modern-reconstruction"].sort());

      // 六所宮跡：慶長年間移転・黒田藩（L5）の1層
      const rokushoReport = getSpotStratumDetailReport(rokusho as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(rokushoReport.matchedCount).toBe(1);
      expect(rokushoReport.matchedLayers.map((l) => l.code)).toEqual(["modern-reconstruction"]);

      // --- 2. 宇佐・御許山信仰圏（宇佐神宮 vs 御許山・大元神社） ---
      const usa = dataset.atlas.spots.find((s) => s.id === "usa-jingu");
      const omoto = dataset.atlas.spots.find((s) => s.id === "omoto-jinja");
      expect(usa).toBeDefined();
      expect(omoto).toBeDefined();

      const usaProfile = resolveSpotStratigraphyProfile(usa!);
      expect(usaProfile?.id).toBe("stratigraphy-usa-omoto");
      expect(resolveSpotStratigraphyProfile(omoto!)?.id).toBe("stratigraphy-usa-omoto");

      expect(isPrimarySiteForStratigraphy(usa!, usaProfile!)).toBe(true);
      expect(isPrimarySiteForStratigraphy(omoto!, usaProfile!)).toBe(false);

      // 宇佐神宮は全5層
      const usaReport = getSpotStratumDetailReport(usa as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(usaReport.matchedCount).toBe(5);

      // 御許山・大元神社は純粋な山岳祭祀・磐座（L1）の1層
      const omotoReport = getSpotStratumDetailReport(omoto as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(omotoReport.matchedCount).toBe(1);
      expect(omotoReport.matchedLayers.map((l) => l.code)).toEqual(["animism"]);

      // --- 3. 厳島・弥山聖域群（厳島神社 vs 弥山山頂・御山神社・大聖院） ---
      const itsukushima = dataset.atlas.spots.find((s) => s.id === "spot-import-3048de44");
      const misenSummit = dataset.atlas.spots.find((s) => s.id === "spot-import-ce520293");
      const misenShrine = dataset.atlas.spots.find((s) => s.id === "spot-import-ce8f62f9");
      const daishoin = dataset.atlas.spots.find((s) => s.id === "spot-quick-7f78b183ba010594");

      expect(itsukushima).toBeDefined();
      expect(misenSummit).toBeDefined();
      expect(misenShrine).toBeDefined();
      expect(daishoin).toBeDefined();

      const itsukushimaProfile = resolveSpotStratigraphyProfile(itsukushima!);
      expect(itsukushimaProfile?.id).toBe("stratigraphy-itsukushima-misen");
      expect(resolveSpotStratigraphyProfile(misenSummit!)?.id).toBe("stratigraphy-itsukushima-misen");
      expect(resolveSpotStratigraphyProfile(misenShrine!)?.id).toBe("stratigraphy-itsukushima-misen");
      expect(resolveSpotStratigraphyProfile(daishoin!)?.id).toBe("stratigraphy-itsukushima-misen");

      expect(isPrimarySiteForStratigraphy(itsukushima!, itsukushimaProfile!)).toBe(true);
      expect(isPrimarySiteForStratigraphy(misenSummit!, itsukushimaProfile!)).toBe(false);
      expect(isPrimarySiteForStratigraphy(misenShrine!, itsukushimaProfile!)).toBe(false);
      expect(isPrimarySiteForStratigraphy(daishoin!, itsukushimaProfile!)).toBe(false);

      // 厳島神社は全5層
      const itsukushimaReport = getSpotStratumDetailReport(itsukushima as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(itsukushimaReport.matchedCount).toBe(5);

      // 弥山山頂：自然山岳（L1）＋ 空海・修験霊場（L4）の2層
      const misenSummitReport = getSpotStratumDetailReport(misenSummit as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(misenSummitReport.matchedCount).toBe(2);
      expect(misenSummitReport.matchedLayers.map((l) => l.code).sort()).toEqual(["animism", "syncretism"].sort());

      // 御山神社：巨岩（L1）＋ 宗像三女神（L2）の2層
      const misenShrineReport = getSpotStratumDetailReport(misenShrine as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(misenShrineReport.matchedCount).toBe(2);
      expect(misenShrineReport.matchedLayers.map((l) => l.code).sort()).toEqual(["animism", "ancient-state"].sort());

      // 大聖院：寺院・真言密教（L4）の1層
      const daishoinReport = getSpotStratumDetailReport(daishoin as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(daishoinReport.matchedCount).toBe(1);
      expect(daishoinReport.matchedLayers.map((l) => l.code)).toEqual(["syncretism"]);
    });

    it("Guard 7 (地層適格性と現代宗教景観の分離 / Stratigraphic Eligibility & Modern Landscape Non-Stratum): completely excludes modern autonomous creations lacking site continuity from the stratigraphy map", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // 宝満神宮寺（根本山宝満堂）: 1994年以降造成の単立宗教法人・構想先行型（ラベルC）
      const homanShinguji = dataset.atlas.spots.find((s) => s.id === "spot-homan-shinguji");
      expect(homanShinguji).toBeDefined();

      const homanProfile = resolveSpotStratigraphyProfile(homanShinguji!);
      expect(homanProfile).toBeDefined();
      expect(homanProfile?.historicalNature).toBe("C_LATER_RECONSTITUTION");
      expect(homanProfile?.formationModel).toBe("conception_driven");

      // 地層適格性判定：土地の歴史的連続性を持たない現代新設単立法人は地層対象外（Non-Stratum）
      const report = getSpotStratumDetailReport(homanShinguji as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(report.matchedCount).toBe(0);
      expect(report.matchedLayers).toHaveLength(0);

      // 「和の宮磐座」「八大龍王神」「宝満神宮寺」という語がClaimや名前に含まれていても、
      // L1（古代アニミズム）や L4（中世神仏習合）には 1 つもマッチしない（古層祭祀マップの清浄性保証）
      const animismDetail = report.details.find((d) => d.layer.code === "animism");
      const syncretismDetail = report.details.find((d) => d.layer.code === "syncretism");
      const modernDetail = report.details.find((d) => d.layer.code === "modern-reconstruction");
      expect(animismDetail?.matched).toBe(false);
      expect(syncretismDetail?.matched).toBe(false);
      expect(modernDetail?.matched).toBe(false);
    });

    it("Guard 8 (時代レンジ整合と近現代村社再編 / Era Temporal Alignment & Modern Village Shrine Reorganization): correctly includes historical village shrine mergers into Layer 5 while preserving bedrock claims", async () => {
      const dataset = (await import("../../data/published-review-dataset.json")).default;
      const claimsById = buildClaimsByIdMap(dataset.claims as never);

      // 1. 古賀神社: 昭和27年（1952年）の旧4社合祀（浦口・皇石・貴布祢・日若）による地域祭祀再編
      const kogaJinja = dataset.atlas.spots.find((s) => s.id === "spot-koga-jinja");
      expect(kogaJinja).toBeDefined();

      const kogaReport = getSpotStratumDetailReport(kogaJinja as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      // 昭和27年合祀Claimに基づき、正当に Layer 5（近代・現代の再編と造営）にマッチ
      expect(kogaReport.matchedCount).toBeGreaterThanOrEqual(1);
      const kogaL5 = kogaReport.details.find((d) => d.layer.code === "modern-reconstruction");
      expect(kogaL5?.matched).toBe(true);
      expect(kogaL5?.basis?.matchedToken).toMatch(/合祀/);

      // 2. 山田邑斎宮（小山田斎宮跡）: 神功皇后・記紀伝承・古代国家祭祀
      const yamadaSaigu = dataset.atlas.spots.find((s) => s.id === "spot-yamada-saigu");
      expect(yamadaSaigu).toBeDefined();

      const saiguReport = getSpotStratumDetailReport(yamadaSaigu as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(saiguReport.matchedCount).toBeGreaterThanOrEqual(1);
      const saiguL2 = saiguReport.details.find((d) => d.layer.code === "ancient-state");
      expect(saiguL2?.matched).toBe(true);

      // 3. 太祖神社 下宮: 古代神功伝承・若杉山麓祭祀（L2）＋ 中世神仏習合修験配祀（L4）＋ 近代再建（L5）の重層性
      const taisoGegu = dataset.atlas.spots.find((s) => s.id === "spot-taiso-jinja-gegu");
      expect(taisoGegu).toBeDefined();

      const taisoReport = getSpotStratumDetailReport(taisoGegu as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(taisoReport.matchedCount).toBeGreaterThanOrEqual(3);
      expect(taisoReport.matchedLayers.map((l) => l.code)).toEqual(
        expect.arrayContaining(["ancient-state", "syncretism", "modern-reconstruction"]),
      );

      // 4. 三雲南小路遺跡・平原遺跡（伊都国王墓）: 首長墓・王墓・副葬鏡群による古代国家・首長層（L2）および原初弥生層（L1）への正当なマッチ
      const mikumo = dataset.atlas.spots.find((s) => s.name === "三雲南小路遺跡");
      expect(mikumo).toBeDefined();
      const mikumoReport = getSpotStratumDetailReport(mikumo as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(mikumoReport.matchedCount).toBeGreaterThanOrEqual(1);
      expect(mikumoReport.matchedLayers.map((l) => l.code)).toContain("ancient-state");

      const hirabaru = dataset.atlas.spots.find((s) => s.name === "平原遺跡");
      expect(hirabaru).toBeDefined();
      const hirabaruReport = getSpotStratumDetailReport(hirabaru as ReviewAtlasSpot, CHRONOLOGICAL_STRATA, { claimsById });
      expect(hirabaruReport.matchedCount).toBeGreaterThanOrEqual(1);
      expect(hirabaruReport.matchedLayers.map((l) => l.code)).toContain("ancient-state");
    });
  });

  describe("Non-Stratum Reason Resolution (地層対象外理由の客観的4分類 / Issue #34)", () => {
    it("correctly classifies museum and archive facilities as museum_archive", () => {
      const spots: ReviewAtlasSpot[] = [
        {
          id: "spot-sue-museum",
          name: "須恵町立歴史民俗資料館",
          region: "粕屋・須恵",
          kind: "博物館・民俗資料館・窯業生活文化",
          latitude: 33.59,
          longitude: 130.51,
          claimIds: [],
        },
        {
          id: "spot-amagi-museum",
          name: "甘木歴史資料館",
          region: "朝倉",
          kind: "博物館・歴史資料館",
          latitude: 33.41,
          longitude: 130.65,
          claimIds: [],
        },
        {
          id: "spot-kyushu-national-museum",
          name: "九州国立博物館",
          region: "太宰府",
          kind: "museum",
          latitude: 33.51,
          longitude: 130.53,
          claimIds: [],
        },
      ];

      for (const spot of spots) {
        const reason = resolveNonStratumReason(spot);
        expect(
          reason,
          `Spot "${spot.name}" (${spot.kind}) must be classified as "museum_archive"`,
        ).toBe("museum_archive");
      }
    });

    it("correctly classifies modern conception-driven religious sites as modern_conception_religious", () => {
      const homanSpot: ReviewAtlasSpot = {
        id: "spot-homan-shinguji",
        name: "宝満神宮寺",
        region: "粕屋・若杉山",
        kind: "寺院・宗教施設・現代宗教景観（構想先行型）",
        latitude: 33.60,
        longitude: 130.53,
        claimIds: [],
      };

      const homanProfile = resolveSpotStratigraphyProfile(homanSpot);
      expect(homanProfile).toBeDefined();

      const reason = resolveNonStratumReason(homanSpot, homanProfile);
      expect(reason).toBe("modern_conception_religious");
    });

    it("correctly classifies transport and lifestyle infrastructure as modern_infrastructure", () => {
      const spots: ReviewAtlasSpot[] = [
        {
          id: "spot-hakata-station",
          name: "博多駅",
          region: "博多",
          kind: "station",
          latitude: 33.59,
          longitude: 130.42,
          claimIds: [],
        },
        {
          id: "spot-michi-no-eki",
          name: "道の駅 むなかた",
          region: "宗像",
          kind: "地域市場・道の駅",
          latitude: 33.85,
          longitude: 130.53,
          claimIds: [],
        },
      ];

      for (const spot of spots) {
        const reason = resolveNonStratumReason(spot);
        expect(
          reason,
          `Spot "${spot.name}" must be classified as "modern_infrastructure"`,
        ).toBe("modern_infrastructure");
      }
    });

    it("falls back to under_investigation for uncategorized spots without stratum evidence", () => {
      const genericSpot: ReviewAtlasSpot = {
        id: "spot-candidate-rock",
        name: "伝承の石碑（未詳）",
        region: "筑前",
        kind: "伝承石碑・石造物",
        latitude: 33.5,
        longitude: 130.5,
        claimIds: [],
      };

      const reason = resolveNonStratumReason(genericSpot);
      expect(reason).toBe("under_investigation");
    });
  });
});

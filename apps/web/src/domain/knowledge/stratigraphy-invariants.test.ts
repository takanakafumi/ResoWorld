import { describe, expect, it } from "vitest";
import {
  REGIONAL_COMPARISON_ENTRIES,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  isPrimarySiteForStratigraphy,
  resolveSpotStratigraphyProfile,
} from "./stratigraphy-profiles";
import {
  CHRONOLOGICAL_STRATA,
  getSpotStratumDetailReport,
  isClaimEvidenceExemptOrNegated,
  resolveNonStratumReason,
} from "../review/stratum-types";
import type { ReviewAtlasSpot } from "../review/types";
import publishedDataset from "@/data/published-review-dataset.json";

/**
 * 祭祀景観・時代地層判定の不変原則（Knowledge Stratigraphy Invariants）CIガードテスト
 * 
 * 参照規程: knowledge-stratigraphy-invariants.md
 * 目的: 新規旅程・スポット・Claim追加時に、地層インフレやエンティティ汚染、
 *      未踏ロマンの過剰装飾が再発するのをCI段階で恒久的に遮断する。
 */
describe("Stratigraphy Invariants & Horizontal Rollout Guard (不変原則CIガード)", () => {
  const spots = publishedDataset.atlas.spots as ReviewAtlasSpot[];
  const claimsById = new Map(
    publishedDataset.claims.map((c: any) => [c.id, c]),
  );

  describe("Principle 1: エンティティ厳格分離の原則 (Anti-Contamination Principle)", () => {
    it("prohibits bare generic shrine nouns in profile spotNames without qualifiers", () => {
      const bareGenericNouns = new Set([
        "八幡宮",
        "八幡神社",
        "大元神社",
        "沖津宮",
        "中津宮",
        "辺津宮",
        "一宮",
        "天満宮",
        "若宮",
        "若宮八幡宮",
        "祇園社",
      ]);

      for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
        for (const name of profile.spotNames) {
          expect(
            bareGenericNouns.has(name),
            `Profile [${profile.id}] contains bare generic name "${name}". Qualify with region or shrine title.`,
          ).toBe(false);
        }
      }
    });

    it("prevents homonymous shrine profile contamination across regions", () => {
      // 1. 和白・大神神社（福岡市東区）が大和三輪山の大神神社プロファイルを吸い上げない
      const wajiroOmiwa = spots.find((s) => s.name === "和白・大神神社");
      if (wajiroOmiwa) {
        const profile = resolveSpotStratigraphyProfile(wajiroOmiwa);
        expect(profile?.id).not.toBe("stratigraphy-omiwa-jinja");
      }

      // 2. 宮島・大元神社（広島県）が宇佐・御許山大元神社プロファイルを吸い上げない
      const miyajimaOmoto = spots.find(
        (s) => s.id === "spot-import-93854014" || (s.name === "大元神社" && s.region === "広島県"),
      );
      if (miyajimaOmoto) {
        const profile = resolveSpotStratigraphyProfile(miyajimaOmoto);
        expect(profile?.id).not.toBe("stratigraphy-usa-omoto");
      }

      // 3. 志賀島 勝馬・沖津宮（福岡県）が宗像大社・沖ノ島沖津宮プロファイルを吸い上げない
      const shikaOkitsu = spots.find(
        (s) => s.name.includes("勝馬") && s.name.includes("沖津宮"),
      );
      if (shikaOkitsu) {
        const profile = resolveSpotStratigraphyProfile(shikaOkitsu);
        expect(profile?.id).not.toBe("stratigraphy-munakata-okinoshima");
      }
    });
  });

  describe("Principle 2: 文脈極性・除外判定の原則 (Context Polarity & Exemption Principle)", () => {
    it("inverts polarity for survival/exemption phrasing such as '神仏分離以前' or '神仏分離を免れ'", () => {
      const survivalPhrases = [
        "神仏分離以前の習合景観を色濃く残している",
        "明治の廃仏毀釈を免れ、現在も阿弥陀堂が境内に残る",
        "神仏分離を経ず、堂宇と社殿が一体として維持されている",
      ];

      for (const phrase of survivalPhrases) {
        const token = phrase.includes("廃仏毀釈") ? "廃仏毀釈" : "神仏分離";
        expect(
          isClaimEvidenceExemptOrNegated(phrase, "modern-reconstruction", token),
          `Phrase "${phrase}" should be recognized as exempt/negated from Layer 5`,
        ).toBe(true);
      }
    });

    it("keeps Wada Hachimangu strictly at 3 layers (Layers 1, 2, 4) without false-positive Layer 5", () => {
      const wada = spots.find((s) => s.name.includes("和田八幡宮"));
      expect(wada).toBeDefined();

      const report = getSpotStratumDetailReport(wada!, CHRONOLOGICAL_STRATA, {
        claimsById,
      });

      expect(report.matchedCount).toBe(3);
      const layerCodes = report.matchedLayers.map((l) => l.code).sort();
      expect(layerCodes).toEqual(["animism", "ancient-state", "syncretism"].sort());
      expect(layerCodes).not.toContain("modern-reconstruction");
    });
  });

  describe("Principle 3: 保守的積層の原則 (Conservative Stratum Attribution)", () => {
    it("strictly restricts 5-layer saturation to certified core historical cultic centers", () => {
      const CERTIFIED_FIVE_LAYER_PRIMARY_CENTERS = new Set([
        "宗像大社 辺津宮",
        "宇佐神宮",
        "厳島神社",
        "志賀海神社",
        "伊野天照皇大神宮",
      ]);

      const fiveLayerSpots = spots.filter((spot) => {
        const report = getSpotStratumDetailReport(spot, CHRONOLOGICAL_STRATA, {
          claimsById,
        });
        return report.matchedCount === 5;
      });

      // 5層に到達しているスポットが認可された大社のみであることを検証
      for (const spot of fiveLayerSpots) {
        expect(
          CERTIFIED_FIVE_LAYER_PRIMARY_CENTERS.has(spot.name),
          `Unexpected 5-layer spot detected: "${spot.name}" (${spot.region}). Only certified core cultic centers can reach 5 layers.`,
        ).toBe(true);
      }

      expect(fiveLayerSpots).toHaveLength(CERTIFIED_FIVE_LAYER_PRIMARY_CENTERS.size);
    });

    it("keeps authentic exploration spots with limited claims (like Umi Hachimangu) conservatively bounded", () => {
      const umi = spots.find((s) => s.id === "spot-quick-85d68993513f4aa2");
      expect(umi).toBeDefined();

      const report = getSpotStratumDetailReport(umi!, CHRONOLOGICAL_STRATA, {
        claimsById,
      });

      // 現状登録された神功皇后伝承Claim（第2層）のみに基づき、勝手に巨木（第1層）や県社（第5層）を水増ししない
      expect(report.matchedCount).toBe(1);
      expect(report.matchedLayers[0].code).toBe("ancient-state");
    });
  });

  describe("Principle 4: ロマン・伝承の階層化・重みづけ原則 (Folklore & Romance Grounding Principle)", () => {
    it("ensures all profiles separate claimedOrigin (Tier B-D) from attested records (Tier A-B)", () => {
      for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
        expect(["B", "C", "D"]).toContain(profile.claimedOrigin.certaintyTier);
        expect(["A", "B"]).toContain(profile.oldestAttestedRecord.certaintyTier);
        expect(profile.oldestAttestedRecord.chronology.compilationEra).toBeDefined();
        expect(profile.oldestAttestedRecord.chronology.targetEra).toBeDefined();
      }
    });
  });

  describe("Principle 5: 主座と衛星スポットの地層二層分離原則 (Primary vs Satellite Decoupling Principle)", () => {
    it("requires every multi-spot profile to explicitly declare primarySpotIds or primarySpotId", () => {
      for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
        const matchedSpots = spots.filter((s) => {
          const resolved = resolveSpotStratigraphyProfile(s);
          return resolved?.id === profile.id;
        });

        // 複数スポットが紐づく広域プロファイルは、必ず主座（primarySpotIds）を明示宣言しなければならない
        if (matchedSpots.length > 1) {
          const hasPrimaryDeclaration = Boolean(
            (profile.primarySpotIds && profile.primarySpotIds.length > 0) ||
              profile.primarySpotId,
          );
          expect(
            hasPrimaryDeclaration,
            `Profile [${profile.id}] matches ${matchedSpots.length} spots but does not declare primarySpotIds!`,
          ).toBe(true);
        }
      }
    });

    it("guarantees satellite spots do not inherit the primary site's 5 layers while maintaining context profile", () => {
      const SATELLITE_VERIFICATION_SUITE = [
        {
          name: "山田邑斎宮",
          expectedLayers: 1,
          profileId: "stratigraphy-ino-yamada-saigu",
        },
        {
          name: "審神者神社",
          expectedLayers: 2,
          profileId: "stratigraphy-ino-yamada-saigu",
        },
        {
          name: "六所宮跡",
          expectedLayers: 1,
          profileId: "stratigraphy-ino-yamada-saigu",
        },
        {
          name: "御許山・大元神社",
          expectedLayers: 1,
          profileId: "stratigraphy-usa-omoto",
        },
        {
          name: "大聖院",
          expectedLayers: 1,
          profileId: "stratigraphy-itsukushima-misen",
        },
        {
          name: "弥山山頂",
          expectedLayers: 2,
          profileId: "stratigraphy-itsukushima-misen",
        },
        {
          name: "御山神社",
          expectedLayers: 2,
          profileId: "stratigraphy-itsukushima-misen",
        },
        {
          name: "熊野磨崖仏",
          expectedLayers: 1,
          profileId: "stratigraphy-kunisaki-rokugo",
        },
      ];

      for (const target of SATELLITE_VERIFICATION_SUITE) {
        const spot = spots.find((s) => s.name === target.name);
        expect(spot, `Spot "${target.name}" must exist in atlas`).toBeDefined();

        const profile = resolveSpotStratigraphyProfile(spot!);
        expect(
          profile?.id,
          `Spot "${target.name}" must resolve to profile "${target.profileId}"`,
        ).toBe(target.profileId);

        // 主座判定：衛星スポットは必ず isPrimary === false
        expect(
          isPrimarySiteForStratigraphy(spot!, profile!),
          `Spot "${target.name}" must NOT be primary for profile "${target.profileId}"`,
        ).toBe(false);

        // 地層判定：主座の5層を引き継がず、個別物証の層数に厳密に抑制される
        const report = getSpotStratumDetailReport(spot!, CHRONOLOGICAL_STRATA, {
          claimsById,
        });
        expect(
          report.matchedCount,
          `Spot "${target.name}" must have exactly ${target.expectedLayers} layers, got ${report.matchedCount}`,
        ).toBe(target.expectedLayers);
      }
    });
  });

  describe("Principle 4: 歴史的性格（A/B/C/U）および形成動態モデルの宣言性・完全性 (ADR-0023 / Issue #32)", () => {
    it("requires 100% of stratigraphy profiles to explicitly declare both historicalNature and formationModel", () => {
      expect(SACRED_SITE_STRATIGRAPHY_PROFILES.length).toBeGreaterThanOrEqual(20);

      for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
        expect(
          profile.historicalNature,
          `Profile [${profile.id}] must explicitly declare historicalNature (A/B/C/U)`,
        ).toBeDefined();

        expect(
          profile.formationModel,
          `Profile [${profile.id}] must explicitly declare formationModel (accumulated/conception_driven/reorganized/composite/undetermined)`,
        ).toBeDefined();
      }
    });

    it("verifies accurate historical nature and formation dynamics for key sacred archetypes", () => {
      // 1. Ancient Bedrock Continuity (宗像大社・大神神社・出雲大社・志賀海神社)
      const munakata = SACRED_SITE_STRATIGRAPHY_PROFILES.find((p) => p.id === "stratigraphy-munakata-okinoshima");
      expect(munakata?.historicalNature).toBe("A_BEDROCK_CONTINUITY");
      expect(munakata?.formationModel).toBe("accumulated");

      const miwa = SACRED_SITE_STRATIGRAPHY_PROFILES.find((p) => p.id === "stratigraphy-miwa-oomiwa");
      expect(miwa?.historicalNature).toBe("A_BEDROCK_CONTINUITY");
      expect(miwa?.formationModel).toBe("accumulated");

      // 2. Bedrock Candidate / Composite (太祖神社下宮・小山田斎宮・伊野天照皇大神宮)
      const taiso = SACRED_SITE_STRATIGRAPHY_PROFILES.find((p) => p.id === "stratigraphy-taiso-jinja");
      expect(taiso?.historicalNature).toBe("B_BEDROCK_CANDIDATE");
      expect(taiso?.formationModel).toBe("accumulated");

      const koseki = SACRED_SITE_STRATIGRAPHY_PROFILES.find((p) => p.id === "stratigraphy-koseki-miya");
      expect(koseki?.historicalNature).toBe("B_BEDROCK_CANDIDATE");
      expect(koseki?.formationModel).toBe("composite");

      // 3. Modern Conception-Driven Syncretism (宝満神宮寺)
      const homan = SACRED_SITE_STRATIGRAPHY_PROFILES.find((p) => p.id === "stratigraphy-homan-shinguji");
      expect(homan?.historicalNature).toBe("C_LATER_RECONSTITUTION");
      expect(homan?.formationModel).toBe("conception_driven");
      expect(homan?.formationAnalysis).toBeDefined();
      expect(homan?.formationAnalysis?.meaningOrigin).toBeDefined();
      expect(homan?.formationAnalysis?.ritualPracticeOrigin).toBeDefined();
    });
  });

  describe("Principle 5: 地域間比較と6観点分析の網羅性・客観性 (ADR-0022 / Issue #33)", () => {
    it("ensures all regional comparison entries contain at least 3 regions and complete 6-viewpoint analysis", () => {
      expect(REGIONAL_COMPARISON_ENTRIES.length).toBeGreaterThanOrEqual(6);

      for (const entry of REGIONAL_COMPARISON_ENTRIES) {
        expect(entry.id).toBeTruthy();
        expect(entry.title).toBeTruthy();
        expect(entry.regions.length).toBeGreaterThanOrEqual(3);

        // 6観点分析の完全性検証
        expect(entry.commonality.length).toBeGreaterThanOrEqual(20);
        expect(entry.difference.length).toBeGreaterThanOrEqual(20);
        expect(entry.chronology.length).toBeGreaterThanOrEqual(20);
        expect(entry.contactPossibility.length).toBeGreaterThanOrEqual(20);
        expect(entry.independence.length).toBeGreaterThanOrEqual(20);
        expect(entry.alternativeExplanation.length).toBeGreaterThanOrEqual(20);
      }
    });

    it("verifies Kasuya-Sue-Wakasugi integration with northern Kyushu and western Japan regional networks", () => {
      // 1. 古代生産・官衙回廊（須恵・春日・糸島・朝倉）
      const prodEntry = REGIONAL_COMPARISON_ENTRIES.find(
        (e) => e.id === "comp-ancient-production-administrative-corridors",
      );
      expect(prodEntry).toBeDefined();
      expect(prodEntry?.regions).toEqual(
        expect.arrayContaining([
          expect.stringContaining("粕屋・須恵"),
          expect.stringContaining("春日"),
          expect.stringContaining("糸島"),
          expect.stringContaining("朝倉"),
        ]),
      );
      expect(prodEntry?.difference).toContain("阿恵官衙");
      expect(prodEntry?.alternativeExplanation).toContain("須恵焼");

      // 2. 山岳神体山と現代宗教景観（若杉山・宝満山・両子山・弥山）
      const mountainEntry = REGIONAL_COMPARISON_ENTRIES.find(
        (e) => e.id === "comp-mountain-sanctuary-and-lowland-shrine",
      );
      expect(mountainEntry).toBeDefined();
      expect(mountainEntry?.regions).toEqual(
        expect.arrayContaining([
          expect.stringContaining("粕屋・若杉山"),
          expect.stringContaining("太宰府・宝満山"),
          expect.stringContaining("国東・両子山"),
          expect.stringContaining("安芸・弥山"),
        ]),
      );
      expect(mountainEntry?.difference).toContain("宝満神宮寺");
      expect(mountainEntry?.alternativeExplanation).toContain("1994年");
    });

    it("strictly separates museums and archives from modern religious landscapes (Issue #34)", () => {
      // 本番データセット内の全博物館・資料館が museum_archive として解決され、決して現代宗教景観と誤認されないこと
      const museumSpots = spots.filter(
        (s) =>
          s.kind.includes("博物館") ||
          s.kind.includes("資料館") ||
          s.name.includes("資料館") ||
          s.name.includes("博物館"),
      );
      expect(museumSpots.length).toBeGreaterThanOrEqual(4);

      for (const museum of museumSpots) {
        const reason = resolveNonStratumReason(museum);
        expect(
          reason,
          `Museum spot "${museum.name}" must be classified as "museum_archive", but got "${reason}"`,
        ).toBe("museum_archive");
      }
    });
  });
});

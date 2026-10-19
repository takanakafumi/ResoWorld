import { describe, expect, it } from "vitest";
import {
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  isPrimarySiteForStratigraphy,
  resolveSpotStratigraphyProfile,
} from "./stratigraphy-profiles";
import {
  CHRONOLOGICAL_STRATA,
  getSpotStratumDetailReport,
  isClaimEvidenceExemptOrNegated,
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
});

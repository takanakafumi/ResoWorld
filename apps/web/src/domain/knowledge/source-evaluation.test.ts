import { describe, expect, it } from "vitest";

import {
  deriveCertaintyTierFromClaim,
  deriveCertaintyTierFromLensAssertion,
  deriveSourceCategoryFromLensSource,
  RegionalComparisonEntrySchema,
  SacredSiteStratigraphyProfileSchema,
  SourceTraditionComparisonEntrySchema,
} from "./source-evaluation";
import {
  REGIONAL_COMPARISON_ENTRIES,
  resolveSpotStratigraphyProfile,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  SOURCE_TRADITION_COMPARISON_ENTRIES,
} from "./stratigraphy-profiles";
import { munakataOkinoshimaSacredLandscapePack } from "../lens-packs/munakata-okinoshima-pack";
import { izumoKunitsukamiPack } from "../lens-packs/izumo-kunitsukami-pack";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";

describe("source evaluation & stratigraphy profile domain", () => {
  it("derives SourceCategory (A/B/C/D) deterministically with explicit override priority", () => {
    expect(
      deriveSourceCategoryFromLensSource({
        title: "『出雲国風土記』",
        kind: "classical-text",
      }),
    ).toBe("A");

    expect(
      deriveSourceCategoryFromLensSource({
        title: "『延喜式』神名帳",
        kind: "modern-reference",
      }),
    ).toBe("A");

    expect(
      deriveSourceCategoryFromLensSource({
        title: "志賀海神社 社伝由緒",
        kind: "modern-reference",
      }),
    ).toBe("B");

    expect(
      deriveSourceCategoryFromLensSource({
        title: "『ホツマツタヱ』・『東日流外三郡誌』比較ノート",
        kind: "modern-reference",
      }),
    ).toBe("C");

    expect(
      deriveSourceCategoryFromLensSource({
        title: "廿日市市 登山マップ",
        kind: "modern-reference",
      }),
    ).toBe("D");

    expect(
      deriveSourceCategoryFromLensSource({
        title: "任意タイトル",
        sourceCategory: "B",
      }),
    ).toBe("B");
  });

  it("derives CertaintyTier (A/B/C/D) for LensAssertions and Exploration Claims", () => {
    expect(
      deriveCertaintyTierFromLensAssertion({
        nature: "reviewed-reference",
        evidenceBasis: "modern-documentation",
        confidence: "high",
        reviewStatus: "reviewed",
      }),
    ).toBe("A");

    expect(
      deriveCertaintyTierFromLensAssertion({
        nature: "reviewed-reference",
        evidenceBasis: "institutional-tradition",
        confidence: "medium",
        reviewStatus: "reviewed",
      }),
    ).toBe("B");

    expect(
      deriveCertaintyTierFromLensAssertion({
        nature: "scholarly-hypothesis",
        evidenceBasis: "scholarly-analysis",
        confidence: "medium",
        reviewStatus: "draft",
      }),
    ).toBe("C");

    expect(
      deriveCertaintyTierFromClaim({
        claimKind: "observation",
        evidence: [{ sourceNature: "Observation" }],
      }),
    ).toBe("A");

    expect(
      deriveCertaintyTierFromClaim({
        claimKind: "assertion",
        evidence: [{ sourceNature: "Tradition" }],
      }),
    ).toBe("B");

    expect(
      deriveCertaintyTierFromClaim({
        claimKind: "hypothesis",
        evidence: [{ sourceNature: "UserHypothesis" }],
      }),
    ).toBe("C");

    expect(
      deriveCertaintyTierFromClaim({
        claimKind: "assertion",
        epistemic: { verification: "unverified" },
        evidence: [{ sourceNature: "AISuggestion" }],
      }),
    ).toBe("D");
  });

  it("validates all 17 SacredSiteStratigraphyProfiles against the 7-item schema and resolves major sacred sites", () => {
    expect(SACRED_SITE_STRATIGRAPHY_PROFILES).toHaveLength(17);

    for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
      expect(() => SacredSiteStratigraphyProfileSchema.parse(profile)).not.toThrow();
    }

    const munakata = resolveSpotStratigraphyProfile({ name: "宗像大社（辺津宮）" });
    expect(munakata?.id).toBe("stratigraphy-munakata-okinoshima");
    expect(munakata?.oldestAttestedRecord.sourceCategory).toBe("A");
    expect(munakata?.oldestAttestedRecord.certaintyTier).toBe("A");
    expect(munakata?.claimedOrigin.certaintyTier).toBe("B");

    const shikaumi = resolveSpotStratigraphyProfile({ name: "志賀海神社" });
    expect(shikaumi?.id).toBe("stratigraphy-shikaumi-jinja");
    expect(shikaumi?.claimedOrigin.sourceCategory).toBe("B");

    const itsukushima = resolveSpotStratigraphyProfile({ name: "嚴島神社" });
    expect(itsukushima?.id).toBe("stratigraphy-itsukushima-misen");

    const usa = resolveSpotStratigraphyProfile({ name: "宇佐神宮" });
    expect(usa?.id).toBe("stratigraphy-usa-omoto");

    const kashii = resolveSpotStratigraphyProfile({ name: "香椎宮" });
    expect(kashii?.id).toBe("stratigraphy-kashii-gu");
    expect(kashii?.oldestAttestedRecord.statement).toContain("橿日廟");

    const miyajidake = resolveSpotStratigraphyProfile({ name: "宮地嶽神社" });
    expect(miyajidake?.id).toBe("stratigraphy-miyajidake");
    expect(miyajidake?.oldestAttestedRecord.statement).toContain("宮地岳古墳");

    const sumiyoshi = resolveSpotStratigraphyProfile({ name: "筑前國一宮 住吉神社" });
    expect(sumiyoshi?.id).toBe("stratigraphy-sumiyoshi");

    const kora = resolveSpotStratigraphyProfile({ name: "高良大社" });
    expect(kora?.id).toBe("stratigraphy-kora-taisha");
    expect(kora?.archaeologyAndNaturalTarget.features.some((f) => f.includes("神籠石"))).toBe(true);

    const izumo = resolveSpotStratigraphyProfile({ name: "出雲大社" });
    expect(izumo?.id).toBe("stratigraphy-izumo-taisha");
    expect(izumo?.oldestAttestedRecord.statement).toContain("杵築大社");

    const takachiho = resolveSpotStratigraphyProfile({ name: "高千穂神社" });
    expect(takachiho?.id).toBe("stratigraphy-takachiho");

    const kunisaki = resolveSpotStratigraphyProfile({ name: "両子寺" });
    expect(kunisaki?.id).toBe("stratigraphy-kunisaki-rokugo");

    const tsushima = resolveSpotStratigraphyProfile({ name: "和多都美神社" });
    expect(tsushima?.id).toBe("stratigraphy-tsushima-watatsumi");

    const iki = resolveSpotStratigraphyProfile({ name: "壱岐・月讀神社" });
    expect(iki?.id).toBe("stratigraphy-iki-tsukiyomi");

    const miwa = resolveSpotStratigraphyProfile({ name: "大神神社" });
    expect(miwa?.id).toBe("stratigraphy-miwa-oomiwa");

    const aso = resolveSpotStratigraphyProfile({ name: "阿蘇神社" });
    expect(aso?.id).toBe("stratigraphy-aso-jinja");
    expect(aso?.oldestAttestedRecord.sourceTitle).toContain("隋書");

    const ino = resolveSpotStratigraphyProfile({ name: "伊野天照皇大神宮" });
    expect(ino?.id).toBe("stratigraphy-ino-yamada-saigu");
    expect(ino?.oldestAttestedRecord.statement).toContain("山田邑");

    const chikushi = resolveSpotStratigraphyProfile({ name: "筑紫神社" });
    expect(chikushi?.id).toBe("stratigraphy-chikushi-jinja");
    expect(chikushi?.oldestAttestedRecord.sourceCategory).toBe("A");
    expect(chikushi?.claimedOrigin.statement).toContain("荒ぶる神");
    expect(chikushi?.archaeologyAndNaturalTarget.features.some((f) => f.includes("原田峠"))).toBe(true);
  });


  it("validates all REGIONAL_COMPARISON_ENTRIES and SOURCE_TRADITION_COMPARISON_ENTRIES against their schemas", () => {
    expect(REGIONAL_COMPARISON_ENTRIES.length).toBeGreaterThanOrEqual(4);
    for (const entry of REGIONAL_COMPARISON_ENTRIES) {
      expect(() => RegionalComparisonEntrySchema.parse(entry)).not.toThrow();
      expect(entry.regions.length).toBeGreaterThanOrEqual(3);
    }

    expect(SOURCE_TRADITION_COMPARISON_ENTRIES).toHaveLength(4);
    for (const entry of SOURCE_TRADITION_COMPARISON_ENTRIES) {
      expect(() => SourceTraditionComparisonEntrySchema.parse(entry)).not.toThrow();
      expect(entry.categoryABedrock.certaintyTier).toBe("A");
      expect(entry.categoryBTradition.certaintyTier).toBe("B");
      expect(entry.categoryCContested.certaintyTier).toBe("D");
    }
  });

  it("retains packCategory and 6-viewpoint regionalComparisons on enriched packs and classifies all registeredLensTopics", () => {
    expect(munakataOkinoshimaSacredLandscapePack.packCategory).toBe("sacred-landscape-pack");
    expect(munakataOkinoshimaSacredLandscapePack.regionalComparisons).toHaveLength(1);
    expect(munakataOkinoshimaSacredLandscapePack.regionalComparisons[0]?.alternativeExplanation).toContain(
      "伊都岐嶋",
    );

    expect(izumoKunitsukamiPack.packCategory).toBe("genealogy-pack");
    expect(izumoKunitsukamiPack.regionalComparisons).toHaveLength(1);
    expect(izumoKunitsukamiPack.sources[0]?.compilationEra).toContain("712年");

    const categories = new Set(registeredLensTopics.map((t) => t.packCategory));
    expect(categories.has("source-pack")).toBe(true);
    expect(categories.has("regional-pack")).toBe(true);
    expect(categories.has("genealogy-pack")).toBe(true);
    expect(categories.has("sacred-landscape-pack")).toBe(true);
  });
});



import { describe, expect, it } from "vitest";

import {
  deriveCertaintyTierFromClaim,
  deriveCertaintyTierFromLensAssertion,
  deriveSourceCategoryFromLensSource,
  SacredSiteStratigraphyProfileSchema,
} from "./source-evaluation";
import {
  resolveSpotStratigraphyProfile,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
} from "./stratigraphy-profiles";
import { munakataOkinoshimaSacredLandscapePack } from "../lens-packs/munakata-okinoshima-pack";
import { izumoKunitsukamiPack } from "../lens-packs/izumo-kunitsukami-pack";

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

  it("validates all SacredSiteStratigraphyProfiles against the 7-item schema and resolves pilot spots", () => {
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
  });

  it("retains packCategory and 6-viewpoint regionalComparisons on enriched packs", () => {
    expect(munakataOkinoshimaSacredLandscapePack.packCategory).toBe("sacred-landscape-pack");
    expect(munakataOkinoshimaSacredLandscapePack.regionalComparisons).toHaveLength(1);
    expect(munakataOkinoshimaSacredLandscapePack.regionalComparisons[0]?.alternativeExplanation).toContain(
      "伊都岐嶋",
    );

    expect(izumoKunitsukamiPack.packCategory).toBe("genealogy-pack");
    expect(izumoKunitsukamiPack.regionalComparisons).toHaveLength(1);
    expect(izumoKunitsukamiPack.sources[0]?.compilationEra).toContain("712年");
  });
});

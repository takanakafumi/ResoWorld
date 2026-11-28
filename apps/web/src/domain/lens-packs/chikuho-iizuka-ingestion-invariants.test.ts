import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { CINNABAR_RED_PIGMENTS_OVERLAY } from "@/domain/archaeology/artifact-data";
import { SACRED_SITE_STRATIGRAPHY_PROFILES } from "@/domain/knowledge/stratigraphy-profiles";
import { auditLensTopicGovernance } from "@/domain/lenses/taxonomy-governance";
import { auditStratumGovernance } from "@/domain/review/stratum-governance";
import {
  buildClaimsByIdMap,
  CHRONOLOGICAL_STRATA,
  getSpotStratumMemberships,
  resolveNonStratumReason,
} from "@/domain/review/stratum-types";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { resolveEntityVisitState } from "./entity-visit-state";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { jinguKogoLegendPack } from "./jingu-kogo-pack";
import { projectLensPreset } from "./projection";
import { wajindenRoutesPack } from "./seed-packs";

describe("Chikuho Iizuka & Keisen 2026-11-28 Travelogue Ingestion & Tri-Space Invariants", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const claims = dataset.claims;

  const CHIKUHO_VISITED_SPOT_IDS = [
    "spot-gekko-jinja",
    "spot-iizuka-history-museum",
    "spot-ozuka-kofun",
    "spot-daibu-hachimangu",
  ] as const;

  it("registers all 4 Chikuho field spots as confirmed visited-place with objective physical kinds and observed_place claims", () => {
    for (const spotId of CHIKUHO_VISITED_SPOT_IDS) {
      const spot = spots.find((s) => s.id === spotId);
      expect(spot, `Atlas must contain ${spotId}`).toBeDefined();
      expect(spot?.mapRole).toBe("visited-place");
      expect(spot?.positionStatus).toBe("confirmed");
      expect(spot?.kind).not.toContain("候補");
      expect(spot?.claimIds?.length ?? 0).toBeGreaterThanOrEqual(1);

      const spotClaims = claims.filter((c) => spot?.claimIds?.includes(c.id));
      const hasObservedPlace = spotClaims.some((c) =>
        c.places.some((p) => p.role === "observed_place"),
      );
      expect(hasObservedPlace, `${spotId} must have at least one observed_place claim`).toBe(true);
    }

    const claimsById = buildClaimsByIdMap(claims);
    const memberships = getSpotStratumMemberships(spots, CHRONOLOGICAL_STRATA, { claimsById });

    // Museum spot must never pollute STRATUM L1-L5
    const museum = spots.find((s) => s.id === "spot-iizuka-history-museum")!;
    expect(memberships.get("spot-iizuka-history-museum")?.strataCount ?? 0).toBe(0);
    expect(resolveNonStratumReason(museum)).toBe("museum_archive");

    // Ozuka Kofun must match L2 ancient-state and NOT leak into L1 animism
    const ozukaReport = memberships.get("spot-ozuka-kofun");
    const ozukaCodes = ozukaReport?.strata.map((l) => l.code) ?? [];
    expect(ozukaCodes).toContain("ancient-state");
    expect(ozukaCodes).not.toContain("animism");

    // Daibu Hachimangu and Gekko Jinja must resolve STRATUM memberships cleanly per ADR-0030
    const daibuCodes = memberships.get("spot-daibu-hachimangu")?.strata.map((l) => l.code) ?? [];
    expect(daibuCodes).toContain("syncretism");
    expect(daibuCodes).toContain("modern-reconstruction");
    expect(daibuCodes).not.toContain("ritsuryo");

    const gekkoCodes = memberships.get("spot-gekko-jinja")?.strata.map((l) => l.code) ?? [];
    expect(gekkoCodes).toContain("syncretism");
  });

  it("enforces deterministic tri-space promotion across Jingu Kogo, Ancient Chieftains, Iizuka area zone, and Frontier Suggestions", () => {
    // 1. Jingu Kogo pack: daibu-hachimangu deterministically promoted via primarySpotId
    const jinguProj = projectLensPreset(jinguKogoLegendPack, "jingu-kogo-legend-preset");
    const jinguLinks = buildLensExplorationLinksByIdentity(claims, spots, jinguProj.nodes);
    const daibuNode = jinguProj.nodes.find((n) => n.id === "daibu-hachimangu");
    expect(daibuNode, "daibu-hachimangu must exist in jingu-kogo-legend-preset").toBeDefined();
    const daibuState = resolveEntityVisitState(daibuNode!, jinguLinks.get(daibuNode!.id), spots);
    expect(daibuState.granularity).toBe("site");
    expect(daibuState.isVisited).toBe(true);
    expect(daibuState.primarySpotId).toBe("spot-daibu-hachimangu");

    // 2. Ancient Chieftains pack: place-ozuka-kofun deterministically promoted via primarySpotId
    const chieftainsProj = projectLensPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    const chieftainsLinks = buildLensExplorationLinksByIdentity(claims, spots, chieftainsProj.nodes);
    const ozukaNode = chieftainsProj.nodes.find((n) => n.id === "place-ozuka-kofun");
    expect(ozukaNode, "place-ozuka-kofun must exist in ancient-chieftains-preset").toBeDefined();
    const ozukaState = resolveEntityVisitState(ozukaNode!, chieftainsLinks.get(ozukaNode!.id), spots);
    expect(ozukaState.granularity).toBe("site");
    expect(ozukaState.isVisited).toBe(true);
    expect(ozukaState.primarySpotId).toBe("spot-ozuka-kofun");

    // 3. Wajinden Routes area zone: iizuka (10km radius) automatically upgrades to explored area enclosing all 4 Chikuho spots
    const iizukaEntity = wajindenRoutesPack.entities.find((e) => e.id === "iizuka");
    expect(iizukaEntity).toBeDefined();
    const iizukaState = resolveEntityVisitState(iizukaEntity!, undefined, spots);
    expect(iizukaState.granularity).toBe("area");
    if (iizukaState.granularity === "area") {
      expect(iizukaState.isVisited).toBe(true);
      expect(iizukaState.hasFootprint).toBe(true);
      expect(iizukaState.areaVisitedSpotCount).toBeGreaterThanOrEqual(4);
      for (const spotId of CHIKUHO_VISITED_SPOT_IDS) {
        expect(iizukaState.areaVisitedSpotIds).toContain(spotId);
      }
    }

    // 4. Frontier Suggestions: 3 Chikuho next destinations registered with strict topic scope
    for (const expected of [
      { id: "next-chikuho-takehara-kofun", lensId: "people", topicId: "ancient-chieftains-network" },
      { id: "next-chikuho-kakeuma-kogoishi", lensId: "politics", topicId: "dazaifu-defense-preset" },
      { id: "next-chikuho-kama-sake-okide", lensId: "people", topicId: "ancient-chieftains-network" },
    ]) {
      const suggestion = suggestions.find((s) => s.id === expected.id);
      expect(suggestion, `${expected.id} must be registered`).toBeDefined();
      expect(suggestion?.lensId).toBe(expected.lensId);
      expect(suggestion?.topicId).toBe(expected.topicId);
    }
  });

  it("maintains zero STRATUM and LENS governance violations, registers stratigraphy profiles, and keeps Ozuka artifact site accurate", () => {
    const stratumAudit = auditStratumGovernance({ spots, claims });
    expect(stratumAudit.calendarYearViolations).toEqual([]);
    expect(stratumAudit.umbrellaClaimBleedViolations).toEqual([]);
    expect(stratumAudit.kindMismatchViolations).toEqual([]);
    expect(stratumAudit.unsafeRegexRuleViolations).toEqual([]);
    expect(stratumAudit.archetypeSubstringViolations).toEqual([]);

    const lensAudit = auditLensTopicGovernance();
    expect(lensAudit.missingExplicitSpatialScaleTopicIds).toEqual([]);
    expect(lensAudit.unusedTopicFocusKeys).toEqual([]);
    expect(lensAudit.registryDriftViolations).toEqual([]);
    expect(lensAudit.highDensityViolations).toEqual([]);
    expect(lensAudit.unregisteredPresetViolations).toEqual([]);
    expect(lensAudit.invalidScopeClusterRefs).toEqual([]);

    const profileMap = new Map(SACRED_SITE_STRATIGRAPHY_PROFILES.map((p) => [p.id, p]));
    expect(profileMap.get("stratigraphy-daibu-hachimangu")?.primarySpotIds).toContain("spot-daibu-hachimangu");
    expect(profileMap.get("stratigraphy-gekko-jinja")?.primarySpotIds).toContain("spot-gekko-jinja");
    expect(profileMap.get("stratigraphy-ozuka-kofun")?.primarySpotIds).toContain("spot-ozuka-kofun");

    const ozukaArtifact = CINNABAR_RED_PIGMENTS_OVERLAY.sites.find((s) => s.id === "site-ozuka-pigment");
    expect(ozukaArtifact).toBeDefined();
    expect(ozukaArtifact?.municipality).toContain("桂川町");
    expect(ozukaArtifact?.coordinates.latitude).toBeCloseTo(33.58874, 4);
    expect(ozukaArtifact?.coordinates.longitude).toBeCloseTo(130.663931, 4);
  });
});

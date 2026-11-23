import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
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
import { korasanSacredLandscapePack } from "./korasan-sacred-landscape-pack";
import { projectLensPreset } from "./projection";
import { setouchiMaritimeNetworkPack } from "./setouchi-maritime-network-pack";

describe("Chikugo-Yame 2026-11-23 Travelogue Ingestion & Tri-Space Invariants", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const claims = dataset.claims;

  const CHIKUGO_YAME_VISITED_SPOT_IDS = [
    "spot-yasutake-hachimangu",
    "spot-mitsuka-kofun",
    "spot-gongenzuka-kofun",
    "spot-daizenji-tamataregu",
    "spot-kofunpia-hirokawa",
    "spot-kokadani-kofun",
    "spot-sekijinsan-kofun",
    "spot-iwai-no-sato",
    "spot-iwatoyama-kofun",
    "spot-yoshida-daijingu",
    "spot-yame-folk-museum",
    "spot-donanzan-kofun",
    "spot-bengara-mura",
  ] as const;

  it("registers all 13 Chikugo-Yame field spots as confirmed visited-place with objective physical kinds", () => {
    for (const spotId of CHIKUGO_YAME_VISITED_SPOT_IDS) {
      const spot = spots.find((s) => s.id === spotId);
      expect(spot, `Atlas must contain ${spotId}`).toBeDefined();
      expect(spot?.mapRole).toBe("visited-place");
      expect(spot?.positionStatus).toBe("confirmed");
      expect(spot?.kind).not.toContain("候補");
      expect(spot?.claimIds?.length ?? 0).toBeGreaterThanOrEqual(1);
    }

    // Modern facility & museum spots must never pollute STRATUM L1-L5
    const claimsById = buildClaimsByIdMap(claims);
    const memberships = getSpotStratumMemberships(spots, CHRONOLOGICAL_STRATA, { claimsById });

    const bengara = spots.find((s) => s.id === "spot-bengara-mura")!;
    expect(bengara.kind).toBe("温泉・入浴施設");
    expect(memberships.get("spot-bengara-mura")?.strataCount ?? 0).toBe(0);
    expect(resolveNonStratumReason(bengara)).toBe("modern_infrastructure");

    for (const museumId of [
      "spot-kofunpia-hirokawa",
      "spot-iwai-no-sato",
      "spot-yame-folk-museum",
    ]) {
      const museum = spots.find((s) => s.id === museumId)!;
      expect(memberships.get(museumId)?.strataCount ?? 0).toBe(0);
      expect(resolveNonStratumReason(museum)).toBe("museum_archive");
    }

    // Kofun sites must match L2 ancient-state and NOT leak into L1 animism
    for (const kofunId of [
      "spot-mitsuka-kofun",
      "spot-gongenzuka-kofun",
      "spot-kokadani-kofun",
      "spot-sekijinsan-kofun",
      "spot-iwatoyama-kofun",
      "spot-donanzan-kofun",
    ]) {
      const report = memberships.get(kofunId);
      const codes = report?.strata.map((l) => l.code) ?? [];
      expect(codes, `${kofunId} must match ancient-state (L2)`).toContain("ancient-state");
      expect(codes, `${kofunId} must not misclassify into animism (L1)`).not.toContain("animism");
    }
  });

  it("enforces deterministic tri-space promotion across Chieftains, Korasan, Setouchi, and Frontier Suggestions", () => {
    const chieftainsProj = projectLensPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    const chieftainsLinks = buildLensExplorationLinksByIdentity(claims, spots, chieftainsProj.nodes);

    for (const visitedId of [
      "iwatoyama-kofun",
      "place-sekijinsan-kofun",
      "place-mitsuka-gongen-kofun",
      "place-kokadani-kofun",
      "place-donanzan-kofun",
      "place-iwai-no-sato",
    ]) {
      const node = chieftainsProj.nodes.find((n) => n.id === visitedId);
      expect(node, `${visitedId} must exist in ancient-chieftains-preset`).toBeDefined();
      const state = resolveEntityVisitState(node!, chieftainsLinks.get(node!.id), spots);
      expect(state.isVisited, `${visitedId} must promote to visited`).toBe(true);
    }

    for (const frontierId of ["place-chikugo-kokufu", "place-shimobaba-kofun"]) {
      const node = chieftainsProj.nodes.find((n) => n.id === frontierId);
      expect(node, `${frontierId} must exist in ancient-chieftains-preset`).toBeDefined();
      const state = resolveEntityVisitState(node!, chieftainsLinks.get(node!.id), spots);
      expect(state.isVisited, `${frontierId} must remain unvisited frontier`).toBe(false);
    }

    // Setouchi pack: iwatoyama-kofun promoted
    const setouchiProj = projectLensPreset(setouchiMaritimeNetworkPack, "setouchi-polity-integration-preset");
    const setouchiLinks = buildLensExplorationLinksByIdentity(claims, spots, setouchiProj.nodes);
    const setouchiIwato = setouchiProj.nodes.find((n) => n.id === "iwatoyama-kofun")!;
    expect(resolveEntityVisitState(setouchiIwato, setouchiLinks.get(setouchiIwato.id), spots).isVisited).toBe(true);

    // Korasan pack: yasutake, mitsuka-gongen, daizenji-tamataregu promoted
    const korasanProj = projectLensPreset(korasanSacredLandscapePack, "korasan-sacred-landscape-preset");
    const korasanLinks = buildLensExplorationLinksByIdentity(claims, spots, korasanProj.nodes);
    for (const visitedId of [
      "yasutake-honmura-hachimangu",
      "place-mitsuka-gongen-kofun",
      "place-daizenji-tamataregu",
    ]) {
      const node = korasanProj.nodes.find((n) => n.id === visitedId)!;
      expect(resolveEntityVisitState(node, korasanLinks.get(node.id), spots).isVisited).toBe(true);
    }

    // Frontier Suggestions: 4 promoted removed, 2 new registered
    for (const removedId of [
      "sugg-yasutake-honmura-hachimangu",
      "sugg-mitsuka-gongen-kofun",
      "next-chikushi-sekijinsan-kofun",
      "next-chikushi-iwatoyama-kofun",
    ]) {
      expect(suggestions.some((s) => s.id === removedId), `${removedId} must be removed`).toBe(false);
    }
    for (const addedId of ["sugg-chikugo-kokufu", "sugg-shimobaba-kofun"]) {
      expect(suggestions.some((s) => s.id === addedId), `${addedId} must be registered`).toBe(true);
    }
  });

  it("maintains zero STRATUM and LENS taxonomy governance violations and registers Chikugo-Yame stratigraphy profiles", () => {
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
    expect(profileMap.get("stratigraphy-daizenji-tamataregu")?.primarySpotIds).toContain("spot-daizenji-tamataregu");
    expect(profileMap.get("stratigraphy-yoshida-daijingu")?.primarySpotIds).toContain("spot-yoshida-daijingu");
    expect(profileMap.get("stratigraphy-yasutake-hachimangu")?.primarySpotIds).toContain("spot-yasutake-hachimangu");
  });
});

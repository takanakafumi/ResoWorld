import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { knowledgeVisitFrontierSuggestionsForVisitedSpots } from "@/domain/map/registry";
import {
  resolveSpotStratigraphyProfile,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
} from "@/domain/knowledge/stratigraphy-profiles";
import { auditLensTopicGovernance } from "@/domain/lenses/taxonomy-governance";
import { auditStratumGovernance } from "@/domain/review/stratum-governance";
import {
  buildClaimsByIdMap,
  CHRONOLOGICAL_STRATA,
  getSpotStratumMemberships,
} from "@/domain/review/stratum-types";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { resolveEntityVisitState } from "./entity-visit-state";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { registeredLensTopics } from "./knowledge-registry";
import { projectLensPreset } from "./projection";

describe("Saga & Yoshinogari 2026-11-24 Travelogue Ingestion & Tri-Space Invariants", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const journeys = dataset.atlas?.journeys ?? [];
  const claims = dataset.claims;

  it("registers Yodohime Shrine and Yoshinogari Site as confirmed visited-place spots with observed_place claims", () => {
    const journey = journeys.find((j) => j.id === "journey-saga-yoshinogari-2026-11-24");
    expect(journey).toBeDefined();
    expect(journey?.spotIds).toEqual(["spot-yodohime-jinja", "spot-yoshinogari-site"]);

    for (const spotId of ["spot-yodohime-jinja", "spot-yoshinogari-site"] as const) {
      const spot = spots.find((s) => s.id === spotId);
      expect(spot, `Atlas must contain ${spotId}`).toBeDefined();
      expect(spot?.mapRole).toBe("visited-place");
      expect(spot?.positionStatus).toBe("confirmed");
      expect(spot?.kind).not.toContain("候補");
      expect(spot?.claimIds?.length ?? 0).toBeGreaterThanOrEqual(5);

      const spotClaims = claims.filter((c) => spot!.claimIds.includes(c.id));
      expect(spotClaims.length).toBe(spot!.claimIds.length);
      for (const claim of spotClaims) {
        expect(
          claim.places.some((p) => p.entityId === spotId && p.role === "observed_place"),
          `Claim ${claim.id} must deterministically carry role="observed_place" for ${spotId}`,
        ).toBe(true);
      }
    }
  });

  it("enforces deterministic tri-space promotion for Ichinomiya, Yayoi Archaeology, and Frontier Suggestions (Principle 14)", () => {
    // 1. Ichinomiya LENS: place-yodohime-jinja promoted to visited
    const ichinomiyaTopic = registeredLensTopics.find((t) => t.id === "ichinomiya-western-preset");
    expect(ichinomiyaTopic).toBeDefined();
    const ichinomiyaProj = projectLensPreset(ichinomiyaTopic!.pack, ichinomiyaTopic!.presetId);
    const ichinomiyaLinks = buildLensExplorationLinksByIdentity(claims, spots, ichinomiyaProj.nodes);
    const yodohimeNode = ichinomiyaProj.nodes.find((n) => n.id === "place-yodohime-jinja");
    expect(yodohimeNode).toBeDefined();
    const yodohimeVisit = resolveEntityVisitState(yodohimeNode!, ichinomiyaLinks.get(yodohimeNode!.id), spots);
    expect(yodohimeVisit.isVisited).toBe(true);
    expect(yodohimeVisit.primarySpotId).toBe("spot-yodohime-jinja");

    // 2. Yayoi Archaeology LENS: place-yoshinogari promoted to visited
    const yayoiTopic = registeredLensTopics.find((t) => t.id === "yayoi-archaeology-preset");
    expect(yayoiTopic).toBeDefined();
    const yayoiProj = projectLensPreset(yayoiTopic!.pack, yayoiTopic!.presetId);
    const yayoiLinks = buildLensExplorationLinksByIdentity(claims, spots, yayoiProj.nodes);
    const yoshinogariNode = yayoiProj.nodes.find((n) => n.id === "place-yoshinogari");
    expect(yoshinogariNode).toBeDefined();
    const yoshinogariVisit = resolveEntityVisitState(
      yoshinogariNode!,
      yayoiLinks.get(yoshinogariNode!.id),
      spots,
    );
    expect(yoshinogariVisit.isVisited).toBe(true);
    expect(yoshinogariVisit.primarySpotId).toBe("spot-yoshinogari-site");

    // 3. Frontier Suggestions: retired Yoshinogari & Yodohime vanish from both static and live Frontier
    expect(suggestions.some((s) => s.id === "next-yamatai-yoshinogari")).toBe(false);
    const liveFrontier = knowledgeVisitFrontierSuggestionsForVisitedSpots(spots, {
      includeUnanchored: true,
    });
    expect(liveFrontier.some((s) => s.targetPlaceId === "place-yoshinogari")).toBe(false);
    expect(liveFrontier.some((s) => s.targetPlaceId === "place-yodohime-jinja")).toBe(false);

    // 4. Deferred Kyoseki Park is registered cleanly as a scoped Frontier suggestion
    const kyoseki = suggestions.find((s) => s.id === "next-saga-kyoseki-park");
    expect(kyoseki).toBeDefined();
    expect(kyoseki?.lensId).toBe("religion");
    expect(kyoseki?.topicId).toBe("religion-concepts");
    expect(kyoseki?.anchorSpotIds).toContain("spot-yodohime-jinja");
  });

  it("maintains zero STRATUM/LENS governance violations and resolves stratigraphy profiles for both sites", () => {
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
    expect(profileMap.get("stratigraphy-yodohime-jinja")?.primarySpotIds).toContain("spot-yodohime-jinja");
    expect(profileMap.get("stratigraphy-yoshinogari-site")?.primarySpotIds).toContain("spot-yoshinogari-site");

    const yodohimeSpot = spots.find((s) => s.id === "spot-yodohime-jinja")!;
    const yoshinogariSpot = spots.find((s) => s.id === "spot-yoshinogari-site")!;
    expect(resolveSpotStratigraphyProfile(yodohimeSpot)?.id).toBe("stratigraphy-yodohime-jinja");
    expect(resolveSpotStratigraphyProfile(yoshinogariSpot)?.id).toBe("stratigraphy-yoshinogari-site");

    const claimsById = buildClaimsByIdMap(claims);
    const memberships = getSpotStratumMemberships(spots, CHRONOLOGICAL_STRATA, { claimsById });
    const yodohimeStrata = memberships.get("spot-yodohime-jinja")?.strata.map((l) => l.code) ?? [];
    expect(yodohimeStrata).toContain("ritsuryo");
    expect(yodohimeStrata).toContain("animism");
    expect(yodohimeStrata.length).toBeGreaterThanOrEqual(3);

    const yoshinogariStrata = memberships.get("spot-yoshinogari-site")?.strata.map((l) => l.code) ?? [];
    expect(yoshinogariStrata).toContain("animism");
  });

  it("deepens Yayoi Kyushu-Kinai focus-only comparison, cross-links Yodohime/Kyoseki Park, and populates focused areaZone visitedSpotIds end-to-end", async () => {
    const { projectLensMapPreset } = await import("./projection");
    const { projectMapScene } = await import("@/domain/map/scene");
    const { reduceAtlasSelection } = await import("@/domain/map/selection");

    // 1. Yayoi preset includes Kinai structural comparison as focus-only (ADR-0028) with scopeClusters (ADR-0029)
    const yayoiTopic = registeredLensTopics.find((t) => t.id === "yayoi-archaeology-preset")!;
    expect(yayoiTopic.spatialScale).toBe("national");
    expect(yayoiTopic.scopeClusters?.length).toBeGreaterThanOrEqual(2);
    const yayoiConns = projectLensMapPreset(yayoiTopic.pack, yayoiTopic.presetId);
    const kinaiComparison = yayoiConns.find((c) => c.id === "yayoi-kyushu-kinai-structural-comparison");
    expect(kinaiComparison).toBeDefined();
    expect(kinaiComparison?.displayMode).toBe("focus-only");
    expect(kinaiComparison?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["place-yoshinogari", "place-karako-kagi", "place-ikegami-sone", "place-makimuku-yayoi"]),
    );

    // 2. religion-concepts cross-links visited Yodohime Shrine and unvisited Kyoseki Park via focus-only comparison
    const conceptsTopic = registeredLensTopics.find((t) => t.id === "religion-concepts")!;
    const conceptsProj = projectLensPreset(conceptsTopic.pack, conceptsTopic.presetId);
    const conceptsLinks = buildLensExplorationLinksByIdentity(claims, spots, conceptsProj.nodes);
    const yodohimeConceptNode = conceptsProj.nodes.find((n) => n.id === "yodohime-jinja");
    const kyosekiConceptNode = conceptsProj.nodes.find((n) => n.id === "hizen-yamato-kyoseki-park");
    expect(yodohimeConceptNode).toBeDefined();
    expect(kyosekiConceptNode).toBeDefined();
    expect(resolveEntityVisitState(yodohimeConceptNode!, conceptsLinks.get(yodohimeConceptNode!.id), spots).isVisited).toBe(true);
    expect(resolveEntityVisitState(kyosekiConceptNode!, conceptsLinks.get(kyosekiConceptNode!.id), spots).isVisited).toBe(false);
    const conceptsMapConns = projectLensMapPreset(conceptsTopic.pack, conceptsTopic.presetId);
    const kaseLandscape = conceptsMapConns.find((c) => c.id === "kase-river-water-stone-landscape");
    expect(kaseLandscape?.displayMode).toBe("focus-only");

    // 3. E2E reducer -> projectMapScene slice for area-zone contained spots inspector
    const wajindenTopic = registeredLensTopics.find((t) => t.presetId === "wajinden-comparison")!;
    const wajindenKnowledgeConns = projectLensMapPreset(wajindenTopic.pack, wajindenTopic.presetId);
    const initialSelection = { spotId: "", focus: { kind: "none" as const } };
    const focusedSelection = reduceAtlasSelection(initialSelection, {
      type: "select-route-node",
      id: "asakura-region",
    });
    const focusedScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: wajindenKnowledgeConns,
      spots,
      selection: focusedSelection,
    });
    const focusedAsakura = focusedScene.areaZones.find((z) => z.id === "asakura-region");
    expect(focusedAsakura?.isFocused).toBe(true);
    expect(focusedAsakura?.visitedSpotCount).toBeGreaterThanOrEqual(1);
    expect(focusedAsakura?.visitedSpotIds?.length).toBe(focusedAsakura?.visitedSpotCount);

    const clearedSelection = reduceAtlasSelection(focusedSelection, {
      type: "clear-focus",
      preserveCamera: true,
    });
    const clearedScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: wajindenKnowledgeConns,
      spots,
      selection: clearedSelection,
    });
    expect(clearedScene.areaZones.some((z) => z.isFocused)).toBe(false);
  });
});

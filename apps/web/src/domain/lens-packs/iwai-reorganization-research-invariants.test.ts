import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { CINNABAR_RED_PIGMENTS_OVERLAY } from "@/domain/archaeology/artifact-data";
import { auditLensTopicGovernance } from "@/domain/lenses/taxonomy-governance";
import { auditStratumGovernance } from "@/domain/review/stratum-governance";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { resolveEntityVisitState } from "./entity-visit-state";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("Iwai Reorganization Research Note (2026-11-28) Semantic Invariants", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const claims = dataset.claims;

  const UNVISITED_RESEARCH_PLACE_IDS = [
    "place-ishigamiyama-kofun",
    "place-kurosaki-kanzeonzuka",
    "place-kamao-kofun",
  ] as const;

  it("projects all 4 research entities without falsely promoting unvisited kofun to visited", () => {
    const projection = projectLensPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    const nodeIds = new Set(projection.nodes.map((n) => n.id));
    expect(nodeIds.has("kume-no-miko")).toBe(true);
    for (const placeId of UNVISITED_RESEARCH_PLACE_IDS) {
      expect(nodeIds.has(placeId), `${placeId} must be projected`).toBe(true);
    }

    const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);
    for (const placeId of UNVISITED_RESEARCH_PLACE_IDS) {
      const entity = ancientChieftainsPack.entities.find((e) => e.id === placeId);
      expect(entity?.primarySpotId).toBeUndefined();
      const node = projection.nodes.find((n) => n.id === placeId)!;
      const visitState = resolveEntityVisitState(node, links.get(node.id), spots);
      expect(visitState.isVisited, `${placeId} from a research note must remain unvisited`).toBe(false);
    }

    const mapConnections = projectLensMapPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    const chikugoLineage = mapConnections.find((c) => c.id === "chikugo-river-chieftain-lineage");
    expect(chikugoLineage).toBeDefined();
    for (const placeId of UNVISITED_RESEARCH_PLACE_IDS) {
      expect(chikugoLineage?.places.map((p) => p.id)).toContain(placeId);
      expect(chikugoLineage?.explorationQuestions?.[placeId]).toBeDefined();
    }
  });

  it("distinguishes attested historical records from scholarly hypotheses in assertions", () => {
    const byId = new Map(ancientChieftainsPack.assertions.map((a) => [a.id, a]));
    expect(byId.get("chieftain-059")?.nature).toBe("reviewed-reference");
    expect(byId.get("chieftain-062")?.nature).toBe("reviewed-reference");
    expect(byId.get("chieftain-060")?.nature).toBe("scholarly-hypothesis");
    expect(byId.get("chieftain-060")?.alternativeExplanation).toBeTruthy();
    expect(byId.get("chieftain-061")?.nature).toBe("scholarly-hypothesis");
    expect(byId.get("chieftain-063")?.nature).toBe("scholarly-hypothesis");
    expect(byId.get("chieftain-063")?.alternativeExplanation).toBeTruthy();
  });

  it("registers Kamao Kofun in CINNABAR_RED_PIGMENTS_OVERLAY and all 3 Frontier Suggestions with strict topic scoping", () => {
    const kamaoOverlay = CINNABAR_RED_PIGMENTS_OVERLAY.sites.find(
      (s) => s.id === "site-kamao-pigment",
    );
    expect(kamaoOverlay).toBeDefined();
    expect(kamaoOverlay?.prefecture).toBe("熊本県");
    expect(kamaoOverlay?.coordinates.latitude).toBeCloseTo(32.839014, 4);
    expect(kamaoOverlay?.coordinates.longitude).toBeCloseTo(130.696639, 4);
    expect(kamaoOverlay?.sources?.length ?? 0).toBeGreaterThanOrEqual(1);

    const spotIds = new Set(spots.map((s) => s.id));
    const claimIds = new Set(claims.map((c) => c.id));

    for (const expected of [
      { id: "next-south-chikugo-ishigamiyama", targetPlaceId: "place-ishigamiyama-kofun" },
      { id: "next-south-chikugo-kurosaki-kanzeonzuka", targetPlaceId: "place-kurosaki-kanzeonzuka" },
      { id: "next-higo-kamao-kofun", targetPlaceId: "place-kamao-kofun" },
    ]) {
      const suggestion = suggestions.find((s) => s.id === expected.id);
      expect(suggestion, `${expected.id} must be registered`).toBeDefined();
      expect(suggestion?.targetKind).toBe("knowledge_unvisited");
      expect(suggestion?.targetPlaceId).toBe(expected.targetPlaceId);
      expect(suggestion?.lensId).toBe("people");
      expect(suggestion?.topicId).toBe("ancient-chieftains-network");
      for (const anchorId of suggestion?.anchorSpotIds ?? []) {
        expect(spotIds.has(anchorId), `anchorSpotId ${anchorId} must exist in Atlas`).toBe(true);
      }
      for (const claimId of suggestion?.claimIds ?? []) {
        expect(claimIds.has(claimId), `claimId ${claimId} must exist in dataset`).toBe(true);
      }
    }
  });

  it("maintains zero LENS and STRATUM governance violations", () => {
    const lensAudit = auditLensTopicGovernance();
    expect(lensAudit.missingExplicitSpatialScaleTopicIds).toEqual([]);
    expect(lensAudit.unusedTopicFocusKeys).toEqual([]);
    expect(lensAudit.registryDriftViolations).toEqual([]);
    expect(lensAudit.highDensityViolations).toEqual([]);
    expect(lensAudit.unregisteredPresetViolations).toEqual([]);
    expect(lensAudit.invalidScopeClusterRefs).toEqual([]);

    const stratumAudit = auditStratumGovernance({ spots, claims });
    expect(stratumAudit.calendarYearViolations).toEqual([]);
    expect(stratumAudit.umbrellaClaimBleedViolations).toEqual([]);
    expect(stratumAudit.kindMismatchViolations).toEqual([]);
    expect(stratumAudit.unsafeRegexRuleViolations).toEqual([]);
    expect(stratumAudit.archetypeSubstringViolations).toEqual([]);
  });
});

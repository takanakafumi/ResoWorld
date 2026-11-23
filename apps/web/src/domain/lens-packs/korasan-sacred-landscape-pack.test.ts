import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { SACRED_SITE_STRATIGRAPHY_PROFILES } from "@/domain/knowledge/stratigraphy-profiles";
import { auditLensTopicGovernance } from "@/domain/lenses/taxonomy-governance";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { ancientMaterialCulturePack } from "./ancient-material-culture-pack";
import { resolveEntityVisitState } from "./entity-visit-state";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { registeredLensTopics } from "./knowledge-registry";
import { korasanSacredLandscapePack } from "./korasan-sacred-landscape-pack";
import { ichinomiyaWesternNetworkPack } from "./pack-loader";
import { projectLensPreset } from "./projection";

describe("Korasan Sacred Landscape Pack & Tri-Space Promotion (高良山の重層聖域と三空間同期)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const claims = dataset.claims;

  const VISITED_SPOT_IDS = [
    "spot-gionyama-kofun",
    "spot-tsubuteyama-kofun",
    "spot-kora-taisha",
    "spot-takagi-jinja-kurume",
    "spot-kora-san-kogoishi",
    "spot-kora-san-okunoin",
    "spot-kora-san-honbo-ato",
    "spot-ise-amaterasu-kurume",
    "spot-yasutake-hachimangu",
    "spot-mitsuka-kofun",
    "spot-daizenji-tamataregu",
  ] as const;

  const VISITED_ENTITY_IDS = [
    "place-gionyama-kofun",
    "place-tsubuteyama-kofun",
    "kora-taisha",
    "place-takagi-jinja-kurume",
    "place-kora-san-kogoishi",
    "place-kora-san-okunoin",
    "place-kora-san-honbo-ato",
    "place-ise-amaterasu-kurume",
    "yasutake-honmura-hachimangu",
    "place-mitsuka-gongen-kofun",
    "place-daizenji-tamataregu",
  ] as const;

  const FRONTIER_ENTITY_IDS = [
    "kurume-maibun-center",
  ] as const;

  it("registers korasan-sacred-landscape-preset cleanly under religion with ADR-0028/0029 compliance", () => {
    const topic = registeredLensTopics.find((t) => t.id === "korasan-sacred-landscape-preset");
    expect(topic).toBeDefined();
    expect(topic?.perspectiveId).toBe("religion");
    expect(topic?.spatialScale).toBe("regional");
    expect(topic?.archetype).toBe("matrix");
    expect(topic?.focus).toBe("sacred-space");
    expect((topic?.scopeClusters?.length ?? 0)).toBeGreaterThanOrEqual(2);

    const preset = korasanSacredLandscapePack.presets[0];
    expect(preset.id).toBe("korasan-sacred-landscape-preset");
    for (const connection of preset.mapConnections) {
      expect(connection.displayMode).toBe("focus-only");
      expect(connection.placeEntityIds.length).toBeGreaterThanOrEqual(2);
    }

    const audit = auditLensTopicGovernance();
    expect(audit.missingExplicitSpatialScaleTopicIds).toEqual([]);
    expect(audit.unusedTopicFocusKeys).toEqual([]);
    expect(audit.registryDriftViolations).toEqual([]);
    expect(audit.highDensityViolations).toEqual([]);
    expect(audit.unregisteredPresetViolations).toEqual([]);
    expect(audit.invalidScopeClusterRefs).toEqual([]);
  });

  it("enforces Plan A safety and projects all visited places and remaining frontier places", () => {
    const projection = projectLensPreset(korasanSacredLandscapePack, "korasan-sacred-landscape-preset");
    const projectedIds = new Set(projection.nodes.map((n) => n.id));

    for (const id of [...VISITED_ENTITY_IDS, ...FRONTIER_ENTITY_IDS]) {
      expect(projectedIds.has(id), `Expected ${id} to be projected`).toBe(true);
    }

    for (const entity of korasanSacredLandscapePack.entities) {
      if (entity.kind !== "place") {
        expect(entity.coordinates).toBeUndefined();
        expect(entity.primarySpotId).toBeUndefined();
      }
    }
  });

  it("guarantees tri-space visit promotion across Atlas, Kora-san LENS, Chieftains, Sankakubuchi, Ichinomiya, and Frontier Suggestions", () => {
    // 1. Atlas space: all visited spots exist as confirmed visited-place with objective physical kind
    for (const spotId of VISITED_SPOT_IDS) {
      const spot = spots.find((s) => s.id === spotId);
      expect(spot, `Atlas must contain ${spotId}`).toBeDefined();
      expect(spot?.mapRole).toBe("visited-place");
      expect(spot?.positionStatus).toBe("confirmed");
      expect(spot?.kind).not.toContain("候補");
    }

    // 2. Kora-san LENS: visited places promote to isVisited=true; unvisited frontier remains unvisited
    const korasanProjection = projectLensPreset(korasanSacredLandscapePack, "korasan-sacred-landscape-preset");
    const korasanLinks = buildLensExplorationLinksByIdentity(claims, spots, korasanProjection.nodes);
    for (const entityId of VISITED_ENTITY_IDS) {
      const node = korasanProjection.nodes.find((n) => n.id === entityId);
      expect(node).toBeDefined();
      const visit = resolveEntityVisitState(node!, korasanLinks.get(node!.id), spots);
      expect(visit.isVisited, `${entityId} must be visited in korasan-sacred-landscape-preset`).toBe(true);
    }
    for (const frontierId of FRONTIER_ENTITY_IDS) {
      const node = korasanProjection.nodes.find((n) => n.id === frontierId);
      expect(node).toBeDefined();
      const visit = resolveEntityVisitState(node!, korasanLinks.get(node!.id), spots);
      expect(visit.isVisited, `${frontierId} must remain unvisited`).toBe(false);
    }

    // 3. Cross-LENS promotion: Kora Taisha, Gionyama, Mitsuka-Gongen promote across Chieftains, Sankakubuchi, and Ichinomiya
    const crossChecks = [
      {
        pack: ancientChieftainsPack,
        presetId: "ancient-chieftains-preset",
        entityIds: ["kora-taisha", "place-gionyama-kofun", "place-mitsuka-gongen-kofun"],
      },
      { pack: ancientMaterialCulturePack, presetId: "sankakubuchi-alliance-preset", entityIds: ["place-gionyama-kofun"] },
      { pack: ichinomiyaWesternNetworkPack, presetId: "ichinomiya-western-preset", entityIds: ["place-kora-taisha-ichi"] },
    ];
    for (const check of crossChecks) {
      const proj = projectLensPreset(check.pack, check.presetId);
      const links = buildLensExplorationLinksByIdentity(claims, spots, proj.nodes);
      for (const entityId of check.entityIds) {
        const node = proj.nodes.find((n) => n.id === entityId);
        expect(node, `${entityId} must exist in ${check.presetId}`).toBeDefined();
        const visit = resolveEntityVisitState(node!, links.get(node!.id), spots);
        expect(visit.isVisited, `${entityId} must be visited in ${check.presetId}`).toBe(true);
      }
    }

    // 4. Frontier suggestions: promoted suggestions removed; remaining unvisited suggestion preserved
    for (const promotedId of [
      "next-chikushi-kora-taisha",
      "sugg-yasutake-honmura-hachimangu",
      "sugg-mitsuka-gongen-kofun",
    ]) {
      expect(suggestions.some((s) => s.id === promotedId), `${promotedId} must be removed upon visit promotion`).toBe(false);
    }
    expect(suggestions.some((s) => s.id === "sugg-kurume-maibun-center")).toBe(true);
  });

  it("provides dedicated STRATUM stratigraphy profiles for Kora-san and Chikugo shrines", () => {
    const profileMap = new Map(SACRED_SITE_STRATIGRAPHY_PROFILES.map((p) => [p.id, p]));
    expect(profileMap.get("stratigraphy-kora-taisha")?.primarySpotIds).toContain("spot-kora-taisha");
    expect(profileMap.get("stratigraphy-takagi-jinja-kurume")?.primarySpotIds).toContain("spot-takagi-jinja-kurume");
    expect(profileMap.get("stratigraphy-ise-amaterasu-kurume")?.primarySpotIds).toContain("spot-ise-amaterasu-kurume");
    expect(profileMap.get("stratigraphy-daizenji-tamataregu")?.primarySpotIds).toContain("spot-daizenji-tamataregu");
    expect(profileMap.get("stratigraphy-yasutake-hachimangu")?.primarySpotIds).toContain("spot-yasutake-hachimangu");
  });
});

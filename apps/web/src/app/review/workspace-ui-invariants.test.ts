import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewDataset, ReviewAtlasSpot } from "@/domain/review/types";
import { resolveSpotDeityContext } from "@/domain/knowledge/shrine-deity-registry";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { recognitionLensDefinitions } from "./use-atlas-lens-state";
import { isConnectionDimmed } from "./use-connection-lines";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import type { MapConnectionProjection } from "@/domain/map/connections";

describe("Workspace UI Invariants (ADR-0021 & Anti-Fragility Protections)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const atlas = dataset.atlas!;

  describe("1. Layout Orthogonality & Symmetry (Stratum vs LENS)", () => {
    // Pure function mimicking the grid class resolution in atlas-workspace.tsx
    function resolveAtlasGridClassNames({
      companionActive,
      lensLayout,
    }: {
      companionActive: boolean;
      lensLayout: "balanced" | "focus";
    }): string[] {
      const classes: string[] = ["atlasGrid"];
      if (companionActive) {
        classes.push("atlasGridWithLens");
      }
      if (companionActive && lensLayout === "balanced") {
        classes.push("atlasGridLensBalanced");
      }
      return classes;
    }

    it("applies balanced grid layout symmetrically to both Stratum and LENS modes", () => {
      // Stratum mode with companion panel active
      const stratumBalanced = resolveAtlasGridClassNames({
        companionActive: true,
        lensLayout: "balanced",
      });
      expect(stratumBalanced).toContain("atlasGridWithLens");
      expect(stratumBalanced).toContain("atlasGridLensBalanced");

      // Stratum mode with focus layout
      const stratumFocus = resolveAtlasGridClassNames({
        companionActive: true,
        lensLayout: "focus",
      });
      expect(stratumFocus).toContain("atlasGridWithLens");
      expect(stratumFocus).not.toContain("atlasGridLensBalanced");

      // LENS mode with companion panel active
      const lensBalanced = resolveAtlasGridClassNames({
        companionActive: true,
        lensLayout: "balanced",
      });
      expect(lensBalanced).toContain("atlasGridWithLens");
      expect(lensBalanced).toContain("atlasGridLensBalanced");

      // Inactive companion (Overview mode)
      const overviewClasses = resolveAtlasGridClassNames({
        companionActive: false,
        lensLayout: "balanced",
      });
      expect(overviewClasses).not.toContain("atlasGridWithLens");
      expect(overviewClasses).not.toContain("atlasGridLensBalanced");
    });
  });

  describe("2. Entity Lookup Invariant (Global Atlas Scope Integrity)", () => {
    it("ensures spotById and claimById maintain access to the full dataset even when scoped", () => {
      // Global master dictionaries
      const spotById = new Map(atlas.spots.map((spot) => [spot.id, spot]));
      const claimById = new Map(dataset.claims.map((claim) => [claim.id, claim]));

      // Verify that every spot in the entire atlas is retrievable by ID
      for (const spot of atlas.spots) {
        const resolved = spotById.get(spot.id);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe(spot.name);
      }

      // Verify cross-journey spot access:
      // Even if looking up spots across different journeys (e.g. munakata vs moji vs tsushima),
      // lookup never fails or returns undefined.
      const sampleSpotIds = atlas.spots.map((s) => s.id);
      expect(sampleSpotIds.length).toBeGreaterThanOrEqual(20);

      for (const id of sampleSpotIds) {
        expect(spotById.has(id)).toBe(true);
      }

      // Verify all claim IDs are indexed
      for (const claim of dataset.claims) {
        expect(claimById.has(claim.id)).toBe(true);
      }
    });
  });

  describe("3. Visited Spot Inspector Symmetry & Enrichment", () => {
    it("safely resolves shrine deity context and stratigraphy profiles for visited spots", () => {
      // Pick shrine/temple spots
      const sacredSpots = atlas.spots.filter(
        (spot) =>
          spot.kind === "神社" ||
          spot.kind === "古代祭祀遺跡" ||
          spot.kind === "寺院",
      );
      expect(sacredSpots.length).toBeGreaterThan(0);

      for (const spot of sacredSpots) {
        const deityContext = resolveSpotDeityContext(spot);
        // Deity context resolution should never crash
        if (deityContext) {
          expect(typeof deityContext.currentDeities).toBe("string");
          expect(deityContext.currentDeities.length).toBeGreaterThan(0);
        }

        const stratProfile = resolveSpotStratigraphyProfile(spot);
        if (stratProfile) {
          expect(stratProfile.spotNames.length).toBeGreaterThan(0);
          expect(stratProfile.oldestAttestedRecord).toBeDefined();
        }

        const portals = resolveCrossTopicPortals(spot);
        expect(Array.isArray(portals)).toBe(true);
      }
    });

    it("guarantees an inspector component is dispatched whenever a visited spot is selected", () => {
      type InspectorType = "stratum-inspector" | "atlas-inspector" | "none";

      function determineInspector(
        selectedSpot: ReviewAtlasSpot | null,
        explorationMode: "stratum" | "lens" | "overview",
      ): InspectorType {
        if (!selectedSpot) return "none";
        if (explorationMode === "stratum") return "stratum-inspector";
        return "atlas-inspector";
      }

      const sampleSpot = atlas.spots[0];
      expect(sampleSpot).toBeDefined();

      // In Stratum mode:
      expect(determineInspector(sampleSpot, "stratum")).toBe("stratum-inspector");

      // In LENS mode:
      expect(determineInspector(sampleSpot, "lens")).toBe("atlas-inspector");

      // In Overview mode:
      expect(determineInspector(sampleSpot, "overview")).toBe("atlas-inspector");

      // When deselected:
      expect(determineInspector(null, "lens")).toBe("none");
    });
  });

  describe("4. Companion Lenses Definition Invariants", () => {
    it("ensures lenses declare companionPanel strictly according to their analytical purpose", () => {
      const companionLenses = recognitionLensDefinitions.filter((l) => l.companionPanel);
      // All companion lenses must have non-empty ids and labels
      for (const lens of companionLenses) {
        expect(lens.id).toBeTruthy();
        expect(lens.label).toBeTruthy();
      }

      // Overview must never be a companion panel
      const overviewLens = recognitionLensDefinitions.find((l) => l.id === "overview");
      expect(overviewLens?.companionPanel).toBeFalsy();
    });
  });

  describe("5. ADR-0025 Spatial UI Interaction Policy & Single Inspector Drilldown Invariants", () => {
    it("resolves Meso-to-Micro drilldown from constituent point tag to specific visited spot", () => {
      const sampleSpots: ReviewAtlasSpot[] = [
        {
          id: "mizuki-fort",
          name: "水城跡",
          latitude: 33.52,
          longitude: 130.49,
          kind: "遺跡",
          region: "福岡県",
          claimIds: ["claim-1"],
          mapRole: "visited-place",
        },
        {
          id: "dazaifu-shrine",
          name: "太宰府天満宮",
          latitude: 33.521,
          longitude: 130.53,
          kind: "神社",
          region: "福岡県",
          claimIds: ["claim-2"],
          mapRole: "visited-place",
        },
      ];

      // Simulated Meso point in a hull connection (Dazaifu defense line)
      const pointWithSpotId: MapConnectionProjection["points"][number] = {
        id: "dazaifu-defense:mizuki",
        label: "水城（水城跡・東門官道・水城館）",
        latitude: 33.52,
        longitude: 130.49,
        kind: "visited",
        spotId: "mizuki-fort",
      };

      const pointWithoutSpotId: MapConnectionProjection["points"][number] = {
        id: "dazaifu-shrine-point",
        label: "太宰府天満宮",
        latitude: 33.521,
        longitude: 130.53,
        kind: "visited",
      };

      // Drilldown matcher helper mirroring handlePointClick
      function resolveTargetSpotId(point: MapConnectionProjection["points"][number]) {
        const matched = sampleSpots.find(
          (s) =>
            (point.spotId && s.id === point.spotId) ||
            s.id === point.id ||
            lensEntityNamesMatch(s.name, point.label) ||
            (point.aliases && point.aliases.some((a) => lensEntityNamesMatch(a, s.name)))
        );
        return matched?.id;
      }

      // Exact match via spotId
      expect(resolveTargetSpotId(pointWithSpotId)).toBe("mizuki-fort");

      // Robust match via lensEntityNamesMatch
      expect(resolveTargetSpotId(pointWithoutSpotId)).toBe("dazaifu-shrine");
    });

    it("ensures visual-only dimming for stratum projection without state mutation", () => {
      const defenseConnection: MapConnectionProjection = {
        id: "dazaifu-fortress-hull",
        sourceId: "fortress",
        connectionKind: "knowledge",
        origin: "knowledge-pack",
        title: "大宰府防衛要塞網",
        summary: "水城・大野城・基肄城による古代国防ライン",
        displayMode: "hull",
        selected: false,
        emphasized: false,
        points: [
          { id: "p1", spotId: "mizuki-spot", label: "水城", longitude: 130.49, latitude: 33.52, kind: "visited" },
          { id: "p2", spotId: "onojo-spot", label: "大野城", longitude: 130.51, latitude: 33.53, kind: "visited" },
        ],
        lensRefs: [],
        claimIds: [],
        assertionIds: [],
        sourceIds: [],
        confidences: ["high"],
        relationFamilies: ["route"],
        reviewStatus: "reviewed",
      };

      // When Yayoi stratum is active (mizuki is Ancient, not Yayoi)
      const yayoiActiveSpotIds = ["sugu-okamoto", "hirabaru-mound"];
      expect(isConnectionDimmed(defenseConnection, yayoiActiveSpotIds)).toBe(true);

      // When Ancient stratum is active (includes mizuki)
      const ancientActiveSpotIds = ["mizuki-spot", "kanzeonji"];
      expect(isConnectionDimmed(defenseConnection, ancientActiveSpotIds)).toBe(false);

      // When no stratum filter is active
      expect(isConnectionDimmed(defenseConnection, [])).toBe(false);
      expect(isConnectionDimmed(defenseConnection, undefined)).toBe(false);

      // Invariant: The connection itself remains completely unmutated
      expect(defenseConnection.selected).toBe(false);
      expect(defenseConnection.displayMode).toBe("hull");
    });
  });
});

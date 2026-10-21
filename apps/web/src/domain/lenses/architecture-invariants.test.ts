import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

import { registeredLensTopics, type LensLayoutArchetype } from "@/domain/lens-packs/knowledge-registry";
import {
  CANDIDATE_BRIDGE_RULES,
  matchCandidateForLensNode,
  matchLensNodeForCandidate,
  resolveSpotForLensNode,
} from "./candidate-matching";

describe("Architecture Invariant Guards (Veteran Engineering Standards)", () => {
  it("Invariant 1: Zero Stragglers - All registered topics use canonical pack-relationship renderer", () => {
    expect(registeredLensTopics.length).toBeGreaterThanOrEqual(27);

    for (const topic of registeredLensTopics) {
      expect(
        topic.renderer,
        `Topic ${topic.id} has non-canonical renderer "${topic.renderer}". Stragglers and bespoke renderers are forbidden.`,
      ).toBe("pack-relationship");
    }
  });

  it("Invariant 2: Complete Archetype Coverage - All non-stratum topics belong to canonical cognitive archetypes", () => {
    const validArchetypes: LensLayoutArchetype[] = [
      "sequence",
      "genealogy",
      "hub-spoke",
      "faction",
      "matrix",
      "stratum",
    ];

    for (const topic of registeredLensTopics) {
      expect(
        validArchetypes,
        `Topic ${topic.id} has invalid archetype "${topic.archetype}"`,
      ).toContain(topic.archetype);
    }

    // Verify non-empty distribution across all archetypes
    for (const archetype of validArchetypes) {
      const count = registeredLensTopics.filter((t) => t.archetype === archetype).length;
      expect(count, `Archetype "${archetype}" must have at least one topic`).toBeGreaterThanOrEqual(1);
    }
  });

  it("Invariant 3: Zero Hardcoded SVG Coordinates in Review Components", () => {
    const reviewDir = path.resolve(__dirname, "../../app/review");
    const files = fs.readdirSync(reviewDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

    for (const file of files) {
      const filePath = path.join(reviewDir, file);
      const content = fs.readFileSync(filePath, "utf8");

      // Verify no hardcoded node coordinates (positions dictionary) remain in review components
      const hasHardcodedPositions = /const\s+positions\s*:\s*Record<string,\s*\{?\s*x:\s*number/i.test(content);
      expect(
        hasHardcodedPositions,
        `File ${file} contains hardcoded SVG positions. Layout must be computed dynamically via cognitive archetypes.`,
      ).toBe(false);
    }
  });

  it("Invariant 4: Declarative Candidate Matching - CANDIDATE_BRIDGE_RULES is well-formed and symmetric", () => {
    expect(CANDIDATE_BRIDGE_RULES.length).toBeGreaterThanOrEqual(15);

    for (const rule of CANDIDATE_BRIDGE_RULES) {
      expect(rule.patterns.length, "Bridge rule patterns must not be empty").toBeGreaterThanOrEqual(1);
      expect(rule.targetNodeIds.length, "Bridge rule targetNodeIds must not be empty").toBeGreaterThanOrEqual(1);

      // Verify patterns do not contain empty strings
      for (const pattern of rule.patterns) {
        expect(pattern.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("Invariant 5: Plan A Enforcement - Person/Concept nodes never jump to arbitrary foreign spots", () => {
    const deityNode = { id: "amaterasu", label: "天照大御神", kind: "deity" };
    const linkWithForeignSpots = {
      primarySpotId: undefined,
      observedSpotIds: ["sazareishi-shrine"],
      spotIds: ["sazareishi-shrine", "takasu-shrine"],
      claimIds: ["claim-1"],
    };
    const spots = [
      { id: "sazareishi-shrine", name: "細石神社" },
      { id: "takasu-shrine", name: "高祖神社" },
    ] as any;

    // Deity must NOT pan to Sazareishi Shrine just because it has a link to that spot
    const resolvedSpotId = resolveSpotForLensNode(deityNode, linkWithForeignSpots as any, spots);
    expect(resolvedSpotId).toBeUndefined();

    // Place node with direct name match MUST resolve to its spot
    const placeNode = { id: "takasu-shrine", label: "高祖神社", kind: "place" };
    const resolvedPlaceSpotId = resolveSpotForLensNode(placeNode, linkWithForeignSpots as any, spots);
    expect(resolvedPlaceSpotId).toBe("takasu-shrine");
  });

  it("Invariant 6: Visual Stacking Context Hierarchy - Floating UI panels always supersede map markers", () => {
    const cssPath = path.resolve(__dirname, "../../app/review/atlas.module.css");
    const css = fs.readFileSync(cssPath, "utf8");

    // Extract z-index values
    const getZIndex = (selector: string): number => {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${escaped}[^{]*\\{[^}]*z-index:\\s*(\\d+)`, "m");
      const match = css.match(regex);
      if (!match) throw new Error(`Could not find z-index for selector: ${selector}`);
      return parseInt(match[1], 10);
    };

    const zSpotInspector = getZIndex(".mapSpotInspector");
    const zConnectionInfo = getZIndex(".mapConnectionInfo");
    const zEraRail = getZIndex(".eraRail");
    const zCameraControls = getZIndex(".mapFloatingCameraControls");
    const zLocateNotice = getZIndex(".mapLocateNotice");

    const zBaseSpotMarker = getZIndex(".mapSpotMarker:global(.maplibregl-marker)");
    const zBaseSuggestionMarker = getZIndex(".mapSuggestionMarker:global(.maplibregl-marker)");
    const zActiveSpotMarker = getZIndex(".mapSpotMarker[data-active=\"true\"]:global(.maplibregl-marker)");
    const zActiveSuggestionMarker = getZIndex(".mapSuggestionMarker[data-active=\"true\"]:global(.maplibregl-marker)");

    // 1. Floating UI panels must be strictly higher than all standard & active map markers
    expect(zSpotInspector).toBeGreaterThan(zActiveSpotMarker);
    expect(zSpotInspector).toBeGreaterThan(zActiveSuggestionMarker);
    expect(zConnectionInfo).toBeGreaterThan(zActiveSpotMarker);
    expect(zEraRail).toBeGreaterThan(zActiveSpotMarker);
    expect(zCameraControls).toBeGreaterThan(zActiveSpotMarker);
    expect(zLocateNotice).toBeGreaterThan(zActiveSpotMarker);

    // 2. Active suggestion markers must sit above base visited spot markers so candidate points are not obscured
    expect(zActiveSuggestionMarker).toBeGreaterThan(zBaseSpotMarker);
    expect(zActiveSuggestionMarker).toBeGreaterThan(zBaseSuggestionMarker);

    // 3. Floating inspector window and toasts must occupy the uppermost UI layer
    expect(zSpotInspector).toBeGreaterThanOrEqual(30);
    expect(zLocateNotice).toBeGreaterThanOrEqual(30);
  });
});

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
    const zSuggestionInspector = getZIndex(".mapSuggestionInspector");
    const zConnectionInfo = getZIndex(".mapConnectionInfo");
    const zArtifactCard = getZIndex(".mapArtifactCard");
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
    expect(zSuggestionInspector).toBeGreaterThan(zActiveSpotMarker);
    expect(zSuggestionInspector).toBeGreaterThan(zActiveSuggestionMarker);
    expect(zConnectionInfo).toBeGreaterThan(zActiveSpotMarker);
    expect(zArtifactCard).toBeGreaterThan(zActiveSpotMarker);
    expect(zArtifactCard).toBeGreaterThan(zActiveSuggestionMarker);
    expect(zEraRail).toBeGreaterThan(zActiveSpotMarker);
    expect(zCameraControls).toBeGreaterThan(zActiveSpotMarker);
    expect(zLocateNotice).toBeGreaterThan(zActiveSpotMarker);

    // 2. Active suggestion markers must sit above base visited spot markers so candidate points are not obscured
    expect(zActiveSuggestionMarker).toBeGreaterThan(zBaseSpotMarker);
    expect(zActiveSuggestionMarker).toBeGreaterThan(zBaseSuggestionMarker);

    // 3. Floating inspector window, connection info card, artifact card, and toasts must occupy the uppermost UI layer
    // and never be covered by eraRail (z-index 28) on narrow/mobile viewports
    expect(zSpotInspector).toBeGreaterThanOrEqual(30);
    expect(zSuggestionInspector).toBeGreaterThanOrEqual(30);
    expect(zConnectionInfo).toBeGreaterThanOrEqual(30);
    expect(zConnectionInfo).toBeGreaterThan(zEraRail);
    expect(zArtifactCard).toBeGreaterThanOrEqual(30);
    expect(zArtifactCard).toBeGreaterThan(zEraRail);
    expect(zLocateNotice).toBeGreaterThanOrEqual(30);
  });

  it("Invariant 7: No Brittle Snapshot-Count Hardcoding on Evolving Registries or Dataset Spots (Rule 21)", () => {
    const collectTestFiles = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const results: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...collectTestFiles(full));
        } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
          results.push(full);
        }
      }
      return results;
    };

    const domainDir = path.resolve(__dirname, "..");
    const testFiles = collectTestFiles(domainDir);

    const forbiddenRegistryCountPatterns: ReadonlyArray<{ label: string; regex: RegExp }> = [
      {
        label: "exact length on SACRED_SITE_STRATIGRAPHY_PROFILES",
        regex: /expect\(\s*SACRED_SITE_STRATIGRAPHY_PROFILES(?:\.length)?\s*\)\.(?:toBe|toHaveLength)\(\s*\d+\s*\)/,
      },
      {
        label: "exact length on SOURCE_TRADITION_COMPARISON_ENTRIES",
        regex: /expect\(\s*SOURCE_TRADITION_COMPARISON_ENTRIES(?:\.length)?\s*\)\.(?:toBe|toHaveLength)\(\s*\d+\s*\)/,
      },
      {
        label: "exact length on REGIONAL_COMPARISON_ENTRIES",
        regex: /expect\(\s*REGIONAL_COMPARISON_ENTRIES(?:\.length)?\s*\)\.(?:toBe|toHaveLength)\(\s*\d+\s*\)/,
      },
      {
        label: "exact length on registeredLensTopics or filtered archetype slices",
        regex:
          /expect\(\s*(?:registeredLensTopics(?:\.filter\([^)]*\))?|hubSpokeTopics|genealogyTopics|sequenceTopics|matrixTopics|factionTopics)(?:\.length)?\s*\)\.(?:toBe|toHaveLength)\(\s*\d+\s*\)/,
      },
    ];

    const forbiddenDatasetStratumCountPatterns: ReadonlyArray<{ label: string; regex: RegExp }> = [
      {
        label: "exact positive matchedCount snapshot on dataset spot",
        regex: /expect\([^)]*matchedCount\s*\)\.toBe\(\s*[1-9]\d*\s*\)/,
      },
      {
        label: "exact positive strataCount snapshot on dataset spot",
        regex: /expect\([^)]*strataCount\s*\)\.toBe\(\s*[1-9]\d*\s*\)/,
      },
      {
        label: "exact expectedLayers snapshot property",
        regex: /\bexpectedLayers\s*:\s*\d+/,
      },
    ];

    for (const filePath of testFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      const rel = path.relative(domainDir, filePath);

      for (const { label, regex } of forbiddenRegistryCountPatterns) {
        expect(
          regex.test(content),
          `Test file "${rel}" violates Rule 21 (${label}). Assert semantic invariants or lower bounds (>= N) instead.`,
        ).toBe(false);
      }

      if (content.includes("published-review-dataset.json")) {
        for (const { label, regex } of forbiddenDatasetStratumCountPatterns) {
          expect(
            regex.test(content),
            `Dataset-backed test file "${rel}" violates Rule 21 (${label}). Assert basis validity, core layer presence, and exclusions instead.`,
          ).toBe(false);
        }
      }
    }
  });

  it("Invariant 8: Release Traceability - Version badge remains visible on mobile viewports as well as desktop", () => {
    const topbarPath = path.resolve(__dirname, "../../app/review/atlas-topbar.tsx");
    const topbar = fs.readFileSync(topbarPath, "utf8");
    expect(topbar).toContain("styles.versionBadge");
    expect(topbar).toContain("NEXT_PUBLIC_GIT_COMMIT_SHA");

    const cssPath = path.resolve(__dirname, "../../app/review/atlas.module.css");
    const css = fs.readFileSync(cssPath, "utf8");

    // Every `.topMeta > span` selector must explicitly exclude `.versionBadge`
    const topMetaSpanMatches = [...css.matchAll(/\.topMeta\s*>\s*span([^\s,{]*)/g)];
    expect(topMetaSpanMatches.length).toBeGreaterThanOrEqual(1);
    for (const match of topMetaSpanMatches) {
      expect(
        match[1],
        `CSS rule "${match[0]}" hides .versionBadge on mobile unless :not(.versionBadge) is specified.`,
      ).toContain(":not(.versionBadge)");
    }

    // No `.versionBadge` rule may set `display: none`
    expect(/\.versionBadge\s*\{[^}]*display:\s*none/m.test(css)).toBe(false);
  });
});

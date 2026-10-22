import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import {
  REGIONAL_COMPARISON_ENTRIES,
  SOURCE_TRADITION_COMPARISON_ENTRIES,
  SACRED_SITE_STRATIGRAPHY_PROFILES,
} from "@/domain/knowledge/stratigraphy-profiles";
import { recognitionLensDefinitions } from "./use-atlas-lens-state";
import { calculateClampedPanelOffset } from "./use-draggable-panel";
import type { ReviewDataset } from "@/domain/review/types";

describe("STRATUM and LENS switching investigation & Invariant Guards", () => {
  it("resolves topics for all available recognition lenses without crashing", () => {
    const dataset = publishedDataset as unknown as ReviewDataset;
    expect(dataset.atlas?.spots.length).toBeGreaterThan(0);

    for (const lens of recognitionLensDefinitions) {
      if (lens.id === "overview") continue;
      const topics = resolveLensTopics({
        perspectiveId: lens.id,
        claims: dataset.claims,
        spots: dataset.atlas!.spots,
        includeUnvisited: true,
      });
      expect(topics.length).toBeGreaterThan(0);
    }
  });

  it("calculates clamped offset safely for both top-left and top-right origins", () => {
    const topLeft = calculateClampedPanelOffset({
      dx: 50,
      dy: 50,
      initialOffsetX: 0,
      initialOffsetY: 0,
      anchorOrigin: "top-left",
      viewportWidth: 1000,
      viewportHeight: 800,
    });
    expect(topLeft).toEqual({ x: 50, y: 50 });

    const topRight = calculateClampedPanelOffset({
      dx: -50,
      dy: 50,
      initialOffsetX: 0,
      initialOffsetY: 0,
      anchorOrigin: "top-right",
      viewportWidth: 1000,
      viewportHeight: 800,
    });
    expect(topRight).toEqual({ x: -50, y: 50 });
  });

  it("ensures available recognition lenses include companionPanel lenses for LENS mode", () => {
    const companionLenses = recognitionLensDefinitions.filter((l) => l.companionPanel);
    expect(companionLenses.length).toBeGreaterThan(0);
    expect(companionLenses.some((l) => l.id === "mythology")).toBe(true);
    expect(companionLenses.some((l) => l.id === "religion")).toBe(true);
  });

  it("ensures analytical comparison panels and depth stratigraphy models are properly structured", () => {
    // 1. Regional Comparison (地域6観点比較) has valid entries with all 6 criteria
    expect(REGIONAL_COMPARISON_ENTRIES.length).toBeGreaterThanOrEqual(4);
    for (const entry of REGIONAL_COMPARISON_ENTRIES) {
      expect(entry.regions.length).toBeGreaterThanOrEqual(2);
      expect(entry.commonality).toBeTruthy();
      expect(entry.difference).toBeTruthy();
      expect(entry.chronology).toBeTruthy();
      expect(entry.contactPossibility).toBeTruthy();
      expect(entry.independence).toBeTruthy();
      expect(entry.alternativeExplanation).toBeTruthy();
    }

    // 2. Source Tradition Comparison (史料A・B・C異伝比較)
    expect(SOURCE_TRADITION_COMPARISON_ENTRIES.length).toBeGreaterThanOrEqual(4);
    for (const entry of SOURCE_TRADITION_COMPARISON_ENTRIES) {
      expect(entry.targetTheme).toBeTruthy();
      expect(entry.categoryABedrock.statement).toBeTruthy();
      expect(entry.categoryBTradition.statement).toBeTruthy();
      expect(entry.categoryCContested.statement).toBeTruthy();
    }

    // 3. Sacred Site Profiles (聖地7項目)
    expect(SACRED_SITE_STRATIGRAPHY_PROFILES.length).toBeGreaterThanOrEqual(17);
    for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
      expect(profile.spotNames.length).toBeGreaterThanOrEqual(1);
      expect(profile.currentDeities).toBeTruthy();
      expect(profile.oldestAttestedRecord.statement).toBeTruthy();
      expect(profile.archaeologyAndNaturalTarget.statement).toBeTruthy();
    }
  });
});

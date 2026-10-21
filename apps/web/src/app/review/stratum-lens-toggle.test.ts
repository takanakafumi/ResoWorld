import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
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
});

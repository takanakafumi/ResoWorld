import { describe, expect, it } from "vitest";

import { LENS_PERSPECTIVE_GUIDES } from "./atlas-lens-directory";
import { TOPIC_STRUCTURAL_GUIDES } from "@/domain/lenses/structural-guides";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";

describe("AtlasLensDirectory Invariants (Issue #37)", () => {
  it("Invariant 1: All 5 major knowledge lenses have comprehensive guides", () => {
    const requiredLensIds = ["mythology", "religion", "route", "politics", "people"];
    const definedIds = LENS_PERSPECTIVE_GUIDES.map((l) => l.id);

    expect(definedIds).toEqual(requiredLensIds);

    for (const guide of LENS_PERSPECTIVE_GUIDES) {
      expect(guide.label.length).toBeGreaterThan(0);
      expect(guide.tag.length).toBeGreaterThan(0);
      expect(guide.icon.length).toBeGreaterThan(0);
      expect(guide.color.startsWith("#")).toBe(true);
      expect(guide.title.length).toBeGreaterThan(5);
      expect(guide.archetype.length).toBeGreaterThan(5);
      expect(guide.description.length).toBeGreaterThan(20);
      expect(guide.highlightTopics.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("Invariant 2: All highlight topics exist in TOPIC_STRUCTURAL_GUIDES", () => {
    for (const guide of LENS_PERSPECTIVE_GUIDES) {
      for (const topic of guide.highlightTopics) {
        expect(
          TOPIC_STRUCTURAL_GUIDES[topic.id as keyof typeof TOPIC_STRUCTURAL_GUIDES],
          `Topic ${topic.id} under lens ${guide.id} must exist in TOPIC_STRUCTURAL_GUIDES`,
        ).toBeDefined();
        expect(topic.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("Invariant 3: All highlight topics match registeredLensTopics perspective scoping", () => {
    for (const guide of LENS_PERSPECTIVE_GUIDES) {
      for (const topic of guide.highlightTopics) {
        const registered = registeredLensTopics.find((t) => t.id === topic.id);
        expect(
          registered,
          `Topic ${topic.id} must be registered in canonical registeredLensTopics`,
        ).toBeDefined();
        expect(
          registered?.perspectiveId,
          `Topic ${topic.id} perspective (${registered?.perspectiveId}) must match guide lens id (${guide.id})`,
        ).toBe(guide.id);
      }
    }
  });
});

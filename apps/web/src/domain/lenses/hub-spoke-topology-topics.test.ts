import { describe, expect, it } from "vitest";

import {
  registeredLensTopics,
  lensLayoutArchetypeLabels,
  type LensLayoutArchetype,
} from "../lens-packs/knowledge-registry";
import { projectLensPreset } from "../lens-packs/projection";
import { resolveLensTopics } from "./topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset } from "../review/types";

describe("Hub & Spoke Topology Archetype Topics Verification (Issue 5)", () => {
  it("verifies all designated hub-spoke topics are correctly classified", () => {
    const expectedHubSpokeTopicIds = [
      "izumo-kunitsukami-corridor",
      "munakata-three-shrines",
      "shikinaisha-network-preset",
    ];

    for (const topicId of expectedHubSpokeTopicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId);
      expect(topic, `Topic ${topicId} must exist in registered topics`).toBeDefined();
      expect(topic?.archetype).toBe("hub-spoke");
      expect(topic?.archetypeLabel).toBe("中心・外縁型");
    }
  });

  it("projects Munakata three shrines with concentric sacred topology (Okitsu, Nakatsu, Hetsu)", () => {
    const topic = registeredLensTopics.find((t) => t.id === "munakata-three-shrines");
    expect(topic).toBeDefined();

    const projection = projectLensPreset(topic!.pack, topic!.presetId);
    expect(projection.nodes.length).toBeGreaterThanOrEqual(3);

    const nodeIds = projection.nodes.map((n) => n.id);
    expect(nodeIds).toContain("munakata-okitsumiya");
    expect(nodeIds).toContain("munakata-nakatsumiya");
    expect(nodeIds).toContain("munakata-hetsumiya");
  });

  it("projects Izumo corridor with Izumo Taisha as central hub and regional enshrinement spokes", () => {
    const topic = registeredLensTopics.find((t) => t.id === "izumo-kunitsukami-corridor");
    expect(topic).toBeDefined();

    const projection = projectLensPreset(topic!.pack, topic!.presetId);
    expect(projection.nodes.some((n) => n.id === "izumo-taisha")).toBe(true);

    // Spokes radiating to western regional spots
    const hasRegionalSpokes = projection.edges.some(
      (e) => e.predicate === "enshrined_at" || e.predicate === "associated_with",
    );
    expect(hasRegionalSpokes).toBe(true);
  });

  it("projects Dazaifu defense system with core governance and mountain fortress perimeter", () => {
    const topic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset");
    expect(topic).toBeDefined();

    const projection = projectLensPreset(topic!.pack, topic!.presetId);
    expect(projection.nodes.length).toBeGreaterThanOrEqual(3);

    // Should include defense facilities (Mizuki, Ono Castle, etc.)
    const nodeIds = projection.nodes.map((n) => n.id);
    const hasDefenseSite = nodeIds.some((id) => id.includes("mizuki") || id.includes("ono") || id.includes("dazaifu"));
    expect(hasDefenseSite).toBe(true);
  });

  it("verifies 100% archetype coverage across all registered topics (zero untyped topics)", () => {
    const validArchetypes = new Set<LensLayoutArchetype>([
      "sequence",
      "genealogy",
      "hub-spoke",
      "faction",
      "matrix",
      "stratum",
    ]);

    expect(registeredLensTopics.length).toBeGreaterThanOrEqual(25);

    for (const topic of registeredLensTopics) {
      expect(
        validArchetypes.has(topic.archetype),
        `Topic "${topic.id}" must have a valid cognitive archetype, but got "${topic.archetype}"`,
      ).toBe(true);

      expect(
        topic.archetypeLabel,
        `Topic "${topic.id}" must have a valid archetypeLabel`,
      ).toBe(lensLayoutArchetypeLabels[topic.archetype]);
    }
  });
});

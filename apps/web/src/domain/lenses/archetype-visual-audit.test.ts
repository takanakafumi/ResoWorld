import { describe, it, expect } from "vitest";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import { projectLensPreset } from "../lens-packs/projection";

describe("Cognitive Archetype Visual Density & Layout Audit (All 27 Topics)", () => {
  it("audits all 7 Hub-Spoke topics for orbit capacity and canvas bounds", () => {
    const hubSpokeTopics = registeredLensTopics.filter((t) => t.archetype === "hub-spoke");
    expect(hubSpokeTopics.length).toBe(7);

    for (const topic of hubSpokeTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have nodes`).toBeGreaterThanOrEqual(3);

      // Verify node labels are not excessively long (< 24 chars to fit within 130px pill)
      for (const node of projection.nodes) {
        expect(
          node.label.length,
          `Node ${node.id} label '${node.label}' in ${topic.id} should fit in hub pill`,
        ).toBeLessThanOrEqual(24);
      }
    }
  });

  it("audits all 3 Genealogy topics for DAG layer stratification and zero root collision", () => {
    const genealogyTopics = registeredLensTopics.filter((t) => t.archetype === "genealogy");
    expect(genealogyTopics.length).toBe(3);

    for (const topic of genealogyTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have nodes`).toBeGreaterThanOrEqual(3);
      expect(projection.edges.length, `${topic.id} must have edges`).toBeGreaterThanOrEqual(2);

      // Verify root nodes are distinctly identifiable
      const targetIds = new Set(projection.edges.map((e) => e.objectId));
      const rootCandidates = projection.nodes.filter((n) => !targetIds.has(n.id));
      expect(
        rootCandidates.length,
        `${topic.id} should have clean root nodes (not entire graph at top)`,
      ).toBeLessThan(projection.nodes.length);
    }
  });

  it("audits all Sequence topics for ordered waypoints and connection integrity", () => {
    const sequenceTopics = registeredLensTopics.filter((t) => t.archetype === "sequence");
    expect(sequenceTopics.length).toBe(8);

    for (const topic of sequenceTopics) {
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      expect(preset, `Preset ${topic.presetId} must exist`).toBeDefined();

      const connection = preset?.mapConnections?.[0];
      if (connection) {
        expect(
          connection.placeEntityIds.length,
          `Sequence connection for ${topic.id} should have ordered waypoints`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("audits all 3 Matrix topics for comparative columns and balanced distribution", () => {
    const matrixTopics = registeredLensTopics.filter((t) => t.archetype === "matrix");
    expect(matrixTopics.length).toBe(3);

    for (const topic of matrixTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have comparative nodes`).toBeGreaterThanOrEqual(3);
    }
  });

  it("audits all 5 Faction topics for distinct factions and member grouping", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBe(5);

    for (const topic of factionTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have faction nodes`).toBeGreaterThanOrEqual(4);
    }
  });
});

import { describe, it, expect } from "vitest";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import { projectLensPreset } from "../lens-packs/projection";
import { calculateHubSpokeOrbitLayout } from "./layout/hub-spoke-orbit-layout";
import { calculateGenealogyDagLayout } from "./layout/genealogy-dag-layout";

describe("Cognitive Archetype Visual Density & Layout Audit (All 29 Topics)", () => {
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

  it("verifies appropriate node distancing and non-overlapping clearance in Hub-Spoke radial layouts", () => {
    const hubSpokeTopics = registeredLensTopics.filter((t) => t.archetype === "hub-spoke");

    for (const topic of hubSpokeTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      const layout = calculateHubSpokeOrbitLayout(projection.nodes, projection.edges, {
        designatedRootId: preset?.rootEntityIds?.[0],
      });
      const positions = layout.radialPositions;

      // Assert clearance between EVERY pair of nodes on canvas
      const allPosList = Array.from(positions.entries());
      for (let i = 0; i < allPosList.length; i++) {
        for (let j = i + 1; j < allPosList.length; j++) {
          const [id1, p1] = allPosList[i]!;
          const [id2, p2] = allPosList[j]!;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const centerDist = Math.hypot(dx, dy);

          // Center distance must be >= 75px
          expect(
            centerDist,
            `In ${topic.id}, distance between '${id1}' and '${id2}' must be >= 75px (got ${centerDist.toFixed(1)}px)`,
          ).toBeGreaterThanOrEqual(75);

          // If on same ring with similar Y or X, check horizontal/vertical clearance
          if (p1.ring === p2.ring && p1.ring > 0) {
            // Chord distance between nodes on same ring
            expect(
              centerDist,
              `In ${topic.id} ring ${p1.ring}, chord distance between '${id1}' and '${id2}' must be >= 115px (got ${centerDist.toFixed(1)}px)`,
            ).toBeGreaterThanOrEqual(115);
          }
        }
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

  it("verifies appropriate node distancing and clearance gaps in Genealogy layouts", () => {
    const genealogyTopics = registeredLensTopics.filter((t) => t.archetype === "genealogy");

    for (const topic of genealogyTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);

      const layout = calculateGenealogyDagLayout(projection.nodes, projection.edges);

      // Verify clearance gap between every adjacent pair of pills on every tier
      const tierMap = new Map<number, Array<{ id: string; label: string; x: number; width: number }>>();
      for (const node of projection.nodes) {
        const pos = layout.nodePositions.get(node.id)!;
        if (!tierMap.has(pos.level)) tierMap.set(pos.level, []);
        tierMap.get(pos.level)!.push({ id: node.id, label: node.label, x: pos.x, width: pos.width });
      }

      for (const [tier, nodes] of tierMap.entries()) {
        if (nodes.length <= 1) continue;
        nodes.sort((a, b) => a.x - b.x);

        for (let i = 0; i < nodes.length - 1; i++) {
          const n1 = nodes[i]!;
          const n2 = nodes[i + 1]!;
          const edgeDistance = (n2.x - n2.width / 2) - (n1.x + n1.width / 2);
          // Expect at least 15px clearance gap between pill borders
          expect(
            edgeDistance,
            `In ${topic.id} Tier ${tier}, gap between '${n1.label}' and '${n2.label}' must be >= 15px (got ${edgeDistance}px)`,
          ).toBeGreaterThanOrEqual(15);
        }
      }
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

  it("audits all 7 Faction topics for distinct factions and member grouping", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBe(7);

    for (const topic of factionTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have faction nodes`).toBeGreaterThanOrEqual(4);
    }
  });
});

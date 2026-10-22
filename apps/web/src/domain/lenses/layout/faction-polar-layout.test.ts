import { describe, expect, it } from "vitest";
import { registeredLensTopics } from "../../lens-packs/knowledge-registry";
import { projectLensPreset } from "../../lens-packs/projection";
import { calculateFactionPolarLayout } from "./faction-polar-layout";

describe("Faction Polar Layout Engine Invariants", () => {
  it("audits all 8 Faction topics for valid polar layout geometry and zone separation", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBe(8);

    for (const topic of factionTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const layout = calculateFactionPolarLayout(projection.nodes, projection.edges);

      expect(layout.canvasWidth, `${topic.id} canvasWidth`).toBeGreaterThanOrEqual(800);
      expect(layout.canvasHeight, `${topic.id} canvasHeight`).toBeGreaterThanOrEqual(400);
      expect(layout.factionZones.length, `${topic.id} should have faction zones`).toBeGreaterThanOrEqual(1);

      // Verify every node has a finite position within canvas bounds
      for (const node of projection.nodes) {
        const pos = layout.nodePositions.get(node.id);
        expect(pos, `Node ${node.id} in ${topic.id} must be positioned`).toBeDefined();
        expect(Number.isFinite(pos!.x), `pos.x for ${node.id}`).toBe(true);
        expect(Number.isFinite(pos!.y), `pos.y for ${node.id}`).toBe(true);
        expect(pos!.x, `pos.x for ${node.id} in canvas`).toBeGreaterThan(0);
        expect(pos!.x, `pos.x for ${node.id} in canvas`).toBeLessThan(layout.canvasWidth);
        expect(pos!.y, `pos.y for ${node.id} in canvas`).toBeGreaterThan(0);
        expect(pos!.y, `pos.y for ${node.id} in canvas`).toBeLessThan(layout.canvasHeight);
      }

      // Verify clearance between every pair of nodes
      const allPosList = Array.from(layout.nodePositions.entries());
      for (let i = 0; i < allPosList.length; i++) {
        for (let j = i + 1; j < allPosList.length; j++) {
          const [id1, p1] = allPosList[i]!;
          const [id2, p2] = allPosList[j]!;
          const centerDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          expect(
            centerDist,
            `In ${topic.id}, distance between '${id1}' and '${id2}' must be >= 30px (got ${centerDist.toFixed(1)}px)`,
          ).toBeGreaterThanOrEqual(30);
        }
      }

      // Verify edges have valid SVG pathD and finite label positions
      for (const edge of layout.edges) {
        expect(edge.pathD, `Edge ${edge.id} in ${topic.id} must have pathD`).toBeTruthy();
        expect(Number.isFinite(edge.labelPosition.x)).toBe(true);
        expect(Number.isFinite(edge.labelPosition.y)).toBe(true);
      }
    }
  });

  it("correctly identifies confrontation boundary for Izumo Kuniyuzuri and Yamatai", () => {
    const izumoTopic = registeredLensTopics.find((t) => t.id === "izumo-kunitsukami-preset")!;
    const izumoProj = projectLensPreset(izumoTopic.pack, izumoTopic.presetId);
    const izumoLayout = calculateFactionPolarLayout(izumoProj.nodes, izumoProj.edges);

    expect(izumoLayout.boundaryAxis).toBeDefined();
    expect(izumoLayout.factionZones.length).toBeGreaterThanOrEqual(2);

    const yamataiTopic = registeredLensTopics.find((t) => t.id === "yamatai-politics")!;
    const yamataiProj = projectLensPreset(yamataiTopic.pack, yamataiTopic.presetId);
    const yamataiLayout = calculateFactionPolarLayout(yamataiProj.nodes, yamataiProj.edges);

    expect(yamataiLayout.boundaryAxis?.icon).toBe("⚔️");
    expect(yamataiLayout.boundaryAxis?.label).toContain("対立");
  });

  it("correctly identifies alliance boundary for Ishin Figures Network", () => {
    const ishinTopic = registeredLensTopics.find((t) => t.id === "ishin-figures-network")!;
    const ishinProj = projectLensPreset(ishinTopic.pack, ishinTopic.presetId);
    const ishinLayout = calculateFactionPolarLayout(ishinProj.nodes, ishinProj.edges);

    expect(ishinLayout.boundaryAxis?.icon).toBe("🤝");
    expect(ishinLayout.boundaryAxis?.label).toContain("同盟");
  });
});

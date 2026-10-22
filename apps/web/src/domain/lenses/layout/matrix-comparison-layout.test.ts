import { describe, expect, it } from "vitest";

import { calculateMatrixComparisonLayout } from "./matrix-comparison-layout";
import { registeredLensTopics } from "../../lens-packs/knowledge-registry";
import { projectLensPreset } from "../../lens-packs/projection";

describe("calculateMatrixComparisonLayout (Mathematical Invariants)", () => {
  it("positions all nodes and guarantees non-empty bounds for synthetic comparison data", () => {
    const nodes = [
      { id: "anchor-a", label: "宗像氏系", kind: "group" },
      { id: "deity-a", label: "宗像三女神", kind: "deity" },
      { id: "place-a", label: "沖ノ島", kind: "place" },
      { id: "anchor-b", label: "住吉氏系", kind: "group" },
      { id: "deity-b", label: "住吉三神", kind: "deity" },
      { id: "place-b", label: "住吉大社", kind: "place" },
    ];

    const edges = [
      { id: "e1", subjectId: "anchor-a", objectId: "deity-a", predicate: "reveres" },
      { id: "e2", subjectId: "deity-a", objectId: "place-a", predicate: "enshrined_at" },
      { id: "e3", subjectId: "anchor-b", objectId: "deity-b", predicate: "reveres" },
      { id: "e4", subjectId: "deity-b", objectId: "place-b", predicate: "enshrined_at" },
      { id: "e5", subjectId: "deity-a", objectId: "deity-b", predicate: "contrasted_with" },
    ];

    const columns = [
      {
        id: "col-munakata",
        title: "宗像海人系",
        anchorNodeId: "anchor-a",
        memberNodeIds: ["deity-a", "place-a"],
      },
      {
        id: "col-sumiyoshi",
        title: "住吉津守系",
        anchorNodeId: "anchor-b",
        memberNodeIds: ["deity-b", "place-b"],
      },
    ];

    const result = calculateMatrixComparisonLayout(nodes, edges, columns);

    // Invariant 1: All nodes must have positions
    expect(result.nodePositions.size).toBe(nodes.length);
    for (const node of nodes) {
      const pos = result.nodePositions.get(node.id);
      expect(pos, `Missing position for ${node.id}`).toBeDefined();
      expect(pos?.x).toBeGreaterThan(0);
      expect(pos?.y).toBeGreaterThan(0);
      expect(pos?.width).toBeGreaterThan(0);
      expect(pos?.height).toBeGreaterThan(0);
    }

    // Invariant 2: Column zones generated
    expect(result.columnZones.length).toBe(2);
    expect(result.columnZones[0]?.title).toBe("宗像海人系");
    expect(result.columnZones[1]?.title).toBe("住吉津守系");

    // Invariant 3: Inter-column cross comparison edge is marked and has Bezier curve
    const crossEdge = result.edges.find((e) => e.id === "e5");
    expect(crossEdge).toBeDefined();
    expect(crossEdge?.isCrossColumn).toBe(true);
    expect(crossEdge?.pathD).toContain("C");
  });

  it("verifies layout computation for all 6 registered matrix topics without error", () => {
    const matrixTopics = registeredLensTopics.filter((t) => t.archetype === "matrix");
    expect(matrixTopics.length).toBeGreaterThanOrEqual(6);

    for (const topic of matrixTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `No nodes in topic ${topic.id}`).toBeGreaterThan(0);

      // Extract columns if preset has mapConnections, or derive dynamically
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      const cols = preset?.mapConnections && preset.mapConnections.length >= 2
        ? preset.mapConnections.map((c) => ({
            id: c.id,
            title: c.label,
            subtitle: c.description,
            color: c.appearance?.color,
            anchorNodeId: c.anchorEntityId ?? c.placeEntityIds[0],
            memberNodeIds: [...c.placeEntityIds, ...(c.contextEntityIds ?? [])],
          }))
        : [];

      const result = calculateMatrixComparisonLayout(projection.nodes, projection.edges, cols);

      // Invariant: every single node in projection must be positioned on canvas
      expect(result.nodePositions.size, `Topic ${topic.id} missing node positions`).toBe(
        projection.nodes.length,
      );
      for (const node of projection.nodes) {
        const pos = result.nodePositions.get(node.id);
        expect(pos, `Missing position for node ${node.id} in ${topic.id}`).toBeDefined();
      }

      expect(result.canvasWidth).toBeGreaterThan(0);
      expect(result.canvasHeight).toBeGreaterThan(0);
      expect(result.columnZones.length).toBeGreaterThanOrEqual(2);
    }
  });
});

import { describe, it, expect } from "vitest";
import { calculateGenealogyDagLayout } from "./genealogy-dag-layout";

describe("Genealogy DAG Layout Engine", () => {
  it("calculates hierarchical DAG tiers with roots at level 0", () => {
    const nodes = [
      { id: "parent", label: "Parent Node", kind: "deity" },
      { id: "child1", label: "Child 1", kind: "deity" },
      { id: "child2", label: "Child 2", kind: "deity" },
      { id: "grandchild", label: "Grandchild", kind: "deity" },
    ];

    const edges = [
      { id: "e1", subjectId: "parent", objectId: "child1", predicate: "parent_of" },
      { id: "e2", subjectId: "parent", objectId: "child2", predicate: "parent_of" },
      { id: "e3", subjectId: "child1", objectId: "grandchild", predicate: "parent_of" },
    ];

    const layout = calculateGenealogyDagLayout(nodes, edges);

    expect(layout.nodePositions.get("parent")?.level).toBe(0);
    expect(layout.nodePositions.get("child1")?.level).toBe(1);
    expect(layout.nodePositions.get("child2")?.level).toBe(1);
    expect(layout.nodePositions.get("grandchild")?.level).toBe(2);

    expect(layout.treeConnectorEdges.length).toBe(3);
    expect(layout.canvasWidth).toBeGreaterThanOrEqual(760);
    expect(layout.canvasHeight).toBeGreaterThanOrEqual(420);
  });

  it("handles reverse predicates like child_of and descendant_of properly", () => {
    const nodes = [
      { id: "ancestor", label: "Ancestor" },
      { id: "descendant", label: "Descendant" },
    ];

    const edges = [
      { id: "e1", subjectId: "descendant", objectId: "ancestor", predicate: "child_of" },
    ];

    const layout = calculateGenealogyDagLayout(nodes, edges);

    expect(layout.nodePositions.get("ancestor")?.level).toBe(0);
    expect(layout.nodePositions.get("descendant")?.level).toBe(1);
  });

  it("places place and text nodes at the deepest assigned tier", () => {
    const nodes = [
      { id: "kami", label: "Kami Deity", kind: "deity" },
      { id: "shrine", label: "Shrine Place", kind: "place" },
    ];

    const edges = [
      { id: "e1", subjectId: "kami", objectId: "shrine", predicate: "enshrined_at" },
    ];

    const layout = calculateGenealogyDagLayout(nodes, edges);

    expect(layout.nodePositions.get("kami")?.level).toBe(0);
    expect(layout.nodePositions.get("shrine")?.level).toBe(1);
  });

  it("prevents horizontal collision between nodes in the same tier", () => {
    const nodes = [
      { id: "r", label: "Root" },
      { id: "c1", label: "Child One" },
      { id: "c2", label: "Child Two" },
      { id: "c3", label: "Child Three" },
      { id: "c4", label: "Child Four" },
    ];

    const edges = [
      { id: "e1", subjectId: "r", objectId: "c1", predicate: "parent_of" },
      { id: "e2", subjectId: "r", objectId: "c2", predicate: "parent_of" },
      { id: "e3", subjectId: "r", objectId: "c3", predicate: "parent_of" },
      { id: "e4", subjectId: "r", objectId: "c4", predicate: "parent_of" },
    ];

    const layout = calculateGenealogyDagLayout(nodes, edges);
    const tier1Nodes = [
      layout.nodePositions.get("c1")!,
      layout.nodePositions.get("c2")!,
      layout.nodePositions.get("c3")!,
      layout.nodePositions.get("c4")!,
    ].sort((a, b) => a.x - b.x);

    for (let i = 0; i < tier1Nodes.length - 1; i++) {
      const cur = tier1Nodes[i]!;
      const nxt = tier1Nodes[i + 1]!;
      // Center-to-center distance should exceed average pill width
      expect(nxt.x - cur.x).toBeGreaterThanOrEqual(92);
    }
  });
});

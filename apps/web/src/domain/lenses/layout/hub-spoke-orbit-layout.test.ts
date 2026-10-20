import { describe, it, expect } from "vitest";
import { calculateHubSpokeOrbitLayout } from "./hub-spoke-orbit-layout";

describe("Hub-Spoke Orbit Layout Engine", () => {
  it("selects designated root as hub core at the center", () => {
    const nodes = [
      { id: "node-a", label: "Node A" },
      { id: "node-root", label: "Designated Root" },
      { id: "node-b", label: "Node B" },
    ];
    const edges = [
      { id: "e1", subjectId: "node-root", objectId: "node-a", predicate: "associated_with" },
      { id: "e2", subjectId: "node-root", objectId: "node-b", predicate: "associated_with" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "node-root" });

    expect(layout.hubCore?.id).toBe("node-root");
    const rootPos = layout.radialPositions.get("node-root");
    expect(rootPos?.isCore).toBe(true);
    expect(rootPos?.ring).toBe(0);
    expect(rootPos?.x).toBe(layout.cx);
    expect(rootPos?.y).toBe(layout.cy);
  });

  it("selects highest-degree node if no designated root is provided", () => {
    const nodes = [
      { id: "leaf1", label: "Leaf 1" },
      { id: "hub", label: "Natural Hub" },
      { id: "leaf2", label: "Leaf 2" },
      { id: "leaf3", label: "Leaf 3" },
    ];
    const edges = [
      { id: "e1", subjectId: "hub", objectId: "leaf1", predicate: "enshrined_at" },
      { id: "e2", subjectId: "hub", objectId: "leaf2", predicate: "enshrined_at" },
      { id: "e3", subjectId: "hub", objectId: "leaf3", predicate: "enshrined_at" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges);

    expect(layout.hubCore?.id).toBe("hub");
  });

  it("dynamically creates 3 concentric rings when outer nodes exceed 7", () => {
    const nodes = [
      { id: "core", label: "Core Hub" },
      ...Array.from({ length: 9 }, (_, i) => ({ id: `outer-${i}`, label: `Outer ${i}` })),
    ];
    const edges = Array.from({ length: 9 }, (_, i) => ({
      id: `e-${i}`,
      subjectId: "core",
      objectId: `outer-${i}`,
      predicate: "associated_with",
    }));

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    expect(layout.hasRing3).toBe(true);
    expect(layout.canvasHeight).toBe(560);

    const ring1 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 1);
    const ring2 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 2);
    const ring3 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 3);

    expect(ring1.length).toBe(4);
    expect(ring2.length).toBe(5);
    expect(ring3.length).toBe(0); // 9 total outer nodes: cap1=4, cap2=7 => ring1 has 4, ring2 has 5
  });

  it("allocates to ring 3 when outer nodes exceed 11", () => {
    const nodes = [
      { id: "core", label: "Core Hub" },
      ...Array.from({ length: 13 }, (_, i) => ({ id: `outer-${i}`, label: `Outer ${i}` })),
    ];
    const edges = Array.from({ length: 13 }, (_, i) => ({
      id: `e-${i}`,
      subjectId: "core",
      objectId: `outer-${i}`,
      predicate: "associated_with",
    }));

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    expect(layout.hasRing3).toBe(true);

    const ring1 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 1);
    const ring2 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 2);
    const ring3 = Array.from(layout.radialPositions.values()).filter((p) => p.ring === 3);

    expect(ring1.length).toBe(4);
    expect(ring2.length).toBe(7);
    expect(ring3.length).toBe(2);
  });

  it("interleaves angles between rings to prevent overlapping rays", () => {
    const nodes = [
      { id: "core", label: "Core" },
      { id: "r1-a", label: "Ring1 A" },
      { id: "r1-b", label: "Ring1 B" },
      { id: "r2-a", label: "Ring2 A" },
      { id: "r2-b", label: "Ring2 B" },
    ];
    const edges = [
      { id: "e1", subjectId: "core", objectId: "r1-a", predicate: "connected" },
      { id: "e2", subjectId: "core", objectId: "r1-b", predicate: "connected" },
      { id: "e3", subjectId: "core", objectId: "r2-a", predicate: "connected" },
      { id: "e4", subjectId: "core", objectId: "r2-b", predicate: "connected" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    // Clearance check between any two nodes
    const allPos = Array.from(layout.radialPositions.values());
    for (let i = 0; i < allPos.length; i++) {
      for (let j = i + 1; j < allPos.length; j++) {
        const p1 = allPos[i]!;
        const p2 = allPos[j]!;
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        expect(dist).toBeGreaterThanOrEqual(75);
      }
    }
  });
});

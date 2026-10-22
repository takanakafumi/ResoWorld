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

  it("clusters Ring 2 nodes barycentrically near their connected Ring 1 parents", () => {
    const nodes = [
      { id: "core", label: "Core Hub" },
      { id: "parent-east", label: "Parent East" },
      { id: "parent-west", label: "Parent West" },
      { id: "child-east-1", label: "Child East 1" },
      { id: "child-east-2", label: "Child East 2" },
      { id: "child-west-1", label: "Child West 1" },
      { id: "child-west-2", label: "Child West 2" },
    ];
    const edges = [
      { id: "e1", subjectId: "core", objectId: "parent-east", predicate: "associated_with" },
      { id: "e2", subjectId: "core", objectId: "parent-west", predicate: "associated_with" },
      { id: "e3", subjectId: "parent-east", objectId: "child-east-1", predicate: "enshrined_at" },
      { id: "e4", subjectId: "parent-east", objectId: "child-east-2", predicate: "enshrined_at" },
      { id: "e5", subjectId: "parent-west", objectId: "child-west-1", predicate: "enshrined_at" },
      { id: "e6", subjectId: "parent-west", objectId: "child-west-2", predicate: "enshrined_at" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    const pEast = layout.radialPositions.get("parent-east")!;
    const pWest = layout.radialPositions.get("parent-west")!;
    const cEast1 = layout.radialPositions.get("child-east-1")!;
    const cEast2 = layout.radialPositions.get("child-east-2")!;
    const cWest1 = layout.radialPositions.get("child-west-1")!;
    const cWest2 = layout.radialPositions.get("child-west-2")!;

    // Children of parent-east should on average be significantly closer to parent-east than parent-west
    const avgDistEastToPEast =
      (Math.hypot(cEast1.x - pEast.x, cEast1.y - pEast.y) +
        Math.hypot(cEast2.x - pEast.x, cEast2.y - pEast.y)) /
      2;
    const avgDistEastToPWest =
      (Math.hypot(cEast1.x - pWest.x, cEast1.y - pWest.y) +
        Math.hypot(cEast2.x - pWest.x, cEast2.y - pWest.y)) /
      2;
    expect(avgDistEastToPEast).toBeLessThan(avgDistEastToPWest);

    // Child in the east quadrant should be directly adjacent to parent-east
    const distCEast2ToPEast = Math.hypot(cEast2.x - pEast.x, cEast2.y - pEast.y);
    const distCEast2ToPWest = Math.hypot(cEast2.x - pWest.x, cEast2.y - pWest.y);
    expect(distCEast2ToPEast).toBeLessThan(distCEast2ToPWest);

    // Similarly, west children should on average be closer to parent-west
    const avgDistWestToPWest =
      (Math.hypot(cWest1.x - pWest.x, cWest1.y - pWest.y) +
        Math.hypot(cWest2.x - pWest.x, cWest2.y - pWest.y)) /
      2;
    const avgDistWestToPEast =
      (Math.hypot(cWest1.x - pEast.x, cWest1.y - pEast.y) +
        Math.hypot(cWest2.x - pEast.x, cWest2.y - pEast.y)) /
      2;
    expect(avgDistWestToPWest).toBeLessThan(avgDistWestToPEast);

    const distCWest2ToPWest = Math.hypot(cWest2.x - pWest.x, cWest2.y - pWest.y);
    const distCWest2ToPEast = Math.hypot(cWest2.x - pEast.x, cWest2.y - pEast.y);
    expect(distCWest2ToPWest).toBeLessThan(distCWest2ToPEast);
  });

  it("generates straight lines for radial spokes and center-avoiding quadratic Bezier arcs for transverse chords", () => {
    const nodes = [
      { id: "core", label: "Core" },
      { id: "r1-a", label: "Ring1 A" },
      { id: "r1-b", label: "Ring1 B" },
      { id: "r2-a", label: "Ring2 A" },
    ];
    const edges = [
      { id: "e-radial", subjectId: "core", objectId: "r1-a", predicate: "enshrined_at" },
      { id: "e-transverse", subjectId: "r1-a", objectId: "r1-b", predicate: "interconnected_with" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    const radialSpoke = layout.spokeEdges.find((s) => s.id === "e-radial")!;
    expect(radialSpoke.isRadial).toBe(true);
    expect(radialSpoke.pathD).toMatch(/^M [\d.-]+ [\d.-]+ L [\d.-]+ [\d.-]+$/);

    const transverseSpoke = layout.spokeEdges.find((s) => s.id === "e-transverse")!;
    expect(transverseSpoke.isRadial).toBe(false);
    expect(transverseSpoke.pathD).toMatch(/^M [\d.-]+ [\d.-]+ Q [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+$/);

    // Label on transverse arc should circumvent core (distance from center >= 90px)
    const distLabelFromCenter = Math.hypot(
      transverseSpoke.labelPosition.x - layout.cx,
      transverseSpoke.labelPosition.y - layout.cy,
    );
    expect(distLabelFromCenter).toBeGreaterThanOrEqual(90);
  });

  it("selects candidate root with highest degree centrality when candidateRootIds are provided", () => {
    const nodes = [
      { id: "cand-leaf", label: "Candidate Leaf" },
      { id: "cand-hub", label: "Candidate Hub" },
      { id: "leaf1", label: "Leaf 1" },
      { id: "leaf2", label: "Leaf 2" },
      { id: "leaf3", label: "Leaf 3" },
    ];
    const edges = [
      { id: "e1", subjectId: "cand-leaf", objectId: "leaf1", predicate: "associated_with" },
      { id: "e2", subjectId: "cand-hub", objectId: "leaf1", predicate: "associated_with" },
      { id: "e3", subjectId: "cand-hub", objectId: "leaf2", predicate: "associated_with" },
      { id: "e4", subjectId: "cand-hub", objectId: "leaf3", predicate: "associated_with" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, {
      candidateRootIds: ["cand-leaf", "cand-hub"],
    });

    expect(layout.hubCore?.id).toBe("cand-hub");
    expect(layout.radialPositions.get("cand-hub")?.isCore).toBe(true);
  });

  it("rotates ring slots to achieve co-radial alignment with parent nodes", () => {
    const nodes = [
      { id: "core", label: "Core" },
      { id: "p1", label: "Parent 1" },
      { id: "p2", label: "Parent 2" },
      { id: "c1", label: "Child 1" },
      { id: "c2", label: "Child 2" },
    ];
    const edges = [
      { id: "e-p1", subjectId: "core", objectId: "p1", predicate: "associated_with" },
      { id: "e-p2", subjectId: "core", objectId: "p2", predicate: "associated_with" },
      { id: "e-c1", subjectId: "p1", objectId: "c1", predicate: "associated_with" },
      { id: "e-c2", subjectId: "p2", objectId: "c2", predicate: "associated_with" },
    ];

    const layout = calculateHubSpokeOrbitLayout(nodes, edges, { designatedRootId: "core" });

    const p1Pos = layout.radialPositions.get("p1")!;
    const c1Pos = layout.radialPositions.get("c1")!;
    const angP1 = Math.atan2(p1Pos.y - layout.cy, p1Pos.x - layout.cx);
    const angC1 = Math.atan2(c1Pos.y - layout.cy, c1Pos.x - layout.cx);

    // Child angle should closely follow parent angle (within 15 degrees / 0.26 rad)
    let diff = Math.abs(angP1 - angC1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    expect(diff).toBeLessThan(0.26);
  });
});

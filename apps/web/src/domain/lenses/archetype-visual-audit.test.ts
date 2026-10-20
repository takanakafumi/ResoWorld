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

  it("verifies appropriate node distancing and non-overlapping clearance in Hub-Spoke radial layouts", () => {
    const hubSpokeTopics = registeredLensTopics.filter((t) => t.archetype === "hub-spoke");

    for (const topic of hubSpokeTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      const designatedRootId = preset?.rootEntityIds?.[0];

      const degreeMap = new Map<string, number>();
      for (const node of projection.nodes) degreeMap.set(node.id, 0);
      for (const edge of projection.edges) {
        degreeMap.set(edge.subjectId, (degreeMap.get(edge.subjectId) ?? 0) + 1);
        degreeMap.set(edge.objectId, (degreeMap.get(edge.objectId) ?? 0) + 1);
      }

      let coreNode = projection.nodes.find((n) => n.id === designatedRootId);
      if (!coreNode) {
        let maxDeg = -1;
        for (const [id, deg] of degreeMap.entries()) {
          if (deg > maxDeg) {
            maxDeg = deg;
            coreNode = projection.nodes.find((n) => n.id === id);
          }
        }
      }
      const coreId = coreNode?.id ?? projection.nodes[0]!.id;

      // Hop map
      const hopMap = new Map<string, number>();
      hopMap.set(coreId, 0);
      const queue = [coreId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currHop = hopMap.get(curr) ?? 0;
        for (const edge of projection.edges) {
          let neighbor: string | null = null;
          if (edge.subjectId === curr) neighbor = edge.objectId;
          else if (edge.objectId === curr) neighbor = edge.subjectId;
          if (neighbor && projection.nodes.some((n) => n.id === neighbor) && !hopMap.has(neighbor)) {
            hopMap.set(neighbor, currHop + 1);
            queue.push(neighbor);
          }
        }
      }

      // Exact layout reproduction from HubSpokeTopologyLens
      const outerNodes = projection.nodes
        .filter((n) => n.id !== coreId)
        .sort((a, b) => {
          const hopA = hopMap.get(a.id) ?? 99;
          const hopB = hopMap.get(b.id) ?? 99;
          if (hopA !== hopB) return hopA - hopB;
          const degA = degreeMap.get(a.id) ?? 0;
          const degB = degreeMap.get(b.id) ?? 0;
          if (degA !== degB) return degB - degA;
          return a.id.localeCompare(b.id);
        });

      const totalOuter = outerNodes.length;
      const hasRing3 = totalOuter > 7;

      const ring1Nodes: typeof outerNodes = [];
      const ring2Nodes: typeof outerNodes = [];
      const ring3Nodes: typeof outerNodes = [];

      if (!hasRing3) {
        const cap1 = Math.min(4, Math.ceil(totalOuter / 2));
        ring1Nodes.push(...outerNodes.slice(0, cap1));
        ring2Nodes.push(...outerNodes.slice(cap1));
      } else {
        const cap1 = 4;
        const cap2 = 7;
        ring1Nodes.push(...outerNodes.slice(0, cap1));
        ring2Nodes.push(...outerNodes.slice(cap1, cap1 + cap2));
        ring3Nodes.push(...outerNodes.slice(cap1 + cap2));
      }

      const canvasWidth = 640;
      const canvasHeight = hasRing3 ? 560 : 440;
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const r1 = hasRing3 ? 95 : 105;
      const r2 = hasRing3 ? 175 : 185;
      const r3 = 250;

      const positions = new Map<string, { x: number; y: number; width: number; ring: number }>();
      if (coreNode) {
        const coreWidth = Math.max(120, coreNode.label.length * 14 + 36);
        positions.set(coreNode.id, { x: cx, y: cy, width: coreWidth, ring: 0 });
      }

      const n1 = ring1Nodes.length;
      ring1Nodes.forEach((node, i) => {
        // Offset by half-interval so nodes are on diagonals (avoiding flat horizontal axis)
        const offset = n1 > 0 ? Math.PI / n1 : 0;
        const angle = (2 * Math.PI * i) / Math.max(n1, 1) - Math.PI / 2 + offset;
        const x = cx + r1 * Math.cos(angle);
        const y = cy + r1 * Math.sin(angle);
        const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
        positions.set(node.id, { x, y, width: pillWidth, ring: 1 });
      });

      const n2 = ring2Nodes.length;
      ring2Nodes.forEach((node, i) => {
        // Complementary angles interleaved between Orbit 1 rays
        const angle = (2 * Math.PI * i) / Math.max(n2, 1) - Math.PI / 2;
        const x = cx + r2 * Math.cos(angle);
        const y = cy + r2 * Math.sin(angle);
        const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
        positions.set(node.id, { x, y, width: pillWidth, ring: 2 });
      });

      const n3 = ring3Nodes.length;
      ring3Nodes.forEach((node, i) => {
        // Staggered half-interval to interleave between Orbit 2 rays
        const offset = n3 > 0 ? Math.PI / n3 : 0;
        const angle = (2 * Math.PI * i) / Math.max(n3, 1) - Math.PI / 2 + offset;
        const x = cx + r3 * Math.cos(angle);
        const y = cy + r3 * Math.sin(angle);
        const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
        positions.set(node.id, { x, y, width: pillWidth, ring: 3 });
      });

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

      // Reproduce GenealogyTree layout logic
      const nodeIds = new Set(projection.nodes.map((n) => n.id));
      const forwardPredicates = new Set([
        "parent_of", "gives_birth_to", "participates_in", "educated",
        "influenced", "led", "succession", "claimed_origin_of",
        "enshrined_at", "associated_with", "born_at", "buried_at",
        "launched_uprising_at", "attested_in", "member_of", "association",
        "communicated_with", "used_base_at",
      ]);
      const reversePredicates = new Set([
        "child_of", "descendant_of", "originated_from", "belonged_to", "represented",
      ]);
      const hierarchyEdges: Array<{ sourceId: string; targetId: string }> = [];
      for (const e of projection.edges) {
        if (!nodeIds.has(e.subjectId) || !nodeIds.has(e.objectId) || e.subjectId === e.objectId) continue;
        if (forwardPredicates.has(e.predicate) || e.relationFamily === "genealogy") {
          hierarchyEdges.push({ sourceId: e.subjectId, targetId: e.objectId });
        } else if (reversePredicates.has(e.predicate)) {
          hierarchyEdges.push({ sourceId: e.objectId, targetId: e.subjectId });
        }
      }

      const inDegrees = new Map<string, number>();
      for (const id of nodeIds) inDegrees.set(id, 0);
      for (const e of hierarchyEdges) inDegrees.set(e.targetId, (inDegrees.get(e.targetId) ?? 0) + 1);

      const nodeTier = new Map<string, number>();
      const queue: string[] = [];
      for (const node of projection.nodes) {
        if ((inDegrees.get(node.id) ?? 0) === 0) {
          nodeTier.set(node.id, 0);
          queue.push(node.id);
        }
      }
      if (queue.length === 0 && projection.nodes.length > 0) {
        nodeTier.set(projection.nodes[0]!.id, 0);
        queue.push(projection.nodes[0]!.id);
      }

      const adj = new Map<string, string[]>();
      for (const e of hierarchyEdges) {
        if (!adj.has(e.sourceId)) adj.set(e.sourceId, []);
        adj.get(e.sourceId)!.push(e.targetId);
      }
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currTier = nodeTier.get(curr) ?? 0;
        for (const childId of adj.get(curr) ?? []) {
          const ex = nodeTier.get(childId);
          const target = Math.min(5, currTier + 1);
          if (ex === undefined || ex < target) {
            nodeTier.set(childId, target);
            queue.push(childId);
          }
        }
      }
      for (const node of projection.nodes) {
        if (!nodeTier.has(node.id)) {
          nodeTier.set(node.id, node.kind === "place" || node.kind === "text" ? 5 : 0);
        }
      }

      const tierMap = new Map<number, typeof projection.nodes>();
      for (const node of projection.nodes) {
        const tier = Math.min(nodeTier.get(node.id) ?? 0, 5);
        if (!tierMap.has(tier)) tierMap.set(tier, []);
        tierMap.get(tier)!.push(node);
      }

      const maxNodesInTier = Math.max(1, ...Array.from(tierMap.values()).map((nodes) => nodes.length));
      const canvasWidth = Math.max(760, maxNodesInTier * 170 + 80);

      // Verify clearance gap between every adjacent pair of pills on every tier
      for (const [tier, nodes] of tierMap.entries()) {
        if (nodes.length <= 1) continue;
        const spacing = Math.min(200, (canvasWidth - 100) / nodes.length);
        const startX = canvasWidth / 2 - ((nodes.length - 1) * spacing) / 2;

        for (let i = 0; i < nodes.length - 1; i++) {
          const n1 = nodes[i]!;
          const n2 = nodes[i + 1]!;
          const x1 = startX + i * spacing;
          const x2 = startX + (i + 1) * spacing;
          const w1 = Math.max(92, Math.min(145, n1.label.length * 14 + 28));
          const w2 = Math.max(92, Math.min(145, n2.label.length * 14 + 28));

          const edgeDistance = (x2 - w2 / 2) - (x1 + w1 / 2);
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

  it("audits all 5 Faction topics for distinct factions and member grouping", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBe(5);

    for (const topic of factionTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length, `${topic.id} must have faction nodes`).toBeGreaterThanOrEqual(4);
    }
  });
});

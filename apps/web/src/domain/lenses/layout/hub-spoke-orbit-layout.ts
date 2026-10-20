import type { LayoutPosition } from "./types";

export interface HubSpokeLayoutNodeInput {
  id: string;
  label: string;
  kind?: string;
}

export interface HubSpokeLayoutEdgeInput {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
}

export interface HubSpokeNodePosition extends LayoutPosition {
  isCore: boolean;
  ring: number;
}

export interface HubSpokeSpokeEdge {
  id: string;
  subjectId: string;
  objectId: string;
  from: HubSpokeNodePosition;
  to: HubSpokeNodePosition;
  relation: string;
}

export interface HubSpokeOrbitLayoutResult<T extends HubSpokeLayoutNodeInput = HubSpokeLayoutNodeInput> {
  hubCore?: T;
  radialPositions: Map<string, HubSpokeNodePosition>;
  spokeEdges: HubSpokeSpokeEdge[];
  hasRing3: boolean;
  cx: number;
  cy: number;
  r1: number;
  r2: number;
  r3: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface HubSpokeOrbitLayoutOptions {
  designatedRootId?: string;
  customRelationLabels?: Record<string, string>;
}

export const DEFAULT_HUBSPOKE_RELATION_LABELS: Record<string, string> = {
  enshrined_at: "勧請・鎮座",
  associated_with: "管轄・外郭網",
  located_in: "所属・国内配置",
  patronized: "国家奉斎・保護",
  defended: "外郭防衛・遮断",
  interconnected_with: "連絡・回廊網",
  classified_as: "式内名神・社格",
  originated_from: "本源・分祀元",
};

/**
 * Headless Layout Engine for Hub-and-Spoke Concentric Orbital Topologies.
 * Dynamically selects core/hub node, calculates BFS hop distance, partitions outer nodes
 * into 2 or 3 non-overlapping concentric rings with interleaved angular distributions.
 */
export function calculateHubSpokeOrbitLayout<T extends HubSpokeLayoutNodeInput>(
  nodes: readonly T[],
  edges: readonly HubSpokeLayoutEdgeInput[],
  options: HubSpokeOrbitLayoutOptions = {},
): HubSpokeOrbitLayoutResult<T> {
  const { designatedRootId, customRelationLabels = {} } = options;
  const relationLabels = { ...DEFAULT_HUBSPOKE_RELATION_LABELS, ...customRelationLabels };

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // Degree map for central hub selection
  const degreeMap = new Map<string, number>();
  for (const node of nodes) {
    degreeMap.set(node.id, 0);
  }
  for (const edge of edges) {
    degreeMap.set(edge.subjectId, (degreeMap.get(edge.subjectId) ?? 0) + 1);
    degreeMap.set(edge.objectId, (degreeMap.get(edge.objectId) ?? 0) + 1);
  }

  let coreNode: T | undefined;
  if (designatedRootId) {
    coreNode = nodeById.get(designatedRootId);
  }

  if (!coreNode) {
    let maxDeg = -1;
    for (const [id, deg] of degreeMap.entries()) {
      if (deg > maxDeg) {
        maxDeg = deg;
        coreNode = nodeById.get(id);
      }
    }
  }

  if (!coreNode && nodes.length > 0) {
    coreNode = nodes[0];
  }

  const coreId = coreNode?.id ?? "";

  // Calculate hop distances from core
  const hopMap = new Map<string, number>();
  hopMap.set(coreId, 0);

  const queue = [coreId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentHop = hopMap.get(currentId) ?? 0;

    for (const edge of edges) {
      let neighborId: string | null = null;
      if (edge.subjectId === currentId) neighborId = edge.objectId;
      else if (edge.objectId === currentId) neighborId = edge.subjectId;

      if (neighborId && nodeById.has(neighborId)) {
        if (!hopMap.has(neighborId)) {
          hopMap.set(neighborId, currentHop + 1);
          queue.push(neighborId);
        }
      }
    }
  }

  // Partition outer nodes into dynamic concentric rings
  // Sort outer nodes by topological proximity (hop ASC), connectivity (degree DESC), and stable id
  const outerNodes = nodes
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

  const ring1Nodes: T[] = [];
  const ring2Nodes: T[] = [];
  const ring3Nodes: T[] = [];

  if (!hasRing3) {
    // 2 rings: balanced distribution
    const cap1 = Math.min(4, Math.ceil(totalOuter / 2));
    ring1Nodes.push(...outerNodes.slice(0, cap1));
    ring2Nodes.push(...outerNodes.slice(cap1));
  } else {
    // 3 rings: capacity-based to guarantee non-overlapping clearance
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

  const positions = new Map<string, HubSpokeNodePosition>();

  if (coreNode) {
    const coreWidth = Math.max(120, coreNode.label.length * 14 + 36);
    positions.set(coreNode.id, { x: cx, y: cy, isCore: true, ring: 0, width: coreWidth });
  }

  // Distribute Orbit 1 (offset by half-interval to place nodes on diagonals, away from flat axes)
  const n1 = ring1Nodes.length;
  ring1Nodes.forEach((node, i) => {
    const offset = n1 > 0 ? Math.PI / n1 : 0;
    const angle = (2 * Math.PI * i) / Math.max(n1, 1) - Math.PI / 2 + offset;
    const x = cx + r1 * Math.cos(angle);
    const y = cy + r1 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 1, width: pillWidth });
  });

  // Distribute Orbit 2 (complementary angles interleaved between Orbit 1 rays)
  const n2 = ring2Nodes.length;
  ring2Nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(n2, 1) - Math.PI / 2;
    const x = cx + r2 * Math.cos(angle);
    const y = cy + r2 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 2, width: pillWidth });
  });

  // Distribute Orbit 3 (staggered half-interval to interleave between Orbit 2 rays)
  const n3 = ring3Nodes.length;
  ring3Nodes.forEach((node, i) => {
    const offset = n3 > 0 ? Math.PI / n3 : 0;
    const angle = (2 * Math.PI * i) / Math.max(n3, 1) - Math.PI / 2 + offset;
    const x = cx + r3 * Math.cos(angle);
    const y = cy + r3 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 3, width: pillWidth });
  });

  // Spokes radiating from core or between connected nodes
  const spokeList: HubSpokeSpokeEdge[] = edges
    .map((edge) => {
      const fromPos = positions.get(edge.subjectId);
      const toPos = positions.get(edge.objectId);
      if (!fromPos || !toPos) return null;

      const relLabel = relationLabels[edge.predicate] ?? edge.predicate;
      return {
        id: edge.id,
        subjectId: edge.subjectId,
        objectId: edge.objectId,
        from: fromPos,
        to: toPos,
        relation: relLabel,
      };
    })
    .filter((s): s is HubSpokeSpokeEdge => Boolean(s));

  return {
    hubCore: coreNode,
    radialPositions: positions,
    spokeEdges: spokeList,
    hasRing3,
    cx,
    cy,
    r1,
    r2,
    r3,
    canvasWidth,
    canvasHeight,
  };
}

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
  predicate: string;
  isRadial: boolean;
  pathD: string;
  labelPosition: { x: number; y: number };
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
  candidateRootIds?: readonly string[];
  customRelationLabels?: Record<string, string>;
}

function normalizeAngle(rad: number): number {
  let a = rad % (2 * Math.PI);
  if (a <= -Math.PI) a += 2 * Math.PI;
  if (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

function circularMean(angles: readonly number[]): number {
  if (angles.length === 0) return 0;
  let sumSin = 0;
  let sumCos = 0;
  for (const a of angles) {
    sumSin += Math.sin(a);
    sumCos += Math.cos(a);
  }
  if (Math.abs(sumSin) < 1e-6 && Math.abs(sumCos) < 1e-6) {
    return angles[0] ?? 0;
  }
  return Math.atan2(sumSin, sumCos);
}

function assignRingAngles<T extends { id: string }>(
  ringNodes: readonly T[],
  preferredAngleMap: Map<string, number>,
  baseSlotOffset: number,
): Map<string, number> {
  const n = ringNodes.length;
  const assigned = new Map<string, number>();
  if (n === 0) return assigned;
  if (n === 1) {
    const pref = preferredAngleMap.get(ringNodes[0].id) ?? -Math.PI / 2;
    assigned.set(ringNodes[0].id, pref);
    return assigned;
  }

  const sortedNodes = [...ringNodes].sort((a, b) => {
    const angA = normalizeAngle(preferredAngleMap.get(a.id) ?? 0);
    const angB = normalizeAngle(preferredAngleMap.get(b.id) ?? 0);
    if (Math.abs(angA - angB) > 1e-4) return angA - angB;
    return a.id.localeCompare(b.id);
  });

  let bestShift = 0;
  let bestAlpha = -Math.PI / 2 + baseSlotOffset;
  let minCost = Infinity;

  for (let s = 0; s < n; s++) {
    // Mathematically optimal rotation angle alpha that aligns uniform slots with preferred angles
    let sumSin = 0;
    let sumCos = 0;
    for (let i = 0; i < n; i++) {
      const pref = normalizeAngle(preferredAngleMap.get(sortedNodes[i].id) ?? 0);
      const slotBase = (2 * Math.PI * (i + s)) / n;
      const delta = normalizeAngle(pref - slotBase);
      sumSin += Math.sin(delta);
      sumCos += Math.cos(delta);
    }
    const alpha =
      Math.abs(sumSin) > 1e-5 || Math.abs(sumCos) > 1e-5
        ? Math.atan2(sumSin, sumCos)
        : -Math.PI / 2 + baseSlotOffset;

    let cost = 0;
    for (let i = 0; i < n; i++) {
      const pref = normalizeAngle(preferredAngleMap.get(sortedNodes[i].id) ?? 0);
      const slot = normalizeAngle(alpha + (2 * Math.PI * (i + s)) / n);
      const diff = normalizeAngle(pref - slot);
      cost += diff * diff;
    }
    if (cost < minCost) {
      minCost = cost;
      bestShift = s;
      bestAlpha = alpha;
    }
  }

  for (let i = 0; i < n; i++) {
    const slot = normalizeAngle(bestAlpha + (2 * Math.PI * (i + bestShift)) / n);
    assigned.set(sortedNodes[i].id, slot);
  }

  return assigned;
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
  const { designatedRootId, candidateRootIds, customRelationLabels = {} } = options;
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
  if (candidateRootIds && candidateRootIds.length > 0) {
    let maxCandidateDeg = -1;
    for (const id of candidateRootIds) {
      const node = nodeById.get(id);
      if (node) {
        const deg = degreeMap.get(id) ?? 0;
        if (deg > maxCandidateDeg) {
          maxCandidateDeg = deg;
          coreNode = node;
        }
      }
    }
  } else if (designatedRootId) {
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

  // Respect topological hop tiers when capacity allows
  const hop1Count = outerNodes.filter((n) => (hopMap.get(n.id) ?? 99) === 1).length;
  let cap1: number;
  if (hop1Count >= 2 && hop1Count <= 4 && hop1Count < totalOuter) {
    cap1 = hop1Count;
  } else if (!hasRing3) {
    cap1 = Math.min(4, Math.ceil(totalOuter / 2));
  } else {
    cap1 = 4;
  }

  if (!hasRing3) {
    ring1Nodes.push(...outerNodes.slice(0, cap1));
    ring2Nodes.push(...outerNodes.slice(cap1));
  } else {
    // 3 rings: capacity-based to guarantee non-overlapping clearance
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
  const angleMap = new Map<string, number>();

  if (coreNode) {
    const coreWidth = Math.max(120, coreNode.label.length * 14 + 36);
    positions.set(coreNode.id, { x: cx, y: cy, isCore: true, ring: 0, width: coreWidth });
  }

  // Distribute Orbit 1 (offset by half-interval to place nodes on diagonals, away from flat axes)
  const n1 = ring1Nodes.length;
  ring1Nodes.forEach((node, i) => {
    const offset = n1 > 0 ? Math.PI / n1 : 0;
    const angle = (2 * Math.PI * i) / Math.max(n1, 1) - Math.PI / 2 + offset;
    angleMap.set(node.id, angle);
    const x = cx + r1 * Math.cos(angle);
    const y = cy + r1 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 1, width: pillWidth });
  });

  // Distribute Orbit 2: Barycentric clustering aligned with connected Ring 1 parents
  const ring2PrefMap = new Map<string, number>();
  const n2 = ring2Nodes.length;
  ring2Nodes.forEach((node, i) => {
    const neighborAngles: number[] = [];
    for (const edge of edges) {
      let neighborId: string | null = null;
      if (edge.subjectId === node.id) neighborId = edge.objectId;
      else if (edge.objectId === node.id) neighborId = edge.subjectId;

      if (neighborId && angleMap.has(neighborId)) {
        neighborAngles.push(angleMap.get(neighborId)!);
      }
    }

    if (neighborAngles.length > 0) {
      ring2PrefMap.set(node.id, circularMean(neighborAngles));
    } else {
      // Fallback: distribute evenly according to original topological rank
      ring2PrefMap.set(node.id, (2 * Math.PI * i) / Math.max(n2, 1) - Math.PI / 2);
    }
  });

  const ring2Angles = assignRingAngles(ring2Nodes, ring2PrefMap, 0);
  ring2Nodes.forEach((node) => {
    const angle = ring2Angles.get(node.id) ?? 0;
    angleMap.set(node.id, angle);
    const x = cx + r2 * Math.cos(angle);
    const y = cy + r2 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 2, width: pillWidth });
  });

  // Distribute Orbit 3: Barycentric clustering aligned with connected Ring 2 & Ring 1 neighbors
  const ring3PrefMap = new Map<string, number>();
  const n3 = ring3Nodes.length;
  ring3Nodes.forEach((node, i) => {
    const neighborAngles: number[] = [];
    for (const edge of edges) {
      let neighborId: string | null = null;
      if (edge.subjectId === node.id) neighborId = edge.objectId;
      else if (edge.objectId === node.id) neighborId = edge.subjectId;

      if (neighborId && angleMap.has(neighborId)) {
        neighborAngles.push(angleMap.get(neighborId)!);
      }
    }

    if (neighborAngles.length > 0) {
      ring3PrefMap.set(node.id, circularMean(neighborAngles));
    } else {
      ring3PrefMap.set(node.id, (2 * Math.PI * i) / Math.max(n3, 1) - Math.PI / 2);
    }
  });

  const offset3 = n3 > 0 ? Math.PI / n3 : 0;
  const ring3Angles = assignRingAngles(ring3Nodes, ring3PrefMap, offset3);
  ring3Nodes.forEach((node) => {
    const angle = ring3Angles.get(node.id) ?? 0;
    angleMap.set(node.id, angle);
    const x = cx + r3 * Math.cos(angle);
    const y = cy + r3 * Math.sin(angle);
    const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
    positions.set(node.id, { x, y, isCore: false, ring: 3, width: pillWidth });
  });

  // Spokes: straight lines for radial rays, center-avoiding quadratic Bezier arcs for transverse chords
  const spokeList: HubSpokeSpokeEdge[] = edges
    .map((edge) => {
      const fromPos = positions.get(edge.subjectId);
      const toPos = positions.get(edge.objectId);
      if (!fromPos || !toPos) return null;

      const relLabel = relationLabels[edge.predicate] ?? edge.predicate;

      const isCoreConnected = fromPos.isCore || toPos.isCore;
      const thetaFrom = Math.atan2(fromPos.y - cy, fromPos.x - cx);
      const thetaTo = Math.atan2(toPos.y - cy, toPos.x - cx);
      const angleDiff = Math.abs(normalizeAngle(thetaFrom - thetaTo));

      // Purely radial spoke if connected to core or sharing same radial ray (<= 20 deg)
      const isRadial = isCoreConnected || angleDiff <= 0.35;

      let pathD: string;
      let labelPosition: { x: number; y: number };

      if (isRadial) {
        pathD = `M ${fromPos.x.toFixed(1)} ${fromPos.y.toFixed(1)} L ${toPos.x.toFixed(1)} ${toPos.y.toFixed(1)}`;
        labelPosition = {
          x: (fromPos.x + toPos.x) / 2,
          y: (fromPos.y + toPos.y) / 2,
        };
      } else {
        // Transverse edge: quadratic Bezier arc avoiding core hub
        const mx = (fromPos.x + toPos.x) / 2;
        const my = (fromPos.y + toPos.y) / 2;

        let midAngle: number;
        const sumSin = Math.sin(thetaFrom) + Math.sin(thetaTo);
        const sumCos = Math.cos(thetaFrom) + Math.cos(thetaTo);
        if (Math.abs(sumSin) > 1e-4 || Math.abs(sumCos) > 1e-4) {
          midAngle = Math.atan2(sumSin, sumCos);
        } else {
          midAngle = thetaFrom + Math.PI / 2;
        }

        const rFrom = Math.hypot(fromPos.x - cx, fromPos.y - cy);
        const rTo = Math.hypot(toPos.x - cx, toPos.y - cy);
        const rMax = Math.max(rFrom, rTo);

        let rApex: number;
        if (fromPos.ring === toPos.ring) {
          // Same ring: bow outward along the orbit to avoid crossing interior spokes
          rApex = rMax * (1 + 0.16 * Math.sin(angleDiff / 2)) + 12;
        } else {
          // Inter-ring channel: arch smoothly outward
          rApex = rMax * (1 + 0.12 * Math.sin(angleDiff / 2)) + 8;
        }

        // Apex must never penetrate core clearance zone (>= 90px)
        rApex = Math.max(90, rApex);

        const apexX = cx + rApex * Math.cos(midAngle);
        const apexY = cy + rApex * Math.sin(midAngle);

        // Control point for quadratic Bezier passing through apex at t = 0.5: P_ctrl = 2 * P_apex - M
        const ctrlX = 2 * apexX - mx;
        const ctrlY = 2 * apexY - my;

        pathD = `M ${fromPos.x.toFixed(1)} ${fromPos.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${toPos.x.toFixed(1)} ${toPos.y.toFixed(1)}`;
        labelPosition = {
          x: apexX,
          y: apexY,
        };
      }

      return {
        id: edge.id,
        subjectId: edge.subjectId,
        objectId: edge.objectId,
        from: fromPos,
        to: toPos,
        relation: relLabel,
        predicate: edge.predicate,
        isRadial,
        pathD,
        labelPosition,
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

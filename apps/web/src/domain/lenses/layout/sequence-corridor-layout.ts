import type { LayoutPosition } from "./types";
import { getEntityKindMeta, getNodeVisualTier } from "../entity-presentation";
import { getRelationMeta } from "../relation-presentation";

export interface SequenceWaypointInput {
  id: string;
  label: string;
  kind?: string;
  description?: string;
  question?: string;
  reason?: string;
}

export interface SequenceContextNodeInput {
  id: string;
  label: string;
  kind?: string;
  description?: string;
}

export interface SequenceLayoutEdgeInput {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
  relationFamily?: string;
}

export interface SequenceNodePosition extends LayoutPosition {
  width: number;
  height: number;
  stepIndex?: number;
  isWaypoint: boolean;
  isOrigin: boolean;
  isDestination: boolean;
  tier: 1 | 2 | 3;
}

export interface SequenceStepEdge {
  id: string;
  fromId: string;
  toId: string;
  stepNumber: number;
  pathD: string;
  labelPosition: { x: number; y: number };
  label?: string;
}

export interface SequenceBranchEdge {
  id: string;
  waypointId: string;
  contextNodeId: string;
  pathD: string;
  predicate: string;
}

export interface SequenceCorridorLayoutResult {
  nodePositions: Map<string, SequenceNodePosition>;
  stepEdges: SequenceStepEdge[];
  branchEdges: SequenceBranchEdge[];
  canvasWidth: number;
  canvasHeight: number;
  spineY: number;
}

export interface SequenceCorridorLayoutOptions {
  minCanvasWidth?: number;
  minCanvasHeight?: number;
  stepLabels?: Record<number, string>;
}

/**
 * Headless Layout Engine for Sequential Corridor / Itinerary Archetypes.
 * Calculates directed horizontal milestone progression (Origin -> Waypoints -> Destination),
 * branch context entity positions, and continuous flow vectors.
 */
export function calculateSequenceCorridorLayout(
  waypoints: readonly SequenceWaypointInput[],
  contextNodes: readonly SequenceContextNodeInput[] = [],
  edges: readonly SequenceLayoutEdgeInput[] = [],
  options: SequenceCorridorLayoutOptions = {},
): SequenceCorridorLayoutResult {
  const { minCanvasWidth = 840, minCanvasHeight = 380 } = options;

  const nodePositions = new Map<string, SequenceNodePosition>();
  const numSteps = waypoints.length;

  // Single-row layout vs Two-row serpentine layout
  const isMultiRow = numSteps > 6;
  const numPerRow = isMultiRow ? Math.ceil(numSteps / 2) : Math.max(numSteps, 1);

  const spacingX = Math.max(160, Math.min(220, (minCanvasWidth - 120) / Math.max(numPerRow, 1)));
  const canvasWidth = Math.max(minCanvasWidth, 100 + numPerRow * spacingX);
  const canvasHeight = isMultiRow ? Math.max(minCanvasHeight, 460) : Math.max(minCanvasHeight, 380);

  const startX = (canvasWidth - (numPerRow - 1) * spacingX) / 2;
  const primarySpineY = isMultiRow ? 130 : 190;
  const secondarySpineY = isMultiRow ? 310 : 190;

  // Map to store waypoint index and position for quick reference
  const waypointPosMap = new Map<string, { x: number; y: number; stepIndex: number }>();

  // 1. Position Waypoints along the Progression Spine
  waypoints.forEach((wp, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === numSteps - 1;

    let x: number;
    let y: number;

    if (!isMultiRow) {
      x = startX + idx * spacingX;
      y = primarySpineY;
    } else {
      const row = Math.floor(idx / numPerRow);
      const col = idx % numPerRow;
      // Serpentine flow: row 0 moves L->R, row 1 moves R->L or L->R
      x = startX + col * spacingX;
      y = row === 0 ? primarySpineY : secondarySpineY;
    }

    const tierMeta = getNodeVisualTier({
      isRootOrCore: isFirst || isLast,
      level: isFirst ? 0 : isLast ? 1 : 2,
    });

    const pillWidth = Math.max(115, Math.min(170, wp.label.length * 13 + 42));

    nodePositions.set(wp.id, {
      x,
      y,
      width: pillWidth,
      height: tierMeta.height,
      stepIndex: idx + 1,
      isWaypoint: true,
      isOrigin: isFirst,
      isDestination: isLast,
      tier: tierMeta.tier,
    });

    waypointPosMap.set(wp.id, { x, y, stepIndex: idx + 1 });
  });

  // 2. Position Context Nodes (Figures, Deities, Concepts branching off waypoints)
  const waypointContextCount = new Map<string, number>();

  contextNodes.forEach((cn) => {
    // Find which waypoint this context node connects to
    let connectedWpId = "";
    let connectingPredicate = "associated_with";

    for (const edge of edges) {
      if (edge.subjectId === cn.id && waypointPosMap.has(edge.objectId)) {
        connectedWpId = edge.objectId;
        connectingPredicate = edge.predicate;
        break;
      } else if (edge.objectId === cn.id && waypointPosMap.has(edge.subjectId)) {
        connectedWpId = edge.subjectId;
        connectingPredicate = edge.predicate;
        break;
      }
    }

    if (!connectedWpId && waypoints.length > 0) {
      // Fallback: associate with the first waypoint
      connectedWpId = waypoints[0]!.id;
    }

    const wpPos = waypointPosMap.get(connectedWpId) ?? { x: startX, y: primarySpineY, stepIndex: 1 };
    const count = waypointContextCount.get(connectedWpId) ?? 0;
    waypointContextCount.set(connectedWpId, count + 1);

    // Alternate above and below waypoint
    const isAbove = count % 2 === 0;
    const verticalOffset = isAbove ? -68 : 68;
    const horizontalOffset = count >= 2 ? (count % 4 === 2 ? -28 : 28) : 0;

    const x = wpPos.x + horizontalOffset;
    const y = wpPos.y + verticalOffset;
    const pillWidth = Math.max(105, Math.min(155, cn.label.length * 13 + 34));

    nodePositions.set(cn.id, {
      x,
      y,
      width: pillWidth,
      height: 26,
      isWaypoint: false,
      isOrigin: false,
      isDestination: false,
      tier: 3,
    });
  });

  // 3. Sequential Step Edges (Directed vector flow between successive waypoints)
  const stepEdges: SequenceStepEdge[] = [];

  for (let i = 0; i < numSteps - 1; i++) {
    const fromWp = waypoints[i]!;
    const toWp = waypoints[i + 1]!;
    const p1 = nodePositions.get(fromWp.id)!;
    const p2 = nodePositions.get(toWp.id)!;

    let pathD: string;
    let labelPosition: { x: number; y: number };

    if (Math.abs(p1.y - p2.y) < 20) {
      // Horizontal forward arrow
      const x1 = p1.x + p1.width / 2;
      const x2 = p2.x - p2.width / 2;
      pathD = `M ${x1} ${p1.y} L ${x2} ${p2.y}`;
      labelPosition = { x: (x1 + x2) / 2, y: p1.y - 12 };
    } else {
      // Serpentine turnaround U-curve
      const midY = (p1.y + p2.y) / 2;
      const turnX = Math.max(p1.x, p2.x) + 70;
      pathD = `M ${p1.x + p1.width / 2} ${p1.y} C ${turnX} ${p1.y}, ${turnX} ${p2.y}, ${p2.x + p2.width / 2} ${p2.y}`;
      labelPosition = { x: turnX - 10, y: midY };
    }

    stepEdges.push({
      id: `step-${i + 1}-${fromWp.id}-${toWp.id}`,
      fromId: fromWp.id,
      toId: toWp.id,
      stepNumber: i + 1,
      pathD,
      labelPosition,
      label: `第${i + 1}行程`,
    });
  }

  // 4. Branch Edges (Waypoints to Context Nodes)
  const branchEdges: SequenceBranchEdge[] = [];

  contextNodes.forEach((cn) => {
    const cp = nodePositions.get(cn.id);
    if (!cp) return;

    for (const edge of edges) {
      if (
        (edge.subjectId === cn.id && waypointPosMap.has(edge.objectId)) ||
        (edge.objectId === cn.id && waypointPosMap.has(edge.subjectId))
      ) {
        const wpId = waypointPosMap.has(edge.objectId) ? edge.objectId : edge.subjectId;
        const wpPos = nodePositions.get(wpId);
        if (!wpPos) continue;

        const pathD = `M ${wpPos.x} ${wpPos.y + (cp.y > wpPos.y ? wpPos.height / 2 : -wpPos.height / 2)} L ${cp.x} ${cp.y + (cp.y > wpPos.y ? -cp.height / 2 : cp.height / 2)}`;

        branchEdges.push({
          id: edge.id,
          waypointId: wpId,
          contextNodeId: cn.id,
          pathD,
          predicate: edge.predicate,
        });
      }
    }
  });

  return {
    nodePositions,
    stepEdges,
    branchEdges,
    canvasWidth,
    canvasHeight,
    spineY: primarySpineY,
  };
}

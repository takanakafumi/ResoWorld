import type { LayoutPosition } from "./types";
import { getRelationMeta } from "../relation-presentation";
import { getEntityKindMeta, getNodeVisualTier } from "../entity-presentation";

export interface FactionLayoutNodeInput {
  id: string;
  label: string;
  kind?: string;
  description?: string;
  aliases?: string[];
}

export interface FactionLayoutEdgeInput {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
  relationFamily?: string;
}

export interface FactionZone {
  id: string;
  label: string;
  side: "left" | "right" | "top" | "center";
  color: string;
  anchorNodeId?: string;
  memberNodeIds: string[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FactionNodePosition extends LayoutPosition {
  factionId?: string;
  isAnchor: boolean;
  isBridge: boolean;
  tier: 1 | 2 | 3;
}

export interface FactionConnectorEdge {
  id: string;
  subjectId: string;
  objectId: string;
  from: FactionNodePosition;
  to: FactionNodePosition;
  predicate: string;
  relationFamily?: string;
  isCrossFaction: boolean;
  pathD: string;
  labelPosition: { x: number; y: number };
}

export interface FactionPolarLayoutResult<T extends FactionLayoutNodeInput = FactionLayoutNodeInput> {
  nodePositions: Map<string, FactionNodePosition>;
  factionZones: FactionZone[];
  edges: FactionConnectorEdge[];
  canvasWidth: number;
  canvasHeight: number;
  boundaryAxis?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    icon: string;
  };
}

export interface FactionPolarLayoutOptions {
  designatedFactions?: Array<{
    id: string;
    label: string;
    color?: string;
    anchorId?: string;
    memberIds: string[];
  }>;
  minCanvasWidth?: number;
  minCanvasHeight?: number;
}

const FACTION_COLORS = ["#38bdf8", "#f87171", "#c084fc", "#fbbf24", "#34d399"];

/**
 * Headless Layout Engine for Faction / Polar / Confrontation Networks.
 * Automatically partitions nodes into opposing or allied faction blocs,
 * central negotiation corridors, and computes collision-free coordinates with cross-border edge curves.
 */
export function calculateFactionPolarLayout<T extends FactionLayoutNodeInput>(
  nodes: readonly T[],
  edges: readonly FactionLayoutEdgeInput[],
  options: FactionPolarLayoutOptions = {},
): FactionPolarLayoutResult<T> {
  const { minCanvasWidth = 840, minCanvasHeight = 440 } = options;

  const nodeById = new Map<string, T>(nodes.map((n) => [n.id, n]));
  const nodeIds = new Set(nodes.map((n) => n.id));

  // 1. Determine Faction Clustering
  let factionClusters: Array<{
    id: string;
    label: string;
    color: string;
    anchor?: T;
    members: T[];
  }> = [];

  const assignedNodeIds = new Set<string>();

  if (options.designatedFactions && options.designatedFactions.length > 0) {
    factionClusters = options.designatedFactions.map((df, i) => {
      const anchor = df.anchorId ? nodeById.get(df.anchorId) : undefined;
      if (anchor) assignedNodeIds.add(anchor.id);
      const members: T[] = [];
      for (const id of df.memberIds) {
        const node = nodeById.get(id);
        if (node && (!anchor || node.id !== anchor.id)) {
          members.push(node);
          assignedNodeIds.add(node.id);
        }
      }
      return {
        id: df.id,
        label: df.label,
        color: df.color ?? FACTION_COLORS[i % FACTION_COLORS.length]!,
        anchor,
        members,
      };
    });
  } else {
    // Automatic discovery from polities/groups/key figures
    const polityOrGroupNodes = nodes.filter((n) => n.kind === "polity" || n.kind === "group");
    let anchorCandidates: T[] = polityOrGroupNodes;

    if (anchorCandidates.length === 0) {
      anchorCandidates = nodes.filter((n) => n.kind === "deity" || n.kind === "person").slice(0, 3);
    }
    if (anchorCandidates.length === 0 && nodes.length > 0) {
      anchorCandidates = [nodes[0]!];
    }

    factionClusters = anchorCandidates.slice(0, 3).map((anchor, i) => {
      assignedNodeIds.add(anchor.id);
      const memberIds = new Set<string>();

      for (const edge of edges) {
        if (edge.subjectId === anchor.id && edge.objectId !== anchor.id && nodeIds.has(edge.objectId)) {
          memberIds.add(edge.objectId);
        } else if (edge.objectId === anchor.id && edge.subjectId !== anchor.id && nodeIds.has(edge.subjectId)) {
          memberIds.add(edge.subjectId);
        }
      }

      const members: T[] = [];
      for (const mid of memberIds) {
        const m = nodeById.get(mid);
        if (m && !anchorCandidates.some((a) => a.id === m.id) && !assignedNodeIds.has(m.id)) {
          members.push(m);
          assignedNodeIds.add(m.id);
        }
      }

      const meta = getEntityKindMeta(anchor.kind, anchor);
      return {
        id: anchor.id,
        label: anchor.label,
        color: meta.color ?? FACTION_COLORS[i % FACTION_COLORS.length]!,
        anchor,
        members,
      };
    });
  }

  // Nodes not assigned to a specific faction become bridge/mediator/overarching nodes
  const bridgeNodes = nodes.filter((n) => !assignedNodeIds.has(n.id));

  // 2. Geometry Calculation
  const numFactions = factionClusters.length;
  const canvasWidth = Math.max(minCanvasWidth, 840);

  // Compute required height based on max vertical items
  const maxVerticalItems = Math.max(
    1,
    ...factionClusters.map((f) => (f.anchor ? 1 : 0) + (f.members.length > 5 ? Math.ceil(f.members.length / 2) : f.members.length)),
    bridgeNodes.length,
  );
  const canvasHeight = Math.max(minCanvasHeight, Math.max(480, 140 + maxVerticalItems * 52 + 60));

  const factionZones: FactionZone[] = [];
  const nodePositions = new Map<string, FactionNodePosition>();

  if (numFactions <= 2) {
    // Classic Polar Layout: Left Bloc vs Right Bloc with Center Corridor
    const leftFaction = factionClusters[0];
    const rightFaction = factionClusters[1];

    const zoneWidth = 280;
    const zoneTop = 40;
    const zoneHeight = canvasHeight - 75;

    // Left Zone
    if (leftFaction) {
      const lx = 35;
      factionZones.push({
        id: leftFaction.id,
        label: leftFaction.label,
        side: "left",
        color: leftFaction.color,
        anchorNodeId: leftFaction.anchor?.id,
        memberNodeIds: leftFaction.members.map((m) => m.id),
        bounds: { x: lx, y: zoneTop, width: zoneWidth, height: zoneHeight },
      });

      let currentY = zoneTop + 45;
      if (leftFaction.anchor) {
        const w = Math.max(120, Math.min(170, leftFaction.anchor.label.length * 14 + 40));
        nodePositions.set(leftFaction.anchor.id, {
          x: lx + zoneWidth / 2,
          y: currentY,
          width: w,
          height: 34,
          factionId: leftFaction.id,
          isAnchor: true,
          isBridge: false,
          tier: 1,
        });
        currentY += 56;
      }

      leftFaction.members.forEach((node, idx) => {
        const isTwoCol = leftFaction.members.length > 5;
        const col = isTwoCol ? idx % 2 : 0;
        const row = isTwoCol ? Math.floor(idx / 2) : idx;
        const cx = isTwoCol ? lx + 70 + col * 140 : lx + zoneWidth / 2;
        const cy = isTwoCol ? currentY + row * 48 : currentY + idx * 48;
        const w = isTwoCol ? Math.min(130, node.label.length * 13 + 32) : Math.max(105, Math.min(160, node.label.length * 13 + 36));

        nodePositions.set(node.id, {
          x: cx,
          y: cy,
          width: w,
          height: 28,
          factionId: leftFaction.id,
          isAnchor: false,
          isBridge: false,
          tier: 2,
        });
      });
    }

    // Right Zone
    if (rightFaction) {
      const rx = canvasWidth - zoneWidth - 35;
      factionZones.push({
        id: rightFaction.id,
        label: rightFaction.label,
        side: "right",
        color: rightFaction.color,
        anchorNodeId: rightFaction.anchor?.id,
        memberNodeIds: rightFaction.members.map((m) => m.id),
        bounds: { x: rx, y: zoneTop, width: zoneWidth, height: zoneHeight },
      });

      let currentY = zoneTop + 45;
      if (rightFaction.anchor) {
        const w = Math.max(120, Math.min(170, rightFaction.anchor.label.length * 14 + 40));
        nodePositions.set(rightFaction.anchor.id, {
          x: rx + zoneWidth / 2,
          y: currentY,
          width: w,
          height: 34,
          factionId: rightFaction.id,
          isAnchor: true,
          isBridge: false,
          tier: 1,
        });
        currentY += 56;
      }

      rightFaction.members.forEach((node, idx) => {
        const isTwoCol = rightFaction.members.length > 5;
        const col = isTwoCol ? idx % 2 : 0;
        const row = isTwoCol ? Math.floor(idx / 2) : idx;
        const cx = isTwoCol ? rx + 70 + col * 140 : rx + zoneWidth / 2;
        const cy = isTwoCol ? currentY + row * 48 : currentY + idx * 48;
        const w = isTwoCol ? Math.min(130, node.label.length * 13 + 32) : Math.max(105, Math.min(160, node.label.length * 13 + 36));

        nodePositions.set(node.id, {
          x: cx,
          y: cy,
          width: w,
          height: 28,
          factionId: rightFaction.id,
          isAnchor: false,
          isBridge: false,
          tier: 2,
        });
      });
    }

    // Center Corridor: Bridge / Mediator nodes
    const centerX = canvasWidth / 2;
    const bridgeStartY = zoneTop + 60;
    const bridgeSpacing = Math.min(60, (zoneHeight - 100) / Math.max(bridgeNodes.length, 1));

    bridgeNodes.forEach((node, idx) => {
      const cy = bridgeStartY + idx * bridgeSpacing;
      const w = Math.max(110, Math.min(160, node.label.length * 13 + 38));
      nodePositions.set(node.id, {
        x: centerX,
        y: cy,
        width: w,
        height: 30,
        isAnchor: false,
        isBridge: true,
        tier: 2,
      });
    });
  } else {
    // 3 Factions: Left, Right, and Top Center (e.g. Wei / External Empire)
    const leftFaction = factionClusters[0]!;
    const rightFaction = factionClusters[1]!;
    const topFaction = factionClusters[2]!;

    const zoneWidth = 265;
    const sideZoneTop = 130;
    const sideZoneHeight = canvasHeight - 160;

    // Top Center Zone
    const topZoneWidth = 290;
    const topZoneX = canvasWidth / 2 - topZoneWidth / 2;
    factionZones.push({
      id: topFaction.id,
      label: topFaction.label,
      side: "top",
      color: topFaction.color,
      anchorNodeId: topFaction.anchor?.id,
      memberNodeIds: topFaction.members.map((m) => m.id),
      bounds: { x: topZoneX, y: 35, width: topZoneWidth, height: 80 },
    });

    if (topFaction.anchor) {
      const w = Math.max(115, Math.min(150, topFaction.anchor.label.length * 14 + 38));
      nodePositions.set(topFaction.anchor.id, {
        x: canvasWidth / 2,
        y: 75,
        width: w,
        height: 32,
        factionId: topFaction.id,
        isAnchor: true,
        isBridge: false,
        tier: 1,
      });
    }

    topFaction.members.forEach((node, idx) => {
      const total = topFaction.members.length;
      const spacing = Math.min(140, 260 / Math.max(total, 1));
      const startX = canvasWidth / 2 - ((total - 1) * spacing) / 2;
      const cx = startX + idx * spacing;
      const cy = 115;
      const w = Math.max(100, Math.min(145, node.label.length * 13 + 32));
      nodePositions.set(node.id, {
        x: cx,
        y: cy,
        width: w,
        height: 28,
        factionId: topFaction.id,
        isAnchor: false,
        isBridge: false,
        tier: 2,
      });
    });

    // Left Zone
    const lx = 30;
    factionZones.push({
      id: leftFaction.id,
      label: leftFaction.label,
      side: "left",
      color: leftFaction.color,
      anchorNodeId: leftFaction.anchor?.id,
      memberNodeIds: leftFaction.members.map((m) => m.id),
      bounds: { x: lx, y: sideZoneTop, width: zoneWidth, height: sideZoneHeight },
    });

    let currentLY = sideZoneTop + 45;
    if (leftFaction.anchor) {
      const w = Math.max(120, Math.min(165, leftFaction.anchor.label.length * 14 + 38));
      nodePositions.set(leftFaction.anchor.id, {
        x: lx + zoneWidth / 2,
        y: currentLY,
        width: w,
        height: 34,
        factionId: leftFaction.id,
        isAnchor: true,
        isBridge: false,
        tier: 1,
      });
      currentLY += 52;
    }
    leftFaction.members.forEach((node, idx) => {
      const cy = currentLY + idx * 46;
      const w = Math.max(105, Math.min(155, node.label.length * 13 + 36));
      nodePositions.set(node.id, {
        x: lx + zoneWidth / 2,
        y: cy,
        width: w,
        height: 28,
        factionId: leftFaction.id,
        isAnchor: false,
        isBridge: false,
        tier: 2,
      });
    });

    // Right Zone
    const rx = canvasWidth - zoneWidth - 30;
    factionZones.push({
      id: rightFaction.id,
      label: rightFaction.label,
      side: "right",
      color: rightFaction.color,
      anchorNodeId: rightFaction.anchor?.id,
      memberNodeIds: rightFaction.members.map((m) => m.id),
      bounds: { x: rx, y: sideZoneTop, width: zoneWidth, height: sideZoneHeight },
    });

    let currentRY = sideZoneTop + 45;
    if (rightFaction.anchor) {
      const w = Math.max(120, Math.min(165, rightFaction.anchor.label.length * 14 + 38));
      nodePositions.set(rightFaction.anchor.id, {
        x: rx + zoneWidth / 2,
        y: currentRY,
        width: w,
        height: 34,
        factionId: rightFaction.id,
        isAnchor: true,
        isBridge: false,
        tier: 1,
      });
      currentRY += 52;
    }
    rightFaction.members.forEach((node, idx) => {
      const cy = currentRY + idx * 46;
      const w = Math.max(105, Math.min(155, node.label.length * 13 + 36));
      nodePositions.set(node.id, {
        x: rx + zoneWidth / 2,
        y: cy,
        width: w,
        height: 28,
        factionId: rightFaction.id,
        isAnchor: false,
        isBridge: false,
        tier: 2,
      });
    });

    // Center Corridor: Bridge / Mediator nodes
    const centerX = canvasWidth / 2;
    const bridgeStartY = sideZoneTop + 50;
    bridgeNodes.forEach((node, idx) => {
      const cy = bridgeStartY + idx * 52;
      const w = Math.max(110, Math.min(155, node.label.length * 13 + 36));
      nodePositions.set(node.id, {
        x: centerX,
        y: cy,
        width: w,
        height: 28,
        isAnchor: false,
        isBridge: true,
        tier: 2,
      });
    });
  }

  // Invariant guarantee: Every single input node must have a position
  let unplacedIdx = 0;
  for (const node of nodes) {
    if (!nodePositions.has(node.id)) {
      const w = Math.max(105, Math.min(150, node.label.length * 13 + 34));
      nodePositions.set(node.id, {
        x: canvasWidth / 2,
        y: 200 + unplacedIdx * 50,
        width: w,
        height: 28,
        isAnchor: false,
        isBridge: true,
        tier: 2,
      });
      unplacedIdx++;
    }
  }

  // 3. Edges Geometry & Semantic Classification
  const factionEdgeList: FactionConnectorEdge[] = [];
  let hasConfrontation = false;
  let hasAlliance = false;

  for (const edge of edges) {
    const fromPos = nodePositions.get(edge.subjectId);
    const toPos = nodePositions.get(edge.objectId);
    if (!fromPos || !toPos) continue;

    const relMeta = getRelationMeta(edge.predicate, edge.relationFamily);
    if (relMeta.family === "conflict") hasConfrontation = true;
    if (relMeta.family === "alliance") hasAlliance = true;

    const isCrossFaction =
      Boolean(fromPos.factionId && toPos.factionId && fromPos.factionId !== toPos.factionId) ||
      fromPos.isBridge ||
      toPos.isBridge;

    let pathD: string;
    let labelPosition: { x: number; y: number };

    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    if (Math.abs(fromPos.x - toPos.x) < 40) {
      // Intra-zone or vertical edge: bow slightly to the side to avoid passing through nodes
      const bow = (fromPos.x < canvasWidth / 2 ? -24 : 24);
      pathD = `M ${fromPos.x} ${fromPos.y} Q ${fromPos.x + bow} ${midY} ${toPos.x} ${toPos.y}`;
      labelPosition = { x: fromPos.x + bow * 0.7, y: midY };
    } else {
      // Cross-zone edge: smooth S-curve or cubic bezier
      const ctrlDist = Math.abs(toPos.x - fromPos.x) * 0.45;
      const c1x = fromPos.x < toPos.x ? fromPos.x + ctrlDist : fromPos.x - ctrlDist;
      const c2x = fromPos.x < toPos.x ? toPos.x - ctrlDist : toPos.x + ctrlDist;

      pathD = `M ${fromPos.x} ${fromPos.y} C ${c1x} ${fromPos.y}, ${c2x} ${toPos.y}, ${toPos.x} ${toPos.y}`;
      labelPosition = { x: midX, y: midY };
    }

    factionEdgeList.push({
      id: edge.id,
      subjectId: edge.subjectId,
      objectId: edge.objectId,
      from: fromPos,
      to: toPos,
      predicate: edge.predicate,
      relationFamily: edge.relationFamily,
      isCrossFaction,
      pathD,
      labelPosition,
    });
  }

  // 4. Central Demarcation Axis
  const boundaryAxis = {
    x1: canvasWidth / 2,
    y1: 50,
    x2: canvasWidth / 2,
    y2: canvasHeight - 50,
    label: hasConfrontation
      ? "対立・交渉境界"
      : hasAlliance
        ? "同盟・連携交渉軸"
        : "勢力相関・外交軸",
    icon: hasConfrontation ? "⚔️" : hasAlliance ? "🤝" : "⚖️",
  };

  return {
    nodePositions,
    factionZones,
    edges: factionEdgeList,
    canvasWidth,
    canvasHeight,
    boundaryAxis,
  };
}

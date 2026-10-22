import type { LayoutPosition } from "./types";
import { getEntityKindMeta, getNodeVisualTier } from "../entity-presentation";
import { getRelationMeta } from "../relation-presentation";

export interface MatrixColumnDefinition {
  id: string;
  title: string;
  subtitle?: string;
  color?: string;
  anchorNodeId?: string;
  memberNodeIds: string[];
}

export interface MatrixNodeInput {
  id: string;
  label: string;
  kind?: string;
  description?: string;
  aliases?: string[];
}

export interface MatrixEdgeInput {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
  relationFamily?: string;
}

export interface MatrixNodePosition extends LayoutPosition {
  width: number;
  height: number;
  tier: 1 | 2 | 3;
  columnId: string;
  dimensionRow: "anchor" | "deity" | "place" | "concept" | "other";
}

export interface MatrixColumnZone {
  id: string;
  title: string;
  subtitle?: string;
  color: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  anchorNodeId?: string;
  memberCount: number;
}

export interface MatrixLayoutEdge {
  id: string;
  fromId: string;
  toId: string;
  pathD: string;
  predicate: string;
  relationFamily?: string;
  isCrossColumn: boolean;
  color: string;
  dash?: string;
}

export interface MatrixComparisonLayoutResult {
  nodePositions: Map<string, MatrixNodePosition>;
  columnZones: MatrixColumnZone[];
  edges: MatrixLayoutEdge[];
  canvasWidth: number;
  canvasHeight: number;
}

export interface MatrixLayoutOptions {
  minCanvasWidth?: number;
  minCanvasHeight?: number;
  columnWidth?: number;
}

const DEFAULT_COLUMN_COLORS = ["#38bdf8", "#34d399", "#f59e0b", "#ec4899", "#a855f7"];

/**
 * Headless Layout Engine for Comparative Parallel Hypothesis / Matrix Archetypes.
 * Mathematically arranges parallel comparative tracks, categorizes members into
 * semantic dimension rows (Anchor -> Deities -> Sanctuaries -> Archaeological Concepts),
 * and computes curved inter-column comparative vectors.
 */
export function calculateMatrixComparisonLayout(
  nodes: readonly MatrixNodeInput[],
  edges: readonly MatrixEdgeInput[],
  columns: readonly MatrixColumnDefinition[],
  options: MatrixLayoutOptions = {},
): MatrixComparisonLayoutResult {
  const { minCanvasWidth = 860, minCanvasHeight = 440, columnWidth = 230 } = options;

  const nodePositions = new Map<string, MatrixNodePosition>();
  const nodeById = new Map<string, MatrixNodeInput>(nodes.map((n) => [n.id, n]));

  // If no columns provided, dynamically derive columns from groups/polities or clusters
  const effectiveColumns: MatrixColumnDefinition[] =
    columns.length >= 2
      ? [...columns]
      : deriveDefaultColumns(nodes, edges);

  const numColumns = Math.max(1, effectiveColumns.length);
  const columnGap = 24;
  const paddingX = 40;
  const headerHeight = 52;
  const rowGap = 14;

  const totalTracksWidth = numColumns * columnWidth + (numColumns - 1) * columnGap;
  const canvasWidth = Math.max(minCanvasWidth, totalTracksWidth + paddingX * 2);
  const startX = (canvasWidth - totalTracksWidth) / 2;

  const columnZones: MatrixColumnZone[] = [];
  const assignedNodeIds = new Set<string>();

  // Determine positions column by column
  let maxColumnHeight = minCanvasHeight;

  effectiveColumns.forEach((col, colIdx) => {
    const colX = startX + colIdx * (columnWidth + columnGap);
    const colColor = col.color || DEFAULT_COLUMN_COLORS[colIdx % DEFAULT_COLUMN_COLORS.length]!;

    let currentY = 50 + headerHeight;

    // Collect and partition member nodes
    const colNodeIds = new Set(col.memberNodeIds);
    if (col.anchorNodeId) {
      colNodeIds.add(col.anchorNodeId);
    }

    const colNodes: MatrixNodeInput[] = [];
    for (const id of colNodeIds) {
      const n = nodeById.get(id);
      if (n) {
        colNodes.push(n);
        assignedNodeIds.add(n.id);
      }
    }

    // Categorize nodes by dimension row
    const anchorNode = col.anchorNodeId ? nodeById.get(col.anchorNodeId) : undefined;
    const deities: MatrixNodeInput[] = [];
    const places: MatrixNodeInput[] = [];
    const concepts: MatrixNodeInput[] = [];
    const others: MatrixNodeInput[] = [];

    colNodes.forEach((n) => {
      if (anchorNode && n.id === anchorNode.id) return;
      if (n.kind === "deity") deities.push(n);
      else if (n.kind === "place") places.push(n);
      else if (n.kind === "concept" || n.kind === "event" || n.kind === "tradition") concepts.push(n);
      else others.push(n);
    });

    // 1. Anchor Node (Tier 1)
    if (anchorNode) {
      const tier = getNodeVisualTier({ isRootOrCore: true, level: 0 });
      const width = Math.min(columnWidth - 28, Math.max(130, anchorNode.label.length * 13 + 36));
      nodePositions.set(anchorNode.id, {
        x: colX + columnWidth / 2,
        y: currentY + tier.height / 2,
        width,
        height: tier.height,
        tier: 1,
        columnId: col.id,
        dimensionRow: "anchor",
      });
      currentY += tier.height + rowGap + 8;
    }

    // 2. Deities Dimension
    deities.forEach((d) => {
      const tier = getNodeVisualTier({ isRootOrCore: false, level: 1 });
      const width = Math.min(columnWidth - 28, Math.max(120, d.label.length * 13 + 34));
      nodePositions.set(d.id, {
        x: colX + columnWidth / 2,
        y: currentY + tier.height / 2,
        width,
        height: tier.height,
        tier: 2,
        columnId: col.id,
        dimensionRow: "deity",
      });
      currentY += tier.height + rowGap;
    });

    // 3. Places Dimension
    places.forEach((p) => {
      const tier = getNodeVisualTier({ isRootOrCore: false, level: 2 });
      const width = Math.min(columnWidth - 28, Math.max(120, p.label.length * 13 + 34));
      nodePositions.set(p.id, {
        x: colX + columnWidth / 2,
        y: currentY + tier.height / 2,
        width,
        height: tier.height,
        tier: 2,
        columnId: col.id,
        dimensionRow: "place",
      });
      currentY += tier.height + rowGap;
    });

    // 4. Concepts & Others Dimension
    [...concepts, ...others].forEach((c) => {
      const tier = getNodeVisualTier({ isRootOrCore: false, level: 3 });
      const width = Math.min(columnWidth - 28, Math.max(110, c.label.length * 13 + 32));
      nodePositions.set(c.id, {
        x: colX + columnWidth / 2,
        y: currentY + tier.height / 2,
        width,
        height: tier.height,
        tier: 3,
        columnId: col.id,
        dimensionRow: concepts.includes(c) ? "concept" : "other",
      });
      currentY += tier.height + rowGap;
    });

    const colHeight = Math.max(currentY + 20 - 50, 220);
    if (50 + colHeight + 30 > maxColumnHeight) {
      maxColumnHeight = 50 + colHeight + 30;
    }

    columnZones.push({
      id: col.id,
      title: col.title,
      subtitle: col.subtitle,
      color: colColor,
      bounds: {
        x: colX,
        y: 50,
        width: columnWidth,
        height: colHeight,
      },
      anchorNodeId: col.anchorNodeId,
      memberCount: colNodes.length,
    });
  });

  // Handle any unassigned nodes by placing them in an invariant cross-column baseline
  const unassignedNodes = nodes.filter((n) => !assignedNodeIds.has(n.id));
  if (unassignedNodes.length > 0) {
    const unassignedSpacing = Math.min(180, (canvasWidth - 80) / unassignedNodes.length);
    const unassignedStartX = (canvasWidth - (unassignedNodes.length - 1) * unassignedSpacing) / 2;
    const unassignedY = maxColumnHeight + 30;

    unassignedNodes.forEach((un, idx) => {
      const tier = getNodeVisualTier({ isRootOrCore: false, level: 3 });
      const width = Math.max(110, Math.min(160, un.label.length * 13 + 32));
      nodePositions.set(un.id, {
        x: unassignedStartX + idx * unassignedSpacing,
        y: unassignedY,
        width,
        height: tier.height,
        tier: 3,
        columnId: "common",
        dimensionRow: "other",
      });
    });

    maxColumnHeight = unassignedY + 50;
  }

  // Ensure all column zone heights match maxColumnHeight for beautiful symmetry
  const uniformZoneHeight = maxColumnHeight - 70;
  columnZones.forEach((zone) => {
    zone.bounds.height = uniformZoneHeight;
  });

  const canvasHeight = Math.max(minCanvasHeight, maxColumnHeight + 20);

  // Layout Edges (Intra-column vs Inter-column Cross Comparison)
  const layoutEdges: MatrixLayoutEdge[] = [];

  edges.forEach((edge) => {
    const p1 = nodePositions.get(edge.subjectId);
    const p2 = nodePositions.get(edge.objectId);
    if (!p1 || !p2) return;

    const isCrossColumn = p1.columnId !== p2.columnId;
    const relMeta = getRelationMeta(edge.predicate, edge.relationFamily);

    let pathD: string;
    if (!isCrossColumn) {
      // Intra-column vertical connecting curve
      const x = p1.x;
      const y1 = p1.y < p2.y ? p1.y + p1.height / 2 : p1.y - p1.height / 2;
      const y2 = p1.y < p2.y ? p2.y - p2.height / 2 : p2.y + p2.height / 2;
      pathD = `M ${x} ${y1} L ${x} ${y2}`;
    } else {
      // Inter-column cross-comparison smooth cubic Bezier
      const fromLeft = p1.x < p2.x;
      const x1 = fromLeft ? p1.x + p1.width / 2 : p1.x - p1.width / 2;
      const x2 = fromLeft ? p2.x - p2.width / 2 : p2.x + p2.width / 2;
      const dx = Math.abs(x2 - x1) * 0.45;
      const cx1 = fromLeft ? x1 + dx : x1 - dx;
      const cx2 = fromLeft ? x2 - dx : x2 + dx;
      pathD = `M ${x1} ${p1.y} C ${cx1} ${p1.y}, ${cx2} ${p2.y}, ${x2} ${p2.y}`;
    }

    layoutEdges.push({
      id: edge.id,
      fromId: edge.subjectId,
      toId: edge.objectId,
      pathD,
      predicate: edge.predicate,
      relationFamily: edge.relationFamily,
      isCrossColumn,
      color: isCrossColumn ? relMeta.color : "rgba(255, 255, 255, 0.4)",
      dash: undefined,
    });
  });

  return {
    nodePositions,
    columnZones,
    edges: layoutEdges,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Fallback column derivation when explicit column definitions are absent
 */
function deriveDefaultColumns(
  nodes: readonly MatrixNodeInput[],
  edges: readonly MatrixEdgeInput[],
): MatrixColumnDefinition[] {
  // Find group or polity nodes as column anchors
  const groupNodes = nodes.filter((n) => n.kind === "group" || n.kind === "polity");
  if (groupNodes.length >= 2) {
    return groupNodes.map((gn, i) => {
      // Find connected nodes
      const memberIds = edges
        .filter((e) => e.subjectId === gn.id || e.objectId === gn.id)
        .map((e) => (e.subjectId === gn.id ? e.objectId : e.subjectId));

      return {
        id: gn.id,
        title: gn.label,
        subtitle: gn.description,
        color: DEFAULT_COLUMN_COLORS[i % DEFAULT_COLUMN_COLORS.length],
        anchorNodeId: gn.id,
        memberNodeIds: Array.from(new Set(memberIds)),
      };
    });
  }

  // Split nodes in half as Left vs Right tracks
  const mid = Math.ceil(nodes.length / 2);
  const leftNodes = nodes.slice(0, mid);
  const rightNodes = nodes.slice(mid);

  return [
    {
      id: "track-left",
      title: "第1系列",
      color: DEFAULT_COLUMN_COLORS[0],
      anchorNodeId: leftNodes[0]?.id,
      memberNodeIds: leftNodes.map((n) => n.id),
    },
    {
      id: "track-right",
      title: "第2系列",
      color: DEFAULT_COLUMN_COLORS[1],
      anchorNodeId: rightNodes[0]?.id,
      memberNodeIds: rightNodes.map((n) => n.id),
    },
  ];
}

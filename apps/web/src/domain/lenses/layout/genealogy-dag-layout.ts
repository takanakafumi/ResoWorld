import type { LayoutPosition } from "./types";

export interface GenealogyLayoutNodeInput {
  id: string;
  label: string;
  kind?: string;
}

export interface GenealogyLayoutEdgeInput {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
  relationFamily?: string;
}

export interface GenealogyNodePosition extends LayoutPosition {
  level: number;
}

export interface GenealogyConnectorEdge {
  id: string;
  parentId: string;
  childId: string;
  from: GenealogyNodePosition;
  to: GenealogyNodePosition;
  label: string;
}

export interface GenealogyDagLayoutResult<T extends GenealogyLayoutNodeInput = GenealogyLayoutNodeInput> {
  nodePositions: Map<string, GenealogyNodePosition>;
  treeConnectorEdges: GenealogyConnectorEdge[];
  canvasWidth: number;
  canvasHeight: number;
  numTiers: number;
}

export interface GenealogyDagLayoutOptions {
  customPredicateLabels?: Record<string, string>;
  maxTier?: number;
  tierHeight?: number;
  baseY?: number;
  minCanvasWidth?: number;
  minCanvasHeight?: number;
}

export const DEFAULT_GENEALOGY_PREDICATE_LABELS: Record<string, string> = {
  parent_of: "親 ➔ 子",
  gives_birth_to: "生成・誕生",
  child_of: "子 ➔ 親",
  descendant_of: "後裔・末裔",
  educated: "師匠 ➔ 門下生",
  influenced: "思想的影響",
  led: "主宰・指導",
  enshrined_at: "祭祀・鎮座",
  associated_with: "ゆかり・関連",
  born_at: "生誕地",
  buried_at: "墓所・奥津城",
  attested_in: "史料記載",
  participates_in: "誓約・契機",
  launched_uprising_at: "挙兵地",
  claimed_origin_of: "神統・皇統主張",
  succession: "継承",
  originated_from: "本源",
};

const FORWARD_PREDICATES = new Set([
  "parent_of",
  "gives_birth_to",
  "participates_in",
  "educated",
  "influenced",
  "led",
  "succession",
  "claimed_origin_of",
  "enshrined_at",
  "associated_with",
  "born_at",
  "buried_at",
  "launched_uprising_at",
  "attested_in",
  "member_of",
  "association",
  "communicated_with",
  "used_base_at",
]);

const REVERSE_PREDICATES = new Set([
  "child_of",
  "descendant_of",
  "originated_from",
  "belonged_to",
  "represented",
]);

/**
 * Headless Layout Engine for Generational Directed Acyclic Graphs (DAG).
 * Calculates stratified topological tiers, non-colliding pill coordinates, and bezier connector geometry.
 */
export function calculateGenealogyDagLayout<T extends GenealogyLayoutNodeInput>(
  nodes: readonly T[],
  edges: readonly GenealogyLayoutEdgeInput[],
  options: GenealogyDagLayoutOptions = {},
): GenealogyDagLayoutResult<T> {
  const {
    customPredicateLabels = {},
    maxTier = 5,
    tierHeight = 95,
    baseY = 60,
    minCanvasWidth = 760,
    minCanvasHeight = 420,
  } = options;

  const predicateLabels = { ...DEFAULT_GENEALOGY_PREDICATE_LABELS, ...customPredicateLabels };

  // 1. Collect all directed hierarchy edges (Parent/Origin -> Child/Target)
  const hierarchyEdges: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    predicate: string;
    label: string;
  }> = [];

  for (const edge of edges) {
    if (FORWARD_PREDICATES.has(edge.predicate) || edge.relationFamily === "genealogy") {
      hierarchyEdges.push({
        id: edge.id,
        sourceId: edge.subjectId,
        targetId: edge.objectId,
        predicate: edge.predicate,
        label: predicateLabels[edge.predicate] ?? edge.predicate,
      });
    } else if (REVERSE_PREDICATES.has(edge.predicate)) {
      hierarchyEdges.push({
        id: edge.id,
        sourceId: edge.objectId,
        targetId: edge.subjectId,
        predicate: edge.predicate,
        label: predicateLabels[edge.predicate] ?? edge.predicate,
      });
    }
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = hierarchyEdges.filter(
    (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId) && e.sourceId !== e.targetId,
  );

  const inDegrees = new Map<string, number>();
  for (const id of nodeIds) {
    inDegrees.set(id, 0);
  }
  for (const edge of validEdges) {
    inDegrees.set(edge.targetId, (inDegrees.get(edge.targetId) ?? 0) + 1);
  }

  const nodeTier = new Map<string, number>();
  const queue: string[] = [];

  // True roots have in-degree 0 in the hierarchy
  for (const node of nodes) {
    if ((inDegrees.get(node.id) ?? 0) === 0) {
      nodeTier.set(node.id, 0);
      queue.push(node.id);
    }
  }

  // Fallback if graph is cyclic or all have in-degree > 0
  if (queue.length === 0 && nodes.length > 0) {
    const fallbackId = nodes[0]!.id;
    nodeTier.set(fallbackId, 0);
    queue.push(fallbackId);
  }

  // Adjacency list for downward DAG traversal
  const adj = new Map<string, string[]>();
  for (const edge of validEdges) {
    if (!adj.has(edge.sourceId)) adj.set(edge.sourceId, []);
    adj.get(edge.sourceId)!.push(edge.targetId);
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentTier = nodeTier.get(currentId) ?? 0;

    const children = adj.get(currentId) ?? [];
    for (const childId of children) {
      const existingTier = nodeTier.get(childId);
      // Use longest path so child is below all ancestors, up to maxTier
      const targetTier = Math.min(maxTier, currentTier + 1);
      if (existingTier === undefined || existingTier < targetTier) {
        nodeTier.set(childId, targetTier);
        queue.push(childId);
      }
    }
  }

  // Ensure all nodes are assigned
  const maxAssignedTier = Math.max(0, ...Array.from(nodeTier.values()));
  for (const node of nodes) {
    if (!nodeTier.has(node.id)) {
      if (node.kind === "place" || node.kind === "text") {
        nodeTier.set(node.id, maxAssignedTier);
      } else {
        nodeTier.set(node.id, 0);
      }
    }
  }

  // Group nodes by tier level
  const tierMap = new Map<number, T[]>();
  for (const node of nodes) {
    const tier = Math.min(nodeTier.get(node.id) ?? 0, maxTier);
    if (!tierMap.has(tier)) tierMap.set(tier, []);
    tierMap.get(tier)!.push(node);
  }

  // Compute canvas dimensions
  const numTiers = Math.max(4, ...Array.from(tierMap.keys()).map((k) => k + 1));
  const maxNodesInAnyTier = Math.max(
    1,
    ...Array.from(tierMap.values()).map((tierNodes) => tierNodes.length),
  );
  const canvasWidth = Math.max(minCanvasWidth, maxNodesInAnyTier * 170 + 80);
  const canvasHeight = Math.max(minCanvasHeight, baseY + (numTiers - 1) * tierHeight + 60);

  const positions = new Map<string, GenealogyNodePosition>();

  for (const [level, tierNodes] of tierMap.entries()) {
    const y = baseY + level * tierHeight;
    const n = tierNodes.length;
    // Generous spacing so pills NEVER collide
    const spacing = Math.min(200, (canvasWidth - 100) / Math.max(n, 1));
    const startX = canvasWidth / 2 - ((n - 1) * spacing) / 2;

    tierNodes.forEach((node, idx) => {
      const x = startX + idx * spacing;
      const pillWidth = Math.max(92, Math.min(145, node.label.length * 14 + 28));
      positions.set(node.id, { x, y, width: pillWidth, level });
    });
  }

  // Branch connectors
  const connectors: GenealogyConnectorEdge[] = validEdges
    .map((edge) => {
      const parentPos = positions.get(edge.sourceId);
      const childPos = positions.get(edge.targetId);
      if (!parentPos || !childPos) return null;

      return {
        id: edge.id,
        parentId: edge.sourceId,
        childId: edge.targetId,
        from: parentPos,
        to: childPos,
        label: edge.label,
      };
    })
    .filter((c): c is GenealogyConnectorEdge => Boolean(c));

  return {
    nodePositions: positions,
    treeConnectorEdges: connectors,
    canvasWidth,
    canvasHeight,
    numTiers,
  };
}

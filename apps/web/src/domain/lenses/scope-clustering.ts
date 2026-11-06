import type { LensKnowledgePack } from "../lens-packs/schema";
import type { TopicScopeCluster } from "../lens-packs/knowledge-registry";

export type Point2D = { x: number; y: number };

/**
 * スコープクラスタに属するノードID集合を O(1) ルックアップ用に解決する純粋関数。
 * 1. cluster.nodeIds が明示されていればそれを最優先
 * 2. 未指定時は、cluster.connectionIds に合致するプリセット内コネクションから関連エンティティIDを自動抽出 (Zero-Config)
 */
export function resolveScopeClusterNodeIds(
  pack: LensKnowledgePack,
  presetId: string,
  cluster: TopicScopeCluster | null | undefined,
): Set<string> | null {
  if (!cluster) return null; // 全体表示（スコープ制限なし）

  if (cluster.nodeIds && cluster.nodeIds.length > 0) {
    return new Set(cluster.nodeIds);
  }

  const preset = pack.presets.find((p) => p.id === presetId);
  if (!preset || !preset.mapConnections) return null;

  const allowedConnIds = new Set(cluster.connectionIds);
  const collectedNodeIds = new Set<string>();

  for (const conn of preset.mapConnections) {
    if (allowedConnIds.has(conn.id)) {
      if (conn.anchorEntityId) collectedNodeIds.add(conn.anchorEntityId);
      conn.contextEntityIds?.forEach((id) => collectedNodeIds.add(id));
      conn.placeEntityIds?.forEach((id) => collectedNodeIds.add(id));
      if (conn.pointFocusEntityIds) {
        Object.values(conn.pointFocusEntityIds).forEach((id) => collectedNodeIds.add(id));
      }
    }
  }

  return collectedNodeIds.size > 0 ? collectedNodeIds : null;
}

export type ScopeClusterFraming = {
  centerX: number;
  centerY: number;
  targetZoom: number;
};

/**
 * スコープ内ノード群の幾何学的重心を計算する純粋関数。
 * 各ノードのレイアウト座標 (x, y) の単純平均を $O(N)$ で算出する。
 */
export function calculateScopeClusterCenter(
  nodePositions: Map<string, Point2D>,
  scopedNodeIds: Set<string> | null,
): Point2D | null {
  if (!scopedNodeIds || scopedNodeIds.size === 0) return null;

  let totalX = 0;
  let totalY = 0;
  let count = 0;

  for (const [id, pos] of nodePositions.entries()) {
    if (scopedNodeIds.has(id)) {
      totalX += pos.x;
      totalY += pos.y;
      count += 1;
    }
  }

  if (count === 0) return null;
  return {
    x: totalX / count,
    y: totalY / count,
  };
}

/**
 * スコープ内ノード群の包含矩形（バウンズ）から、最適なセンタリング座標とダイナミックズーム倍率を算出する。
 * 中核クラスタ（狭い範囲）は大きくズームインし、広域クラスタ（広い範囲）は全体を見渡すズームアウトを行う。
 */
export function calculateScopeClusterFraming(
  nodePositions: Map<string, { x: number; y: number; width?: number }>,
  scopedNodeIds: Set<string> | null,
  viewBox: { width: number; height: number } = { width: 640, height: 400 },
): ScopeClusterFraming | null {
  if (!scopedNodeIds || scopedNodeIds.size === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let count = 0;

  for (const [id, pos] of nodePositions.entries()) {
    if (scopedNodeIds.has(id)) {
      const halfW = (pos.width ?? 100) / 2;
      const halfH = 20; // 標準的なノードの半高
      minX = Math.min(minX, pos.x - halfW);
      maxX = Math.max(maxX, pos.x + halfW);
      minY = Math.min(minY, pos.y - halfH);
      maxY = Math.max(maxY, pos.y + halfH);
      count += 1;
    }
  }

  if (count === 0 || !isFinite(minX)) return null;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const clusterWidth = Math.max(maxX - minX, 80);
  const clusterHeight = Math.max(maxY - minY, 60);

  // キャンバスの約75%を占めるようにズーム率を計算（適切な視覚余白を確保）
  const zoomX = (viewBox.width * 0.75) / clusterWidth;
  const zoomY = (viewBox.height * 0.75) / clusterHeight;
  const rawZoom = Math.min(zoomX, zoomY);

  // 寄りすぎ（拡大過剰）や小さすぎを防ぐ安全クランプ（1.0〜1.65倍）
  const targetZoom = Number(Math.min(1.65, Math.max(1.0, rawZoom)).toFixed(2));

  return {
    centerX,
    centerY,
    targetZoom,
  };
}

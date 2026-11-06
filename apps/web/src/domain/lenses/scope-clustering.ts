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

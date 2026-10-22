import { normalizeLensEntityName } from "./entity-identity";
import {
  lensLayoutArchetypeLabels,
  registeredLensTopics,
  type LensLayoutArchetype,
  type LensPerspectiveId,
} from "./knowledge-registry";
import { projectLensPreset } from "./projection";

export const perspectiveLabels: Record<LensPerspectiveId, string> = {
  mythology: "神・系譜",
  religion: "宗教",
  route: "ルート",
  politics: "政治・社会",
  people: "人物",
};

export type GroundAnchorTopicPortal = {
  topicId: string;
  topicLabel: string;
  lensId: LensPerspectiveId;
  lensLabel: string;
  archetype: LensLayoutArchetype;
  archetypeLabel: string;
  packId: string;
  packLabel: string;
  isCore?: boolean;
};

/**
 * 事前実体化された基底実体（Ground Anchor）➔ トピック逆引き静的インデックス
 * ADR-0021 / ADR-0022 に基づき、起動時（モジュールロード時）に一度だけ構築される。
 * ランタイムは O(1) の Map.get のみを行う。
 */
const groundAnchorTopicIndex = new Map<string, GroundAnchorTopicPortal[]>();

function registerIndexEntry(key: string, portal: GroundAnchorTopicPortal) {
  const normalized = normalizeLensEntityName(key);
  if (!normalized) return;
  const existing = groundAnchorTopicIndex.get(normalized) ?? [];
  if (!existing.some((p) => p.topicId === portal.topicId)) {
    existing.push(portal);
    groundAnchorTopicIndex.set(normalized, existing);
  }
}

// 静的実体化の初期化実行
for (const topic of registeredLensTopics) {
  try {
    const projection = projectLensPreset(topic.pack, topic.presetId);
    const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
    const rootEntityIds = new Set(preset?.rootEntityIds ?? []);
    const coreRootId = preset?.rootEntityIds?.[0];

    for (const node of projection.nodes) {
      const isCore = node.id === coreRootId || rootEntityIds.has(node.id);
      const portal: GroundAnchorTopicPortal = {
        topicId: topic.id,
        topicLabel: topic.label,
        lensId: topic.perspectiveId,
        lensLabel: perspectiveLabels[topic.perspectiveId] ?? topic.perspectiveId,
        archetype: topic.archetype,
        archetypeLabel: topic.archetypeLabel ?? lensLayoutArchetypeLabels[topic.archetype] ?? topic.archetype,
        packId: topic.pack.id,
        packLabel: topic.pack.label,
        isCore,
      };

      // 1. ノードIDでの登録
      registerIndexEntry(node.id, portal);
      // 2. ラベル（正式名称）での登録
      registerIndexEntry(node.label, portal);
      // 3. 別名（aliases）での登録
      for (const alias of node.aliases ?? []) {
        registerIndexEntry(alias, portal);
      }
    }
  } catch {
    // 万一プロジェクションに失敗した場合も安全にスキップ
  }
}

export type CrossTopicPortalTarget =
  | string
  | {
      id?: string;
      name?: string;
      label?: string;
      aliases?: string[];
    };

/**
 * 指定された実体（Spot / Candidate / Node）に関係する他のトピック一覧を O(1) で解決する。
 * ADR-0022 に基づき、現在のトピック（currentTopicId）は除外して返す。
 */
export function resolveCrossTopicPortals(
  target: CrossTopicPortalTarget | undefined | null,
  options?: {
    currentTopicId?: string;
  },
): GroundAnchorTopicPortal[] {
  if (!target) return [];

  const candidateKeys: string[] = [];
  if (typeof target === "string") {
    candidateKeys.push(target);
  } else {
    if (target.id) candidateKeys.push(target.id);
    if (target.name) candidateKeys.push(target.name);
    if (target.label) candidateKeys.push(target.label);
    if (target.aliases) candidateKeys.push(...target.aliases);
  }

  const resultMap = new Map<string, GroundAnchorTopicPortal>();

  for (const key of candidateKeys) {
    const normalized = normalizeLensEntityName(key);
    if (!normalized) continue;
    const portals = groundAnchorTopicIndex.get(normalized) ?? [];
    for (const portal of portals) {
      if (options?.currentTopicId && portal.topicId === options.currentTopicId) {
        continue;
      }
      if (!resultMap.has(portal.topicId)) {
        resultMap.set(portal.topicId, portal);
      }
    }
  }

  return [...resultMap.values()];
}

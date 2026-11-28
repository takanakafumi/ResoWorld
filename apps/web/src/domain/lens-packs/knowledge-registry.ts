import { KNOWLEDGE_PACK_CATEGORY_LABELS } from "@/domain/knowledge/source-evaluation";
import { archipelagoNetworkPackTopicMappings } from "./registry/archipelago-network-mappings";
import { mythologyPackTopicMappings } from "./registry/mythology-mappings";
import { peoplePackTopicMappings } from "./registry/people-mappings";
import { religionPackTopicMappings } from "./registry/religion-mappings";
import { routePoliticsPackTopicMappings } from "./registry/route-politics-mappings";
import {
  lensLayoutArchetypeLabels,
  topicFocusLabels,
  type KnowledgePackTopicMapping,
  type LensPerspectiveId,
  type RegisteredLensKnowledgePack,
  type RegisteredLensTopic,
} from "./registry/types";
import type { LensKnowledgePack } from "./schema";

export {
  lensLayoutArchetypeLabels,
  topicFocusLabels,
  type KnowledgePackTopicMapping,
  type LensLayoutArchetype,
  type LensPerspectiveId,
  type LensTopicRenderer,
  type RegisteredLensKnowledgePack,
  type RegisteredLensTopic,
  type TopicBoundaryAxis,
  type TopicDesignatedFaction,
  type TopicFeature,
  type TopicFocus,
  type TopicScopeCluster,
  type TopicSpatialScale,
} from "./registry/types";

/**
 * 知識構造の正本（SSOT）から切り出される全 TOPIC と LENS の統合レジストリ。
 * 実体定義は ./registry/ 配下の LENS 領域別モジュールに分割管理される。
 */
export const canonicalKnowledgePackTopicMappings: readonly KnowledgePackTopicMapping[] = [
  ...mythologyPackTopicMappings,
  ...religionPackTopicMappings,
  ...routePoliticsPackTopicMappings,
  ...peoplePackTopicMappings,
  ...archipelagoNetworkPackTopicMappings,
];

/**
 * 登録済みLENSトピック一覧（正本マッピングから自動導出）
 */
export const registeredLensTopics: readonly RegisteredLensTopic[] = canonicalKnowledgePackTopicMappings.flatMap(
  (mapping) =>
    mapping.topics.map((t) => {
      const preset = mapping.pack.presets.find((p) => p.id === t.presetId);
      const packCategory = mapping.pack.packCategory ?? mapping.packCategory;
      const archetype = t.archetype ?? (t.isStratum ? "stratum" : "sequence");
      return {
        id: t.id,
        perspectiveId: t.perspectiveId,
        label: t.label ?? preset?.label ?? t.id,
        description: t.description ?? preset?.description ?? "",
        pack: mapping.pack,
        packCategory,
        packCategoryLabel: KNOWLEDGE_PACK_CATEGORY_LABELS[packCategory],
        presetId: t.presetId,
        focus: t.focus,
        focusLabel: topicFocusLabels[t.focus],
        archetype,
        archetypeLabel: lensLayoutArchetypeLabels[archetype],
        renderer: t.renderer,
        features: t.features ?? ["structural"],
        isStratum: t.isStratum ?? false,
        spatialScale: t.spatialScale,
        scopeClusters: t.scopeClusters,
        designatedFactions: t.designatedFactions,
        boundaryAxis: t.boundaryAxis,
      };
    }),
);

/**
 * 登録済みLENSナレッジパック一覧（ADR-0029: registeredLensTopics から単一正本自動導出）
 */
export const registeredLensKnowledgePacks: readonly RegisteredLensKnowledgePack[] = Array.from(
  registeredLensTopics.reduce((acc, topic) => {
    const key = `${topic.pack.id}::${topic.perspectiveId}`;
    const existing = acc.get(key);
    if (existing) {
      if (!existing.presetIds.includes(topic.presetId)) {
        existing.presetIds.push(topic.presetId);
      }
    } else {
      acc.set(key, {
        pack: topic.pack,
        lensId: topic.perspectiveId,
        presetIds: [topic.presetId],
      });
    }
    return acc;
  }, new Map<string, { pack: LensKnowledgePack; lensId: LensPerspectiveId; presetIds: string[] }>()).values(),
);

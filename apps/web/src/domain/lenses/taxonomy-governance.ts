import {
  canonicalKnowledgePackTopicMappings,
  registeredLensKnowledgePacks,
  registeredLensTopics,
  topicFocusLabels,
  type KnowledgePackTopicMapping,
  type RegisteredLensTopic,
  type TopicFocus,
} from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { registeredKnowledgeMapConnections } from "@/domain/map/registry";

export const TOPIC_DENSITY_GOVERNANCE_THRESHOLDS = {
  /** mapConnections >= 4 always requires scopeClusters (>= 2) */
  minConnectionsAlwaysRequiringClusters: 4,
  /** mapConnections >= 3 combined with nodes >= 18 requires scopeClusters (>= 2) */
  minConnectionsWithHighNodes: 3,
  minNodesWithMultipleConnections: 18,
  /** Minimum cluster count when scopeClusters is required */
  minRequiredClusterCount: 2,
} as const;

export type InternalSubPresetReason =
  | "timeline-sub-preset"
  | "seed-subsumed-by-comparison-topic";

/**
 * ADR-0029 (#48): Registered packs may hold documented internal sub-presets used for
 * chronology/unit projection tests or subsumed by a canonical comparison topic.
 * Any NEW unregistered preset not documented here will be flagged as a CI violation.
 */
export const DOCUMENTED_INTERNAL_SUB_PRESETS: Readonly<Record<string, InternalSubPresetReason>> = {
  "japanese-mythology::imperial-mainline": "seed-subsumed-by-comparison-topic",
  "wajinden-routes::wajinden-source-route": "seed-subsumed-by-comparison-topic",
  "wajinden-routes::yamatai-hypotheses": "seed-subsumed-by-comparison-topic",
  "miyajima-misen-sacred-landscape::miyajima-shrine-history": "timeline-sub-preset",
  "munakata-okinoshima-sacred-landscape::munakata-okinoshima-history": "timeline-sub-preset",
};

export type HighDensityViolation = {
  topicId: string;
  perspectiveId: string;
  archetype: string;
  nodeCount: number;
  connectionCount: number;
  clusterCount: number;
};

export type RegistryDriftViolation = {
  source: "registeredLensKnowledgePacks" | "registeredKnowledgeMapConnections";
  identifier: string;
  lensId: string;
  presetId: string;
};

export type UnregisteredPresetViolation = {
  packId: string;
  presetId: string;
  presetLabel: string;
};

export type LensTopicGovernanceReport = {
  missingExplicitSpatialScaleTopicIds: string[];
  unusedTopicFocusKeys: TopicFocus[];
  registryDriftViolations: RegistryDriftViolation[];
  highDensityViolations: HighDensityViolation[];
  unregisteredPresetViolations: UnregisteredPresetViolation[];
  invalidScopeClusterRefs: Array<{
    topicId: string;
    clusterId: string;
    missingConnectionId: string;
  }>;
};

export type LensTopicGovernanceAuditInput = {
  mappings: readonly KnowledgePackTopicMapping[];
  topics: readonly RegisteredLensTopic[];
  focusKeys: readonly TopicFocus[];
  legacyPackRegistrations: typeof registeredLensKnowledgePacks;
  mapConnections: typeof registeredKnowledgeMapConnections;
};

/**
 * Pure declarative governance auditor implementing ADR-0029 criteria:
 *  1. Explicit `spatialScale` declaration (no string-matching heuristics)
 *  2. Zero unused `TopicFocus` keys
 *  3. Registry SSOT parity across `registeredLensTopics`, `registeredLensKnowledgePacks`, and map registrations
 *  4. High-density topic `scopeClusters` requirement
 *  5. Scope cluster `connectionIds` integrity
 *  6. Unregistered pack preset detection
 */
export function auditLensTopicGovernance(
  input: LensTopicGovernanceAuditInput = {
    mappings: canonicalKnowledgePackTopicMappings,
    topics: registeredLensTopics,
    focusKeys: Object.keys(topicFocusLabels) as TopicFocus[],
    legacyPackRegistrations: registeredLensKnowledgePacks,
    mapConnections: registeredKnowledgeMapConnections,
  },
): LensTopicGovernanceReport {
  const missingExplicitSpatialScaleTopicIds: string[] = [];
  for (const mapping of input.mappings) {
    for (const topic of mapping.topics) {
      if (!topic.spatialScale) {
        missingExplicitSpatialScaleTopicIds.push(topic.id);
      }
    }
  }

  const usedFocusSet = new Set(input.topics.map((t) => t.focus));
  const unusedTopicFocusKeys = input.focusKeys.filter((k) => !usedFocusSet.has(k));

  const canonicalLensPresetSet = new Set(
    input.topics.map((t) => `${t.perspectiveId}::${t.presetId}`),
  );
  const canonicalPackLensPresetSet = new Set(
    input.topics.map((t) => `${t.pack.id}::${t.perspectiveId}::${t.presetId}`),
  );

  const registryDriftViolations: RegistryDriftViolation[] = [];
  for (const reg of input.legacyPackRegistrations) {
    const presetIds =
      "presetIds" in reg && reg.presetIds
        ? reg.presetIds
        : reg.pack.presets.map((p) => p.id);
    for (const presetId of presetIds) {
      const key = `${reg.pack.id}::${reg.lensId}::${presetId}`;
      if (!canonicalPackLensPresetSet.has(key)) {
        registryDriftViolations.push({
          source: "registeredLensKnowledgePacks",
          identifier: reg.pack.id,
          lensId: reg.lensId,
          presetId,
        });
      }
    }
  }

  const seenMapDrift = new Set<string>();
  for (const conn of input.mapConnections) {
    for (const ref of conn.lensRefs) {
      const key = `${ref.lensId}::${ref.presetId}`;
      if (!canonicalLensPresetSet.has(key)) {
        const dedupeKey = `${conn.id}::${key}`;
        if (!seenMapDrift.has(dedupeKey)) {
          seenMapDrift.add(dedupeKey);
          registryDriftViolations.push({
            source: "registeredKnowledgeMapConnections",
            identifier: conn.id,
            lensId: ref.lensId,
            presetId: ref.presetId,
          });
        }
      }
    }
  }

  const highDensityViolations: HighDensityViolation[] = [];
  const invalidScopeClusterRefs: LensTopicGovernanceReport["invalidScopeClusterRefs"] = [];

  for (const topic of input.topics) {
    const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
    const connectionIds = new Set((preset?.mapConnections ?? []).map((c) => c.id));

    for (const cluster of topic.scopeClusters ?? []) {
      for (const cid of cluster.connectionIds) {
        if (!connectionIds.has(cid)) {
          invalidScopeClusterRefs.push({
            topicId: topic.id,
            clusterId: cluster.id,
            missingConnectionId: cid,
          });
        }
      }
    }

    if (topic.isStratum) continue;

    const projection = projectLensPreset(topic.pack, topic.presetId);
    const connectionCount = preset?.mapConnections.length ?? 0;
    const nodeCount = projection.nodes.length;
    const clusterCount = topic.scopeClusters?.length ?? 0;

    const requiresClusters =
      connectionCount >= TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minConnectionsAlwaysRequiringClusters ||
      (connectionCount >= TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minConnectionsWithHighNodes &&
        nodeCount >= TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minNodesWithMultipleConnections);

    if (requiresClusters && clusterCount < TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minRequiredClusterCount) {
      highDensityViolations.push({
        topicId: topic.id,
        perspectiveId: topic.perspectiveId,
        archetype: topic.archetype,
        nodeCount,
        connectionCount,
        clusterCount,
      });
    }
  }

  const registeredPackPresets = new Set(
    input.topics.map((t) => `${t.pack.id}::${t.presetId}`),
  );
  const seenPacks = new Map<string, RegisteredLensTopic["pack"]>();
  for (const mapping of input.mappings) {
    seenPacks.set(mapping.pack.id, mapping.pack);
  }

  const unregisteredPresetViolations: UnregisteredPresetViolation[] = [];
  for (const [packId, pack] of seenPacks) {
    for (const preset of pack.presets) {
      const key = `${packId}::${preset.id}`;
      if (!registeredPackPresets.has(key) && !(key in DOCUMENTED_INTERNAL_SUB_PRESETS)) {
        unregisteredPresetViolations.push({
          packId,
          presetId: preset.id,
          presetLabel: preset.label,
        });
      }
    }
  }

  return {
    missingExplicitSpatialScaleTopicIds,
    unusedTopicFocusKeys,
    registryDriftViolations,
    highDensityViolations,
    unregisteredPresetViolations,
    invalidScopeClusterRefs,
  };
}

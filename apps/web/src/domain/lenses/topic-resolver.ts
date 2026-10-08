import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { registeredLensKnowledgePacks, registeredLensTopics, type LensPerspectiveId, type LensTopicRenderer, type RegisteredLensTopic, type TopicFeature, type TopicFocus } from "@/domain/lens-packs/knowledge-registry";
import { resolveApplicableLensPresets } from "@/domain/lens-packs/preset-selection";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

export type ResolvedLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  presetId: string;
  focus: TopicFocus;
  focusLabel: string;
  renderer: LensTopicRenderer;
  features: readonly TopicFeature[];
  packId: string;
  pack: RegisteredLensTopic["pack"];
  claimIds: string[];
  spotIds: string[];
  directlyConnectedToSelection: boolean;
  score: number;
};

export function hasRegisteredLensMaterial({
  lensId,
  claims,
  spots,
}: {
  lensId: string;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
}) {
  return registeredLensKnowledgePacks
    .filter((registration) => registration.lensId === lensId)
    .some((registration) => {
      const allowed = "presetIds" in registration ? new Set<string>(registration.presetIds) : null;
      return resolveApplicableLensPresets(registration.pack, claims, spots).some(({ presetId }) => !allowed || allowed.has(presetId));
    });
}

export function selectLensTopic(
  topics: ResolvedLensTopic[],
  manualTopicId: string,
) {
  return topics.find((topic) => topic.id === manualTopicId) ?? topics[0];
}

export function resolveStratumTopics(): readonly RegisteredLensTopic[] {
  return registeredLensTopics.filter((definition) => Boolean(definition.isStratum));
}

export function resolveLensTopics({
  perspectiveId,
  claims,
  spots,
  selectedSpotId,
  includeUnvisited = false,
}: {
  perspectiveId: LensPerspectiveId;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
  includeUnvisited?: boolean;
}): ResolvedLensTopic[] {
  return registeredLensTopics
    .filter((definition) => definition.perspectiveId === perspectiveId && !definition.isStratum)
    .flatMap((definition, index) => {
      const projection = projectLensPreset(definition.pack, definition.presetId);
      const preset = definition.pack.presets.find((candidate) => candidate.id === definition.presetId);
      if (!preset) return [];
      const rootEntityIds = new Set(preset.rootEntityIds);
      const entryNodes = projection.nodes.filter((node) => rootEntityIds.has(node.id));
      const links = buildLensExplorationLinksByIdentity(claims, spots, entryNodes, { entryOnly: true });
      const claimIds = [...new Set([...links.values()].flatMap((link) => link.claimIds))];
      const spotIds = [...new Set([...links.values()].flatMap((link) => link.spotIds))];
      if (!includeUnvisited && claimIds.length === 0 && spotIds.length === 0) return [];
      const directlyConnectedToSelection = Boolean(selectedSpotId && spotIds.includes(selectedSpotId));
      const hasActivity = claimIds.length > 0 || spotIds.length > 0;
      return [{
        id: definition.id,
        perspectiveId: definition.perspectiveId,
        label: definition.label,
        description: definition.description,
        packId: definition.pack.id,
        pack: definition.pack,
        presetId: definition.presetId,
        focus: definition.focus,
        focusLabel: definition.focusLabel,
        renderer: definition.renderer,
        features: definition.features,
        claimIds,
        spotIds,
        directlyConnectedToSelection,
        score: (directlyConnectedToSelection ? 1_000 : 0) + (hasActivity ? 100 : 0) + spotIds.length * 20 + claimIds.length,
        originalIndex: index,
      }];
    })
    .sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex);
}

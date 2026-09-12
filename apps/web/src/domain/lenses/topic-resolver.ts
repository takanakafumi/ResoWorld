import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { registeredLensKnowledgePacks, registeredLensTopics, type LensPerspectiveId, type LensTopicRenderer } from "@/domain/lens-packs/knowledge-registry";
import { resolveApplicableLensPresets } from "@/domain/lens-packs/preset-selection";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

export type ResolvedLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  presetId: string;
  renderer: LensTopicRenderer;
  packId: string;
  claimIds: string[];
  spotIds: string[];
  directlyConnectedToSelection: boolean;
  score: number;
};

export type ManualLensTopicSelection = {
  spotId: string;
  topicId: string;
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

export function selectLensTopicForSpot(
  topics: ResolvedLensTopic[],
  manualSelection: ManualLensTopicSelection,
  selectedSpotId: string,
) {
  if (manualSelection.spotId !== selectedSpotId) return topics[0];
  return topics.find((topic) => topic.id === manualSelection.topicId) ?? topics[0];
}

export function resolveLensTopics({
  perspectiveId,
  claims,
  spots,
  selectedSpotId,
}: {
  perspectiveId: LensPerspectiveId;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
}): ResolvedLensTopic[] {
  return registeredLensTopics
    .filter((definition) => definition.perspectiveId === perspectiveId)
    .flatMap((definition) => {
      const projection = projectLensPreset(definition.pack, definition.presetId);
      const preset = definition.pack.presets.find((candidate) => candidate.id === definition.presetId);
      if (!preset) return [];
      const rootEntityIds = new Set(preset.rootEntityIds);
      const entryNodes = projection.nodes.filter((node) => rootEntityIds.has(node.id));
      const links = buildLensExplorationLinksByIdentity(claims, spots, entryNodes, { entryOnly: true });
      const claimIds = [...new Set([...links.values()].flatMap((link) => link.claimIds))];
      const spotIds = [...new Set([...links.values()].flatMap((link) => link.spotIds))];
      if (claimIds.length === 0 && spotIds.length === 0) return [];
      const directlyConnectedToSelection = Boolean(selectedSpotId && spotIds.includes(selectedSpotId));
      return [{
        id: definition.id,
        perspectiveId: definition.perspectiveId,
        label: definition.label,
        description: definition.description,
        packId: definition.pack.id,
        presetId: definition.presetId,
        renderer: definition.renderer,
        claimIds,
        spotIds,
        directlyConnectedToSelection,
        score: (directlyConnectedToSelection ? 1_000 : 0) + spotIds.length * 20 + claimIds.length,
      }];
    })
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label, "ja"));
}

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { registeredLensTopics, type LensPerspectiveId, type LensTopicRenderer } from "@/domain/lens-packs/knowledge-registry";
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
      const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);
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

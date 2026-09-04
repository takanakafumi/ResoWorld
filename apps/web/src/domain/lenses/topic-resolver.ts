import { hagiBakumatsuPack } from "@/domain/lens-packs/bakumatsu-pack";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

export type LensTopicRenderer = "wajinden-politics" | "bakumatsu-structure";

type LensTopicDefinition = {
  id: string;
  perspectiveId: "politics";
  label: string;
  description: string;
  pack: LensKnowledgePack;
  presetId: string;
  renderer: LensTopicRenderer;
};

export type ResolvedLensTopic = Omit<LensTopicDefinition, "pack"> & {
  packId: string;
  claimIds: string[];
  spotIds: string[];
  directlyConnectedToSelection: boolean;
  score: number;
};

const topicDefinitions: readonly LensTopicDefinition[] = [
  {
    id: "yamatai-politics",
    perspectiveId: "politics",
    label: "邪馬台国の政治構造",
    description: "卑弥呼、倭の諸国、魏との外交、一大率、狗奴国との関係",
    pack: wajindenRoutesPack,
    presetId: "wajinden-politics",
    renderer: "wajinden-politics",
  },
  {
    id: "hagi-domain-politics",
    perspectiveId: "politics",
    label: "長州藩の政治と近代化",
    description: "人材形成、海防、西洋技術、産業化の試行",
    pack: hagiBakumatsuPack,
    presetId: "bakumatsu-structure",
    renderer: "bakumatsu-structure",
  },
];

export function resolveLensTopics({
  perspectiveId,
  claims,
  spots,
  selectedSpotId,
}: {
  perspectiveId: "politics";
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId?: string;
}): ResolvedLensTopic[] {
  return topicDefinitions
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

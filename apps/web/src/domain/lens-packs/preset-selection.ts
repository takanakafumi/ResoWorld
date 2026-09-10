import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { lensEntityNamesMatch } from "./entity-identity";
import { projectLensPreset } from "./projection";
import type { LensKnowledgePack } from "./schema";

export type SpotLensPresetSelection = {
  presetId: string;
  entityId: string;
};

export type ApplicableLensPreset = {
  presetId: string;
  claimIds: string[];
  spotIds: string[];
};

export function resolveApplicableLensPresets(
  pack: LensKnowledgePack,
  claims: ReviewDataset["claims"],
  spots: ReviewAtlasSpot[],
): ApplicableLensPreset[] {
  return pack.presets.flatMap((preset) => {
    const projection = projectLensPreset(pack, preset.id);
    const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);
    const claimIds = [...new Set([...links.values()].flatMap((link) => link.claimIds))];
    const spotIds = [...new Set([...links.values()].flatMap((link) => link.spotIds))];
    return claimIds.length > 0 || spotIds.length > 0
      ? [{ presetId: preset.id, claimIds, spotIds }]
      : [];
  });
}

export function resolveLensEntityForSpot(
  pack: LensKnowledgePack,
  presetId: string,
  spot: ReviewAtlasSpot | undefined,
) {
  if (!spot) return undefined;
  const projection = projectLensPreset(pack, presetId);
  return projection.nodes.find((entity) =>
    [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(spot.name, name)),
  );
}

export function resolveLensPresetForSpot(
  pack: LensKnowledgePack,
  spot: ReviewAtlasSpot | undefined,
): SpotLensPresetSelection | undefined {
  if (!spot) return undefined;
  const matchedEntityIds = new Set(pack.entities.filter((entity) =>
    [entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(spot.name, name)),
  ).map((entity) => entity.id));

  if (matchedEntityIds.size === 0) return undefined;
  for (const preset of pack.presets) {
    const projection = projectLensPreset(pack, preset.id);
    const entity = projection.nodes.find((node) => matchedEntityIds.has(node.id));
    if (entity) return { presetId: preset.id, entityId: entity.id };
  }
  return undefined;
}

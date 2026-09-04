import type { ReviewAtlasSpot } from "@/domain/review/types";

import { lensEntityNamesMatch } from "./entity-identity";
import { projectLensPreset } from "./projection";
import type { LensKnowledgePack } from "./schema";

export type SpotLensPresetSelection = {
  presetId: string;
  entityId: string;
};

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


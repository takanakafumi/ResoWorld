import type { LensKnowledgePack } from "./schema";

export type LensProjection = {
  packId: string;
  packVersion: string;
  presetId: string;
  title: string;
  description: string;
  status: LensKnowledgePack["status"];
  nodes: LensKnowledgePack["entities"];
  edges: LensKnowledgePack["assertions"];
};

export function projectLensPreset(
  pack: LensKnowledgePack,
  presetId: string,
): LensProjection {
  const preset = pack.presets.find((candidate) => candidate.id === presetId);
  if (!preset) throw new Error(`Unknown lens preset: ${presetId}`);

  const candidateEdges = pack.assertions.filter((assertion) => {
    if (!preset.relationFamilies.includes(assertion.relationFamily)) return false;
    if (
      preset.viewpointIds.length > 0 &&
      !assertion.viewpointIds.some((id) => preset.viewpointIds.includes(id))
    ) {
      return false;
    }

    return assertion.reviewStatus !== "rejected";
  });

  const visibleIds = new Set(preset.rootEntityIds);
  let frontier = new Set(preset.rootEntityIds);
  for (let depth = 0; depth < preset.expansionDepth; depth += 1) {
    const next = new Set<string>();
    for (const edge of candidateEdges) {
      if (frontier.has(edge.subjectId) || frontier.has(edge.objectId)) {
        if (!visibleIds.has(edge.subjectId)) next.add(edge.subjectId);
        if (!visibleIds.has(edge.objectId)) next.add(edge.objectId);
        visibleIds.add(edge.subjectId);
        visibleIds.add(edge.objectId);
      }
    }
    if (next.size === 0) break;
    frontier = next;
  }

  const edges = candidateEdges.filter(
    (edge) => visibleIds.has(edge.subjectId) && visibleIds.has(edge.objectId),
  );

  return {
    packId: pack.id,
    packVersion: pack.version,
    presetId: preset.id,
    title: preset.label,
    description: preset.description,
    status: pack.status,
    nodes: pack.entities.filter((entity) => visibleIds.has(entity.id)),
    edges,
  };
}


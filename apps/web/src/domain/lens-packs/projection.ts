import type { LensKnowledgePack } from "./schema";

export type LensProjection = {
  packId: string;
  packVersion: string;
  presetId: string;
  title: string;
  description: string;
  status: LensKnowledgePack["status"];
  lensType: LensKnowledgePack["presets"][number]["lensType"];
  nodes: LensKnowledgePack["entities"];
  edges: LensKnowledgePack["assertions"];
};

export type LensReference = {
  lensId: string;
  topicId?: string;
  topicLabel?: string;
  packId?: string;
  presetId?: string;
};

export type LensMapConnectionProjection = {
  id: string;
  packId: string;
  packVersion: string;
  presetId: string;
  title: string;
  description: string;
  displayMode: "line" | "points";
  origin: "knowledge-pack";
  anchor?: LensKnowledgePack["entities"][number];
  contextEntities: LensKnowledgePack["entities"];
  places: LensKnowledgePack["entities"];
  pointFocusEntityIds: Record<string, string>;
  assertions: LensKnowledgePack["assertions"];
  sources: LensKnowledgePack["sources"];
  relationFamilies: LensKnowledgePack["assertions"][number]["relationFamily"][];
  confidences: LensKnowledgePack["assertions"][number]["confidence"][];
  reviewStatus: "draft" | "reviewed";
  lensRefs: LensReference[];
  appearance?: {
    color: string;
    dashArray?: [number, number];
    legendLabel?: string;
  };
  explorationQuestions?: Record<string, { question: string; reason: string }>;
};

function lensPreset(pack: LensKnowledgePack, presetId: string) {
  const preset = pack.presets.find((candidate) => candidate.id === presetId);
  if (!preset) throw new Error(`Unknown lens preset: ${presetId}`);
  return preset;
}

export function projectLensPreset(
  pack: LensKnowledgePack,
  presetId: string,
): LensProjection {
  const preset = lensPreset(pack, presetId);
  const visibleKinds = preset.visibleEntityKinds
    ? new Set(preset.visibleEntityKinds)
    : undefined;
  const entityById = new Map(pack.entities.map((entity) => [entity.id, entity]));
  const isVisibleEntity = (entityId: string) => {
    const entity = entityById.get(entityId);
    return Boolean(entity && (!visibleKinds || visibleKinds.has(entity.kind)));
  };

  const candidateEdges = pack.assertions.filter((assertion) => {
    if (!preset.relationFamilies.includes(assertion.relationFamily)) return false;
    if (!isVisibleEntity(assertion.subjectId) || !isVisibleEntity(assertion.objectId)) return false;
    if (
      preset.viewpointIds.length > 0 &&
      !assertion.viewpointIds.some((id) => preset.viewpointIds.includes(id))
    ) {
      return false;
    }

    return assertion.reviewStatus !== "rejected";
  });

  const mapEntityIds = preset.mapConnections
    .flatMap((connection) => [
      ...connection.placeEntityIds,
      ...connection.contextEntityIds,
      ...(connection.anchorEntityId ? [connection.anchorEntityId] : []),
    ])
    .filter((id) => isVisibleEntity(id));
  const initialRoots = [...new Set([...preset.rootEntityIds, ...mapEntityIds])];
  const visibleIds = new Set(initialRoots);
  let frontier = new Set(initialRoots);
  for (let depth = 0; depth < Math.max(1, preset.expansionDepth); depth += 1) {
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
    lensType: preset.lensType,
    nodes: pack.entities.filter((entity) => visibleIds.has(entity.id)),
    edges,
  };
}

export function projectLensMapPreset(
  pack: LensKnowledgePack,
  presetId: string,
): LensMapConnectionProjection[] {
  const preset = lensPreset(pack, presetId);
  const entityById = new Map(pack.entities.map((entity) => [entity.id, entity]));
  const assertionById = new Map(pack.assertions.map((assertion) => [assertion.id, assertion]));
  const sourceById = new Map(pack.sources.map((source) => [source.id, source]));

  return preset.mapConnections.map((connection) => {
    const assertions = connection.assertionIds.flatMap((id) => {
      const assertion = assertionById.get(id);
      return assertion ? [assertion] : [];
    });
    const sourceIds = [...new Set(assertions.flatMap((assertion) => assertion.sourceIds))];
    return {
      id: connection.id,
      packId: pack.id,
      packVersion: pack.version,
      presetId: preset.id,
      title: connection.label,
      description: connection.description,
      displayMode: connection.displayMode,
      origin: "knowledge-pack" as const,
      anchor: connection.anchorEntityId ? entityById.get(connection.anchorEntityId) : undefined,
      contextEntities: connection.contextEntityIds.flatMap((id) => {
        const entity = entityById.get(id);
        return entity ? [entity] : [];
      }),
      places: connection.placeEntityIds.flatMap((id) => {
        const place = entityById.get(id);
        return place ? [place] : [];
      }),
      pointFocusEntityIds: connection.pointFocusEntityIds,
      assertions,
      sources: sourceIds.flatMap((id) => {
        const source = sourceById.get(id);
        return source ? [source] : [];
      }),
      relationFamilies: [...new Set(assertions.map((assertion) => assertion.relationFamily))],
      confidences: [...new Set(assertions.map((assertion) => assertion.confidence))],
      reviewStatus: assertions.every((assertion) => assertion.reviewStatus === "reviewed") ? "reviewed" as const : "draft" as const,
      lensRefs: [],
      appearance: connection.appearance,
      explorationQuestions: connection.explorationQuestions,
    };
  });
}

import type { LensExplorationLink } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";
import {
  matchCandidateForLensNode,
  resolveSpotForLensNode,
} from "./candidate-matching";

export type TopicHoverIndex = {
  /** node.id -> spot.id[] (1-to-1 for place nodes; connected place spotIds for deity/person/clan/concept nodes) */
  nodeToSpotIds: ReadonlyMap<string, readonly string[]>;
  /** node.id -> suggestion.id[] (matching candidate suggestion IDs, including targetPlaceId & targetName) */
  nodeToSuggestionIds: ReadonlyMap<string, readonly string[]>;
  /** node.id -> connected neighbor node.id[] in the current preset graph */
  nodeToNeighborNodeIds: ReadonlyMap<string, readonly string[]>;
  /** spot.id -> node.id[] (place nodes directly bound to this spot) */
  spotToNodeIds: ReadonlyMap<string, readonly string[]>;
  /** suggestion.id (or targetPlaceId / targetName) -> node.id[] */
  suggestionToNodeIds: ReadonlyMap<string, readonly string[]>;
};

function appendToListMap(map: Map<string, string[]>, key: string, value: string): void {
  if (!key || !value) return;
  const list = map.get(key);
  if (list) {
    if (!list.includes(value)) list.push(value);
  } else {
    map.set(key, [value]);
  }
}

/**
 * Pre-materializes O(1) bidirectional lookup maps between LENS topic nodes and Atlas spots/suggestions.
 * Keeps pointer hover interactions free of runtime scans over spots or claims (AGENTS.md Rule 6).
 */
export function buildTopicHoverIndex({
  pack,
  presetId,
  spots,
  suggestions = [],
  explorationLinks,
}: {
  pack: LensKnowledgePack;
  presetId: string;
  spots: readonly ReviewAtlasSpot[];
  suggestions?: readonly ReviewExplorationSuggestion[];
  explorationLinks?: Map<string, LensExplorationLink>;
}): TopicHoverIndex {
  const projection = projectLensPreset(pack, presetId);

  const neighborSets = new Map<string, Set<string>>();
  for (const node of projection.nodes) {
    neighborSets.set(node.id, new Set<string>());
  }
  for (const edge of projection.edges) {
    neighborSets.get(edge.subjectId)?.add(edge.objectId);
    neighborSets.get(edge.objectId)?.add(edge.subjectId);
  }

  const nodeToNeighborNodeIds = new Map<string, readonly string[]>();
  for (const [id, set] of neighborSets.entries()) {
    nodeToNeighborNodeIds.set(id, [...set]);
  }

  const directSpotByNodeId = new Map<string, string>();
  const directSuggestionsByNodeId = new Map<string, readonly string[]>();
  const spotToNodeIds = new Map<string, string[]>();
  const suggestionToNodeIds = new Map<string, string[]>();

  // Pass 1: Direct 1-to-1 entity/place resolution
  for (const node of projection.nodes) {
    const link = explorationLinks?.get(node.id);
    const directSpotId = resolveSpotForLensNode(node, link, spots);
    if (directSpotId) {
      directSpotByNodeId.set(node.id, directSpotId);
      appendToListMap(spotToNodeIds, directSpotId, node.id);
    }

    if (suggestions.length > 0) {
      const candidate = matchCandidateForLensNode(node, suggestions);
      if (candidate) {
        const candidateKeys = [
          candidate.id,
          ...(candidate.targetPlaceId ? [candidate.targetPlaceId] : []),
          candidate.targetName,
        ];
        const uniqueKeys = [...new Set(candidateKeys.filter(Boolean))];
        directSuggestionsByNodeId.set(node.id, uniqueKeys);
        for (const key of uniqueKeys) {
          appendToListMap(suggestionToNodeIds, key, node.id);
        }
      }
    }
  }

  // Pass 2: Materialize node -> spotIds / suggestionIds (with 1-hop connected places for deity/clan/person nodes)
  const nodeToSpotIds = new Map<string, readonly string[]>();
  const nodeToSuggestionIds = new Map<string, readonly string[]>();

  for (const node of projection.nodes) {
    const directSpotId = directSpotByNodeId.get(node.id);
    if (directSpotId) {
      nodeToSpotIds.set(node.id, [directSpotId]);
    } else {
      const connectedSpotIds = new Set<string>();
      for (const neighborId of neighborSets.get(node.id) ?? []) {
        const neighborSpotId = directSpotByNodeId.get(neighborId);
        if (neighborSpotId) connectedSpotIds.add(neighborSpotId);
      }
      nodeToSpotIds.set(node.id, [...connectedSpotIds]);
    }

    const directSuggestionKeys = directSuggestionsByNodeId.get(node.id);
    if (directSuggestionKeys && directSuggestionKeys.length > 0) {
      nodeToSuggestionIds.set(node.id, directSuggestionKeys);
    } else {
      const connectedSuggestionKeys = new Set<string>();
      for (const neighborId of neighborSets.get(node.id) ?? []) {
        for (const key of directSuggestionsByNodeId.get(neighborId) ?? []) {
          connectedSuggestionKeys.add(key);
        }
      }
      nodeToSuggestionIds.set(node.id, [...connectedSuggestionKeys]);
    }
  }

  return {
    nodeToSpotIds,
    nodeToSuggestionIds,
    nodeToNeighborNodeIds,
    spotToNodeIds,
    suggestionToNodeIds,
  };
}

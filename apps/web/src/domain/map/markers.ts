import { projectMapReferenceMarkers, type MapConnectionProjection } from "./connections";
import { mapSpotPresentation } from "./spot-presentation";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "../review/types";

export type MapMarkerKind = "visited" | "suggestion" | "reference";

export type MapMarkerItem = {
  id: string;
  kind: MapMarkerKind;
  latitude: number;
  longitude: number;
  label: string;
  eyebrow?: string;
  icon: string;
  color: string;
  category?: string;
  isActive: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isGhost?: boolean;
  title: string;
  targetId: string;
  positionStatus?: string;
  referenceConnections?: MapConnectionProjection[];
};

export type TopicMapScope = {
  spotIds: ReadonlySet<string>;
  suggestionIds: ReadonlySet<string>;
};

export function projectMapMarkers({
  spots,
  suggestions,
  suggestionsVisible = true,
  selectedSpotId,
  selectedSuggestionId,
  highlightedSpotIds = [],
  mapConnections = [],
  activeMapConnectionId,
  focusedViewport = false,
  topicScope,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  suggestionsVisible?: boolean;
  selectedSpotId?: string;
  selectedSuggestionId?: string;
  highlightedSpotIds?: string[];
  mapConnections?: MapConnectionProjection[];
  activeMapConnectionId?: string;
  focusedViewport?: boolean;
  topicScope?: TopicMapScope | null;
}): MapMarkerItem[] {
  const markers: MapMarkerItem[] = [];

  // 1. Visited spots
  for (const [index, spot] of spots.entries()) {
    const presentation = mapSpotPresentation(spot);
    const isTopicRelated = !topicScope || topicScope.spotIds.has(spot.id);
    const isGhost = !isTopicRelated;

    markers.push({
      id: spot.id,
      kind: "visited",
      latitude: spot.latitude,
      longitude: spot.longitude,
      label: spot.name,
      eyebrow: String(index + 1).padStart(2, "0"),
      icon: presentation.icon,
      color: presentation.color,
      category: presentation.id,
      isActive: spot.id === selectedSpotId,
      isHighlighted: !isGhost && highlightedSpotIds.includes(spot.id),
      isVisible: true,
      isGhost,
      title: isGhost ? `${spot.name} · 今回のトピック対象外（旅の訪問地）` : `${spot.name} · ${presentation.label}`,
      targetId: spot.id,
      positionStatus: spot.positionStatus ?? "confirmed",
    });
  }

  // 2. Exploration suggestions
  for (const suggestion of suggestions) {
    const isSelected = suggestion.id === selectedSuggestionId;
    const isTopicRelated = !topicScope || topicScope.suggestionIds.has(suggestion.id);
    const isVisible = suggestionsVisible && (isTopicRelated || isSelected);

    const matchingConnections = mapConnections.filter((conn) =>
      conn.points.some(
        (p) => p.label === suggestion.targetName ||
               (Math.abs(p.latitude - suggestion.latitude) <= 0.0001 && Math.abs(p.longitude - suggestion.longitude) <= 0.0001)
      ) ||
      (suggestion.connectionIds && suggestion.connectionIds.some((cid) => conn.id.includes(cid) || conn.sourceId === cid))
    );

    markers.push({
      id: suggestion.id,
      kind: "suggestion",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      label: suggestion.targetName,
      eyebrow: "次の候補",
      icon: "⚑",
      color: "#d7a6ff",
      isActive: isSelected,
      isHighlighted: false,
      isVisible,
      title: `${suggestion.targetName} · 次の探索候補`,
      targetId: suggestion.id,
      referenceConnections: matchingConnections.length > 0 ? matchingConnections : undefined,
    });
  }

  // 3. Unvisited reference markers from map connections (unify into candidate markers, skip if already represented as suggestions)
  const suggestionLabels = new Set(suggestions.map((s) => s.targetName));
  const referenceMarkers = projectMapReferenceMarkers(mapConnections, spots);
  for (const ref of referenceMarkers) {
    if (suggestionLabels.has(ref.point.label)) continue;
    const isSelected = ref.id === selectedSuggestionId || ref.point.label === selectedSuggestionId;
    const isActive = isSelected || ref.connections.some((connection) => connection.id === activeMapConnectionId);
    const isTopicRelated = !topicScope ||
      topicScope.suggestionIds.has(ref.id) ||
      ref.connections.length > 0;
    const isVisible = suggestionsVisible && (isTopicRelated || isSelected);

    markers.push({
      id: ref.id,
      kind: "suggestion",
      latitude: ref.point.latitude,
      longitude: ref.point.longitude,
      label: ref.point.label,
      eyebrow: "次の候補",
      icon: "⚑",
      color: "#d7a6ff",
      isActive,
      isHighlighted: false,
      isVisible,
      title: `${ref.point.label} · 次の探索候補`,
      targetId: ref.point.focusEntityId ?? ref.id,
      referenceConnections: ref.connections,
    });
  }

  return markers;
}

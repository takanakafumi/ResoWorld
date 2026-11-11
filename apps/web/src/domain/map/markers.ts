import { projectMapReferenceMarkers, type MapConnectionProjection } from "./connections";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { isProvenanceCategoryMatchingOverlay, resolveProvenanceOriginMeta } from "@/domain/archaeology/provenance-registry";
import type { ArtifactOverlayId } from "@/domain/archaeology/artifact-overlay-types";
import {
  mapSpotPresentation,
  resolveSpotEpistemicNature,
  SPOT_EPISTEMIC_NATURE_DEFINITIONS,
  spotMatchesNatureFilter,
  type MapNatureFilter,
  type SpotEpistemicNature,
} from "./spot-presentation";
import type { ExplorationSuggestionStatus, ReviewAtlasSpot, ReviewExplorationSuggestion } from "../review/types";

export type MapMarkerKind = "visited" | "suggestion" | "reference";

export type MapMarkerItem = {
  id: string;
  kind: MapMarkerKind;
  status?: ExplorationSuggestionStatus;
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
  stratumCount?: number;
  isMultiStratum?: boolean;
  epistemicNature?: SpotEpistemicNature;
  isCandidate?: boolean;
  isProvenanceOrigin?: boolean;
  provenanceBadgeText?: string;
  provenanceMaterial?: string;
  isOriginEmphasized?: boolean;
  isFocusAura?: boolean;
  focusAuraColor?: string;
  isFocusAuraActive?: boolean;
};

export type TopicMapScope = {
  spotIds: ReadonlySet<string>;
  suggestionIds: ReadonlySet<string>;
};

export function projectMapMarkers({
  spots,
  suggestions = [],
  suggestionsVisible = true,
  suggestionStatuses,
  selectedSpotId,
  selectedSuggestionId,
  selectedSuggestion,
  highlightedSpotIds = [],
  mapConnections = [],
  activeMapConnectionId,
  focusedViewport = false,
  topicScope,
  stratumCountBySpotId,
  natureFilter = "all",
  activeArtifactOverlay,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  suggestionsVisible?: boolean;
  suggestionStatuses?: Record<string, ExplorationSuggestionStatus>;
  selectedSpotId?: string;
  selectedSuggestionId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  highlightedSpotIds?: string[];
  mapConnections?: MapConnectionProjection[];
  activeMapConnectionId?: string;
  focusedViewport?: boolean;
  topicScope?: TopicMapScope | null;
  stratumCountBySpotId?: ReadonlyMap<string, number>;
  natureFilter?: MapNatureFilter;
  activeArtifactOverlay?: ArtifactOverlayId;
}): MapMarkerItem[] {
  const markers: MapMarkerItem[] = [];
  const auraEligibleConnections = mapConnections.filter(
    (c) =>
      c.displayMode === "focus-only" ||
      c.displayMode === "hull" ||
      c.displayMode === "perimeter" ||
      c.epistemicRole === "alliance_mesh"
  );

  // 1. Visited & Candidate spots
  let visitOrder = 0;
  for (const spot of spots) {
    const presentation = mapSpotPresentation(spot);
    const epistemicNature = resolveSpotEpistemicNature(spot);
    const isCandidate = spot.mapRole === "candidate-place" || epistemicNature === "candidate_frontier";

    let eyebrow: string | undefined;
    if (isCandidate) {
      eyebrow = "候補";
    } else if (epistemicNature === "area_context" || presentation.id === "area") {
      eyebrow = "広域";
    } else {
      visitOrder++;
      eyebrow = String(visitOrder).padStart(2, "0");
    }

    const natureDef = SPOT_EPISTEMIC_NATURE_DEFINITIONS[epistemicNature];
    const markerColor = natureDef.color;
    const isTopicRelated = !topicScope || topicScope.spotIds.has(spot.id);
    const isGhost = !isTopicRelated;
    const stratumCount = stratumCountBySpotId?.get(spot.id) ?? 0;
    const isMultiStratum = stratumCount >= 2;
    const matchesNature = spotMatchesNatureFilter(epistemicNature, natureFilter);

    const originMeta = resolveProvenanceOriginMeta({ id: spot.id, name: spot.name });
    const isProvenanceOrigin = Boolean(
      originMeta &&
      activeArtifactOverlay &&
      activeArtifactOverlay !== "none" &&
      isProvenanceCategoryMatchingOverlay(originMeta.category, activeArtifactOverlay)
    );
    const provenanceBadgeText = isProvenanceOrigin ? originMeta?.badgeText : undefined;
    const provenanceMaterial = isProvenanceOrigin ? originMeta?.materialName : undefined;
    const isOriginEmphasized = isProvenanceOrigin && (spot.id === selectedSpotId || highlightedSpotIds.includes(spot.id));

    const matchingAuraConnections = auraEligibleConnections.filter((conn) =>
      conn.points.some((p) =>
        p.id === spot.id ||
        (p.spotId && p.spotId === spot.id) ||
        lensEntityNamesMatch(p.label, spot.name) ||
        (p.aliases && p.aliases.some((alias) => lensEntityNamesMatch(alias, spot.name)))
      )
    );
    // Prioritize active/emphasized/selected connections so that focused alliance meshes or selected routes take precedence
    const matchedAuraConnection =
      matchingAuraConnections.find((c) => c.selected || c.id === activeMapConnectionId || c.emphasized) ??
      matchingAuraConnections[0];
    const isAuraActive = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.selected ||
        matchedAuraConnection.id === activeMapConnectionId ||
        matchedAuraConnection.emphasized
      )
    );
    const isFocusAura = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.displayMode === "focus-only" ? true : isAuraActive
      )
    );
    const focusAuraColor = matchedAuraConnection?.appearance?.color ?? "#38bdf8";
    const isFocusAuraActive = isAuraActive;

    markers.push({
      id: spot.id,
      kind: "visited",
      latitude: spot.latitude,
      longitude: spot.longitude,
      label: spot.name,
      eyebrow,
      icon: isCandidate ? "⚑" : presentation.icon,
      color: markerColor,
      category: presentation.id,
      isActive: spot.id === selectedSpotId,
      isHighlighted: !isGhost && highlightedSpotIds.includes(spot.id),
      isVisible: matchesNature,
      isGhost,
      title: isCandidate
        ? `${spot.name} · 未訪問探索候補地 · ${presentation.label}`
        : isGhost
          ? `${spot.name} · 今回のトピック対象外（旅の訪問地）`
          : isMultiStratum
            ? `${spot.name} · ${stratumCount}層重層聖域 · ${natureDef.label}`
            : `${spot.name} · ${natureDef.label} · ${presentation.label}`,
      targetId: spot.id,
      positionStatus: spot.positionStatus ?? "confirmed",
      stratumCount: stratumCountBySpotId ? stratumCount : undefined,
      isMultiStratum,
      epistemicNature,
      isCandidate,
      isProvenanceOrigin,
      provenanceBadgeText,
      provenanceMaterial,
      isOriginEmphasized,
      isFocusAura,
      focusAuraColor: isFocusAura ? focusAuraColor : undefined,
      isFocusAuraActive,
    });
  }

  // 2. Exploration suggestions
  const suggestionMatchesNature = natureFilter === "all" || natureFilter === "candidates_only";
  for (const suggestion of suggestions) {
    const isSelected =
      (Boolean(selectedSuggestionId) && (
        suggestion.id === selectedSuggestionId ||
        (Boolean(suggestion.targetPlaceId) && suggestion.targetPlaceId === selectedSuggestionId) ||
        suggestion.targetName === selectedSuggestionId
      )) ||
      (Boolean(selectedSuggestion) && (
        suggestion.id === selectedSuggestion?.id ||
        (Boolean(suggestion.targetPlaceId) && Boolean(selectedSuggestion?.targetPlaceId) && suggestion.targetPlaceId === selectedSuggestion?.targetPlaceId) ||
        suggestion.targetName === selectedSuggestion?.targetName
      ));
    const isTopicRelated = !topicScope || topicScope.suggestionIds.has(suggestion.id);
    const isVisible = suggestionsVisible && suggestionMatchesNature && (isTopicRelated || isSelected);
    const status = suggestionStatuses?.[suggestion.id] ?? suggestion.initialStatus;
    const isAccepted = status === "accepted";

    const matchingConnections = mapConnections.filter((conn) =>
      conn.points.some(
        (p) => p.label === suggestion.targetName ||
               (Math.abs(p.latitude - suggestion.latitude) <= 0.0001 && Math.abs(p.longitude - suggestion.longitude) <= 0.0001)
      ) ||
      (suggestion.connectionIds && suggestion.connectionIds.some((cid) => conn.id.includes(cid) || conn.sourceId === cid))
    );

    const originMeta = resolveProvenanceOriginMeta({
      id: suggestion.id,
      targetPlaceId: suggestion.targetPlaceId,
      name: suggestion.targetName,
      topicId: suggestion.topicId,
    });
    const isProvenanceOrigin = Boolean(
      originMeta &&
      activeArtifactOverlay &&
      activeArtifactOverlay !== "none" &&
      isProvenanceCategoryMatchingOverlay(originMeta.category, activeArtifactOverlay)
    );
    const provenanceBadgeText = isProvenanceOrigin ? originMeta?.badgeText : undefined;
    const provenanceMaterial = isProvenanceOrigin ? originMeta?.materialName : undefined;
    const isOriginEmphasized = isProvenanceOrigin && (isSelected || (Boolean(selectedSuggestion) && selectedSuggestion?.id === suggestion.id));

    const matchedAuraConnection = auraEligibleConnections.find((conn) =>
      conn.points.some((p) =>
        p.id === suggestion.id ||
        (suggestion.targetPlaceId && p.id === suggestion.targetPlaceId) ||
        lensEntityNamesMatch(p.label, suggestion.targetName) ||
        (p.aliases && p.aliases.some((alias) => lensEntityNamesMatch(alias, suggestion.targetName)))
      ) ||
      (suggestion.connectionIds && suggestion.connectionIds.some((cid) => conn.id.includes(cid) || conn.sourceId === cid))
    );
    const isAuraActive = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.selected ||
        matchedAuraConnection.id === activeMapConnectionId ||
        matchedAuraConnection.emphasized
      )
    );
    const isFocusAura = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.displayMode === "focus-only" ? true : isAuraActive
      )
    );
    const focusAuraColor = matchedAuraConnection?.appearance?.color ?? "#38bdf8";
    const isFocusAuraActive = isAuraActive;

    markers.push({
      id: suggestion.id,
      kind: "suggestion",
      status,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      label: suggestion.targetName,
      eyebrow: isAccepted ? "探索計画" : "次の候補",
      icon: "⚑",
      color: isAccepted ? "#ffd166" : isProvenanceOrigin ? "#fde047" : "#d7a6ff",
      isActive: isSelected,
      isHighlighted: false,
      isVisible,
      title: isAccepted
        ? `${suggestion.targetName} · 探索計画（関心あり）`
        : isProvenanceOrigin
          ? `${suggestion.targetName} · ${provenanceBadgeText} · ${provenanceMaterial}`
          : `${suggestion.targetName} · 次の探索候補`,
      targetId: suggestion.id,
      referenceConnections: matchingConnections.length > 0 ? matchingConnections : undefined,
      epistemicNature: "candidate_frontier",
      isCandidate: true,
      isProvenanceOrigin,
      provenanceBadgeText,
      provenanceMaterial,
      isOriginEmphasized,
      isFocusAura,
      focusAuraColor: isFocusAura ? focusAuraColor : undefined,
      isFocusAuraActive,
    });
  }

  // 3. Unvisited reference markers from map connections (unify into candidate markers, skip if already represented as suggestions)
  const suggestionLabels = new Set(suggestions.map((s) => s.targetName));
  const referenceMarkers = projectMapReferenceMarkers(mapConnections, spots);
  for (const ref of referenceMarkers) {
    if (suggestionLabels.has(ref.point.label)) continue;
    const isSelected =
      (Boolean(selectedSuggestionId) && (ref.id === selectedSuggestionId || ref.point.label === selectedSuggestionId)) ||
      (Boolean(selectedSuggestion) && (ref.id === selectedSuggestion?.id || ref.point.label === selectedSuggestion?.targetName));
    const isActive = isSelected || ref.connections.some((connection) => connection.id === activeMapConnectionId);
    const isTopicRelated = !topicScope ||
      topicScope.suggestionIds.has(ref.id) ||
      ref.connections.length > 0;
    const isVisible = suggestionsVisible && suggestionMatchesNature && (isTopicRelated || isSelected);
    const status = suggestionStatuses?.[ref.id];
    const isAccepted = status === "accepted";

    const originMeta = resolveProvenanceOriginMeta({
      id: ref.id,
      targetPlaceId: ref.point.focusEntityId,
      name: ref.point.label,
    });
    const isProvenanceOrigin = Boolean(
      originMeta &&
      activeArtifactOverlay &&
      activeArtifactOverlay !== "none" &&
      isProvenanceCategoryMatchingOverlay(originMeta.category, activeArtifactOverlay)
    );
    const provenanceBadgeText = isProvenanceOrigin ? originMeta?.badgeText : undefined;
    const provenanceMaterial = isProvenanceOrigin ? originMeta?.materialName : undefined;
    const isOriginEmphasized = isProvenanceOrigin && isActive;

    const matchedAuraConnection = auraEligibleConnections.find((conn) =>
      ref.connections.some((c) => c.id === conn.id) ||
      conn.points.some((p) =>
        p.id === ref.id ||
        (ref.point.focusEntityId && p.id === ref.point.focusEntityId) ||
        lensEntityNamesMatch(p.label, ref.point.label) ||
        (p.aliases && p.aliases.some((alias) => lensEntityNamesMatch(alias, ref.point.label)))
      )
    );
    const isAuraActive = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.selected ||
        matchedAuraConnection.id === activeMapConnectionId ||
        matchedAuraConnection.emphasized
      )
    );
    const isFocusAura = Boolean(
      matchedAuraConnection && (
        matchedAuraConnection.displayMode === "focus-only" ? true : isAuraActive
      )
    );
    const focusAuraColor = matchedAuraConnection?.appearance?.color ?? "#38bdf8";
    const isFocusAuraActive = isAuraActive;

    markers.push({
      id: ref.id,
      kind: "suggestion",
      status,
      latitude: ref.point.latitude,
      longitude: ref.point.longitude,
      label: ref.point.label,
      eyebrow: isAccepted ? "探索計画" : "次の候補",
      icon: "⚑",
      color: isAccepted ? "#ffd166" : isProvenanceOrigin ? "#fde047" : "#d7a6ff",
      isActive,
      isHighlighted: false,
      isVisible,
      title: isAccepted
        ? `${ref.point.label} · 探索計画（関心あり）`
        : isProvenanceOrigin
          ? `${ref.point.label} · ${provenanceBadgeText} · ${provenanceMaterial}`
          : `${ref.point.label} · 次の探索候補`,
      targetId: ref.point.focusEntityId ?? ref.id,
      referenceConnections: ref.connections,
      epistemicNature: "candidate_frontier",
      isCandidate: true,
      isProvenanceOrigin,
      provenanceBadgeText,
      provenanceMaterial,
      isOriginEmphasized,
      isFocusAura,
      focusAuraColor: isFocusAura ? focusAuraColor : undefined,
      isFocusAuraActive,
    });
  }

  return markers;
}

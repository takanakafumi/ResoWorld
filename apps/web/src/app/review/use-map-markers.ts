"use client";

import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import { type MutableRefObject, useCallback, useEffect, useRef } from "react";

import type { ArtifactOverlayId } from "@/domain/archaeology/artifact-overlay-types";
import type { MapConnectionProjection } from "@/domain/map/connections";
import {
  partitionUnifiedMarkers,
  type GhostDotDescriptor,
  type MapViewportBounds,
} from "@/domain/map/ghost-dots";
import { findVisitedSpotAtScreenPoint } from "@/domain/map/hit-testing";
import { projectMapMarkers, type TopicMapScope } from "@/domain/map/markers";
import type { MapNatureFilter, SpotEpistemicNature } from "@/domain/map/spot-presentation";
import type {
  ExplorationSuggestionStatus,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

export type MapMarkerClassNames = {
  mapMarker: string;
  mapGhostDot: string;
  mapSpotMarker: string;
  mapMultiStratumMarker: string;
  mapSuggestionMarker: string;
  mapRouteMarker: string;
  mapMarkerIcon: string;
  mapSpotType: string;
  mapSuggestionType: string;
  mapMarkerEyebrow: string;
  mapSpotNumber: string;
  mapSuggestionEyebrow: string;
  mapMarkerLabel: string;
  mapSuggestionLabel: string;
  mapMultiStratumBadge: string;
  mapProvenanceOriginMarker: string;
  mapOriginBadge: string;
  mapFocusedOriginMarker: string;
};

type ManagedMarker = {
  marker: maplibregl.Marker;
  element: HTMLButtonElement;
  isGhost: boolean;
  kind: string;
  label: string;
  eyebrow?: string;
  stratumCount?: number;
  epistemicNature?: SpotEpistemicNature;
  isCandidate?: boolean;
  isProvenanceOrigin?: boolean;
  provenanceBadgeText?: string;
  isFocusAura?: boolean;
  focusAuraColor?: string;
};

type UseMapMarkersOptions = {
  mapRef: MutableRefObject<MapLibreMap | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  isMapMovingRef: MutableRefObject<boolean>;
  ghostDotsRef: MutableRefObject<GhostDotDescriptor[]>;
  hoveredIdsSetRef: MutableRefObject<Set<string>>;
  ghostDotOverlayRef: MutableRefObject<{ repaint: () => void }>;
  onSelectSpotRef: MutableRefObject<(spotId: string) => void>;
  onSelectSuggestionRef: MutableRefObject<(suggestionId: string) => void>;
  onSelectLensEntityRef: MutableRefObject<(entityId: string) => void>;
  onHoverSpotRef: MutableRefObject<((spotId: string | null) => void) | undefined>;
  onHoverSuggestionRef: MutableRefObject<((suggestionId: string | null) => void) | undefined>;
  onClearConnectionChoiceIds: () => void;
  classes: MapMarkerClassNames;
  mapRevision: number;
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  suggestionsVisible: boolean;
  suggestionStatuses?: Record<string, ExplorationSuggestionStatus>;
  selectedSpotId: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  highlightedSpotIds: string[];
  hoveredSpotIds?: readonly string[];
  hoveredSuggestionIds?: readonly string[];
  mapConnections: MapConnectionProjection[];
  activeMapConnectionId: string;
  focusedViewport: boolean;
  topicScope?: TopicMapScope | null;
  stratumCountBySpotId?: ReadonlyMap<string, number>;
  natureFilter: MapNatureFilter;
  activeArtifactOverlay: ArtifactOverlayId;
  recognitionLens: string;
  settledViewport: { zoom: number; bounds: MapViewportBounds } | null;
};

export function useMapMarkers({
  mapRef,
  containerRef,
  isMapMovingRef,
  ghostDotsRef,
  hoveredIdsSetRef,
  ghostDotOverlayRef,
  onSelectSpotRef,
  onSelectSuggestionRef,
  onSelectLensEntityRef,
  onHoverSpotRef,
  onHoverSuggestionRef,
  onClearConnectionChoiceIds,
  classes,
  mapRevision,
  spots,
  suggestions,
  suggestionsVisible,
  suggestionStatuses,
  selectedSpotId,
  selectedSuggestion,
  highlightedSpotIds,
  hoveredSpotIds,
  hoveredSuggestionIds,
  mapConnections,
  activeMapConnectionId,
  focusedViewport,
  topicScope,
  stratumCountBySpotId,
  natureFilter,
  activeArtifactOverlay,
  recognitionLens,
  settledViewport,
}: UseMapMarkersOptions) {
  const markersMapRef = useRef<Map<string, ManagedMarker>>(new Map());
  const classesRef = useRef(classes);
  classesRef.current = classes;
  const onClearConnectionChoiceIdsRef = useRef(onClearConnectionChoiceIds);
  onClearConnectionChoiceIdsRef.current = onClearConnectionChoiceIds;

  const cleanupMarkers = useCallback(() => {
    markersMapRef.current.forEach(({ marker }) => marker.remove());
    markersMapRef.current.clear();
  }, []);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;

    const unifiedMarkers = projectMapMarkers({
      spots,
      suggestions,
      suggestionsVisible,
      suggestionStatuses,
      selectedSpotId,
      selectedSuggestionId: selectedSuggestion?.id,
      selectedSuggestion,
      highlightedSpotIds,
      mapConnections,
      activeMapConnectionId,
      focusedViewport,
      topicScope,
      stratumCountBySpotId,
      natureFilter,
      activeArtifactOverlay,
    });

    const { domMarkers, ghostDots } = partitionUnifiedMarkers(unifiedMarkers, {
      isOverviewMode: !topicScope,
      zoom: settledViewport?.zoom,
      bounds: settledViewport?.bounds,
    });
    ghostDotsRef.current = ghostDots;
    ghostDotOverlayRef.current.repaint();

    const currentMarkers = markersMapRef.current;
    const activeIds = new Set<string>();
    const cls = classesRef.current;

    for (const marker of domMarkers) {
      if (!marker.isVisible) {
        const existing = currentMarkers.get(marker.id);
        if (existing) {
          existing.marker.remove();
          currentMarkers.delete(marker.id);
        }
        continue;
      }

      activeIds.add(marker.id);
      const existing = currentMarkers.get(marker.id);

      // Reconcile: If marker already exists with identical visual structure, update attributes in place
      if (
        existing &&
        existing.isGhost === Boolean(marker.isGhost) &&
        existing.kind === marker.kind &&
        existing.label === marker.label &&
        existing.eyebrow === marker.eyebrow &&
        existing.stratumCount === marker.stratumCount &&
        existing.epistemicNature === marker.epistemicNature &&
        existing.isCandidate === marker.isCandidate &&
        existing.isProvenanceOrigin === Boolean(marker.isProvenanceOrigin) &&
        existing.provenanceBadgeText === marker.provenanceBadgeText
      ) {
        const el = existing.element;
        el.dataset.active = String(marker.isActive);
        el.dataset.connected = String(marker.isHighlighted);
        el.style.setProperty("--spot-color", marker.color);
        if (marker.status) {
          el.dataset.status = marker.status;
        } else {
          delete el.dataset.status;
        }
        if (marker.isFocusAura) {
          el.dataset.focusAura = marker.isFocusAuraActive ? "active" : "true";
          if (marker.focusAuraColor) {
            el.style.setProperty("--focus-color", marker.focusAuraColor);
          }
        } else {
          delete el.dataset.focusAura;
          el.style.removeProperty("--focus-color");
        }
        continue;
      }

      // If existing but structure changed (e.g. ghost <-> full pin), remove old one first
      if (existing) {
        existing.marker.remove();
        currentMarkers.delete(marker.id);
      }

      const element = document.createElement("button");
      element.type = "button";
      element.className = cls.mapMarker;
      element.dataset.markerId = marker.id;
      element.dataset.spotId = marker.id;
      element.dataset.targetId = marker.targetId;
      element.dataset.kind = marker.kind;
      element.dataset.active = String(marker.isActive);
      element.dataset.connected = String(marker.isHighlighted);
      if (marker.status) {
        element.dataset.status = marker.status;
      }
      if (marker.epistemicNature) {
        element.dataset.nature = marker.epistemicNature;
      }
      if (marker.isCandidate) {
        element.dataset.candidate = "true";
      }
      if (marker.isFocusAura) {
        element.dataset.focusAura = marker.isFocusAuraActive ? "active" : "true";
        if (marker.focusAuraColor) {
          element.style.setProperty("--focus-color", marker.focusAuraColor);
        }
      }
      element.style.setProperty("--spot-color", marker.color);
      if (
        hoveredIdsSetRef.current.has(marker.id) ||
        hoveredIdsSetRef.current.has(marker.targetId) ||
        hoveredIdsSetRef.current.has(marker.label)
      ) {
        element.dataset.hovered = "true";
      }

      const handlePointerEnter = (event: PointerEvent) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        if (isMapMovingRef.current || mapRef.current?.isMoving()) return;
        if (marker.kind === "visited") {
          onHoverSpotRef.current?.(marker.id);
        } else if (marker.kind === "suggestion" || marker.kind === "reference") {
          onHoverSuggestionRef.current?.(marker.id);
        }
      };
      const handlePointerLeave = (event: PointerEvent) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        if (isMapMovingRef.current || mapRef.current?.isMoving()) return;
        if (marker.kind === "visited") {
          onHoverSpotRef.current?.(null);
        } else if (marker.kind === "suggestion" || marker.kind === "reference") {
          onHoverSuggestionRef.current?.(null);
        }
      };
      element.addEventListener("pointerenter", handlePointerEnter);
      element.addEventListener("pointerleave", handlePointerLeave);

      if (marker.isGhost) {
        element.dataset.ghost = "true";
        element.classList.add(cls.mapGhostDot);
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          onClearConnectionChoiceIdsRef.current();
          onSelectSpotRef.current(marker.id);
        });
      } else {
        if (marker.kind === "visited") {
          element.classList.add(cls.mapSpotMarker);
          if (marker.stratumCount !== undefined) {
            element.dataset.stratumCount = String(marker.stratumCount);
          }
          if (marker.isMultiStratum) {
            element.classList.add(cls.mapMultiStratumMarker);
          }
        }
        if (marker.kind === "suggestion") element.classList.add(cls.mapSuggestionMarker);
        if (marker.kind === "reference") element.classList.add(cls.mapRouteMarker);

        const icon = document.createElement("span");
        icon.className = cls.mapMarkerIcon;
        if (marker.kind === "visited") icon.classList.add(cls.mapSpotType);
        if (marker.kind === "suggestion") icon.classList.add(cls.mapSuggestionType);
        icon.textContent = marker.icon;
        icon.setAttribute("aria-hidden", "true");

        let eyebrow: HTMLElement | null = null;
        if (marker.eyebrow) {
          eyebrow = document.createElement("span");
          eyebrow.className = cls.mapMarkerEyebrow;
          if (marker.kind === "visited") eyebrow.classList.add(cls.mapSpotNumber);
          if (marker.kind === "suggestion") eyebrow.classList.add(cls.mapSuggestionEyebrow);
          eyebrow.textContent = marker.eyebrow;
        }

        const label = document.createElement("strong");
        label.className = cls.mapMarkerLabel;
        if (marker.kind === "suggestion") label.classList.add(cls.mapSuggestionLabel);
        label.textContent = marker.label;

        if (eyebrow) {
          element.append(icon, eyebrow, label);
        } else {
          element.append(icon, label);
        }

        if (marker.isMultiStratum && marker.stratumCount) {
          const stratumBadge = document.createElement("span");
          stratumBadge.className = cls.mapMultiStratumBadge;
          stratumBadge.textContent = `${marker.stratumCount}層`;
          stratumBadge.title = `累重する${marker.stratumCount}の時代地層を宿す重層聖域`;
          element.append(stratumBadge);
        }

        // 産地地点バッジ（Provenance Origin Badge）の付与
        if (marker.isProvenanceOrigin && marker.provenanceBadgeText) {
          element.classList.add(cls.mapProvenanceOriginMarker);
          element.dataset.origin = "true";

          const originBadge = document.createElement("span");
          originBadge.className = cls.mapOriginBadge;
          originBadge.textContent = marker.provenanceBadgeText;
          originBadge.title = `鉱物・物質文化の主要原産地・工房（${marker.provenanceMaterial ?? ""}）`;
          element.append(originBadge);
        }

        // 選択・フォーカス中の産地強調（脈動オーラ）
        if (marker.isProvenanceOrigin && (marker.isOriginEmphasized || marker.isActive)) {
          element.classList.add(cls.mapFocusedOriginMarker);
          element.dataset.focusedOrigin = "true";
        }

        element.addEventListener("click", (event) => {
          event.stopPropagation();
          onClearConnectionChoiceIdsRef.current();
          if (marker.kind === "visited") {
            const boxes = [
              ...containerRef.current!.querySelectorAll<HTMLElement>(`.${cls.mapMarker}[data-kind="visited"]`),
            ].flatMap((candidate) => {
              const id = candidate.dataset.markerId;
              if (!id) return [];
              const bounds = candidate.getBoundingClientRect();
              return [{ id, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }];
            });
            onSelectSpotRef.current(
              findVisitedSpotAtScreenPoint(boxes, { x: event.clientX, y: event.clientY }) ?? marker.id,
            );
          } else if (marker.kind === "suggestion") {
            onSelectSuggestionRef.current(marker.id);
          } else if (marker.kind === "reference") {
            onSelectLensEntityRef.current(marker.targetId);
          }
        });
      }

      const anchor = marker.isGhost ? "center" : "bottom";
      const mapMarker = new maplibregl.Marker({ element, anchor })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(mapRef.current!);

      currentMarkers.set(marker.id, {
        marker: mapMarker,
        element,
        isGhost: Boolean(marker.isGhost),
        kind: marker.kind,
        label: marker.label,
        eyebrow: marker.eyebrow,
        stratumCount: marker.stratumCount,
        epistemicNature: marker.epistemicNature,
        isCandidate: marker.isCandidate,
        isProvenanceOrigin: marker.isProvenanceOrigin,
        provenanceBadgeText: marker.provenanceBadgeText,
        isFocusAura: marker.isFocusAura,
        focusAuraColor: marker.focusAuraColor,
      });
    }

    // Remove any markers that are no longer part of active markers
    for (const [id, entry] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        entry.marker.remove();
        currentMarkers.delete(id);
      }
    }
  }, [
    activeArtifactOverlay,
    activeMapConnectionId,
    containerRef,
    focusedViewport,
    ghostDotOverlayRef,
    ghostDotsRef,
    highlightedSpotIds,
    hoveredIdsSetRef,
    isMapMovingRef,
    mapConnections,
    mapRef,
    mapRevision,
    natureFilter,
    onHoverSpotRef,
    onHoverSuggestionRef,
    onSelectLensEntityRef,
    onSelectSpotRef,
    onSelectSuggestionRef,
    recognitionLens,
    selectedSpotId,
    selectedSuggestion,
    settledViewport,
    spots,
    stratumCountBySpotId,
    suggestions,
    suggestionsVisible,
    suggestionStatuses,
    topicScope,
  ]);

  // O(1) Direct DOM Hover Reconciliation (Zero Re-Projection on Hover / Rule 6 & 8)
  useEffect(() => {
    const nextHoveredSet = new Set<string>([
      ...(hoveredSpotIds ?? []),
      ...(hoveredSuggestionIds ?? []),
    ]);
    hoveredIdsSetRef.current = nextHoveredSet;

    if (!mapRevision) return;
    for (const [id, entry] of markersMapRef.current.entries()) {
      const isHovered =
        nextHoveredSet.has(id) ||
        nextHoveredSet.has(entry.element.dataset.targetId ?? "") ||
        nextHoveredSet.has(entry.label);
      if (isHovered) {
        entry.element.dataset.hovered = "true";
      } else {
        delete entry.element.dataset.hovered;
      }
    }
    ghostDotOverlayRef.current.repaint();
  }, [ghostDotOverlayRef, hoveredIdsSetRef, hoveredSpotIds, hoveredSuggestionIds, mapRevision]);

  return { cleanupMarkers };
}

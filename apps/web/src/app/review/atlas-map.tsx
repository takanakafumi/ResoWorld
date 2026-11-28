"use client";

import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ArtifactOverlayId } from "@/domain/archaeology/artifact-overlay-types";
import { projectArtifactOverlay } from "@/domain/archaeology/artifact-projection";
import type { LensSpatialOverlay } from "@/domain/lens-packs/schema";
import {
  connectionBelongsToLens,
  resolveConnectionPointClickTarget,
  type MapConnectionProjection,
} from "@/domain/map/connections";
import {
  OVERVIEW_PILL_ZOOM_THRESHOLD,
  type GhostDotDescriptor,
  type MapViewportBounds,
} from "@/domain/map/ghost-dots";
import type { TopicMapScope } from "@/domain/map/markers";
import type { MapSceneProjection } from "@/domain/map/scene";
import {
  resolveSpotEpistemicNature,
  spotMatchesNatureFilter,
  type MapNatureFilter,
} from "@/domain/map/spot-presentation";
import type {
  ExplorationSuggestionStatus,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import {
  AtlasMapFloatingCameraControls,
  AtlasMapHeaderToolbar,
  AtlasMapLegend,
  type AtlasMapChromeClassNames,
} from "./atlas-map-chrome";
import styles from "./atlas.module.css";
import { MapAreaZoneInspector } from "./map-area-zone-inspector";
import { MapArtifactOverlayLayer } from "./map-artifact-overlay-layer";
import { MapConnectionOverlayLayer } from "./map-connection-overlay-layer";
import { MapFieldSearchDrawer } from "./map-field-search-drawer";
import { MapHistoricalOverlayLayer } from "./map-historical-overlay-layer";
import { buildAtlasMapStyle } from "./map-style";
import { useAreaZoneOverlay } from "./use-area-zone-overlay";
import {
  hasVisibleAreaConnections,
  type ConnectionLayerVisibility,
} from "./use-connection-lines";
import { useGhostDotOverlay } from "./use-ghost-dot-overlay";
import { useMapCameraControls } from "./use-map-camera-controls";
import { useMapFieldSearch } from "./use-map-field-search";
import { useMapMarkers, type MapMarkerClassNames } from "./use-map-markers";
import { usePaleoLayer } from "./use-paleo-layer";

const MAP_CHROME_CLASS_NAMES: AtlasMapChromeClassNames = {
  panelHeader: styles.panelHeader,
  panelHeaderTitle: styles.panelHeaderTitle,
  panelIndex: styles.panelIndex,
  mapHeaderToolbar: styles.mapHeaderToolbar,
  connectionLayerButton: styles.connectionLayerButton,
  layerDotSuggestion: styles.layerDotSuggestion,
  mapHeaderDivider: styles.mapHeaderDivider,
  mapHeaderPaleoGroup: styles.mapHeaderPaleoGroup,
  mapHeaderPaleoLabel: styles.mapHeaderPaleoLabel,
  mapHeaderPaleoSelect: styles.mapHeaderPaleoSelect,
  mapHeaderArtifactGroup: styles.mapHeaderArtifactGroup,
  mapHeaderArtifactLabel: styles.mapHeaderArtifactLabel,
  mapHeaderArtifactSelect: styles.mapHeaderArtifactSelect,
  mapHeaderFilterGroup: styles.mapHeaderFilterGroup,
  mapHeaderFilterLabel: styles.mapHeaderFilterLabel,
  mapHeaderFilterSelect: styles.mapHeaderFilterSelect,
  mapFloatingCameraControls: styles.mapFloatingCameraControls,
  mapFloatingSearchBtn: styles.mapFloatingSearchBtn,
  mapFloatingLocateBtn: styles.mapFloatingLocateBtn,
  mapFloatingCameraFit: styles.mapFloatingCameraFit,
  mapFloatingAutoZoom: styles.mapFloatingAutoZoom,
  mapLegend: styles.mapLegend,
};

const MAP_MARKER_CLASS_NAMES: MapMarkerClassNames = {
  mapMarker: styles.mapMarker,
  mapGhostDot: styles.mapGhostDot,
  mapSpotMarker: styles.mapSpotMarker,
  mapMultiStratumMarker: styles.mapMultiStratumMarker,
  mapSuggestionMarker: styles.mapSuggestionMarker,
  mapRouteMarker: styles.mapRouteMarker,
  mapMarkerIcon: styles.mapMarkerIcon,
  mapSpotType: styles.mapSpotType,
  mapSuggestionType: styles.mapSuggestionType,
  mapMarkerEyebrow: styles.mapMarkerEyebrow,
  mapSpotNumber: styles.mapSpotNumber,
  mapSuggestionEyebrow: styles.mapSuggestionEyebrow,
  mapMarkerLabel: styles.mapMarkerLabel,
  mapSuggestionLabel: styles.mapSuggestionLabel,
  mapMultiStratumBadge: styles.mapMultiStratumBadge,
  mapProvenanceOriginMarker: styles.mapProvenanceOriginMarker,
  mapOriginBadge: styles.mapOriginBadge,
  mapFocusedOriginMarker: styles.mapFocusedOriginMarker,
};

export const AtlasMap = memo(function AtlasMap({
  spots,
  suggestions,
  selectedSpotId,
  highlightedSpotIds,
  hoveredSpotIds,
  hoveredSuggestionIds,
  scene,
  selectedSuggestion,
  suggestionStatuses,
  suggestionsVisible: suggestionsVisibleProp,
  recognitionLens,
  explorationMode = "lens",
  selectedLensLabel,
  topicScope,
  spatialOverlay,
  stratumCountBySpotId,
  natureFilter: natureFilterProp,
  onNatureFilterChange: onNatureFilterChangeProp,
  activeArtifactOverlay: activeArtifactOverlayProp,
  onActiveArtifactOverlayChange,
  children,

  onSelectLensEntity,
  onSelectRecognitionLens,
  onClearMapConnection,
  onSelectMapConnection,
  onSelectSpot,
  onSelectSuggestion,
  onHoverSpot,
  onHoverSuggestion,
  onToggleSuggestionsVisible,
  onClearFocus,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  selectedSpotId: string;
  highlightedSpotIds: string[];
  hoveredSpotIds?: readonly string[];
  hoveredSuggestionIds?: readonly string[];
  scene: MapSceneProjection;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestionStatuses?: Record<string, ExplorationSuggestionStatus>;
  suggestionsVisible?: boolean;
  recognitionLens: string;
  explorationMode?: "lens" | "stratum";
  selectedLensLabel?: string;
  topicScope?: TopicMapScope | null;
  spatialOverlay?: LensSpatialOverlay;
  stratumCountBySpotId?: ReadonlyMap<string, number>;
  natureFilter?: MapNatureFilter;
  onNatureFilterChange?: (filter: MapNatureFilter) => void;
  activeArtifactOverlay?: ArtifactOverlayId;
  onActiveArtifactOverlayChange?: (overlayId: ArtifactOverlayId) => void;
  children?: React.ReactNode;

  onSelectLensEntity: (entityId: string) => void;
  onSelectRecognitionLens: (lensId: string, topicId?: string, nodeId?: string) => void;
  onClearMapConnection: () => void;
  onSelectMapConnection: (connection: MapConnectionProjection) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onHoverSpot?: (spotId: string | null) => void;
  onHoverSuggestion?: (suggestionId: string | null) => void;
  onToggleSuggestionsVisible?: (visible: boolean) => void;
  onClearFocus?: () => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const isMapMovingRef = useRef(false);
  const hoveredIdsSetRef = useRef<Set<string>>(new Set());

  const [mapRevision, setMapRevision] = useState(0);
  const [settledViewport, setSettledViewport] = useState<{
    zoom: number;
    bounds: MapViewportBounds;
  } | null>(null);
  const [tileError, setTileError] = useState(false);

  const paleo = usePaleoLayer({ map: mapRef.current, mapRevision });

  const [internalArtifactOverlay, setInternalArtifactOverlay] = useState<ArtifactOverlayId>("none");
  const activeArtifactOverlay = activeArtifactOverlayProp ?? internalArtifactOverlay;
  const [selectedArtifactSiteId, setSelectedArtifactSiteId] = useState<string | null>(null);
  const handleArtifactOverlayChange = (val: ArtifactOverlayId) => {
    setInternalArtifactOverlay(val);
    setSelectedArtifactSiteId(null);
    onActiveArtifactOverlayChange?.(val);
  };
  const isArtifactOverlayActive = activeArtifactOverlay !== "none";
  const artifactLegendScene = useMemo(
    () => projectArtifactOverlay(activeArtifactOverlay, null),
    [activeArtifactOverlay],
  );

  const [internalSuggestionsVisible, setInternalSuggestionsVisible] = useState(true);
  const suggestionsVisible = suggestionsVisibleProp ?? internalSuggestionsVisible;
  const handleToggleSuggestions = useCallback(
    (visible: boolean) => {
      setInternalSuggestionsVisible(visible);
      onToggleSuggestionsVisible?.(visible);
    },
    [onToggleSuggestionsVisible],
  );
  const ensureSuggestionsVisible = useCallback(() => handleToggleSuggestions(true), [handleToggleSuggestions]);

  const [internalNatureFilter, setInternalNatureFilter] = useState<MapNatureFilter>("all");
  const natureFilter = natureFilterProp ?? internalNatureFilter;
  const handleNatureFilterChange = (filter: MapNatureFilter) => {
    setInternalNatureFilter(filter);
    onNatureFilterChangeProp?.(filter);
  };

  const natureCounts = useMemo(() => {
    const all = spots.length;
    let ancient_only = 0;
    let sacred_only = 0;
    let museums_only = 0;
    let candidates_only = 0;

    for (const spot of spots) {
      const nature = resolveSpotEpistemicNature(spot);
      if (spotMatchesNatureFilter(nature, "ancient_only")) ancient_only++;
      if (spotMatchesNatureFilter(nature, "sacred_only")) sacred_only++;
      if (spotMatchesNatureFilter(nature, "museums_only")) museums_only++;
      if (spotMatchesNatureFilter(nature, "candidates_only")) candidates_only++;
    }

    return { all, ancient_only, sacred_only, museums_only, candidates_only };
  }, [spots]);

  const { camera, connections: mapConnections, diagnostics, viewportPoints } = scene;
  const focusedViewport = viewportPoints.length > 0;

  const {
    autoCameraZoom,
    locatingStatus,
    locatingMessage,
    setLocatingMessage,
    userLocation,
    handleToggleAutoCameraZoom,
    handleFitCamera,
    handlePanToPoint,
    handleLocateCurrentPosition,
    clearLastPannedTarget,
    cleanupUserLocationMarker,
  } = useMapCameraControls({
    mapRef,
    mapRevision,
    camera,
    viewportPoints,
    spots,
    userLocationMarkerClassName: styles.mapUserLocationMarker,
  });

  const onSelectSpotRef = useRef(onSelectSpot);
  const onSelectSuggestionRef = useRef(onSelectSuggestion);
  const onHoverSpotRef = useRef(onHoverSpot);
  const onHoverSuggestionRef = useRef(onHoverSuggestion);
  const onSelectLensEntityRef = useRef(onSelectLensEntity);
  const onSelectMapConnectionRef = useRef(onSelectMapConnection);
  const onClearFocusRef = useRef(onClearFocus);
  useEffect(() => {
    onSelectSpotRef.current = onSelectSpot;
    onSelectSuggestionRef.current = onSelectSuggestion;
    onHoverSpotRef.current = onHoverSpot;
    onHoverSuggestionRef.current = onHoverSuggestion;
    onSelectLensEntityRef.current = onSelectLensEntity;
    onSelectMapConnectionRef.current = onSelectMapConnection;
    onClearFocusRef.current = onClearFocus;
  }, [onClearFocus, onHoverSpot, onHoverSuggestion, onSelectLensEntity, onSelectMapConnection, onSelectSpot, onSelectSuggestion]);

  const fieldSearch = useMapFieldSearch({
    mapRef,
    spots,
    suggestions,
    userLocation,
    suggestionsVisible,
    onEnsureSuggestionsVisible: ensureSuggestionsVisible,
    onSelectSpotRef,
    onSelectSuggestionRef,
    onPanToPoint: handlePanToPoint,
  });

  const activeMapConnectionId = mapConnections.find((connection) => connection.selected)?.id ?? "";
  const [connectionVisibility, setConnectionVisibility] = useState<ConnectionLayerVisibility>({
    itinerary: false,
    lens: true,
  });
  const [spatialOverlayVisible, setSpatialOverlayVisible] = useState(true);
  const [spatialOverlayLabelsVisible, setSpatialOverlayLabelsVisible] = useState(true);
  const [spatialOverlayLegendExpanded, setSpatialOverlayLegendExpanded] = useState(false);

  const areaZoneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const areaZoneOverlay = useAreaZoneOverlay({
    map: mapRef.current,
    mapRevision,
    canvasRef: areaZoneCanvasRef,
    areaZones: scene.areaZones,
    visible: natureFilter === "all" && connectionVisibility.lens && recognitionLens !== "overview",
  });

  const ghostDotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ghostDotsRef = useRef<GhostDotDescriptor[]>([]);
  const ghostDotOverlay = useGhostDotOverlay({
    map: mapRef.current,
    mapRevision,
    canvasRef: ghostDotCanvasRef,
    ghostDotsRef,
    hoveredIdsSetRef,
    isMapMovingRef,
  });
  const ghostDotOverlayRef = useRef(ghostDotOverlay);
  ghostDotOverlayRef.current = ghostDotOverlay;

  const hasAreaConnections = useMemo(
    () => hasVisibleAreaConnections(mapConnections, connectionVisibility, recognitionLens),
    [mapConnections, connectionVisibility, recognitionLens],
  );

  const connectionCounts = useMemo(() => {
    let itinerary = 0;
    let lens = 0;
    for (const c of mapConnections) {
      if (c.connectionKind === "itinerary") {
        itinerary++;
      } else if (
        c.displayMode !== "focus-only" &&
        recognitionLens &&
        recognitionLens !== "overview"
      ) {
        if (connectionBelongsToLens(c, recognitionLens)) lens++;
      }
    }
    return { itinerary, lens };
  }, [mapConnections, recognitionLens]);

  const [connectionChoiceIds, setConnectionChoiceIds] = useState<string[]>([]);
  const clearConnectionChoiceIds = useCallback(() => setConnectionChoiceIds([]), []);
  const describedConnection = mapConnections.find((connection) => connection.selected);

  const { cleanupMarkers } = useMapMarkers({
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
    onClearConnectionChoiceIds: clearConnectionChoiceIds,
    classes: MAP_MARKER_CLASS_NAMES,
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
  });

  // ADR-0025 Principle 2: Meso-to-Micro drilldown from connection inspector to individual spot
  const handlePointClick = useCallback(
    (point: MapConnectionProjection["points"][number]) => {
      setConnectionChoiceIds([]);
      onClearMapConnection();
      const target = resolveConnectionPointClickTarget(point, spots, suggestions);
      if (!target) return;
      if (target.kind === "lens-entity") onSelectLensEntity(target.entityId);
      else if (target.kind === "spot") onSelectSpot(target.spotId);
      else onSelectSuggestion(target.suggestionId);
    },
    [spots, suggestions, onClearMapConnection, onSelectLensEntity, onSelectSpot, onSelectSuggestion],
  );

  const focusedAreaZone = useMemo(
    () =>
      !describedConnection && !selectedArtifactSiteId && !selectedSuggestion
        ? scene.areaZones.find((zone) => zone.isFocused)
        : undefined,
    [selectedArtifactSiteId, describedConnection, scene.areaZones, selectedSuggestion],
  );
  const focusedAreaSpots = useMemo(() => {
    if (!focusedAreaZone?.visitedSpotIds?.length) return [];
    const spotById = new Map(spots.map((s) => [s.id, s]));
    return focusedAreaZone.visitedSpotIds
      .map((id) => spotById.get(id))
      .filter((spot): spot is ReviewAtlasSpot => Boolean(spot));
  }, [focusedAreaZone, spots]);

  useEffect(() => {
    if (!fieldSearch.open && !selectedArtifactSiteId && connectionChoiceIds.length === 0 && !focusedAreaZone) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (fieldSearch.open) {
        event.preventDefault();
        fieldSearch.close();
      } else if (selectedArtifactSiteId) {
        event.preventDefault();
        setSelectedArtifactSiteId(null);
      } else if (connectionChoiceIds.length > 0) {
        event.preventDefault();
        setConnectionChoiceIds([]);
        onClearMapConnection();
      } else if (focusedAreaZone) {
        event.preventDefault();
        onClearFocusRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [fieldSearch, selectedArtifactSiteId, connectionChoiceIds.length, focusedAreaZone, onClearMapConnection]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildAtlasMapStyle(),
      center: [130.8, 33.55],
      zoom: 7,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("click", (event) => {
      const hitGhost = ghostDotOverlayRef.current.findGhostDotAtPoint(event.point);
      if (hitGhost) {
        setConnectionChoiceIds([]);
        onSelectSpotRef.current(hitGhost.id);
        return;
      }
      onClearFocusRef.current?.();
    });
    map.on("dragstart", () => {
      clearLastPannedTarget();
    });
    map.on("movestart", () => {
      isMapMovingRef.current = true;
      shellRef.current?.setAttribute("data-moving", "true");
      onHoverSpotRef.current?.(null);
      onHoverSuggestionRef.current?.(null);
    });
    const syncSettledViewport = () => {
      const b = map.getBounds();
      const nextZoom = map.getZoom();
      const nextBounds: MapViewportBounds = {
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      };
      setSettledViewport((prev) => {
        if (
          prev &&
          prev.zoom < OVERVIEW_PILL_ZOOM_THRESHOLD &&
          nextZoom < OVERVIEW_PILL_ZOOM_THRESHOLD
        ) {
          return prev;
        }
        return { zoom: nextZoom, bounds: nextBounds };
      });
    };
    map.on("moveend", () => {
      isMapMovingRef.current = false;
      shellRef.current?.removeAttribute("data-moving");
      syncSettledViewport();
    });
    map.on("error", (event: ErrorEvent) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("openstreetmap") || (message.includes("basemap") && message.includes("tile"))) {
        setTileError(true);
      }
    });
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        map.resize();
      }
    });
    observer.observe(containerRef.current);
    mapRef.current = map;
    syncSettledViewport();
    setMapRevision((revision) => revision + 1);
    return () => {
      observer.disconnect();
      cleanupUserLocationMarker();
      cleanupMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [cleanupMarkers, cleanupUserLocationMarker, clearLastPannedTarget]);

  return (
    <>
      <AtlasMapHeaderToolbar
        classes={MAP_CHROME_CLASS_NAMES}
        connectionVisibility={connectionVisibility}
        onChangeConnectionVisibility={setConnectionVisibility}
        connectionCounts={connectionCounts}
        selectedLensLabel={selectedLensLabel}
        isStratumMode={explorationMode === "stratum"}
        suggestionCount={suggestions.length}
        suggestionsVisible={suggestionsVisible}
        onToggleSuggestions={handleToggleSuggestions}
        paleoVisible={paleo.visible}
        paleoThreshold={paleo.threshold}
        onChangePaleo={(visible, threshold) => {
          if (threshold !== undefined) paleo.setThreshold(threshold);
          paleo.setVisible(visible);
        }}
        activeArtifactOverlay={activeArtifactOverlay}
        onChangeArtifactOverlay={handleArtifactOverlayChange}
        natureFilter={natureFilter}
        natureCounts={natureCounts}
        onChangeNatureFilter={handleNatureFilterChange}
      />

      <div className={styles.mapCanvas}>
        <div ref={shellRef} className={styles.mapLibreShell}>
          <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
          <canvas ref={areaZoneCanvasRef} className={styles.mapAreaZoneCanvas} aria-hidden="true" />
          <canvas ref={ghostDotCanvasRef} className={styles.mapGhostDotCanvas} aria-hidden="true" />
          <AtlasMapFloatingCameraControls
            classes={MAP_CHROME_CLASS_NAMES}
            fieldSearchOpen={fieldSearch.open}
            locatingStatus={locatingStatus}
            autoCameraZoom={autoCameraZoom}
            onToggleFieldSearch={fieldSearch.toggle}
            onLocateCurrentPosition={handleLocateCurrentPosition}
            onFitCamera={() => handleFitCamera()}
            onToggleAutoCameraZoom={handleToggleAutoCameraZoom}
          />
          {fieldSearch.open ? (
            <MapFieldSearchDrawer
              query={fieldSearch.query}
              filter={fieldSearch.filter}
              originSource={fieldSearch.originSource}
              locatingStatus={locatingStatus}
              results={fieldSearch.results}
              selectedSpotId={selectedSpotId}
              selectedSuggestionId={selectedSuggestion?.id}
              onQueryChange={fieldSearch.setQuery}
              onFilterChange={fieldSearch.setFilter}
              onRequestGps={handleLocateCurrentPosition}
              onSelectResult={fieldSearch.selectResult}
              onClose={fieldSearch.close}
            />
          ) : null}
          {locatingMessage ? (
            <div className={styles.mapLocateNotice} role="status" aria-live="polite">
              <span>{locatingMessage}</span>
              <button
                type="button"
                aria-label="通知を閉じる"
                onClick={() => setLocatingMessage(null)}
              >
                ×
              </button>
            </div>
          ) : null}
          <MapHistoricalOverlayLayer
            map={mapRef.current}
            mapRevision={mapRevision}
            spatialOverlay={spatialOverlay}
            selectedLensLabel={selectedLensLabel}
            visible={spatialOverlayVisible}
            labelsVisible={spatialOverlayLabelsVisible}
            legendExpanded={spatialOverlayLegendExpanded}
            labelClassName={styles.mapHistoricalOverlayLabel}
            sublabelClassName={styles.mapHistoricalOverlaySublabel}
            onToggleVisible={() => setSpatialOverlayVisible((prev) => !prev)}
            onToggleLabelsVisible={() => setSpatialOverlayLabelsVisible((prev) => !prev)}
            onToggleLegendExpanded={() => setSpatialOverlayLegendExpanded((prev) => !prev)}
          />
          <MapArtifactOverlayLayer
            map={mapRef.current}
            mapRevision={mapRevision}
            activeOverlayId={activeArtifactOverlay}
            selectedSiteId={selectedArtifactSiteId}
            onSelectSite={setSelectedArtifactSiteId}
          />
          <MapConnectionOverlayLayer
            map={mapRef.current}
            mapRevision={mapRevision}
            containerRef={containerRef}
            mapConnections={mapConnections}
            activeMapConnectionId={activeMapConnectionId}
            connectionVisibility={connectionVisibility}
            recognitionLens={recognitionLens}
            highlightedSpotIds={highlightedSpotIds}
            describedConnection={describedConnection}
            connectionChoiceIds={connectionChoiceIds}
            onSetConnectionChoiceIds={setConnectionChoiceIds}
            onSelectMapConnection={onSelectMapConnection}
            onClearMapConnection={onClearMapConnection}
            onPointClick={handlePointClick}
            onSelectRecognitionLens={onSelectRecognitionLens}
          />
          {focusedAreaZone ? (
            <MapAreaZoneInspector
              zone={focusedAreaZone}
              spots={focusedAreaSpots}
              onSelectSpot={onSelectSpot}
              onClose={() => onClearFocusRef.current?.()}
            />
          ) : null}
          {diagnostics.length > 0 ? <div className={styles.mapDiagnostics} title={diagnostics.map((diagnostic) => diagnostic.message).join("\n")}>MAP DATA · {diagnostics.length}件を要確認</div> : null}
          <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
          <div className={styles.mapCameraBadge} aria-label="地図の表示範囲" aria-live="polite"><span>表示範囲</span><strong>{camera.label}</strong></div>
          <AtlasMapLegend
            classes={MAP_CHROME_CLASS_NAMES}
            paleoVisible={paleo.visible}
            paleoThreshold={paleo.threshold}
            isArtifactOverlayActive={isArtifactOverlayActive}
            artifactLegendScene={artifactLegendScene}
            activeAreaZoneCount={areaZoneOverlay.activeAreaZoneCount}
            hasAreaConnections={hasAreaConnections}
            mapConnections={mapConnections}
          />
        </div>
        {children}
      </div>
    </>
  );
});

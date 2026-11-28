"use client";

import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type CSSProperties, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { decideCameraCommand, resolveFitTarget, type SceneCamera } from "@/domain/map/camera-policy";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { connectionBelongsToLens, type MapConnectionProjection } from "@/domain/map/connections";
import {
  buildFieldSearchIndex,
  searchFieldTargets,
  type FieldSearchFilter,
  type FieldSearchResultItem,
  type GeoCoordinate,
} from "@/domain/map/field-search";
import { findVisitedSpotAtScreenPoint } from "@/domain/map/hit-testing";
import { projectMapMarkers, type TopicMapScope } from "@/domain/map/markers";
import type { MapSceneProjection } from "@/domain/map/scene";
import { mapSpotCategoryDefinitions, resolveSpotEpistemicNature, spotMatchesNatureFilter, type MapNatureFilter, type SpotEpistemicNature } from "@/domain/map/spot-presentation";
import type { ExplorationSuggestionStatus, ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import { usePaleoLayer, type PaleoThreshold } from "./use-paleo-layer";
import { useAreaZoneOverlay } from "./use-area-zone-overlay";
import type { ArtifactOverlayId } from "@/domain/archaeology/artifact-overlay-types";
import { projectArtifactOverlay } from "@/domain/archaeology/artifact-projection";
import type { LensSpatialOverlay } from "@/domain/lens-packs/schema";
import {
  hasVisibleAreaConnections,
  type ConnectionLayerVisibility,
} from "./use-connection-lines";
import { AtlasConnectionLayerControl } from "./atlas-connection-layer-control";
import { MapFieldSearchDrawer } from "./map-field-search-drawer";
import { MapAreaZoneInspector } from "./map-area-zone-inspector";
import { MapHistoricalOverlayLayer } from "./map-historical-overlay-layer";
import { MapArtifactOverlayLayer } from "./map-artifact-overlay-layer";
import { MapConnectionOverlayLayer } from "./map-connection-overlay-layer";
import styles from "./atlas.module.css";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

function getAssetPath(path: string): string {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (envBasePath) {
    return `${envBasePath.replace(/\/$/, "")}${path}`;
  }
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/ResoWorld")) {
    return `/ResoWorld${path}`;
  }
  return path;
}

function mapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        attribution: tileAttribution,
      },
      hillshade: {
        type: "raster",
        tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      },
      "paleo-water-3": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-3m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-5": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-5m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-10": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-10m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-15": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-15m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-20": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-20m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-30": {
        type: "image",
        url: getAssetPath("/maps/paleo/japan-sea-level-30m.png?v=japan-levels-1"),
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
    },
    layers: [
      { id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.75, "raster-brightness-max": 0.62, "raster-contrast": 0.22 } },
      { id: "paleo-hillshade", type: "raster", source: "hillshade", layout: { visibility: "none" }, paint: { "raster-opacity": 0.32, "raster-contrast": 0.2 } },
      { id: "paleo-water-3-fill", type: "raster", source: "paleo-water-3", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-5-fill", type: "raster", source: "paleo-water-5", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-10-fill", type: "raster", source: "paleo-water-10", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-15-fill", type: "raster", source: "paleo-water-15", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-20-fill", type: "raster", source: "paleo-water-20", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-30-fill", type: "raster", source: "paleo-water-30", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
    ],
  };
}

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
  const markersMapRef = useRef<Map<string, ManagedMarker>>(new Map());
  const hoveredIdsSetRef = useRef<Set<string>>(new Set());
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapRevision, setMapRevision] = useState(0);
  const [tileError, setTileError] = useState(false);
  const [locatingStatus, setLocatingStatus] = useState<"idle" | "locating" | "located" | "error">("idle");
  const [locatingMessage, setLocatingMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);
  const [fieldSearchOpen, setFieldSearchOpen] = useState(false);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [fieldSearchFilter, setFieldSearchFilter] = useState<FieldSearchFilter>("all");
  const [mapCenterSnapshot, setMapCenterSnapshot] = useState<GeoCoordinate | null>(null);
  const fieldSearchIndex = useMemo(
    () => buildFieldSearchIndex(spots, suggestions),
    [spots, suggestions],
  );
  const fieldSearchOrigin = userLocation ?? mapCenterSnapshot;
  const fieldSearchOriginSource: "gps" | "map-center" = userLocation ? "gps" : "map-center";
  const fieldSearchResults = useMemo(() => {
    if (!fieldSearchOpen) return [];
    return searchFieldTargets(fieldSearchIndex, {
      query: fieldSearchQuery,
      filter: fieldSearchFilter,
      origin: fieldSearchOrigin,
      limit: 24,
    });
  }, [fieldSearchOpen, fieldSearchIndex, fieldSearchQuery, fieldSearchFilter, fieldSearchOrigin]);
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
  const handleToggleSuggestions = (visible: boolean) => {
    setInternalSuggestionsVisible(visible);
    onToggleSuggestionsVisible?.(visible);
  };

  const [internalNatureFilter, setInternalNatureFilter] = useState<MapNatureFilter>("all");
  const natureFilter = natureFilterProp ?? internalNatureFilter;
  const handleNatureFilterChange = (filter: MapNatureFilter) => {
    setInternalNatureFilter(filter);
    onNatureFilterChangeProp?.(filter);
  };

  const natureCounts = useMemo(() => {
    let all = spots.length;
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
  const sceneRef = useRef({ camera, viewportPoints, spots });
  sceneRef.current = { camera, viewportPoints, spots };
  const cameraKey = camera.mode === "point"
    ? `point:${camera.reason}:${camera.point.id}:${camera.point.longitude}:${camera.point.latitude}:${camera.panCamera ? "pan" : "static"}`
    : camera.mode === "bounds"
      ? `bounds:${camera.reason}:${camera.topicKey ?? ""}:${camera.maxZoom}:${camera.points.map((point) => `${point.id}:${point.longitude}:${point.latitude}`).join("|")}`
      : "none";

  const [autoCameraZoom, setAutoCameraZoom] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("resoworld.atlas.autoCameraZoom") === "true";
  });

  const handleToggleAutoCameraZoom = useCallback((enabled: boolean) => {
    setAutoCameraZoom(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("resoworld.atlas.autoCameraZoom", String(enabled));
    }
  }, []);

  // Stable identity: reads the latest scene via ref so it never retriggers effects.
  const handleFitCamera = useCallback((explicitCamera?: SceneCamera) => {
    const map = mapRef.current;
    if (!map) return;
    const { camera: latestCamera, viewportPoints: latestViewport, spots: latestSpots } = sceneRef.current;
    const cam = explicitCamera ?? latestCamera;
    const target = resolveFitTarget(cam, latestViewport, latestSpots);
    if (!target) return;
    if (target.kind === "point") {
      // Explicit user action (fit button): framing the point closely is expected.
      map.easeTo({ center: [target.longitude, target.latitude], zoom: Math.max(map.getZoom(), 11), duration: 500 });
      return;
    }
    const coordinates = target.points.map((point) => [point.longitude, point.latitude] as [number, number]);
    const bounds = coordinates.reduce(
      (result, coordinate) => result.extend(coordinate),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 72, duration: 500, maxZoom: target.maxZoom });
  }, []);

  // Pan only; zoom is left to the user.
  const handlePanToPoint = useCallback((longitude: number, latitude: number) => {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 10.5);
    map.easeTo({ center: [longitude, latitude], zoom: targetZoom, duration: 600 });
  }, []);

  // Move camera to device's current GPS position and place a current-location marker
  const handleLocateCurrentPosition = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocatingStatus("error");
      setLocatingMessage("お使いのブラウザは現在地取得に対応していません");
      return;
    }
    setLocatingStatus("locating");
    setLocatingMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        if (map) {
          if (!userLocationMarkerRef.current) {
            const el = document.createElement("div");
            el.className = styles.mapUserLocationMarker;
            el.title = "現在地";
            el.setAttribute("aria-label", "現在地");
            userLocationMarkerRef.current = new maplibregl.Marker({
              element: el,
              anchor: "center",
            })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            userLocationMarkerRef.current.setLngLat([longitude, latitude]);
          }
          map.easeTo({
            center: [longitude, latitude],
            zoom: Math.max(map.getZoom(), 13),
            duration: 650,
          });
        }
        setUserLocation({ latitude, longitude });
        setLocatingStatus("located");
        setLocatingMessage(null);
      },
      (error) => {
        setLocatingStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setLocatingMessage("位置情報の利用が許可されていません");
        } else if (error.code === error.TIMEOUT) {
          setLocatingMessage("現在地の取得がタイムアウトしました");
        } else {
          setLocatingMessage("現在地を取得できませんでした");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, []);

  const handleToggleFieldSearch = useCallback(() => {
    setFieldSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        const center = mapRef.current?.getCenter();
        if (center) {
          setMapCenterSnapshot({ latitude: center.lat, longitude: center.lng });
        }
      }
      return next;
    });
  }, []);

  const handleSelectFieldSearchResult = useCallback(
    (item: FieldSearchResultItem) => {
      if (item.kind === "visited") {
        onSelectSpotRef.current(item.id);
      } else {
        if (!suggestionsVisible) {
          setInternalSuggestionsVisible(true);
          onToggleSuggestionsVisible?.(true);
        }
        onSelectSuggestionRef.current(item.id);
      }
      handlePanToPoint(item.longitude, item.latitude);
      setFieldSearchOpen(false);
    },
    [handlePanToPoint, onToggleSuggestionsVisible, suggestionsVisible],
  );

  const isInitialLoadRef = useRef(true);
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
  const describedConnection = mapConnections.find((connection) => connection.selected);

  // ADR-0025 Principle 2: Meso-to-Micro drilldown from connection inspector to individual spot
  const handlePointClick = useCallback(
    (point: MapConnectionProjection["points"][number]) => {
      setConnectionChoiceIds([]);
      onClearMapConnection();

      if (point.spatialGranularity === "area") {
        onSelectLensEntity(point.focusEntityId ?? point.id);
        return;
      }

      const matchedSpot = spots.find(
        (s) =>
          (point.spotId && s.id === point.spotId) ||
          s.id === point.id ||
          lensEntityNamesMatch(s.name, point.label) ||
          (point.aliases && point.aliases.some((a) => lensEntityNamesMatch(a, s.name)))
      );
      if (matchedSpot) {
        onSelectSpot(matchedSpot.id);
        return;
      }

      const matchedSuggestion = suggestions.find(
        (s) =>
          s.id === point.id ||
          s.targetPlaceId === point.id ||
          s.targetName === point.label ||
          lensEntityNamesMatch(s.targetName, point.label)
      );
      if (matchedSuggestion) {
        onSelectSuggestion(matchedSuggestion.id);
        return;
      }

      if (point.focusEntityId) {
        onSelectSuggestion(point.focusEntityId);
      }
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
    if (!fieldSearchOpen && !selectedArtifactSiteId && connectionChoiceIds.length === 0 && !focusedAreaZone) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (fieldSearchOpen) {
        event.preventDefault();
        setFieldSearchOpen(false);
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
  }, [fieldSearchOpen, selectedArtifactSiteId, connectionChoiceIds.length, focusedAreaZone, onClearMapConnection]);
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: [130.8, 33.55],
      zoom: 7,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("click", () => {
      onClearFocusRef.current?.();
    });
    map.on("dragstart", () => {
      lastPannedTargetRef.current = null;
    });
    map.on("movestart", () => {
      isMapMovingRef.current = true;
      shellRef.current?.setAttribute("data-moving", "true");
      onHoverSpotRef.current?.(null);
      onHoverSuggestionRef.current?.(null);
    });
    map.on("moveend", () => {
      isMapMovingRef.current = false;
      shellRef.current?.removeAttribute("data-moving");
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
    setMapRevision((revision) => revision + 1);
    return () => {
      observer.disconnect();
      userLocationMarkerRef.current?.remove();
      userLocationMarkerRef.current = null;
      markersMapRef.current.forEach(({ marker }) => marker.remove());
      markersMapRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
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

    const currentMarkers = markersMapRef.current;
    const activeIds = new Set<string>();

    for (const marker of unifiedMarkers) {
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
      element.className = styles.mapMarker;
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
        element.classList.add(styles.mapGhostDot);
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          setConnectionChoiceIds([]);
          onSelectSpotRef.current(marker.id);
        });
      } else {
        if (marker.kind === "visited") {
          element.classList.add(styles.mapSpotMarker);
          if (marker.stratumCount !== undefined) {
            element.dataset.stratumCount = String(marker.stratumCount);
          }
          if (marker.isMultiStratum) {
            element.classList.add(styles.mapMultiStratumMarker);
          }
        }
        if (marker.kind === "suggestion") element.classList.add(styles.mapSuggestionMarker);
        if (marker.kind === "reference") element.classList.add(styles.mapRouteMarker);

        const icon = document.createElement("span");
        icon.className = styles.mapMarkerIcon;
        if (marker.kind === "visited") icon.classList.add(styles.mapSpotType);
        if (marker.kind === "suggestion") icon.classList.add(styles.mapSuggestionType);
        icon.textContent = marker.icon;
        icon.setAttribute("aria-hidden", "true");

        let eyebrow: HTMLElement | null = null;
        if (marker.eyebrow) {
          eyebrow = document.createElement("span");
          eyebrow.className = styles.mapMarkerEyebrow;
          if (marker.kind === "visited") eyebrow.classList.add(styles.mapSpotNumber);
          if (marker.kind === "suggestion") eyebrow.classList.add(styles.mapSuggestionEyebrow);
          eyebrow.textContent = marker.eyebrow;
        }

        const label = document.createElement("strong");
        label.className = styles.mapMarkerLabel;
        if (marker.kind === "suggestion") label.classList.add(styles.mapSuggestionLabel);
        label.textContent = marker.label;

        if (eyebrow) {
          element.append(icon, eyebrow, label);
        } else {
          element.append(icon, label);
        }

        if (marker.isMultiStratum && marker.stratumCount) {
          const stratumBadge = document.createElement("span");
          stratumBadge.className = styles.mapMultiStratumBadge;
          stratumBadge.textContent = `${marker.stratumCount}層`;
          stratumBadge.title = `累重する${marker.stratumCount}の時代地層を宿す重層聖域`;
          element.append(stratumBadge);
        }

        // 産地地点バッジ（Provenance Origin Badge）の付与
        if (marker.isProvenanceOrigin && marker.provenanceBadgeText) {
          element.classList.add(styles.mapProvenanceOriginMarker);
          element.dataset.origin = "true";

          const originBadge = document.createElement("span");
          originBadge.className = styles.mapOriginBadge;
          originBadge.textContent = marker.provenanceBadgeText;
          originBadge.title = `鉱物・物質文化の主要原産地・工房（${marker.provenanceMaterial ?? ""}）`;
          element.append(originBadge);
        }

        // 選択・フォーカス中の産地強調（脈動オーラ）
        if (marker.isProvenanceOrigin && (marker.isOriginEmphasized || marker.isActive)) {
          element.classList.add(styles.mapFocusedOriginMarker);
          element.dataset.focusedOrigin = "true";
        }

        element.addEventListener("click", (event) => {
          event.stopPropagation();
          setConnectionChoiceIds([]);
          if (marker.kind === "visited") {
            const boxes = [...containerRef.current!.querySelectorAll<HTMLElement>(`.${styles.mapMarker}[data-kind="visited"]`)].flatMap((candidate) => {
              const id = candidate.dataset.markerId;
              if (!id) return [];
              const bounds = candidate.getBoundingClientRect();
              return [{ id, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }];
            });
            onSelectSpotRef.current(findVisitedSpotAtScreenPoint(boxes, { x: event.clientX, y: event.clientY }) ?? marker.id);
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
  }, [activeArtifactOverlay, activeMapConnectionId, focusedViewport, highlightedSpotIds, mapConnections, mapRevision, natureFilter, recognitionLens, selectedSpotId, selectedSuggestion, spots, stratumCountBySpotId, suggestions, suggestionsVisible, suggestionStatuses, topicScope]);

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
  }, [hoveredSpotIds, hoveredSuggestionIds, mapRevision]);

  const lastPannedTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;

    const { command, nextPannedKey } = decideCameraCommand({
      camera,
      isInitial: isInitialLoadRef.current,
      autoZoom: autoCameraZoom,
      lastPannedKey: lastPannedTargetRef.current,
    });

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
    lastPannedTargetRef.current = nextPannedKey;

    if (command.type === "fit") {
      handleFitCamera(camera);
    } else if (command.type === "pan") {
      handlePanToPoint(command.longitude, command.latitude);
    }
  }, [cameraKey, mapRevision, autoCameraZoom, handleFitCamera, handlePanToPoint]);

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderTitle}>
          <span className={styles.panelIndex}>MAP</span>
          <h1>訪問スポット</h1>
        </div>
        <div className={styles.mapHeaderToolbar} aria-label="地図ツールバー">
          <AtlasConnectionLayerControl
            visibility={connectionVisibility}
            onChange={setConnectionVisibility}
            itineraryCount={connectionCounts.itinerary}
            lensCount={connectionCounts.lens}
            selectedLensLabel={selectedLensLabel}
            isStratumMode={explorationMode === "stratum"}
          />

          {suggestions.length > 0 ? (
            <button
              type="button"
              className={styles.connectionLayerButton}
              data-variant="suggestion"
              data-active={suggestionsVisible}
              onClick={() => handleToggleSuggestions(!suggestionsVisible)}
              title="探索候補ピンの表示・非表示を切り替えます"
            >
              <span className={styles.layerDotSuggestion}>⚑</span>
              <span>探索候補</span>
              <small>{suggestions.length}</small>
            </button>
          ) : null}

          <span className={styles.mapHeaderDivider} />

          <div className={styles.mapHeaderPaleoGroup} data-active={paleo.visible}>
            <label className={styles.mapHeaderPaleoLabel} htmlFor="paleo-threshold-select">
              <span aria-hidden="true">🌊</span>
              <span>古地形:</span>
            </label>
            <select
              id="paleo-threshold-select"
              aria-label="古地形（仮想海水準）"
              className={styles.mapHeaderPaleoSelect}
              value={paleo.visible ? String(paleo.threshold) : "off"}
              onChange={(event) => {
                const val = event.target.value;
                if (val === "off") {
                  paleo.setVisible(false);
                } else {
                  paleo.setThreshold(Number(val) as PaleoThreshold);
                  paleo.setVisible(true);
                }
              }}
              title="仮想海抜を上げて縄文・弥生期の古地形や沿岸ラインを比較表示します"
            >
              <option value="off">オフ (現代水準)</option>
              <option value="3">+3m (弥生海進 / 沿岸低地)</option>
              <option value="5">+5m (縄文海進 / 湾入)</option>
              <option value="10">+10m</option>
              <option value="15">+15m</option>
              <option value="20">+20m</option>
              <option value="30">+30m</option>
            </select>
          </div>

          <div className={styles.mapHeaderArtifactGroup} data-active={isArtifactOverlayActive}>
            <label className={styles.mapHeaderArtifactLabel} htmlFor="artifact-overlay-select">
              <span aria-hidden="true">🏺</span>
              <span>出土品:</span>
            </label>
            <select
              id="artifact-overlay-select"
              aria-label="出土遺物・物質文化分布"
              className={styles.mapHeaderArtifactSelect}
              value={activeArtifactOverlay}
              onChange={(event) => {
                const val = event.target.value as ArtifactOverlayId;
                handleArtifactOverlayChange(val);
              }}
              title="三角縁神獣鏡や弥生青銅器（銅矛・銅鐸・銅剣）の出土分布・数量バブルを地図にオーバーレイ表示します"
            >
              <option value="none">オフ</option>
              <option value="sankakubuchi-mirrors">🪞 三角縁神獣鏡（面数バブル）</option>
              <option value="yayoi-bronze-weapons-bells">🔔⚔️ 弥生青銅器（銅矛・銅鐸・銅剣）</option>
              <option value="jade-and-jasper">💎 翡翠・碧玉（威信財と超遠隔交易）</option>
              <option value="cinnabar-red-pigments">🔴 赤の塗料（水銀朱・辰砂 vs ベンガラ）</option>
              <option value="kofun-typology">🏯 古墳の類型（前方後円・四隅突出等）</option>
            </select>
          </div>



          <div className={styles.mapHeaderFilterGroup} data-active={natureFilter !== "all"}>
            <label className={styles.mapHeaderFilterLabel} htmlFor="nature-filter-select">
              <span aria-hidden="true">🏛️</span>
              <span>地層/性格:</span>
            </label>
            <select
              id="nature-filter-select"
              aria-label="スポットの歴史的性格・地層フィルタ"
              className={styles.mapHeaderFilterSelect}
              value={natureFilter}
              onChange={(event) => handleNatureFilterChange(event.target.value as MapNatureFilter)}
              title="古層聖域、現代宗教景観、資料館などの性格でスポットを絞り込みます"
            >
              <option value="all">すべて ({natureCounts.all})</option>
              <option value="ancient_only">古層・古代遺跡のみ ({natureCounts.ancient_only})</option>
              <option value="sacred_only">聖域景観 ({natureCounts.sacred_only})</option>
              <option value="museums_only">資料館・展示施設 ({natureCounts.museums_only})</option>
              {natureCounts.candidates_only > 0 ? (
                <option value="candidates_only">未訪問候補地 ({natureCounts.candidates_only})</option>
              ) : null}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.mapCanvas}>
        <div ref={shellRef} className={styles.mapLibreShell}>
          <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
          <canvas ref={areaZoneCanvasRef} className={styles.mapAreaZoneCanvas} aria-hidden="true" />
          <div className={styles.mapFloatingCameraControls}>
            <button
              type="button"
              className={styles.mapFloatingSearchBtn}
              data-active={fieldSearchOpen}
              aria-expanded={fieldSearchOpen}
              aria-label="スポット・周辺を検索"
              onClick={handleToggleFieldSearch}
              title="スポット名で検索、または現在地・地図中心の周辺スポットを近い順に表示します"
            >
              <span aria-hidden="true">🔍</span>
              <span>探す</span>
            </button>
            <button
              type="button"
              className={styles.mapFloatingLocateBtn}
              data-status={locatingStatus}
              disabled={locatingStatus === "locating"}
              onClick={handleLocateCurrentPosition}
              title="スマホ・端末のGPS現在地へカメラを移動します"
            >
              <span aria-hidden="true">◎</span>
              <span>
                {locatingStatus === "locating"
                  ? "取得中…"
                  : locatingStatus === "located"
                    ? "現在地"
                    : "現在地へ"}
              </span>
            </button>
            <button
              type="button"
              className={styles.mapFloatingCameraFit}
              onClick={() => handleFitCamera()}
              title="現在のトピックまたは選択地点にカメラを合わせる"
            >
              <span aria-hidden="true">⛶</span> 全体を表示
            </button>
            <label
              className={styles.mapFloatingAutoZoom}
              data-active={autoCameraZoom}
              title="地点やトピック選択時にカメラを自動でズーム追従させるか切り替えます（OFF時は手動操作・現在の縮尺を維持）"
            >
              <input
                type="checkbox"
                checked={autoCameraZoom}
                onChange={(event) => handleToggleAutoCameraZoom(event.target.checked)}
              />
              <span>自動ズーム</span>
            </label>
          </div>
          {fieldSearchOpen ? (
            <MapFieldSearchDrawer
              query={fieldSearchQuery}
              filter={fieldSearchFilter}
              originSource={fieldSearchOriginSource}
              locatingStatus={locatingStatus}
              results={fieldSearchResults}
              selectedSpotId={selectedSpotId}
              selectedSuggestionId={selectedSuggestion?.id}
              onQueryChange={setFieldSearchQuery}
              onFilterChange={setFieldSearchFilter}
              onRequestGps={handleLocateCurrentPosition}
              onSelectResult={handleSelectFieldSearchResult}
              onClose={() => setFieldSearchOpen(false)}
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
      <div className={styles.mapLegend} aria-label="地図の地点状態">
        {paleo.visible ? <span><i data-kind="paleo-water" />仮想水域（+{paleo.threshold}m）</span> : null}
        {isArtifactOverlayActive && artifactLegendScene.legend.length > 0 ? (
          <>
            <span style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "8px", color: "#c084fc", fontWeight: 600 }}>
              {artifactLegendScene.definition?.icon} {artifactLegendScene.definition?.shortLabel}:
            </span>
            {artifactLegendScene.legend.map((item) => (
              <span key={item.label} title={item.description}>
                <i style={{ "--legend-color": item.color } as CSSProperties}>●</i>
                {item.label}
              </span>
            ))}
          </>
        ) : null}
        <span><i data-kind="selected" />選択中</span>
        <span><i data-category="ancient" style={{ "--legend-color": "#f0cf80" } as CSSProperties}>古</i>古層継承</span>
        <span><i data-category="tradition" style={{ "--legend-color": "#e2a866" } as CSSProperties}>伝</i>古層伝承地</span>
        <span><i data-category="modern" style={{ "--legend-color": "#b388ff" } as CSSProperties}>新</i>現代宗教</span>
        <span><i data-category="museum" style={{ "--legend-color": "#4fc3f7" } as CSSProperties}>館</i>学術展示</span>
        <span><i data-category="candidate" style={{ "--legend-color": "#ffb74d", borderStyle: "dashed" } as CSSProperties}>候</i>未訪問候補</span>
        {areaZoneOverlay.activeAreaZoneCount > 0 ? (
          <span><i data-kind="area-zone" />広域エリア</span>
        ) : null}
        {hasAreaConnections ? (
          <span><i data-kind="hull" />勢力圏・領域</span>
        ) : null}
        {mapConnections.some((c) => c.displayMode === "focus-only") ? (
          <span><i data-kind="focus-aura" />比較地点</span>
        ) : null}
      </div>
    </div>
    {children}
  </div>
</>
  );
});

"use client";

import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { type CSSProperties, type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapConnectionProjection } from "@/domain/map/connections";
import { findVisitedSpotAtScreenPoint } from "@/domain/map/hit-testing";
import { projectMapMarkers, type TopicMapScope } from "@/domain/map/markers";
import type { MapSceneProjection } from "@/domain/map/scene";
import { mapSpotCategoryDefinitions } from "@/domain/map/spot-presentation";
import type { ExplorationSuggestionStatus, ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import { usePaleoLayer, type PaleoThreshold } from "./use-paleo-layer";
import { useConnectionLines, type ConnectionLayerVisibility } from "./use-connection-lines";
import { AtlasConnectionLayerControl } from "./atlas-connection-layer-control";
import styles from "./atlas.module.css";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

const connectionKindLabels: Record<MapConnectionProjection["connectionKind"], string> = {
  documented: "記録に基づく接続",
  comparative: "比較による接続",
  interpretive: "解釈による接続",
  itinerary: "訪問順・移動",
  knowledge: "外部Knowledge",
  suggestion: "次の探索候補",
};
const relationFamilyLabels: Record<string, string> = {
  genealogy: "系譜", succession: "継承", route: "経路", identification: "比定",
  "textual-attestation": "史料記載", "historical-context": "歴史的背景", influence: "影響",
  syncretism: "習合", classification: "分類", "conceptual-comparison": "概念比較",
  ritual: "祭祀", enshrinement: "祭神", association: "関連",
};
const confidenceLabels: Record<string, string> = {
  high: "確度 高", medium: "確度 中", low: "確度 低", disputed: "異説あり", "not-rated": "確度未評価",
};

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

function mapEvidenceLabel(connection: MapConnectionProjection) {
  const origin = connection.origin === "exploration"
    ? "旅行記"
    : connection.origin === "knowledge-pack"
      ? "Knowledge Pack"
      : "探索候補";
  const evidence = connection.claimIds.length > 0
    ? `${connection.claimIds.length}件のClaim`
    : `${connection.assertionIds.length}件のAssertion · ${connection.sourceIds.length}件のSource`;
  const status = connection.reviewStatus === "reviewed"
    ? "確認済み"
    : connection.reviewStatus === "draft"
      ? "Draft"
      : "派生表示";
  return `${origin} · ${evidence} · ${status}`;
}

export function AtlasMap({
  spots,
  suggestions,
  selectedSpotId,
  highlightedSpotIds,
  scene,
  selectedSuggestion,
  suggestionStatuses,
  suggestionsVisible: suggestionsVisibleProp,
  recognitionLens,
  selectedJourneyId,
  selectedLensLabel,
  topicScope,
  children,

  onSelectLensEntity,
  onSelectRecognitionLens,
  onClearMapConnection,
  onSelectMapConnection,
  onSelectSpot,
  onSelectSuggestion,
  onToggleSuggestionsVisible,
  onClearFocus,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  selectedSpotId: string;
  highlightedSpotIds: string[];
  scene: MapSceneProjection;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestionStatuses?: Record<string, ExplorationSuggestionStatus>;
  suggestionsVisible?: boolean;
  recognitionLens: string;
  selectedJourneyId?: string;
  selectedLensLabel?: string;
  topicScope?: TopicMapScope | null;
  children?: React.ReactNode;

  onSelectLensEntity: (entityId: string) => void;
  onSelectRecognitionLens: (lensId: string, topicId?: string, nodeId?: string) => void;
  onClearMapConnection: () => void;
  onSelectMapConnection: (connection: MapConnectionProjection) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onToggleSuggestionsVisible?: (visible: boolean) => void;
  onClearFocus?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapRevision, setMapRevision] = useState(0);
  const [tileError, setTileError] = useState(false);
  const paleo = usePaleoLayer({ map: mapRef.current, mapRevision });
  const [internalSuggestionsVisible, setInternalSuggestionsVisible] = useState(true);
  const suggestionsVisible = suggestionsVisibleProp ?? internalSuggestionsVisible;
  const handleToggleSuggestions = (visible: boolean) => {
    setInternalSuggestionsVisible(visible);
    onToggleSuggestionsVisible?.(visible);
  };

  const { camera, connections: mapConnections, diagnostics, viewportPoints } = scene;
  const focusedViewport = viewportPoints.length > 0;
  const cameraRef = useRef(camera);
  const cameraKey = camera.mode === "point"
    ? `point:${camera.reason}:${camera.point.id}:${camera.point.longitude}:${camera.point.latitude}:${"panCamera" in camera && camera.panCamera ? "pan" : "nopanim"}`
    : camera.mode === "bounds"
      ? `bounds:${camera.reason}:${camera.maxZoom}:${camera.points.map((point) => `${point.id}:${point.longitude}:${point.latitude}`).join("|")}`
      : "none";
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

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

  const handleFitCamera = useCallback(() => {
    if (!mapRef.current) return;
    const nextCamera = cameraRef.current;
    if (nextCamera.mode === "point") {
      mapRef.current.easeTo({
        center: [nextCamera.point.longitude, nextCamera.point.latitude],
        duration: 500,
      });
      return;
    }
    const pointsToFit = nextCamera.mode === "bounds" && nextCamera.points.length > 0
      ? nextCamera.points
      : viewportPoints.length > 0
        ? viewportPoints
        : spots.length > 0
          ? spots.map((s) => ({ id: s.id, longitude: s.longitude, latitude: s.latitude }))
          : [];
    if (pointsToFit.length > 0) {
      const coordinates = pointsToFit.map((point) => [point.longitude, point.latitude] as [number, number]);
      const bounds = coordinates.reduce(
        (result, coordinate) => result.extend(coordinate),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
      );
      const maxZoom = nextCamera.mode === "bounds" ? nextCamera.maxZoom : 9;
      mapRef.current.fitBounds(bounds, { padding: 72, duration: 500, maxZoom });
    }
  }, [spots, viewportPoints]);

  const handlePanToPoint = useCallback((longitude: number, latitude: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: [longitude, latitude],
      duration: 500,
    });
  }, []);

  const isInitialLoadRef = useRef(true);
  const activeMapConnectionId = mapConnections.find((connection) => connection.selected)?.id ?? "";
  const [connectionVisibility, setConnectionVisibility] = useState<ConnectionLayerVisibility>({
    itinerary: false,
    lens: true,
  });

  const { renderableLines } = useConnectionLines({
    map: mapRef.current,
    mapRevision,
    connections: mapConnections,
    activeConnectionId: activeMapConnectionId,
    visibility: connectionVisibility,
    recognitionLens,
  });

  const connectionCounts = useMemo(() => {
    let itinerary = 0;
    let lens = 0;
    for (const c of mapConnections) {
      if (c.connectionKind === "itinerary") {
        itinerary++;
      } else if (recognitionLens && recognitionLens !== "overview") {
        const lensId = c.lensId;
        const matches =
          (recognitionLens === "mythology" && lensId === "mythology") ||
          (recognitionLens === "route" && lensId === "route") ||
          (recognitionLens === "people" && (lensId === "people" || (c.lensRefs?.some((r) => r.lensId === "people")))) ||
          (recognitionLens === "politics" && (lensId === "politics" || (c.lensRefs?.some((r) => r.lensId === "politics")))) ||
          (recognitionLens === "religion" && lensId === "religion");
        if (matches) lens++;
      }
    }
    return { itinerary, lens };
  }, [mapConnections, recognitionLens]);
  const [connectionChoiceIds, setConnectionChoiceIds] = useState<string[]>([]);
  const describedConnection = mapConnections.find((connection) => connection.selected);
  const onSelectSpotRef = useRef(onSelectSpot);
  const onSelectSuggestionRef = useRef(onSelectSuggestion);
  const onSelectLensEntityRef = useRef(onSelectLensEntity);
  const onSelectMapConnectionRef = useRef(onSelectMapConnection);
  const onClearFocusRef = useRef(onClearFocus);
  useEffect(() => {
    onSelectSpotRef.current = onSelectSpot;
    onSelectSuggestionRef.current = onSelectSuggestion;
    onSelectLensEntityRef.current = onSelectLensEntity;
    onSelectMapConnectionRef.current = onSelectMapConnection;
    onClearFocusRef.current = onClearFocus;
  }, [onClearFocus, onSelectLensEntity, onSelectMapConnection, onSelectSpot, onSelectSuggestion]);

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
    map.on("error", (event: ErrorEvent) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("openstreetmap") || (message.includes("basemap") && message.includes("tile"))) {
        setTileError(true);
      }
    });
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    mapRef.current = map;
    setMapRevision((revision) => revision + 1);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);


  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

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
    });

    for (const marker of unifiedMarkers) {
      if (!marker.isVisible) continue;
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
      if (marker.isGhost) {
        element.dataset.ghost = "true";
        element.classList.add(styles.mapGhostDot);
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          setConnectionChoiceIds([]);
          onSelectSpotRef.current(marker.id);
        });
      } else {
        if (marker.kind === "visited") element.classList.add(styles.mapSpotMarker);
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
          } else if (marker.kind === "suggestion" || marker.kind === "reference") {
            onSelectSuggestionRef.current(marker.id);
          }
        });
      }

      const anchor = marker.isGhost ? "center" : "bottom";
      markersRef.current.push(new maplibregl.Marker({ element, anchor }).setLngLat([marker.longitude, marker.latitude]).addTo(mapRef.current!));
    }
  }, [activeMapConnectionId, focusedViewport, highlightedSpotIds, mapConnections, mapRevision, recognitionLens, selectedSpotId, selectedSuggestion, spots, suggestions, suggestionsVisible, suggestionStatuses, topicScope]);

  const lastPannedTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      handleFitCamera();
      return;
    }

    const currentCamera = cameraRef.current;

    // Only pan the camera when explicitly requested from LENS (camera.mode === "point" && camera.panCamera).
    // When selected on the MAP itself (panCamera is false/falsy), the camera MUST NOT move or zoom.
    // Use lastPannedTargetRef to guarantee this pan happens AT MOST ONCE per node selection,
    // and never re-triggers when inspectors open/close, layers toggle, or re-renders occur.
    if (currentCamera.mode === "point") {
      if ("panCamera" in currentCamera && currentCamera.panCamera) {
        const targetKey = `${currentCamera.point.id}:${currentCamera.point.longitude}:${currentCamera.point.latitude}`;
        if (lastPannedTargetRef.current !== targetKey) {
          lastPannedTargetRef.current = targetKey;
          handlePanToPoint(currentCamera.point.longitude, currentCamera.point.latitude);
        }
      }
      return;
    }

    // Reset one-shot target ref when camera is not in point mode with panCamera
    lastPannedTargetRef.current = null;

    if (!autoCameraZoom) return;
    if (currentCamera.mode === "bounds") {
      handleFitCamera();
    }
  }, [cameraKey, mapRevision, autoCameraZoom, handleFitCamera, handlePanToPoint]);

  return (
    <>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>MAP</span>
          <h1>訪問スポット</h1>
        </div>
        <div className={styles.mapHeaderToolbar} aria-label="地図ツールバー">
          <label
            className={styles.cameraAutoZoomLabel}
            data-active={autoCameraZoom}
            title="地点やトピック選択時にカメラを自動でズーム追従させるか切り替えます（OFF時は手動操作・現在の縮尺を維持）"
          >
            <input
              type="checkbox"
              checked={autoCameraZoom}
              onChange={(event) => handleToggleAutoCameraZoom(event.target.checked)}
            />
            自動ズーム
          </label>

          <span className={styles.mapHeaderDivider} />

          <AtlasConnectionLayerControl
            visibility={connectionVisibility}
            onChange={setConnectionVisibility}
            itineraryCount={connectionCounts.itinerary}
            lensCount={connectionCounts.lens}
            selectedLensLabel={selectedLensLabel}
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
            <label className={styles.mapHeaderPaleoLabel} title="仮想海抜を上げて縄文・弥生期の古地形や沿岸ラインを比較表示します">
              <input
                type="checkbox"
                checked={paleo.visible}
                onChange={(event) => paleo.setVisible(event.target.checked)}
              />
              古地形
            </label>
            {paleo.visible ? (
              <select
                aria-label="仮想海抜"
                className={styles.mapHeaderPaleoSelect}
                value={paleo.threshold}
                onChange={(event) => paleo.setThreshold(Number(event.target.value) as PaleoThreshold)}
              >
                <option value={3}>+3m</option>
                <option value={5}>+5m</option>
                <option value={10}>+10m</option>
                <option value={15}>+15m</option>
                <option value={20}>+20m</option>
                <option value={30}>+30m</option>
              </select>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.mapCanvas}>
        <div className={styles.mapLibreShell}>
          <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
          <button
            type="button"
            className={styles.mapFloatingCameraFit}
            onClick={handleFitCamera}
            title="現在のトピックまたは選択地点にカメラを合わせる"
          >
            <span aria-hidden="true">⛶</span> 全体を表示
          </button>
      <svg className={styles.mapConnectionOverlay} aria-label="地図上の接続線">
        {renderableLines.map(({ id, connection, selected, emphasized, origin, lensCategory, segments, lineStyle, haloStyle }) => {
          const openMapConnection = (event?: ReactMouseEvent<SVGElement>) => {
            if (event) {
              // 1. Direct hit check: if any marker element was clicked, trigger that marker directly
              if (typeof document !== "undefined") {
                const elements = document.elementsFromPoint(event.clientX, event.clientY);
                const hitMarker = elements
                  .map((el) => (el.classList.contains(styles.mapMarker) ? el : el.closest<HTMLElement>(`.${styles.mapMarker}`)))
                  .find((el): el is HTMLElement => Boolean(el));
                if (hitMarker) {
                  hitMarker.click();
                  return;
                }
              }

              // 2. Tolerance bounding-box check: if click is within bounding box of any marker (with 8px padding)
              if (containerRef.current) {
                const allMarkers = [...containerRef.current.querySelectorAll<HTMLElement>(`.${styles.mapMarker}`)];
                for (const markerEl of allMarkers) {
                  const rect = markerEl.getBoundingClientRect();
                  if (
                    event.clientX >= rect.left - 8 &&
                    event.clientX <= rect.right + 8 &&
                    event.clientY >= rect.top - 8 &&
                    event.clientY <= rect.bottom + 8
                  ) {
                    markerEl.click();
                    return;
                  }
                }
              }
            }

            const wasSelected = connection.selected;
            onSelectMapConnection(connection);
            setConnectionChoiceIds(wasSelected ? [] : [connection.id]);
          };

          return (
            <g
              key={id}
              className={styles.mapProjectedConnection}
              data-selected={selected}
              data-emphasized={emphasized}
              data-origin={origin}
              data-lens-category={lensCategory}
            >
              {segments.map((segment) => (
                <g key={segment.id}>
                  {segment.hitPath ? (
                    <path
                      d={segment.hitPath}
                      className={styles.mapConnectionHit}
                      role="button"
                      tabIndex={0}
                      aria-label={`${connection.title}の説明を表示`}
                      onClick={openMapConnection}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openMapConnection();
                        }
                      }}
                    />
                  ) : null}
                  <polyline
                    points={segment.points}
                    className={styles.mapConnectionHalo}
                    style={haloStyle}
                  />
                  <polyline
                    points={segment.points}
                    className={styles.mapConnectionLine}
                    style={lineStyle}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {describedConnection ? <aside className={styles.mapConnectionInfo} aria-label="接続線の説明" aria-live="polite">
        <button className={styles.mapConnectionInfoClose} type="button" aria-label="接続の説明を閉じる" onClick={() => { setConnectionChoiceIds([]); onClearMapConnection(); }}>×</button>
        <small>MAP CONNECTION</small>
        <strong>{describedConnection.title}</strong>
        <span>{mapEvidenceLabel(describedConnection)}</span>
        <div className={styles.mapConnectionMetadata}>
          <span>{connectionKindLabels[describedConnection.connectionKind]}</span>
          {describedConnection.relationFamilies.map((family) => <span key={family}>{relationFamilyLabels[family] ?? family}</span>)}
          {describedConnection.confidences.map((confidence) => <span key={confidence}>{confidenceLabels[confidence] ?? confidence}</span>)}
        </div>
        <p>{describedConnection.summary}</p>
        {describedConnection?.lensRefs.length ? <div className={styles.mapConnectionLinks}>
          <small>対応するLENS / TOPIC</small>
          {describedConnection.lensRefs.map((reference) => <button
            key={`${reference.lensId}:${reference.topicId ?? ""}`}
            type="button"
            onClick={() => onSelectRecognitionLens(reference.lensId, reference.topicId)}
          >{reference.topicLabel ?? reference.lensId}<span>LENSで見る →</span></button>)}
        </div> : describedConnection.connectionKind === "itinerary" ? <small>旅程線は移動順を示すため、LENSには割り当てません。</small> : null}
        {describedConnection?.claimIds.length ? <Link className={styles.mapConnectionEvidenceLink} href={`/review?view=graph&claim=${encodeURIComponent(describedConnection.claimIds[0])}`}>根拠のClaimを見る →</Link> : null}
        {describedConnection?.origin === "knowledge-pack" && describedConnection.lensRefs.length ? <span>{describedConnection.assertionIds.length}件のAssertionと{describedConnection.sourceIds.length}件のSourceは、対応LENSで確認できます。</span> : null}
        {describedConnection.knowledgeEvidence ? <details className={styles.mapConnectionEvidenceDetails}>
          <summary>Assertion / Sourceを確認</summary>
          <ul>
            {describedConnection.knowledgeEvidence.assertions.map((assertion) => <li key={assertion.id}>
              <strong>{assertion.subjectLabel} → {assertion.objectLabel}</strong>
              <small>{relationFamilyLabels[assertion.relationFamily] ?? assertion.predicate} · {confidenceLabels[assertion.confidence] ?? assertion.confidence} · {assertion.reviewStatus === "reviewed" ? "確認済み" : assertion.reviewStatus === "draft" ? "Draft" : "不採用"}</small>
              {assertion.note ? <p>{assertion.note}</p> : null}
            </li>)}
          </ul>
          <ul>
            {describedConnection.knowledgeEvidence.sources.map((source) => <li key={source.id}>
              <strong>{source.title}</strong>
              <small>{[source.authors.join("・"), source.publisher, source.publishedAt, source.locator].filter(Boolean).join(" / ")}</small>
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer">参照先を開く ↗</a> : null}
            </li>)}
          </ul>
        </details> : null}
        {connectionChoiceIds.length > 1 ? <div className={styles.mapConnectionChoices}>
          {connectionChoiceIds.map((id) => {
            const connection = mapConnections.find((candidate) => candidate.id === id);
            if (!connection) return null;
            return <button key={id} type="button" data-active={connection.id === activeMapConnectionId} onClick={() => {
              onSelectMapConnection(connection);
            }}>{connection.title}</button>;
          })}
        </div> : null}
      </aside> : null}
      {diagnostics.length > 0 ? <div className={styles.mapDiagnostics} title={diagnostics.map((diagnostic) => diagnostic.message).join("\n")}>MAP DATA · {diagnostics.length}件を要確認</div> : null}
      <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
      <div className={styles.mapCameraBadge} aria-label="地図の表示範囲" aria-live="polite"><span>表示範囲</span><strong>{camera.label}</strong></div>
      <div className={styles.mapLegend} aria-label="地図の地点状態">
        {paleo.visible ? <span><i data-kind="paleo-water" />仮想水域（+{paleo.threshold}m）</span> : null}
        <span><i data-kind="selected" />選択中</span>
        <span><i data-kind="visited" />訪問済み</span>
        <span><i data-kind="candidate" />候補</span>
        {mapSpotCategoryDefinitions.filter(({ id }) => id !== "other").map((category) => <span key={category.id}><i data-category={category.id} style={{ "--legend-color": category.color } as CSSProperties}>{category.icon}</i>{category.label}</span>)}
      </div>
    </div>
    {children}
  </div>
</>
  );
}

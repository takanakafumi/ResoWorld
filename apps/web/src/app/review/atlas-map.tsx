"use client";

import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";

import { projectMapReferenceMarkers, type MapConnectionProjection } from "@/domain/map/connections";
import { buildConnectionHitPath, findVisitedSpotAtScreenPoint } from "@/domain/map/hit-testing";
import type { MapSceneProjection } from "@/domain/map/scene";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

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
        url: "/maps/paleo/northern-kyushu-sea-level-3m.png?v=virtual-levels-1",
        coordinates: [[129.7265625, 34.016241889667015], [131.1328125, 34.016241889667015], [131.1328125, 32.84267363195431], [129.7265625, 32.84267363195431]],
      },
      "paleo-water-5": {
        type: "image",
        url: "/maps/paleo/northern-kyushu-sea-level-5m.png?v=virtual-levels-1",
        coordinates: [[129.7265625, 34.016241889667015], [131.1328125, 34.016241889667015], [131.1328125, 32.84267363195431], [129.7265625, 32.84267363195431]],
      },
      "paleo-water-10": {
        type: "image",
        url: "/maps/paleo/northern-kyushu-sea-level-10m.png?v=virtual-levels-1",
        coordinates: [[129.7265625, 34.016241889667015], [131.1328125, 34.016241889667015], [131.1328125, 32.84267363195431], [129.7265625, 32.84267363195431]],
      },
    },
    layers: [
      { id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.75, "raster-brightness-max": 0.62, "raster-contrast": 0.22 } },
      { id: "paleo-hillshade", type: "raster", source: "hillshade", layout: { visibility: "none" }, paint: { "raster-opacity": 0.32, "raster-contrast": 0.2 } },
      { id: "paleo-water-3-fill", type: "raster", source: "paleo-water-3", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-5-fill", type: "raster", source: "paleo-water-5", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-10-fill", type: "raster", source: "paleo-water-10", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
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
  journeyBySpotId,
  suggestions,
  selectedSpotId,
  highlightedSpotIds,
  scene,
  selectedSuggestion,
  recognitionLens,

  onSelectLensEntity,
  onSelectMapConnection,
  onSelectSpot,
  onSelectSuggestion,
}: {
  spots: ReviewAtlasSpot[];
  journeyBySpotId: Record<string, { label: string; color: string }>;
  suggestions: ReviewExplorationSuggestion[];
  selectedSpotId: string;
  highlightedSpotIds: string[];
  scene: MapSceneProjection;
  selectedSuggestion?: ReviewExplorationSuggestion;
  recognitionLens: string;

  onSelectLensEntity: (entityId: string) => void;
  onSelectMapConnection: (connection: MapConnectionProjection) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapRevision, setMapRevision] = useState(0);
  const [tileError, setTileError] = useState(false);
  const [paleoVisible, setPaleoVisible] = useState(false);
  const [paleoThreshold, setPaleoThreshold] = useState<3 | 5 | 10>(5);
  const [paleoLayerReady, setPaleoLayerReady] = useState(false);

  const { camera, connections: mapConnections, diagnostics, viewportPoints } = scene;
  const focusedViewport = viewportPoints.length > 0;
  const cameraRef = useRef(camera);
  const cameraKey = camera.mode === "point"
    ? `point:${camera.reason}:${camera.point.id}:${camera.point.longitude}:${camera.point.latitude}`
    : camera.mode === "bounds"
      ? `bounds:${camera.reason}:${camera.maxZoom}:${camera.points.map((point) => `${point.id}:${point.longitude}:${point.latitude}`).join("|")}`
      : "none";
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  const appearanceLegends = mapConnections.filter((connection) => connection.appearance?.legendLabel);
  const activeMapConnectionId = mapConnections.find((connection) => connection.selected)?.id ?? "";
  const [mapLineGeometry, setMapLineGeometry] = useState<Record<string, { points: string; hitPath: string }>>({});
  const [mapLineInfo, setMapLineInfo] = useState<{ id: string; title: string; summary: string; evidenceLabel: string; lens: string; connectionIds: string[] } | null>(null);
  const onSelectSpotRef = useRef(onSelectSpot);
  const onSelectSuggestionRef = useRef(onSelectSuggestion);
  const onSelectLensEntityRef = useRef(onSelectLensEntity);
  const onSelectMapConnectionRef = useRef(onSelectMapConnection);
  useEffect(() => {
    onSelectSpotRef.current = onSelectSpot;
    onSelectSuggestionRef.current = onSelectSuggestion;
    onSelectLensEntityRef.current = onSelectLensEntity;
    onSelectMapConnectionRef.current = onSelectMapConnection;
  }, [onSelectLensEntity, onSelectMapConnection, onSelectSpot, onSelectSuggestion]);

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
    map.on("error", (event: ErrorEvent) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("tile") || message.includes("fetch")) setTileError(true);
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
    const map = mapRef.current;
    if (!mapRevision || !map) return;
    const applyVisibility = () => {
      const waterLayerIds = ["paleo-water-3-fill", "paleo-water-5-fill", "paleo-water-10-fill"];
      const layerIds = ["paleo-hillshade", ...waterLayerIds];
      const ready = layerIds.every((id) => Boolean(map.getLayer(id))) && map.isSourceLoaded(`paleo-water-${paleoThreshold}`);
      for (const id of layerIds) {
        const visibility = paleoVisible && (id === "paleo-hillshade" || id === `paleo-water-${paleoThreshold}-fill`) ? "visible" : "none";
        if (!map.getLayer(id) || map.getLayoutProperty(id, "visibility") === visibility) continue;
        map.setLayoutProperty(id, "visibility", visibility);
      }
      setPaleoLayerReady(ready);
    };
    applyVisibility();
    map.on("styledata", applyVisibility);
    map.on("sourcedata", applyVisibility);
    return () => {
      map.off("styledata", applyVisibility);
      map.off("sourcedata", applyVisibility);
    };
  }, [mapRevision, paleoThreshold, paleoVisible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapRevision || !map) return;
    const syncMapConnections = () => {
      setMapLineGeometry(Object.fromEntries(mapConnections.map((connection) => {
        const projected = connection.points.map((point) => map.project([point.longitude, point.latitude]));
        const viewport = { width: map.getContainer().clientWidth, height: map.getContainer().clientHeight };
        return [connection.id, {
          points: projected.map(({ x, y }) => `${x},${y}`).join(" "),
          hitPath: buildConnectionHitPath(projected, 34, viewport),
        }];
      })));
    };
    map.on("move", syncMapConnections);
    map.on("resize", syncMapConnections);
    syncMapConnections();
    return () => {
      map.off("move", syncMapConnections);
      map.off("resize", syncMapConnections);
    };
  }, [mapConnections, mapRevision]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    for (const [index, spot] of spots.entries()) {
      const element = document.createElement("button");
      element.type = "button";
      element.className = styles.mapSpotMarker;
      const journey = journeyBySpotId[spot.id];
      if (journey) {
        element.dataset.journey = "true";
        element.style.setProperty("--journey-color", journey.color);
        const journeyLabel = document.createElement("em");
        journeyLabel.textContent = journey.label;
        element.append(journeyLabel);
      }
      element.dataset.active = String(spot.id === selectedSpotId);
      element.dataset.spotId = spot.id;
      element.dataset.connected = String(highlightedSpotIds.includes(spot.id));
      element.dataset.positionStatus = spot.positionStatus ?? "confirmed";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const label = document.createElement("strong");
      label.textContent = spot.name;
      element.append(number, label);
      element.addEventListener("click", () => onSelectSpotRef.current(spot.id));
      markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([spot.longitude, spot.latitude]).addTo(mapRef.current!));
    }

    for (const { id: key, point, connections } of projectMapReferenceMarkers(mapConnections, spots)) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapRouteMarker;
        element.dataset.kind = "lens";
        element.dataset.active = String(connections.some((connection) => connection.id === activeMapConnectionId));
        element.textContent = point.label;
        element.addEventListener("click", () => {
          const activeConnection = connections.find((connection) => connection.id === activeMapConnectionId);
          if (connections.length === 1 || activeConnection) {
            const connection = activeConnection ?? connections[0];
            onSelectMapConnectionRef.current(connection);
            if (recognitionLens === "route" && point.focusEntityId) {
              onSelectLensEntityRef.current(point.focusEntityId);
            }
            setMapLineInfo({ id: connection.id, title: connection.title, summary: connection.summary, evidenceLabel: mapEvidenceLabel(connection), lens: recognitionLens, connectionIds: connections.map(({ id }) => id) });
          } else {
            setMapLineInfo({ id: `reference:${key}`, title: point.label, summary: "この地点を含む接続を選ぶと、線の意味と根拠を確認できます。", evidenceLabel: `${connections.length}件の接続`, lens: recognitionLens, connectionIds: connections.map(({ id }) => id) });
          }
        });
        markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([point.longitude, point.latitude]).addTo(mapRef.current!));
    }
    if (!focusedViewport) {
      for (const suggestion of suggestions) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapSuggestionMarker;
        element.dataset.active = String(suggestion.id === selectedSuggestion?.id);
        element.title = suggestion.title;
        const eyebrow = document.createElement("span");
        eyebrow.textContent = "次の候補";
        const target = document.createElement("strong");
        target.textContent = suggestion.targetName;
        element.append(eyebrow, target);
        element.addEventListener("click", () => onSelectSuggestionRef.current(suggestion.id));
        markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([suggestion.longitude, suggestion.latitude]).addTo(mapRef.current!));
      }
    }
  }, [activeMapConnectionId, focusedViewport, highlightedSpotIds, journeyBySpotId, mapConnections, mapRevision, recognitionLens, selectedSpotId, selectedSuggestion, spots, suggestions]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    const nextCamera = cameraRef.current;
    if (nextCamera.mode === "point") {
      mapRef.current.easeTo({
        center: [nextCamera.point.longitude, nextCamera.point.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 12),
        duration: 650,
      });
      return;
    }
    if (nextCamera.mode === "bounds" && nextCamera.points.length > 0) {
      const coordinates = nextCamera.points.map((point) => [point.longitude, point.latitude] as [number, number]);
      const bounds = coordinates.reduce((result, coordinate) => result.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      mapRef.current.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: nextCamera.maxZoom });
    }
  }, [cameraKey, mapRevision]);

  return (
    <div className={styles.mapLibreShell}>
      <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
      <svg className={styles.mapConnectionOverlay} aria-label="地図上の接続線">
        {mapConnections.map((mapConnection) => {
          if (mapConnection.displayMode === "points") return null;
          const geometry = mapLineGeometry[mapConnection.id];
          if (!geometry?.points) return null;
          const selected = mapConnection.id === activeMapConnectionId;
          const openMapConnection = (event?: ReactMouseEvent<SVGElement>) => {
            if (event && containerRef.current) {
              const boxes = [...containerRef.current.querySelectorAll<HTMLElement>(`.${styles.mapSpotMarker}`)].flatMap((element) => {
                const id = element.dataset.spotId;
                if (!id) return [];
                const bounds = element.getBoundingClientRect();
                return [{ id, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }];
              });
              const spotId = findVisitedSpotAtScreenPoint(boxes, { x: event.clientX, y: event.clientY });
              if (spotId) {
                setMapLineInfo(null);
                onSelectSpot(spotId);
                return;
              }
            }
            onSelectMapConnection(mapConnection);
            setMapLineInfo({
              id: mapConnection.id,
              title: mapConnection.title,
              summary: mapConnection.summary,
              evidenceLabel: mapEvidenceLabel(mapConnection),
              lens: recognitionLens,
              connectionIds: [mapConnection.id],
            });
          };
          const lineStyle = mapConnection.appearance
            ? { stroke: mapConnection.appearance.color, strokeDasharray: mapConnection.appearance.dashArray?.join(" ") }
            : undefined;
          return <g key={mapConnection.id} className={styles.mapProjectedConnection} data-selected={selected} data-origin={mapConnection.origin}>
            {geometry.hitPath ? <path d={geometry.hitPath} className={styles.mapConnectionHit} role="button" tabIndex={0} aria-label={`${mapConnection.title}の説明を表示`} onClick={openMapConnection} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMapConnection();
              }
            }} /> : null}
            <polyline points={geometry.points} className={styles.mapConnectionHalo} style={mapConnection.appearance ? { stroke: mapConnection.appearance.color } : undefined} />
            <polyline points={geometry.points} className={styles.mapConnectionLine} style={lineStyle} />
          </g>;
        })}
      </svg>
      {mapLineInfo?.lens === recognitionLens && mapLineInfo.connectionIds.some((id) => mapConnections.some((connection) => connection.id === id)) ? <aside className={styles.mapConnectionInfo} aria-label="接続線の説明" aria-live="polite">
        <button className={styles.mapConnectionInfoClose} type="button" aria-label="接続の説明を閉じる" onClick={() => setMapLineInfo(null)}>×</button>
        <small>MAP CONNECTION</small>
        <strong>{mapLineInfo.title}</strong>
        <span>{mapLineInfo.evidenceLabel}</span>
        <p>{mapLineInfo.summary}</p>
        {mapLineInfo.connectionIds.length > 1 ? <div className={styles.mapConnectionChoices}>
          {mapLineInfo.connectionIds.map((id) => {
            const connection = mapConnections.find((candidate) => candidate.id === id);
            if (!connection) return null;
            return <button key={id} type="button" data-active={connection.id === activeMapConnectionId} onClick={() => {
              onSelectMapConnection(connection);
              setMapLineInfo({ id: connection.id, title: connection.title, summary: connection.summary, evidenceLabel: mapEvidenceLabel(connection), lens: recognitionLens, connectionIds: mapLineInfo.connectionIds });
            }}>{connection.title}</button>;
          })}
        </div> : null}
      </aside> : null}
      {diagnostics.length > 0 ? <div className={styles.mapDiagnostics} title={diagnostics.map((diagnostic) => diagnostic.message).join("\n")}>MAP DATA · {diagnostics.length}件を要確認</div> : null}
      <aside className={styles.paleoMapControl} data-active={paleoVisible}>
        <label><input type="checkbox" checked={paleoVisible} onChange={(event) => setPaleoVisible(event.target.checked)} />古地形を重ねる <small>北部九州・推定</small></label>
        {paleoVisible ? <label className={styles.paleoScenarioControl}>仮想海抜<select aria-label="仮想海抜" value={paleoThreshold} onChange={(event) => setPaleoThreshold(Number(event.target.value) as 3 | 5 | 10)}><option value={3}>+3m</option><option value={5}>+5m</option><option value={10}>+10m</option></select></label> : null}
        {paleoVisible ? <span className={styles.paleoMapStatus}>{paleoLayerReady ? "表示中" : "レイヤー準備中"}</span> : null}
        {paleoVisible ? <details><summary>この表示について</summary><p>現在DEMを選択した高さまで仮想的に水没させ、現在海域と連続する範囲を水色で示します。歴史的な海面や古海岸線の復元ではなく、堆積・地盤変動・河道変化・干拓も補正していない比較表示です。</p><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">標高・陰影：国土地理院 ↗</a></details> : null}
      </aside>
      <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
      <div className={styles.mapCameraBadge} aria-label="地図の表示範囲" aria-live="polite"><span>表示範囲</span><strong>{camera.label}</strong></div>
      <div className={styles.mapLegend}>
        {paleoVisible ? <span><i data-kind="paleo-water" />仮想水域（+{paleoThreshold}m）</span> : null}
        <span><i data-kind="selected" />選択中</span>
        <span><i data-kind="visited" />訪問済み</span>
        <span><i data-kind="candidate" />位置候補</span>
        {appearanceLegends.length > 0 ? (
          <>{appearanceLegends.map((connection) => <span key={connection.id}><i style={{ backgroundColor: connection.appearance!.color }} />{connection.appearance!.legendLabel}</span>)}</>
        ) : (
          <>
            <span>現在の探索範囲＋登録済みKnowledge</span>
            <span><i data-kind="link" />旅行記の接続</span>
            {mapConnections.some((connection) => connection.origin === "knowledge-pack") ? <span><i data-kind="candidate" />Knowledge Pack</span> : null}
            {mapConnections.some((connection) => connection.origin === "suggestion") ? <span><i data-kind="next" />次の候補</span> : null}
          </>
        )}
      </div>
    </div>
  );
}

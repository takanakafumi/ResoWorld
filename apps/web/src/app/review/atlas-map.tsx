"use client";

import type { Feature, FeatureCollection, LineString } from "geojson";
import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { MapConnectionProjection } from "@/domain/map/connections";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";

const emptyLines: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [],
};
const wajindenProjection = projectLensPreset(wajindenRoutesPack, "wajinden-comparison");
const wajindenEntityById = new Map(wajindenProjection.nodes.map((entity) => [entity.id, entity]));
const sourceRouteIds = ["guya-korea", "tsushima-state", "iki-state", "matsuro-state", "ito-state", "na-state", "fumi-state"];

function identifiedPlace(entityId: string) {
  const edge = wajindenProjection.edges.find(
    (candidate) => candidate.subjectId === entityId && candidate.relationFamily === "identification",
  );
  return edge ? wajindenEntityById.get(edge.objectId) : undefined;
}

const wajindenMainStops = sourceRouteIds.flatMap((nodeId) => {
  const place = identifiedPlace(nodeId);
  return place?.coordinates ? [{ nodeId, place }] : [];
});
const wajindenMainPlaces = wajindenMainStops.map(({ place }) => place);
const wajindenKyushu = wajindenEntityById.get("northern-kyushu");
const wajindenKinai = wajindenEntityById.get("nara-basin");

function placeForLensEntity(entityId: string) {
  return sourceRouteIds.includes(entityId)
    ? identifiedPlace(entityId)
    : wajindenEntityById.get(entityId);
}

function lineFeature(
  id: string,
  routeKind: string,
  coordinates: [number, number][],
  properties: Record<string, string> = {},
): Feature<LineString> {
  return {
    type: "Feature",
    id,
    properties: { routeKind, ...properties },
    geometry: { type: "LineString", coordinates },
  };
}

function coordinatesOf(place: (typeof wajindenProjection.nodes)[number]): [number, number] {
  return [place.coordinates!.longitude, place.coordinates!.latitude];
}

const wajindenRoutes: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    lineFeature("source-route", "source", wajindenMainPlaces.map(coordinatesOf), { title: "魏志倭人伝の記述順", summary: "狗邪韓国から不弥国まで、史料本文に現れる順序を現代の比定候補へ重ねた線です。", evidenceLabel: "史料順・比定は要区別" }),
    ...(wajindenMainPlaces.at(-1) && wajindenKyushu?.coordinates
      ? [lineFeature("kyushu-route", "kyushu", [coordinatesOf(wajindenMainPlaces.at(-1)!), coordinatesOf(wajindenKyushu)], { title: "邪馬台国 九州説", summary: "不弥国以降を北部九州へ続ける解釈モデルです。所在地の確定ではなく競合仮説として表示しています。", evidenceLabel: "学説・解釈モデル" })]
      : []),
    ...(wajindenMainPlaces.at(-1) && wajindenKinai?.coordinates
      ? [lineFeature("kinai-route", "kinai", [coordinatesOf(wajindenMainPlaces.at(-1)!), coordinatesOf(wajindenKinai)], { title: "邪馬台国 畿内説", summary: "不弥国以降を奈良盆地方面へ続ける解釈モデルです。所在地の確定ではなく競合仮説として表示しています。", evidenceLabel: "学説・解釈モデル" })]
      : []),
  ],
};

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
      wajinden: { type: "geojson", data: emptyLines },
    },
    layers: [
      { id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.75, "raster-brightness-max": 0.62, "raster-contrast": 0.22 } },
      { id: "wajinden-source-halo", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "source"], paint: { "line-color": "#68c7bd", "line-opacity": 0.24, "line-width": 12 } },
      { id: "wajinden-source", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "source"], paint: { "line-color": "#68c7bd", "line-width": 4 } },
      { id: "wajinden-kyushu", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "kyushu"], paint: { "line-color": "#75d4ba", "line-width": 4, "line-dasharray": [2, 2] } },
      { id: "wajinden-kinai", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "kinai"], paint: { "line-color": "#d5b46d", "line-width": 4, "line-dasharray": [2, 2] } },
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
  mapConnections,
  selectedSuggestion,
  recognitionLens,

  selectedLensEntityId,
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
  mapConnections: MapConnectionProjection[];
  selectedSuggestion?: ReviewExplorationSuggestion;
  recognitionLens: string;

  selectedLensEntityId: string;
  onSelectLensEntity: (entityId: string) => void;
  onSelectMapConnection: (connectionId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapRevision, setMapRevision] = useState(0);
  const [tileError, setTileError] = useState(false);

  const activeMapConnectionId = mapConnections.find((connection) => connection.selected)?.id ?? "";
  const [mapLinePoints, setMapLinePoints] = useState<Record<string, string>>({});
  const [mapLineInfo, setMapLineInfo] = useState<{ id: string; title: string; summary: string; evidenceLabel: string; lens: string } | null>(null);
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
    const showLayerInfo = (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const properties = feature?.properties;
      if (!properties?.title) return;
      setMapLineInfo({
        id: String(feature?.id ?? properties.title),
        title: String(properties.title),
        summary: String(properties.summary ?? ""),
        evidenceLabel: String(properties.evidenceLabel ?? "Knowledge Pack"),
        lens: "route",
      });
    };
    const interactiveLayers = ["wajinden-source", "wajinden-kyushu", "wajinden-kinai"];
    interactiveLayers.forEach((layerId) => {
      map.on("click", layerId, showLayerInfo);
      map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
    });
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
    const syncOverlayData = () => {
      const wajindenSource = map.getSource("wajinden") as GeoJSONSource | undefined;
      if (!wajindenSource) return;
      map.off("styledata", syncOverlayData);
      wajindenSource.setData(recognitionLens === "route" ? wajindenRoutes : emptyLines);
    };
    map.on("styledata", syncOverlayData);
    syncOverlayData();
    return () => {
      map.off("styledata", syncOverlayData);
    };
  }, [mapRevision, recognitionLens]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapRevision || !map) return;
    const syncMapConnections = () => {
      setMapLinePoints(Object.fromEntries(mapConnections.map((connection) => [
        connection.id,
        connection.points
          .map((point) => map.project([point.longitude, point.latitude]))
          .map(({ x, y }) => `${x},${y}`)
          .join(" "),
      ])));
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

    const addedReferencePointIds = new Set<string>();
    for (const connection of mapConnections) {
      for (const point of connection.points) {
        if (point.kind !== "reference" || addedReferencePointIds.has(point.id)) continue;
        addedReferencePointIds.add(point.id);
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapRouteMarker;
        element.dataset.kind = "lens";
        element.dataset.active = String(connection.id === activeMapConnectionId);
        element.textContent = point.label;
        element.addEventListener("click", () => {
          onSelectMapConnectionRef.current(connection.id);
          setMapLineInfo({ id: connection.id, title: connection.title, summary: connection.summary, evidenceLabel: mapEvidenceLabel(connection), lens: recognitionLens });
        });
        markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([point.longitude, point.latitude]).addTo(mapRef.current!));
      }
    }
    if (recognitionLens !== "route") {
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
    } else {
      for (const { nodeId, place } of wajindenMainStops) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapRouteMarker;
        element.dataset.kind = "source";
        element.dataset.active = String(selectedLensEntityId === nodeId);
        element.textContent = place.label.replace("周辺", "");
        element.addEventListener("click", () => onSelectLensEntityRef.current(nodeId));
        markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat(coordinatesOf(place)).addTo(mapRef.current!));
      }
      for (const place of [wajindenKyushu, wajindenKinai].filter((item) => item?.coordinates)) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapRouteMarker;
        element.dataset.kind = place!.id === "nara-basin" ? "kinai" : "kyushu";
        element.dataset.active = String(selectedLensEntityId === place!.id);
        element.textContent = place!.id === "nara-basin" ? "畿内説" : "九州説";
        element.addEventListener("click", () => onSelectLensEntityRef.current(place!.id));
        markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat(coordinatesOf(place!)).addTo(mapRef.current!));
      }
    }
  }, [activeMapConnectionId, highlightedSpotIds, journeyBySpotId, mapConnections, mapRevision, recognitionLens, selectedLensEntityId, selectedSpotId, selectedSuggestion, spots, suggestions]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    const projectedCoordinates = mapConnections.flatMap((connection) =>
      connection.points.map((point) => [point.longitude, point.latitude] as [number, number]),
    );
    const coordinates: [number, number][] = recognitionLens === "route"
      ? [...wajindenMainPlaces, wajindenKyushu, wajindenKinai].filter((item) => item?.coordinates).map((item) => coordinatesOf(item!))
      : [...spots.map((spot) => [spot.longitude, spot.latitude] as [number, number]), ...projectedCoordinates];
    if (!coordinates.length) return;
    const bounds = coordinates.reduce((result, coordinate) => result.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    mapRef.current.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: recognitionLens === "route" ? 7.3 : 9 });
  }, [mapConnections, mapRevision, recognitionLens, spots]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapRevision || !map || recognitionLens !== "route") return;
    const syncSelectedRoute = () => {
      if (!map.getLayer("wajinden-kyushu") || !map.getLayer("wajinden-kinai")) return;
      map.off("styledata", syncSelectedRoute);
      const selectedPlace = placeForLensEntity(selectedLensEntityId);
      map.setPaintProperty("wajinden-kyushu", "line-opacity", selectedLensEntityId === "nara-basin" ? 0.18 : 1);
      map.setPaintProperty("wajinden-kinai", "line-opacity", selectedLensEntityId === "northern-kyushu" ? 0.18 : 1);
      if (!selectedPlace?.coordinates) return;
      map.easeTo({
        center: coordinatesOf(selectedPlace),
        zoom: selectedPlace.id === "nara-basin" ? 7.5 : 8.8,
        duration: 650,
      });
    };
    map.on("styledata", syncSelectedRoute);
    syncSelectedRoute();
    return () => {
      map.off("styledata", syncSelectedRoute);
    };
  }, [mapRevision, recognitionLens, selectedLensEntityId]);

  return (
    <div className={styles.mapLibreShell}>
      <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
      <svg className={styles.mapConnectionOverlay} aria-label="地図上の接続線">
        {mapConnections.map((mapConnection) => {
          const points = mapLinePoints[mapConnection.id];
          if (!points) return null;
          const selected = mapConnection.id === activeMapConnectionId;
          const openMapConnection = () => {
            onSelectMapConnection(mapConnection.id);
            setMapLineInfo({
              id: mapConnection.id,
              title: mapConnection.title,
              summary: mapConnection.summary,
              evidenceLabel: mapEvidenceLabel(mapConnection),
              lens: recognitionLens,
            });
          };
          return <g key={mapConnection.id} className={styles.mapProjectedConnection} data-selected={selected} data-origin={mapConnection.origin}>
            <polyline points={points} className={styles.mapConnectionHit} role="button" tabIndex={0} aria-label={`${mapConnection.title}の説明を表示`} onClick={openMapConnection} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMapConnection();
              }
            }} />
            <polyline points={points} className={styles.mapConnectionHalo} />
            <polyline points={points} className={styles.mapConnectionLine} />
          </g>;
        })}
      </svg>
      {mapLineInfo?.lens === recognitionLens && (recognitionLens === "route" || mapConnections.some((connection) => connection.id === mapLineInfo.id)) ? <aside className={styles.mapConnectionInfo} aria-live="polite">
        <button type="button" aria-label="接続の説明を閉じる" onClick={() => setMapLineInfo(null)}>×</button>
        <small>MAP CONNECTION</small>
        <strong>{mapLineInfo.title}</strong>
        <span>{mapLineInfo.evidenceLabel}</span>
        <p>{mapLineInfo.summary}</p>
      </aside> : null}
      <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
      <div className={styles.mapLegend}>
        <span><i data-kind="selected" />選択中</span>
        <span><i data-kind="visited" />訪問済み</span>
        <span><i data-kind="candidate" />位置候補</span>
        {recognitionLens === "route" ? (
          <><span><i data-kind="route-source" />史料順</span><span><i data-kind="route-kyushu" />九州説</span><span><i data-kind="route-kinai" />畿内説</span></>
        ) : (
          <>
            <span><i data-kind="link" />旅行記の接続</span>
            {mapConnections.some((connection) => connection.origin === "knowledge-pack") ? <span><i data-kind="candidate" />Knowledge Pack</span> : null}
            {mapConnections.some((connection) => connection.origin === "suggestion") ? <span><i data-kind="next" />次の候補</span> : null}
          </>
        )}
      </div>
    </div>
  );
}

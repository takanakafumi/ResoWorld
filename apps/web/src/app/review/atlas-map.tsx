"use client";

import type { Feature, FeatureCollection, LineString } from "geojson";
import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

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
): Feature<LineString> {
  return {
    type: "Feature",
    id,
    properties: { routeKind },
    geometry: { type: "LineString", coordinates },
  };
}

function coordinatesOf(place: (typeof wajindenProjection.nodes)[number]): [number, number] {
  return [place.coordinates!.longitude, place.coordinates!.latitude];
}

const wajindenRoutes: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    lineFeature("source-route", "source", wajindenMainPlaces.map(coordinatesOf)),
    ...(wajindenMainPlaces.at(-1) && wajindenKyushu?.coordinates
      ? [lineFeature("kyushu-route", "kyushu", [coordinatesOf(wajindenMainPlaces.at(-1)!), coordinatesOf(wajindenKyushu)])]
      : []),
    ...(wajindenMainPlaces.at(-1) && wajindenKinai?.coordinates
      ? [lineFeature("kinai-route", "kinai", [coordinatesOf(wajindenMainPlaces.at(-1)!), coordinatesOf(wajindenKinai)])]
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
      connections: { type: "geojson", data: emptyLines },
      wajinden: { type: "geojson", data: emptyLines },
    },
    layers: [
      { id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.75, "raster-brightness-max": 0.62, "raster-contrast": 0.22 } },
      { id: "connection-halo", type: "line", source: "connections", paint: { "line-color": "#68c7bd", "line-opacity": 0.2, "line-width": 12 } },
      { id: "connection-line", type: "line", source: "connections", paint: { "line-color": "#d5b46d", "line-width": 3, "line-dasharray": [2, 2] } },
      { id: "wajinden-source-halo", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "source"], paint: { "line-color": "#68c7bd", "line-opacity": 0.24, "line-width": 12 } },
      { id: "wajinden-source", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "source"], paint: { "line-color": "#68c7bd", "line-width": 4 } },
      { id: "wajinden-kyushu", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "kyushu"], paint: { "line-color": "#75d4ba", "line-width": 4, "line-dasharray": [2, 2] } },
      { id: "wajinden-kinai", type: "line", source: "wajinden", filter: ["==", ["get", "routeKind"], "kinai"], paint: { "line-color": "#d5b46d", "line-width": 4, "line-dasharray": [2, 2] } },
    ],
  };
}

export function AtlasMap({
  spots,
  suggestions,
  selectedSpotId,
  highlightedSpotIds,
  connection,
  selectedSuggestion,
  recognitionLens,
  selectedLensEntityId,
  onSelectLensEntity,
  onSelectSpot,
  onSelectSuggestion,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  selectedSpotId: string;
  highlightedSpotIds: string[];
  connection?: ReviewAtlasConnection;
  selectedSuggestion?: ReviewExplorationSuggestion;
  recognitionLens: string;
  selectedLensEntityId: string;
  onSelectLensEntity: (entityId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapRevision, setMapRevision] = useState(0);
  const [styleRevision, setStyleRevision] = useState(0);
  const [tileError, setTileError] = useState(false);
  const onSelectSpotRef = useRef(onSelectSpot);
  const onSelectSuggestionRef = useRef(onSelectSuggestion);
  const onSelectLensEntityRef = useRef(onSelectLensEntity);
  useEffect(() => {
    onSelectSpotRef.current = onSelectSpot;
    onSelectSuggestionRef.current = onSelectSuggestion;
    onSelectLensEntityRef.current = onSelectLensEntity;
  }, [onSelectLensEntity, onSelectSpot, onSelectSuggestion]);

  const connectionData = useMemo<FeatureCollection<LineString>>(() => {
    const spotById = new Map(spots.map((spot) => [spot.id, spot]));
    const ids = selectedSuggestion?.anchorSpotIds ?? connection?.spotIds ?? [];
    const points = ids.map((id) => spotById.get(id)).filter(Boolean).map((spot) => [spot!.longitude, spot!.latitude] as [number, number]);
    if (selectedSuggestion && points.length) points.push([selectedSuggestion.longitude, selectedSuggestion.latitude]);
    return points.length > 1
      ? { type: "FeatureCollection", features: [lineFeature("active-connection", "connection", points)] }
      : emptyLines;
  }, [connection, selectedSuggestion, spots]);

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
    map.on("style.load", () => setStyleRevision((revision) => revision + 1));
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
    if (!styleRevision || !mapRef.current) return;
    const connectionsSource = mapRef.current.getSource("connections") as GeoJSONSource | undefined;
    const wajindenSource = mapRef.current.getSource("wajinden") as GeoJSONSource | undefined;
    connectionsSource?.setData(connectionData);
    wajindenSource?.setData(recognitionLens === "route" ? wajindenRoutes : emptyLines);
  }, [connectionData, recognitionLens, styleRevision]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    for (const [index, spot] of spots.entries()) {
      const element = document.createElement("button");
      element.type = "button";
      element.className = styles.mapSpotMarker;
      element.dataset.active = String(spot.id === selectedSpotId);
      element.dataset.connected = String(highlightedSpotIds.includes(spot.id));
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const label = document.createElement("strong");
      label.textContent = spot.name;
      element.append(number, label);
      element.addEventListener("click", () => onSelectSpotRef.current(spot.id));
      markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([spot.longitude, spot.latitude]).addTo(mapRef.current!));
    }

    if (recognitionLens !== "route") {
      for (const suggestion of suggestions) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.mapSuggestionMarker;
        element.dataset.active = String(suggestion.id === selectedSuggestion?.id);
        element.textContent = `NEXT · ${suggestion.targetName}`;
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
  }, [highlightedSpotIds, mapRevision, recognitionLens, selectedLensEntityId, selectedSpotId, selectedSuggestion, spots, suggestions]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    const coordinates: [number, number][] = recognitionLens === "route"
      ? [...wajindenMainPlaces, wajindenKyushu, wajindenKinai].filter((item) => item?.coordinates).map((item) => coordinatesOf(item!))
      : spots.map((spot) => [spot.longitude, spot.latitude]);
    if (!coordinates.length) return;
    const bounds = coordinates.reduce((result, coordinate) => result.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    mapRef.current.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: recognitionLens === "route" ? 7.3 : 9 });
  }, [mapRevision, recognitionLens, spots]);

  useEffect(() => {
    if (!styleRevision || !mapRef.current || recognitionLens !== "route") return;
    if (!mapRef.current.getLayer("wajinden-kyushu") || !mapRef.current.getLayer("wajinden-kinai")) return;
    const selectedPlace = placeForLensEntity(selectedLensEntityId);
    mapRef.current.setPaintProperty("wajinden-kyushu", "line-opacity", selectedLensEntityId === "nara-basin" ? 0.18 : 1);
    mapRef.current.setPaintProperty("wajinden-kinai", "line-opacity", selectedLensEntityId === "northern-kyushu" ? 0.18 : 1);
    if (!selectedPlace?.coordinates) return;
    mapRef.current.easeTo({
      center: coordinatesOf(selectedPlace),
      zoom: selectedPlace.id === "nara-basin" ? 7.5 : 8.8,
      duration: 650,
    });
  }, [recognitionLens, selectedLensEntityId, styleRevision]);

  return (
    <div className={styles.mapLibreShell}>
      <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
      <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
      <div className={styles.mapLegend}>
        <span><i data-kind="selected" />選択中</span>
        <span><i data-kind="visited" />訪問済み</span>
        {recognitionLens === "route" ? (
          <><span><i data-kind="route-source" />史料順</span><span><i data-kind="route-kyushu" />九州説</span><span><i data-kind="route-kinai" />畿内説</span></>
        ) : (
          <><span><i data-kind="link" />接続</span><span><i data-kind="next" />次の候補</span></>
        )}
      </div>
    </div>
  );
}

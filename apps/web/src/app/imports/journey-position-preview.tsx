"use client";

import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import styles from "./journey-position-preview.module.css";

export type JourneyPositionPreviewPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

const style: StyleSpecification = {
  version: 8,
  sources: { basemap: { type: "raster", tiles: [tileUrl], tileSize: 256, attribution: tileAttribution } },
  layers: [{ id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.7, "raster-brightness-max": 0.68 } }],
};

export function JourneyPositionPreview({ points }: { points: JourneyPositionPreviewPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (points.length === 0 || !containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: containerRef.current, style, center: [points[0].longitude, points[0].latitude], zoom: 8 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = points.map((point, index) => {
      const marker = document.createElement("div");
      marker.className = styles.marker;
      marker.innerHTML = `<span>${index + 1}</span><strong></strong>`;
      marker.querySelector("strong")!.textContent = point.name;
      return new maplibregl.Marker({ element: marker, anchor: "bottom" })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);
    });
    if (points.length === 1) {
      map.easeTo({ center: [points[0].longitude, points[0].latitude], zoom: 13, duration: 0 });
    } else if (points.length > 1) {
      const bounds = points.reduce((current, point) => current.extend([point.longitude, point.latitude]), new maplibregl.LngLatBounds());
      map.fitBounds(bounds, { padding: 70, maxZoom: 12, duration: 0 });
    }
  }, [points]);

  return <section className={styles.preview} aria-label="Atlas反映前の位置候補プレビュー">
    <header><div><p>ATLAS CANDIDATE PREVIEW</p><h3>確定前の位置を地図で確認</h3></div><strong>{points.length}地点を選択中</strong></header>
    {points.length > 0 ? <div className={styles.map} ref={containerRef} /> : <div className={styles.empty}>「訪問済み」の位置候補を選ぶと、ここに表示されます。</div>}
    <footer>番号は下の候補順です。この表示から接続線は生成しません。</footer>
  </section>;
}

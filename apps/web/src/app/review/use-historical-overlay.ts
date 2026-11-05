"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { LensSpatialOverlay } from "@/domain/lens-packs/schema";
import {
  EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  projectHistoricalOverlay,
  type ProjectedHistoricalOverlay,
} from "@/domain/map/historical-overlays";

export function useHistoricalOverlay({
  map,
  mapRevision,
  overlay,
  visible = true,
  labelClassName,
  sublabelClassName,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  overlay?: LensSpatialOverlay;
  visible?: boolean;
  labelClassName?: string;
  sublabelClassName?: string;
}) {
  const [projection, setProjection] = useState<ProjectedHistoricalOverlay>(
    EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  );
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);

  const isLayerActive = Boolean(visible && overlay && overlay.features.length > 0);

  // Synchronize SVG screen projection on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map || !isLayerActive) {
      setProjection(EMPTY_HISTORICAL_OVERLAY_PROJECTION);
      return;
    }

    let rafId: number | null = null;

    const syncOverlay = () => {
      setProjection(projectHistoricalOverlay(overlay, map));
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        syncOverlay();
        rafId = null;
      });
    };

    map.on("move", scheduleSync);
    map.on("zoom", scheduleSync);
    map.on("resize", scheduleSync);
    syncOverlay();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      map.off("move", scheduleSync);
      map.off("zoom", scheduleSync);
      map.off("resize", scheduleSync);
    };
  }, [overlay, isLayerActive, map, mapRevision]);

  // Sync non-interactive HTML label markers
  useEffect(() => {
    labelMarkersRef.current.forEach((marker) => marker.remove());
    labelMarkersRef.current = [];

    if (!mapRevision || !map || !isLayerActive || !labelClassName || !projection.labels.length) {
      return;
    }

    const created: maplibregl.Marker[] = [];
    for (const item of projection.labels) {
      const el = document.createElement("div");
      el.className = labelClassName;
      el.style.setProperty("--overlay-color", item.color);
      el.dataset.category = item.category;
      el.setAttribute("aria-hidden", "true");

      const titleSpan = document.createElement("span");
      titleSpan.textContent = item.label;
      el.appendChild(titleSpan);

      if (item.sublabel && sublabelClassName) {
        const subSpan = document.createElement("small");
        subSpan.className = sublabelClassName;
        subSpan.textContent = item.sublabel;
        el.appendChild(subSpan);
      }

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);

      created.push(marker);
    }

    labelMarkersRef.current = created;

    return () => {
      created.forEach((marker) => marker.remove());
      labelMarkersRef.current = [];
    };
  }, [isLayerActive, map, mapRevision, labelClassName, sublabelClassName, projection.labels]);

  return {
    isActive: isLayerActive,
    projection,
    overlay,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  HISTORICAL_OVERLAY_PRESETS,
  getHistoricalOverlayPreset,
  projectHistoricalOverlay,
  type HistoricalOverlayPreset,
  type ProjectedHistoricalOverlay,
} from "@/domain/map/historical-overlays";

export function useHistoricalOverlay({
  map,
  mapRevision,
  labelClassName,
  sublabelClassName,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  labelClassName: string;
  sublabelClassName: string;
}) {
  const [presetId, setPresetId] = useState<string>("dazaifu-kando-defense");
  const [projection, setProjection] = useState<ProjectedHistoricalOverlay>(
    EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  );
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);
  const activePreset: HistoricalOverlayPreset | undefined =
    presetId === "off" ? undefined : getHistoricalOverlayPreset(presetId);

  const selectPreset = useCallback(
    (nextId: string) => {
      setPresetId(nextId);
      if (nextId !== "off" && map) {
        const preset = getHistoricalOverlayPreset(nextId);
        if (preset) {
          map.fitBounds(preset.bounds, {
            padding: 64,
            duration: 650,
            maxZoom: 13.5,
          });
        }
      }
    },
    [map],
  );

  // Synchronize SVG screen projection on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map || !activePreset) {
      setProjection(EMPTY_HISTORICAL_OVERLAY_PROJECTION);
      return;
    }

    let rafId: number | null = null;

    const syncOverlay = () => {
      setProjection(projectHistoricalOverlay(activePreset, map));
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
  }, [activePreset, map, mapRevision]);

  // Sync non-interactive HTML label markers
  useEffect(() => {
    labelMarkersRef.current.forEach((marker) => marker.remove());
    labelMarkersRef.current = [];

    if (!mapRevision || !map || !activePreset) return;

    const created: maplibregl.Marker[] = [];
    for (const item of activePreset.labels) {
      const el = document.createElement("div");
      el.className = labelClassName;
      el.style.setProperty("--overlay-color", item.color);
      el.dataset.category = item.category;
      el.setAttribute("aria-hidden", "true");

      const title = document.createElement("strong");
      title.textContent = item.label;
      el.appendChild(title);

      if (item.sublabel) {
        const sub = document.createElement("small");
        sub.className = sublabelClassName;
        sub.textContent = item.sublabel;
        el.appendChild(sub);
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
  }, [activePreset, labelClassName, sublabelClassName, map, mapRevision]);

  return {
    presetId,
    activePreset,
    presets: HISTORICAL_OVERLAY_PRESETS,
    projection,
    selectPreset,
  };
}

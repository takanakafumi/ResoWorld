"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import {
  HISTORICAL_OVERLAY_PRESETS,
  getHistoricalOverlayPreset,
  type HistoricalOverlayPreset,
} from "@/domain/map/historical-overlays";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export const HISTORICAL_OVERLAY_LAYER_IDS = [
  "historical-overlay-fill",
  "historical-overlay-outline",
  "historical-overlay-line-halo",
  "historical-overlay-line-solid",
  "historical-overlay-line-dashed",
] as const;

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
  const [presetId, setPresetId] = useState<string>("off");
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

  // Sync GeoJSON source data & layer visibility
  useEffect(() => {
    if (!mapRevision || !map) return;

    const applyOverlay = () => {
      const source = map.getSource("historical-overlay") as GeoJSONSource | undefined;
      if (source && typeof source.setData === "function") {
        source.setData(activePreset ? activePreset.geojson : EMPTY_FEATURE_COLLECTION);
      }

      const targetVisibility = activePreset ? "visible" : "none";
      for (const layerId of HISTORICAL_OVERLAY_LAYER_IDS) {
        if (!map.getLayer(layerId)) continue;
        if (map.getLayoutProperty(layerId, "visibility") !== targetVisibility) {
          map.setLayoutProperty(layerId, "visibility", targetVisibility);
        }
      }
    };

    applyOverlay();
    map.on("load", applyOverlay);
    map.on("styledata", applyOverlay);

    return () => {
      map.off("load", applyOverlay);
      map.off("styledata", applyOverlay);
    };
  }, [activePreset, map, mapRevision]);

  // Sync non-interactive HTML label markers (avoids MapLibre PBF glyph dependency & never intercepts clicks)
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
    selectPreset,
  };
}

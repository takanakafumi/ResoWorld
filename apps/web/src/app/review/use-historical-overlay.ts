"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { LensSpatialOverlay } from "@/domain/lens-packs/schema";
import {
  EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  projectHistoricalOverlay,
  type ProjectedHistoricalOverlay,
} from "@/domain/map/historical-overlays";

export function buildHistoricalLabelSignature(
  labels: ProjectedHistoricalOverlay["labels"],
): string {
  if (labels.length === 0) return "";
  return labels
    .map(
      (item) =>
        `${item.id}|${item.label}|${item.sublabel ?? ""}|${item.color}|${item.category}|${item.longitude}|${item.latitude}`,
    )
    .join(";");
}

export function useHistoricalOverlay({
  map,
  mapRevision,
  overlay,
  visible = true,
  showLabels = true,
  labelClassName,
  sublabelClassName,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  overlay?: LensSpatialOverlay;
  visible?: boolean;
  showLabels?: boolean;
  labelClassName?: string;
  sublabelClassName?: string;
}) {
  const [projection, setProjection] = useState<ProjectedHistoricalOverlay>(
    EMPTY_HISTORICAL_OVERLAY_PROJECTION,
  );
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);

  const hasOverlay = Boolean(overlay && overlay.features.length > 0);
  const isLayerActive = Boolean(visible && hasOverlay);

  // Synchronize SVG screen projection on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map || !isLayerActive) {
      setProjection((prev) =>
        prev === EMPTY_HISTORICAL_OVERLAY_PROJECTION ? prev : EMPTY_HISTORICAL_OVERLAY_PROJECTION,
      );
      return;
    }

    let rafId: number | null = null;

    const syncOverlay = () => {
      setProjection(
        projectHistoricalOverlay(overlay, map, {
          zoom: map.getZoom(),
          showLabels,
        }),
      );
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
  }, [overlay, isLayerActive, showLabels, map, mapRevision]);

  const labelSignature = useMemo(
    () => buildHistoricalLabelSignature(projection.labels),
    [projection.labels],
  );
  const latestLabelsRef = useRef(projection.labels);
  latestLabelsRef.current = projection.labels;

  // Sync non-interactive HTML label markers ONLY when visible label set actually changes
  // (MapLibre Marker automatically tracks lng/lat during pan/zoom with zero DOM recreation!)
  useEffect(() => {
    labelMarkersRef.current.forEach((marker) => marker.remove());
    labelMarkersRef.current = [];

    const labels = latestLabelsRef.current;
    if (!mapRevision || !map || !isLayerActive || !showLabels || !labelClassName || !labels.length) {
      return;
    }

    const created: maplibregl.Marker[] = [];
    for (const item of labels) {
      const el = document.createElement("div");
      el.className = labelClassName;
      el.style.setProperty("--overlay-color", item.color);
      el.dataset.category = item.category;
      el.setAttribute("aria-hidden", "true");

      const titleEl = document.createElement("strong");
      titleEl.textContent = item.label;
      el.appendChild(titleEl);

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
  }, [isLayerActive, showLabels, map, mapRevision, labelClassName, sublabelClassName, labelSignature]);

  return {
    hasOverlay,
    isActive: isLayerActive,
    projection,
    overlay,
  };
}

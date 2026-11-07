"use client";

import { useEffect, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  projectArtifactOverlay,
  type ArtifactMarkerProjection,
} from "@/domain/archaeology/artifact-projection";
import type {
  ArchaeologicalSite,
  ArtifactOverlayId,
} from "@/domain/archaeology/artifact-overlay-types";

export interface ProjectedScreenArtifactMarker extends ArtifactMarkerProjection {
  screenX: number;
  screenY: number;
}

export function useArtifactOverlay({
  map,
  mapRevision,
  activeOverlayId,
  selectedSiteId,
  onSelectSite,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  activeOverlayId: ArtifactOverlayId;
  selectedSiteId: string | null;
  onSelectSite: (siteId: string | null) => void;
}) {
  const [screenMarkers, setScreenMarkers] = useState<ProjectedScreenArtifactMarker[]>([]);

  const isLayerActive = activeOverlayId !== "none";
  const scene = projectArtifactOverlay(activeOverlayId, selectedSiteId);

  // Synchronize SVG screen projections on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map || !isLayerActive || scene.markers.length === 0) {
      setScreenMarkers([]);
      return;
    }

    let rafId: number | null = null;

    const syncScreenCoordinates = () => {
      const projected = scene.markers.map((marker) => {
        const point = map.project([marker.longitude, marker.latitude]);
        return {
          ...marker,
          screenX: point.x,
          screenY: point.y,
        };
      });
      setScreenMarkers(projected);
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        syncScreenCoordinates();
        rafId = null;
      });
    };

    map.on("move", scheduleSync);
    map.on("zoom", scheduleSync);
    map.on("resize", scheduleSync);
    syncScreenCoordinates();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      map.off("move", scheduleSync);
      map.off("zoom", scheduleSync);
      map.off("resize", scheduleSync);
    };
  }, [activeOverlayId, isLayerActive, map, mapRevision, scene.markers]);

  const handleZoomToSite = (site: ArchaeologicalSite) => {
    if (!map) return;
    map.flyTo({
      center: [site.coordinates.longitude, site.coordinates.latitude],
      zoom: 12,
      duration: 600,
    });
  };

  return {
    isLayerActive,
    scene,
    screenMarkers,
    selectedSite: scene.selectedSite,
    handleZoomToSite,
    onSelectSite,
  };
}

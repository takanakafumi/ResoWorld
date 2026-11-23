"use client";

import { useEffect, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  projectArtifactOverlay,
  type ArtifactMarkerProjection,
  type ArtifactSupplyChainTrajectory,
} from "@/domain/archaeology/artifact-projection";
import type {
  ArchaeologicalSite,
  ArtifactOverlayId,
} from "@/domain/archaeology/artifact-overlay-types";

export interface ProjectedScreenArtifactMarker extends ArtifactMarkerProjection {
  screenX: number;
  screenY: number;
}

export interface ProjectedScreenTrajectory {
  fromX: number;
  fromY: number;
  fromName: string;
  toX: number;
  toY: number;
  toName: string;
  distributionRoute?: string;
  pathD: string;
}

function calculateArcPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return `M ${x1} ${y1}`;

  // Calculate perpendicular offset for curved trade route arc (15% of distance, capped)
  const offset = Math.min(Math.max(dist * 0.15, 20), 80);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Normalized normal vector pointing slightly upward/outward
  const nx = -dy / dist;
  const ny = dx / dist;

  const controlX = midX + nx * offset;
  const controlY = midY + ny * offset;

  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
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
  const [screenTrajectory, setScreenTrajectory] = useState<ProjectedScreenTrajectory | null>(null);

  const isLayerActive = activeOverlayId !== "none";
  const scene = projectArtifactOverlay(activeOverlayId, selectedSiteId);

  // Synchronize SVG screen projections on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map || !isLayerActive || scene.markers.length === 0) {
      setScreenMarkers([]);
      setScreenTrajectory(null);
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

      if (scene.originTrajectory) {
        const pFrom = map.project([scene.originTrajectory.from.longitude, scene.originTrajectory.from.latitude]);
        const pTo = map.project([scene.originTrajectory.to.longitude, scene.originTrajectory.to.latitude]);
        setScreenTrajectory({
          fromX: pFrom.x,
          fromY: pFrom.y,
          fromName: scene.originTrajectory.from.name,
          toX: pTo.x,
          toY: pTo.y,
          toName: scene.originTrajectory.to.name,
          distributionRoute: scene.originTrajectory.distributionRoute,
          pathD: calculateArcPath(pFrom.x, pFrom.y, pTo.x, pTo.y),
        });
      } else {
        setScreenTrajectory(null);
      }
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
  }, [activeOverlayId, isLayerActive, map, mapRevision, scene.markers, scene.originTrajectory]);

  const handleZoomToSite = (site: ArchaeologicalSite) => {
    if (!map) return;
    map.flyTo({
      center: [site.coordinates.longitude, site.coordinates.latitude],
      zoom: 12,
      duration: 600,
    });
  };

  const handleZoomToOrigin = () => {
    if (!map || !scene.selectedSite?.provenance) return;
    const p = scene.selectedSite.provenance;
    let targetLng: number | undefined;
    let targetLat: number | undefined;
    let targetSiteId: string | undefined;

    if (scene.focusedOriginMarker) {
      targetLng = scene.focusedOriginMarker.longitude;
      targetLat = scene.focusedOriginMarker.latitude;
      targetSiteId = scene.focusedOriginMarker.siteId;
    } else if (p.originCoordinates) {
      targetLng = p.originCoordinates.longitude;
      targetLat = p.originCoordinates.latitude;
      targetSiteId = p.originSiteId;
    }

    if (targetLng !== undefined && targetLat !== undefined) {
      map.flyTo({
        center: [targetLng, targetLat],
        zoom: 11,
        duration: 700,
      });
      if (targetSiteId && scene.markers.some((m) => m.siteId === targetSiteId)) {
        onSelectSite(targetSiteId);
      }
    }
  };

  return {
    isLayerActive,
    scene,
    screenMarkers,
    screenTrajectory,
    selectedSite: scene.selectedSite,
    handleZoomToSite,
    handleZoomToOrigin,
    onSelectSite,
  };
}

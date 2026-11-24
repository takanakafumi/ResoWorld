"use client";

import { useEffect, useMemo, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import { buildConnectionHitPath } from "@/domain/map/hit-testing";
import { computeConvexHull } from "@/domain/map/convex-hull";
import { connectionBelongsToLens, type MapConnectionProjection } from "@/domain/map/connections";

export type ConnectionLayerVisibility = {
  itinerary: boolean;
  lens: boolean;
};

export type RenderableConnectionSegment = {
  id: string;
  points: string;
  hitPath: string;
};

export type ConnectionGeometry = {
  segments: RenderableConnectionSegment[];
  hullPoints?: string;
  perimeterPoints?: string;
};

export type RenderableConnectionLine = {
  id: string;
  connection: MapConnectionProjection;
  selected: boolean;
  emphasized: boolean;
  isDimmed: boolean;
  origin: MapConnectionProjection["origin"];
  lensCategory: string;
  displayMode: MapConnectionProjection["displayMode"];
  segments: RenderableConnectionSegment[];
  hullPoints?: string;
  perimeterPoints?: string;
  themeColor?: string;
  lineStyle: {
    stroke: string;
    strokeDasharray?: string;
  };
  haloStyle: {
    stroke: string;
  };
};



export function resolveConnectionAppearance(
  connection: MapConnectionProjection,
  selected: boolean,
) {
  // Determine dash array if explicitly set or inferred from nature/role (ADR-0027)
  const explicitDashArray = connection.appearance?.dashArray?.join(" ");
  const defaultDashArray =
    connection.connectionKind === "itinerary"
      ? "10 6"
      : connection.epistemicRole === "canonical_itinerary" || connection.epistemicRole === "hypothesis_continuation"
        ? "8 6"
        : connection.epistemicRole === "alliance_mesh"
          ? "8 4"
          : connection.epistemicRole === "supply_chain"
            ? "12 4 3 4"
            : undefined;
  const dashArray = explicitDashArray ?? defaultDashArray;

  if (selected) {
    return {
      lineStyle: { stroke: "#ffffff", strokeDasharray: dashArray ?? "none" },
      haloStyle: { stroke: connection.appearance?.color ?? "#f0cf80" },
    };
  }

  // 1. Itinerary routes
  if (connection.connectionKind === "itinerary") {
    return {
      lineStyle: { stroke: "#f97316", strokeDasharray: "10 6" },
      haloStyle: { stroke: "#ea580c" },
    };
  }

  // 2. Explicit appearance from pack/connection
  if (connection.appearance) {
    return {
      lineStyle: {
        stroke: connection.appearance.color,
        strokeDasharray: explicitDashArray,
      },
      haloStyle: { stroke: connection.appearance.color },
    };
  }

  // 3. Epistemic Role based appearance (ADR-0027)
  if (connection.epistemicRole === "canonical_itinerary" || connection.epistemicRole === "hypothesis_continuation") {
    return {
      lineStyle: { stroke: "#68c7bd", strokeDasharray: "8 6" },
      haloStyle: { stroke: "#14b8a6" },
    };
  }
  if (connection.epistemicRole === "alliance_mesh") {
    return {
      lineStyle: { stroke: "#c084fc", strokeDasharray: "8 4" },
      haloStyle: { stroke: "#c084fc" },
    };
  }
  if (connection.epistemicRole === "regional_hull") {
    return {
      lineStyle: { stroke: "#c89b5f", strokeDasharray: "none" },
      haloStyle: { stroke: "#c89b5f" },
    };
  }

  // 4. Category-based coloring for LENS connections using lensId or fallback to first lensRef
  const lensId = connection.lensId ?? (connection.lensRefs && connection.lensRefs.length > 0 ? connection.lensRefs[0].lensId : undefined);
  switch (lensId) {
    case "route":
      return {
        lineStyle: { stroke: "#10b981", strokeDasharray: dashArray ?? "none" },
        haloStyle: { stroke: "#0d9488" },
      };
    case "mythology":
      return {
        lineStyle: { stroke: "#f59e0b", strokeDasharray: dashArray ?? "8 6" },
        haloStyle: { stroke: "#d97706" },
      };
    case "people":
      return {
        lineStyle: { stroke: "#f43f5e", strokeDasharray: dashArray ?? "none" },
        haloStyle: { stroke: "#e11d48" },
      };
    case "religion":
      return {
        lineStyle: { stroke: "#a855f5", strokeDasharray: dashArray ?? "8 6" },
        haloStyle: { stroke: "#7c3aed" },
      };
    default:
      if (connection.origin === "suggestion") {
        return {
          lineStyle: { stroke: "#d7a6ff", strokeDasharray: dashArray ?? "4 8" },
          haloStyle: { stroke: "#c084fc" },
        };
      }
      return {
        lineStyle: { stroke: "#2dd4bf", strokeDasharray: dashArray ?? "none" },
        haloStyle: { stroke: "#0f766e" },
      };
  }
}

export function isConnectionDimmed(
  connection: MapConnectionProjection,
  highlightedSpotIds?: string[],
): boolean {
  if (!highlightedSpotIds || highlightedSpotIds.length === 0) return false;
  return !connection.points.some((p) =>
    highlightedSpotIds.includes(p.id) ||
    (p.spotId && highlightedSpotIds.includes(p.spotId))
  );
}

export function filterConnectionsByVisibility(
  connections: MapConnectionProjection[],
  visibility: ConnectionLayerVisibility,
  recognitionLens?: string,
): MapConnectionProjection[] {
  return connections.filter((connection) => {
    if (connection.connectionKind === "itinerary") {
      return visibility.itinerary;
    }
    if (!visibility.lens) return false;
    if (recognitionLens === "overview") return false;
    if (recognitionLens) {
      return connectionBelongsToLens(connection, recognitionLens);
    }
    return true;
  });
}

export type MapProjector = {
  project: (coord: [number, number]) => { x: number; y: number };
  getContainer: () => { clientWidth: number; clientHeight: number };
};

export function projectConnectionSegments(
  connection: MapConnectionProjection,
  projector: MapProjector,
): RenderableConnectionSegment[] {
  if (connection.points.length < 2) return [];
  if (connection.displayMode === "focus-only" || connection.displayMode === "hull") return [];

  const container = projector.getContainer();
  const viewport = {
    width: container.clientWidth,
    height: container.clientHeight,
  };

  // If points mode with 1st point as anchor (e.g. Itsukushima shrine to auxiliary shrines),
  // draw star/radial lines connecting anchor to all other points
  if (connection.displayMode === "points") {
    const anchorPoint = connection.points[0];
    const anchorProjected = projector.project([anchorPoint.longitude, anchorPoint.latitude]);

    const segments: RenderableConnectionSegment[] = [];
    for (let i = 1; i < connection.points.length; i++) {
      const targetPoint = connection.points[i];
      const targetProjected = projector.project([targetPoint.longitude, targetPoint.latitude]);
      const pair = [anchorProjected, targetProjected];
      segments.push({
        id: `${connection.id}:radial-${i}`,
        points: `${anchorProjected.x},${anchorProjected.y} ${targetProjected.x},${targetProjected.y}`,
        hitPath: buildConnectionHitPath(pair, 48, viewport),
      });
    }
    return segments;
  }

  // Standard polyline connection
  const projected = connection.points.map((point) =>
    projector.project([point.longitude, point.latitude]),
  );

  return [
    {
      id: connection.id,
      points: projected.map(({ x, y }) => `${x},${y}`).join(" "),
      hitPath: buildConnectionHitPath(projected, 48, viewport),
    },
  ];
}

export function projectConnectionGeometry(
  connection: MapConnectionProjection,
  projector: MapProjector,
): ConnectionGeometry {
  if (connection.points.length < 2) return { segments: [] };
  if (connection.displayMode === "focus-only") return { segments: [] };

  if (connection.displayMode === "hull") {
    const projected = connection.points.map((point) =>
      projector.project([point.longitude, point.latitude]),
    );
    const hullVertices = computeConvexHull(projected);
    if (hullVertices.length >= 3) {
      return {
        segments: [],
        hullPoints: hullVertices
          .map(({ x, y }) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
          .join(" "),
      };
    }
    return { segments: [] };
  }

  if (connection.displayMode === "perimeter") {
    const projected = connection.points.map((point) =>
      projector.project([point.longitude, point.latitude]),
    );
    if (projected.length >= 3) {
      return {
        segments: [],
        perimeterPoints: projected
          .map(({ x, y }) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
          .join(" "),
      };
    }
    return {
      segments: projectConnectionSegments(connection, projector),
    };
  }

  return {
    segments: projectConnectionSegments(connection, projector),
  };
}

export type RenderableAreaZone = {
  id: string;
  label: string;
  cx: number;
  cy: number;
  radiusPx: number;
  radiusKm: number;
  isExplored: boolean;
  visitedSpotCount: number;
  isActive: boolean;
};

/**
 * 広域エリア（spatialGranularity === "area"）の代表座標＋半径（areaRadiusKm）を
 * 現在の地図ズーム・投影に合わせた透明な地理的円（SVG <circle>）として投影する純粋関数。
 * 複数ルートに跨る同一エリアは id で重複排除し、大円を背面・小円を前面にするため半径降順で返す。
 */
export function projectAreaZoneCircles(
  connections: MapConnectionProjection[],
  projector: MapProjector,
  options: {
    activeConnectionId?: string;
    activeFocusPointId?: string;
  } = {},
): RenderableAreaZone[] {
  const byAreaId = new Map<
    string,
    {
      point: MapConnectionProjection["points"][number];
      isActive: boolean;
    }
  >();

  for (const connection of connections) {
    const isConnActive =
      Boolean(options.activeConnectionId) && connection.id === options.activeConnectionId;
    for (const point of connection.points) {
      if (point.spatialGranularity !== "area" || !point.areaRadiusKm || point.areaRadiusKm <= 0) {
        continue;
      }
      const isPointFocused =
        Boolean(options.activeFocusPointId) &&
        (point.id === options.activeFocusPointId || point.focusEntityId === options.activeFocusPointId);
      const isActive = isConnActive || isPointFocused;
      const existing = byAreaId.get(point.id);
      if (existing) {
        existing.isActive = existing.isActive || isActive;
      } else {
        byAreaId.set(point.id, { point, isActive });
      }
    }
  }

  const zones: RenderableAreaZone[] = [];
  for (const { point, isActive } of byAreaId.values()) {
    const radiusKm = point.areaRadiusKm!;
    const center = projector.project([point.longitude, point.latitude]);
    const kmPerDegLng = Math.max(1e-3, 111.32 * Math.cos((point.latitude * Math.PI) / 180));
    const eastEdge = projector.project([point.longitude + radiusKm / kmPerDegLng, point.latitude]);
    const rawRadiusPx = Math.hypot(eastEdge.x - center.x, eastEdge.y - center.y);
    const radiusPx = Math.round(Math.max(10, rawRadiusPx) * 10) / 10;
    const visitedSpotCount = point.areaVisitedSpotCount ?? 0;

    zones.push({
      id: point.id,
      label: point.label,
      cx: Math.round(center.x * 10) / 10,
      cy: Math.round(center.y * 10) / 10,
      radiusPx,
      radiusKm,
      isExplored: visitedSpotCount > 0,
      visitedSpotCount,
      isActive,
    });
  }

  // Draw larger regions behind smaller nested regions (e.g., Northern Kyushu behind Asakura/Chikugo)
  return zones.sort((a, b) => b.radiusPx - a.radiusPx);
}

export function useConnectionLines({
  map,
  mapRevision,
  connections,
  activeConnectionId,
  activeFocusPointId,
  visibility = { itinerary: true, lens: true },
  recognitionLens,
  highlightedSpotIds,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  connections: MapConnectionProjection[];
  activeConnectionId: string;
  activeFocusPointId?: string;
  visibility?: ConnectionLayerVisibility;
  recognitionLens?: string;
  highlightedSpotIds?: string[];
}) {
  const [geometries, setGeometries] = useState<Record<string, ConnectionGeometry>>({});
  const [areaZones, setAreaZones] = useState<RenderableAreaZone[]>([]);

  // 1. Filter connections by user-toggled layer visibility and selected recognition lens
  const filteredConnections = useMemo(() => {
    return filterConnectionsByVisibility(connections, visibility, recognitionLens);
  }, [connections, visibility, recognitionLens]);

  // 2. Synchronize SVG screen projections on map move / zoom / resize (rAF throttled for smooth 60fps)
  useEffect(() => {
    if (!mapRevision || !map) return;

    let rafId: number | null = null;

    const syncConnections = () => {
      const result: Record<string, ConnectionGeometry> = {};

      for (const connection of filteredConnections) {
        const geom = projectConnectionGeometry(connection, map);
        if (geom.segments.length > 0 || geom.hullPoints || geom.perimeterPoints) {
          result[connection.id] = geom;
        }
      }

      setGeometries(result);
      setAreaZones(
        projectAreaZoneCircles(filteredConnections, map, {
          activeConnectionId,
          activeFocusPointId,
        }),
      );
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        syncConnections();
        rafId = null;
      });
    };

    map.on("move", scheduleSync);
    map.on("zoom", scheduleSync);
    map.on("resize", scheduleSync);
    map.on("rotate", scheduleSync);
    map.on("pitch", scheduleSync);
    syncConnections();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      map.off("move", scheduleSync);
      map.off("zoom", scheduleSync);
      map.off("resize", scheduleSync);
      map.off("rotate", scheduleSync);
      map.off("pitch", scheduleSync);
    };
  }, [activeConnectionId, activeFocusPointId, filteredConnections, map, mapRevision]);

  // 3. Prepare renderable items with styles and segments
  const renderableLines: RenderableConnectionLine[] = useMemo(() => {
    return filteredConnections.flatMap((connection) => {
      const geom = geometries[connection.id];
      if (!geom || (geom.segments.length === 0 && !geom.hullPoints && !geom.perimeterPoints)) return [];

      const selected = connection.id === activeConnectionId;
      const { lineStyle, haloStyle } = resolveConnectionAppearance(
        connection,
        selected,
      );
      const themeColor = connection.appearance?.color ?? lineStyle.stroke ?? "#c89b5f";

      // ADR-0025 Principle 4: Visual-Only Orthogonality (Dim non-matching connections in stratum filtering)
      const isDimmed = isConnectionDimmed(connection, highlightedSpotIds);

      return [
        {
          id: connection.id,
          connection,
          selected,
          emphasized: connection.emphasized,
          isDimmed,
          origin: connection.origin,
          lensCategory: connection.lensId ?? "other",
          displayMode: connection.displayMode,
          segments: geom.segments,
          hullPoints: geom.hullPoints,
          perimeterPoints: geom.perimeterPoints,
          themeColor,
          lineStyle,
          haloStyle,
        },
      ];
    });
  }, [activeConnectionId, filteredConnections, geometries, highlightedSpotIds]);

  return {
    renderableLines,
    renderableAreaZones: areaZones,
    filteredConnections,
  };
}

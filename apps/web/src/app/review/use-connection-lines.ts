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
  if (selected) {
    return {
      lineStyle: { stroke: "#ffffff", strokeDasharray: "none" },
      haloStyle: { stroke: "#f0cf80" },
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
        strokeDasharray: connection.appearance.dashArray?.join(" "),
      },
      haloStyle: { stroke: connection.appearance.color },
    };
  }

  // 3. Category-based coloring for LENS connections using lensId or fallback to first lensRef
  const lensId = connection.lensId ?? (connection.lensRefs && connection.lensRefs.length > 0 ? connection.lensRefs[0].lensId : undefined);
  switch (lensId) {
    case "route":
      return {
        lineStyle: { stroke: "#10b981", strokeDasharray: "none" },
        haloStyle: { stroke: "#0d9488" },
      };
    case "mythology":
      return {
        lineStyle: { stroke: "#f59e0b", strokeDasharray: "8 6" },
        haloStyle: { stroke: "#d97706" },
      };
    case "people":
      return {
        lineStyle: { stroke: "#f43f5e", strokeDasharray: "none" },
        haloStyle: { stroke: "#e11d48" },
      };
    case "religion":
      return {
        lineStyle: { stroke: "#a855f5", strokeDasharray: "8 6" },
        haloStyle: { stroke: "#7c3aed" },
      };
    default:
      if (connection.origin === "suggestion") {
        return {
          lineStyle: { stroke: "#d7a6ff", strokeDasharray: "4 8" },
          haloStyle: { stroke: "#c084fc" },
        };
      }
      return {
        lineStyle: { stroke: "#2dd4bf", strokeDasharray: "none" },
        haloStyle: { stroke: "#0f766e" },
      };
  }

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
    // If fewer than 3 vertices (collinear), fallback to polyline segments
    return {
      segments: projectConnectionSegments(connection, projector),
    };
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

export function useConnectionLines({
  map,
  mapRevision,
  connections,
  activeConnectionId,
  visibility = { itinerary: true, lens: true },
  recognitionLens,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  connections: MapConnectionProjection[];
  activeConnectionId: string;
  visibility?: ConnectionLayerVisibility;
  recognitionLens?: string;
}) {
  const [geometries, setGeometries] = useState<Record<string, ConnectionGeometry>>({});

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
    syncConnections();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      map.off("move", scheduleSync);
      map.off("zoom", scheduleSync);
      map.off("resize", scheduleSync);
    };
  }, [filteredConnections, map, mapRevision]);

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

      return [
        {
          id: connection.id,
          connection,
          selected,
          emphasized: connection.emphasized,
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
  }, [activeConnectionId, filteredConnections, geometries]);

  return {
    renderableLines,
    filteredConnections,
  };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

import { buildConnectionHitPath } from "@/domain/map/hit-testing";
import type { MapConnectionProjection } from "@/domain/map/connections";

export type ConnectionLayerVisibility = {
  itinerary: boolean;
  lens: boolean;
};

export type RenderableConnectionSegment = {
  id: string;
  points: string;
  hitPath: string;
};

export type RenderableConnectionLine = {
  id: string;
  connection: MapConnectionProjection;
  selected: boolean;
  emphasized: boolean;
  origin: MapConnectionProjection["origin"];
  lensCategory: string;
  segments: RenderableConnectionSegment[];
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
      // Allow connections without lensId but with matching lensRefs as fallback
      const lensMatch =
        connection.lensId === recognitionLens ||
        (connection.lensRefs?.some((ref) => ref.lensId === recognitionLens) ?? false);
      return lensMatch;
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
        hitPath: buildConnectionHitPath(pair, 30, viewport),
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
      hitPath: buildConnectionHitPath(projected, 34, viewport),
    },
  ];
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
  const [geometries, setGeometries] = useState<
    Record<string, RenderableConnectionSegment[]>
  >({});

  // 1. Filter connections by user-toggled layer visibility and selected recognition lens
  const filteredConnections = useMemo(() => {
    return filterConnectionsByVisibility(connections, visibility, recognitionLens);
  }, [connections, visibility, recognitionLens]);

  // 2. Synchronize SVG screen projections on map move / zoom / resize
  useEffect(() => {
    if (!mapRevision || !map) return;

    const syncConnections = () => {
      const result: Record<string, RenderableConnectionSegment[]> = {};

      for (const connection of filteredConnections) {
        const segments = projectConnectionSegments(connection, map);
        if (segments.length > 0) {
          result[connection.id] = segments;
        }
      }

      setGeometries(result);
    };

    map.on("move", syncConnections);
    map.on("zoom", syncConnections);
    map.on("resize", syncConnections);
    syncConnections();

    return () => {
      map.off("move", syncConnections);
      map.off("zoom", syncConnections);
      map.off("resize", syncConnections);
    };
  }, [filteredConnections, map, mapRevision]);

  // 3. Prepare renderable items with styles and segments
  const renderableLines: RenderableConnectionLine[] = useMemo(() => {
    return filteredConnections.flatMap((connection) => {
      const segments = geometries[connection.id];
      if (!segments || segments.length === 0) return [];

      const selected = connection.id === activeConnectionId;
      const { lineStyle, haloStyle } = resolveConnectionAppearance(
        connection,
        selected,
      );

      return [
        {
          id: connection.id,
          connection,
          selected,
          emphasized: connection.emphasized,
          origin: connection.origin,
          lensCategory: connection.lensId ?? "other",
          segments,
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

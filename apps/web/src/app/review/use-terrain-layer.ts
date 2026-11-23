"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { ErrorEvent, Map as MapLibreMap } from "maplibre-gl";

import {
  INITIAL_TERRAIN_STATE,
  KUNISAKI_TERRAIN_SPIKE_VIEW,
  TERRAIN_FALLBACK_HILLSHADE_LAYER_ID,
  TERRAIN_RELIEF_HILLSHADE_LAYER_ID,
  isTerrainSourceError,
  reduceTerrainState,
  resolveTerrainDemConfig,
  type TerrainExaggeration,
} from "@/domain/map/terrain-config";

export function useTerrainLayer({
  map,
  mapRevision,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
}) {
  const config = useMemo(() => resolveTerrainDemConfig(), []);
  const [state, dispatch] = useReducer(reduceTerrainState, INITIAL_TERRAIN_STATE);
  const loadStartMsRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const enable3d = useCallback(() => {
    loadStartMsRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    dispatch({ type: "enable_3d" });
  }, []);

  const disable3d = useCallback(() => {
    loadStartMsRef.current = null;
    dispatch({ type: "disable_3d" });
  }, []);

  const toggle3d = useCallback(() => {
    if (stateRef.current.mode === "3d-terrain") {
      disable3d();
    } else {
      enable3d();
    }
  }, [disable3d, enable3d]);

  const setExaggeration = useCallback((exaggeration: TerrainExaggeration) => {
    dispatch({ type: "set_exaggeration", exaggeration });
  }, []);

  const dismissFallback = useCallback(() => {
    dispatch({ type: "dismiss_fallback" });
  }, []);

  const focusKunisakiSpikeView = useCallback(() => {
    if (stateRef.current.mode !== "3d-terrain") {
      loadStartMsRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
      dispatch({ type: "enable_3d" });
    }
    if (!map) return;
    map.easeTo({
      center: KUNISAKI_TERRAIN_SPIKE_VIEW.center,
      zoom: KUNISAKI_TERRAIN_SPIKE_VIEW.zoom,
      pitch: KUNISAKI_TERRAIN_SPIKE_VIEW.pitch,
      bearing: KUNISAKI_TERRAIN_SPIKE_VIEW.bearing,
      duration: 750,
    });
  }, [map]);

  // Apply MapLibre 3D Terrain / Relief Hillshade / 2D Fallback unidirectionally from React state (Principle 8)
  useEffect(() => {
    if (!mapRevision || !map) return;

    const setLayerVisibility = (layerId: string, visible: boolean) => {
      if (!map.getLayer(layerId)) return;
      const next = visible ? "visible" : "none";
      if (map.getLayoutProperty(layerId, "visibility") !== next) {
        map.setLayoutProperty(layerId, "visibility", next);
      }
    };

    const ensureDemSourceAndReliefLayer = () => {
      if (!map.getSource(config.sourceId)) {
        map.addSource(config.sourceId, {
          type: "raster-dem",
          tiles: [config.tileUrl],
          tileSize: config.tileSize,
          maxzoom: config.maxzoom,
          encoding: config.encoding,
          attribution: config.attribution,
        });
      }

      if (!map.getLayer(TERRAIN_RELIEF_HILLSHADE_LAYER_ID)) {
        const beforeLayerId = map.getLayer("paleo-hillshade") ? "paleo-hillshade" : undefined;
        map.addLayer(
          {
            id: TERRAIN_RELIEF_HILLSHADE_LAYER_ID,
            type: "hillshade",
            source: config.sourceId,
            layout: { visibility: "visible" },
            paint: {
              "hillshade-exaggeration": 0.48,
              "hillshade-shadow-color": "#0b1320",
              "hillshade-highlight-color": "#f6ecd2",
              "hillshade-accent-color": "#1e293b",
            },
          },
          beforeLayerId,
        );
      }
    };

    const applyTerrainState = () => {
      if (!map.isStyleLoaded()) return;

      if (state.mode === "3d-terrain") {
        try {
          ensureDemSourceAndReliefLayer();
          setLayerVisibility(TERRAIN_RELIEF_HILLSHADE_LAYER_ID, true);
          setLayerVisibility(TERRAIN_FALLBACK_HILLSHADE_LAYER_ID, false);
          map.setTerrain({
            source: config.sourceId,
            exaggeration: state.exaggeration,
          });
          if (map.getPitch() < 25) {
            map.easeTo({
              pitch: KUNISAKI_TERRAIN_SPIKE_VIEW.defaultPitchOnEnable,
              bearing: KUNISAKI_TERRAIN_SPIKE_VIEW.defaultBearingOnEnable,
              duration: 600,
            });
          }
        } catch (error) {
          try {
            map.setTerrain(null);
          } catch {
            // ignore cleanup failure
          }
          setLayerVisibility(TERRAIN_RELIEF_HILLSHADE_LAYER_ID, false);
          setLayerVisibility(TERRAIN_FALLBACK_HILLSHADE_LAYER_ID, true);
          dispatch({
            type: "dem_failed",
            reason:
              error instanceof Error
                ? `3D地形を初期化できませんでした（${error.message}）。2D陰影表示へフォールバックしました。`
                : "3D地形を初期化できなかったため、2D陰影表示へフォールバックしました。",
          });
        }
        return;
      }

      if (state.mode === "2d-fallback") {
        try {
          map.setTerrain(null);
        } catch {
          // ignore cleanup failure
        }
        setLayerVisibility(TERRAIN_RELIEF_HILLSHADE_LAYER_ID, false);
        setLayerVisibility(TERRAIN_FALLBACK_HILLSHADE_LAYER_ID, true);
        if (map.getPitch() > 0 || Math.abs(map.getBearing()) > 0.5) {
          map.easeTo({ pitch: 0, bearing: 0, duration: 450 });
        }
        return;
      }

      // mode === "2d"
      try {
        map.setTerrain(null);
      } catch {
        // ignore cleanup failure
      }
      setLayerVisibility(TERRAIN_RELIEF_HILLSHADE_LAYER_ID, false);
      setLayerVisibility(TERRAIN_FALLBACK_HILLSHADE_LAYER_ID, false);
      if (map.getPitch() > 0 || Math.abs(map.getBearing()) > 0.5) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 450 });
      }
    };

    const handleSourceData = (event: { sourceId?: string; isSourceLoaded?: boolean }) => {
      if (stateRef.current.mode !== "3d-terrain" || stateRef.current.status !== "loading") return;
      if (event.sourceId !== config.sourceId) return;
      if (event.isSourceLoaded || map.isSourceLoaded(config.sourceId)) {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const elapsed = loadStartMsRef.current !== null ? now - loadStartMsRef.current : 0;
        dispatch({ type: "dem_loaded", loadDurationMs: elapsed });
      }
    };

    const handleIdle = () => {
      if (stateRef.current.mode !== "3d-terrain" || stateRef.current.status !== "loading") return;
      if (map.getSource(config.sourceId) && map.isSourceLoaded(config.sourceId)) {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const elapsed = loadStartMsRef.current !== null ? now - loadStartMsRef.current : 0;
        dispatch({ type: "dem_loaded", loadDurationMs: elapsed });
      }
    };

    const handleError = (event: ErrorEvent & { sourceId?: string }) => {
      if (stateRef.current.mode !== "3d-terrain") return;
      if (!isTerrainSourceError(event, config)) return;
      dispatch({
        type: "dem_failed",
        reason: "標高タイルの取得に失敗したため、地理院2D陰影表示へ自動フォールバックしました。",
      });
    };

    applyTerrainState();
    map.on("load", applyTerrainState);
    map.on("styledata", applyTerrainState);
    map.on("sourcedata", handleSourceData);
    map.on("idle", handleIdle);
    map.on("error", handleError);

    return () => {
      map.off("load", applyTerrainState);
      map.off("styledata", applyTerrainState);
      map.off("sourcedata", handleSourceData);
      map.off("idle", handleIdle);
      map.off("error", handleError);
    };
  }, [config, map, mapRevision, state.exaggeration, state.mode]);

  return {
    config,
    state,
    is3dActive: state.mode === "3d-terrain",
    isFallback: state.mode === "2d-fallback",
    enable3d,
    disable3d,
    toggle3d,
    setExaggeration,
    dismissFallback,
    focusKunisakiSpikeView,
  };
}

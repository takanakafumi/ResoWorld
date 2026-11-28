"use client";

import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

import { decideCameraCommand, resolveFitTarget, type SceneCamera } from "@/domain/map/camera-policy";
import type { GeoCoordinate } from "@/domain/map/field-search";
import type { ReviewAtlasSpot } from "@/domain/review/types";

type ViewportPoint = {
  id: string;
  latitude: number;
  longitude: number;
};

type UseMapCameraControlsOptions = {
  mapRef: MutableRefObject<MapLibreMap | null>;
  mapRevision: number;
  camera: SceneCamera;
  viewportPoints: readonly ViewportPoint[];
  spots: readonly ReviewAtlasSpot[];
  userLocationMarkerClassName: string;
};

export function useMapCameraControls({
  mapRef,
  mapRevision,
  camera,
  viewportPoints,
  spots,
  userLocationMarkerClassName,
}: UseMapCameraControlsOptions) {
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const lastPannedTargetRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  const [locatingStatus, setLocatingStatus] = useState<"idle" | "locating" | "located" | "error">("idle");
  const [locatingMessage, setLocatingMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);

  const sceneRef = useRef({ camera, viewportPoints, spots });
  sceneRef.current = { camera, viewportPoints, spots };

  const cameraKey = camera.mode === "point"
    ? `point:${camera.reason}:${camera.point.id}:${camera.point.longitude}:${camera.point.latitude}:${camera.panCamera ? "pan" : "static"}`
    : camera.mode === "bounds"
      ? `bounds:${camera.reason}:${camera.topicKey ?? ""}:${camera.maxZoom}:${camera.points.map((point) => `${point.id}:${point.longitude}:${point.latitude}`).join("|")}`
      : "none";

  const [autoCameraZoom, setAutoCameraZoom] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("resoworld.atlas.autoCameraZoom") === "true";
  });

  const handleToggleAutoCameraZoom = useCallback((enabled: boolean) => {
    setAutoCameraZoom(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("resoworld.atlas.autoCameraZoom", String(enabled));
    }
  }, []);

  // Stable identity: reads the latest scene via ref so it never retriggers effects.
  const handleFitCamera = useCallback((explicitCamera?: SceneCamera) => {
    const map = mapRef.current;
    if (!map) return;
    const { camera: latestCamera, viewportPoints: latestViewport, spots: latestSpots } = sceneRef.current;
    const cam = explicitCamera ?? latestCamera;
    const target = resolveFitTarget(cam, [...latestViewport], [...latestSpots]);
    if (!target) return;
    if (target.kind === "point") {
      // Explicit user action (fit button): framing the point closely is expected.
      map.easeTo({ center: [target.longitude, target.latitude], zoom: Math.max(map.getZoom(), 11), duration: 500 });
      return;
    }
    const coordinates = target.points.map((point) => [point.longitude, point.latitude] as [number, number]);
    const bounds = coordinates.reduce(
      (result, coordinate) => result.extend(coordinate),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    map.fitBounds(bounds, { padding: 72, duration: 500, maxZoom: target.maxZoom });
  }, [mapRef]);

  // Pan only; zoom is left to the user.
  const handlePanToPoint = useCallback((longitude: number, latitude: number) => {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 10.5);
    map.easeTo({ center: [longitude, latitude], zoom: targetZoom, duration: 600 });
  }, [mapRef]);

  // Move camera to device's current GPS position and place a current-location marker
  const handleLocateCurrentPosition = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocatingStatus("error");
      setLocatingMessage("お使いのブラウザは現在地取得に対応していません");
      return;
    }
    setLocatingStatus("locating");
    setLocatingMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        if (map) {
          if (!userLocationMarkerRef.current) {
            const el = document.createElement("div");
            el.className = userLocationMarkerClassName;
            el.title = "現在地";
            el.setAttribute("aria-label", "現在地");
            userLocationMarkerRef.current = new maplibregl.Marker({
              element: el,
              anchor: "center",
            })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            userLocationMarkerRef.current.setLngLat([longitude, latitude]);
          }
          map.easeTo({
            center: [longitude, latitude],
            zoom: Math.max(map.getZoom(), 13),
            duration: 650,
          });
        }
        setUserLocation({ latitude, longitude });
        setLocatingStatus("located");
        setLocatingMessage(null);
      },
      (error) => {
        setLocatingStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setLocatingMessage("位置情報の利用が許可されていません");
        } else if (error.code === error.TIMEOUT) {
          setLocatingMessage("現在地の取得がタイムアウトしました");
        } else {
          setLocatingMessage("現在地を取得できませんでした");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, [mapRef, userLocationMarkerClassName]);

  const clearLastPannedTarget = useCallback(() => {
    lastPannedTargetRef.current = null;
  }, []);

  const cleanupUserLocationMarker = useCallback(() => {
    userLocationMarkerRef.current?.remove();
    userLocationMarkerRef.current = null;
  }, []);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;

    const { command, nextPannedKey } = decideCameraCommand({
      camera,
      isInitial: isInitialLoadRef.current,
      autoZoom: autoCameraZoom,
      lastPannedKey: lastPannedTargetRef.current,
    });

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
    lastPannedTargetRef.current = nextPannedKey;

    if (command.type === "fit") {
      handleFitCamera(camera);
    } else if (command.type === "pan") {
      handlePanToPoint(command.longitude, command.latitude);
    }
  }, [cameraKey, mapRevision, autoCameraZoom, handleFitCamera, handlePanToPoint, camera, mapRef]);

  return {
    autoCameraZoom,
    locatingStatus,
    locatingMessage,
    setLocatingMessage,
    userLocation,
    handleToggleAutoCameraZoom,
    handleFitCamera,
    handlePanToPoint,
    handleLocateCurrentPosition,
    clearLastPannedTarget,
    cleanupUserLocationMarker,
  };
}

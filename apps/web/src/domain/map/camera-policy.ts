import type { MapSceneProjection } from "./scene";

export type SceneCamera = MapSceneProjection["camera"];
type CameraPoint = { id: string; longitude: number; latitude: number };

/**
 * Camera movement policy (single source of truth).
 *
 * The camera may move ONLY when:
 *  1. initial load            -> fit
 *  2. LENS asked for a node   -> pan (once per target, zoom untouched)
 *  3. auto-zoom is ON and the scene produced a `bounds` camera -> fit
 *  4. the user presses the "fit" button (handled outside this function)
 *
 * Everything else (selecting on the MAP, closing the inspector, clicking the
 * background, re-rendering) must yield `none`.
 */
export type CameraCommand =
  | { type: "none" }
  | { type: "fit" }
  | { type: "pan"; longitude: number; latitude: number };

export function panTargetKey(point: CameraPoint) {
  return `${point.id}:${point.longitude}:${point.latitude}`;
}

export function decideCameraCommand({
  camera,
  isInitial,
  autoZoom,
  lastPannedKey,
}: {
  camera: SceneCamera;
  isInitial: boolean;
  autoZoom: boolean;
  lastPannedKey: string | null;
}): { command: CameraCommand; nextPannedKey: string | null } {
  if (isInitial) return { command: { type: "fit" }, nextPannedKey: null };

  if (camera.mode === "point") {
    if (camera.panCamera) {
      const key = panTargetKey(camera.point);
      if (key === lastPannedKey) return { command: { type: "none" }, nextPannedKey: key };
      return {
        command: { type: "pan", longitude: camera.point.longitude, latitude: camera.point.latitude },
        nextPannedKey: key,
      };
    }
    // Selected on the MAP itself: never move, and forget the last LENS pan target
    // so the same node can be panned to again later.
    return { command: { type: "none" }, nextPannedKey: null };
  }

  if (camera.mode === "bounds" && autoZoom) {
    return { command: { type: "fit" }, nextPannedKey: null };
  }
  return { command: { type: "none" }, nextPannedKey: null };
}

export type FitTarget =
  | { kind: "point"; longitude: number; latitude: number }
  | { kind: "bounds"; points: CameraPoint[]; maxZoom: number };

/** Resolves what the explicit "fit" action should frame. */
export function resolveFitTarget(
  camera: SceneCamera,
  viewportPoints: readonly CameraPoint[],
  spots: readonly { id: string; longitude: number; latitude: number }[],
): FitTarget | null {
  if (camera.mode === "point") {
    return { kind: "point", longitude: camera.point.longitude, latitude: camera.point.latitude };
  }
  if (camera.mode === "bounds" && camera.points.length > 0) {
    return { kind: "bounds", points: [...camera.points], maxZoom: camera.maxZoom };
  }
  if (viewportPoints.length > 0) return { kind: "bounds", points: [...viewportPoints], maxZoom: 7.3 };
  if (spots.length > 0) {
    return {
      kind: "bounds",
      points: spots.map(({ id, longitude, latitude }) => ({ id, longitude, latitude })),
      maxZoom: 9,
    };
  }
  return null;
}

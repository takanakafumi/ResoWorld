import { describe, expect, it } from "vitest";

import { decideCameraCommand, resolveFitTarget, type SceneCamera } from "./camera-policy";

const point = { id: "a", label: "A", longitude: 130, latitude: 33, kind: "visited" as const };
const none: SceneCamera = { mode: "none", reason: "none", label: "現在の表示範囲" };
const lensPoint: SceneCamera = { mode: "point", reason: "lens-node", label: "A", point, panCamera: true };
const mapPoint: SceneCamera = { mode: "point", reason: "spot", label: "A", point, panCamera: false };
const bounds: SceneCamera = { mode: "bounds", reason: "connection", label: "B", points: [point, { ...point, id: "b", longitude: 131 }], maxZoom: 13 };

const decide = (camera: SceneCamera, o: Partial<{ isInitial: boolean; autoZoom: boolean; lastPannedKey: string | null }> = {}) =>
  decideCameraCommand({ camera, isInitial: false, autoZoom: false, lastPannedKey: null, ...o });

describe("camera policy", () => {
  it("fits once on initial load", () => {
    expect(decide(none, { isInitial: true }).command).toEqual({ type: "fit" });
  });

  it("never moves for a spot selected on the MAP", () => {
    expect(decide(mapPoint).command).toEqual({ type: "none" });
    expect(decide(mapPoint, { autoZoom: true }).command).toEqual({ type: "none" });
  });

  it("never moves when focus is cleared or nothing is selected", () => {
    expect(decide(none, { autoZoom: true }).command).toEqual({ type: "none" });
  });

  it("pans (without touching zoom) when LENS requests a node, only once per target", () => {
    const first = decide(lensPoint);
    expect(first.command).toEqual({ type: "pan", longitude: 130, latitude: 33 });
    expect(decide(lensPoint, { lastPannedKey: first.nextPannedKey }).command).toEqual({ type: "none" });
  });

  it("can pan to the same LENS node again after a MAP selection in between", () => {
    const afterMap = decide(mapPoint, { lastPannedKey: "a:130:33" });
    expect(afterMap.nextPannedKey).toBeNull();
    expect(decide(lensPoint, { lastPannedKey: afterMap.nextPannedKey }).command.type).toBe("pan");
  });

  it("fits bounds only when auto-zoom is on", () => {
    expect(decide(bounds).command).toEqual({ type: "none" });
    expect(decide(bounds, { autoZoom: true }).command).toEqual({ type: "fit" });
  });
});

describe("fit target", () => {
  const spots = [{ id: "s", longitude: 130.5, latitude: 33.5 }];
  it("frames the current camera, then viewport points, then visited spots", () => {
    expect(resolveFitTarget(mapPoint, [], spots)).toEqual({ kind: "point", longitude: 130, latitude: 33 });
    expect(resolveFitTarget(bounds, [], spots)).toMatchObject({ kind: "bounds", maxZoom: 13 });
    expect(resolveFitTarget(none, [point], spots)).toMatchObject({ kind: "bounds", maxZoom: 7.3 });
    expect(resolveFitTarget(none, [], spots)).toMatchObject({ kind: "bounds", maxZoom: 9 });
    expect(resolveFitTarget(none, [], [])).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  calculatePinchZoomPan,
  calculateCenterOnPan,
  calculateInertiaStep,
} from "./use-lens-zoom-pan";

describe("useLensZoomPan - MapLibre-style Pinch-to-Zoom & Pan Invariants", () => {
  describe("calculatePinchZoomPan (Touch Midpoint & Pinch Scaling)", () => {
    it("guarantees that the diagram point under touch anchor remains invariant during pinch zoom", () => {
      const currentZoom = 1.0;
      const currentPan = { x: 0, y: 0 };
      const anchorX = 250;
      const anchorY = 180;
      const scaleFactor = 1.4; // 40% zoom in

      const result = calculatePinchZoomPan({
        currentZoom,
        currentPan,
        anchorX,
        anchorY,
        scaleFactor,
      });

      expect(result.zoom).toBeCloseTo(1.4, 3);

      // Verify the invariant:
      // The screen coordinate of the content point under (anchorX, anchorY) must not change!
      // Before zoom: screenX = pan.x + zoom * contentX = 0 + 1.0 * 250 = 250
      // After zoom: screenX = result.pan.x + result.zoom * contentX
      //             = result.pan.x + 1.4 * 250
      const contentX = (anchorX - currentPan.x) / currentZoom; // 250
      const contentY = (anchorY - currentPan.y) / currentZoom; // 180

      const newScreenX = result.pan.x + result.zoom * contentX;
      const newScreenY = result.pan.y + result.zoom * contentY;

      expect(newScreenX).toBeCloseTo(anchorX, 2);
      expect(newScreenY).toBeCloseTo(anchorY, 2);
    });

    it("simultaneously pans and zooms when two fingers move across screen while pinching", () => {
      const currentZoom = 1.2;
      const currentPan = { x: -40, y: -20 };
      const anchorX = 300;
      const anchorY = 200;
      const scaleFactor = 1.25;
      const midDx = 35; // fingers shifted 35px right
      const midDy = -20; // fingers shifted 20px up

      const result = calculatePinchZoomPan({
        currentZoom,
        currentPan,
        anchorX,
        anchorY,
        scaleFactor,
        midDx,
        midDy,
      });

      expect(result.zoom).toBeCloseTo(1.5, 3);
      // Pan must include both the anchor scale adjustment and the midpoint translation
      const effectiveScale = result.zoom / currentZoom;
      const expectedPanX = anchorX - effectiveScale * (anchorX - currentPan.x) + midDx;
      const expectedPanY = anchorY - effectiveScale * (anchorY - currentPan.y) + midDy;

      expect(result.pan.x).toBeCloseTo(expectedPanX, 3);
      expect(result.pan.y).toBeCloseTo(expectedPanY, 3);
    });

    it("clamps zoom to minZoom and maxZoom bounds", () => {
      const zoomOut = calculatePinchZoomPan({
        currentZoom: 0.4,
        currentPan: { x: 0, y: 0 },
        anchorX: 200,
        anchorY: 200,
        scaleFactor: 0.2, // would be 0.08
        minZoom: 0.35,
        maxZoom: 4.0,
      });
      expect(zoomOut.zoom).toBe(0.35);

      const zoomIn = calculatePinchZoomPan({
        currentZoom: 3.5,
        currentPan: { x: 0, y: 0 },
        anchorX: 200,
        anchorY: 200,
        scaleFactor: 2.0, // would be 7.0
        minZoom: 0.35,
        maxZoom: 4.0,
      });
      expect(zoomIn.zoom).toBe(4.0);
    });
  });

  describe("calculateCenterOnPan (Center Node Focusing)", () => {
    it("centers a target node exactly in the middle of the viewBox at given zoom", () => {
      const targetX = 400;
      const targetY = 250;
      const targetZoom = 1.5;
      const viewBoxW = 800;
      const viewBoxH = 600;

      const pan = calculateCenterOnPan({
        targetX,
        targetY,
        targetZoom,
        viewBoxW,
        viewBoxH,
      });

      // ViewBox center cx = 400, cy = 300
      // pan.x = cx - targetX * zoom = 400 - 400 * 1.5 = 400 - 600 = -200
      // pan.y = cy - targetY * zoom = 300 - 250 * 1.5 = 300 - 375 = -75
      expect(pan).toEqual({ x: -200, y: -75 });

      // Verifying that under (pan.x, pan.y), target is at center (cx, cy):
      expect(pan.x + targetZoom * targetX).toBe(400);
      expect(pan.y + targetZoom * targetY).toBe(300);
    });
  });

  describe("calculateInertiaStep (Kinetic Momentum Deceleration)", () => {
    it("decelerates velocity by friction factor on each frame", () => {
      const step1 = calculateInertiaStep({ vx: 10, vy: -6, friction: 0.92 });
      expect(step1.nextVx).toBeCloseTo(9.2, 3);
      expect(step1.nextVy).toBeCloseTo(-5.52, 3);
      expect(step1.isStopped).toBe(false);

      // Drops below minSpeed
      const stepStop = calculateInertiaStep({ vx: 0.1, vy: 0.1, friction: 0.92, minSpeed: 0.2 });
      expect(stepStop.isStopped).toBe(true);
    });
  });
});

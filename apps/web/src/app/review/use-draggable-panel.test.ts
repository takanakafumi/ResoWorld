import { describe, expect, it } from "vitest";
import { calculateClampedPanelOffset } from "./use-draggable-panel";

describe("calculateClampedPanelOffset (Declarative panel dragging constraints)", () => {
  describe("anchorOrigin: 'top-right' (e.g. VISITED SPOT, TIME LAYER)", () => {
    it("moves freely within normal viewport limits", () => {
      const result = calculateClampedPanelOffset({
        dx: -150,
        dy: 120,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-right",
        viewportWidth: 1000,
        viewportHeight: 800,
      });

      expect(result).toEqual({ x: -150, y: 120 });
    });

    it("clamps positive X and negative Y to prevent sliding off top and right screen edges", () => {
      const result = calculateClampedPanelOffset({
        dx: 150,
        dy: -150,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-right",
        viewportWidth: 1000,
        viewportHeight: 800,
        margin: 20,
      });

      expect(result.x).toBe(20);
      expect(result.y).toBe(-20);
    });

    it("clamps negative X and positive Y so panel remains reachable at left and bottom edges", () => {
      const result = calculateClampedPanelOffset({
        dx: -3000,
        dy: 3000,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-right",
        viewportWidth: 1000,
        viewportHeight: 800,
        minVisible: 100,
      });

      // x: -(viewportWidth - minVisible) = -(1000 - 100) = -900
      // y: viewportHeight - minVisible = 800 - 100 = 700
      expect(result.x).toBe(-900);
      expect(result.y).toBe(700);
    });
  });

  describe("anchorOrigin: 'top-left' (e.g. MAP CONNECTION)", () => {
    it("moves freely within normal viewport limits", () => {
      const result = calculateClampedPanelOffset({
        dx: 200,
        dy: 150,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-left",
        viewportWidth: 1200,
        viewportHeight: 800,
      });

      expect(result).toEqual({ x: 200, y: 150 });
    });

    it("clamps negative X and negative Y to prevent sliding off top and left screen edges", () => {
      const result = calculateClampedPanelOffset({
        dx: -150,
        dy: -150,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-left",
        viewportWidth: 1200,
        viewportHeight: 800,
        margin: 20,
      });

      expect(result.x).toBe(-20);
      expect(result.y).toBe(-20);
    });

    it("clamps positive X and positive Y so panel remains reachable at right and bottom edges", () => {
      const result = calculateClampedPanelOffset({
        dx: 3000,
        dy: 3000,
        initialOffsetX: 0,
        initialOffsetY: 0,
        anchorOrigin: "top-left",
        viewportWidth: 1200,
        viewportHeight: 800,
        minVisible: 100,
      });

      // x: viewportWidth - minVisible = 1200 - 100 = 1100
      // y: viewportHeight - minVisible = 800 - 100 = 700
      expect(result.x).toBe(1100);
      expect(result.y).toBe(700);
    });

    it("accumulates delta onto existing offset correctly", () => {
      const result = calculateClampedPanelOffset({
        dx: 50,
        dy: -30,
        initialOffsetX: 100,
        initialOffsetY: 100,
        anchorOrigin: "top-left",
        viewportWidth: 1200,
        viewportHeight: 800,
      });

      expect(result).toEqual({ x: 150, y: 70 });
    });
  });
});

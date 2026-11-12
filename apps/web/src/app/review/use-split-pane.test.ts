import { describe, expect, it } from "vitest";
import {
  calculateClampedSplitPercent,
  SPLIT_PRESETS,
  type SplitPreset,
} from "./use-split-pane";

describe("useSplitPane - Layout Resizing and Collapse Logic", () => {
  describe("calculateClampedSplitPercent", () => {
    it("calculates exact percentage when within valid clamp range", () => {
      // 1000px container, pointer at 500px -> 50%
      const percent = calculateClampedSplitPercent({
        containerWidth: 1000,
        pointerX: 500,
        minLeftPx: 300,
        minRightPx: 300,
      });
      expect(percent).toBe(50);
    });

    it("clamps left boundary when pointer is dragged too far left", () => {
      // 1000px container, pointer at 100px (less than minLeftPx 320px)
      const percent = calculateClampedSplitPercent({
        containerWidth: 1000,
        pointerX: 100,
        minLeftPx: 320,
        minRightPx: 320,
      });
      // 320 / 1000 = 32%
      expect(percent).toBe(32);
    });

    it("clamps right boundary when pointer is dragged too far right", () => {
      // 1000px container, pointer at 900px (right space 100px < minRightPx 320px)
      const percent = calculateClampedSplitPercent({
        containerWidth: 1000,
        pointerX: 900,
        minLeftPx: 320,
        minRightPx: 320,
      });
      // (1000 - 320) / 1000 = 68%
      expect(percent).toBe(68);
    });

    it("gracefully falls back to 50% if container width is zero or invalid", () => {
      const percent = calculateClampedSplitPercent({
        containerWidth: 0,
        pointerX: 200,
      });
      expect(percent).toBe(50);
    });
  });

  describe("SPLIT_PRESETS", () => {
    it("defines clear 3-stage layout presets", () => {
      expect(SPLIT_PRESETS["map-wide"]).toBe(65);
      expect(SPLIT_PRESETS["balanced"]).toBe(50);
      expect(SPLIT_PRESETS["panel-wide"]).toBe(35);
    });
  });
});

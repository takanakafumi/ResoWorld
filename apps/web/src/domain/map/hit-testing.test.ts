import { describe, expect, it } from "vitest";

import { buildConnectionHitPath, findVisitedSpotAtScreenPoint } from "./hit-testing";

describe("map hit testing", () => {
  it("gives a visited marker priority when a line overlay receives the click", () => {
    const boxes = [{ id: "spot-a", left: 100, right: 180, top: 60, bottom: 120 }];

    expect(findVisitedSpotAtScreenPoint(boxes, { x: 140, y: 90 })).toBe("spot-a");
    expect(findVisitedSpotAtScreenPoint(boxes, { x: 90, y: 90 })).toBeUndefined();
  });

  it("chooses the nearest marker center when visited labels overlap", () => {
    const boxes = [
      { id: "selected", left: 80, right: 180, top: 60, bottom: 120 },
      { id: "underneath", left: 140, right: 220, top: 70, bottom: 130 },
    ];

    expect(findVisitedSpotAtScreenPoint(boxes, { x: 190, y: 100 })).toBe("underneath");
    expect(findVisitedSpotAtScreenPoint(boxes, { x: 110, y: 90 })).toBe("selected");
  });

  it("removes line hit areas around every connection endpoint", () => {
    expect(buildConnectionHitPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }], 20)).toBe(
      "M 20 0 L 80 0 M 120 0 L 180 0",
    );
  });

  it("keeps a minimal hit target when a short segment cannot preserve full endpoint clearances", () => {
    expect(buildConnectionHitPath([{ x: 0, y: 0 }, { x: 30, y: 0 }], 20)).toBe("M 11 0 L 19 0");
    expect(buildConnectionHitPath([{ x: 10, y: 10 }, { x: 10, y: 10 }], 20)).toBe("");
  });

  it("clips hit targets to the visible map viewport", () => {
    expect(buildConnectionHitPath(
      [{ x: 50, y: 50 }, { x: 500, y: 500 }],
      0,
      { width: 100, height: 100 },
    )).toBe("M 50 50 L 100 100");
    expect(buildConnectionHitPath(
      [{ x: -200, y: -100 }, { x: -50, y: -20 }],
      0,
      { width: 100, height: 100 },
    )).toBe("");
  });
});

import { describe, expect, it } from "vitest";

import { buildConnectionHitPath, findVisitedSpotAtScreenPoint } from "./hit-testing";

describe("map hit testing", () => {
  it("gives a visited marker priority when a line overlay receives the click", () => {
    const boxes = [{ id: "spot-a", left: 100, right: 180, top: 60, bottom: 120 }];

    expect(findVisitedSpotAtScreenPoint(boxes, { x: 140, y: 90 })).toBe("spot-a");
    expect(findVisitedSpotAtScreenPoint(boxes, { x: 90, y: 90 })).toBeUndefined();
  });

  it("removes line hit areas around every connection endpoint", () => {
    expect(buildConnectionHitPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }], 20)).toBe(
      "M 20 0 L 80 0 M 120 0 L 180 0",
    );
  });

  it("does not create a hit target for a segment covered by endpoint clearances", () => {
    expect(buildConnectionHitPath([{ x: 0, y: 0 }, { x: 30, y: 0 }], 20)).toBe("");
  });
});

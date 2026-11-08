import { describe, expect, it } from "vitest";
import { computeConvexHull, type ScreenPoint } from "./convex-hull";

describe("computeConvexHull", () => {
  it("handles empty or fewer than 3 points gracefully", () => {
    expect(computeConvexHull([])).toEqual([]);
    expect(computeConvexHull([{ x: 10, y: 10 }])).toEqual([{ x: 10, y: 10 }]);
    expect(computeConvexHull([{ x: 10, y: 10 }, { x: 20, y: 20 }])).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]);
  });

  it("computes convex hull of a triangle in counter-clockwise order", () => {
    const triangle: ScreenPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ];
    const hull = computeConvexHull(triangle);
    expect(hull).toHaveLength(3);
    // Vertices must contain all 3 points
    expect(hull).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ])
    );
  });

  it("excludes interior points from convex hull", () => {
    const squareWithInterior: ScreenPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 50, y: 50 }, // interior
      { x: 30, y: 30 }, // interior
    ];
    const hull = computeConvexHull(squareWithInterior);
    expect(hull).toHaveLength(4);
    expect(hull).not.toEqual(expect.arrayContaining([{ x: 50, y: 50 }]));
    expect(hull).not.toEqual(expect.arrayContaining([{ x: 30, y: 30 }]));
  });

  it("excludes collinear points on edges and keeps only extreme vertices", () => {
    const collinearEdge: ScreenPoint[] = [
      { x: 0, y: 0 },
      { x: 50, y: 0 }, // collinear point on bottom edge
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ];
    const hull = computeConvexHull(collinearEdge);
    expect(hull).toHaveLength(3);
    expect(hull).not.toEqual(expect.arrayContaining([{ x: 50, y: 0 }]));
  });

  it("deduplicates identical points", () => {
    const withDuplicates: ScreenPoint[] = [
      { x: 10, y: 10 },
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 20 },
    ];
    const hull = computeConvexHull(withDuplicates);
    expect(hull).toHaveLength(4);
  });
});

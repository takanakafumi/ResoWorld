export type ScreenPoint = {
  x: number;
  y: number;
};

/**
 * Cross product of vectors OA and OB: (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
 * > 0: counter-clockwise turn
 * < 0: clockwise turn
 * = 0: collinear
 */
function crossProduct(o: ScreenPoint, a: ScreenPoint, b: ScreenPoint): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Computes the 2D Convex Hull of an array of 2D screen points using
 * Andrew's Monotone Chain algorithm.
 *
 * Guarantees:
 * - O(N log N) runtime
 * - Returns outer vertices in counter-clockwise order
 * - Eliminates duplicate coordinates
 * - Excludes collinear boundary points (strictly convex polygon)
 * - Returns empty array or unique points when N < 3
 */
export function computeConvexHull(points: ScreenPoint[]): ScreenPoint[] {
  if (points.length <= 2) return [...points];

  // 1. Sort points lexicographically by X, then Y
  const sorted = [...points].sort((a, b) => {
    if (Math.abs(a.x - b.x) > 1e-6) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // 2. Remove duplicate / near-duplicate coordinates
  const unique: ScreenPoint[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = unique[unique.length - 1];
    if (!prev || Math.hypot(curr.x - prev.x, curr.y - prev.y) > 1e-4) {
      unique.push(curr);
    }
  }

  if (unique.length <= 2) return unique;

  // 3. Construct lower hull
  const lower: ScreenPoint[] = [];
  for (const p of unique) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // 4. Construct upper hull
  const upper: ScreenPoint[] = [];
  for (let i = unique.length - 1; i >= 0; i--) {
    const p = unique[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the duplicate last point of each half
  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

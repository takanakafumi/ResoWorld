export type ScreenPoint = { x: number; y: number };
export type SpotHitBox = { id: string; left: number; right: number; top: number; bottom: number };

export function findVisitedSpotAtScreenPoint(boxes: SpotHitBox[], point: ScreenPoint) {
  return boxes.find((box) => (
    point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom
  ))?.id;
}

export function buildConnectionHitPath(points: ScreenPoint[], endpointClearance = 34) {
  return points.slice(0, -1).flatMap((from, index) => {
    const to = points[index + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= endpointClearance * 2) return [];
    const x = dx / distance * endpointClearance;
    const y = dy / distance * endpointClearance;
    return [`M ${from.x + x} ${from.y + y} L ${to.x - x} ${to.y - y}`];
  }).join(" ");
}

export type ScreenPoint = { x: number; y: number };
export type SpotHitBox = { id: string; left: number; right: number; top: number; bottom: number };
export type ScreenViewport = { width: number; height: number };

export function findVisitedSpotAtScreenPoint(boxes: SpotHitBox[], point: ScreenPoint) {
  return boxes.find((box) => (
    point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom
  ))?.id;
}

function clipSegmentToViewport(from: ScreenPoint, to: ScreenPoint, viewport: ScreenViewport) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const boundaries = [
    [-dx, from.x],
    [dx, viewport.width - from.x],
    [-dy, from.y],
    [dy, viewport.height - from.y],
  ];
  let start = 0;
  let end = 1;
  for (const [direction, distance] of boundaries) {
    if (direction === 0) {
      if (distance < 0) return undefined;
      continue;
    }
    const ratio = distance / direction;
    if (direction < 0) start = Math.max(start, ratio);
    else end = Math.min(end, ratio);
    if (start > end) return undefined;
  }
  return {
    from: { x: from.x + start * dx, y: from.y + start * dy },
    to: { x: from.x + end * dx, y: from.y + end * dy },
  };
}

export function buildConnectionHitPath(points: ScreenPoint[], endpointClearance = 34, viewport?: ScreenViewport) {
  return points.slice(0, -1).flatMap((from, index) => {
    const to = points[index + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= endpointClearance * 2) return [];
    const x = dx / distance * endpointClearance;
    const y = dy / distance * endpointClearance;
    const shortened = {
      from: { x: from.x + x, y: from.y + y },
      to: { x: to.x - x, y: to.y - y },
    };
    const visible = viewport
      ? clipSegmentToViewport(shortened.from, shortened.to, viewport)
      : shortened;
    return visible ? [`M ${visible.from.x} ${visible.from.y} L ${visible.to.x} ${visible.to.y}`] : [];
  }).join(" ");
}

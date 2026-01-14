export type Point = { x: number; y: number };

export type Side = 'left' | 'right' | 'top' | 'bottom';

export type ConnectionRender =
  | { type: 'bezier'; p0: Point; p1: Point; p2: Point; p3: Point; d: string }
  | { type: 'orthogonal'; d: string; points: Point[] };

const CONTROL_DIST = 100;

export function computeConnectionRender(
  p0: Point,
  p3: Point,
  sideA: Side = 'right',
  sideB: Side = 'left'
): ConnectionRender {
  const distance = Math.hypot(p3.x - p0.x, p3.y - p0.y);
  const controlDist = CONTROL_DIST * Math.max(1, (distance / 2) / CONTROL_DIST);

  const p1 = getControlPoint(p0, sideA, controlDist);
  const p2 = getControlPoint(p3, sideB, controlDist);
  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
  return { type: 'bezier', p0, p1, p2, p3, d };
}

function getControlPoint(p: Point, side: Side, controlDist: number): Point {
  switch (side) {
    case 'left': return { x: p.x - controlDist, y: p.y };
    case 'right': return { x: p.x + controlDist, y: p.y };
    case 'top': return { x: p.x, y: p.y - controlDist };
    case 'bottom': return { x: p.x, y: p.y + controlDist };
    default: return { x: p.x + controlDist, y: p.y };
  }
}

export function isBezierValid(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  obstacles: Array<{ left: number; right: number; top: number; bottom: number }>
): boolean {
  const steps = 20;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
    const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

    for (const r of obstacles)
      if (x > r.left + 5 && x < r.right - 5 && y > r.top + 5 && y < r.bottom - 5)
        return false;
  }
  return true;
}

import { computeConnectionRender, isBezierValid } from './connectionMath';
import type { Point, ConnectionRender, Side } from './connectionMath';

export type Rect = { left: number; right: number; top: number; bottom: number; id?: string };

export type RoutedConnection = ConnectionRender;

const GRID_SIZE = 24;
const ARC_RADIUS = 12;

const dirs: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function rectContains(rect: Rect, p: Point): boolean {
  return p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom;
}

function expandRect(rect: Rect, pad: number): Rect {
  return { left: rect.left - pad, right: rect.right + pad, top: rect.top - pad, bottom: rect.bottom + pad };
}

function gridKey(x: number, y: number) {
  return `${x},${y}`;
}

function orthoConnect(p: Point, targetGrid: Point, side: Side): Point[] {
    const points: Point[] = [];
    if (side === 'left' || side === 'right') {
        points.push({ x: targetGrid.x, y: p.y });
    } else {
        points.push({ x: p.x, y: targetGrid.y });
    }
    points.push(targetGrid);
    return points;
}

function getSafeGridPoint(p: Point, side: Side, obstacles: Rect[]): Point {
    let dist = GRID_SIZE;
    let safePoint = { x: 0, y: 0 };
    let attempts = 0;

    while (attempts < 5) {
        let tx = p.x;
        let ty = p.y;
        switch (side) {
            case 'left': tx -= dist; break;
            case 'right': tx += dist; break;
            case 'top': ty -= dist; break;
            case 'bottom': ty += dist; break;
        }
        safePoint = {
            x: Math.round(tx / GRID_SIZE) * GRID_SIZE,
            y: Math.round(ty / GRID_SIZE) * GRID_SIZE
        };
        const inObstacle = obstacles.some(r => rectContains(r, safePoint));
        if (!inObstacle)
            return safePoint;
        dist += GRID_SIZE;
        attempts++;
    }
    return safePoint;
}

function aStar(start: Point, goal: Point, obstacles: Rect[], bounds: Rect): Point[] | null {
  const sx = Math.round(start.x / GRID_SIZE);
  const sy = Math.round(start.y / GRID_SIZE);
  const gx = Math.round(goal.x / GRID_SIZE);
  const gy = Math.round(goal.y / GRID_SIZE);

  const isBlocked = (x: number, y: number) => {
    const world: Point = { x: x * GRID_SIZE, y: y * GRID_SIZE };
    return obstacles.some((r) => rectContains(r, world));
  };

  const inBounds = (x: number, y: number) => {
    const wx = x * GRID_SIZE;
    const wy = y * GRID_SIZE;
    return wx >= bounds.left && wx <= bounds.right && wy >= bounds.top && wy <= bounds.bottom;
  };

  type Node = { x: number; y: number; g: number; f: number; parent?: Node };
  const open = new Map<string, Node>();
  const closed = new Set<string>();

  const h = (x: number, y: number) => Math.abs(x - gx) + Math.abs(y - gy);

  const startNode: Node = { x: sx, y: sy, g: 0, f: h(sx, sy) };
  open.set(gridKey(sx, sy), startNode);

  let iterations = 0;
  const maxIterations = 2000;

  while (open.size > 0) {
    iterations++;
    if (iterations > maxIterations) return null;

    let current: Node | null = null;
    for (const n of open.values()) {
      if (!current || n.f < current.f) current = n;
    }
    if (!current) break;

    const key = gridKey(current.x, current.y);
    open.delete(key);
    closed.add(key);

    if (current.x === gx && current.y === gy) {
      const path: Point[] = [];
      let n: Node | undefined = current;
      while (n) {
        path.push({ x: n.x * GRID_SIZE, y: n.y * GRID_SIZE });
        n = n.parent;
      }
      return path.reverse();
    }

    for (const d of dirs) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;
      const nkey = gridKey(nx, ny);

      if (closed.has(nkey)) continue;
      if (!inBounds(nx, ny)) continue;
      if (isBlocked(nx, ny)) continue;

      const g = current.g + 1;
      const existing = open.get(nkey);
      if (existing && g >= existing.g) continue;

      open.set(nkey, { x: nx, y: ny, g, f: g + h(nx, ny), parent: current });
    }
  }

  return null;
}

function simplifyOrthogonal(points: Point[]): Point[] {
  if (points.length <= 2) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (Math.abs(curr.x - prev.x) < 1 && Math.abs(curr.y - prev.y) < 1) continue;

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const isHorizontal = Math.abs(dy1) < 0.1 && Math.abs(dy2) < 0.1;
    const isVertical = Math.abs(dx1) < 0.1 && Math.abs(dx2) < 0.1;

    if (isHorizontal || isVertical) continue;

    out.push(curr);
  }
  out.push(points[points.length - 1]);
  return out;
}

function roundedPath(points: Point[], radius: number): { d: string } {
  if (points.length < 2) return { d: '' };
  const cmds: string[] = [];
  cmds.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];

    if (i === points.length - 1) {
      cmds.push(`L ${p1.x} ${p1.y}`);
      continue;
    }

    const p2 = points[i + 1];
    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const len1 = Math.abs(v1.x) + Math.abs(v1.y);
    const len2 = Math.abs(v2.x) + Math.abs(v2.y);

    const r = Math.min(radius, len1 / 2, len2 / 2);

    const before = {
      x: p1.x - (Math.abs(v1.x) > 0.1 ? Math.sign(v1.x) : 0) * r,
      y: p1.y - (Math.abs(v1.y) > 0.1 ? Math.sign(v1.y) : 0) * r,
    };
    const after = {
      x: p1.x + (Math.abs(v2.x) > 0.1 ? Math.sign(v2.x) : 0) * r,
      y: p1.y + (Math.abs(v2.y) > 0.1 ? Math.sign(v2.y) : 0) * r,
    };

    cmds.push(`L ${before.x} ${before.y}`);
    cmds.push(`Q ${p1.x} ${p1.y} ${after.x} ${after.y}`);
  }
  return { d: cmds.join(' ') };
}

function computeBounds(points: Point[], obstacles: Rect[]): Rect {
  let minX = Math.min(...points.map((p) => p.x));
  let maxX = Math.max(...points.map((p) => p.x));
  let minY = Math.min(...points.map((p) => p.y));
  let maxY = Math.max(...points.map((p) => p.y));
  for (const r of obstacles) {
    minX = Math.min(minX, r.left);
    maxX = Math.max(maxX, r.right);
    minY = Math.min(minY, r.top);
    maxY = Math.max(maxY, r.bottom);
  }
  const pad = 300;
  return { left: minX - pad, right: maxX + pad, top: minY - pad, bottom: maxY + pad };
}

function getSimpleOrthogonalPath(p0: Point, p3: Point): Point[] {
    const midX = (p0.x + p3.x) / 2;
    return [
        p0,
        { x: midX, y: p0.y },
        { x: midX, y: p3.y },
        p3
    ];
}

function isLineBlocked(p0: Point, p1: Point, obstacles: Rect[]): boolean {
  const minX = Math.min(p0.x, p1.x);
  const maxX = Math.max(p0.x, p1.x);
  const minY = Math.min(p0.y, p1.y);
  const maxY = Math.max(p0.y, p1.y);

  return obstacles.some(r => {
    return !(r.left > maxX || r.right < minX || r.top > maxY || r.bottom < minY);
  });
}

export function routeConnection(
  p0: Point,
  p3: Point,
  sideA: Side,
  sideB: Side,
  allObstacles: Rect[],
  _sourceNodeId?: string,
  _targetNodeId?: string
): RoutedConnection {

  // Check for straight line
  const isHorizontal = Math.abs(p0.y - p3.y) < 1;
  const isVertical = Math.abs(p0.x - p3.x) < 1;

  if (isHorizontal || isVertical) {
      // Check if blocked
      if (!isLineBlocked(p0, p3, allObstacles)) {
          return {
              type: 'orthogonal',
              d: `M ${p0.x} ${p0.y} L ${p3.x} ${p3.y}`,
              points: [p0, p3]
          };
      }
  }

  const obstaclesForBezier = allObstacles;

  const bezier = computeConnectionRender(p0, p3, sideA, sideB);

  if (bezier.type === 'bezier')
    if (isBezierValid(bezier.p0, bezier.p1, bezier.p2, bezier.p3, obstaclesForBezier))
      return bezier;

  const expandedObstacles = allObstacles.map(o => expandRect(o, 10));
  const bounds = computeBounds([p0, p3], allObstacles);

  const safeStart = getSafeGridPoint(p0, sideA, expandedObstacles);
  const safeEnd = getSafeGridPoint(p3, sideB, expandedObstacles);

  const path = aStar(safeStart, safeEnd, expandedObstacles, bounds);

  let finalPoints: Point[] = [];

  if (!path || path.length === 0)
    finalPoints = getSimpleOrthogonalPath(p0, p3);
  else {
    const bridgeStart = orthoConnect(p0, safeStart, sideA);
    const bridgeEnd = orthoConnect(p3, safeEnd, sideB).reverse();
    finalPoints = [p0, ...bridgeStart, ...path, ...bridgeEnd, p3];
  }

  const simplified = simplifyOrthogonal(finalPoints);
  const { d } = roundedPath(simplified, ARC_RADIUS);

  return { type: 'orthogonal', d, points: simplified };
}

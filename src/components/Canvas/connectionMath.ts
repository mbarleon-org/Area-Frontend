export type Point = { x: number; y: number };

export type ConnectionRender =
  | { type: 'line'; p0: Point; p3: Point }
  | { type: 'bezier'; p0: Point; p1: Point; p2: Point; p3: Point; d: string };

export const DEFAULT_VERTICAL_THRESHOLD = 5;

// Chooses straight line when ports are nearly aligned, otherwise returns a cubic Bézier path.
export function computeConnectionRender(
  p0: Point,
  p3: Point,
  verticalThreshold: number = DEFAULT_VERTICAL_THRESHOLD,
): ConnectionRender {
  const dy = Math.abs(p0.y - p3.y);
  if (dy <= verticalThreshold) {
    return { type: 'line', p0, p3 };
  }

  const dx = p3.x - p0.x;
  const tangent = dx * 0.5;
  const p1: Point = { x: p0.x + tangent, y: p0.y };
  const p2: Point = { x: p3.x - tangent, y: p3.y };
  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
  return { type: 'bezier', p0, p1, p2, p3, d };
}

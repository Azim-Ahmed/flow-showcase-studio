import { EdgeProps, useStore, Position } from "reactflow";
import {
  Point,
  Rect,
  polylineToRoundedPath,
  routeOrthogonal,
} from "./smartRouter";

function exitPoint(x: number, y: number, pos?: Position): Point {
  // small extension out of the node so the path leaves cleanly
  const off = 14;
  switch (pos) {
    case Position.Left:
      return { x: x - off, y };
    case Position.Right:
      return { x: x + off, y };
    case Position.Top:
      return { x, y: y - off };
    case Position.Bottom:
      return { x, y: y + off };
    default:
      return { x: x + off, y };
  }
}

export function SmartEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style,
}: EdgeProps) {
  const obstacles = useStore((s) => {
    const out: Rect[] = [];
    s.nodeInternals.forEach((n) => {
      if (n.id === source || n.id === target) return;
      const w = n.width ?? 180;
      const h = n.height ?? 60;
      out.push({
        x: n.positionAbsolute?.x ?? n.position.x,
        y: n.positionAbsolute?.y ?? n.position.y,
        w,
        h,
      });
    });
    return out;
  });

  const s = exitPoint(sourceX, sourceY, sourcePosition);
  const t = exitPoint(targetX, targetY, targetPosition);

  const pts = routeOrthogonal(s, t, obstacles, 18);
  const full: Point[] = [
    { x: sourceX, y: sourceY },
    ...pts,
    { x: targetX, y: targetY },
  ];
  const d = polylineToRoundedPath(full, 10);

  const stroke = (style as React.CSSProperties)?.stroke ?? "var(--accent)";
  const strokeWidth = (style as React.CSSProperties)?.strokeWidth ?? 1.75;

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={Number(strokeWidth) + (selected ? 0.75 : 0)}
        strokeDasharray="6 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.85}
        className="react-flow__edge-path"
      />
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
    </>
  );
}

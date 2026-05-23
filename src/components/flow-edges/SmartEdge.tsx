import { EdgeProps, useStore, Position } from "reactflow";
import {
  Point,
  Rect,
  polylineToRoundedPath,
  routeOrthogonal,
} from "./smartRouter";

function exitPoint(x: number, y: number, pos?: Position): Point {
  const off = 14;
  switch (pos) {
    case Position.Left:   return { x: x - off, y };
    case Position.Right:  return { x: x + off, y };
    case Position.Top:    return { x, y: y - off };
    case Position.Bottom: return { x, y: y + off };
    default:              return { x: x + off, y };
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
  const obstacles = useStore((store) => {
    const out: Rect[] = [];
    store.nodeInternals.forEach((n) => {
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
  const strokeWidth = Number((style as React.CSSProperties)?.strokeWidth ?? 1.75);
  const w = strokeWidth + (selected ? 0.75 : 0);

  return (
    <>
      {/* soft glow underlay */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 0.35 : 0.12}
        style={{ filter: "blur(3px)" }}
      />
      {/* solid path */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.9}
        className="react-flow__edge-path"
      />
      {/* animated dash overlay for life */}
      <path
        d={d}
        fill="none"
        stroke={stroke as string}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 10"
        opacity={selected ? 0.9 : 0.55}
        className="edge-animated"
      />
      {/* fat invisible hit target */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={20} />
    </>
  );
}

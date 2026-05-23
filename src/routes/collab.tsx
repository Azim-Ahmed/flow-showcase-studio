import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
} from "reactflow";
import { ExampleLayout } from "@/components/ExampleLayout";
import { FlowNode } from "@/components/flow-nodes/FlowNode";

export const Route = createFileRoute("/collab")({
  component: CollabPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live collaborative cursors — FlowLabs" },
      { name: "description", content: "Simulated multiplayer cursors gliding across the ReactFlow canvas with labels and selection halos." },
    ],
  }),
});

type Peer = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  nextAt: number;
  holding: string | null;
};

const peers: Omit<Peer, "x" | "y" | "tx" | "ty" | "nextAt" | "holding">[] = [
  { id: "p1", name: "Mira", color: "#2DD4BF" },
  { id: "p2", name: "Jules", color: "#F472B6" },
  { id: "p3", name: "Ren", color: "#FBBF24" },
];

const initialNodes: Node[] = [
  { id: "a", type: "flow", position: { x: 80, y: 80 }, data: { label: "Idea", kind: "source", sublabel: "Source" } },
  { id: "b", type: "flow", position: { x: 380, y: 60 }, data: { label: "Design", sublabel: "Process" } },
  { id: "c", type: "flow", position: { x: 380, y: 220 }, data: { label: "Prototype", sublabel: "Process", kind: "active" } },
  { id: "d", type: "flow", position: { x: 700, y: 140 }, data: { label: "Ship", sublabel: "Sink", kind: "sink" } },
];

const initialEdges: Edge[] = [
  { id: "a-b", source: "a", target: "b", animated: true, style: { stroke: "var(--accent)" } },
  { id: "a-c", source: "a", target: "c", animated: true, style: { stroke: "var(--accent)" } },
  { id: "b-d", source: "b", target: "d", animated: true, style: { stroke: "var(--accent)" } },
  { id: "c-d", source: "c", target: "d", animated: true, style: { stroke: "var(--accent)" } },
];

const nodeTypes = { flow: FlowNode };

function CollabPage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const [state, setState] = useState<Peer[]>(() =>
    peers.map((p, i) => ({
      ...p,
      x: 200 + i * 180,
      y: 200 + i * 30,
      tx: 200 + i * 180,
      ty: 200 + i * 30,
      nextAt: 0,
      holding: null,
    }))
  );

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!pausedRef.current) {
        setState((cur) =>
          cur.map((p) => {
            let { tx, ty, nextAt, holding } = p;
            if (now > nextAt) {
              tx = 40 + Math.random() * (size.w - 80);
              ty = 40 + Math.random() * (size.h - 80);
              nextAt = now + 1400 + Math.random() * 1800;
              holding = Math.random() < 0.5 ? initialNodes[Math.floor(Math.random() * initialNodes.length)].id : null;
            }
            const k = 1 - Math.exp(-dt / 220);
            return {
              ...p,
              tx,
              ty,
              nextAt,
              holding,
              x: p.x + (tx - p.x) * k,
              y: p.y + (ty - p.y) * k,
            };
          })
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h]);

  // Map node id -> peer color (for "presence" outline on the node).
  const presence = useMemo(() => {
    const m = new Map<string, string>();
    state.forEach((p) => {
      if (p.holding) m.set(p.holding, p.color);
    });
    return m;
  }, [state]);

  const decoratedNodes = useMemo(
    () =>
      nodes.map((n) => {
        const c = presence.get(n.id);
        if (!c) return n;
        return {
          ...n,
          style: {
            ...n.style,
            boxShadow: `0 0 0 2px ${c}, 0 0 28px -4px ${c}`,
            borderRadius: 12,
            transition: "box-shadow 200ms ease",
          },
        };
      }),
    [nodes, presence]
  );

  const controls = (
    <div className="space-y-3">
      {state.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="size-2.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
          <span className="text-sm">{p.name}</span>
          <span className="ml-auto text-[10px] font-mono uppercase tracking-widest" style={{ color: p.holding ? p.color : undefined }}>
            {p.holding ? `· ${p.holding}` : "idle"}
          </span>
        </div>
      ))}
      <button
        onClick={() => setPaused((v) => !v)}
        className="mt-2 w-full px-3 py-2 text-xs font-mono uppercase tracking-wider border border-border rounded-md hover:border-accent/50 hover:text-accent transition-colors"
      >
        {paused ? "Resume peers" : "Pause peers"}
      </button>
    </div>
  );

  return (
    <ExampleLayout
      index="07"
      category="Realtime"
      title="Live collaborative cursors"
      description="Three simulated peers glide across the canvas. When a peer 'holds' a node, that node lights up with their color — a drop-in presence pattern for multiplayer ReactFlow editors."
      controls={controls}
      keys={[
        { key: "Watch", label: "Cursors retarget every ~2s" },
        { key: "Halo", label: "Node glows when a peer holds it" },
        { key: "Pause", label: "Freeze the simulation" },
      ]}
    >
      <div ref={wrapperRef} className="absolute inset-0">
        <ReactFlow
          nodes={decoratedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(45,212,191,0.18)" />
          <Controls />
        </ReactFlow>
        <div className="pointer-events-none absolute inset-0 z-30">
          {state.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                filter: `drop-shadow(0 4px 12px ${p.color}55)`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 2 L19 11 L11 12 L8 19 Z"
                  fill={p.color}
                  stroke="#0b0f19"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <div
                className="mt-1 ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium text-canvas tracking-wide"
                style={{ background: p.color, boxShadow: `0 0 0 1px ${p.color}, 0 6px 16px -6px ${p.color}99` }}
              >
                {p.holding && <span className="size-1 rounded-full bg-canvas/70 animate-pulse" />}
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ExampleLayout>
  );
}

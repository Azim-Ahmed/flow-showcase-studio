import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  useReactFlow,
  NodeChange,
} from "reactflow";
import { ExampleLayout } from "@/components/ExampleLayout";
import { FlowNode } from "@/components/flow-nodes/FlowNode";

export const Route = createFileRoute("/intersection")({
  component: IntersectionPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Edge intersection detection — FlowLabs" },
      { name: "description", content: "Drag a node over an existing edge — it highlights, and on drop the node is spliced into the connection." },
    ],
  }),
});

// Distance from point to line segment
function distPointToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const initialNodes: Node[] = [
  { id: "a", type: "flow", position: { x: 80, y: 200 }, data: { label: "Source", kind: "source", sublabel: "Source" } },
  { id: "b", type: "flow", position: { x: 600, y: 200 }, data: { label: "Destination", kind: "sink", sublabel: "Sink" } },
  { id: "drag", type: "flow", position: { x: 320, y: 420 }, data: { label: "Drag me over the edge", kind: "active", sublabel: "Splice me" } },
];

const initialEdges: Edge[] = [
  { id: "a-b", source: "a", target: "b" },
];

const nodeTypes = { flow: FlowNode };

function IntersectionPage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const { getNode } = useReactFlow();

  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: hoverEdge === e.id ? "var(--accent)" : "color-mix(in oklab, var(--accent) 50%, transparent)",
          strokeWidth: hoverEdge === e.id ? 3.5 : 1.75,
          filter: hoverEdge === e.id ? "drop-shadow(0 0 8px var(--accent))" : undefined,
          transition: "stroke-width 120ms ease, stroke 120ms ease",
        },
      })),
    [edges, hoverEdge]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      const dragChange = changes.find((c) => c.type === "position" && c.dragging && c.id === "drag");
      if (dragChange && dragChange.type === "position") {
        const dn = getNode("drag");
        if (!dn) return;
        const cx = (dragChange.position?.x ?? dn.position.x) + (dn.width ?? 180) / 2;
        const cy = (dragChange.position?.y ?? dn.position.y) + (dn.height ?? 60) / 2;
        let closest: { id: string; d: number } | null = null;
        for (const e of edges) {
          if (e.source === "drag" || e.target === "drag") continue;
          const s = getNode(e.source);
          const t = getNode(e.target);
          if (!s || !t) continue;
          const sx = s.position.x + (s.width ?? 180) / 2;
          const sy = s.position.y + (s.height ?? 60) / 2;
          const tx = t.position.x + (t.width ?? 180) / 2;
          const ty = t.position.y + (t.height ?? 60) / 2;
          const d = distPointToSegment(cx, cy, sx, sy, tx, ty);
          if (!closest || d < closest.d) closest = { id: e.id, d };
        }
        setHoverEdge(closest && closest.d < 70 ? closest.id : null);
      }
      const dropChange = changes.find(
        (c) => c.type === "position" && c.dragging === false && c.id === "drag"
      );
      if (dropChange && hoverEdge) {
        const edge = edges.find((e) => e.id === hoverEdge);
        if (edge) {
          setEdges((eds) => [
            ...eds.filter((e) => e.id !== edge.id),
            { id: `${edge.source}-drag-${Date.now()}`, source: edge.source, target: "drag" },
            { id: `drag-${edge.target}-${Date.now()}`, source: "drag", target: edge.target },
          ]);
        }
        setHoverEdge(null);
      }
    },
    [onNodesChange, edges, getNode, hoverEdge, setEdges]
  );

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges]
  );

  const reset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHoverEdge(null);
  };

  return (
    <ExampleLayout
      index="04"
      category="Physics"
      title="Edge intersection detection"
      description="Drag the highlighted node over the connecting edge. We compute the distance from the node's center to each edge segment in real time — when it crosses a threshold the edge lights up and on drop the node is spliced into the connection."
      controls={
        <button
          onClick={reset}
          className="w-full px-3 py-2 text-xs font-mono uppercase tracking-wider border border-border rounded-md hover:border-accent/50 hover:text-accent transition-colors"
        >
          Reset graph
        </button>
      }
      keys={[
        { key: "Drag", label: "Move the active node" },
        { key: "Drop", label: "Splice into highlighted edge" },
      ]}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(45,212,191,0.18)" />
        <Controls />
      </ReactFlow>
    </ExampleLayout>
  );
}

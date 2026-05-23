import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
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
  useReactFlow,
} from "reactflow";
import { ExampleLayout } from "@/components/ExampleLayout";
import { FlowNode } from "@/components/flow-nodes/FlowNode";
import { SmartEdge } from "@/components/flow-edges/SmartEdge";

export const Route = createFileRoute("/layout")({
  component: LayoutPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Auto layout — FlowLabs" },
      { name: "description", content: "One-click hierarchical layered auto-layout for any ReactFlow graph." },
    ],
  }),
});

const seedNodes: Node[] = [
  { id: "1", type: "flow", position: { x: 0, y: 0 }, data: { label: "Webhook", kind: "source", sublabel: "Source" } },
  { id: "2", type: "flow", position: { x: 0, y: 0 }, data: { label: "Auth check", sublabel: "Process" } },
  { id: "3", type: "flow", position: { x: 0, y: 0 }, data: { label: "Rate limit", sublabel: "Process" } },
  { id: "4", type: "flow", position: { x: 0, y: 0 }, data: { label: "Parse body", sublabel: "Process" } },
  { id: "5", type: "flow", position: { x: 0, y: 0 }, data: { label: "Route by tenant", sublabel: "Router" } },
  { id: "6", type: "flow", position: { x: 0, y: 0 }, data: { label: "Free queue", sublabel: "Sink", kind: "sink" } },
  { id: "7", type: "flow", position: { x: 0, y: 0 }, data: { label: "Pro queue", sublabel: "Sink", kind: "sink" } },
  { id: "8", type: "flow", position: { x: 0, y: 0 }, data: { label: "Audit log", sublabel: "Sink", kind: "sink" } },
];

const seedEdges: Edge[] = [
  { id: "e1", source: "1", target: "2" },
  { id: "e2", source: "2", target: "3" },
  { id: "e3", source: "3", target: "4" },
  { id: "e4", source: "4", target: "5" },
  { id: "e5", source: "5", target: "6" },
  { id: "e6", source: "5", target: "7" },
  { id: "e7", source: "2", target: "8" },
  { id: "e8", source: "4", target: "8" },
];

const NODE_W = 200;
const NODE_H = 80;
const COL_GAP = 110;
const ROW_GAP = 30;

function layered(nodes: Node[], edges: Edge[]): Node[] {
  const inDeg = new Map<string, number>();
  const children = new Map<string, string[]>();
  nodes.forEach((n) => {
    inDeg.set(n.id, 0);
    children.set(n.id, []);
  });
  edges.forEach((e) => {
    if (!inDeg.has(e.target) || !children.has(e.source)) return;
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    children.get(e.source)!.push(e.target);
  });

  // Kahn-style longest-path layering
  const layer = new Map<string, number>();
  const queue: string[] = [];
  inDeg.forEach((d, id) => {
    if (d === 0) {
      layer.set(id, 0);
      queue.push(id);
    }
  });
  const localIn = new Map(inDeg);
  while (queue.length) {
    const id = queue.shift()!;
    const lv = layer.get(id) ?? 0;
    for (const c of children.get(id) ?? []) {
      layer.set(c, Math.max(layer.get(c) ?? 0, lv + 1));
      localIn.set(c, (localIn.get(c) ?? 0) - 1);
      if (localIn.get(c) === 0) queue.push(c);
    }
  }

  const byLayer = new Map<number, string[]>();
  nodes.forEach((n) => {
    const l = layer.get(n.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n.id);
  });

  const positions = new Map<string, { x: number; y: number }>();
  [...byLayer.keys()].sort((a, b) => a - b).forEach((l) => {
    const ids = byLayer.get(l)!;
    const colX = l * (NODE_W + COL_GAP);
    const totalH = ids.length * NODE_H + (ids.length - 1) * ROW_GAP;
    const startY = -totalH / 2;
    ids.forEach((id, i) => {
      positions.set(id, { x: colX, y: startY + i * (NODE_H + ROW_GAP) });
    });
  });

  return nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position }));
}

const nodeTypes = { flow: FlowNode };
const edgeTypes = { smart: SmartEdge };

function LayoutPage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(layered(seedNodes, seedEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(seedEdges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges]
  );

  const relayout = useCallback(() => {
    setNodes((nds) => layered(nds, edges));
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [edges, fitView, setNodes]);

  const shuffle = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        position: { x: Math.random() * 600, y: Math.random() * 400 },
      }))
    );
  }, [setNodes]);

  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smart",
        style: { stroke: "var(--accent)", strokeWidth: 1.75 },
      })),
    [edges]
  );

  const controls = (
    <div className="flex flex-col gap-2">
      <button
        onClick={relayout}
        className="px-4 py-2 bg-accent text-canvas font-semibold rounded-md text-sm hover:bg-accent/90 transition-colors"
      >
        Auto-arrange →
      </button>
      <button
        onClick={shuffle}
        className="px-4 py-2 border border-border bg-panel-2 text-foreground rounded-md text-sm hover:bg-panel transition-colors"
      >
        Shuffle positions
      </button>
    </div>
  );

  return (
    <ExampleLayout
      index="06"
      category="Layout"
      title="Hierarchical auto-layout"
      description="Runs a longest-path layered layout on any graph. Shuffle the nodes then click Auto-arrange to watch them snap into a clean DAG."
      controls={controls}
      keys={[
        { key: "Drag", label: "Move nodes manually" },
        { key: "Click", label: "Auto-arrange / Shuffle" },
      ]}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(45,212,191,0.18)" />
        <Controls />
      </ReactFlow>
    </ExampleLayout>
  );
}

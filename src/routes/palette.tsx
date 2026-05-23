import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, DragEvent } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { ExampleLayout } from "@/components/ExampleLayout";
import { FlowNode, FlowNodeData } from "@/components/flow-nodes/FlowNode";

export const Route = createFileRoute("/palette")({
  component: PalettePage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Drag & drop palette — FlowLabs" },
      { name: "description", content: "Drag node types from a side palette into the canvas to compose graphs visually." },
    ],
  }),
});

type PaletteItem = { kind: FlowNodeData["kind"]; label: string; sublabel: string };

const palette: PaletteItem[] = [
  { kind: "source", label: "New source", sublabel: "Source" },
  { kind: "process", label: "Transform", sublabel: "Process" },
  { kind: "active", label: "Live worker", sublabel: "Active" },
  { kind: "sink", label: "New sink", sublabel: "Sink" },
];

const initialNodes: Node[] = [
  { id: "seed-1", type: "flow", position: { x: 80, y: 120 }, data: { label: "Drag from the left →", sublabel: "Tip", kind: "source" } },
];

const nodeTypes = { flow: FlowNode };
let nodeId = 1;

function PalettePage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, animated: true, style: { stroke: "var(--accent)", strokeWidth: 1.75 } }, eds)
      ),
    [setEdges]
  );

  const onDragStart = (e: DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData("application/flowlabs", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/flowlabs");
      if (!raw || !rf || !wrapperRef.current) return;
      const item = JSON.parse(raw) as PaletteItem;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = rf.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      const id = `n-${++nodeId}`;
      setNodes((nds) => [
        ...nds,
        { id, type: "flow", position, data: { label: item.label, sublabel: item.sublabel, kind: item.kind } },
      ]);
    },
    [rf, setNodes]
  );

  // Delete-key removes selected nodes/edges
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      setNodes((nds) => applyNodeChanges(
        nds.filter((n) => n.selected).map((n) => ({ id: n.id, type: "remove" as const })),
        nds,
      ));
      setEdges((eds) => applyEdgeChanges(
        eds.filter((e) => e.selected).map((e) => ({ id: e.id, type: "remove" as const })),
        eds,
      ));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setNodes, setEdges]);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const controls = (
    <div className="grid gap-2">
      {palette.map((p) => (
        <div
          key={p.kind}
          draggable
          onDragStart={(e) => onDragStart(e, p)}
          className="cursor-grab active:cursor-grabbing select-none border border-border bg-panel-2 rounded-lg px-3 py-2 hover:border-accent/60 hover:translate-x-0.5 transition-all"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent">{p.sublabel}</div>
          <div className="text-sm">{p.label}</div>
        </div>
      ))}
      <button
        onClick={clearCanvas}
        className="mt-2 px-3 py-2 text-xs font-mono uppercase tracking-wider border border-border rounded-md hover:border-accent/50 hover:text-accent transition-colors"
      >
        Clear canvas
      </button>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 pt-1">
        {nodes.length} node{nodes.length === 1 ? "" : "s"} · {edges.length} edge{edges.length === 1 ? "" : "s"}
      </p>
    </div>
  );

  return (
    <ExampleLayout
      index="05"
      category="Authoring"
      title="Drag & drop palette"
      description="Drag any item from the palette into the canvas to spawn a new node. Wire them up by dragging between handles."
      controls={controls}
      keys={[
        { key: "Drag", label: "Drop from palette to canvas" },
        { key: "Click+Drag", label: "Connect node handles" },
        { key: "Del", label: "Remove selected nodes/edges" },
      ]}
    >
      <div ref={wrapperRef} className="absolute inset-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRf}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(45,212,191,0.18)" />
          <Controls />
        </ReactFlow>
      </div>
    </ExampleLayout>
  );
}

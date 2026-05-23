import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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
import { SmartEdge } from "@/components/flow-edges/SmartEdge";


export const Route = createFileRoute("/routing")({
  component: RoutingPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Advanced edge routing — FlowLabs" },
      { name: "description", content: "Toggle between bezier, step, smoothstep, and straight edge routing on the same graph." },
    ],
  }),
});



const initialNodes: Node[] = [
  { id: "a", type: "flow", position: { x: 60, y: 80 }, data: { label: "Ingest source", kind: "source", sublabel: "Source" } },
  { id: "b", type: "flow", position: { x: 360, y: 20 }, data: { label: "Validate schema", sublabel: "Process" } },
  { id: "c", type: "flow", position: { x: 360, y: 220 }, data: { label: "Enrich payload", sublabel: "Process" } },
  { id: "d", type: "flow", position: { x: 680, y: 120 }, data: { label: "Route by tenant", sublabel: "Router" } },
  { id: "e", type: "flow", position: { x: 680, y: 320 }, data: { label: "Quarantine", sublabel: "Sink", kind: "sink" } },
  { id: "f", type: "flow", position: { x: 1000, y: 60 }, data: { label: "Warehouse sink", sublabel: "Sink", kind: "sink" } },
  { id: "g", type: "flow", position: { x: 1000, y: 260 }, data: { label: "Stream consumer", sublabel: "Sink", kind: "sink" } },
];

const initialEdges: Edge[] = [
  { id: "a-b", source: "a", target: "b" },
  { id: "a-c", source: "a", target: "c" },
  { id: "b-d", source: "b", target: "d" },
  { id: "c-d", source: "c", target: "d" },
  { id: "c-e", source: "c", target: "e" },
  { id: "d-f", source: "d", target: "f" },
  { id: "d-g", source: "d", target: "g" },
  { id: "a-g", source: "a", target: "g" },
];

const nodeTypes = { flow: FlowNode };
const edgeTypes = { smart: SmartEdge };


function RoutingPage() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges]
  );

  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smart",
        style: { stroke: "var(--accent)", strokeWidth: 1.75 },
      })),
    [edges]
  );

  return (
    <ExampleLayout
      index="01"
      category="Routing"
      title="Smart orthogonal routing"
      description="Edges run A* on a sparse grid built from the live node bounds — they automatically dodge any node in the way. Drag a node and the edges re-route in real time."
      keys={[
        { key: "Drag", label: "Move nodes — edges re-route" },
        { key: "Scroll", label: "Zoom canvas" },
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
        <MiniMap
          maskColor="rgba(11,15,25,0.7)"
          nodeColor={() => "#2DD4BF"}
          pannable
          zoomable
        />
      </ReactFlow>
    </ExampleLayout>
  );
}

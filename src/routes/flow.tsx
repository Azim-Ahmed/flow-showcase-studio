import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
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
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from "reactflow";
import { ExampleLayout } from "@/components/ExampleLayout";
import { FlowNode } from "@/components/flow-nodes/FlowNode";

export const Route = createFileRoute("/flow")({
  component: FlowPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Animated SVG along edges — FlowLabs" },
      { name: "description", content: "Glowing particles and animated dashes traveling along bezier paths to visualize data flow." },
    ],
  }),
});

function ParticleEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd }: EdgeProps) {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: "var(--accent)", strokeWidth: 1.5, opacity: 0.5 }} />
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeDasharray="6 14"
        className="edge-animated"
        style={{ opacity: 0.9 }}
      />
      <circle r="4" fill="var(--accent)" filter="drop-shadow(0 0 6px var(--accent))">
        <animateMotion dur="2.4s" repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2.5" fill="var(--accent)" opacity="0.6">
        <animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2" fill="var(--accent)" opacity="0.4">
        <animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite" path={path} />
      </circle>
    </>
  );
}

const initialNodes: Node[] = [
  { id: "1", type: "flow", position: { x: 40, y: 140 }, data: { label: "Event producer", kind: "source", sublabel: "Source" } },
  { id: "2", type: "flow", position: { x: 380, y: 40 }, data: { label: "Transform A", sublabel: "Process" } },
  { id: "3", type: "flow", position: { x: 380, y: 240 }, data: { label: "Transform B", sublabel: "Process" } },
  { id: "4", type: "flow", position: { x: 720, y: 140 }, data: { label: "Aggregator", kind: "active", sublabel: "Reducer" } },
  { id: "5", type: "flow", position: { x: 1040, y: 140 }, data: { label: "Subscribers", kind: "sink", sublabel: "Sink" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "particle" },
  { id: "e1-3", source: "1", target: "3", type: "particle" },
  { id: "e2-4", source: "2", target: "4", type: "particle" },
  { id: "e3-4", source: "3", target: "4", type: "particle" },
  { id: "e4-5", source: "4", target: "5", type: "particle" },
];

const nodeTypes = { flow: FlowNode };
const edgeTypes = { particle: ParticleEdge };

function FlowPage() {
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
    (c: Connection) => setEdges((eds) => addEdge({ ...c, type: "particle" }, eds)),
    [setEdges]
  );

  return (
    <ExampleLayout
      index="02"
      category="Motion"
      title="Animated SVG along edges"
      description="Each edge renders a faded base path, an animated dashed overlay, and three SVG circles tweened along the bezier curve with <animateMotion>. New connections inherit the same effect automatically."
      keys={[
        { key: "Drag", label: "Pan canvas" },
        { key: "Click", label: "Connect handles" },
      ]}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "particle" }}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(45,212,191,0.18)" />
        <Controls />
      </ReactFlow>
    </ExampleLayout>
  );
}

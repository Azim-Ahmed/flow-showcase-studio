import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
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

type ParticleEdgeData = { speed?: number };

function ParticleEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<ParticleEdgeData>) {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const dur = `${(data?.speed ?? 2.4).toFixed(2)}s`;
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
        <animateMotion dur={dur} repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2.5" fill="var(--accent)" opacity="0.6">
        <animateMotion dur={dur} begin={`-${parseFloat(dur) / 3}s`} repeatCount="indefinite" path={path} />
      </circle>
      <circle r="2" fill="var(--accent)" opacity="0.4">
        <animateMotion dur={dur} begin={`-${(parseFloat(dur) * 2) / 3}s`} repeatCount="indefinite" path={path} />
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
  const [speed, setSpeed] = useState(1); // multiplier 0.25–3

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, type: "particle" }, eds)),
    [setEdges]
  );

  // Inject the speed (as duration in seconds) into every edge's data.
  const dur = 2.4 / speed;
  const sped = useMemo(
    () => edges.map((e) => ({ ...e, data: { ...(e.data ?? {}), speed: dur } })),
    [edges, dur]
  );

  const controls = (
    <div className="space-y-3">
      <label className="block">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          <span>Particle speed</span>
          <span className="text-accent">{speed.toFixed(2)}×</span>
        </div>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </label>
      <div className="flex gap-2">
        {[
          { l: "0.5×", v: 0.5 },
          { l: "1×", v: 1 },
          { l: "2×", v: 2 },
        ].map((p) => (
          <button
            key={p.l}
            onClick={() => setSpeed(p.v)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-mono rounded border transition-colors ${
              Math.abs(speed - p.v) < 0.01
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
            }`}
          >
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ExampleLayout
      index="02"
      category="Motion"
      title="Animated SVG along edges"
      description="Each edge renders a faded base path, an animated dashed overlay, and three SVG circles tweened along the bezier curve with <animateMotion>. Adjust the speed slider to throttle every particle in real time."
      controls={controls}
      keys={[
        { key: "Drag", label: "Pan canvas" },
        { key: "Click", label: "Connect handles" },
        { key: "Slider", label: "Throttle particle speed" },
      ]}
    >
      <ReactFlow
        nodes={nodes}
        edges={sped}
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

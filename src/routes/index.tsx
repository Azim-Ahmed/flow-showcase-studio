import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "FlowLabs — Advanced ReactFlow examples" },
      { name: "description", content: "A free collection of production-ready ReactFlow patterns: smart edge routing, animated edges, editable freeform paths, intersection detection." },
    ],
  }),
});

const examples = [
  {
    num: "01",
    category: "Routing",
    to: "/routing",
    title: "Advanced edge routing",
    desc: "Clean orthogonal paths with smart avoidance, even in dense diagrams. Toggle routing modes live.",
  },
  {
    num: "02",
    category: "Motion",
    to: "/flow",
    title: "Animated SVG along edges",
    desc: "Glowing particles, traveling markers, and animated dashes that visualize data flow.",
  },
  {
    num: "03",
    category: "Controls",
    to: "/editable",
    title: "Editable & freeform edges",
    desc: "Draggable mid-point handles to reshape edges. Hold Space during a connection to draw freeform.",
  },
  {
    num: "04",
    category: "Physics",
    to: "/intersection",
    title: "Edge intersection detection",
    desc: "Drag a node over an edge — it lights up and the node snaps into the connection.",
  },
  {
    num: "05",
    category: "Authoring",
    to: "/palette",
    title: "Drag & drop palette",
    desc: "Drag node types from a side palette into the canvas to compose graphs visually.",
  },
  {
    num: "06",
    category: "Layout",
    to: "/layout",
    title: "Hierarchical auto-layout",
    desc: "One-click longest-path layered layout that snaps any DAG into clean columns.",
  },
  {
    num: "07",
    category: "Realtime",
    to: "/collab",
    title: "Live collaborative cursors",
    desc: "Simulated multiplayer peers gliding across the canvas with name tags and presence.",
  },
];

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative grid-bg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/30 bg-accent/5 rounded-full mb-6">
            <span className="size-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[11px] font-mono text-accent uppercase tracking-widest">
              open collection · free for the community
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.95] mb-6 max-w-4xl">
            Beautiful, interactive
            <br />
            <span className="text-accent">ReactFlow</span> patterns.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            A growing library of production-ready node-and-edge techniques —
            advanced routing, animated flows, editable curves, and live
            intersection detection. Built to be copied, remixed, and shipped.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/routing"
              className="px-5 py-3 bg-accent text-canvas font-semibold rounded-md text-sm hover:bg-accent/90 transition-colors"
            >
              Explore examples →
            </Link>
            <a
              href="https://reactflow.dev"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 border border-border bg-panel text-foreground font-medium rounded-md text-sm hover:bg-panel-2 transition-colors"
            >
              ReactFlow docs ↗
            </a>
          </div>
        </div>
      </section>

      {/* Examples grid */}
      <section className="bg-canvas px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              The examples
            </h2>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              {examples.length} modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden">
            {examples.map((ex) => (
              <Link
                key={ex.to}
                to={ex.to}
                className="group bg-panel p-8 hover:bg-panel-2 transition-colors relative flex flex-col gap-6 min-h-[260px]"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[11px] text-accent uppercase tracking-widest">
                    {ex.num} // {ex.category}
                  </span>
                  <div className="size-2 bg-border group-hover:bg-accent transition-colors rounded-full" />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                    {ex.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {ex.desc}
                  </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground group-hover:text-accent transition-colors">
                  Open module →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-panel px-6 md:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              System nominal
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Crafted for the ReactFlow community · MIT licensed
          </span>
        </div>
      </footer>
    </div>
  );
}

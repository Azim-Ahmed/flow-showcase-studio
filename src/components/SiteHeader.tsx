import { Link, useRouterState } from "@tanstack/react-router";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/routing", label: "Routing" },
  { to: "/flow", label: "Flow" },
  { to: "/editable", label: "Editable" },
  { to: "/intersection", label: "Intersection" },
  { to: "/palette", label: "Palette" },
  { to: "/layout", label: "Layout" },
  { to: "/collab", label: "Collab" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="h-16 border-b border-border flex items-center justify-between px-6 md:px-8 shrink-0 bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="size-8 bg-accent rounded flex items-center justify-center transition-transform group-hover:rotate-45">
          <div className="size-4 border-2 border-canvas rounded-sm"></div>
        </div>
        <span className="font-semibold tracking-tight text-lg">
          FlowLabs <span className="text-accent/60 font-mono text-xs ml-1">v0.1</span>
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-1 text-sm font-medium">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                active
                  ? "text-accent bg-accent/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-panel"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <a
          href="https://reactflow.dev"
          target="_blank"
          rel="noreferrer"
          className="ml-3 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20 hover:bg-accent/20 transition-all text-sm"
        >
          ReactFlow docs ↗
        </a>
      </div>
    </nav>
  );
}

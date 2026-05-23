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
    <nav className="h-16 border-b border-border flex items-center justify-between px-6 md:px-8 shrink-0 bg-canvas/70 backdrop-blur-xl sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative size-8 rounded-md bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-[0_0_20px_-4px_color-mix(in_oklab,var(--accent)_60%,transparent)] transition-transform group-hover:rotate-45">
          <div className="size-3.5 border-2 border-canvas rounded-[3px]"></div>
        </div>
        <span className="font-semibold tracking-tight text-lg">
          FlowLabs
          <span className="text-accent/60 font-mono text-[10px] ml-1.5 align-middle">v0.1</span>
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-0.5 text-sm font-medium">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative px-3 py-1.5 rounded-md transition-colors ${
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-md bg-accent/10 border border-accent/20" />
              )}
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
        <a
          href="https://www.visualflow.dev"
          target="_blank"
          rel="noreferrer"
          className="ml-3 px-4 py-1.5 bg-gradient-to-br from-accent/15 to-accent/5 text-accent rounded-full border border-accent/25 hover:from-accent/25 hover:border-accent/40 transition-all text-sm shadow-[0_0_20px_-8px_color-mix(in_oklab,var(--accent)_60%,transparent)]"
        >
          VisualFlow ↗
        </a>
      </div>
    </nav>
  );
}

import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

interface ExampleLayoutProps {
  index: string;
  category: string;
  title: string;
  description: string;
  keys?: { key: string; label: string }[];
  controls?: ReactNode;
  children: ReactNode;
}

export function ExampleLayout({ index, category, title, description, keys, controls, children }: ExampleLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-foreground">
      <SiteHeader />
      <main className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-80 border-r border-border bg-panel/60 backdrop-blur-md p-6 flex-col gap-8 overflow-y-auto relative">
          <div className="pointer-events-none absolute inset-0 ambient-glow opacity-60" />
          <section className="relative">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                {index} · {category}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-3 text-balance leading-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              {description}
            </p>
          </section>

          {controls && (
            <section className="relative">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">
                Controls
              </h3>
              {controls}
            </section>
          )}

          {keys && keys.length > 0 && (
            <section className="relative">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">
                Interaction
              </h3>
              <div className="space-y-2.5">
                {keys.map((k) => (
                  <div key={k.key} className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-panel-2 rounded border border-border text-[10px] font-mono text-foreground/90 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04),0_1px_0_rgba(0,0,0,0.3)]">
                      {k.key}
                    </kbd>
                    <span className="text-xs text-muted-foreground">{k.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="relative mt-auto pt-6 border-t border-border">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground/70">
              <span>built with reactflow@11</span>
              <span className="size-1.5 rounded-full bg-accent/60 animate-pulse" />
            </div>
          </div>
        </aside>

        <div className="flex-1 relative grid-bg overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

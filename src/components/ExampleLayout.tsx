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
        <aside className="hidden lg:flex w-80 border-r border-border bg-panel p-6 flex-col gap-8 overflow-y-auto">
          <section>
            <div className="text-xs font-mono uppercase tracking-widest text-accent mb-2">
              {index} // {category}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </section>

          {controls && (
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Controls
              </h3>
              {controls}
            </section>
          )}

          {keys && keys.length > 0 && (
            <section>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Interaction keys
              </h3>
              <div className="space-y-2">
                {keys.map((k) => (
                  <div key={k.key} className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-panel-2 rounded border border-border text-[10px] font-mono">
                      {k.key}
                    </kbd>
                    <span className="text-xs text-muted-foreground">{k.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-auto pt-6 border-t border-border text-xs text-muted-foreground/70 font-mono">
            built with reactflow@11
          </div>
        </aside>

        <div className="flex-1 relative grid-bg overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

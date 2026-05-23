import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type FlowNodeData = {
  label: string;
  kind?: "source" | "sink" | "process" | "active";
  sublabel?: string;
};

const KIND_STYLES: Record<NonNullable<FlowNodeData["kind"]>, { dot: string; label: string; ring: string }> = {
  source:  { dot: "bg-accent",            label: "text-accent",            ring: "border-accent/40" },
  active:  { dot: "bg-accent",            label: "text-accent",            ring: "border-accent/50" },
  process: { dot: "bg-muted-foreground/70", label: "text-muted-foreground", ring: "border-node-border" },
  sink:    { dot: "bg-accent-warm",       label: "text-accent-warm",       ring: "border-accent-warm/40" },
};

function FlowNodeImpl({ data, selected }: NodeProps<FlowNodeData>) {
  const kind = data.kind ?? "process";
  const s = KIND_STYLES[kind];
  const isLive = kind === "active" || kind === "source";

  return (
    <div
      className={`group relative min-w-[190px] rounded-xl px-4 py-3 transition-all duration-200 backdrop-blur-sm
        bg-gradient-to-b from-panel to-panel-2/80
        border ${selected ? "border-accent" : s.ring}
        shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]
        ${selected ? "shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent),0_8px_30px_-6px_color-mix(in_oklab,var(--accent)_35%,transparent)]" : ""}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent !border-canvas" />

      {/* subtle top hairline */}
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-center gap-2 mb-1.5">
        <span className="relative flex">
          <span className={`size-1.5 rounded-full ${s.dot}`} />
          {isLive && (
            <span className={`absolute inset-0 rounded-full ${s.dot} pulse-ring`} />
          )}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-[0.18em] ${s.label}`}>
          {data.sublabel ?? kind}
        </span>
      </div>
      <div className="text-sm font-medium text-foreground leading-tight tracking-tight">
        {data.label}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-accent !border-canvas" />
    </div>
  );
}

export const FlowNode = memo(FlowNodeImpl);

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type FlowNodeData = {
  label: string;
  kind?: "source" | "sink" | "process" | "active";
  sublabel?: string;
};

function FlowNodeImpl({ data, selected }: NodeProps<FlowNodeData>) {
  const kind = data.kind ?? "process";
  const isActive = kind === "active" || kind === "source";
  return (
    <div
      className={`min-w-[180px] bg-panel border rounded-xl px-4 py-3 shadow-xl transition-all ${
        selected
          ? "border-accent shadow-accent/30"
          : isActive
          ? "border-accent/50 shadow-accent/10"
          : "border-node-border"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-accent !border-canvas"
      />
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`size-1.5 rounded-full ${
            isActive ? "bg-accent animate-pulse" : "bg-muted-foreground/60"
          }`}
        />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {data.sublabel ?? kind}
        </span>
      </div>
      <div className="text-sm font-medium text-foreground leading-tight">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-accent !border-canvas"
      />
    </div>
  );
}

export const FlowNode = memo(FlowNodeImpl);

import { Info, Lightbulb, Warning, WarningCircle, type Icon } from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Type = "note" | "tip" | "warning" | "danger";

const map: Record<Type, { icon: React.ComponentType<{ className?: string }>; cls: string; border: string; label: string }> = {
  note: { icon: Info, cls: "text-info", border: "border-l-info", label: "Note" },
  tip: { icon: Lightbulb, cls: "text-brand", border: "border-l-brand", label: "Tip" },
  warning: { icon: Warning, cls: "text-warning", border: "border-l-warning", label: "Warning" },
  danger: { icon: WarningCircle, cls: "text-danger", border: "border-l-danger", label: "Danger" },
};

export function Callout({ type = "note", title, children }: { type?: Type; title?: string; children: ReactNode }) {
  const { icon: Icon, cls, border, label } = map[type];
  return (
    <div className={cn("my-4 flex gap-3 rounded-xl border border-border border-l-4 bg-bg-surface p-4", border)}>
      <Icon className={cn("size-5 shrink-0 mt-0.5", cls)} />
      <div className="min-w-0">
        <div className={cn("font-semibold text-sm", cls)}>{title ?? label}</div>
        <div className="text-fg-secondary text-sm leading-relaxed mt-1">{children}</div>
      </div>
    </div>
  );
}

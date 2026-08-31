import { Info, Lightbulb, Warning, WarningCircle } from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Type = "note" | "tip" | "warning" | "danger";

const map: Record<Type, { icon: React.ComponentType<{ className?: string }>; cls: string; label: string; clsRoot: string }> = {
  note: {
    icon: Info,
    cls: "text-accent-black",
    label: "Note",
    clsRoot: "pcl-callout pcl-callout--note",
  },
  tip: {
    icon: Lightbulb,
    cls: "text-heat-100",
    label: "Tip",
    clsRoot: "pcl-callout pcl-callout--tip",
  },
  warning: {
    icon: Warning,
    cls: "text-warning",
    label: "Warning",
    clsRoot: "pcl-callout pcl-callout--warning",
  },
  danger: {
    icon: WarningCircle,
    cls: "text-danger",
    label: "Danger",
    clsRoot: "pcl-callout pcl-callout--danger",
  },
};

export function Callout({
  type = "note",
  title,
  children,
  className,
}: {
  type?: Type;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, cls, label, clsRoot } = map[type];
  return (
    <div className={cn(clsRoot, className)}>
      <Icon className={cn("size-4 shrink-0 mt-1", cls)} />
      <div className="min-w-0">
        <div className={cn("text-label-medium", cls)}>{title ?? label}</div>
        <div className="text-body-medium text-black-alpha-64 leading-22 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
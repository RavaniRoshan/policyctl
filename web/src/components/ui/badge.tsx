import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "accent" | "danger" | "info" | "muted" | "pc" | "ac";

const tones: Record<Tone, string> = {
  default: "border-border bg-bg-surface text-fg-secondary",
  brand: "border-brand/20 bg-brand/10 text-brand",
  accent: "border-accent/20 bg-accent/10 text-accent",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-info/20 bg-info/10 text-info",
  muted: "border-border bg-bg-surface text-fg-muted",
  pc: "border-brand/20 bg-brand/10 text-brand",
  ac: "border-accent/20 bg-accent/10 text-accent",
};

export function Badge({ className, tone = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 font-mono text-xs font-medium",
        tones[tone] || tones.default,
        className,
      )}
      {...props}
    />
  );
}

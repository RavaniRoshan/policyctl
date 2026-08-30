import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "accent" | "danger" | "info" | "muted" | "warm" | "coral" | "sky";

const tones: Record<Tone, string> = {
  default: "border-border bg-bg-surface text-fg-secondary",
  brand: "border-brand/20 bg-brand/10 text-brand",
  accent: "border-accent/20 bg-accent/10 text-accent",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-info/20 bg-info/10 text-info",
  muted: "border-border bg-bg-surface text-fg-muted",
  warm: "border-accent-warm/20 bg-accent-warm/10 text-accent-warm",
  coral: "border-accent-coral/20 bg-accent-coral/10 text-accent-coral",
  sky: "border-accent-sky/20 bg-accent-sky/10 text-accent-sky",
};

export function Badge({ className, tone = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-medium",
        tones[tone] || tones.default,
        className,
      )}
      {...props}
    />
  );
}

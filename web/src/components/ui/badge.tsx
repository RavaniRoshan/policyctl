import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "accent" | "danger" | "info" | "muted" | "pc" | "ac";

const tones: Record<Tone, string> = {
  default: "border-n-700 bg-n-800 text-n-200",
  brand: "border-brand/30 bg-brand/10 text-brand",
  accent: "border-accent/30 bg-accent/10 text-accent",
  danger: "border-danger/40 bg-danger/10 text-danger",
  info: "border-info/40 bg-info/10 text-info",
  muted: "border-n-800 bg-n-900 text-n-400",
  pc: "border-brand/30 bg-brand/10 text-brand",
  ac: "border-accent/30 bg-accent/10 text-accent",
};

const legacyAliases: Record<string, string> = {
  pc: tones.brand,
  ac: tones.accent,
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
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

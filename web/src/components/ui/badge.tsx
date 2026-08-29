import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "pc" | "ac" | "danger" | "info" | "muted";

const tones: Record<Tone, string> = {
  default: "border-n-700 bg-n-800 text-n-200",
  pc: "border-pc-700/50 bg-pc-500/10 text-pc-300",
  ac: "border-ac-600/40 bg-ac-500/10 text-ac-300",
  danger: "border-danger/40 bg-danger/10 text-danger",
  info: "border-info/40 bg-info/10 text-info",
  muted: "border-n-800 bg-n-900 text-n-400",
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
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "heat" | "danger" | "accent" | "success" | "muted";

const tones: Record<Tone, string> = {
  default: "pcl-badge",
  heat: "pcl-badge pcl-badge--heat",
  danger: "pcl-badge pcl-badge--danger",
  accent: "pcl-badge pcl-badge--accent",
  success: "pcl-badge pcl-badge--success",
  muted: "pcl-badge text-black-alpha-32",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn(tones[tone], className)} {...props} />;
}
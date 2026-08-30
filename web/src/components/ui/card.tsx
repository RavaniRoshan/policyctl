import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Double-Bezel (Doppelrand) Card
 * Outer shell + Inner core = machined hardware aesthetic
 */
export function DoppelCard({
  className,
  children,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "glow" }) {
  const glowMap = {
    default: "",
    glow: "shadow-[0_0_80px_rgba(59,130,246,0.08)] dark:shadow-[0_0_80px_rgba(59,130,246,0.12)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-[1.5px] transition-all duration-700 ease-fluid",
        "bg-bg-subtle ring-1 ring-border",
        glowMap[variant],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "rounded-[calc(1rem-0.0625rem)] h-full",
          "bg-bg-surface p-6",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-elevated p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-sans font-semibold tracking-tight text-fg-primary text-lg", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-fg-secondary text-sm leading-relaxed mt-1", className)} {...props} />;
}

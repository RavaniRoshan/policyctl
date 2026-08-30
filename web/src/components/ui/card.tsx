import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-bg-elevated p-5 overflow-hidden transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-display font-semibold tracking-tight text-fg-primary text-lg", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-fg-secondary text-sm leading-relaxed mt-1", className)} {...props} />;
}

export function CardCompact({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-row items-center lg:items-start justify-start flex-nowrap lg:flex-wrap gap-6 rounded-xl border border-border bg-bg-elevated p-6",
        className,
      )}
      {...props}
    />
  );
}

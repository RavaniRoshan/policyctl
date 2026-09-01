import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  floating,
  ...props
}: HTMLAttributes<HTMLDivElement> & { floating?: boolean }) {
  return (
    <div
      className={cn(
        "relative bg-surface border border-border-faint rounded-none",
        floating && "shadow-lg backdrop-blur-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-16 border-b border-border-faint",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-label-x-large text-accent-black",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-body-large text-black-alpha-72 mt-8", className)} {...props} />
  );
}

export function CardSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-16", className)} {...props} />
  );
}
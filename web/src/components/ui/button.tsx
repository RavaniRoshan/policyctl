import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-fg-inverse hover:bg-brand-hover",
  ghost: "bg-transparent text-fg-secondary hover:bg-bg-surface hover:text-fg-primary border border-border",
  outline: "bg-transparent text-fg-primary border border-border hover:border-brand hover:text-brand",
  danger: "bg-danger text-fg-inverse hover:bg-danger/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  trailingIcon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", trailingIcon = false, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-700 ease-fluid",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {trailingIcon && (
        <span className="flex size-7 items-center justify-center rounded-full bg-fg-inverse/10 transition-all duration-700 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
          <ArrowUpRight className="size-3.5" />
        </span>
      )}
    </button>
  ),
);
Button.displayName = "Button";

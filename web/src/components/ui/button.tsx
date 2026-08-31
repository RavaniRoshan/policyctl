import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "pcl-btn--primary",
  secondary: "pcl-btn--secondary",
  tertiary: "pcl-btn--tertiary",
  danger: "pcl-btn--danger",
};

const sizeClass: Record<Size, string> = {
  sm: "pcl-btn--sm text-mono-small",
  md: "",
  lg: "pcl-btn--lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  trailingIcon?: boolean;
  leadingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      trailingIcon = false,
      leadingIcon,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn("pcl-btn", variantClass[variant], sizeClass[size], className)}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon && (
        <span aria-hidden className="inline-flex items-center">
          <ArrowUpRight className="size-3.5" />
        </span>
      )}
    </button>
  ),
);
Button.displayName = "Button";
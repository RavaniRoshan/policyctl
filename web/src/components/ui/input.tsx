import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-md border border-n-700 bg-n-1000 px-4 text-n-100 placeholder:text-n-500 outline-none transition-colors focus-visible:border-pc-400 focus-visible:ring-2 focus-visible:ring-pc-400/40",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

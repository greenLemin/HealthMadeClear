"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:shadow-md hover:bg-primary-container active:bg-primary-container focus-visible:ring-primary hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "border-2 border-primary text-primary bg-transparent hover:bg-surface-container-low active:bg-surface-container focus-visible:ring-primary hover:-translate-y-0.5 active:translate-y-0",
  ghost:
    "bg-transparent text-on-surface hover:bg-surface-container active:bg-surface-container focus-visible:ring-primary hover:-translate-y-0.5 active:translate-y-0",
  danger:
    "bg-error text-on-error shadow-sm hover:shadow-md hover:bg-error/90 active:bg-error/80 focus-visible:ring-error hover:-translate-y-0.5 active:translate-y-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2 text-label-md",
  md: "min-h-[56px] px-6 py-3 text-label-lg",
  lg: "min-h-[64px] px-8 py-4 text-label-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      fullWidth = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : icon ? (
          <span aria-hidden="true">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

export type { ButtonProps, ButtonVariant, ButtonSize };

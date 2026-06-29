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
    "border border-primary/20 bg-primary text-on-primary shadow-elevation-2 hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-floating active:translate-y-0 active:scale-[0.985] focus-visible:ring-primary",
  secondary:
    "border border-outline-variant bg-surface-container-lowest/90 text-primary shadow-elevation-1 backdrop-blur hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface hover:shadow-elevation-2 active:translate-y-0 active:scale-[0.985] focus-visible:ring-primary",
  ghost:
    "border border-transparent bg-transparent text-on-surface hover:-translate-y-0.5 hover:bg-surface-container-low hover:text-primary active:translate-y-0 active:scale-[0.985] focus-visible:ring-primary",
  danger:
    "border border-error/20 bg-error text-on-error shadow-elevation-1 hover:-translate-y-0.5 hover:bg-error/90 hover:shadow-elevation-2 active:translate-y-0 active:scale-[0.985] focus-visible:ring-error",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 rounded-full px-4 py-2 text-label-md",
  md: "min-h-[56px] rounded-full px-6 py-3 text-label-lg",
  lg: "min-h-[64px] rounded-full px-8 py-4 text-label-lg",
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
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none motion-reduce:transition-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
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

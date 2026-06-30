"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { getButtonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

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
        className={getButtonClasses({ variant, size, fullWidth, className })}
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

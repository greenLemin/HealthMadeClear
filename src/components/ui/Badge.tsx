import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-container text-on-surface-variant",
  primary: "bg-primary-container text-on-primary-container",
  success: "bg-secondary-container text-on-secondary-container",
  warning: "bg-tertiary-container/30 text-tertiary",
  error: "bg-error-container text-on-error-container",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-label-md",
  md: "px-3 py-1 text-label-md",
};

export default function Badge({ variant = "default", size = "md", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-semibold",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export type { BadgeVariant, BadgeSize, BadgeProps };

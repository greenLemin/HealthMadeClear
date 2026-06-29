import type { ReactNode, ElementType } from "react";

type CardPadding = "sm" | "md" | "lg";
type CardVariant = "default" | "muted" | "accent" | "glass";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  clickable?: boolean;
  padding?: CardPadding;
  variant?: CardVariant;
}

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

const variantStyles: Record<CardVariant, string> = {
  default: "surface-card",
  muted: "surface-card-muted",
  accent: "surface-card-strong",
  glass: "surface-card-glass",
};

export default function Card({
  children,
  className = "",
  as: Component = "div",
  clickable = false,
  padding = "md",
  variant = "default",
}: CardProps) {
  return (
    <Component
      className={[
        variantStyles[variant],
        paddingStyles[padding],
        clickable
          ? "cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </Component>
  );
}

export type { CardProps, CardVariant };

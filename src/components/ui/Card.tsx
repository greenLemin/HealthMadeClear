import type { ReactNode, ElementType } from "react";

type CardPadding = "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  clickable?: boolean;
  padding?: CardPadding;
}

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

export default function Card({
  children,
  className = "",
  as: Component = "div",
  clickable = false,
  padding = "md",
}: CardProps) {
  return (
    <Component
      className={[
        "rounded-2xl border border-outline-variant bg-surface-container-lowest",
        paddingStyles[padding],
        clickable
          ? "cursor-pointer transition-shadow hover:shadow-card-hover focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          : "shadow-card",
        className,
      ].join(" ")}
    >
      {children}
    </Component>
  );
}

export type { CardProps };

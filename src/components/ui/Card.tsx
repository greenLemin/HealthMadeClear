import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardPadding = "sm" | "md" | "lg";
type CardVariant = "default" | "muted" | "accent" | "glass";

type CardOwnProps = {
  children: ReactNode;
  className?: string;
  clickable?: boolean;
  padding?: CardPadding;
  variant?: CardVariant;
};

type CardProps<C extends ElementType = "div"> = CardOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof CardOwnProps | "as">;

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

export default function Card<C extends ElementType = "div">({
  children,
  className = "",
  as,
  clickable = false,
  padding = "md",
  variant = "default",
  ...rest
}: CardProps<C>) {
  const Component = as ?? "div";

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
      {...rest}
    >
      {children}
    </Component>
  );
}

export type { CardProps, CardVariant };

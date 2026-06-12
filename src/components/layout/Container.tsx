import type { ReactNode } from "react";

type ContainerSize = "narrow" | "default" | "wide";

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

const sizeStyles: Record<ContainerSize, string> = {
  narrow: "max-w-screen-sm",
  default: "max-w-container",
  wide: "max-w-full",
};

export default function Container({ children, size = "default", className = "" }: ContainerProps) {
  return <div className={["mx-auto px-4 md:px-16", sizeStyles[size], className].join(" ")}>{children}</div>;
}

export type { ContainerProps, ContainerSize };

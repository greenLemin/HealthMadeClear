import type { ReactNode } from "react";

type SectionBackground = "default" | "surface" | "teal";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: SectionBackground;
  id?: string;
  ariaLabelledBy?: string;
}

const backgroundStyles: Record<SectionBackground, string> = {
  default: "bg-surface text-on-surface",
  surface: "bg-surface-container-low text-on-surface",
  teal: "bg-primary-container text-on-primary-container",
};

export default function Section({
  children,
  className = "",
  background = "default",
  id,
  ariaLabelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={["py-[clamp(2rem,4vw,5rem)]", backgroundStyles[background], className].join(" ")}
    >
      {children}
    </section>
  );
}

export type { SectionProps, SectionBackground };

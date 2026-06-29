import type { ReactNode } from "react";

interface PageSectionProps {
  id?: string;
  title?: string;
  className?: string;
  eyebrow?: string;
  children: ReactNode;
}

export default function PageSection({ id, title, className = "", eyebrow, children }: PageSectionProps) {
  return (
    <section id={id} className={["surface-card px-6 py-6 md:px-8 md:py-8", className].join(" ")}>
      {eyebrow ? <div className="eyebrow mb-3">{eyebrow}</div> : null}
      {title ? <h2 className="mb-5 font-display text-headline-md text-primary">{title}</h2> : null}
      {children}
    </section>
  );
}

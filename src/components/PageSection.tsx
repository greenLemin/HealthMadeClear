import type { ReactNode } from "react";

interface PageSectionProps {
  id?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}

export default function PageSection({ id, title, className = "", children }: PageSectionProps) {
  return (
    <section id={id} className={className}>
      {title ? <h2 className="mb-6 text-headline-lg text-primary">{title}</h2> : null}
      {children}
    </section>
  );
}

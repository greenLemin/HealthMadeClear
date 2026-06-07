import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export default function PageSection({ title, className = "", children }: PageSectionProps) {
  return (
    <section className={className}>
      {title ? <h2 className="mb-6 text-headline-lg text-primary">{title}</h2> : null}
      {children}
    </section>
  );
}

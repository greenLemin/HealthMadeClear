import type { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  badge?: string;
  description?: string;
  centered?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  badge,
  description,
  centered = false,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
            {breadcrumb.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-on-surface-variant">
                    /
                  </span>
                ) : null}
                {item.href ? (
                  <a href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
        {badge ? (
          <div className="mb-3 inline-flex rounded-full bg-surface-container px-4 py-2 text-label-md font-semibold text-on-surface-variant">
            {badge}
          </div>
        ) : null}
        <h1 className="mb-4 text-headline-lg-mobile md:text-headline-xl text-primary">{title}</h1>
        {subtitle ? <p className="mb-2 text-body-lg text-on-surface-variant">{subtitle}</p> : null}
        {description ? <p className="text-body-md text-on-surface-variant">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}

export type { PageHeaderProps, BreadcrumbItem };

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface PageHeaderProps {
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  subtitle,
  breadcrumb,
  badge,
  title,
  description,
  centered = false,
  children,
  className = "",
}: PageHeaderProps) {
  const tCommon = useTranslations("common");

  return (
    <div className={className}>
      <div
        className={[
          "section-frame px-6 py-8 md:px-8 md:py-10",
          centered ? "mx-auto max-w-4xl text-center" : "max-w-4xl",
        ].join(" ")}
      >
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label={tCommon("breadcrumb")} className={centered ? "mb-5" : "mb-4"}>
            <ol
              className={[
                "flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant",
                centered ? "justify-center" : "",
              ].join(" ")}
            >
              {breadcrumb.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 ? (
                    <span aria-hidden="true" className="text-on-surface-variant">
                      /
                    </span>
                  ) : null}
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {badge ? <div className="eyebrow mb-4">{badge}</div> : null}
        <h1 className="mb-4 font-display text-headline-lg-mobile text-primary md:text-headline-xl">
          {title}
        </h1>
        {subtitle ? <p className="mb-2 text-body-lg text-on-surface-variant">{subtitle}</p> : null}
        {description ? (
          <p
            className={[
              "text-body-md text-on-surface-variant",
              centered ? "mx-auto max-w-readable" : "max-w-readable",
            ].join(" ")}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className={description || subtitle ? "mt-6" : "mt-2"}>{children}</div> : null}
      </div>
    </div>
  );
}

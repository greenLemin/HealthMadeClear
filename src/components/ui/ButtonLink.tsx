"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { getButtonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
};

export default function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={getButtonClasses({ variant, size, fullWidth, className })} {...props}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </Link>
  );
}

export type { ButtonLinkProps };

"use client";

import { Link } from "@/i18n/navigation";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  mobile?: boolean;
}

export default function NavLink({ href, icon, label, active, onClick, mobile = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? active
            ? "flex items-center gap-3 rounded-[1.25rem] bg-primary px-4 py-3 text-label-md font-semibold text-on-primary shadow-elevation-1"
            : "flex items-center gap-3 rounded-[1.25rem] bg-surface-container-lowest/75 px-4 py-3 text-label-md font-medium text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface hover:text-primary"
          : active
            ? "flex items-center gap-2 rounded-full bg-primary px-3 py-2.5 text-label-md font-semibold text-on-primary shadow-elevation-1 xl:text-label-sm xl:px-1.5 xl:gap-0.5"
            : "flex items-center gap-2 rounded-full px-3 py-2.5 text-label-md font-medium text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface hover:text-primary xl:text-label-sm xl:px-1.5 xl:gap-0.5"
      }
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}

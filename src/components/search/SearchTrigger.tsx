"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function getShortcutLabel(t: ReturnType<typeof useTranslations<"search">>) {
  if (typeof navigator === "undefined") return t("shortcutWindows");

  const navWithUAData = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = navWithUAData.userAgentData?.platform || navigator.platform || "";
  const normalizedPlatform = platform.toLowerCase();

  return normalizedPlatform.includes("mac") ||
    normalizedPlatform.includes("iphone") ||
    normalizedPlatform.includes("ipad")
    ? t("shortcutMac")
    : t("shortcutWindows");
}

interface SearchTriggerProps {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  setIsOpen: (isOpen: boolean) => void;
  t: ReturnType<typeof useTranslations<"search">>;
  shortcutLabel: string | null;
}

export function SearchTrigger({ triggerRef, setIsOpen, t, shortcutLabel }: SearchTriggerProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(true)}
      className="flex min-h-11 items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest/90 px-3 py-2 text-label-md text-on-surface-variant shadow-elevation-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface hover:text-on-surface hover:shadow-elevation-2 md:w-56 lg:w-11 xl:w-11 2xl:w-11 xl:justify-center 2xl:justify-center"
      aria-label={t("openSearch")}
    >
      <Search size={16} aria-hidden="true" />
      <span className="hidden md:inline lg:hidden">{t("placeholder")}</span>
      {shortcutLabel ? (
        <kbd className="ml-auto hidden rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-label-sm tracking-[0.16em] text-on-surface-variant md:inline lg:hidden">
          {shortcutLabel}
        </kbd>
      ) : null}
    </button>
  );
}

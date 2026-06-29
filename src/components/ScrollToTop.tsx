"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("common");
  const pathname = usePathname();
  const onDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const handleClick = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "no-print fixed right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-2 transition-transform motion-safe:hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        onDashboard ? "bottom-20 md:bottom-6" : "bottom-6",
      ].join(" ")}
      aria-label={t("backToTop")}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}

"use client";

import { useEffect, useState, type RefObject } from "react";

export function useReadingProgress<T extends HTMLElement>(contentRef: RefObject<T | null>) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { top, height } = contentRef.current.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      const scrolled = -top;
      const progress = scrollable > 0 ? Math.min(100, Math.max(0, (scrolled / scrollable) * 100)) : 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [contentRef]);

  return scrollProgress;
}

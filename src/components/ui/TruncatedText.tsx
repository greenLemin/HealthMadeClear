"use client";

import { useEffect, useRef, useState } from "react";

type TruncatedTextProps = {
  children: string;
  className?: string;
  as?: "span" | "p";
};

export default function TruncatedText({ children, className = "", as = "span" }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement & HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const Component = as;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    checkTruncation();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkTruncation) : null;
    observer?.observe(element);
    window.addEventListener("resize", checkTruncation);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", checkTruncation);
    };
  }, [children]);

  return (
    <Component ref={ref} className={className} title={isTruncated ? children : undefined}>
      {children}
    </Component>
  );
}

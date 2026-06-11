"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";

interface ScrollSpyContextValue {
  registerTerm: (id: string, element: HTMLElement | null) => void;
  unregisterTerm: (id: string) => void;
  activeTermIds: Set<string>;
}

const ScrollSpyContext = createContext<ScrollSpyContextValue | null>(null);

export function ScrollSpyProvider({ children }: { children: ReactNode }) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [activeTermIds, setActiveTermIds] = useState<Set<string>>(new Set());

  const registerTerm = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      elementsRef.current.set(id, element);
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    }
  }, []);

  const unregisterTerm = useCallback((id: string) => {
    const element = elementsRef.current.get(id);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    elementsRef.current.delete(id);
    setActiveTermIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setActiveTermIds((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const id = entry.target.id;
            if (entry.isIntersecting) {
              next.add(id);
            } else {
              next.delete(id);
            }
          }
          return next;
        });
      },
      { rootMargin: "0px 0px -50% 0px", threshold: 0.1 }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <ScrollSpyContext.Provider value={{ registerTerm, unregisterTerm, activeTermIds }}>
      {children}
    </ScrollSpyContext.Provider>
  );
}

export function useScrollSpyContext() {
  const context = useContext(ScrollSpyContext);
  if (!context) {
    throw new Error("useScrollSpyContext must be used within ScrollSpyProvider");
  }
  return context;
}

/** Safe outside lesson ScrollSpyProvider (articles, glossary term pages). */
export function useOptionalScrollSpyContext() {
  return useContext(ScrollSpyContext);
}

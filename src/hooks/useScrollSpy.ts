"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollSpyOptions {
  rootMargin?: string;
  threshold?: number;
  onIntersect?: (id: string, isIntersecting: boolean) => void;
}

export function useScrollSpy(options: ScrollSpyOptions = {}) {
  const { rootMargin = "0px 0px -50% 0px", threshold = 0.1, onIntersect } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, Element>>(new Map());
  const [intersectingIds, setIntersectingIds] = useState<Set<string>>(new Set());

  const observe = useCallback((id: string, element: Element | null) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
      elementsRef.current.set(id, element);
    }
  }, []);

  const unobserve = useCallback((id: string) => {
    const element = elementsRef.current.get(id);
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setIntersectingIds((prevIntersectingIds) => {
          const newIntersecting = new Set(prevIntersectingIds);
          for (const entry of entries) {
            const id = entry.target.id;
            if (entry.isIntersecting) {
              newIntersecting.add(id);
              onIntersect?.(id, true);
            } else {
              newIntersecting.delete(id);
              onIntersect?.(id, false);
            }
          }
          return newIntersecting;
        });
      },
      { rootMargin, threshold }
    );

    // Re-observe elements when observer is recreated
    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold, onIntersect]);

  return { observe, unobserve, intersectingIds };
}

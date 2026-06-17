// @vitest-environment jsdom
import { render, act, cleanup } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { useScrollSpy } from "./useScrollSpy";

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options?.rootMargin) this.rootMargin = options.rootMargin;
  }

  observe(element: Element): void {
    this.elements.add(element);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Helper method for testing
  simulateIntersection(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this);
  }
}

// Global mock storage for access in tests
let currentObserver: MockIntersectionObserver | null = null;

function Fixture({ onIntersect }: { onIntersect?: (id: string, isIntersecting: boolean) => void }) {
  const { observe, unobserve, intersectingIds } = useScrollSpy({ onIntersect });

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (section1Ref.current) observe("section1", section1Ref.current);
    if (section2Ref.current) observe("section2", section2Ref.current);

    return () => {
      unobserve("section1");
      unobserve("section2");
    };
  }, [observe, unobserve]);

  return (
    <div>
      <div data-testid="intersecting-ids">{Array.from(intersectingIds).join(",")}</div>
      <div id="section1" ref={section1Ref}>
        Section 1
      </div>
      <div id="section2" ref={section2Ref}>
        Section 2
      </div>
    </div>
  );
}

describe("useScrollSpy", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function (this: MockIntersectionObserver, callback, options) {
        const observer = new MockIntersectionObserver(callback, options);
        currentObserver = observer;
        return observer;
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    currentObserver = null;
    cleanup();
  });

  it("initializes with empty intersectingIds", () => {
    const { getByTestId } = render(<Fixture />);
    expect(getByTestId("intersecting-ids").textContent).toBe("");
  });

  it("adds and removes ids from intersectingIds based on intersection", () => {
    const { getByTestId } = render(<Fixture />);

    expect(currentObserver).not.toBeNull();

    act(() => {
      currentObserver!.simulateIntersection([
        { target: { id: "section1" } as Element, isIntersecting: true },
      ]);
    });

    expect(getByTestId("intersecting-ids").textContent).toBe("section1");

    act(() => {
      currentObserver!.simulateIntersection([
        { target: { id: "section2" } as Element, isIntersecting: true },
      ]);
    });

    expect(getByTestId("intersecting-ids").textContent).toBe("section1,section2");

    act(() => {
      currentObserver!.simulateIntersection([
        { target: { id: "section1" } as Element, isIntersecting: false },
      ]);
    });

    expect(getByTestId("intersecting-ids").textContent).toBe("section2");
  });

  it("calls onIntersect callback when elements intersect", () => {
    const onIntersect = vi.fn();
    render(<Fixture onIntersect={onIntersect} />);

    act(() => {
      currentObserver!.simulateIntersection([
        { target: { id: "section1" } as Element, isIntersecting: true },
      ]);
    });

    expect(onIntersect).toHaveBeenCalledWith("section1", true);

    act(() => {
      currentObserver!.simulateIntersection([
        { target: { id: "section1" } as Element, isIntersecting: false },
      ]);
    });

    expect(onIntersect).toHaveBeenCalledWith("section1", false);
  });

  it("observes and unobserves elements correctly", () => {
    render(<Fixture />);

    // We expect 2 elements to be observed initially due to the useEffect in the Fixture
    expect(currentObserver?.elements.size).toBe(2);

    cleanup(); // This will unmount and call unobserve and disconnect

    // Disconnect clears the elements
    expect(currentObserver?.elements.size).toBe(0);
  });
});

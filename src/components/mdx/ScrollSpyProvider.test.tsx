import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ScrollSpyProvider, useScrollSpyContext, useOptionalScrollSpyContext } from "./ScrollSpyProvider";

// Mock IntersectionObserver
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

let triggerIntersection: (entries: Partial<IntersectionObserverEntry>[]) => void;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    triggerIntersection = (entries) => {
      callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
    };
  }
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = disconnectMock;
}

describe("ScrollSpyProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    observeMock.mockClear();
    unobserveMock.mockClear();
    disconnectMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders children", () => {
    render(
      <ScrollSpyProvider>
        <div data-testid="child">Child Content</div>
      </ScrollSpyProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("throws when useScrollSpyContext is used outside provider", () => {
    // Suppress console.error and window error events to avoid polluted output
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const errorHandler = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener("error", errorHandler);

    const TestComponent = () => {
      useScrollSpyContext();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useScrollSpyContext must be used within ScrollSpyProvider"
    );

    consoleError.mockRestore();
    window.removeEventListener("error", errorHandler);
  });

  it("returns context value when useScrollSpyContext is used inside provider", () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useScrollSpyContext();
      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.registerTerm).toBeInstanceOf(Function);
    expect(contextValue.unregisterTerm).toBeInstanceOf(Function);
    expect(contextValue.activeTermIds).toBeInstanceOf(Set);
  });

  it("returns null when useOptionalScrollSpyContext is used outside provider", () => {
    let contextValue: any = "initial";
    const TestComponent = () => {
      contextValue = useOptionalScrollSpyContext();
      return null;
    };

    render(<TestComponent />);

    expect(contextValue).toBeNull();
  });

  it("returns context value when useOptionalScrollSpyContext is used inside provider", () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useOptionalScrollSpyContext();
      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.registerTerm).toBeInstanceOf(Function);
  });

  it("registers and unregisters terms, updating activeTermIds on intersection", () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useScrollSpyContext();
      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    const mockElement1 = document.createElement("div");
    mockElement1.id = "term-1";
    const mockElement2 = document.createElement("div");
    mockElement2.id = "term-2";

    act(() => {
      contextValue.registerTerm("term-1", mockElement1);
      contextValue.registerTerm("term-2", mockElement2);
    });

    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(observeMock).toHaveBeenCalledWith(mockElement1);
    expect(observeMock).toHaveBeenCalledWith(mockElement2);

    expect(contextValue.activeTermIds.size).toBe(0);

    // Trigger intersection for term-1
    act(() => {
      triggerIntersection([
        { target: mockElement1, isIntersecting: true },
        { target: mockElement2, isIntersecting: false },
      ]);
    });

    expect(contextValue.activeTermIds.has("term-1")).toBe(true);
    expect(contextValue.activeTermIds.has("term-2")).toBe(false);
    expect(contextValue.activeTermIds.size).toBe(1);

    // Trigger intersection for term-2 and out for term-1
    act(() => {
      triggerIntersection([
        { target: mockElement1, isIntersecting: false },
        { target: mockElement2, isIntersecting: true },
      ]);
    });

    expect(contextValue.activeTermIds.has("term-1")).toBe(false);
    expect(contextValue.activeTermIds.has("term-2")).toBe(true);
    expect(contextValue.activeTermIds.size).toBe(1);

    // Unregister term-2
    act(() => {
      contextValue.unregisterTerm("term-2");
    });

    expect(unobserveMock).toHaveBeenCalledWith(mockElement2);
    expect(contextValue.activeTermIds.has("term-2")).toBe(false);
    expect(contextValue.activeTermIds.size).toBe(0);
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = render(
      <ScrollSpyProvider>
        <div>Content</div>
      </ScrollSpyProvider>
    );

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it("handles registering with null element", () => {
    // Suppress console.error and window error events to avoid polluted output since react will complain if IntersectionObserver is not mocked and we don't have it inside describe? Wait, no, we move it inside describe so the mock IS applied!
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useScrollSpyContext();
      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    act(() => {
      contextValue.registerTerm("term-null", null);
    });

    expect(observeMock).not.toHaveBeenCalled();
  });

  it("handles unregistering non-existent element", () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useScrollSpyContext();
      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    act(() => {
      contextValue.unregisterTerm("non-existent");
    });

    expect(unobserveMock).not.toHaveBeenCalled();
  });

  it("handles registering element when observer is not initialized yet", () => {
    let contextValue: any;

    // Create a mock component that registers before provider sets up observer
    // We can simulate this by mocking the observer creation and capturing the ref
    // Or just simulating the exact code paths

    // Actually, simple unit test to simulate no observer:
    // observer is created in useEffect, which runs after first render.
    // However useEffect runs synchronously in testing-library unless we use specific techniques?
    // Wait, testing-library runs effects synchronously in act, which render is wrapped in.

    // The easiest way to test this branch is to temporarily make the observerRef null when calling register.
    // We can't directly access it. But we know useEffect sets it. We could mock useEffect if we mock React, but that's messy.
    // Instead we can just render the context and call registerTerm synchronously during the render!
    // React will call it, but useEffect hasn't run yet!

    const mockElement = document.createElement("div");

    const TestComponent = () => {
      const context = useScrollSpyContext();

      // Call registerTerm during render! (A bit anti-pattern but will hit the branch)
      context.registerTerm("early-term", mockElement);

      return null;
    };

    render(
      <ScrollSpyProvider>
        <TestComponent />
      </ScrollSpyProvider>
    );

    // It should NOT have observed the element because observerRef is null at render time
    expect(observeMock).not.toHaveBeenCalledWith(mockElement);
  });
});

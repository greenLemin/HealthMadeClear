import React, { useRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

// We need a wrapper component to test the hook
function TestComponent({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, active);

  return (
    <div>
      <button data-testid="outside-1">Outside 1</button>
      <div ref={containerRef} data-testid="trap-container">
        <button data-testid="inside-1">Inside 1</button>
        <button data-testid="inside-2">Inside 2</button>
        <button data-testid="inside-3">Inside 3</button>
        <button data-testid="inside-disabled" disabled>
          Inside Disabled
        </button>
      </div>
      <button data-testid="outside-2">Outside 2</button>
    </div>
  );
}

function EmptyTrapFixture({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return <div ref={ref}>No focusables here</div>;
}

describe("useFocusTrap", () => {
  beforeEach(() => {
    // JSDOM doesn't implement offsetParent, which is used to check visibility.
    // We mock it so our elements appear "visible".
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      get() {
        return this.parentNode;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    delete (HTMLElement.prototype as any).offsetParent;
  });

  it("does nothing when inactive", () => {
    render(<TestComponent active={false} />);
    const outside1 = screen.getByTestId("outside-1");
    outside1.focus();
    expect(document.activeElement).toBe(outside1);
  });

  it("focuses the first focusable element when activated", () => {
    render(<TestComponent active={true} />);
    const inside1 = screen.getByTestId("inside-1");
    expect(document.activeElement).toBe(inside1);
  });

  it("traps focus when tabbing forward from the last element", async () => {
    const user = userEvent.setup();
    render(<TestComponent active={true} />);
    const inside1 = screen.getByTestId("inside-1");
    const inside3 = screen.getByTestId("inside-3");

    // Focus the last element
    inside3.focus();
    expect(document.activeElement).toBe(inside3);

    // Tab forward
    await user.tab();

    // Should wrap around to the first element
    expect(document.activeElement).toBe(inside1);
  });

  it("traps focus when tabbing backward from the first element", async () => {
    const user = userEvent.setup();
    render(<TestComponent active={true} />);
    const inside1 = screen.getByTestId("inside-1");
    const inside3 = screen.getByTestId("inside-3");

    // Focus should be on the first element initially
    expect(document.activeElement).toBe(inside1);

    // Tab backward
    await user.tab({ shift: true });

    // Should wrap around to the last element
    expect(document.activeElement).toBe(inside3);
  });

  it("allows normal tab flow when not on first or last element", async () => {
    const user = userEvent.setup();
    render(<TestComponent active={true} />);
    const inside2 = screen.getByTestId("inside-2");
    const inside3 = screen.getByTestId("inside-3");

    inside2.focus();
    expect(document.activeElement).toBe(inside2);

    // Simulate Tab
    await user.tab();

    // Focus should flow normally to the next element
    expect(document.activeElement).toBe(inside3);
  });

  it("ignores non-Tab key events", () => {
    render(<TestComponent active={true} />);
    const inside1 = screen.getByTestId("inside-1");

    expect(document.activeElement).toBe(inside1);

    // Simulate another key
    fireEvent.keyDown(document, { key: "Enter" });

    // Focus should remain on the first element
    expect(document.activeElement).toBe(inside1);
  });

  it("handles empty container without throwing", () => {
    render(<EmptyTrapFixture active={true} />);

    // Try pressing Tab, should not crash
    expect(() => fireEvent.keyDown(document, { key: "Tab" })).not.toThrow();
  });

  it("returns focus to previously focused element when deactivated", () => {
    const { rerender } = render(<TestComponent active={false} />);

    // Focus an outside element before trapping
    const outside1 = screen.getByTestId("outside-1");
    outside1.focus();
    expect(document.activeElement).toBe(outside1);

    // Activate the trap
    rerender(<TestComponent active={true} />);
    const inside1 = screen.getByTestId("inside-1");
    expect(document.activeElement).toBe(inside1);

    // Deactivate the trap
    rerender(<TestComponent active={false} />);
    expect(document.activeElement).toBe(outside1);
  });
});

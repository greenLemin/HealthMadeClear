// @vitest-environment jsdom
import { render, fireEvent, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function TrapFixture({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref}>
      <button type="button" data-testid="first">
        First
      </button>
      <button type="button" data-testid="middle">
        Middle
      </button>
      <button type="button" data-testid="last">
        Last
      </button>
    </div>
  );
}

function EmptyTrapFixture({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return <div ref={ref}>No focusables here</div>;
}

describe("useFocusTrap", () => {
  let originalOffsetParent: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get() {
        return this.parentNode;
      },
    });
  });

  afterAll(() => {
    if (originalOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, "offsetParent", originalOffsetParent);
    } else {
      // @ts-ignore
      delete HTMLElement.prototype.offsetParent;
    }
  });

  it("mounts with active and inactive states", () => {
    const { rerender } = render(<TrapFixture active={false} />);
    rerender(<TrapFixture active />);
    expect(document.querySelectorAll("button").length).toBe(3);
  });

  it("focuses the first focusable element when activated", () => {
    render(<TrapFixture active={true} />);
    expect(document.activeElement).toBe(screen.getByTestId("first"));
  });

  it("does nothing if active is false", () => {
    render(<TrapFixture active={false} />);
    expect(document.activeElement).not.toBe(screen.getByTestId("first"));
  });

  it("wraps focus to the last element when Shift+Tab is pressed on the first element", () => {
    render(<TrapFixture active={true} />);
    const first = screen.getByTestId("first");
    const last = screen.getByTestId("last");

    // Ensure first element is focused initially
    expect(document.activeElement).toBe(first);

    // Simulate Shift+Tab
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it("wraps focus to the first element when Tab is pressed on the last element", () => {
    render(<TrapFixture active={true} />);
    const first = screen.getByTestId("first");
    const last = screen.getByTestId("last");

    // Manually focus the last element
    last.focus();
    expect(document.activeElement).toBe(last);

    // Simulate Tab
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });

    expect(document.activeElement).toBe(first);
  });

  it("allows normal tab flow when not on first or last element", () => {
    render(<TrapFixture active={true} />);
    const middle = screen.getByTestId("middle");

    middle.focus();
    expect(document.activeElement).toBe(middle);

    // Simulate Tab
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });

    // Focus should remain or flow normally, handled by browser not JS
    // We just verify it doesn't wrap to first/last forcefully
    expect(document.activeElement).toBe(middle);
  });

  it("ignores non-Tab key events", () => {
    render(<TrapFixture active={true} />);
    const first = screen.getByTestId("first");

    expect(document.activeElement).toBe(first);

    // Simulate another key
    fireEvent.keyDown(document, { key: "Enter" });

    // Focus should remain on the first element
    expect(document.activeElement).toBe(first);
  });

  it("handles empty container without throwing", () => {
    render(<EmptyTrapFixture active={true} />);

    // Try pressing Tab, should not crash
    expect(() => fireEvent.keyDown(document, { key: "Tab" })).not.toThrow();
  });
});

// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function TrapFixture({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref}>
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("mounts with active and inactive states", () => {
    const { rerender } = render(<TrapFixture active={false} />);
    rerender(<TrapFixture active />);
    expect(document.querySelectorAll("button").length).toBe(2);
  });
});

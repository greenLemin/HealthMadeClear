import { beforeEach, describe, expect, it } from "vitest";
import { lockScroll, unlockScroll } from "./scrollLock";

describe("scrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("locks body scroll and restores initial style when unlocked", () => {
    document.body.style.overflow = "auto";
    lockScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockScroll();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("handles nested lock and unlock calls correctly", () => {
    document.body.style.overflow = "visible";
    lockScroll();
    lockScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockScroll();
    expect(document.body.style.overflow).toBe("visible");
  });

  it("handles unlockScroll edge case when scroll is not locked (scrollLockCount = 0)", () => {
    document.body.style.overflow = "scroll";
    unlockScroll();
    expect(document.body.style.overflow).toBe("scroll");

    // Lock and unlock once to verify count remains non-negative
    lockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    unlockScroll();
    expect(document.body.style.overflow).toBe("scroll");
  });
});

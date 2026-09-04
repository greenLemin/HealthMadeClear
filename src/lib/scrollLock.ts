let scrollLockCount = 0;
let previousBodyOverflow = "";

export function lockScroll() {
  if (typeof document === "undefined") return;
  if (scrollLockCount === 0) {
    try {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } catch {
      return;
    }
  }
  scrollLockCount += 1;
}

export function unlockScroll() {
  if (typeof document === "undefined") {
    scrollLockCount = 0;
    return;
  }
  if (scrollLockCount > 0) {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) {
      try {
        document.body.style.overflow = previousBodyOverflow;
      } catch {
        // Best-effort — layout must not throw on teardown.
      }
    }
  }
}

export function resetScrollLockForTests() {
  scrollLockCount = 0;
  previousBodyOverflow = "";
}

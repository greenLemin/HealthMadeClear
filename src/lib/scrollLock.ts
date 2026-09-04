let scrollLockCount = 0;
let previousBodyOverflow = "";

export function lockScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
}

export function unlockScroll() {
  if (scrollLockCount > 0) {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) {
      document.body.style.overflow = previousBodyOverflow;
    }
  }
}

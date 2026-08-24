import "@testing-library/jest-dom/vitest";

// Controllable matchMedia mock supporting both legacy addListener/removeListener
// and modern addEventListener/removeEventListener with triggerable matches.
type MQL = MediaQueryList & { _setMatches: (matches: boolean) => void };

const allMQLs = new Set<MQL>();

function createMQL(query: string): MQL {
  let _matches = false;
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  let onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null = null;

  const mql = {
    get matches() {
      return _matches;
    },
    set matches(v: boolean) {
      _matches = v;
    },
    media: query,
    get onchange() {
      return onchange;
    },
    set onchange(v) {
      onchange = v;
    },
    addListener(cb: (e: MediaQueryListEvent) => void) {
      listeners.add(cb);
    },
    removeListener(cb: (e: MediaQueryListEvent) => void) {
      listeners.delete(cb);
    },
    addEventListener(type: string, cb: EventListener) {
      if (type === "change") listeners.add(cb as unknown as (e: MediaQueryListEvent) => void);
    },
    removeEventListener(type: string, cb: EventListener) {
      if (type === "change") listeners.delete(cb as unknown as (e: MediaQueryListEvent) => void);
    },
    dispatchEvent() {
      return false;
    },
    _setMatches(matches: boolean) {
      _matches = matches;
      const event = { matches, media: query } as MediaQueryListEvent;
      listeners.forEach((cb) => {
        try {
          cb(event);
        } catch {}
      });
      if (typeof onchange === "function") {
        try {
          onchange.call(mql as unknown as MediaQueryList, event);
        } catch {}
      }
    },
  } as unknown as MQL;

  Object.defineProperty(mql, "matches", {
    get() {
      return _matches;
    },
    set(v: boolean) {
      _matches = v;
    },
    configurable: true,
  });

  return mql;
}

const mockMatchMedia = (query: string) => {
  const mql = createMQL(query);
  allMQLs.add(mql);
  return mql;
};

// Expose helper to toggle matches in tests
Object.assign(mockMatchMedia as unknown as Record<string, unknown>, {
  __setMatches(matches: boolean) {
    allMQLs.forEach((m) => m._setMatches(matches));
  },
  __all: allMQLs,
}) as unknown as { __setMatches: (m: boolean) => void };

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

// Global helper for tests that import via globalThis
(globalThis as unknown as Record<string, unknown>).__setMockMatchMediaMatches = (matches: boolean) => {
  allMQLs.forEach((m) => m._setMatches(matches));
};

declare global {
  interface Window {
    __setMockMatchMediaMatches?: (matches: boolean) => void;
  }
}

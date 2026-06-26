# Health Made Clear — Mobile QA Checklist

**Test devices:** 375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini)  
**Date:** 2026-06-20  
**Status:** ❌ Not started | ⚡ Partial | ✅ Pass

---

## Navigation

| #   | Requirement                                                                                                      | 375px | 390px | 768px |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----- | ----- | ----- |
| 1   | Hamburger menu visible, ≥44×44px, top-right position                                                             | ❌    | ❌    | ❌    |
| 2   | `aria-label="Open menu"` with `aria-expanded` toggling                                                           | ✅    | ✅    | ✅    |
| 3   | Focus trapped when mobile menu open                                                                              | ✅    | ✅    | ✅    |
| 4   | Escape key closes mobile menu                                                                                    | ✅    | ✅    | ✅    |
| 5   | Bottom tab bar for ≤5 primary nav items (alternative: hamburger OK if >5 items — 8 items → hamburger is correct) | ✅    | ✅    | ✅    |
| 6   | No control duplication between header and mobile menu at tablet (768-1023px)                                     | ❌    | ❌    | ❌    |
| 7   | Mobile nav first in tab order (before controls)                                                                  | ❌    | ❌    | ❌    |

---

## Layout

| #   | Requirement                                                      | 375px | 390px | 768px |
| --- | ---------------------------------------------------------------- | ----- | ----- | ----- |
| 8   | ALL content visible within viewport without horizontal scrolling | ❌    | ❌    | ❌    |
| 9   | No horizontal scrollbar at any width 320px-2560px                | ❌    | ❌    | ❌    |
| 10  | Multi-column layouts stack to single column at <768px            | ✅    | ✅    | ✅    |
| 11  | Tables collapse to card list OR scroll with shadow hint          | N/A   | N/A   | N/A   |
| 12  | Single sticky element only (not header + footer combo)           | ✅    | ✅    | ✅    |
| 13  | `overflow-x: hidden` on html/body prevents overflow              | ❌    | ❌    | ❌    |

---

## Hero Section

| #   | Requirement                              | 375px | 390px | 768px |
| --- | ---------------------------------------- | ----- | ----- | ----- |
| 14  | Hero does not exceed 60vh                | ❌    | ❌    | ❌    |
| 15  | Image panel hidden on mobile             | ❌    | ❌    | ❌    |
| 16  | Content below fold is visible after hero | ❌    | ❌    | ❌    |

---

## Typography

| #   | Requirement                                  | 375px                   | 390px | 768px |
| --- | -------------------------------------------- | ----------------------- | ----- | ----- |
| 17  | Body text ≥16px (prevents iOS zoom on focus) | ✅ (18px)               | ✅    | ✅    |
| 18  | H1 on mobile ≤2.5rem (40px)                  | ✅ (headline-xl = 40px) | ✅    | ✅    |
| 19  | Line-height 1.6 for body, 1.15 for headings  | ✅                      | ✅    | ✅    |
| 20  | Body text 16px on mobile (not 18px)          | ❌                      | ❌    | ❌    |

---

## Touch & Interaction

| #   | Requirement                                            | 375px | 390px | 768px |
| --- | ------------------------------------------------------ | ----- | ----- | ----- |
| 21  | All tap targets ≥44×44px                               | ❌    | ❌    | ❌    |
| 22  | Visible `:active` state on all buttons/links           | ❌    | ❌    | ❌    |
| 23  | No hover-only menus or tooltips                        | ✅    | ✅    | ✅    |
| 24  | No `position: fixed` overlapping primary content       | ✅    | ✅    | ✅    |
| 25  | Filter chips (category/difficulty/alphabet) ≥44px tall | ❌    | ❌    | ❌    |

---

## Forms

| #   | Requirement                                               | 375px | 390px | 768px |
| --- | --------------------------------------------------------- | ----- | ----- | ----- |
| 26  | Inputs stacked vertically (label above input)             | ✅    | ✅    | ✅    |
| 27  | Correct input types (`email`, `tel`, `number`, `search`)  | ✅    | ✅    | ✅    |
| 28  | Submit buttons full-width on mobile                       | ✅    | ✅    | ✅    |
| 29  | No full-screen fixed-position modals (use slide-up sheet) | ❌    | ❌    | ❌    |
| 30  | Inline error messages visible above keyboard              | ✅    | ✅    | ✅    |

---

## Performance

| #   | Requirement                                                | Status                                                           |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| 31  | All images use `loading="lazy"` with explicit width/height | ⚡ Hero image has `priority` (correct), others need verification |
| 32  | Fonts preconnected, `font-display: swap`                   | ✅                                                               |
| 33  | No JavaScript blocks main thread on load                   | ✅ (SSG)                                                         |
| 34  | Nav bundle-split (SearchDialog dynamic import)             | ✅                                                               |

---

## Accessibility (Mobile-Specific)

| #   | Requirement                                       | Status                   |
| --- | ------------------------------------------------- | ------------------------ |
| 35  | Skip link visible on first Tab press              | ❌ (sr-only until focus) |
| 36  | Keyboard can navigate entire mobile menu          | ✅                       |
| 37  | Touch targets respond with visual feedback on tap | ❌                       |
| 38  | `prefers-reduced-motion` disables all animations  | ⚡ Partial — verify all  |

---

## Responsive Breakpoints Coverage

| Breakpoint | Width Range   | Verified |
| ---------- | ------------- | -------- |
| Mobile     | 320px-767px   | ❌       |
| Tablet     | 768px-1023px  | ❌       |
| Desktop    | 1024px-1439px | ❌       |
| Wide       | 1440px+       | ❌       |

All layout changes use `min-width` (mobile-first). No `max-width` breakpoints unless absolutely necessary.

---

## Summary

| Status     | Count |
| ---------- | ----- |
| ✅ Pass    | 18    |
| ❌ Fail    | 17    |
| ⚡ Partial | 3     |
| N/A        | 1     |

**Blocking failures:** Items 1, 6, 7, 8, 9, 13, 14, 15, 16, 20, 21, 22, 25, 29 — must be resolved in implementation.

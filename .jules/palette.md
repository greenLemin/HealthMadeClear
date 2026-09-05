## 2026-09-05 - Floating Action Button Tooltips

**Learning:** Icon-only floating action buttons (such as `ScrollToTop`) have `aria-label` for screen reader accessibility, but desktop mouse users benefit greatly from a standard `title` hover tooltip providing instant visual feedback.
**Action:** Always include a localized `title` attribute matching `aria-label` on icon-only interactive controls across the application.

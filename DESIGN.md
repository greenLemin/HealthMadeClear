---
name: Health Clarity System
colors:
  surface: "#f8f9fb"
  surface-dim: "#d8dadc"
  surface-bright: "#f8f9fb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f6"
  surface-container: "#eceef0"
  surface-container-high: "#e6e8ea"
  surface-container-highest: "#e0e3e5"
  on-surface: "#191c1e"
  on-surface-variant: "#3f484a"
  inverse-surface: "#2d3133"
  inverse-on-surface: "#eff1f3"
  outline: "#6f797a"
  outline-variant: "#bfc8c9"
  surface-tint: "#20686f"
  primary: "#004349"
  on-primary: "#ffffff"
  primary-container: "#0d5c63"
  on-primary-container: "#90d2da"
  inverse-primary: "#8fd1d9"
  secondary: "#3e6658"
  on-secondary: "#ffffff"
  secondary-container: "#c0ecda"
  on-secondary-container: "#446c5e"
  tertiary: "#5c310d"
  on-tertiary: "#ffffff"
  tertiary-container: "#784722"
  on-tertiary-container: "#fcb88a"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#abeef6"
  primary-fixed-dim: "#8fd1d9"
  on-primary-fixed: "#002023"
  on-primary-fixed-variant: "#004f55"
  secondary-fixed: "#c0ecda"
  secondary-fixed-dim: "#a5d0be"
  on-secondary-fixed: "#002117"
  on-secondary-fixed-variant: "#264e41"
  tertiary-fixed: "#ffdcc6"
  tertiary-fixed-dim: "#fcb889"
  on-tertiary-fixed: "#301400"
  on-tertiary-fixed-variant: "#693b17"
  background: "#f8f9fb"
  on-background: "#191c1e"
  surface-variant: "#e0e3e5"
typography:
  headline-xl:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 40px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.25"
  headline-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: "600"
    lineHeight: "1.4"
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: "600"
    lineHeight: "1.4"
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 28px
    fontWeight: "700"
    lineHeight: "1.25"
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max-width: 1100px
---

## Brand & Style

The design system is built on the principles of **accessibility, empathy, and clarity**. It is designed to serve a diverse audience, including those with varying levels of health literacy or visual impairments. The aesthetic is "Warm Clinical"—it maintains the professional authority of a medical institution while removing the cold, sterile barriers often associated with healthcare.

The style leans into **Minimalism** to reduce cognitive load. By utilizing generous whitespace and a restricted color palette, the design system ensures that the information remains the hero. It avoids decorative "eye-candy" or distracting trends, opting instead for a grounded, functional, and deeply human-centered interface.

## Colors

The palette is anchored by **Deep Teal**, a color that evokes stability and professional trust. This is balanced by **Soft Sage Green**, used intentionally for positive reinforcement, health milestones, and "success" states.

- **Primary (Deep Teal):** Used for core branding, primary actions, and structural headers.
- **Secondary (Sage Green):** Used for accents that require a calming yet optimistic tone.
- **Neutrals:** A range of warm whites and soft greys provide a soft background that is easier on the eyes than pure #FFFFFF.
- **Text:** High-contrast charcoal (#212529) ensures WCAG AAA compliance for legibility against light backgrounds.

## Typography

This design system prioritizes **Atkinson Hyperlegible Next**, a typeface specifically designed to increase character recognition and improve legibility.

The typography scale is intentionally large. A **18px base** for body text ensures that long-form health education content is readable for users with vision fatigue or age-related sight decline. Line heights are kept generous (1.6x) to prevent "crowding" of text lines. Headings use a slightly tighter line height but maintain a bold weight to provide a clear, scannable document hierarchy.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for desktop to prevent line lengths from becoming too wide, which can hinder readability.

- **Desktop:** A 12-column grid centered within a 1100px container. This creates natural "breathing room" on the sides of the screen.
- **Mobile:** A single-column layout with 16px side margins.
- **Rhythm:** An 8px base unit governs all padding and margins. Vertical rhythm is emphasized; sections are separated by significant whitespace (64px or more) to allow the user to focus on one concept at a time.

Inter-component spacing should always feel "airy." When in doubt, increase the margin to prevent the UI from feeling claustrophobic or urgent.

## Elevation & Depth

To maintain a calm atmosphere, depth is conveyed through **Tonal Layers** and very soft, ambient shadows.

1.  **Level 0 (Surface):** The main background using the warm neutral.
2.  **Level 1 (Card):** White surfaces with a subtle 1px border (#E9ECEF) or an extremely soft, diffused shadow (Blur: 16px, Opacity: 4%, Color: Primary).
3.  **Level 2 (Interaction):** Active elements like open menus or modals use a slightly more defined shadow to pull them forward, but never enough to create visual "noise."

Avoid hard shadows, inner shadows, or complex gradients. The goal is a flat, layered paper-like quality.

## Shapes

The shape language uses **Rounded (8px)** corners as the default. This radius is applied to buttons, input fields, and cards. It provides a friendly, approachable feel without appearing overly juvenile or "bubbly."

Larger containers (like featured educational modules) should use `rounded-lg` (16px) to emphasize their role as distinct, safe areas for learning.

## Components

### Buttons

Buttons must be highly visible and easily tappable.

- **Primary:** Deep Teal background with White text. Minimum height: 56px for touch accessibility.
- **Secondary:** Outline style with a 2px stroke in Deep Teal.
- **States:** Hover states should involve a subtle shift in saturation, not a dramatic change in brightness.

### Cards

Cards are the primary vehicle for education. They should feature generous internal padding (min 24px) and a clear heading. Use the Level 1 elevation (subtle border) to define the boundaries.

### Input Fields

Inputs require high-contrast borders (1.5px) to ensure users can easily identify where to type. Labels must always be visible (never use placeholder text as labels) and positioned above the field.

### Progress Indicators

Since health education can be a journey, use soft sage green progress bars. These should be thick (8px+) and have rounded ends to feel encouraging rather than clinical.

### Callouts/Alerts

Use tinted backgrounds (e.g., very light blue for info, very light sage for success) with a thick vertical bar on the left side to highlight important medical tips or "Key Takeaways."

# src/components/

## Responsibility

React component library — all UI components organized by domain.

## Key Files (top-level)

- `AppProviders.tsx`: Client context provider — theme, text size, simple mode, locale, learning progress (Context API + localStorage)
- `Header.tsx`: Navigation header with mobile menu, auth controls, search, language/theme toggles
- `Footer.tsx`: Site footer
- `Hero.tsx`: Home page hero section
- `LanguageToggle.tsx`: EN/ES language switcher
- `AccessibilityControls.tsx`: Font size, simple mode toggles
- `SearchDialog.tsx`: Search overlay for glossary/lessons
- `OnboardingDialog.tsx`: First-visit onboarding modal
- `LessonThumbnail.tsx`: Lesson card thumbnail
- `MedicalDisclaimer.tsx`: Medical info disclaimer banner
- `JsonLd.tsx`: JSON-LD structured data component
- `Callout.tsx`: Info/success/warning callout box
- `PageHeader.tsx`: Reusable page header with title and optional description
- `PageSection.tsx`: Reusable page section wrapper
- `SectionNav.tsx`: Side navigation for sections
- `ScrollToTop.tsx`: Floating scroll-to-top button

## Subdirectories

| Directory    | Responsibility                                                                               |
| ------------ | -------------------------------------------------------------------------------------------- |
| `layout/`    | Layout primitives (Container, Section)                                                       |
| `ui/`        | Design system primitives (Button, Card, Input, Modal, Toast, Badge, etc.)                    |
| `providers/` | React context providers (AuthProvider)                                                       |
| `learn/`     | Learning catalog cards (LessonCard, LearningPathCard)                                        |
| `lesson/`    | Lesson detail widgets (LessonActionsClient, LessonRelatedClient)                             |
| `quiz/`      | Quiz interaction components                                                                  |
| `articles/`  | Article display components                                                                   |
| `dashboard/` | Dashboard widgets (AchievementCard, DashboardSidebar)                                        |
| `mdx/`       | MDX rendering components (MarkdownRenderer, GlossaryHighlighter, Callout, ScrollSpyProvider) |

## Design Patterns

- Client components use `"use client"` directive
- Shared context via `AppProviders` (theme, progress, preferences)
- MDX content rendered through MarkdownRenderer with custom components

## Integration

- Consumed by: All pages in `app/[locale]/`
- Depends on: `src/hooks/`, `src/lib/`, `src/messages/`

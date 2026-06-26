# src/components/mdx/

## Responsibility

MDX rendering components for content sections, callouts, glossary inline highlighting.

## Key Files

- `MarkdownRenderer.tsx`: Parses markdown content into React elements with custom component mappings
- `GlossaryHighlighter.tsx`: Inline glossary term highlighting in lesson/article content
- `InlineGlossaryTerm.tsx`: Glossary term tooltip/popover for inline terms
- `LessonCallout.tsx`: Info/success/warning callout rendering
- `ScrollSpyProvider.tsx`: Scroll position tracking for active section highlighting

## Integration

- Consumed by: All lesson, article, and path content pages
- Depends on: `src/lib/glossary/` for term data, `src/types/` for content types

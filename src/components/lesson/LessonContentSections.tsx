import Reveal from "@/components/ui/Reveal";
import Callout from "@/components/Callout";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import type { Lesson } from "@/types/lesson";
import type { GlossaryTerm } from "@/types/glossary";

export default function LessonContentSections({
  sections,
  glossaryTerms,
}: {
  sections: Lesson["content"]["sections"];
  glossaryTerms: GlossaryTerm[];
}) {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <Reveal key={`${section.title}-${index}`} delay={Math.min(index * 0.04, 0.18)}>
          <section className="surface-card px-6 py-6 md:px-8 md:py-8">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container shadow-elevation-1"
                aria-hidden="true"
              >
                {index + 1}
              </div>
              <h2 className="font-display text-headline-md text-primary">{section.title}</h2>
            </div>
            <div className="max-w-[70ch] whitespace-pre-line text-body-md text-on-surface-variant">
              <MarkdownRenderer text={section.content} glossaryTerms={glossaryTerms} />
            </div>
            {section.callouts?.map((callout, calloutIndex) => (
              <Callout
                key={`${section.title}-${callout.type}-${callout.content.slice(0, 20)}-${calloutIndex}`}
                type={callout.type}
                className="mt-4"
              >
                {callout.content}
              </Callout>
            ))}
          </section>
        </Reveal>
      ))}
    </div>
  );
}

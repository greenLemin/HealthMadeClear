import { useTranslations } from "next-intl";
import { type LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { type VisitTypeKey } from "../types";

type Props = {
  visitType: VisitTypeKey;
  visitTypes: Record<VisitTypeKey, { label: string; questions: string[]; icon: LucideIcon }>;
  visitTypeDescriptions: Record<VisitTypeKey, string>;
  prepBullets: string[];
  onChangeVisitType: (key: VisitTypeKey) => void;
  onNext: () => void;
};

export default function Step1ChooseVisitType({
  visitType,
  visitTypes,
  visitTypeDescriptions,
  prepBullets,
  onChangeVisitType,
  onNext,
}: Props) {
  const t = useTranslations("tools");
  const tPlanner = useTranslations("tools.visitPlanner");
  const tCommon = useTranslations("common");

  return (
    <div className="mt-8">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
            <div className="eyebrow mb-3">{tPlanner("introEyebrow")}</div>
            <h2 className="font-display text-headline-lg text-primary">{tPlanner("prepTitle")}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{tPlanner("prepBody")}</p>

            <div className="mt-6 space-y-3">
              {prepBullets.map((item, index) => (
                <div key={item} className="surface-card flex items-center gap-4 px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-label-md font-semibold text-on-primary-container shadow-elevation-1">
                    {index + 1}
                  </div>
                  <p className="text-body-md text-on-surface">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {(Object.entries(visitTypes) as [VisitTypeKey, (typeof visitTypes)[VisitTypeKey]][]).map(
            ([key, value], index) => {
              const active = visitType === key;
              const Icon = value.icon;

              return (
                <Reveal key={key} delay={Math.min(index * 0.04, 0.12)}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={[
                      "h-full text-left",
                      active
                        ? "surface-card-strong px-6 py-6 shadow-elevation-2"
                        : "surface-card px-6 py-6 hover:-translate-y-0.5 hover:border-primary/20",
                    ].join(" ")}
                    onClick={() => onChangeVisitType(key)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <span className={active ? "chip-active" : "chip"}>
                        {value.questions.length} {t("suggestedQuestions")}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-headline-md text-primary">{value.label}</h3>
                    <p className="mt-3 text-body-md text-on-surface-variant">{visitTypeDescriptions[key]}</p>
                  </button>
                </Reveal>
              );
            }
          )}
        </div>
      </section>

      <div className="no-print mt-8 flex justify-end">
        <Button onClick={onNext}>{tCommon("continue")}</Button>
      </div>
    </div>
  );
}

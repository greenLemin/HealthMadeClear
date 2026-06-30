import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function LessonNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "learn" });

  return (
    <div className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <Card className="text-center">
          <h1 className="mb-3 text-headline-lg text-primary">{t("notFoundTitle")}</h1>
          <p className="mb-6 text-body-md text-on-surface-variant">{t("notFoundBody")}</p>
          <ButtonLink href="/learn" icon={<ArrowLeft size={18} />}>
            {t("backToLibrary")}
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}

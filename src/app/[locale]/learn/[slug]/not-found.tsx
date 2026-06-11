import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function LessonNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "learn" });

  return (
    <div className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="card text-center">
          <h1 className="mb-3 text-headline-lg text-primary">{t("notFoundTitle")}</h1>
          <p className="mb-6 text-body-md text-on-surface-variant">{t("notFoundBody")}</p>
          <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            {t("backToLibrary")}
          </Link>
        </div>
      </div>
    </div>
  );
}

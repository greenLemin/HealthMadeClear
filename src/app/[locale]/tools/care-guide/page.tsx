import { getTranslations } from "next-intl/server";
import CareGuideClient from "./CareGuideClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  return {
    title: t("careGuideTitle"),
    description: t("careGuideDescription"),
  };
}

export default function CareGuidePage() {
  return <CareGuideClient />;
}

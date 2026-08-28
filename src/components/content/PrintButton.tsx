"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function PrintButton() {
  const t = useTranslations("common");
  const label = t("print");

  return (
    <Button
      type="button"
      variant="secondary"
      icon={<Printer size={18} />}
      aria-label={label}
      className="no-print"
      onClick={() => window.print()}
    >
      {label}
    </Button>
  );
}

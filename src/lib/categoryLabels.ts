import type { LessonCategoryId } from "@/types/content";
import type { Locale } from "@/lib/i18n";
import { getCategoryLabel } from "@/lib/i18n";

export function getLessonCategoryLabel(categoryId: LessonCategoryId, locale: Locale): string {
  return getCategoryLabel(categoryId, locale);
}

import Image from "next/image";
import { getLessonCategoryVisual } from "@/lib/lessonVisuals";
import type { LessonCategoryId } from "@/types/content";

type Props = {
  image?: string;
  imageAlt?: string;
  categoryId: LessonCategoryId;
  title: string;
  className?: string;
  priority?: boolean;
};

export default function LessonThumbnail({
  image,
  imageAlt,
  categoryId,
  title,
  className = "min-h-56 w-full",
  priority = false,
}: Props) {
  const visual = getLessonCategoryVisual(categoryId);

  if (image) {
    return (
      <div className={`relative overflow-hidden bg-surface-container ${className}`}>
        <Image
          src={image}
          alt={imageAlt ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${visual.gradient} ${className}`}
      aria-hidden
    >
      <span className="text-6xl drop-shadow-sm">{visual.emoji}</span>
      <span className="sr-only">{title}</span>
    </div>
  );
}

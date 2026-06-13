"use client";

import dynamic from "next/dynamic";
import Skeleton from "@/components/ui/Skeleton";
import type { Quiz } from "@/types/quiz";

const QuizClient = dynamic(() => import("./QuizClient"), {
  loading: () => <Skeleton variant="card" height="400px" />,
  ssr: false,
});

type Props = {
  quiz: Quiz;
  lessonTitle: string;
  lessonId: string;
};

export default function QuizClientWrapper({ quiz, lessonTitle, lessonId }: Props) {
  return <QuizClient quiz={quiz} lessonTitle={lessonTitle} lessonId={lessonId} />;
}

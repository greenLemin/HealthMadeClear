const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const PASS_RATIO = 0.7;

export function isQuizPassed(score: number, maxScore: number): boolean {
  return maxScore > 0 && score / maxScore >= PASS_RATIO;
}

export function toPercent(score: number, maxScore: number): number {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Convert percent-in-score (80/5) and percent-in-both (60/60) to count/count.
 * `score === maxScore && score > 10` is coupled to today's catalog (max 10 questions).
 * Do not use as a heuristic for a future 12-question quiz (12/12 would become 1).
 */
export function normalizeStoredScore(score: number, maxScore: number): { score: number; maxScore: number } {
  if (maxScore > 0 && (score > maxScore || (score === maxScore && score > 10))) {
    return { score: clamp(Math.round((score * maxScore) / 100), 0, maxScore), maxScore };
  }
  return { score, maxScore };
}

export function quizIdsForLesson(lessonId: string): string[] {
  return [lessonId, `${lessonId}-quiz`];
}

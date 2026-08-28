/** PostgREST onConflict target. Must match 015 unique (user_id, quiz_id). */
export const QUIZ_ATTEMPTS_ON_CONFLICT = "user_id,quiz_id";

/** PostgREST onConflict target. Matches live unique (user_id, lesson_id). */
export const LESSON_PROGRESS_ON_CONFLICT = "user_id,lesson_id";

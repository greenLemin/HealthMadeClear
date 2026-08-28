import { describe, expect, it } from "vitest";
import { LESSON_PROGRESS_ON_CONFLICT, QUIZ_ATTEMPTS_ON_CONFLICT } from "./schema";

describe("supabase schema conflict targets", () => {
  it("exports PostgREST onConflict strings that match unique keys", () => {
    expect(QUIZ_ATTEMPTS_ON_CONFLICT).toBe("user_id,quiz_id");
    expect(LESSON_PROGRESS_ON_CONFLICT).toBe("user_id,lesson_id");
  });
});

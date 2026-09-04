import { describe, expect, it } from "vitest";
import { applyMutation } from "./mutations";
import type { MockDb } from "../types";

function createTestDb(): MockDb {
  return {
    quiz_attempts: [
      {
        id: "qa-1",
        user_id: "u-1",
        quiz_id: "q-1",
        score: 100,
        max_score: 100,
        answers: {},
        passed: true,
        attempted_at: "2025-01-01T00:00:00Z",
      },
    ],
    lesson_progress: [
      {
        id: "lp-1",
        user_id: "u-1",
        lesson_id: "l-1",
        completed: true,
        completed_at: "2025-01-01T00:00:00Z",
        time_spent_seconds: 60,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ],
    achievements: [],
    streaks: [],
    profiles: [],
    daily_log: [],
    notifications: [],
    contact_submissions: [],
    auth: {
      account: {
        id: "u-1",
        email: "u1@example.com",
        password: "",
        display_name: "User 1",
        confirmed: true,
        pending_reset_code: null,
        pending_confirm_code: null,
        created_at: "2025-01-01T00:00:00Z",
      },
      current_user_id: "u-1",
    },
  };
}

describe("mutations (quiz_attempts & lesson_progress)", () => {
  describe("quiz_attempts", () => {
    it("inserts new quiz attempt successfully", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "quiz_attempts",
        {
          kind: "insert",
          values: { user_id: "u-1", quiz_id: "q-2", score: 90, passed: true },
        },
        []
      );

      expect(result.error).toBeNull();
      expect(result.changed).toBe(true);
      expect(result.rows.length).toBe(1);
      expect(db.quiz_attempts.length).toBe(2);
      expect(db.quiz_attempts[1]?.quiz_id).toBe("q-2");
    });

    it("returns error on insert of duplicate key", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "quiz_attempts",
        {
          kind: "insert",
          values: { user_id: "u-1", quiz_id: "q-1", score: 90, passed: true },
        },
        []
      );

      expect(result.error).toEqual({
        message: 'duplicate key value violates unique constraint "quiz_attempts_user_id_quiz_id_key"',
        code: "23505",
      });
      expect(result.changed).toBe(false);
      expect(db.quiz_attempts.length).toBe(1);
    });

    it("upserts existing quiz attempt cleanly", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "quiz_attempts",
        {
          kind: "upsert",
          values: { user_id: "u-1", quiz_id: "q-1", score: 50, passed: false },
        },
        []
      );

      expect(result.error).toBeNull();
      expect(result.changed).toBe(true);
      expect(db.quiz_attempts.length).toBe(1);
      expect(db.quiz_attempts[0]?.score).toBe(50);
      expect(db.quiz_attempts[0]?.passed).toBe(false);
      expect(db.quiz_attempts[0]?.id).toBe("qa-1");
    });

    it("handles batch upsert with new and existing rows", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "quiz_attempts",
        {
          kind: "upsert",
          values: [
            { user_id: "u-1", quiz_id: "q-1", score: 70, passed: true },
            { user_id: "u-1", quiz_id: "q-3", score: 100, passed: true },
            { user_id: "u-2", quiz_id: "q-1", score: 60, passed: false },
          ],
        },
        []
      );

      expect(result.error).toBeNull();
      expect(result.changed).toBe(true);
      expect(result.rows.length).toBe(3);
      expect(db.quiz_attempts.length).toBe(3);
      expect(db.quiz_attempts[0]?.score).toBe(70);
      expect(db.quiz_attempts[1]?.quiz_id).toBe("q-3");
      expect(db.quiz_attempts[2]?.user_id).toBe("u-2");
    });
  });

  describe("lesson_progress", () => {
    it("inserts new lesson progress successfully", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "lesson_progress",
        {
          kind: "insert",
          values: { user_id: "u-1", lesson_id: "l-2", completed: true },
        },
        []
      );

      expect(result.error).toBeNull();
      expect(result.changed).toBe(true);
      expect(db.lesson_progress.length).toBe(2);
      expect(db.lesson_progress[1]?.lesson_id).toBe("l-2");
    });

    it("returns error on insert duplicate key", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "lesson_progress",
        {
          kind: "insert",
          values: { user_id: "u-1", lesson_id: "l-1", completed: true },
        },
        []
      );

      expect(result.error).toEqual({
        message: 'duplicate key value violates unique constraint "lesson_progress_user_id_lesson_id_key"',
        code: "23505",
      });
      expect(result.changed).toBe(false);
    });

    it("upserts / updates existing lesson progress", () => {
      const db = createTestDb();
      const result = applyMutation(
        db,
        "lesson_progress",
        {
          kind: "upsert",
          values: { user_id: "u-1", lesson_id: "l-1", time_spent_seconds: 300 },
        },
        []
      );

      expect(result.error).toBeNull();
      expect(result.changed).toBe(true);
      expect(db.lesson_progress.length).toBe(1);
      expect(db.lesson_progress[0]?.time_spent_seconds).toBe(300);
      expect(db.lesson_progress[0]?.id).toBe("lp-1");
    });
  });
});

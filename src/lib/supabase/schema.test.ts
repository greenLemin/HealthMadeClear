import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LESSON_PROGRESS_ON_CONFLICT, QUIZ_ATTEMPTS_ON_CONFLICT } from "./schema";

const repoRoot = join(import.meta.dirname, "../../..");

function readRepo(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

describe("supabase schema conflict targets", () => {
  it("exports PostgREST onConflict strings that match unique keys", () => {
    expect(QUIZ_ATTEMPTS_ON_CONFLICT).toBe("user_id,quiz_id");
    expect(LESSON_PROGRESS_ON_CONFLICT).toBe("user_id,lesson_id");
  });
});

describe("launch apply runbook pins (P1-1 / 014 / 015)", () => {
  it("014 revokes delete_user EXECUTE from anon and documents 001–008 history-match", () => {
    const sql = readRepo("supabase/migrations/014_launch_reconcile.sql");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.delete_user() FROM PUBLIC;");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.delete_user() FROM anon, authenticated;");
    expect(sql).toMatch(/History-match local files 001–008 AND 009–013/);
  });

  it("015 backup table immediately revokes Data API grants and enables RLS", () => {
    const sql = readRepo("supabase/migrations/015_quiz_attempts_best_score.sql");
    expect(sql).toContain("CREATE TABLE quiz_attempts_backup_20260827 AS SELECT * FROM quiz_attempts;");
    expect(sql).toContain("REVOKE ALL ON TABLE quiz_attempts_backup_20260827 FROM PUBLIC;");
    expect(sql).toContain("REVOKE ALL ON TABLE quiz_attempts_backup_20260827 FROM anon, authenticated;");
    expect(sql).toContain("ALTER TABLE quiz_attempts_backup_20260827 ENABLE ROW LEVEL SECURITY;");
  });

  it("repair runbook lists CLI versions 001–013 and live timestamp rows, and is not a forward migration", () => {
    const sql = readRepo("supabase/repair/history-match-001-013.sql");
    expect(sql).toContain("Never copy this file into supabase/migrations/");
    expect(sql).toContain("20260612202742  001_profiles");
    expect(sql).toContain("20260612202824  008_contact_submissions");
    expect(sql).toContain("20260825133455  create_test_file");
    for (const version of [
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
      "009",
      "010",
      "011",
      "012",
      "013",
    ]) {
      expect(sql).toContain(`('${version}',`);
    }
    expect(sql).not.toContain("('014'");
    expect(sql).not.toContain("('015'");
  });
});

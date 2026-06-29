// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { getMockSupabaseClient } from "./mockClient";

describe("mockClient", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "hmc_mock_db=;path=/;max-age=0";
    }
  });

  it("starts signed out and supports explicit sign-in and sign-out", async () => {
    const client = getMockSupabaseClient();

    expect((await client.auth.getUser()).data.user).toBeNull();
    expect((await client.auth.getSession()).data.session).toBeNull();

    const badLogin = await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "wrong-password",
    });
    expect(badLogin.error?.message).toMatch(/invalid login credentials/i);

    const signInRes = await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "password123",
    });
    expect(signInRes.error).toBeNull();
    expect(signInRes.data.user?.email).toBe("guest@example.com");
    expect(signInRes.data.session?.access_token).toMatch(/^mock-access-token-/);
    expect((await client.auth.getUser()).data.user?.email).toBe("guest@example.com");

    const signOutRes = await client.auth.signOut();
    expect(signOutRes.error).toBeNull();
    expect((await client.auth.getSession()).data.session).toBeNull();
  });

  it("emits auth state changes for explicit auth actions", async () => {
    const client = getMockSupabaseClient();
    const events: AuthChangeEvent[] = [];
    const sessions: Array<string | null> = [];

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      events.push(event);
      sessions.push(session?.access_token ?? null);
    });

    await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "password123",
    });
    await client.auth.signOut();

    expect(events).toEqual(["SIGNED_IN", "SIGNED_OUT"]);
    expect(sessions[0]).toMatch(/^mock-access-token-/);
    expect(sessions[1]).toBeNull();
    expect(typeof subscription.unsubscribe).toBe("function");

    subscription.unsubscribe();
  });

  it("supports signup, reset-password exchange, and profile updates", async () => {
    const client = getMockSupabaseClient();

    const signUpRes = await client.auth.signUp({
      email: "casey@example.com",
      password: "password1234",
      options: {
        data: { display_name: "Casey" },
      },
    });
    expect(signUpRes.error).toBeNull();
    expect(signUpRes.data.user?.email).toBe("casey@example.com");
    expect((await client.auth.getSession()).data.session).toBeNull();

    const resetRes = await client.auth.resetPasswordForEmail("casey@example.com");
    expect(resetRes.error).toBeNull();

    const exchangeRes = await client.auth.exchangeCodeForSession("mock-reset");
    expect(exchangeRes.error).toBeNull();
    expect(exchangeRes.data.user?.email).toBe("casey@example.com");

    const updateRes = await client.auth.updateUser({
      password: "new-password-123",
      data: { display_name: "Casey Ray" },
    });
    expect(updateRes.error).toBeNull();
    expect(updateRes.data.user?.user_metadata.display_name).toBe("Casey Ray");

    await client.auth.signOut();
    const reSignInRes = await client.auth.signInWithPassword({
      email: "casey@example.com",
      password: "new-password-123",
    });
    expect(reSignInRes.error).toBeNull();
    expect(reSignInRes.data.user?.user_metadata.display_name).toBe("Casey Ray");
  });

  it("supports basic query building methods", async () => {
    const client = getMockSupabaseClient();
    const query = client
      .from("some_table")
      .select("*")
      .eq("id", 1)
      .gte("value", 10)
      .order("name")
      .limit(5)
      .range(0, 10)
      .not("name", "eq", "test")
      .is("active", true)
      .in("category", ["a", "b"]);

    expect(query).toBeDefined();
  });

  it("supports dashboard-oriented table mutations and queries via document cookies", async () => {
    const client = getMockSupabaseClient();
    await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "password123",
    });

    await client.from("lesson_progress").upsert({ lesson_id: "lesson-1" });
    await client.from("lesson_progress").insert([{ lesson_id: "lesson-2" }]);

    const lessonsRes = await client.from("lesson_progress").select("lesson_id").eq("completed", true);
    expect(lessonsRes.data).toContainEqual({ lesson_id: "lesson-1" });
    expect(lessonsRes.data).toContainEqual({ lesson_id: "lesson-2" });

    await client.from("quiz_attempts").upsert({ quiz_id: "quiz-1", score: 80, max_score: 100, passed: true });
    const quizRes = await client.from("quiz_attempts").select("quiz_id, score");
    expect(quizRes.data).toContainEqual({ quiz_id: "quiz-1", score: 80 });

    const streakRes = await client
      .from("streaks")
      .upsert({ current_streak: 5, longest_streak: 10 })
      .select("current_streak, longest_streak")
      .single();
    expect(streakRes.data).toEqual({ current_streak: 5, longest_streak: 10 });

    await client
      .from("profiles")
      .update({ display_name: "Test User" })
      .eq("id", "00000000-0000-0000-0000-000000000000");
    const profileRes = await client.from("profiles").select("display_name").single();
    expect(profileRes.data).toEqual({ display_name: "Test User" });

    await client.from("daily_log").upsert({ activity_date: "2026-06-28" });
    const dailyLogRes = await client
      .from("daily_log")
      .select("activity_date")
      .gte("activity_date", "2026-06-01");
    expect(dailyLogRes.data).toContainEqual({ activity_date: "2026-06-28" });

    await client.from("notifications").insert([
      { type: "achievement", title: "Nice work", body: "You finished a lesson", read: false },
      { type: "streak", title: "Keep going", body: "Two days in a row", read: false },
    ]);
    const unreadRes = await client
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false);
    expect(unreadRes.count).toBe(2);

    const notificationsRes = await client
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    const firstNotification = notificationsRes.data?.[0] as { id: string } | undefined;
    expect(firstNotification?.id).toBeTruthy();

    await client
      .from("notifications")
      .update({ read: true })
      .eq("id", firstNotification?.id)
      .eq("read", false);
    const afterReadRes = await client
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false);
    expect(afterReadRes.count).toBe(1);
  });

  it("supports reading and writing via a cookieStore mock", async () => {
    const store = new Map<string, any>();
    const mockCookieStore = {
      get(name: string) {
        return store.get(name);
      },
      set(name: string, value: string, options?: any) {
        store.set(name, { name, value, options });
      },
    };

    const client = getMockSupabaseClient(mockCookieStore);

    await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "password123",
    });
    await client.from("lesson_progress").upsert({ lesson_id: "lesson-store" });

    const lessonsRes = await client.from("lesson_progress").select("lesson_id");
    expect(lessonsRes.data).toContainEqual({ lesson_id: "lesson-store" });
    expect(store.get("hmc_mock_db")?.options?.path).toBe("/");
  });

  it("robustly handles malformed cookies and concatenated JSON values", async () => {
    const store1 = new Map<string, any>();
    store1.set("hmc_mock_db", { value: '{"lessons":["concatenated-1"]}{"lessons":["concatenated-2"]}' });

    const mockCookieStore1 = {
      get(name: string) {
        return store1.get(name);
      },
      set() {},
    };

    const client1 = getMockSupabaseClient(mockCookieStore1);
    const lessonsRes1 = await client1.from("lesson_progress").select("lesson_id");
    expect(lessonsRes1.data).toContainEqual({ lesson_id: "concatenated-1" });

    const store2 = new Map<string, any>();
    store2.set("hmc_mock_db", { value: "{invalid}" });

    const mockCookieStore2 = {
      get(name: string) {
        return store2.get(name);
      },
      set() {},
    };

    const client2 = getMockSupabaseClient(mockCookieStore2);
    const lessonsRes2 = await client2.from("lesson_progress").select("lesson_id");
    expect(lessonsRes2.data).toEqual([]);
  });

  it("fills missing legacy fields when a cookie only stores a partial shape", async () => {
    const store = new Map<string, any>();
    store.set("hmc_mock_db", {
      value: '{"lessons":["lesson-a"],"profile":{"display_name":"Legacy"}}',
    });

    const mockCookieStore = {
      get(name: string) {
        return store.get(name);
      },
      set() {},
    };

    const client = getMockSupabaseClient(mockCookieStore);

    const lessonsRes = await client.from("lesson_progress").select("lesson_id");
    expect(lessonsRes.data).toContainEqual({ lesson_id: "lesson-a" });

    const profileRes = await client.from("profiles").select("display_name").single();
    expect(profileRes.data).toEqual({ display_name: "Legacy" });

    const quizRes = await client.from("quiz_attempts").select("*");
    expect(quizRes.data).toEqual([]);

    const achievementsRes = await client.from("achievements").select("*");
    expect(achievementsRes.data).toEqual([]);
  });
});

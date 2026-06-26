// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { getMockSupabaseClient } from "./mockClient";

describe("mockClient", () => {
  beforeEach(() => {
    // Clear cookies
    if (typeof document !== "undefined") {
      document.cookie = "hmc_mock_db=;path=/;max-age=0";
    }
  });

  it("provides mock authentication info", async () => {
    const client = getMockSupabaseClient();
    const userRes = await client.auth.getUser();
    expect(userRes.data.user?.email).toBe("guest@example.com");

    const sessionRes = await client.auth.getSession();
    expect(sessionRes.data.session?.access_token).toBe("mock-access-token");

    const signInRes = await client.auth.signInWithPassword({
      email: "guest@example.com",
      password: "password",
    });
    expect(signInRes.data.user?.email).toBe("guest@example.com");

    const signOutRes = await client.auth.signOut();
    expect(signOutRes.error).toBeNull();
  });

  it("handles auth state change registration", async () => {
    const client = getMockSupabaseClient();
    let fired = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      fired = true;
      expect(event).toBe("SIGNED_IN");
      expect(session?.access_token).toBe("mock-access-token");
    });

    // Wait for the timeout callback
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(fired).toBe(true);
    expect(typeof subscription.unsubscribe).toBe("function");
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
      .is("active", true);

    expect(query).toBeDefined();
  });

  it("supports upsert, insert, and query operations on mock database via document cookies", async () => {
    const client = getMockSupabaseClient();

    // 1. Insert lesson progress
    await client.from("lesson_progress").upsert({ lesson_id: "lesson-1" });
    await client.from("lesson_progress").insert([{ lesson_id: "lesson-2" }]);

    // Query back lesson progress
    const lessonsRes = await client.from("lesson_progress").select();
    expect(lessonsRes.data).toContainEqual(expect.objectContaining({ lesson_id: "lesson-1" }));
    expect(lessonsRes.data).toContainEqual(expect.objectContaining({ lesson_id: "lesson-2" }));

    // 2. Insert quiz attempt
    await client.from("quiz_attempts").upsert({ quiz_id: "quiz-1", score: 80, max_score: 100, passed: true });
    const quizRes = await client.from("quiz_attempts").select();
    expect(quizRes.data).toContainEqual(expect.objectContaining({ quiz_id: "quiz-1", score: 80 }));

    // 3. Upsert streak
    await client.from("streaks").upsert({ current_streak: 5, longest_streak: 10 });
    const streakRes = await client.from("streaks").select().single();
    expect(streakRes.data).toEqual({ current_streak: 5, longest_streak: 10 });

    // 4. Update profile
    await client.from("profiles").update({ display_name: "Test User" });
    const profileRes = await client.from("profiles").select().single();
    expect(profileRes.data?.[0]?.display_name || profileRes.data?.display_name).toBe("Test User");

    // Generic single fallback
    const fallbackRes = await client.from("other_table").select().single();
    expect(fallbackRes.data).toBeNull();
  });

  it("supports reading/writing via cookieStore mock", async () => {
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

    await client.from("lesson_progress").upsert({ lesson_id: "lesson-store" });
    const lessonsRes = await client.from("lesson_progress").select();
    expect(lessonsRes.data).toContainEqual(expect.objectContaining({ lesson_id: "lesson-store" }));
  });

  it("robustly handles malformed cookies and concatenated JSON values", async () => {
    // 1. Test concatenated JSON cookie via mock cookieStore
    const store1 = new Map<string, any>();
    store1.set("hmc_mock_db", { value: '{"lessons":["concatenated-1"]}{"lessons":["concatenated-2"]}' });

    const mockCookieStore1 = {
      get(name: string) {
        return store1.get(name);
      },
      set() {}, // dummy for CookieStore interface
    };

    const client1 = getMockSupabaseClient(mockCookieStore1);
    const lessonsRes1 = await client1.from("lesson_progress").select();
    expect(lessonsRes1.data).toContainEqual(expect.objectContaining({ lesson_id: "concatenated-1" }));

    // 2. Test totally invalid JSON cookie via mock cookieStore
    const store2 = new Map<string, any>();
    store2.set("hmc_mock_db", { value: "{invalid}" });

    const mockCookieStore2 = {
      get(name: string) {
        return store2.get(name);
      },
      set() {}, // dummy for CookieStore interface
    };

    const client2 = getMockSupabaseClient(mockCookieStore2);
    const lessonsRes2 = await client2.from("lesson_progress").select();
    expect(lessonsRes2.data).toEqual([]);
  });
});

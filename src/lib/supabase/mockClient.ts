// Mock database type
type MockDb = {
  lessons: string[];
  quizzes: Array<{
    quiz_id: string;
    score: number;
    max_score: number;
    passed: boolean;
    attempted_at: string;
  }>;
  streak: { current_streak: number; longest_streak: number };
  achievements: string[];
  profile: { display_name: string; created_at: string };
};

const DEFAULT_DB: MockDb = {
  lessons: [],
  quizzes: [],
  streak: { current_streak: 1, longest_streak: 1 },
  achievements: [],
  profile: { display_name: "Guest Student", created_at: new Date().toISOString() },
};

function getMockDb(cookieStore?: any): MockDb {
  let json: string | null = null;
  if (cookieStore) {
    json = cookieStore.get("hmc_mock_db")?.value || null;
  } else if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )hmc_mock_db=([^;]*)/);
    json = match ? decodeURIComponent(match[1]) : null;
  }

  if (!json) return DEFAULT_DB;
  try {
    return JSON.parse(json);
  } catch {
    return DEFAULT_DB;
  }
}

function saveMockDb(db: MockDb, cookieStore?: any) {
  const json = JSON.stringify(db);
  if (cookieStore) {
    cookieStore.set("hmc_mock_db", json, { path: "/" });
  } else if (typeof document !== "undefined") {
    document.cookie = `hmc_mock_db=${encodeURIComponent(json)};path=/;max-age=31536000;SameSite=Lax`;
  }
}

export function getMockSupabaseClient(cookieStore?: any) {
  const mockUser = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "guest@example.com",
    user_metadata: { display_name: "Guest Student" },
    aud: "authenticated",
    role: "authenticated",
  };

  const mockSession = {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: mockUser,
  };

  return {
    supabaseUrl: "https://placeholder.supabase.co",
    auth: {
      async getUser() {
        return {
          data: {
            user: mockUser,
          },
          error: null,
        };
      },
      async getSession() {
        return {
          data: {
            session: mockSession,
          },
          error: null,
        };
      },
      onAuthStateChange(callback: any) {
        if (typeof callback === "function") {
          setTimeout(() => {
            try {
              callback("SIGNED_IN", mockSession);
            } catch {}
          }, 0);
        }
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      async signInWithPassword() {
        return { data: { user: mockUser }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
    from(table: string) {
      return {
        select(columns?: string, options?: any) {
          return this;
        },
        eq(column: string, value: any) {
          return this;
        },
        gte(column: string, value: any) {
          return this;
        },
        order(column: string, options?: any) {
          return this;
        },
        limit(count: number) {
          return this;
        },
        range(from: number, to: number) {
          return this;
        },
        not(column: string, operator: string, value: any) {
          return this;
        },
        is(column: string, value: any) {
          return this;
        },
        upsert(values: any, options?: any) {
          const db = getMockDb(cookieStore);
          if (table === "lesson_progress") {
            const lessonId = values.lesson_id;
            if (lessonId && !db.lessons.includes(lessonId)) {
              db.lessons.push(lessonId);
              saveMockDb(db, cookieStore);
            }
          } else if (table === "quiz_attempts") {
            const quizId = values.quiz_id;
            if (quizId) {
              db.quizzes = db.quizzes.filter((q) => q.quiz_id !== quizId);
              db.quizzes.push({
                quiz_id: quizId,
                score: values.score,
                max_score: values.max_score,
                passed: values.passed,
                attempted_at: new Date().toISOString(),
              });
              saveMockDb(db, cookieStore);
            }
          } else if (table === "streaks") {
            db.streak = {
              current_streak: values.current_streak,
              longest_streak: values.longest_streak,
            };
            saveMockDb(db, cookieStore);
          }
          return this;
        },
        insert(values: any, options?: any) {
          const valArray = Array.isArray(values) ? values : [values];
          for (const val of valArray) {
            this.upsert(val, options);
          }
          return this;
        },
        update(values: any, options?: any) {
          const db = getMockDb(cookieStore);
          if (table === "profiles") {
            db.profile = {
              ...db.profile,
              display_name: values.display_name ?? db.profile.display_name,
            };
            saveMockDb(db, cookieStore);
          }
          return this;
        },
        delete(options?: any) {
          return this;
        },
        single() {
          const db = getMockDb(cookieStore);
          if (table === "streaks") {
            return Promise.resolve({ data: db.streak, error: null });
          }
          if (table === "profiles") {
            return Promise.resolve({ data: db.profile, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        async then(onfulfilled?: any, onrejected?: any) {
          const db = getMockDb(cookieStore);
          let data: any = [];
          if (table === "lesson_progress") {
            data = db.lessons.map((id) => ({
              lesson_id: id,
              completed: true,
              completed_at: new Date().toISOString(),
              time_spent_seconds: 60,
            }));
          } else if (table === "quiz_attempts") {
            data = db.quizzes.map((q) => ({
              quiz_id: q.quiz_id,
              score: q.score,
              max_score: q.max_score,
              passed: q.passed,
              attempted_at: q.attempted_at,
            }));
          } else if (table === "achievements") {
            data = db.achievements.map((id) => ({
              achievement_id: id,
              earned_at: new Date().toISOString(),
            }));
          }
          return Promise.resolve({ data, error: null, count: data.length }).then(onfulfilled, onrejected);
        },
      };
    },
  } as any;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  answers: unknown | null;
  attempted_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  activity_date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<LessonProgress, "id" | "user_id">>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, "id" | "attempted_at">;
        Update: Partial<Omit<QuizAttempt, "id" | "user_id">>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, "id" | "earned_at">;
        Update: Partial<Omit<Achievement, "id" | "user_id">>;
      };
      streaks: {
        Row: Streak;
        Insert: Omit<Streak, "updated_at">;
        Update: Partial<Omit<Streak, "user_id">>;
      };
      daily_log: {
        Row: DailyLog;
        Insert: Omit<DailyLog, "id" | "created_at">;
        Update: Partial<Omit<DailyLog, "id" | "user_id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "user_id">>;
      };
    };
  };
}

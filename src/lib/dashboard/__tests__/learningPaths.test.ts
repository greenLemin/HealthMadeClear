import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserLearningPaths } from "../learningPaths";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { logQueryError } from "../utils";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/paths/loadPaths", () => ({
  getAllLearningPaths: vi.fn(),
}));

vi.mock("@/lib/lessons/loadLessons", () => ({
  getAllLessons: vi.fn(),
}));

vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

describe("getUserLearningPaths", () => {
  let mockSupabase: any;
  let mockSelect: any;
  let mockEq: any;
  let mockEq2: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEq2 = vi.fn().mockResolvedValue({
      data: [{ lesson_id: "lesson-1" }],
      error: null,
    });
    mockEq = vi.fn().mockReturnValue({ eq: mockEq2 });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    };

    vi.mocked(getAllLearningPaths).mockReturnValue([
      {
        id: "path-1",
        title: "Path 1",
        description: "Desc 1",
        lessons: ["lesson-1", "lesson-2"],
      } as any,
    ]);

    vi.mocked(getAllLessons).mockReturnValue([
      {
        id: "lesson-1",
        title: "Lesson 1",
        duration: "5m",
      } as any,
      {
        id: "lesson-2",
        title: "Lesson 2",
        duration: "10m",
      } as any,
    ]);
  });

  it("successfully fetches and maps learning paths", async () => {
    const paths = await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1");

    expect(mockSupabase.from).toHaveBeenCalledWith("lesson_progress");
    expect(mockSelect).toHaveBeenCalledWith("lesson_id");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user1");
    expect(mockEq2).toHaveBeenCalledWith("completed", true);

    expect(paths).toHaveLength(1);

    expect(paths[0]).toEqual({
      path: {
        id: "path-1",
        title: "Path 1",
        description: "Desc 1",
        lessons: ["lesson-1", "lesson-2"],
      },
      completedLessonIds: ["lesson-1"],
      nextLesson: {
        id: "lesson-2",
        title: "Lesson 2",
        duration: "10m",
      },
      progressPercentage: 50,
      isComplete: false,
    });

    expect(logQueryError).toHaveBeenCalledWith("getUserLearningPaths", null);
  });

  it("handles null data and logs errors", async () => {
    const errorObj = new Error("DB Error");
    mockEq2.mockResolvedValueOnce({
      data: null,
      error: errorObj,
    });

    const paths = await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1");

    expect(logQueryError).toHaveBeenCalledWith("getUserLearningPaths", errorObj);

    expect(paths).toHaveLength(1);
    expect(paths[0].completedLessonIds).toEqual([]);
    expect(paths[0].progressPercentage).toBe(0);
    expect(paths[0].isComplete).toBe(false);
    expect(paths[0].nextLesson).toEqual({
      id: "lesson-1",
      title: "Lesson 1",
      duration: "5m",
    });
  });

  it("handles completed paths correctly", async () => {
    mockEq2.mockResolvedValueOnce({
      data: [{ lesson_id: "lesson-1" }, { lesson_id: "lesson-2" }],
      error: null,
    });

    const paths = await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1");

    expect(paths).toHaveLength(1);
    expect(paths[0].completedLessonIds).toEqual(["lesson-1", "lesson-2"]);
    expect(paths[0].progressPercentage).toBe(100);
    expect(paths[0].isComplete).toBe(true);
    expect(paths[0].nextLesson).toBeNull();
  });

  it("handles empty paths correctly", async () => {
    vi.mocked(getAllLearningPaths).mockReturnValue([
      {
        id: "path-2",
        title: "Path 2",
        description: "Desc 2",
        lessons: [],
      } as any,
    ]);

    const paths = await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1");

    expect(paths).toHaveLength(1);
    expect(paths[0].completedLessonIds).toEqual([]);
    expect(paths[0].progressPercentage).toBe(0);
    expect(paths[0].isComplete).toBe(false);
    expect(paths[0].nextLesson).toBeNull();
  });

  it("handles missing lesson details correctly", async () => {
    vi.mocked(getAllLessons).mockReturnValue([]); // No lesson details found

    const paths = await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1");

    expect(paths).toHaveLength(1);
    expect(paths[0].nextLesson).toEqual({
      id: "lesson-2", // lesson-1 is completed in beforeEach setup
      title: "",
      duration: "",
    });
  });

  it("uses the provided locale", async () => {
    await getUserLearningPaths(mockSupabase as unknown as SupabaseClient, "user1", "es");

    expect(getAllLearningPaths).toHaveBeenCalledWith("es");
    expect(getAllLessons).toHaveBeenCalledWith("es");
  });
});

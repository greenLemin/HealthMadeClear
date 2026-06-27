import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createNotifications,
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "./notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockQueryBuilder(mockData: any[] | null = [], mockCount: number | null = 0) {
  const queryBuilder: any = {
    insert: vi.fn(() => queryBuilder),
    update: vi.fn(() => queryBuilder),
    select: vi.fn(() => queryBuilder),
    eq: vi.fn(() => queryBuilder),
    is: vi.fn(() => queryBuilder),
    order: vi.fn(() => queryBuilder),
    limit: vi.fn(() => queryBuilder),
    then: vi.fn((resolve) => {
      resolve({ data: mockData, count: mockCount, error: null });
    }),
  };
  return queryBuilder;
}

describe("notifications", () => {
  let mockSupabase: SupabaseClient<any, "public", any>;
  let mockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

  beforeEach(() => {
    mockQueryBuilder = createMockQueryBuilder();
    mockSupabase = {
      from: vi.fn(() => mockQueryBuilder),
    } as unknown as SupabaseClient<any, "public", any>;
  });

  describe("createNotifications", () => {
    it("should return early if inputs are empty", async () => {
      await createNotifications(mockSupabase, "user-1", []);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should map inputs to records and insert them", async () => {
      const inputs = [
        { type: "alert", title: "Test 1", body: "Body 1" },
        { type: "info", title: "Test 2", body: "Body 2" },
      ];
      await createNotifications(mockSupabase, "user-1", inputs);

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        { user_id: "user-1", type: "alert", title: "Test 1", body: "Body 1", read: false },
        { user_id: "user-1", type: "info", title: "Test 2", body: "Body 2", read: false },
      ]);
    });
  });

  describe("createNotification", () => {
    it("should insert a single notification record", async () => {
      const input = { type: "alert", title: "Test 1", body: "Body 1" };
      await createNotification(mockSupabase, "user-1", input);

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        user_id: "user-1",
        type: "alert",
        title: "Test 1",
        body: "Body 1",
        read: false,
      });
    });
  });

  describe("getNotifications", () => {
    it("should fetch notifications for a user with default limit", async () => {
      const mockData = [{ id: "1", title: "Test" }];
      mockQueryBuilder = createMockQueryBuilder(mockData);
      mockSupabase = { from: vi.fn(() => mockQueryBuilder) } as unknown as SupabaseClient<any, "public", any>;

      const result = await getNotifications(mockSupabase, "user-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockData);
    });

    it("should fetch notifications for a user with custom limit", async () => {
      await getNotifications(mockSupabase, "user-1", 5);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it("should return empty array when data is null", async () => {
      mockQueryBuilder = createMockQueryBuilder(null);
      mockSupabase = { from: vi.fn(() => mockQueryBuilder) } as unknown as SupabaseClient<any, "public", any>;
      const result = await getNotifications(mockSupabase, "user-1");
      expect(result).toEqual([]);
    });
  });

  describe("markAsRead", () => {
    it("should update a specific notification as read", async () => {
      await markAsRead(mockSupabase, "user-1", "notif-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ read: true });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", "notif-1");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
    });
  });

  describe("markAllAsRead", () => {
    it("should update all unread notifications for a user", async () => {
      await markAllAsRead(mockSupabase, "user-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ read: true });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockQueryBuilder.is).toHaveBeenCalledWith("read", false);
    });
  });

  describe("getUnreadCount", () => {
    it("should get count of unread notifications", async () => {
      mockQueryBuilder = createMockQueryBuilder([], 5);
      mockSupabase = { from: vi.fn(() => mockQueryBuilder) } as unknown as SupabaseClient<any, "public", any>;

      const count = await getUnreadCount(mockSupabase, "user-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("read", false);
      expect(count).toBe(5);
    });

    it("should return 0 when count is null", async () => {
      mockQueryBuilder = createMockQueryBuilder([], null);
      mockSupabase = { from: vi.fn(() => mockQueryBuilder) } as unknown as SupabaseClient<any, "public", any>;

      const count = await getUnreadCount(mockSupabase, "user-1");
      expect(count).toBe(0);
    });
  });
});

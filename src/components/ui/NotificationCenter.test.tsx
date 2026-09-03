// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/components/AppProviders";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications";
import type { Notification } from "@/types/database";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

vi.mock("@/lib/notifications", () => ({
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock("@/hooks/useFocusTrap", () => ({
  useFocusTrap: vi.fn(),
}));

vi.mock("@/hooks/useDismissibleOverlay", () => ({
  useDismissibleOverlay: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string, options?: Record<string, any>) => {
    if (options && "count" in options) {
      return `${namespace}.${key}:${options.count}`;
    }
    return `${namespace}.${key}`;
  },
}));

describe("NotificationCenter", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(useAppState).mockReturnValue({
      locale: "en",
    } as any);

    vi.mocked(getNotifications).mockResolvedValue([]);
    vi.mocked(getUnreadCount).mockResolvedValue(0);
    vi.mocked(markAsRead).mockResolvedValue();
    vi.mocked(markAllAsRead).mockResolvedValue();
  });

  it("renders null when user is not logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);

    const { container } = render(<NotificationCenter />);
    expect(container.firstChild).toBeNull();
  });

  it("fetches notifications and unread count on mount and renders trigger button", async () => {
    vi.mocked(getUnreadCount).mockResolvedValue(3);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalledWith(expect.anything(), "user-123", 10);
      expect(getUnreadCount).toHaveBeenCalledWith(expect.anything(), "user-123");
    });

    const triggerButton = screen.getByRole("button", { name: "notifications.ariaLabel:3" });
    expect(triggerButton).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays 99+ when unread count exceeds 99", async () => {
    vi.mocked(getUnreadCount).mockResolvedValue(105);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByText("99+")).toBeInTheDocument();
    });
  });

  it("toggles notification panel open and closed", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    const triggerButton = screen.getByRole("button", { name: "notifications.ariaLabel:0" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Open panel
    fireEvent.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("notifications.title")).toBeInTheDocument();

    // Close panel with dismiss button
    const closeButton = screen.getByRole("button", { name: "common.dismiss" });
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows empty state when no notifications exist", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:0" }));

    expect(screen.getByText(/notifications.empty/i)).toBeInTheDocument();
  });

  it("renders notification items with appropriate icons and timestamps", async () => {
    const now = new Date();
    const mockNotifs: Notification[] = [
      {
        id: "n1",
        user_id: "user-123",
        type: "achievement",
        title: "Achievement Unlocked",
        body: "You earned a badge!",
        read: false,
        created_at: new Date(now.getTime() - 1000 * 30).toISOString(), // 30s ago
      },
      {
        id: "n2",
        user_id: "user-123",
        type: "streak",
        title: "Streak Alert",
        body: "5 days in a row!",
        read: true,
        created_at: new Date(now.getTime() - 1000 * 60 * 10).toISOString(), // 10 mins ago
      },
      {
        id: "n3",
        user_id: "user-123",
        type: "close-to-completion",
        title: "Almost Done",
        body: "1 lesson left!",
        read: true,
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      },
      {
        id: "n4",
        user_id: "user-123",
        type: "default",
        title: "General News",
        body: "Welcome to the app",
        read: true,
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(), // 1 day ago (Yesterday)
      },
      {
        id: "n5",
        user_id: "user-123",
        type: "other",
        title: "Days Ago News",
        body: "Check this out",
        read: true,
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      },
      {
        id: "n6",
        user_id: "user-123",
        type: "other",
        title: "Old News",
        body: "Long ago",
        read: true,
        created_at: "2023-01-01T10:00:00.000Z", // Older than 7 days
      },
    ];

    vi.mocked(getNotifications).mockResolvedValue(mockNotifs);
    vi.mocked(getUnreadCount).mockResolvedValue(1);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:1" }));

    expect(screen.getByText("Achievement Unlocked")).toBeInTheDocument();
    expect(screen.getByText("You earned a badge!")).toBeInTheDocument();

    expect(screen.getByText("common.relativeJustNow")).toBeInTheDocument();
    expect(screen.getByText("common.relativeMinutes:10")).toBeInTheDocument();
    expect(screen.getByText("common.relativeHours:3")).toBeInTheDocument();
    expect(screen.getByText("common.relativeYesterday")).toBeInTheDocument();
    expect(screen.getByText("common.relativeDays:3")).toBeInTheDocument();
  });

  it("handles es locale date formatting for older notifications", async () => {
    vi.mocked(useAppState).mockReturnValue({
      locale: "es",
    } as any);

    const mockNotifs: Notification[] = [
      {
        id: "n1",
        user_id: "user-123",
        type: "default",
        title: "Old News",
        body: "Long ago",
        read: true,
        created_at: "2023-01-01T10:00:00.000Z",
      },
    ];

    vi.mocked(getNotifications).mockResolvedValue(mockNotifs);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:0" }));

    expect(screen.getByText("Old News")).toBeInTheDocument();
  });

  it("marks notification as read when clicked", async () => {
    const unreadNotif: Notification = {
      id: "n1",
      user_id: "user-123",
      type: "achievement",
      title: "Unread Achievement",
      body: "Click me",
      read: false,
      created_at: new Date().toISOString(),
    };

    vi.mocked(getNotifications).mockResolvedValue([unreadNotif]);
    vi.mocked(getUnreadCount).mockResolvedValue(1);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:1" }));

    const notifButton = screen.getByText("Unread Achievement").closest("button");
    expect(notifButton).not.toBeNull();

    fireEvent.click(notifButton!);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith(expect.anything(), "user-123", "n1");
    });
  });

  it("does not call markAsRead when clicking an already read notification", async () => {
    const readNotif: Notification = {
      id: "n1",
      user_id: "user-123",
      type: "achievement",
      title: "Read Achievement",
      body: "Already read",
      read: true,
      created_at: new Date().toISOString(),
    };

    vi.mocked(getNotifications).mockResolvedValue([readNotif]);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:0" }));

    const notifButton = screen.getByText("Read Achievement").closest("button");
    fireEvent.click(notifButton!);

    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("marks all notifications as read when clicking mark all read", async () => {
    const mockNotifs: Notification[] = [
      {
        id: "n1",
        user_id: "user-123",
        type: "achievement",
        title: "Notif 1",
        body: "Body 1",
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "n2",
        user_id: "user-123",
        type: "streak",
        title: "Notif 2",
        body: "Body 2",
        read: false,
        created_at: new Date().toISOString(),
      },
    ];

    vi.mocked(getNotifications).mockResolvedValue(mockNotifs);
    vi.mocked(getUnreadCount).mockResolvedValue(2);

    render(<NotificationCenter />);

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "notifications.ariaLabel:2" }));

    const markAllReadBtn = screen.getByRole("button", { name: "notifications.markAllRead" });
    fireEvent.click(markAllReadBtn);

    await waitFor(() => {
      expect(markAllAsRead).toHaveBeenCalledWith(expect.anything(), "user-123");
    });
  });
});

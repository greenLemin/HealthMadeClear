// @vitest-environment jsdom
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import AuthProvider, { AuthContext } from "./AuthProvider";
import { useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

const mockPush = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

const TestConsumer = () => {
  const context = useContext(AuthContext);
  if (!context) return <div>No Context</div>;

  return (
    <div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <div data-testid="user">{context.user ? context.user.id : "null"}</div>
      <div data-testid="session">{context.session ? context.session.access_token : "null"}</div>
      <button onClick={context.signOut} data-testid="signout-btn">
        Sign Out
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    });
    mockSignOut.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with loading state and fetches session on mount", async () => {
    const mockUser = { id: "test-user-id" } as User;
    const mockSession = { access_token: "test-token", user: mockUser } as Session;
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(mockGetUser).toHaveBeenCalled();
    expect(mockOnAuthStateChange).toHaveBeenCalled();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("test-user-id");
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });

  it("updates state when onAuthStateChange triggers", async () => {
    let authChangeCallback: any;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      };
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const mockUser = { id: "new-user-id" } as User;
    const mockSession = { access_token: "new-token", user: mockUser } as Session;

    act(() => {
      authChangeCallback("SIGNED_IN", mockSession);
    });

    expect(screen.getByTestId("user")).toHaveTextContent("new-user-id");
    expect(screen.getByTestId("session")).toHaveTextContent("new-token");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("handles signOut which calls supabase auth sign out and routes to '/'", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const signOutBtn = screen.getByTestId("signout-btn");
    await act(async () => {
      fireEvent.click(signOutBtn);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("unsubscribes on component unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

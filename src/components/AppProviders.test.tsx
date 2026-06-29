// @vitest-environment jsdom
import { render, screen, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi } from "vitest";
import en from "@/messages/en.json";
import AppProviders, { useAppState } from "@/components/AppProviders";
import { STORAGE_KEYS } from "@/lib/preferences";

vi.mock("@/components/OnboardingDialog", () => ({
  default: () => null,
}));

function Consumer() {
  const { completedLessons, toggleLessonComplete } = useAppState();
  return (
    <div>
      <span data-testid="count">{completedLessons.size}</span>
      <button type="button" onClick={() => toggleLessonComplete("lesson-a")}>
        toggle
      </button>
    </div>
  );
}

describe("AppProviders", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates and persists completed lessons", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <Consumer />
        </AppProviders>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("count").textContent).toBe("0");

    await act(async () => {
      screen.getByRole("button", { name: "toggle" }).click();
    });

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.completedLessons) ?? "[]")).toContain(
      "lesson-a"
    );
  });
});

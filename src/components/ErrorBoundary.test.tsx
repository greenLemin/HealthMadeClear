// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ErrorBoundary from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("test crash");
}

function renderCrash(locale: "en" | "es", messages: typeof en | typeof es) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders catalog crash copy in English", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderCrash("en", en);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(en.errors.title);
    expect(screen.getByText(en.errors.crashBody)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.errors.tryAgain })).toBeInTheDocument();
  });

  it("renders catalog crash copy in Spanish", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderCrash("es", es);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(es.errors.title);
    expect(screen.getByText(es.errors.crashBody)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: es.errors.tryAgain })).toBeInTheDocument();
  });
});

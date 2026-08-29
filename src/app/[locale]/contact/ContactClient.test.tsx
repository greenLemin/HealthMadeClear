// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ContactClient from "./ContactClient";

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePathname: () => "/en/contact",
}));

function renderContact() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ContactClient />
    </NextIntlClientProvider>
  );
}

describe("ContactClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          setTimeout(() => {
            resolve(
              new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              })
            );
          }, 50);
        })
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("sends only one POST when submit fires twice before the first completes", () => {
    renderContact();
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/your email/i), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: "Hello there" } });

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    fireEvent.submit(form!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sizes the subject select for a 48px touch target on WebKit", () => {
    renderContact();
    const select = screen.getByLabelText(/subject/i);
    expect(select).toHaveClass("min-h-12");
    expect(select).toHaveClass("appearance-none");
  });
});

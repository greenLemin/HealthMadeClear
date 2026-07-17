// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import Alert, { AlertProps } from "./Alert";

const renderComponent = (props: Partial<AlertProps> & { children: React.ReactNode }) => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Alert {...props} />
    </NextIntlClientProvider>
  );
};

describe("Alert", () => {
  it("renders children correctly with default variant (info)", () => {
    renderComponent({ children: "This is an alert" });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveClass("bg-primary-fixed/30");
    expect(screen.getByText("This is an alert")).toBeInTheDocument();
  });

  it("renders with title", () => {
    renderComponent({ title: "Alert Title", children: "This is an alert" });

    expect(screen.getByText("Alert Title")).toBeInTheDocument();
  });

  it("renders success variant with correct classes", () => {
    renderComponent({ variant: "success", children: "Success alert" });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveClass("bg-secondary-container/60");
  });

  it("renders warning variant with correct classes", () => {
    renderComponent({ variant: "warning", children: "Warning alert" });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveClass("bg-tertiary-container/30");
  });

  it("renders error variant with correct classes", () => {
    renderComponent({ variant: "error", children: "Error alert" });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveClass("bg-error-container");
  });

  it("renders dismiss button and calls onDismiss when dismissible=true", async () => {
    const onDismissMock = vi.fn();
    const user = userEvent.setup();

    renderComponent({
      dismissible: true,
      onDismiss: onDismissMock,
      children: "Dismissible alert",
    });

    const dismissButton = screen.getByRole("button", { name: en.common.dismiss });
    expect(dismissButton).toBeInTheDocument();

    await user.click(dismissButton);
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it("does not render dismiss button if dismissible=false even with onDismiss provided", () => {
    const onDismissMock = vi.fn();

    renderComponent({
      dismissible: false,
      onDismiss: onDismissMock,
      children: "Not dismissible",
    });

    const dismissButton = screen.queryByRole("button", { name: en.common.dismiss });
    expect(dismissButton).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderComponent({ className: "custom-test-class", children: "Custom class alert" });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveClass("custom-test-class");
  });
});

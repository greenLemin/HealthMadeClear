// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import MedicalDisclaimer from "./MedicalDisclaimer";

const renderComponent = (props?: any) => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <MedicalDisclaimer {...props} />
    </NextIntlClientProvider>
  );
};

describe("MedicalDisclaimer", () => {
  it("renders educational disclaimer by default", () => {
    renderComponent();
    expect(screen.getByText(en.disclaimer.educational)).toBeInTheDocument();
  });

  it("renders inline variant", () => {
    renderComponent({ variant: "inline" });
    expect(screen.getByText(en.disclaimer.educational)).toBeInTheDocument();
  });

  it("renders emergency variant", () => {
    renderComponent({ variant: "emergency" });
    expect(screen.getByText(en.disclaimer.emergencyTitle)).toBeInTheDocument();
    expect(screen.getByText(en.disclaimer.emergencyBody)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.disclaimer.emergencyCallAria })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.disclaimer.emergencyCallAria })).toHaveAttribute(
      "href",
      "tel:911"
    );
  });

  it("applies className prop to inline variant", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <MedicalDisclaimer variant="inline" className="test-class" />
      </NextIntlClientProvider>
    );
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("applies className prop to emergency variant", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <MedicalDisclaimer variant="emergency" className="test-class" />
      </NextIntlClientProvider>
    );
    expect(container.firstChild).toHaveClass("test-class");
  });
});

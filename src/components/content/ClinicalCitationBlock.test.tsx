// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ClinicalCitationBlock from "./ClinicalCitationBlock";

function renderBlock(props: ComponentProps<typeof ClinicalCitationBlock>) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ClinicalCitationBlock {...props} />
    </NextIntlClientProvider>
  );
}

describe("ClinicalCitationBlock", () => {
  it("renders nothing when sources, reviewer, and date are empty", () => {
    const { container } = renderBlock({});
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a compact line with reviewer, date, and sources joined by slash", () => {
    renderBlock({
      compact: true,
      reviewedBy: "RN Health Education Team",
      lastReviewed: "June 1, 2026",
      sources: ["CDC", "FDA"],
    });
    const line = screen.getByText(/Reviewed by RN Health Education Team/);
    expect(line.tagName).toBe("P");
    expect(line).toHaveTextContent(
      "Reviewed by RN Health Education Team · June 1, 2026 · Sources: CDC / FDA"
    );
    expect(line).not.toHaveTextContent(/ongoing annual schedule/i);
  });

  it("omits empty compact parts", () => {
    renderBlock({ compact: true, sources: ["NIH MedlinePlus"] });
    expect(screen.getByText("Sources: NIH MedlinePlus")).toBeInTheDocument();
    expect(screen.queryByText(/Reviewed by/)).not.toBeInTheDocument();
  });

  it("renders a full sources list like lesson notes", () => {
    renderBlock({
      reviewedBy: "Health Education Review Team",
      lastReviewed: "June 11, 2026",
      sources: ["CDC", "NIH MedlinePlus"],
    });
    expect(screen.getByText("Reviewed by Health Education Review Team")).toBeInTheDocument();
    expect(screen.getByText("Last reviewed: June 11, 2026")).toBeInTheDocument();
    expect(screen.getByText("Sources")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["CDC", "NIH MedlinePlus"]);
    expect(screen.queryByText(/ongoing annual schedule/i)).not.toBeInTheDocument();
  });
});

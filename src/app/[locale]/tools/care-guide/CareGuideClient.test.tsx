// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import CareGuideClient from "./CareGuideClient";

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function renderCareGuide(locale: "en" | "es" = "en") {
  const messages = locale === "en" ? en : es;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CareGuideClient />
    </NextIntlClientProvider>
  );
}

describe("CareGuideClient", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the care-guide heading", () => {
    renderCareGuide();
    expect(screen.getByRole("heading", { level: 1, name: en.tools.careGuideTitle })).toBeInTheDocument();
  });

  it("renders the emergency alert banner without duplicated question prefix", () => {
    renderCareGuide();
    const bannerEn = screen.getByRole("alert");
    expect(bannerEn).toHaveTextContent(en.tools.emergencyShort);
    expect(bannerEn.textContent).not.toMatch(
      /Experiencing a medical emergency\?:\s*Experiencing a medical emergency\?/i
    );
    cleanup();
    renderCareGuide("es");
    const bannerEs = screen.getByRole("alert");
    expect(bannerEs).toHaveTextContent(es.tools.emergencyShort);
    expect(bannerEs.textContent).not.toMatch(
      /¿Tienes una emergencia médica\?:\s*¿Experimenta una emergencia médica\?/i
    );
  });

  it("does not keep leftover OTC-as-directive copy", () => {
    renderCareGuide();
    expect(
      screen.queryByText(/rest, fluids, and over-the-counter medicine for mild symptoms/i)
    ).not.toBeInTheDocument();
    expect(en.tools.homeCareBody).toMatch(/before taking an over-the-counter medicine/i);
    expect(es.tools.homeCareBody).not.toMatch(/Descanso, líquidos y medicinas de venta libre/);
    expect(es.tools.homeCareBody).toMatch(/medicamentos de venta libre/);
    expect(es.tools.homeCareBody).toMatch(/antes de tomar/i);
  });

  it("sore-throat copy names swallowing / drooling / breathing emergencies", () => {
    renderCareGuide();
    expect(en.tools.scenarioSoreThroatBody).toMatch(/drool|swallow|breath/i);
    expect(screen.getByText(en.tools.scenarioSoreThroatBody)).toBeInTheDocument();
    expect(es.tools.scenarioSoreThroatBody).toMatch(/tragar/);
    expect(es.tools.scenarioSoreThroatBody).toMatch(/babeo/);
    expect(es.tools.scenarioSoreThroatBody).toMatch(/abrir la boca/);
    expect(es.tools.scenarioSoreThroatBody).toMatch(/respirar/);
    expect(es.tools.scenarioSoreThroatBody).toMatch(/911/);
    expect(es.tools.scenarioSoreThroatBody).toMatch(/emergencias/);
  });

  it("chest-pain copy uses the positive-lead ACS warning signs", () => {
    renderCareGuide();
    expect(en.tools.scenarioChestPainBody).toMatch(/many different symptoms|jaw|neck|back|sweat|911/i);
    expect(en.tools.scenarioChestPainBody).toMatch(/jaw/i);
    expect(en.tools.scenarioChestPainBody).toMatch(/neck/i);
    expect(en.tools.scenarioChestPainBody).toMatch(/back/i);
    expect(en.tools.scenarioChestPainBody).toMatch(/sweat/i);
    expect(en.tools.scenarioChestPainBody).toMatch(/911/);
    expect(en.tools.scenarioChestPainBody).not.toMatch(/do not always cause crushing/);
    expect(en.tools.scenarioChestPainBody).toMatch(/anyone can experience/);
    expect(es.tools.scenarioChestPainBody).toMatch(/síntomas diferentes/);
    expect(es.tools.scenarioChestPainBody).toMatch(/mandíbula/);
    expect(es.tools.scenarioChestPainBody).toMatch(/cuello/);
    expect(es.tools.scenarioChestPainBody).toMatch(/espalda/);
    expect(es.tools.scenarioChestPainBody).toMatch(/sudor/);
    expect(es.tools.scenarioChestPainBody).toMatch(/911/);
  });

  it("names 988 in emergencyBody and whenInDoubtBody for both locales", () => {
    expect(en.tools.emergencyBody).toMatch(/988/);
    expect(en.tools.whenInDoubtBody).toMatch(/988/);
    expect(es.tools.emergencyBody).toMatch(/988/);
    expect(es.tools.whenInDoubtBody).toMatch(/988/);
  });

  it("whenInDoubtBody names Poison Help, 911-first, and drops triage", () => {
    expect(en.tools.whenInDoubtBody).toMatch(/222-1222/);
    expect(es.tools.whenInDoubtBody).toMatch(/222-1222/);
    expect(en.tools.whenInDoubtBody).toMatch(/911 first|llame primero al 911/);
    expect(es.tools.whenInDoubtBody).toMatch(/911 first|llame primero al 911/);
    expect(en.tools.whenInDoubtBody).not.toMatch(/triage|triaje/);
    expect(es.tools.whenInDoubtBody).not.toMatch(/triage|triaje/);
  });

  it("title and description do not promise choosing a place", () => {
    renderCareGuide();
    expect(`${en.tools.careGuideTitle} ${en.tools.careGuideDescription}`).not.toMatch(
      /choosing the right place|Where should I go for care/
    );
    expect(`${es.tools.careGuideTitle} ${es.tools.careGuideDescription}`).not.toMatch(
      /choosing the right place|Where should I go for care/
    );
  });

  it("renders the pediatric note with infant fever and hard-to-wake language", () => {
    renderCareGuide();
    expect(screen.getByText(en.tools.homeCarePediatricNote)).toBeInTheDocument();
    expect(en.tools.homeCarePediatricNote).toMatch(/hard to wake|despertar/i);
    expect(en.tools.homeCarePediatricNote).toMatch(/100\.4|38/);
    expect(en.tools.homeCarePediatricNote).toMatch(/infant|3 month|diaper|soft spot|dark urine/i);
    expect(es.tools.homeCarePediatricNote).toMatch(/bebés/);
    expect(es.tools.homeCarePediatricNote).toMatch(/3 meses/);
    expect(es.tools.homeCarePediatricNote).toMatch(/pañales/);
    expect(es.tools.homeCarePediatricNote).toMatch(/100\.4/);
    expect(es.tools.homeCarePediatricNote).toMatch(/38/);
    expect(es.tools.homeCarePediatricNote).toMatch(/orina/);
    expect(es.tools.homeCarePediatricNote).toMatch(/clínico/);
    expect(es.tools.homeCarePediatricNote).not.toMatch(/somnolencia extrema/);
    expect(en.tools.homeCarePediatricNote).not.toMatch(/rectal/i);
    expect(es.tools.homeCarePediatricNote).not.toMatch(/rectal/i);
  });

  it("older-child dark urine is clinician care, not 911 by itself", () => {
    const enAfterDarkUrine = en.tools.homeCarePediatricNote.split(/dark urine/i)[1] ?? "";
    const enSentence = enAfterDarkUrine.split(".")[0] ?? "";
    expect(enSentence).toMatch(/clinician/i);
    expect(enSentence).toMatch(/not 911 by itself/i);
    expect(enSentence).not.toMatch(/those signs alone are 911|call 911 by itself/i);

    const esAfterOrina = es.tools.homeCarePediatricNote.split(/orina oscura/i)[1] ?? "";
    const esSentence = esAfterOrina.split(".")[0] ?? "";
    expect(esSentence).toMatch(/clínico/);
    expect(esSentence).toMatch(/no son motivo por sí solos para llamar al 911/);
  });

  it("home-care checklist has no bare Low fever / Fiebre baja", () => {
    expect(en.tools.homeCareChecklist.split("|")).not.toContain("Low fever");
    expect(es.tools.homeCareChecklist.split("|")).not.toContain("Fiebre baja");
    renderCareGuide();
    expect(screen.queryByText("Low fever")).not.toBeInTheDocument();
    cleanup();
    renderCareGuide("es");
    expect(screen.queryByText("Fiebre baja")).not.toBeInTheDocument();
  });
});

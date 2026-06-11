import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GLOSSARY_IDS } from "../src/types/content";
import { GLOSSARY_ENRICHMENT } from "./glossary-enrichment";

const CATEGORY_EN: Record<string, string> = {
  acute: "General",
  biopsy: "Procedures",
  "blood-pressure": "General",
  "blood-sugar": "General",
  cholesterol: "General",
  chronic: "General",
  "clinical-trial": "General",
  "ct-scan": "Procedures",
  diabetes: "Conditions",
  diagnosis: "General",
  dosage: "Medications",
  "generic-drug": "Medications",
  glucose: "General",
  hdl: "Lab Results",
  hypertension: "Conditions",
  hypotension: "Conditions",
  "immune-system": "General",
  inflammation: "General",
  insulin: "General",
  ldl: "Lab Results",
  metabolism: "General",
  mri: "Procedures",
  "over-the-counter": "Medications",
  placebo: "General",
  prescription: "Medications",
  prognosis: "General",
  "side-effect": "Medications",
  sign: "General",
  symptom: "General",
  triglycerides: "Lab Results",
  ultrasound: "Procedures",
};

const TERM_EN: Record<string, string> = {
  acute: "Acute",
  biopsy: "Biopsy",
  "blood-pressure": "Blood Pressure",
  "blood-sugar": "Blood Sugar",
  cholesterol: "Cholesterol",
  chronic: "Chronic",
  "clinical-trial": "Clinical Trial",
  "ct-scan": "CT Scan",
  diabetes: "Diabetes",
  diagnosis: "Diagnosis",
  dosage: "Dosage",
  "generic-drug": "Generic Drug",
  glucose: "Glucose",
  hdl: "HDL Cholesterol",
  hypertension: "Hypertension",
  hypotension: "Hypotension",
  "immune-system": "Immune System",
  inflammation: "Inflammation",
  insulin: "Insulin",
  ldl: "LDL Cholesterol",
  metabolism: "Metabolism",
  mri: "MRI",
  "over-the-counter": "Over-the-Counter (OTC)",
  placebo: "Placebo",
  prescription: "Prescription",
  prognosis: "Prognosis",
  "side-effect": "Side Effect",
  sign: "Sign",
  symptom: "Symptom",
  triglycerides: "Triglycerides",
  ultrasound: "Ultrasound",
};

const TERM_ES: Record<string, string> = {
  acute: "Agudo",
  biopsy: "Biopsia",
  "blood-pressure": "Presión arterial",
  "blood-sugar": "Azúcar en sangre",
  cholesterol: "Colesterol",
  chronic: "Crónico",
  "clinical-trial": "Ensayo clínico",
  "ct-scan": "Tomografía computarizada (TC)",
  diabetes: "Diabetes",
  diagnosis: "Diagnóstico",
  dosage: "Dosis",
  "generic-drug": "Medicamento genérico",
  glucose: "Glucosa",
  hdl: "Colesterol HDL",
  hypertension: "Hipertensión",
  hypotension: "Hipotensión",
  "immune-system": "Sistema inmunológico",
  inflammation: "Inflamación",
  insulin: "Insulina",
  ldl: "Colesterol LDL",
  metabolism: "Metabolismo",
  mri: "Resonancia magnética (RM)",
  "over-the-counter": "De venta libre (OTC)",
  placebo: "Placebo",
  prescription: "Receta médica",
  prognosis: "Pronóstico",
  "side-effect": "Efecto secundario",
  sign: "Signo",
  symptom: "Síntoma",
  triglycerides: "Triglicéridos",
  ultrasound: "Ultrasonido",
};

const CATEGORY_ES: Record<string, string> = {
  General: "General",
  Procedures: "Procedimientos",
  Conditions: "Condiciones",
  Medications: "Medicamentos",
  "Lab Results": "Resultados de laboratorio",
};

function formatReference(definition: string, locale: "en" | "es"): string {
  const headings =
    locale === "en"
      ? ["What It Is", "Why It Matters", "Talk With Your Care Team"]
      : ["Qué es", "Por qué importa", "Hable con su equipo de salud"];
  const whyExtra =
    locale === "en"
      ? "Understanding this term helps you follow conversations with doctors, read labels and test results, and make informed decisions about your health."
      : "Entender este término le ayuda a seguir conversaciones con médicos, leer etiquetas y resultados, y tomar decisiones informadas sobre su salud.";
  const askExtra =
    locale === "en"
      ? "If you are unsure how this applies to you, write down your questions before appointments and ask for explanations in plain language."
      : "Si no está seguro de cómo esto le aplica, anote sus preguntas antes de las citas y pida explicaciones en lenguaje sencillo.";
  return `## ${headings[0]}\n\n${definition}\n\n## ${headings[1]}\n\n${whyExtra}\n\n## ${headings[2]}\n\n${askExtra}`;
}

function readExistingRelatedTerms(locale: "en" | "es", id: string): string[] | undefined {
  const filePath = path.join(process.cwd(), "content", "glossary", locale, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const related = data.relatedTerms;
  return Array.isArray(related) && related.length > 0 ? related.map(String) : undefined;
}

function writeGlossary(locale: "en" | "es", id: string) {
  const enrichment = GLOSSARY_ENRICHMENT[id];
  if (!enrichment) throw new Error(`Missing enrichment for ${id}`);

  const term = locale === "en" ? TERM_EN[id] : TERM_ES[id];
  const categoryEn = CATEGORY_EN[id];
  const category = locale === "en" ? categoryEn : CATEGORY_ES[categoryEn];
  const base = locale === "en" ? enrichment.en : enrichment.es;
  const definition = formatReference(base, locale);
  const relatedTerms = readExistingRelatedTerms(locale, id);

  const frontmatter: Record<string, unknown> = {
    id,
    term,
    category,
    relatedLessons: enrichment.relatedLessons,
  };
  if (relatedTerms) frontmatter.relatedTerms = relatedTerms;

  const body = `${definition}\n`;
  const file = `---\n${Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map((v) => `  - "${v}"`).join("\n")}`;
      }
      return `${key}: "${value}"`;
    })
    .join("\n")}\n---\n\n${body}`;

  const outPath = path.join(process.cwd(), "content", "glossary", locale, `${id}.mdx`);
  fs.writeFileSync(outPath, file, "utf8");
}

for (const id of GLOSSARY_IDS) {
  writeGlossary("en", id);
  writeGlossary("es", id);
}

console.log(`Enriched ${GLOSSARY_IDS.length} glossary terms (en + es).`);

/**
 * Generates the 10 expansion lessons + quizzes (en/es) from the audit plan.
 * Run: npx tsx scripts/generate-expansion-lessons.ts
 */
import fs from "fs";
import path from "path";

import type { LessonSpec } from "./expansion-lessons-types";

const SOURCES = ["NIH", "CDC", "MedlinePlus"];

const LESSONS: LessonSpec[] = [
  {
    id: "understanding-allergies",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "15 minutes",
    level: "beginner",
    en: {
      title: "Understanding Allergies",
      description: "Learn what allergies are, common triggers, and when to seek emergency care.",
      sidebarTitle: "Allergy safety",
      sidebarTips: [
        "Carry epinephrine if prescribed.",
        "Read food labels carefully.",
        "Tell every provider about allergies.",
        "Know signs of anaphylaxis.",
      ],
      body: `## What Is an Allergy?

An allergy is when your immune system overreacts to a substance that is usually harmless — such as pollen, peanuts, or penicillin. The body releases chemicals like histamine, which cause symptoms ranging from mild itching to life-threatening breathing problems.

## Common Triggers

Allergies can be triggered by:

- **Foods** — peanuts, tree nuts, milk, eggs, shellfish, wheat, soy
- **Environmental** — pollen, dust mites, mold, pet dander
- **Insect stings** — bees, wasps, fire ants
- **Medicines** — antibiotics, aspirin, contrast dye
- **Contact** — latex, nickel, fragrances

## Mild vs Severe Reactions

Mild symptoms may include sneezing, itchy eyes, hives, or a runny nose. Severe reactions (anaphylaxis) can include trouble breathing, swelling of the face or throat, rapid heartbeat, dizziness, or vomiting. Anaphylaxis is a medical emergency — use epinephrine if prescribed and call 911.

:::warning
If you have had a severe allergic reaction before, wear a medical alert bracelet and carry emergency medicine as directed.
:::

## Testing and Diagnosis

Doctors may use skin tests, blood tests (IgE), or supervised food challenges to identify allergies. Self-diagnosis can be dangerous — always work with a qualified provider before eliminating major food groups.

## Daily Management

- Avoid known triggers when possible
- Take antihistamines or other medicines as prescribed
- Keep an action plan for school, work, or travel
- Review allergies at every medical visit

:::info
Allergies can develop at any age. A reaction you had in the past does not predict how severe the next one will be — always take symptoms seriously.
:::`,
    },
    es: {
      title: "Entendiendo las alergias",
      description:
        "Aprenda qué son las alergias, desencadenantes comunes y cuándo buscar atención de emergencia.",
      sidebarTitle: "Seguridad con alergias",
      sidebarTips: [
        "Lleve epinefrina si se la recetaron.",
        "Lea etiquetas de alimentos con cuidado.",
        "Informe alergias a todos los proveedores.",
        "Conozca signos de anafilaxia.",
      ],
      body: `## ¿Qué es una alergia?

Una alergia ocurre cuando el sistema inmunológico reacciona en exceso a una sustancia normalmente inofensiva — como polen, cacahuates o penicilina. El cuerpo libera sustancias como histamina, causando síntomas desde picazón leve hasta problemas respiratorios graves.

## Desencadenantes comunes

- **Alimentos** — cacahuates, nueces, leche, huevos, mariscos, trigo, soya
- **Ambientales** — polen, ácaros, moho, caspa de mascotas
- **Picaduras** — abejas, avispas, hormigas de fuego
- **Medicamentos** — antibióticos, aspirina, medio de contraste
- **Contacto** — látex, níquel, fragancias

## Reacciones leves vs graves

Los síntomas leves pueden incluir estornudos, picazón en ojos, urticaria o secreción nasal. Las reacciones graves (anafilaxia) incluyen dificultad para respirar, hinchazón de cara o garganta, pulso rápido, mareo o vómitos. La anafilaxia es una emergencia — use epinefrina si se la recetaron y llame al 911.

:::warning
Si tuvo una reacción alérgica grave antes, use pulsera de alerta médica y lleve medicamento de emergencia según indicación.
:::

## Pruebas y diagnóstico

Los médicos pueden usar pruebas cutáneas, análisis de sangre (IgE) o exposiciones supervisadas. El autodiagnóstico puede ser peligroso — trabaje siempre con un profesional antes de eliminar grupos alimenticios importantes.

## Manejo diario

- Evite desencadenantes conocidos
- Tome antihistamínicos u otros medicamentos según receta
- Mantenga un plan de acción para escuela, trabajo o viajes
- Revise alergias en cada visita médica

:::info
Las alergias pueden desarrollarse a cualquier edad. Una reacción pasada no predice la gravedad de la siguiente — tome los síntomas en serio.
:::`,
    },
    quiz: {
      enTitle: "Understanding Allergies Quiz",
      esTitle: "Cuestionario: Entendiendo las alergias",
      enQuestions: [
        {
          q: "What is anaphylaxis?",
          options: [
            "A mild seasonal allergy",
            "A severe, potentially life-threatening allergic reaction",
            "A type of food intolerance",
            "A skin rash that always goes away on its own",
          ],
          answer: "B",
          explanation:
            "Anaphylaxis is a severe allergic reaction that can affect breathing and blood pressure and requires emergency treatment.",
        },
        {
          q: "What should you do first if you have epinephrine and signs of anaphylaxis?",
          options: [
            "Wait to see if symptoms improve",
            "Use epinephrine as directed and call 911",
            "Take only an antihistamine",
            "Drive yourself to urgent care",
          ],
          answer: "B",
          explanation:
            "Epinephrine is first-line emergency treatment for anaphylaxis. Call 911 because a second wave of symptoms can occur.",
        },
        {
          q: "Why tell every doctor and pharmacist about your allergies?",
          options: [
            "It is only required for food allergies",
            "To avoid medicines or products that could trigger a reaction",
            "Pharmacies already have this information automatically",
            "It is only needed for children",
          ],
          answer: "B",
          explanation:
            "Drug and latex allergies are common. Providers need your full allergy history to prescribe and dispense safely.",
        },
        {
          q: "Which is an example of an environmental allergy trigger?",
          options: ["Penicillin", "Pollen", "Shellfish", "Latex gloves only"],
          answer: "B",
          explanation:
            "Pollen is a common environmental allergen. Medicines, foods, and latex are other categories of triggers.",
        },
        {
          q: "Why is self-diagnosing food allergies risky?",
          options: [
            "All food allergies are mild",
            "Eliminating foods without testing can cause nutritional gaps and miss other conditions",
            "Doctors cannot test for food allergies",
            "Food labels list all allergens in every country",
          ],
          answer: "B",
          explanation:
            "Professional evaluation helps confirm true allergies and safe diets. Unnecessary restriction can harm nutrition.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué es la anafilaxia?",
          options: [
            "Una alergia estacional leve",
            "Una reacción alérgica grave potencialmente mortal",
            "Un tipo de intolerancia alimentaria",
            "Una erupción que siempre desaparece sola",
          ],
          answer: "B",
          explanation:
            "La anafilaxia es una reacción alérgica grave que puede afectar la respiración y la presión arterial y requiere tratamiento de emergencia.",
        },
        {
          q: "¿Qué debe hacer primero si tiene epinefrina y signos de anafilaxia?",
          options: [
            "Esperar a ver si mejoran los síntomas",
            "Usar epinefrina según indicación y llamar al 911",
            "Tomar solo un antihistamínico",
            "Manejar usted mismo hasta urgencias",
          ],
          answer: "B",
          explanation:
            "La epinefrina es el tratamiento de primera línea para anafilaxia. Llame al 911 porque puede haber una segunda ola de síntomas.",
        },
        {
          q: "¿Por qué informar alergias a cada médico y farmacéutico?",
          options: [
            "Solo es necesario para alergias alimentarias",
            "Para evitar medicamentos o productos que puedan desencadenar una reacción",
            "Las farmacias ya tienen esta información automáticamente",
            "Solo se necesita en niños",
          ],
          answer: "B",
          explanation:
            "Las alergias a medicamentos y látex son comunes. Los proveedores necesitan su historial completo para recetar con seguridad.",
        },
        {
          q: "¿Cuál es un ejemplo de desencadenante ambiental?",
          options: ["Penicilina", "Polen", "Mariscos", "Solo guantes de látex"],
          answer: "B",
          explanation:
            "El polen es un alérgeno ambiental común. Medicamentos, alimentos y látex son otras categorías.",
        },
        {
          q: "¿Por qué es arriesgado autodiagnosticar alergias alimentarias?",
          options: [
            "Todas las alergias alimentarias son leves",
            "Eliminar alimentos sin pruebas puede causar carencias nutricionales y omitir otras condiciones",
            "Los médicos no pueden hacer pruebas de alergia alimentaria",
            "Las etiquetas listan todos los alérgenos en todos los países",
          ],
          answer: "B",
          explanation:
            "La evaluación profesional confirma alergias reales y dietas seguras. La restricción innecesaria puede dañar la nutrición.",
        },
      ],
    },
  },
];

import { EXPANSION_LESSONS_PART2 } from "./expansion-lessons-data";

const ALL_LESSONS = [...LESSONS, ...EXPANSION_LESSONS_PART2];

function writeLesson(locale: "en" | "es", spec: LessonSpec) {
  const data = locale === "en" ? spec.en : spec.es;
  const fm = {
    id: spec.id,
    title: data.title,
    description: data.description,
    category: spec.category,
    categoryId: spec.categoryId,
    duration: spec.duration,
    level: spec.level,
    sidebarTitle: data.sidebarTitle,
    sidebarTips: data.sidebarTips,
    lastReviewed: "2026-06-11",
    sources: SOURCES,
  };
  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - "${x}"`).join("\n")}`;
      return `${k}: "${v}"`;
    })
    .join("\n");
  const out = path.join(process.cwd(), "content", "lessons", locale, `${spec.id}.mdx`);
  fs.writeFileSync(out, `---\n${yaml}\n---\n\n${data.body}\n`, "utf8");
}

function writeQuiz(locale: "en" | "es", spec: LessonSpec) {
  const title = locale === "en" ? spec.quiz.enTitle : spec.quiz.esTitle;
  const questions = locale === "en" ? spec.quiz.enQuestions : spec.quiz.esQuestions;
  const qLabel = locale === "en" ? "Question" : "Pregunta";
  const body = questions
    .map((item, i) => {
      const [a, b, c, d] = item.options;
      return `## ${qLabel} ${i + 1}\n\n${item.q}\n\nA) ${a}\nB) ${b}\nC) ${c}\nD) ${d}\n\nanswer: ${item.answer}\nexplanation: ${item.explanation}`;
    })
    .join("\n\n");
  const fm = `---\nid: "${spec.id}"\ntitle: "${title}"\nlessonId: "${spec.id}"\npassScore: 70\n---\n\n`;
  const out = path.join(process.cwd(), "content", "quizzes", locale, `${spec.id}.mdx`);
  fs.writeFileSync(out, fm + body + "\n", "utf8");
}

for (const spec of ALL_LESSONS) {
  writeLesson("en", spec);
  writeLesson("es", spec);
  writeQuiz("en", spec);
  writeQuiz("es", spec);
  console.log(`Wrote ${spec.id}`);
}

console.log(`Generated ${ALL_LESSONS.length} expansion lessons (en + es + quizzes).`);

/**
 * Generates the 5 launch articles (en/es). Run: npx tsx scripts/generate-articles.ts
 */
import fs from "fs";
import path from "path";
import { ARTICLE_IDS } from "../src/types/content";

type ArticleSpec = {
  id: (typeof ARTICLE_IDS)[number];
  category: string;
  readingTime: string;
  en: { title: string; description: string; body: string };
  es: { title: string; description: string; body: string };
};

const ARTICLES: ArticleSpec[] = [
  {
    id: "choosing-primary-care-doctor",
    category: "Healthcare Navigation",
    readingTime: "7 min",
    en: {
      title: "How to Choose a Primary Care Doctor",
      description:
        "Practical steps to find a clinician who fits your needs, insurance, and communication style.",
      body: `## Why Primary Care Matters

A primary care provider (PCP) is your main doctor for checkups, chronic conditions, referrals, and everyday concerns. A good match makes it easier to stay on top of preventive care and catch problems early.

## Start With Your Insurance

Use your plan's provider directory to find in-network doctors. Out-of-network care usually costs much more. Confirm the office is accepting new patients before you book.

## Consider Logistics

- **Location** — reasonable travel for sick visits and labs
- **Hours** — evenings or weekends if you work standard hours
- **Hospital affiliation** — matters if you may need inpatient care
- **Telehealth** — useful for follow-ups and minor issues

## Evaluate Fit at the First Visit

Ask yourself:

- Did the doctor listen without rushing?
- Were explanations clear?
- Did you feel respected?
- Was the staff helpful with scheduling and billing questions?

:::info
It is okay to switch PCPs if the relationship is not working. Your comfort affects how honestly you share symptoms.
:::

## Questions to Ask

- Who covers for my doctor when they are away?
- How do I reach someone after hours?
- How are test results communicated?
- Can I use the patient portal for refills and messages?`,
    },
    es: {
      title: "Cómo elegir un médico de atención primaria",
      description:
        "Pasos prácticos para encontrar un profesional que se ajuste a sus necesidades, seguro y estilo de comunicación.",
      body: `## Por qué importa la atención primaria

Un proveedor de atención primaria (PCP) es su médico principal para chequeos, condiciones crónicas, referencias y problemas cotidianos. Un buen match facilita la atención preventiva y detectar problemas temprano.

## Empiece con su seguro

Use el directorio de su plan para médicos en red. La atención fuera de red suele costar mucho más. Confirme que la oficina acepta pacientes nuevos.

## Considere logística

- **Ubicación** — viaje razonable para visitas y laboratorios
- **Horarios** — tardes o fines de semana si trabaja horario estándar
- **Afiliación hospitalaria** — importa si puede necesitar hospitalización
- **Telemedicina** — útil para seguimientos y problemas menores

## Evalúe en la primera visita

- ¿El médico escuchó sin apresurarse?
- ¿Las explicaciones fueron claras?
- ¿Se sintió respetado?
- ¿El personal ayudó con citas y facturación?

:::info
Está bien cambiar de PCP si la relación no funciona. Su comodidad afecta qué tan honesto es al compartir síntomas.
:::

## Preguntas útiles

- ¿Quién cubre cuando mi médico no está?
- ¿Cómo contacto a alguien fuera de horario?
- ¿Cómo comunican resultados?
- ¿Puedo usar el portal para resurtidos y mensajes?`,
    },
  },
  {
    id: "annual-physical-what-to-expect",
    category: "Preventive Care",
    readingTime: "6 min",
    en: {
      title: "What Happens at an Annual Physical",
      description: "What to expect during a routine wellness visit and how to prepare.",
      body: `## Purpose of a Wellness Visit

An annual physical (wellness visit) focuses on prevention — not just treating illness. Your clinician reviews history, checks vitals, discusses screenings, and updates vaccines.

## Typical Components

- Height, weight, blood pressure, heart and lung exam
- Review of medications and allergies
- Age-appropriate cancer and chronic disease screening orders
- Vaccine updates
- Lifestyle counseling (sleep, activity, nutrition, tobacco)

## How to Prepare

Bring your medication list, recent test results, and questions. Mention new symptoms even if they seem minor.

:::warning
A wellness visit is not the same as an urgent care visit for acute illness. Book separately if you are sick and need same-day treatment.
:::

## After the Visit

You may receive orders for blood work or referrals. Ask when results will be ready and how you will be notified.

:::success
Use preventive benefits your insurance covers — many screenings have no out-of-pocket cost when in-network.
:::`,
    },
    es: {
      title: "Qué esperar en un examen físico anual",
      description: "Qué ocurre en una visita de bienestar de rutina y cómo prepararse.",
      body: `## Propósito de la visita de bienestar

Un examen anual se enfoca en prevención. El profesional revisa historial, signos vitales, pruebas de detección y vacunas.

## Componentes típicos

- Talla, peso, presión, examen cardíaco y pulmonar
- Revisión de medicamentos y alergias
- Órdenes de detección según edad
- Actualización de vacunas
- Consejería de estilo de vida

## Cómo prepararse

Lleve lista de medicamentos, resultados recientes y preguntas. Mencione síntomas nuevos aunque parezcan menores.

:::warning
Una visita de bienestar no es lo mismo que atención urgente por enfermedad aguda. Reserve por separado si está enfermo.
:::

## Después de la visita

Puede recibir órdenes de laboratorio o referencias. Pregunte cuándo estarán los resultados y cómo le avisarán.

:::success
Use beneficios preventivos de su seguro — muchas pruebas no tienen copago en red.
:::`,
    },
  },
  {
    id: "pharmacy-benefits-basics",
    category: "Insurance & Billing",
    readingTime: "6 min",
    en: {
      title: "Understanding Your Pharmacy Benefits",
      description: "Formularies, tiers, prior authorization, and how to lower prescription costs.",
      body: `## Key Terms

- **Formulary** — list of drugs your plan covers
- **Tier** — cost level (generic tier 1 is usually cheapest)
- **Prior authorization** — insurer approval before they pay for certain drugs
- **Step therapy** — try a preferred drug before a more expensive one

## Reading Your Drug Card

Your insurance card may list a pharmacy help line and Rx BIN/PCN/group numbers pharmacists use to bill claims.

## Saving Money

- Ask for generics when appropriate
- Use in-network pharmacies
- Compare 90-day mail-order prices
- Ask about copay assistance for brand drugs

:::info
Pharmacists can often suggest covered alternatives — bring your insurance card every visit.
:::

## If a Claim Is Denied

Ask why (formulary, prior auth, quantity limit). Your doctor can submit an appeal or request an exception with medical justification.`,
    },
    es: {
      title: "Cómo entender sus beneficios de farmacia",
      description: "Formularios, niveles, autorización previa y cómo reducir costos de recetas.",
      body: `## Términos clave

- **Formulario** — lista de medicamentos que cubre su plan
- **Nivel (tier)** — nivel de costo (genéricos nivel 1 suelen ser más baratos)
- **Autorización previa** — aprobación del asegurador antes de pagar ciertos medicamentos
- **Terapia escalonada** — probar un medicamento preferido antes de uno más caro

## Leer su tarjeta de medicamentos

Su tarjeta puede tener línea de ayuda de farmacia y números BIN/PCN/grupo que usa la farmacia.

## Ahorrar dinero

- Pida genéricos cuando sea apropiado
- Use farmacias en red
- Compare precios de pedido por correo a 90 días
- Pregunte por ayuda con copago para marcas

:::info
Los farmacéuticos pueden sugerir alternativas cubiertas — lleve su tarjeta de seguro siempre.
:::

## Si rechazan un reclamo

Pregunte por qué (formulario, autorización, límite de cantidad). Su médico puede apelar o pedir excepción.`,
    },
  },
  {
    id: "health-literacy-better-questions",
    category: "Doctor Visits",
    readingTime: "5 min",
    en: {
      title: "Health Literacy: Asking Better Questions",
      description: "Simple phrases that help you understand diagnoses, tests, and treatment plans.",
      body: `## Why Questions Matter

Clear communication reduces errors and helps you follow treatment. Clinicians expect questions — short visits make preparation essential.

## Phrases That Work

- "Can you explain that in everyday language?"
- "What is the most important thing I should do next?"
- "What would you do if this were your family member?"
- "Can I get written instructions?"
- "What symptoms should prompt me to call you?"

## Teach-Back Technique

Repeat what you heard: "So I will take this twice daily with food and call if I get a rash — is that right?" This catches misunderstandings early.

:::info
Bring a friend or use your phone's recorder **only if** your clinic allows recording.
:::

## When You Feel Rushed

Say: "I have three questions I need answered before we finish." Prioritize safety and medicine instructions first.`,
    },
    es: {
      title: "Alfabetización en salud: mejores preguntas",
      description: "Frases simples para entender diagnósticos, pruebas y planes de tratamiento.",
      body: `## Por qué importan las preguntas

La comunicación clara reduce errores y ayuda a seguir el tratamiento. Los profesionales esperan preguntas — las visitas cortas hacen esencial la preparación.

## Frases que funcionan

- "¿Puede explicarlo en lenguaje cotidiano?"
- "¿Qué es lo más importante que debo hacer ahora?"
- "¿Qué haría si fuera su familiar?"
- "¿Puedo tener instrucciones por escrito?"
- "¿Qué síntomas deberían hacer que le llame?"

## Técnica de enseñanza de vuelta

Repita lo que oyó: "Entonces tomaré esto dos veces al día con comida y llamaré si tengo erupción — ¿correcto?"

:::info
Traiga a un amigo o use grabadora **solo si** la clínica lo permite.
:::

## Si se siente apurado

Diga: "Tengo tres preguntas que necesito resolver antes de terminar." Priorice seguridad e instrucciones de medicamentos.`,
    },
  },
  {
    id: "reliable-online-health-info",
    category: "Healthcare Navigation",
    readingTime: "6 min",
    en: {
      title: "When Online Health Information Is Reliable",
      description: "How to spot trustworthy sources and avoid dangerous misinformation.",
      body: `## Start With Trusted Organizations

Look for content from government health agencies (.gov), major hospitals, and established nonprofits. Examples: CDC, NIH MedlinePlus, disease-specific foundations with medical advisory boards.

## Red Flags

- Cure-all claims with no evidence
- Pressure to buy supplements immediately
- Anonymous authors with no credentials
- Stories that contradict your care team's advice without discussion
- Content designed to spread fear

## Check Dates and Sources

Medical guidance changes. Prefer pages updated in the last few years with cited studies or expert review.

:::warning
Social media anecdotes are not medical evidence. One person's experience may not apply to you.
:::

## Bring What You Find to Your Visit

Say: "I read about X online — is that relevant for my situation?" Your clinician can confirm, correct, or explain why it does not apply.`,
    },
    es: {
      title: "Cuándo la información de salud en línea es confiable",
      description: "Cómo identificar fuentes confiables y evitar desinformación peligrosa.",
      body: `## Empiece con organizaciones confiables

Busque contenido de agencias gubernamentales (.gov), hospitales importantes y fundaciones establecidas. Ejemplos: CDC, NIH MedlinePlus, fundaciones con consejos médicos.

## Señales de alerta

- Promesas de cura total sin evidencia
- Presión para comprar suplementos de inmediato
- Autores anónimos sin credenciales
- Historias que contradicen a su equipo sin discusión
- Contenido diseñado para generar miedo

## Revise fechas y fuentes

La orientación médica cambia. Prefiera páginas actualizadas en los últimos años con estudios citados.

:::warning
Las anécdotas en redes no son evidencia médica. La experiencia de una persona puede no aplicarle.
:::

## Lleve lo que encuentre a su visita

Diga: "Leí sobre X en línea — ¿es relevante para mi situación?" Su profesional puede confirmar, corregir o explicar por qué no aplica.`,
    },
  },
];

function writeArticle(locale: "en" | "es", spec: ArticleSpec) {
  const data = locale === "en" ? spec.en : spec.es;
  const fm = {
    id: spec.id,
    title: data.title,
    description: data.description,
    category: spec.category,
    readingTime: spec.readingTime,
    lastReviewed: "2026-06-11",
    reviewedBy: "Health Education Review Team",
    sources: ["CDC", "NIH MedlinePlus"],
  };
  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - "${x}"`).join("\n")}`;
      return `${k}: "${v}"`;
    })
    .join("\n");
  const dir = path.join(process.cwd(), "content", "articles", locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${spec.id}.mdx`), `---\n${yaml}\n---\n\n${data.body}\n`, "utf8");
}

for (const spec of ARTICLES) {
  writeArticle("en", spec);
  writeArticle("es", spec);
  console.log(`Wrote article ${spec.id}`);
}

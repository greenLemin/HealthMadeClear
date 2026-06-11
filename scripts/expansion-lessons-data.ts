import type { LessonSpec } from "./expansion-lessons-types";
import { QUIZ_EXPLANATION_PATCHES } from "./quiz-explanation-patches";

export const EXPANSION_LESSONS_PART2: LessonSpec[] = [
  {
    id: "pain-medications-safely",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "12 minutes",
    level: "beginner",
    en: {
      title: "Pain Medications Safely",
      description: "Understand acetaminophen and ibuprofen limits, interactions, and when to get help.",
      sidebarTitle: "Pain med safety",
      sidebarTips: [
        "Never exceed daily dose on label.",
        "Do not mix similar products.",
        "Ask before using with blood thinners.",
        "Seek help for severe or lasting pain.",
      ],
      body: `## Two Common Pain Relievers

Most households use **acetaminophen** (Tylenol) or **ibuprofen** (Advil, Motrin). They work differently:

- **Acetaminophen** reduces pain and fever but is not an anti-inflammatory. Too much can damage the liver.
- **Ibuprofen** (an NSAID) reduces pain, fever, and inflammation but can irritate the stomach and affect kidneys.

## Daily Limits Matter

Always read labels — many cold and flu products also contain acetaminophen or ibuprofen. Combining products can push you over safe daily limits without realizing it.

:::warning
Adults should not exceed 4,000 mg of acetaminophen per day from all sources unless a doctor directs otherwise. People with liver disease need lower limits.
:::

## Alcohol and Other Medicines

Avoid alcohol with acetaminophen — both stress the liver. NSAIDs like ibuprofen can interact with blood thinners, blood pressure medicines, and kidney disease. Tell your pharmacist everything you take.

## When Pain Needs Medical Care

See a doctor promptly for:

- Chest pain or trouble breathing
- Severe headache with neck stiffness or confusion
- Pain after injury with deformity or inability to bear weight
- Pain lasting more than a few days without improvement

:::info
Pain is a signal, not just a nuisance. Treating symptoms is fine short-term, but persistent pain deserves evaluation for the underlying cause.
:::`,
    },
    es: {
      title: "Analgésicos con seguridad",
      description: "Entienda límites de acetaminofén e ibuprofeno, interacciones y cuándo buscar ayuda.",
      sidebarTitle: "Seguridad con analgésicos",
      sidebarTips: [
        "No exceda la dosis diaria de la etiqueta.",
        "No mezcle productos similares.",
        "Pregunte antes de usar con anticoagulantes.",
        "Busque ayuda si el dolor es severo o prolongado.",
      ],
      body: `## Dos analgésicos comunes

Muchos hogares usan **acetaminofén** (Tylenol) o **ibuprofeno** (Advil, Motrin). Actúan de forma distinta:

- **Acetaminofén** reduce dolor y fiebre pero no es antiinflamatorio. El exceso puede dañar el hígado.
- **Ibuprofeno** (AINE) reduce dolor, fiebre e inflamación pero puede irritar el estómago y afectar riñones.

## Los límites diarios importan

Lea etiquetas — muchos productos para resfriado también contienen acetaminofén o ibuprofeno. Combinar productos puede superar límites seguros sin darse cuenta.

:::warning
Los adultos no deben exceder 4,000 mg de acetaminofén al día de todas las fuentes, salvo indicación médica. Quienes tienen enfermedad hepática necesitan límites menores.
:::

## Alcohol y otros medicamentos

Evite alcohol con acetaminofén — ambos estresan el hígado. Los AINE pueden interactuar con anticoagulantes, medicamentos para presión y enfermedad renal. Informe a su farmacéutico todo lo que toma.

## Cuándo el dolor requiere atención médica

Consulte pronto si hay:

- Dolor de pecho o dificultad para respirar
- Dolor de cabeza severo con rigidez de cuello o confusión
- Dolor tras lesión con deformidad o incapacidad para apoyar peso
- Dolor que dura más de unos días sin mejorar

:::info
El dolor es una señal, no solo una molestia. Tratar síntomas está bien a corto plazo, pero el dolor persistente merece evaluación de la causa.
:::`,
    },
    quiz: mkQuiz(
      "Pain Medications Safely Quiz",
      "Cuestionario: Analgésicos con seguridad",
      "pain-medications-safely",
      [
        [
          "What organ is most at risk from too much acetaminophen?",
          ["Heart", "Liver", "Kidneys", "Lungs"],
          "B",
        ],
        [
          "Why check cold medicine labels for acetaminophen?",
          [
            "It is always safe to combine",
            "Multiple products can exceed daily limits",
            "It only matters for children",
            "Labels are optional",
          ],
          "B",
        ],
        [
          "When should you avoid ibuprofen without medical advice?",
          [
            "Mild headache",
            "Known kidney disease or stomach ulcers",
            "After exercise",
            "When food is available",
          ],
          "B",
        ],
        [
          "What should you do for chest pain?",
          [
            "Take extra pain medicine and wait",
            "Seek emergency care immediately",
            "Only use ice packs",
            "Ignore it if you are young",
          ],
          "B",
        ],
        [
          "Why tell your pharmacist all medicines you take?",
          [
            "To check interactions and duplications",
            "Pharmacies sell more products",
            "It is not necessary for OTC drugs",
            "Only for prescriptions from one doctor",
          ],
          "A",
        ],
      ],
      [
        [
          "¿Qué órgano está más en riesgo con demasiado acetaminofén?",
          ["Corazón", "Hígado", "Riñones", "Pulmones"],
          "B",
        ],
        [
          "¿Por qué revisar medicamentos para resfriado?",
          [
            "Siempre es seguro combinar",
            "Varios productos pueden exceder límites diarios",
            "Solo importa en niños",
            "Las etiquetas son opcionales",
          ],
          "B",
        ],
        [
          "¿Cuándo evitar ibuprofeno sin consejo médico?",
          [
            "Dolor de cabeza leve",
            "Enfermedad renal conocida o úlcera estomacal",
            "Después de ejercicio",
            "Cuando hay comida disponible",
          ],
          "B",
        ],
        [
          "¿Qué hacer ante dolor de pecho?",
          [
            "Tomar más analgésico y esperar",
            "Buscar atención de emergencia de inmediato",
            "Solo usar hielo",
            "Ignorarlo si es joven",
          ],
          "B",
        ],
        [
          "¿Por qué informar todos sus medicamentos al farmacéutico?",
          [
            "Para revisar interacciones y duplicados",
            "Para vender más productos",
            "No es necesario con OTC",
            "Solo para recetas de un médico",
          ],
          "A",
        ],
      ]
    ),
  },
  {
    id: "understanding-copay-assistance",
    category: "Insurance & Billing",
    categoryId: "insurance-billing",
    duration: "12 minutes",
    level: "intermediate",
    en: {
      title: "Understanding Copay Assistance Programs",
      description: "Learn how manufacturer and nonprofit programs can lower prescription costs.",
      sidebarTitle: "Cost help",
      sidebarTips: [
        "Ask pharmacy about assistance cards.",
        "Check manufacturer websites.",
        "Compare with insurance copay first.",
        "Beware of scams asking for SSN upfront.",
      ],
      body: `## Why Copay Assistance Exists

Brand-name medicines can cost hundreds per month even with insurance. **Copay assistance** (copay cards, coupons, or foundation grants) helps eligible patients pay out-of-pocket costs. Programs may come from drug manufacturers, nonprofits, or state agencies.

## How Programs Work

- **Copay cards** — reduce what you pay at the pharmacy for a specific drug
- **Patient assistance programs** — may provide medicine free or at low cost if you meet income rules
- **Foundation grants** — help people with specific diagnoses regardless of which drug they use

Insurance rules vary: some plans do not allow copay cards to count toward your deductible.

## Steps to Explore Options

1. Ask your doctor if a generic or lower-cost alternative exists
2. Tell the pharmacist you are comparing prices and assistance options
3. Visit the drug manufacturer's patient support site
4. Search reputable nonprofits (needymeds.org, PAN Foundation, etc.)
5. Read eligibility rules carefully — income, insurance type, and diagnosis often matter

:::warning
Never share your Social Security number or bank details with unsolicited callers promising copay help. Use official program websites or ask your clinic's financial counselor.
:::

## If You Still Cannot Afford Medicine

Talk to your doctor before stopping treatment. Clinics may have samples, different formulations, or referral to a social worker who knows local resources.

:::info
Assistance programs can change or end. Re-check eligibility each year and when your insurance changes.
:::`,
    },
    es: {
      title: "Programas de ayuda con copagos",
      description:
        "Aprenda cómo programas del fabricante y sin fines de lucro pueden reducir costos de recetas.",
      sidebarTitle: "Ayuda con costos",
      sidebarTips: [
        "Pregunte en farmacia por tarjetas de ayuda.",
        "Revise sitios del fabricante.",
        "Compare primero con el copago del seguro.",
        "Cuidado con estafas que piden SSN al inicio.",
      ],
      body: `## Por qué existe la ayuda con copagos

Los medicamentos de marca pueden costar cientos al mes incluso con seguro. La **ayuda con copagos** (tarjetas, cupones o becas) ayuda a pacientes elegibles. Los programas pueden venir de fabricantes, fundaciones o agencias estatales.

## Cómo funcionan

- **Tarjetas de copago** — reducen lo que paga en farmacia por un medicamento específico
- **Programas de asistencia al paciente** — pueden dar medicamento gratis o a bajo costo según ingresos
- **Becas de fundaciones** — ayudan a personas con diagnósticos específicos

Las reglas del seguro varían: algunos planes no permiten que las tarjetas cuenten hacia el deducible.

## Pasos para explorar opciones

1. Pregunte si existe genérico o alternativa más barata
2. Diga al farmacéutico que compara precios y ayuda
3. Visite el sitio de apoyo al paciente del fabricante
4. Busque fundaciones confiables
5. Lea reglas de elegibilidad — ingresos, seguro y diagnóstico suelen importar

:::warning
No comparta su número de Seguro Social con llamadas no solicitadas. Use sitios oficiales o un consejero financiero de la clínica.
:::

## Si aún no puede pagar

Hable con su médico antes de suspender tratamiento. Las clínicas pueden tener muestras, otras formulaciones o referencia a trabajador social.

:::info
Los programas pueden cambiar o terminar. Revise elegibilidad cada año y cuando cambie su seguro.
:::`,
    },
    quiz: mkQuiz(
      "Copay Assistance Quiz",
      "Cuestionario: Ayuda con copagos",
      "understanding-copay-assistance",
      [
        [
          "What is a common goal of manufacturer copay cards?",
          [
            "Replace insurance entirely",
            "Lower patient out-of-pocket cost for a specific drug",
            "Increase drug prices",
            "Eliminate need for prescriptions",
          ],
          "B",
        ],
        [
          "What should you do before stopping a medicine you cannot afford?",
          [
            "Stop immediately",
            "Talk with your doctor about alternatives and assistance",
            "Buy from unknown online sellers only",
            "Double the dose to make it last",
          ],
          "B",
        ],
        [
          "Why be cautious with unsolicited copay help calls?",
          [
            "They are always legitimate",
            "Scams may ask for sensitive personal information",
            "Pharmacies never offer real programs",
            "Insurance forbids all assistance",
          ],
          "B",
        ],
        [
          "Who can help navigate assistance at many hospitals?",
          [
            "Only the billing department after discharge",
            "Financial counselor or social worker",
            "No one — you must figure it out alone",
            "Only drug sales representatives",
          ],
          "B",
        ],
        [
          "Why re-check assistance eligibility yearly?",
          [
            "Programs never change",
            "Insurance, income rules, and program funding can change",
            "Once approved, it lasts forever",
            "Doctors handle this automatically",
          ],
          "B",
        ],
      ],
      [
        [
          "¿Objetivo común de tarjetas de copago del fabricante?",
          [
            "Reemplazar el seguro",
            "Reducir el pago del paciente por un medicamento específico",
            "Subir precios",
            "Eliminar recetas",
          ],
          "B",
        ],
        [
          "¿Qué hacer antes de dejar un medicamento que no puede pagar?",
          [
            "Suspender de inmediato",
            "Hablar con el médico sobre alternativas y ayuda",
            "Comprar solo en sitios desconocidos",
            "Duplicar la dosis",
          ],
          "B",
        ],
        [
          "¿Por qué desconfiar de llamadas no solicitadas?",
          [
            "Siempre son legítimas",
            "Estafas pueden pedir datos personales sensibles",
            "Farmacias nunca ofrecen programas reales",
            "El seguro prohíbe toda ayuda",
          ],
          "B",
        ],
        [
          "¿Quién puede ayudar en muchos hospitales?",
          [
            "Solo facturación tras el alta",
            "Consejero financiero o trabajador social",
            "Nadie",
            "Solo representantes de ventas",
          ],
          "B",
        ],
        [
          "¿Por qué revisar elegibilidad cada año?",
          [
            "Los programas nunca cambian",
            "Seguro, reglas de ingresos y fondos pueden cambiar",
            "Dura para siempre",
            "El médico lo hace solo",
          ],
          "B",
        ],
      ]
    ),
  },
  {
    id: "cancer-screening-basics",
    category: "Preventive Care",
    categoryId: "preventive-care",
    duration: "18 minutes",
    level: "intermediate",
    en: {
      title: "Cancer Screening Basics",
      description:
        "Overview of common adult cancer screenings and how to talk with your doctor about timing.",
      sidebarTitle: "Screening tips",
      sidebarTips: [
        "Bring family cancer history.",
        "Ask start age for your risk.",
        "Know prep for colon tests.",
        "Follow up on abnormal results.",
      ],
      body: `## What Screening Does

Cancer screening looks for early signs of cancer **before symptoms appear**. Finding cancer early often means more treatment options and better outcomes. Screening is recommended based on age, sex, family history, and personal risk — not everyone needs every test at the same age.

## Common Adult Screenings

| Screening | Who it is for (general guidelines) | Notes |
| --------- | ---------------------------------- | ----- |
| Mammogram | Women at average risk, often starting 40–50 | Earlier if strong family history |
| Colonoscopy or stool test | Adults 45+ | Colonoscopy every 10 years or stool tests more often |
| Cervical (Pap/HPV) | People with a cervix, 21–65 | Interval depends on test type and results |
| Lung CT | Heavy smokers 50–80 who currently smoke or quit recently | Discuss risks and benefits |
| Skin checks | Anyone with many moles or history of melanoma | Self-exams plus dermatology visits |

Guidelines change — your doctor personalizes recommendations.

## Preparing for Screening

- Update family history of cancer
- List medicines and prior surgeries
- For colonoscopy: follow bowel prep instructions exactly — poor prep hides problems
- Arrange a ride if sedation is used

:::warning
Screening is not perfect. False positives may need more tests. False negatives are possible. Report new symptoms even if a recent screen was normal.
:::

## After Results

If results are abnormal, ask:

- What does this mean specifically?
- What is the next test or timeframe?
- Should family members be screened earlier?

:::info
Vaccines like HPV reduce risk of several cancers. Screening and prevention work together.
:::`,
    },
    es: {
      title: "Conceptos básicos de detección de cáncer",
      description:
        "Resumen de pruebas de detección comunes en adultos y cómo hablar con su médico sobre el momento.",
      sidebarTitle: "Consejos de detección",
      sidebarTips: [
        "Traiga historial familiar de cáncer.",
        "Pregunte edad de inicio según su riesgo.",
        "Conozca preparación para colon.",
        "Haga seguimiento si hay resultados anormales.",
      ],
      body: `## Qué hace la detección

La detección de cáncer busca signos tempranos **antes de síntomas**. Encontrar cáncer temprano suele dar más opciones de tratamiento. Las recomendaciones dependen de edad, sexo, historial familiar y riesgo personal.

## Pruebas comunes en adultos

| Prueba | Para quién (guías generales) | Notas |
| ------ | ---------------------------- | ----- |
| Mamografía | Mujeres en riesgo promedio, a menudo desde 40–50 | Antes si hay historial familiar fuerte |
| Colonoscopia o prueba de heces | Adultos 45+ | Colonoscopia cada 10 años o heces con más frecuencia |
| Cervical (Pap/VPH) | Personas con cuello uterino, 21–65 | Intervalo según prueba y resultados |
| TC de pulmón | Fumadores intensos 50–80 | Discutir riesgos y beneficios |
| Piel | Quienes tienen muchos lunares o melanoma previo | Autoexamen y dermatología |

Las guías cambian — su médico personaliza recomendaciones.

## Preparación

- Actualice historial familiar de cáncer
- Liste medicamentos y cirugías previas
- Para colonoscopia: siga preparación intestinal al pie de la letra
- Organice transporte si hay sedación

:::warning
La detección no es perfecta. Puede haber falsos positivos o negativos. Reporte síntomas nuevos aunque una prueba reciente fue normal.
:::

## Tras los resultados

Si son anormales, pregunte qué significa, cuál es la siguiente prueba y si familiares deben detectarse antes.

:::info
Vacunas como VPH reducen riesgo de varios cánceres. Detección y prevención van juntas.
:::`,
    },
    quiz: mkQuiz(
      "Cancer Screening Quiz",
      "Cuestionario: Detección de cáncer",
      "cancer-screening-basics",
      [
        [
          "Main purpose of cancer screening?",
          [
            "Diagnose every symptom",
            "Find early signs before symptoms",
            "Replace treatment",
            "Guarantee no cancer ever",
          ],
          "B",
        ],
        [
          "Typical starting age for colon screening in U.S. guidelines?",
          ["18", "45", "70", "Only if symptoms"],
          "B",
        ],
        [
          "Why is family history important?",
          [
            "It never changes recommendations",
            "It can lead to earlier or more frequent screening",
            "Doctors already know it",
            "Only matters for children",
          ],
          "B",
        ],
        [
          "What if a screening result is abnormal?",
          ["Ignore it", "Ask what it means and next steps", "Stop all future screening", "Self-treat"],
          "B",
        ],
        [
          "Can screening miss cancer?",
          [
            "No — it is 100% accurate",
            "Yes — report new symptoms even after normal results",
            "Only in young people",
            "Only for skin cancer",
          ],
          "B",
        ],
      ],
      [
        [
          "¿Propósito principal de la detección?",
          [
            "Diagnosticar cada síntoma",
            "Encontrar signos tempranos antes de síntomas",
            "Reemplazar tratamiento",
            "Garantizar que nunca habrá cáncer",
          ],
          "B",
        ],
        [
          "¿Edad típica de inicio para colon en guías de EE.UU.?",
          ["18", "45", "70", "Solo con síntomas"],
          "B",
        ],
        [
          "¿Por qué importa el historial familiar?",
          [
            "Nunca cambia recomendaciones",
            "Puede llevar a detección antes o más frecuente",
            "El médico ya lo sabe",
            "Solo en niños",
          ],
          "B",
        ],
        [
          "¿Qué hacer si el resultado es anormal?",
          ["Ignorarlo", "Preguntar qué significa y siguientes pasos", "Dejar toda detección", "Autotratarse"],
          "B",
        ],
        [
          "¿Puede la detección no ver cáncer?",
          [
            "No — 100% exacta",
            "Sí — reporte síntomas nuevos tras resultado normal",
            "Solo en jóvenes",
            "Solo cáncer de piel",
          ],
          "B",
        ],
      ]
    ),
  },
  {
    id: "managing-stress",
    category: "Mental Health",
    categoryId: "mental-health",
    duration: "15 minutes",
    level: "beginner",
    en: {
      title: "Managing Stress",
      description: "Practical ways to reduce daily stress and know when to seek professional support.",
      sidebarTitle: "Stress relief",
      sidebarTips: [
        "Try 5 minutes of slow breathing.",
        "Move your body most days.",
        "Limit news and social media.",
        "Reach out if stress feels unmanageable.",
      ],
      body: `## Stress Is Normal — Until It Is Not

Stress is your body's response to challenges. Short-term stress can help you focus. Chronic stress — weeks or months of pressure without recovery — can affect sleep, mood, blood pressure, digestion, and immune function.

## Everyday Coping Strategies

- **Breathing** — slow exhale longer than inhale for 2–5 minutes
- **Movement** — walking, stretching, or any activity you enjoy
- **Sleep routine** — consistent bedtime, limit screens before bed
- **Boundaries** — say no to nonessential commitments when overloaded
- **Connection** — talk with someone you trust

:::info
You do not need a perfect meditation practice. Small, repeatable habits matter more than occasional long sessions.
:::

## When Stress Overlaps With Mental Health

Seek professional help if you have:

- Panic attacks or constant worry
- Low mood most days for two weeks or more
- Thoughts of harming yourself or others
- Stress causing you to miss work, school, or self-care

Therapy, support groups, and sometimes medicine can help. Crisis lines are available 24/7 in many countries.

## Health-Related Stress

Medical bills, chronic illness, and caregiving are major stressors. Use clinic social workers, patient navigators, and trusted education sites — you do not have to solve everything alone.

:::warning
If you are in immediate danger, call emergency services or a crisis line. Stress management tips are not a substitute for emergency mental health care.
:::`,
    },
    es: {
      title: "Manejando el estrés",
      description: "Formas prácticas de reducir el estrés diario y saber cuándo buscar apoyo profesional.",
      sidebarTitle: "Alivio del estrés",
      sidebarTips: [
        "Pruebe 5 minutos de respiración lenta.",
        "Mueva el cuerpo la mayoría de los días.",
        "Limite noticias y redes sociales.",
        "Pida ayuda si el estrés es inmanejable.",
      ],
      body: `## El estrés es normal — hasta que no lo es

El estrés es la respuesta del cuerpo a desafíos. A corto plazo puede ayudar a concentrarse. El estrés crónico — semanas o meses sin recuperación — afecta sueño, ánimo, presión, digestión e inmune.

## Estrategias cotidianas

- **Respiración** — exhale más lento que inhale por 2–5 minutos
- **Movimiento** — caminar, estirar o actividad que disfrute
- **Rutina de sueño** — hora fija, limite pantallas antes de dormir
- **Límites** — diga no a compromisos no esenciales
- **Conexión** — hable con alguien de confianza

:::info
No necesita meditación perfecta. Hábitos pequeños y repetibles importan más que sesiones largas ocasionales.
:::

## Cuándo el estrés se cruza con salud mental

Busque ayuda profesional si tiene:

- Ataques de pánico o preocupación constante
- Ánimo bajo la mayoría de los días por dos semanas o más
- Pensamientos de hacerse daño o dañar a otros
- Estrés que le hace faltar trabajo, escuela o autocuidado

Terapia, grupos de apoyo y a veces medicamentos ayudan. Hay líneas de crisis 24/7 en muchos países.

## Estrés relacionado con la salud

Facturas médicas, enfermedad crónica y cuidar a otros son grandes estresores. Use trabajadores sociales y navegadores de pacientes — no tiene que resolver todo solo.

:::warning
Si está en peligro inmediato, llame a emergencias o línea de crisis. Los consejos de manejo no sustituyen atención de emergencia en salud mental.
:::`,
    },
    quiz: mkQuiz(
      "Managing Stress Quiz",
      "Cuestionario: Manejando el estrés",
      "managing-stress",
      [
        [
          "Chronic stress can affect which body systems?",
          ["Only mood", "Sleep, blood pressure, digestion, and more", "Only athletes", "Nothing measurable"],
          "B",
        ],
        [
          "A helpful daily habit is:",
          [
            "Checking news constantly",
            "A short walk or breathing break",
            "Skipping sleep to finish tasks",
            "Isolating from everyone",
          ],
          "B",
        ],
        [
          "When should you seek professional help?",
          [
            "Never — stress is always minor",
            "When symptoms persist and interfere with daily life",
            "Only after hospitalization",
            "Only for children",
          ],
          "B",
        ],
        [
          "What is a crisis resource?",
          [
            "Ignoring symptoms",
            "24/7 crisis line or emergency services when in danger",
            "Only social media advice",
            "Stopping all medicine",
          ],
          "B",
        ],
        [
          "Small habits work because:",
          [
            "They must be perfect",
            "Repeatable actions build recovery over time",
            "Stress never returns",
            "They replace medical care",
          ],
          "B",
        ],
      ],
      [
        [
          "El estrés crónico puede afectar:",
          ["Solo el ánimo", "Sueño, presión, digestión y más", "Solo atletas", "Nada medible"],
          "B",
        ],
        [
          "Un hábito diario útil es:",
          [
            "Revisar noticias sin parar",
            "Caminata corta o pausa para respirar",
            "Saltar sueño",
            "Aislarse de todos",
          ],
          "B",
        ],
        [
          "¿Cuándo buscar ayuda profesional?",
          [
            "Nunca",
            "Cuando los síntomas persisten e interfieren con la vida diaria",
            "Solo tras hospitalización",
            "Solo niños",
          ],
          "B",
        ],
        [
          "¿Recurso de crisis?",
          [
            "Ignorar síntomas",
            "Línea 24/7 o emergencias si hay peligro",
            "Solo redes sociales",
            "Suspender medicamentos",
          ],
          "B",
        ],
        [
          "Los hábitos pequeños funcionan porque:",
          [
            "Deben ser perfectos",
            "Acciones repetibles construyen recuperación",
            "El estrés no vuelve",
            "Reemplazan atención médica",
          ],
          "B",
        ],
      ]
    ),
  },
  {
    id: "hydration-and-health",
    category: "Nutrition",
    categoryId: "nutrition",
    duration: "10 minutes",
    level: "beginner",
    en: {
      title: "Hydration and Health",
      description: "How much water you need, signs of dehydration, and special situations.",
      sidebarTitle: "Hydration tips",
      sidebarTips: [
        "Drink more in heat and exercise.",
        "Urine pale yellow is a rough guide.",
        "Limit sugary drinks.",
        "Ask your doctor if you have heart or kidney disease.",
      ],
      body: `## Why Fluids Matter

Water carries nutrients, removes waste, regulates temperature, and cushions joints. Even mild dehydration can cause headache, fatigue, dizziness, and constipation.

## How Much Do You Need?

There is no single number for everyone. A common guide is about **8 cups (2 liters) of fluids daily** for many adults — more in heat, illness, pregnancy, or exercise. Foods like fruit and soup also count.

## Signs of Dehydration

- Thirst, dry mouth
- Dark yellow urine or urinating less often
- Dizziness when standing
- Confusion in older adults (seek care promptly)

:::warning
Severe dehydration — confusion, fainting, no urine for many hours — needs urgent medical care.
:::

## Who Needs Extra Caution

People with heart failure or kidney disease may need **fluid limits**, not extra water. Follow your care team's instructions. Athletes and outdoor workers need electrolytes when sweating heavily for long periods.

## Better Choices

Water is the best default. Unsweetened tea or milk work too. Limit sugary sodas and energy drinks — they add calories without lasting hydration benefits.

:::info
Caffeine in moderate amounts still contributes to fluid intake for most people, but it is not a substitute for water during heavy exercise.
:::`,
    },
    es: {
      title: "Hidratación y salud",
      description: "Cuánta agua necesita, signos de deshidratación y situaciones especiales.",
      sidebarTitle: "Consejos de hidratación",
      sidebarTips: [
        "Beba más con calor y ejercicio.",
        "Orina amarillo pálido es guía aproximada.",
        "Limite bebidas azucaradas.",
        "Pregunte al médico si tiene enfermedad cardíaca o renal.",
      ],
      body: `## Por qué importan los líquidos

El agua transporta nutrientes, elimina desechos, regula temperatura y amortigua articulaciones. Incluso deshidratación leve puede causar dolor de cabeza, fatiga, mareo y estreñimiento.

## ¿Cuánto necesita?

No hay un número único. Una guía común es unos **8 vasos (2 litros) al día** para muchos adultos — más con calor, enfermedad, embarazo o ejercicio. Alimentos como fruta y sopa también cuentan.

## Signos de deshidratación

- Sed, boca seca
- Orina amarillo oscuro o orinar menos
- Mareo al levantarse
- Confusión en adultos mayores (busque atención pronto)

:::warning
Deshidratación grave — confusión, desmayo, sin orina por muchas horas — requiere atención urgente.
:::

## Quién necesita más cuidado

Personas con insuficiencia cardíaca o renal pueden necesitar **límites de líquidos**. Siga instrucciones del equipo de salud. Atletas y trabajadores al aire libre pueden necesitar electrolitos con sudor prolongado.

## Mejores opciones

El agua es la mejor opción base. Té sin azúcar o leche también. Limite refrescos azucarados — añaden calorías sin hidratación duradera.

:::info
La cafeína en cantidades moderadas aún aporta líquidos para la mayoría, pero no sustituye agua en ejercicio intenso.
:::`,
    },
    quiz: mkQuiz(
      "Hydration Quiz",
      "Cuestionario: Hidratación",
      "hydration-and-health",
      [
        [
          "Mild dehydration may cause:",
          ["Only hunger", "Headache and fatigue", "Improved athletic performance", "Lower heart rate always"],
          "B",
        ],
        [
          "Who may need fluid limits instead of more water?",
          [
            "Healthy young athletes only",
            "Some people with heart or kidney disease",
            "Everyone over 65",
            "Only children",
          ],
          "B",
        ],
        [
          "A practical hydration check for many people is:",
          [
            "Never urinate",
            "Pale yellow urine and drinking when thirsty",
            "Only drink at meals",
            "Avoid all fluids at night",
          ],
          "B",
        ],
        [
          "Best default drink for daily hydration:",
          ["Sugary soda", "Water", "Energy drinks only", "Alcohol"],
          "B",
        ],
        [
          "Severe dehydration requires:",
          ["Ignoring it", "Urgent medical evaluation", "Only extra coffee", "Skipping all food forever"],
          "B",
        ],
      ],
      [
        [
          "La deshidratación leve puede causar:",
          [
            "Solo hambre",
            "Dolor de cabeza y fatiga",
            "Mejor rendimiento deportivo",
            "Siempre frecuencia cardíaca baja",
          ],
          "B",
        ],
        [
          "¿Quién puede necesitar límites de líquidos?",
          [
            "Solo atletas jóvenes",
            "Algunas personas con enfermedad cardíaca o renal",
            "Todos mayores de 65",
            "Solo niños",
          ],
          "B",
        ],
        [
          "Una guía práctica de hidratación es:",
          [
            "Nunca orinar",
            "Orina amarillo pálido y beber con sed",
            "Solo beber en comidas",
            "Evitar todo líquido de noche",
          ],
          "B",
        ],
        [
          "Mejor bebida base para hidratación diaria:",
          ["Refresco azucarado", "Agua", "Solo bebidas energéticas", "Alcohol"],
          "B",
        ],
        [
          "La deshidratación grave requiere:",
          ["Ignorarla", "Evaluación médica urgente", "Solo café extra", "No comer nunca"],
          "B",
        ],
      ]
    ),
  },
  {
    id: "when-to-use-urgent-care",
    category: "Emergency",
    categoryId: "emergency",
    duration: "12 minutes",
    level: "beginner",
    en: {
      title: "When to Use Urgent Care",
      description: "How urgent care fits between your doctor's office and the emergency room.",
      sidebarTitle: "Urgent care",
      sidebarTips: [
        "Call ahead if unsure.",
        "Bring ID and medication list.",
        "ER for chest pain or stroke signs.",
        "Follow up with your PCP after.",
      ],
      body: `## Three Levels of Care

- **Primary care** — ongoing health, refills, preventive visits (often days to weeks wait)
- **Urgent care** — same-day problems that are not life-threatening
- **Emergency room (ER)** — severe or potentially life-threatening conditions

Choosing the right setting saves time, money, and ER capacity for true emergencies.

## Good Reasons for Urgent Care

- Sprains, minor cuts needing stitches
- Fever without severe distress (in adults and older children per local guidance)
- Urinary tract symptoms
- Mild asthma flare responding to usual inhaler
- Rash without breathing problems
- Ear pain, sore throat when primary care is closed

## Go to the ER Instead

Call 911 or go to the ER for chest pain, stroke signs (FAST: face droop, arm weakness, speech trouble), severe breathing difficulty, heavy bleeding, poisoning, suicidal thoughts with plan, or major trauma.

:::warning
When in doubt about severity, err on the side of emergency care. Urgent care cannot handle every complication.
:::

## Before You Go

- Bring ID, insurance card, medication list
- Know hours — some urgent cares close overnight
- Ask if they can do needed tests (X-ray, strep test)
- Plan follow-up with your primary doctor

:::info
Urgent care bills may still be costly. Ask about self-pay prices and what your insurance requires (copay, in-network).
:::`,
    },
    es: {
      title: "Cuándo usar atención urgente",
      description: "Cómo la atención urgente encaja entre consultorio y sala de emergencias.",
      sidebarTitle: "Atención urgente",
      sidebarTips: [
        "Llame antes si no está seguro.",
        "Lleve identificación y lista de medicamentos.",
        "ER para dolor de pecho o signos de derrame.",
        "Haga seguimiento con su médico después.",
      ],
      body: `## Tres niveles de atención

- **Atención primaria** — salud continua, resurtidos, prevención (a menudo espera de días o semanas)
- **Atención urgente** — problemas el mismo día que no son mortales
- **Emergencias (ER)** — condiciones graves o potencialmente mortales

Elegir el lugar correcto ahorra tiempo, dinero y deja la ER para verdaderas emergencias.

## Buenas razones para atención urgente

- Esguinces, cortes menores que necesitan puntos
- Fiebre sin angustia severa (según guía local)
- Síntomas de infección urinaria
- Brote leve de asma que responde al inhalador habitual
- Erupción sin problemas respiratorios
- Dolor de oído o garganta cuando el consultorio está cerrado

## Vaya a emergencias en su lugar

Llame al 911 o vaya a ER por dolor de pecho, signos de derrame (FAST), dificultad respiratoria severa, sangrado abundante, intoxicación, pensamientos suicidas con plan o trauma mayor.

:::warning
Si duda de la gravedad, priorice atención de emergencia. La urgencia no maneja toda complicación.
:::

## Antes de ir

- Lleve ID, seguro, lista de medicamentos
- Conozca horarios — algunas cierran de noche
- Pregunte si hacen pruebas necesarias (rayos X, estreptococo)
- Planee seguimiento con su médico de cabecera

:::info
La factura de urgencia puede ser costosa. Pregunte precios y qué requiere su seguro (copago, red).
:::`,
    },
    quiz: mkQuiz(
      "Urgent Care Quiz",
      "Cuestionario: Atención urgente",
      "when-to-use-urgent-care",
      [
        [
          "Urgent care is best for:",
          [
            "Chest pain and stroke",
            "Same-day non-life-threatening problems",
            "Annual physical exams",
            "Routine prescription refills only",
          ],
          "B",
        ],
        [
          "Which belongs in the ER?",
          ["Mild sore throat", "Severe trouble breathing", "Small blister", "Routine vaccination"],
          "B",
        ],
        [
          "What does FAST stand for in stroke warning?",
          [
            "Face, Arm, Speech, Time to call 911",
            "Food, Activity, Sleep, Temperature",
            "Fever, Asthma, Stress, Tiredness",
            "None of the above",
          ],
          "A",
        ],
        [
          "Why follow up with primary care after urgent care?",
          [
            "Not necessary",
            "To coordinate ongoing treatment and records",
            "Urgent care replaces your doctor forever",
            "Only for children",
          ],
          "B",
        ],
        [
          "When unsure about severity:",
          [
            "Wait days at home",
            "Consider emergency care or call 911",
            "Only use online forums",
            "Skip all care",
          ],
          "B",
        ],
      ],
      [
        [
          "La atención urgente es mejor para:",
          [
            "Dolor de pecho y derrame",
            "Problemas el mismo día no mortales",
            "Exámenes físicos anuales",
            "Solo resurtidos de rutina",
          ],
          "B",
        ],
        [
          "¿Qué corresponde a emergencias?",
          ["Dolor de garganta leve", "Dificultad respiratoria severa", "Ampolla pequeña", "Vacuna de rutina"],
          "B",
        ],
        [
          "¿Qué significa FAST en advertencia de derrame?",
          [
            "Cara, Brazo, Habla, Tiempo de llamar 911",
            "Comida, Actividad, Sueño, Temperatura",
            "Fiebre, Asma, Estrés, Cansancio",
            "Ninguna",
          ],
          "A",
        ],
        [
          "¿Por qué seguimiento con atención primaria?",
          [
            "No es necesario",
            "Para coordinar tratamiento y registros",
            "La urgencia reemplaza al médico",
            "Solo niños",
          ],
          "B",
        ],
        [
          "Si no está seguro de la gravedad:",
          [
            "Esperar días",
            "Considerar emergencias o llamar 911",
            "Solo foros en línea",
            "No buscar atención",
          ],
          "B",
        ],
      ]
    ),
  },
  {
    id: "reading-lab-report",
    category: "Lab Results",
    categoryId: "lab-results",
    duration: "15 minutes",
    level: "intermediate",
    en: {
      title: "Reading Your Lab Report",
      description: "Decode flags, reference ranges, and units on common lab printouts.",
      sidebarTitle: "Lab report tips",
      sidebarTips: [
        "H or L means high or low.",
        "Ranges vary by lab.",
        "Trends matter more than one number.",
        "Ask what abnormal means for you.",
      ],
      body: `## Parts of a Lab Report

Most reports list:

- **Test name** — what was measured (glucose, hemoglobin, etc.)
- **Result** — your number
- **Units** — mg/dL, mmol/L, etc.
- **Reference range** — typical values for that lab
- **Flag** — H (high), L (low), or critical alerts

## Reference Ranges Are Not Diagnoses

Being slightly outside the range does not always mean disease. Ranges differ by lab equipment, age, sex, and pregnancy. Your doctor interprets results in context — symptoms, medicines, and past values.

## Common Flags Explained

- **High glucose** — may suggest diabetes risk; fasting status matters
- **Low hemoglobin** — may suggest anemia; causes vary
- **High cholesterol** — cardiovascular risk factor; lifestyle and genetics both play roles
- **Abnormal liver enzymes** — many causes including medicines; repeat tests often needed

:::info
Compare new results to your own past results when possible. A trend — rising A1C over years — can be more important than a single borderline value.
:::

## Questions for Your Doctor

- Is this result abnormal for me specifically?
- Should we repeat the test?
- Do any medicines or supplements affect it?
- What is the plan if it stays high or low?

:::warning
Critical or panic values usually trigger direct contact from the lab or clinic. If you see "critical" on a portal and no one called, contact your care team promptly.
:::`,
    },
    es: {
      title: "Cómo leer su informe de laboratorio",
      description: "Descifre banderas, rangos de referencia y unidades en informes comunes.",
      sidebarTitle: "Consejos de laboratorio",
      sidebarTips: [
        "H o L significa alto o bajo.",
        "Los rangos varían por laboratorio.",
        "Las tendencias importan más que un número.",
        "Pregunte qué significa anormal para usted.",
      ],
      body: `## Partes de un informe

La mayoría lista:

- **Nombre de prueba** — qué se midió (glucosa, hemoglobina, etc.)
- **Resultado** — su número
- **Unidades** — mg/dL, mmol/L, etc.
- **Rango de referencia** — valores típicos de ese laboratorio
- **Bandera** — H (alto), L (bajo) o alertas críticas

## Los rangos no son diagnósticos

Estar ligeramente fuera del rango no siempre significa enfermedad. Los rangos difieren por equipo, edad, sexo y embarazo. Su médico interpreta en contexto — síntomas, medicamentos y valores previos.

## Banderas comunes

- **Glucosa alta** — puede sugerir riesgo de diabetes; importa si ayunó
- **Hemoglobina baja** — puede sugerir anemia; causas variadas
- **Colesterol alto** — factor de riesgo cardiovascular
- **Enzimas hepáticas altas** — muchas causas incluyendo medicamentos

:::info
Compare resultados nuevos con los suyos previos cuando sea posible. Una tendencia — A1C subiendo años — puede importar más que un valor límite único.
:::

## Preguntas para su médico

- ¿Es anormal para mí específicamente?
- ¿Debemos repetir la prueba?
- ¿Algún medicamento o suplemento lo afecta?
- ¿Cuál es el plan si sigue alto o bajo?

:::warning
Valores críticos suelen provocar contacto directo del laboratorio o clínica. Si ve "crítico" en un portal y nadie llamó, contacte a su equipo pronto.
:::`,
    },
    quiz: mkQuiz(
      "Lab Report Quiz",
      "Cuestionario: Informe de laboratorio",
      "reading-lab-report",
      [
        [
          "What does an H flag usually mean?",
          ["Healthy", "High relative to reference range", "Hospital only", "Hormone test only"],
          "B",
        ],
        [
          "Reference ranges:",
          [
            "Are identical in every lab worldwide",
            "Can vary by lab and patient factors",
            "Replace medical advice",
            "Mean you definitely have disease if outside",
          ],
          "B",
        ],
        [
          "Why compare past results?",
          [
            "Never useful",
            "Trends help show if values are changing over time",
            "Only for children",
            "Portals do this illegally",
          ],
          "B",
        ],
        [
          "Slightly abnormal result — best first step?",
          ["Panic", "Discuss with your doctor in context", "Change dose yourself", "Ignore forever"],
          "B",
        ],
        [
          "Critical value on portal with no call — you should:",
          ["Wait a month", "Contact your care team promptly", "Post online only", "Retest at home only"],
          "B",
        ],
      ],
      [
        [
          "¿Qué suele significar bandera H?",
          ["Saludable", "Alto respecto al rango de referencia", "Solo hospital", "Solo prueba hormonal"],
          "B",
        ],
        [
          "Los rangos de referencia:",
          [
            "Son idénticos en todo el mundo",
            "Pueden variar por laboratorio y paciente",
            "Reemplazan consejo médico",
            "Significan enfermedad segura si está fuera",
          ],
          "B",
        ],
        [
          "¿Por qué comparar resultados previos?",
          ["Nunca útil", "Las tendencias muestran cambios en el tiempo", "Solo niños", "Ilegal en portales"],
          "B",
        ],
        [
          "Resultado ligeramente anormal — mejor paso:",
          ["Entrar en pánico", "Hablar con el médico en contexto", "Cambiar dosis solo", "Ignorar siempre"],
          "B",
        ],
        [
          "Valor crítico en portal sin llamada — debe:",
          ["Esperar un mes", "Contactar al equipo pronto", "Solo publicar en línea", "Solo prueba casera"],
          "B",
        ],
      ]
    ),
  },
  {
    id: "generic-vs-brand-drugs",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "10 minutes",
    level: "beginner",
    en: {
      title: "Generic vs Brand-Name Drugs",
      description: "How generics compare to brands on safety, effectiveness, and cost.",
      sidebarTitle: "Generic facts",
      sidebarTips: [
        "Same active ingredient required.",
        "Appearance may differ.",
        "Ask pharmacist about substitutions.",
        "Report new side effects after switches.",
      ],
      body: `## What Makes a Drug Generic

After a brand's patent expires, other companies can make **generic** versions with the same active ingredient, strength, dosage form, and route (pill, patch, etc.). Regulators require generics to meet the same quality standards.

## Are Generics the Same?

For most people, yes — generics work the same as brands. Inactive ingredients (colors, fillers) may differ, which rarely causes allergies or tolerance issues. If you notice new side effects after a switch, tell your pharmacist and doctor.

## Why Generics Cost Less

Brand companies invest in research and marketing. Generic makers skip those costs. Insurance often charges lower copays for generics.

## When Brands May Be Preferred

In a few cases — narrow therapeutic index drugs like some seizure or thyroid medicines — your doctor may prefer a consistent manufacturer. Do not switch back and forth without guidance.

:::info
"Bioequivalent" means the generic delivers the active drug to the bloodstream within an acceptable range compared to the brand.
:::

## At the Pharmacy

- Ask if a generic is available
- Confirm you received what was prescribed if you have concerns
- Use one pharmacy when possible so records stay complete

:::warning
Do not buy prescription medicines from unverified online sellers — counterfeit drugs are a real risk.
:::`,
    },
    es: {
      title: "Medicamentos genéricos vs de marca",
      description: "Cómo se comparan genéricos y marcas en seguridad, eficacia y costo.",
      sidebarTitle: "Datos sobre genéricos",
      sidebarTips: [
        "Se requiere el mismo ingrediente activo.",
        "La apariencia puede diferir.",
        "Pregunte al farmacéutico sobre sustituciones.",
        "Reporte efectos nuevos tras cambios.",
      ],
      body: `## Qué hace genérico un medicamento

Tras expirar la patente de una marca, otras empresas pueden hacer versiones **genéricas** con el mismo ingrediente activo, concentración, forma y vía. Los reguladores exigen los mismos estándares de calidad.

## ¿Son iguales los genéricos?

Para la mayoría, sí — actúan igual que las marcas. Los ingredientes inactivos (color, rellenos) pueden diferir, lo que rara vez causa alergias. Si nota efectos nuevos tras un cambio, informe a farmacia y médico.

## Por qué cuestan menos

Las marcas invierten en investigación y marketing. Los genéricos no. El seguro suele cobrar copagos menores por genéricos.

## Cuándo puede preferirse la marca

En algunos casos — medicamentos con índice terapéutico estrecho como algunos anticonvulsivos o tiroides — el médico puede preferir un fabricante consistente. No alterne sin orientación.

:::info
"Bioequivalente" significa que el genérico entrega el fármaco activo al torrente sanguíneo en rango aceptable comparado con la marca.
:::

## En la farmacia

- Pregunte si hay genérico
- Confirme que recibió lo recetado si tiene dudas
- Use una farmacia cuando sea posible para historial completo

:::warning
No compre medicamentos con receta de vendedores en línea no verificados — los falsificados son un riesgo real.
:::`,
    },
    quiz: mkQuiz(
      "Generic vs Brand Quiz",
      "Cuestionario: Genéricos vs marca",
      "generic-vs-brand-drugs",
      [
        [
          "Generics must have the same:",
          ["Only color", "Active ingredient and strength", "Marketing name", "Price as brand"],
          "B",
        ],
        [
          "Why might insurance prefer generics?",
          [
            "They are less regulated",
            "Lower cost with equivalent effectiveness for most drugs",
            "They never work",
            "They are always brands",
          ],
          "B",
        ],
        [
          "After switching to generic, you should:",
          [
            "Stop all follow-up",
            "Report new or worsening side effects to your care team",
            "Double the dose",
            "Never tell the pharmacist",
          ],
          "B",
        ],
        [
          "Counterfeit drugs are a risk when:",
          [
            "Using licensed pharmacies",
            "Buying from unverified online sellers",
            "Reading labels",
            "Asking questions",
          ],
          "B",
        ],
        [
          "Bioequivalent means:",
          [
            "No active drug",
            "Similar blood levels compared to brand within accepted range",
            "Only for vitamins",
            "Illegal in the U.S.",
          ],
          "B",
        ],
      ],
      [
        [
          "Los genéricos deben tener el mismo:",
          ["Solo color", "Ingrediente activo y concentración", "Nombre comercial", "Precio que la marca"],
          "B",
        ],
        [
          "¿Por qué el seguro prefiere genéricos?",
          [
            "Menos regulados",
            "Menor costo con eficacia equivalente en la mayoría",
            "Nunca funcionan",
            "Siempre son marcas",
          ],
          "B",
        ],
        [
          "Tras cambiar a genérico, debe:",
          [
            "Dejar seguimiento",
            "Reportar efectos nuevos o peores al equipo de salud",
            "Duplicar dosis",
            "No decir al farmacéutico",
          ],
          "B",
        ],
        [
          "Medicamentos falsificados son riesgo cuando:",
          [
            "Usa farmacias con licencia",
            "Compra en vendedores en línea no verificados",
            "Lee etiquetas",
            "Hace preguntas",
          ],
          "B",
        ],
        [
          "Bioequivalente significa:",
          [
            "Sin fármaco activo",
            "Niveles en sangre similares a la marca en rango aceptado",
            "Solo vitaminas",
            "Ilegal en EE.UU.",
          ],
          "B",
        ],
      ]
    ),
  },
  {
    id: "sleep-apnea-basics",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "15 minutes",
    level: "intermediate",
    en: {
      title: "Sleep Apnea Basics",
      description: "Recognize symptoms, understand testing, and overview of CPAP and lifestyle steps.",
      sidebarTitle: "Sleep tips",
      sidebarTips: [
        "Snoring plus daytime sleepiness — ask your doctor.",
        "CPAP only works if you use it nightly.",
        "Weight loss may help mild cases.",
        "Do not drive drowsy.",
      ],
      body: `## What Is Sleep Apnea?

Sleep apnea means breathing repeatedly pauses or becomes shallow during sleep. The most common type is **obstructive sleep apnea (OSA)** — throat muscles relax and block airflow. Each pause can last seconds and disrupt oxygen and sleep quality.

## Common Symptoms

- Loud snoring with gasping or choking
- Daytime sleepiness despite enough time in bed
- Morning headaches
- Trouble concentrating
- Partner noticing breathing stops

Not everyone who snores has apnea, but red flags deserve evaluation.

## Why It Matters

Untreated OSA raises risk of high blood pressure, heart disease, stroke, diabetes, and motor vehicle accidents from drowsy driving.

## Diagnosis

A **sleep study** (at home or in a lab) measures breathing, oxygen, and brain activity. Your doctor reviews the apnea-hypopnea index (AHI) to guide treatment.

## Treatment Overview

- **CPAP** — machine delivers gentle air pressure to keep the airway open; gold standard for moderate-to-severe OSA
- **Oral appliances** — for mild cases or CPAP intolerance
- **Weight loss** — can improve mild OSA
- **Surgery** — selected cases only

:::warning
Never stop CPAP without talking to your sleep doctor. Drowsy driving is dangerous — seek help before symptoms cause accidents.
:::

:::info
CPAP masks come in many styles. A sleep technologist can help you find a comfortable fit — comfort improves nightly use.
:::`,
    },
    es: {
      title: "Conceptos básicos de apnea del sueño",
      description: "Reconozca síntomas, entienda pruebas y resumen de CPAP y pasos de estilo de vida.",
      sidebarTitle: "Consejos de sueño",
      sidebarTips: [
        "Ronquidos más somnolencia diurna — pregunte al médico.",
        "CPAP solo funciona si lo usa cada noche.",
        "Bajar de peso puede ayudar casos leves.",
        "No maneje con sueño.",
      ],
      body: `## ¿Qué es la apnea del sueño?

La apnea del sueño significa que la respiración se pausa o se vuelve superficial repetidamente al dormir. El tipo más común es **apnea obstructiva del sueño (AOS)** — los músculos de la garganta se relajan y bloquean el flujo de aire.

## Síntomas comunes

- Ronquidos fuertes con jadeos o ahogos
- Somnolencia diurna pese a tiempo en cama
- Dolores de cabeza matutinos
- Dificultad para concentrarse
- Pareja nota que deja de respirar

No todos los que roncan tienen apnea, pero señales de alerta merecen evaluación.

## Por qué importa

La AOS sin tratar aumenta riesgo de presión alta, enfermedad cardíaca, derrame, diabetes y accidentes por manejar somnoliento.

## Diagnóstico

Un **estudio del sueño** (en casa o laboratorio) mide respiración, oxígeno y actividad cerebral. El médico revisa el índice apnea-hipopnea (IAH).

## Tratamiento

- **CPAP** — máquina que entrega presión de aire para mantener abierta la vía aérea
- **Aparatos orales** — casos leves o intolerancia a CPAP
- **Pérdida de peso** — puede mejorar AOS leve
- **Cirugía** — casos seleccionados

:::warning
No suspenda CPAP sin hablar con su médico del sueño. Manejar somnoliento es peligroso.
:::

:::info
Las mascarillas CPAP tienen muchos estilos. Un técnico del sueño puede ayudar a encontrar ajuste cómodo.
:::`,
    },
    quiz: mkQuiz(
      "Sleep Apnea Quiz",
      "Cuestionario: Apnea del sueño",
      "sleep-apnea-basics",
      [
        [
          "Obstructive sleep apnea is caused by:",
          [
            "Dreaming too much",
            "Blocked airflow when throat muscles relax",
            "Too much caffeine only",
            "Normal snoring always",
          ],
          "B",
        ],
        [
          "A reason to seek evaluation:",
          [
            "Snoring plus daytime sleepiness",
            "One night of poor sleep",
            "Occasional yawn",
            "Reading before bed",
          ],
          "A",
        ],
        [
          "CPAP works by:",
          [
            "Surgery on the throat",
            "Delivering air pressure to keep the airway open",
            "Replacing all exercise",
            "Stopping breathing on purpose",
          ],
          "B",
        ],
        [
          "Untreated sleep apnea increases risk of:",
          [
            "Only dry skin",
            "High blood pressure and heart disease among others",
            "Improved driving",
            "Lower weight always",
          ],
          "B",
        ],
        [
          "If CPAP is uncomfortable:",
          [
            "Stop forever without telling anyone",
            "Ask a sleep specialist about mask fit and alternatives",
            "Drive long trips while drowsy",
            "Only use it once a month",
          ],
          "B",
        ],
      ],
      [
        [
          "La apnea obstructiva se debe a:",
          [
            "Soñar demasiado",
            "Flujo de aire bloqueado al relajarse músculos de garganta",
            "Solo demasiada cafeína",
            "Ronquido normal siempre",
          ],
          "B",
        ],
        [
          "Razón para evaluación:",
          [
            "Ronquidos más somnolencia diurna",
            "Una noche de mal sueño",
            "Bostezo ocasional",
            "Leer antes de dormir",
          ],
          "A",
        ],
        [
          "CPAP funciona:",
          [
            "Cirugía de garganta",
            "Entregando presión de aire para mantener abierta la vía aérea",
            "Reemplazando ejercicio",
            "Deteniendo respiración a propósito",
          ],
          "B",
        ],
        [
          "Apnea sin tratar aumenta riesgo de:",
          [
            "Solo piel seca",
            "Presión alta y enfermedad cardíaca entre otros",
            "Mejor manejo",
            "Siempre bajar de peso",
          ],
          "B",
        ],
        [
          "Si CPAP incomoda:",
          [
            "Dejarlo sin decir nada",
            "Preguntar al especialista del sueño sobre mascarilla y alternativas",
            "Manejar somnoliento",
            "Usarlo una vez al mes",
          ],
          "B",
        ],
      ]
    ),
  },
];

type Q = [string, [string, string, string, string], "A" | "B" | "C" | "D"];

function mkQuiz(enTitle: string, esTitle: string, lessonId: string, en: Q[], es: Q[]): LessonSpec["quiz"] {
  const patches = QUIZ_EXPLANATION_PATCHES[lessonId];
  if (!patches) {
    throw new Error(`Missing quiz explanations for lesson: ${lessonId}`);
  }
  if (patches.en.length !== en.length || patches.es.length !== es.length) {
    throw new Error(`Explanation count mismatch for lesson: ${lessonId}`);
  }
  const mk = (items: Q[], explanations: string[]) =>
    items.map(([q, options, answer], idx) => ({
      q,
      options,
      answer,
      explanation: explanations[idx],
    }));
  return {
    enTitle,
    esTitle,
    enQuestions: mk(en, patches.en) as LessonSpec["quiz"]["enQuestions"],
    esQuestions: mk(es, patches.es) as LessonSpec["quiz"]["esQuestions"],
  };
}

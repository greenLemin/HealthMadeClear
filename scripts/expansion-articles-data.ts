/**
 * Additional articles for catalog expansion. Used by scripts/generate-articles.ts
 */
import type { ARTICLE_IDS } from "../src/types/content";

export type ExpansionArticleSpec = {
  id: (typeof ARTICLE_IDS)[number];
  category: string;
  readingTime: string;
  en: { title: string; description: string; body: string };
  es: { title: string; description: string; body: string };
};

export const EXPANSION_ARTICLES: ExpansionArticleSpec[] = [
  {
    id: "understanding-your-eob",
    category: "Insurance & Billing",
    readingTime: "7 min",
    en: {
      title: "Understanding Your Explanation of Benefits (EOB)",
      description: "How to read an EOB and match it to provider bills.",
      body: `## What an EOB Is

An Explanation of Benefits (EOB) is **not a bill**. It is a statement from your insurer showing what was billed, what they paid, and what you may owe. You usually receive it before or with a provider statement.

## Key Lines on an EOB

- **Billed amount** — what the provider charged
- **Allowed amount** — negotiated rate your plan accepts
- **Plan paid** — what insurance covered
- **Patient responsibility** — deductible, copay, coinsurance, or non-covered charges

## Matching EOB to Bills

Compare date of service, provider name, and procedure codes. If the bill total does not match the EOB patient responsibility, call billing before paying.

:::info
Keep EOBs for at least one plan year — you may need them for taxes (HSA/FSA) or appeals.
:::

## Common Confusion

- **Duplicate EOBs** for one visit — one per service line is normal
- **"You may owe"** — verify against the actual bill
- **Out-of-network** — allowed amount and balance billing rules differ

## When to Call Your Insurer

Ask if a claim was denied, applied to the wrong deductible, or coded incorrectly. Your doctor's office can resubmit with corrected codes.`,
    },
    es: {
      title: "Entender su Explicación de Beneficios (EOB)",
      description: "Cómo leer un EOB y compararlo con facturas del proveedor.",
      body: `## Qué es un EOB

Una Explicación de Beneficios (EOB) **no es una factura**. Es un estado de su aseguradora que muestra lo facturado, lo pagado y lo que puede deber. Suele llegar antes o con la factura del proveedor.

## Líneas clave

- **Monto facturado** — lo que cobró el proveedor
- **Monto permitido** — tarifa negociada que acepta su plan
- **Pagó el plan** — lo que cubrió el seguro
- **Responsabilidad del paciente** — deducible, copago, coseguro o cargos no cubiertos

## Comparar EOB con facturas

Compare fecha de servicio, proveedor y códigos. Si el total no coincide con la responsabilidad del paciente en el EOB, llame a facturación antes de pagar.

:::info
Guarde EOBs al menos un año — puede necesitarlos para impuestos (HSA/FSA) o apelaciones.
:::

## Confusiones comunes

- **EOB duplicados** por una visita — una por línea de servicio es normal
- **"Puede deber"** — verifique contra la factura real
- **Fuera de red** — reglas de monto permitido y facturación balanceada difieren

## Cuándo llamar al asegurador

Pregunte si un reclamo fue rechazado, aplicado al deducible incorrecto o codificado mal. La oficina del médico puede reenviar con códigos corregidos.`,
    },
  },
  {
    id: "finding-in-network-providers",
    category: "Healthcare Navigation",
    readingTime: "6 min",
    en: {
      title: "Finding In-Network Providers",
      description: "Use your plan directory and avoid surprise bills.",
      body: `## Why Network Matters

In-network providers contract with your insurer for lower rates. Out-of-network care can cost much more or may not be covered except in emergencies.

## Steps to Find Care

1. Log into your insurer's website or app
2. Search by specialty, location, and language
3. Confirm the **specific doctor** is in network — not just the clinic name
4. Call the office to verify they still accept your plan

## Hospital vs Doctor Network

Hospitals and individual doctors negotiate separately. A surgeon may be out of network even at an in-network hospital — ask before scheduled procedures.

:::warning
Emergency room care is often covered as in-network by law, but follow-up and ambulance rides may not be — verify after stabilization.
:::

## Telehealth and Urgent Care

Check whether virtual visits and retail clinics (minute clinics, urgent care chains) are in network before you go.

## If You Must Go Out of Network

Ask about cash prices, payment plans, and whether your doctor can refer you to an in-network alternative.`,
    },
    es: {
      title: "Encontrar proveedores en red",
      description: "Use el directorio de su plan y evite facturas sorpresa.",
      body: `## Por qué importa la red

Los proveedores en red tienen contrato con su aseguradora a tarifas más bajas. Atención fuera de red puede costar mucho más o no cubrirse excepto en emergencias.

## Pasos para encontrar atención

1. Entre al sitio o app de su aseguradora
2. Busque por especialidad, ubicación e idioma
3. Confirme que el **médico específico** está en red — no solo la clínica
4. Llame para verificar que aún aceptan su plan

## Red del hospital vs del médico

Hospitales y médicos negocian por separado. Un cirujano puede estar fuera de red aunque el hospital esté en red — pregunte antes de procedimientos programados.

:::warning
Emergencias suelen cubrirse como en red por ley, pero seguimiento y ambulancia pueden no — verifique tras estabilización.
:::

## Telesalud y urgencias

Verifique si visitas virtuales y clínicas minoristas están en red antes de ir.

## Si debe ir fuera de red

Pregunte precios en efectivo, planes de pago y si su médico puede referirlo a alternativa en red.`,
    },
  },
  {
    id: "preparing-for-blood-draw",
    category: "Lab Results",
    readingTime: "5 min",
    en: {
      title: "Preparing for a Blood Draw",
      description: "Fasting rules, hydration, and what to expect at the lab.",
      body: `## Before You Go

- Confirm **fasting** requirements (often 8–12 hours for glucose and lipids; water is usually OK)
- Take prescribed morning medicines unless told otherwise
- Wear sleeves that roll up easily
- Bring your order form or show the lab your electronic order

## At the Lab

The phlebotomist cleans your arm, applies a tourniquet, and inserts a small needle. Most draws take a few minutes. Multiple tubes may be filled from one stick.

## After the Draw

Press gauze firmly for several minutes to reduce bruising. Avoid heavy lifting with that arm for the rest of the day.

:::info
Mild bruising is common and not dangerous. Apply a cold pack if sore.
:::

## Results Timeline

Many routine tests return in 1–3 business days on your patient portal. Critical values may trigger a phone call sooner.

## Special Situations

Tell staff if you faint with needles, take blood thinners, or have a mastectomy — they may use a different arm or position.`,
    },
    es: {
      title: "Prepararse para una extracción de sangre",
      description: "Reglas de ayuno, hidratación y qué esperar en el laboratorio.",
      body: `## Antes de ir

- Confirme requisitos de **ayuno** (a menudo 8–12 horas para glucosa y lípidos; agua suele estar bien)
- Tome medicamentos matutinos recetados salvo indicación contraria
- Use mangas que suban fácilmente
- Lleve la orden o muestre la orden electrónica

## En el laboratorio

El flebotomista limpia el brazo, aplica torniquete e inserta aguja pequeña. La mayoría tarda minutos. Pueden llenarse varios tubos con una sola punción.

## Después

Presione gasa firmemente varios minutos para reducir moretones. Evite levantar peso con ese brazo el resto del día.

:::info
Moretones leves son comunes y no peligrosos. Aplique hielo si hay dolor.
:::

## Plazo de resultados

Muchas pruebas de rutina regresan en 1–3 días hábiles en el portal. Valores críticos pueden generar llamada antes.

## Situaciones especiales

Informe si se desmaya con agujas, toma anticoagulantes o tuvo mastectomía — pueden usar otro brazo o posición.`,
    },
  },
  {
    id: "second-opinion-basics",
    category: "Healthcare Navigation",
    readingTime: "7 min",
    en: {
      title: "When and How to Get a Second Opinion",
      description: "A practical guide to consulting another specialist.",
      body: `## Why Second Opinions Help

They confirm diagnoses, compare treatment options, or offer peace of mind before major surgery or long-term therapy. Good doctors support them.

## When to Consider One

- Serious or unclear diagnosis (cancer, rare disease)
- Recommended surgery with significant risk
- Symptoms not improving on treatment
- You feel rushed or unheard

## How to Request Records

Ask your clinic for copies of imaging, pathology, and visit notes — or authorize transfer to the second physician. Many systems share via electronic health records.

:::info
You do not need to tell your current doctor a negative reason — "I want to confirm the plan" is enough.
:::

## Insurance Coverage

Some plans require or pay for second opinions on certain procedures. Call member services before booking.

## After the Second Visit

Compare recommendations in writing. If plans differ, ask both doctors to discuss or schedule a three-way call.`,
    },
    es: {
      title: "Cuándo y cómo pedir segunda opinión",
      description: "Guía práctica para consultar a otro especialista.",
      body: `## Por qué ayudan las segundas opiniones

Confirman diagnósticos, comparan tratamientos u ofrecen tranquilidad antes de cirugía mayor o terapia prolongada. Buenos médicos las apoyan.

## Cuándo considerarla

- Diagnóstico grave o poco claro (cáncer, enfermedad rara)
- Cirugía recomendada con riesgo significativo
- Síntomas que no mejoran con tratamiento
- Se siente apurado o no escuchado

## Cómo solicitar registros

Pida copias de imágenes, patología y notas — o autorice transferencia al segundo médico. Muchos sistemas comparten electrónicamente.

:::info
No necesita dar razón negativa a su médico actual — "quiero confirmar el plan" basta.
:::

## Cobertura del seguro

Algunos planes exigen o pagan segundas opiniones en ciertos procedimientos. Llame a servicios al miembro antes de reservar.

## Tras la segunda visita

Compare recomendaciones por escrito. Si difieren, pida a ambos médicos discutir o programar llamada conjunta.`,
    },
  },
  {
    id: "telehealth-visit-tips",
    category: "Doctor Visits",
    readingTime: "6 min",
    en: {
      title: "Telehealth Visit Tips",
      description: "Prepare for a productive video or phone appointment.",
      body: `## Before the Visit

- Test camera, microphone, and app login 15 minutes early
- Sit in a quiet, well-lit space
- Have medication list, thermometer readings, and photos of rashes ready
- Know your pharmacy name and address for e-prescriptions

## During the Call

Speak clearly and show affected areas to the camera when asked. Telehealth works well for follow-ups, medication checks, and many mental health visits.

## Limitations

Emergencies, hands-on exams, and some diagnostic tests still need in-person care. Ask what cannot be done virtually.

:::warning
If symptoms worsen during a video visit, the clinician may direct you to urgent care or ER — have transport plans ready.
:::

## Privacy

Use a private room. Headphones reduce echo and protect others from hearing your health information.

## Afterward

Confirm next steps in the portal message center and schedule in-person labs if ordered.`,
    },
    es: {
      title: "Consejos para visitas de telesalud",
      description: "Prepárese para una cita por video o teléfono productiva.",
      body: `## Antes de la visita

- Pruebe cámara, micrófono e inicio de sesión 15 minutos antes
- Siéntese en lugar tranquilo y bien iluminado
- Tenga lista de medicamentos, temperaturas y fotos de erupciones listas
- Sepa nombre y dirección de farmacia para recetas electrónicas

## Durante la llamada

Hable claro y muestre áreas afectadas a la cámara cuando pidan. Telesalud funciona bien para seguimientos, revisiones de medicamentos y muchas visitas de salud mental.

## Limitaciones

Emergencias, exámenes físicos y algunas pruebas aún requieren presencial. Pregunte qué no se puede hacer virtualmente.

:::warning
Si empeoran síntomas durante video visita, pueden dirigirlo a urgencias — tenga plan de transporte.
:::

## Privacidad

Use habitación privada. Audífonos reducen eco y protegen a otros de escuchar su información.

## Después

Confirme siguientes pasos en el portal y programe laboratorios presenciales si los ordenaron.`,
    },
  },
  {
    id: "medication-adherence-strategies",
    category: "Medication Safety",
    readingTime: "7 min",
    en: {
      title: "Medication Adherence Strategies",
      description: "Tools and habits to take medicines as prescribed.",
      body: `## Why Adherence Matters

Skipping doses or stopping early can cause relapse, resistance, or hospitalization — especially for blood pressure, diabetes, and infection treatments.

## Practical Tools

- **Pill organizer** — weekly boxes with AM/PM slots
- **Phone alarms** — label each with drug name
- **Pharmacy auto-refill** — reduces gaps
- **Blister packs** — some pharmacies pre-sort by dose time

## Tie to Daily Routines

Link medicines to brushing teeth, meals, or bedtime so the habit stacks on something you already do.

:::info
If cost or side effects block adherence, tell your clinician — alternatives exist.
:::

## Travel and Sick Days

Pack extra doses in carry-on luggage. Ask your doctor for sick-day rules for insulin, blood pressure, or diuretics.

## Tracking

Use a simple log or app for "as needed" medicines so you do not exceed daily limits.`,
    },
    es: {
      title: "Estrategias para adherencia a medicamentos",
      description: "Herramientas y hábitos para tomar medicamentos según receta.",
      body: `## Por qué importa la adherencia

Omitir dosis o suspender antes puede causar recaída, resistencia u hospitalización — especialmente en presión, diabetes e infecciones.

## Herramientas prácticas

- **Organizador de pastillas** — cajas semanales AM/PM
- **Alarmas del teléfono** — etiquete con nombre del medicamento
- **Resurtido automático** — reduce huecos
- **Blísteres** — algunas farmacias preordenan por horario

## Enlace a rutinas diarias

Asocie medicamentos con cepillado, comidas o dormir para anclar el hábito.

:::info
Si costo o efectos secundarios bloquean adherencia, dígalo al clínico — hay alternativas.
:::

## Viajes y días de enfermedad

Lleve dosis extra en equipaje de mano. Pregunte reglas para insulina, presión o diuréticos en días de enfermedad.

## Seguimiento

Use registro simple o app para medicamentos "según necesidad" y no exceder límites diarios.`,
    },
  },
  {
    id: "when-to-call-your-doctor",
    category: "Emergency",
    readingTime: "6 min",
    en: {
      title: "When to Call Your Doctor vs Urgent Care vs 911",
      description: "A simple decision guide for non-emergency symptoms.",
      body: `## Call 911 or Go to ER

- Chest pain or pressure
- Trouble breathing
- Stroke signs (FAST: face, arm, speech, time)
- Severe bleeding or unconsciousness
- Suicidal thoughts with a plan

## Urgent Care (Same Day)

- Sprains, minor cuts needing stitches
- Fever without severe distress in otherwise healthy adults
- Urinary burning if you cannot reach your doctor
- Mild asthma flare with inhaler not helping after one hour

## Call Your Doctor's Office

- Medication side effects
- Worsening chronic condition
- Test result questions
- Referrals and preventive scheduling

:::info
Many clinics offer nurse triage lines — describe symptoms and they advise timing.
:::

## When Unsure

Err toward safer care. It is OK to go to ER; it is also OK to call 911 for guidance.`,
    },
    es: {
      title: "Cuándo llamar al médico vs urgencias vs 911",
      description: "Guía simple para síntomas no emergentes.",
      body: `## Llame 911 o vaya a emergencias

- Dolor u opresión de pecho
- Dificultad para respirar
- Signos de ACV (FAST: cara, brazo, habla, tiempo)
- Sangrado severo o inconsciencia
- Pensamientos suicidas con plan

## Atención urgente (mismo día)

- Esguinces, cortes menores que necesitan puntos
- Fiebre sin angustia severa en adultos sanos
- Ardor al orinar si no puede contactar al médico
- Brote leve de asma si inhalador no ayuda tras una hora

## Llame al consultorio

- Efectos secundarios de medicamentos
- Empeoramiento de condición crónica
- Preguntas sobre resultados
- Referencias y citas preventivas

:::info
Muchas clínicas tienen línea de enfermería — describa síntomas y orientan timing.
:::

## Si no está seguro

Prefiera atención más segura. Está bien ir a emergencias; también llamar al 911 para orientación.`,
    },
  },
  {
    id: "patient-portal-basics",
    category: "Healthcare Navigation",
    readingTime: "6 min",
    en: {
      title: "Patient Portal Basics",
      description: "Access results, messages, and refills online.",
      body: `## What Portals Do

Most clinics offer secure websites or apps to:

- View lab and imaging results
- Message your care team
- Request prescription refills
- Schedule appointments
- Download visit summaries

## Getting Started

Ask front desk for signup instructions. You may need email verification and a one-time activation code from your visit paperwork.

## Reading Results Early

Results may appear before your doctor reviews them. Abnormal flags are not always urgent — but note questions for your follow-up.

:::warning
Portals are not for emergencies. Call 911 or go to ER for immediate danger.
:::

## Messaging Etiquette

Include one clear question per message, your pharmacy if requesting refills, and allow 1–3 business days for replies.

## Privacy and Access

Use strong passwords. Proxy access for caregivers may require separate authorization forms.`,
    },
    es: {
      title: "Conceptos básicos del portal del paciente",
      description: "Acceda a resultados, mensajes y resurtidos en línea.",
      body: `## Qué hacen los portales

La mayoría de clínicas ofrecen sitios o apps seguros para:

- Ver resultados de laboratorio e imágenes
- Enviar mensajes al equipo
- Solicitar resurtidos
- Programar citas
- Descargar resúmenes de visita

## Primeros pasos

Pida instrucciones en recepción. Puede necesitar verificación de correo y código de activación del paperwork de la visita.

## Leer resultados temprano

Los resultados pueden aparecer antes de que el médico los revise. Banderas anormales no siempre son urgentes — anote preguntas para seguimiento.

:::warning
Los portales no son para emergencias. Llame 911 o vaya a emergencias ante peligro inmediato.
:::

## Etiqueta de mensajes

Incluya una pregunta clara, farmacia si pide resurtidos y espere 1–3 días hábiles de respuesta.

## Privacidad y acceso

Use contraseñas fuertes. Acceso de cuidadores puede requerir formularios de autorización separados.`,
    },
  },
  {
    id: "health-literacy-for-caregivers",
    category: "Healthcare Navigation",
    readingTime: "7 min",
    en: {
      title: "Health Literacy for Caregivers",
      description: "Support a loved one's care while respecting their autonomy.",
      body: `## Your Role

Caregivers translate instructions, track appointments, and advocate — but the patient (or legal proxy) makes final decisions unless incapacitated.

## Prepare for Appointments Together

- List current medicines and allergies
- Write top three concerns in the patient's words
- Take notes or ask permission to record

## Proxy Access

Hospitals require HIPAA authorization for you to receive medical information. Complete forms before emergencies when possible.

:::info
Bring durable power of attorney for healthcare documents to major visits if you are the decision-maker.
:::

## Avoid Burnout

Share duties with family, use respite programs, and keep your own medical appointments.

## When Values Conflict

Focus on what matters to the patient — mobility, pain control, independence — not only what seems medically aggressive.`,
    },
    es: {
      title: "Alfabetización en salud para cuidadores",
      description: "Apoye el cuidado de un ser querido respetando su autonomía.",
      body: `## Su rol

Los cuidadores traducen instrucciones, rastrean citas y abogan — pero el paciente (o apoderado legal) decide salvo incapacidad.

## Preparen citas juntos

- Liste medicamentos y alergias actuales
- Escriban tres preocupaciones principales con palabras del paciente
- Tomen notas o pidan permiso para grabar

## Acceso proxy

Hospitales requieren autorización HIPAA para darle información médica. Complete formularios antes de emergencias cuando sea posible.

:::info
Lleve documentos de poder notarial para salud en visitas importantes si es quien decide.
:::

## Evite agotamiento

Comparta tareas, use programas de respiro y mantenga sus propias citas médicas.

## Cuando hay conflicto de valores

Enfóquese en lo que importa al paciente — movilidad, control del dolor, independencia — no solo lo médicamente agresivo.`,
    },
  },
  {
    id: "understanding-prior-authorization",
    category: "Insurance & Billing",
    readingTime: "7 min",
    en: {
      title: "Understanding Prior Authorization",
      description: "Why insurers require approval and how to speed the process.",
      body: `## What Prior Auth Is

Your insurer may require approval before paying for certain drugs, imaging, or procedures. The provider submits clinical reasons; the plan decides if criteria are met.

## Common Triggers

- Expensive brand drugs with generic alternatives
- Advanced imaging (MRI, PET)
- Elective surgeries
- Durable medical equipment

## Timeline

Decisions can take days to two weeks. Start early — ask your doctor's office to submit the same day they order the service.

:::warning
Starting treatment before approval may leave you with full cost if denied.
:::

## If Denied

You can appeal with additional documentation. Ask for the denial letter in writing and the reason code.

## Your Role

Sign release forms promptly, provide insurance cards at every visit, and follow up if you have not heard back within the stated window.`,
    },
    es: {
      title: "Entender la autorización previa",
      description: "Por qué los aseguradores exigen aprobación y cómo acelerar el proceso.",
      body: `## Qué es autorización previa

Su asegurador puede exigir aprobación antes de pagar ciertos medicamentos, imágenes o procedimientos. El proveedor envía razones clínicas; el plan decide si cumple criterios.

## Disparadores comunes

- Medicamentos de marca costosos con genéricos
- Imágenes avanzadas (RM, PET)
- Cirugías electivas
- Equipo médico durable

## Plazos

Decisiones pueden tardar días a dos semanas. Empiece pronto — pida que la oficina envíe el mismo día que ordenan el servicio.

:::warning
Iniciar tratamiento antes de aprobación puede dejarlo con costo total si rechazan.
:::

## Si rechazan

Puede apelar con documentación adicional. Pida carta de rechazo por escrito y código de razón.

## Su rol

Firme liberaciones pronto, entregue tarjeta de seguro en cada visita y haga seguimiento si no hay respuesta en el plazo indicado.`,
    },
  },
];

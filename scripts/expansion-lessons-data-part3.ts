import type { LessonSpec } from "./expansion-lessons-types";

export const EXPANSION_LESSONS_PART3: LessonSpec[] = [
  {
    id: "otc-drug-interactions",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "14 minutes",
    level: "intermediate",
    en: {
      title: "OTC Drug Interactions",
      description:
        "Learn how over-the-counter medicines can interact with prescriptions, supplements, and each other.",
      sidebarTitle: "OTC interactions",
      sidebarTips: [
        "Read every active ingredient on labels.",
        "Tell your pharmacist all medicines you take.",
        "Watch for duplicate pain relievers.",
        "Ask before combining new OTC products.",
      ],
      body: `## What Is It

Over-the-counter (OTC) drugs are medicines you can buy without a prescription — pain relievers, antihistamines, acid reducers, cough syrups, and more. An **interaction** happens when one substance changes how another works in your body. Interactions can make a medicine less effective, more toxic, or cause unexpected side effects. OTC products count: many serious interactions involve combinations people assume are harmless.

## How It Works

Interactions happen through several pathways. Some drugs compete for the same liver enzymes (especially CYP pathways), slowing or speeding metabolism. Others add similar effects — two sedating antihistamines can dangerously increase drowsiness. **Duplicate ingredients** are a common problem: cold medicine plus a pain reliever may both contain acetaminophen, raising liver risk. NSAIDs like ibuprofen can reduce kidney blood flow, especially when combined with certain blood pressure medicines or diuretics. St. John's wort and some supplements can weaken prescription drugs including birth control and antidepressants.

:::warning
Never assume "natural" or OTC means safe to combine. Herbal products and supplements are not always tested for interactions with prescription medicines.
:::

## Why It Matters

The FDA reports thousands of preventable adverse events each year from drug interactions. Older adults are at higher risk because they often take multiple medicines. Kidney and liver disease also change how drugs are processed. Pharmacists are trained to screen for interactions — but they can only help if they know your full medication list, including vitamins and occasional OTC use.

## What This Means for You

Before starting any new OTC product, read the **Drug Facts** label for active ingredients and warnings. Use one pharmacy when possible so records stay complete. Keep an updated list of prescriptions, OTC medicines, and supplements. If you take blood thinners, blood pressure medicines, diabetes drugs, or antidepressants, ask a pharmacist or clinician before adding OTC products.

:::info
Timing matters too: some interactions occur only when drugs are taken at the same time, while others persist for days. When in doubt, space products apart and get professional advice.
:::`,
    },
    es: {
      title: "Interacciones con medicamentos de venta libre",
      description:
        "Aprenda cómo los medicamentos OTC pueden interactuar con recetas, suplementos y entre sí.",
      sidebarTitle: "Interacciones OTC",
      sidebarTips: [
        "Lea cada ingrediente activo en las etiquetas.",
        "Informe al farmacéutico todos sus medicamentos.",
        "Evite duplicar analgésicos.",
        "Pregunte antes de combinar productos OTC nuevos.",
      ],
      body: `## ¿Qué es?

Los medicamentos de venta libre (OTC) se compran sin receta — analgésicos, antihistamínicos, antiácidos, jarabes para la tos y más. Una **interacción** ocurre cuando una sustancia cambia cómo actúa otra en el cuerpo. Puede reducir eficacia, aumentar toxicidad o causar efectos inesperados. Los OTC cuentan: muchas interacciones graves involucran combinaciones que parecen inofensivas.

## ¿Cómo funciona?

Las interacciones ocurren por varias vías. Algunos fármacos compiten por las mismas enzimas hepáticas, alterando el metabolismo. Otros suman efectos similares — dos antihistamínicos sedantes pueden aumentar peligrosamente la somnolencia. Los **ingredientes duplicados** son frecuentes: un medicamento para resfriado más un analgésico pueden contener ambos acetaminofén, elevando el riesgo hepático. Los AINE como ibuprofeno pueden reducir el flujo sanguíneo renal, especialmente con ciertos antihipertensivos o diuréticos. La hierba de San Juan y algunos suplementos pueden debilitar recetas como anticonceptivos y antidepresivos.

:::warning
No asuma que "natural" u OTC significa seguro de combinar. Los productos herbales no siempre se prueban con medicamentos recetados.
:::

## ¿Por qué importa?

La FDA reporta miles de eventos adversos prevenibles por interacciones cada año. Los adultos mayores tienen mayor riesgo por tomar múltiples medicamentos. La enfermedad renal o hepática también cambia el procesamiento. Los farmacéuticos pueden detectar interacciones — pero solo si conocen su lista completa, incluyendo vitaminas y OTC ocasionales.

## Qué significa para usted

Antes de un producto OTC nuevo, lea la etiqueta **Drug Facts** buscando ingredientes activos y advertencias. Use una farmacia cuando sea posible. Mantenga una lista actualizada de recetas, OTC y suplementos. Si toma anticoagulantes, antihipertensivos, medicamentos para diabetes o antidepresivos, consulte antes de añadir OTC.

:::info
El momento también importa: algunas interacciones ocurren solo al tomarse juntos; otras duran días. En duda, separe los productos y pida consejo profesional.
:::`,
    },
    quiz: {
      enTitle: "OTC Drug Interactions Quiz",
      esTitle: "Cuestionario: Interacciones OTC",
      enQuestions: [
        {
          q: "Why is checking active ingredients on multiple OTC labels important?",
          options: [
            "Brands always use different ingredients",
            "Duplicate ingredients can exceed safe daily limits",
            "Only prescription drugs have active ingredients",
            "Labels are optional for adults",
          ],
          answer: "B",
          explanation:
            "Multiple OTC products may share the same active drug (e.g., acetaminophen), pushing total dose past safe limits. Brands often differ, and both prescriptions and OTC products list actives — labels are required, not optional.",
        },
        {
          q: "Who is especially helpful for screening drug interactions?",
          options: [
            "A pharmacist with your full medication list",
            "Social media health forums",
            "Only the drug manufacturer hotline",
            "No one — interactions are rare",
          ],
          answer: "A",
          explanation:
            "Pharmacists are trained to identify interactions when they know all medicines and supplements you use. Forums lack your personal history; manufacturers cannot review your full regimen, and interactions are common enough to warrant screening.",
        },
        {
          q: "How can NSAIDs like ibuprofen interact with some blood pressure medicines?",
          options: [
            "They always lower blood pressure further",
            "They may reduce kidney blood flow and affect blood pressure control",
            "They have no effect on kidneys",
            "They replace the need for blood pressure drugs",
          ],
          answer: "B",
          explanation:
            "NSAIDs can reduce prostaglandin-mediated kidney blood flow, which may worsen blood pressure control or kidney function in susceptible people. They do not reliably lower BP, are not kidney-neutral, and never replace prescribed therapy.",
        },
        {
          q: "Why tell providers about herbal supplements when taking prescriptions?",
          options: [
            "Supplements never interact with drugs",
            "Some supplements like St. John's wort can alter prescription drug levels",
            "Only vitamins matter, not herbs",
            "Providers already know every supplement you take",
          ],
          answer: "B",
          explanation:
            "Herbal products can induce or inhibit drug metabolism — St. John's wort is a well-known example. Supplements can interact; herbs are not exempt; providers do not automatically know what you take unless you tell them.",
        },
        {
          q: "What should you do before adding a new OTC medicine if you take several prescriptions?",
          options: [
            "Assume OTC is always safe",
            "Ask a pharmacist or clinician to review for interactions",
            "Double all prescription doses instead",
            "Stop all prescriptions for one day",
          ],
          answer: "B",
          explanation:
            "Professional review catches interaction risks with your specific regimen. OTC is not automatically safe with prescriptions; changing doses or stopping prescribed drugs without guidance is dangerous.",
        },
      ],
      esQuestions: [
        {
          q: "¿Por qué revisar ingredientes activos en varias etiquetas OTC?",
          options: [
            "Las marcas siempre usan ingredientes distintos",
            "Ingredientes duplicados pueden exceder límites diarios seguros",
            "Solo las recetas tienen ingredientes activos",
            "Las etiquetas son opcionales para adultos",
          ],
          answer: "B",
          explanation:
            "Varios productos OTC pueden compartir el mismo fármaco activo y superar límites seguros. Las marcas varían, y recetas y OTC listan activos — las etiquetas son obligatorias, no opcionales.",
        },
        {
          q: "¿Quién es especialmente útil para detectar interacciones?",
          options: [
            "Un farmacéutico con su lista completa de medicamentos",
            "Foros de salud en redes sociales",
            "Solo la línea del fabricante",
            "Nadie — las interacciones son raras",
          ],
          answer: "A",
          explanation:
            "Los farmacéuticos están capacitados para identificar interacciones con su historial completo. Los foros no tienen su contexto; los fabricantes no revisan todo su régimen, y las interacciones son lo bastante comunes para merecer revisión.",
        },
        {
          q: "¿Cómo pueden interactuar los AINE con algunos antihipertensivos?",
          options: [
            "Siempre bajan más la presión",
            "Pueden reducir flujo renal y afectar el control de presión",
            "No afectan los riñones",
            "Reemplazan medicamentos para presión",
          ],
          answer: "B",
          explanation:
            "Los AINE pueden reducir el flujo sanguíneo renal y empeorar el control de presión o función renal en personas susceptibles. No bajan la presión de forma confiable ni reemplazan la terapia recetada.",
        },
        {
          q: "¿Por qué informar suplementos herbales al tomar recetas?",
          options: [
            "Los suplementos nunca interactúan",
            "Algunos como la hierba de San Juan alteran niveles de recetas",
            "Solo importan las vitaminas",
            "Los proveedores ya saben todo lo que toma",
          ],
          answer: "B",
          explanation:
            "Los productos herbales pueden alterar el metabolismo de fármacos. Los suplementos sí interactúan; las hierbas no están exentas; los proveedores no saben lo que toma a menos que se lo diga.",
        },
        {
          q: "¿Qué hacer antes de añadir un OTC si toma varias recetas?",
          options: [
            "Asumir que OTC siempre es seguro",
            "Pedir al farmacéutico o clínico revisar interacciones",
            "Duplicar todas las dosis de receta",
            "Suspender todas las recetas un día",
          ],
          answer: "B",
          explanation:
            "La revisión profesional detecta riesgos con su régimen específico. OTC no es automáticamente seguro con recetas; cambiar dosis o suspender medicamentos sin guía es peligroso.",
        },
      ],
    },
  },
  {
    id: "antibiotic-stewardship",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "13 minutes",
    level: "beginner",
    en: {
      title: "Antibiotic Stewardship",
      description: "Understand when antibiotics help, when they do not, and how to use them responsibly.",
      sidebarTitle: "Smart antibiotic use",
      sidebarTips: [
        "Antibiotics do not treat viruses.",
        "Finish the course your clinician prescribes.",
        "Never share or save leftover pills.",
        "Ask if watchful waiting is an option.",
      ],
      body: `## What Is It

**Antibiotic stewardship** means using antibiotics only when they are needed, choosing the right drug and duration, and taking them exactly as directed. Antibiotics kill bacteria or stop them from growing. They do not work against viruses — the cause of most colds, flu, bronchitis, and many sore throats. Misuse drives **antibiotic resistance**, when bacteria evolve so medicines no longer work.

## How It Works

When you take an antibiotic appropriately, it targets susceptible bacteria causing your infection. Stopping early or using leftover pills for a new illness can leave stronger bacteria behind. Broad-spectrum antibiotics affect more than the infection site, sometimes disrupting normal gut bacteria and leading to **Clostridioides difficile** (C. diff) diarrhea. Healthcare systems track resistance patterns locally so doctors can prescribe drugs that still work in your community.

:::warning
Never pressure a clinician for antibiotics for a viral illness. Unnecessary antibiotics expose you to side effects without benefit and contribute to resistance that harms everyone.
:::

## Why It Matters

The CDC calls antibiotic resistance one of the top public health threats. Resistant infections are harder to treat, require stronger medicines, longer hospital stays, and can be fatal. Children and older adults are vulnerable. Stewardship protects you today and preserves effective treatments for future generations — including for surgeries, cancer care, and serious infections.

## What This Means for You

If prescribed an antibiotic, take every dose on schedule even if you feel better. Do not save pills for later or share them. Ask your clinician whether your illness is bacterial or viral. For some conditions — like uncomplicated sinusitis or ear infections — watchful waiting may be appropriate. Report severe diarrhea during or after antibiotics promptly.

:::info
Prevention also matters: vaccines, hand hygiene, and safe food handling reduce infections that need antibiotics in the first place.
:::`,
    },
    es: {
      title: "Uso responsable de antibióticos",
      description: "Entienda cuándo los antibióticos ayudan, cuándo no, y cómo usarlos de forma responsable.",
      sidebarTitle: "Antibióticos inteligentes",
      sidebarTips: [
        "Los antibióticos no tratan virus.",
        "Complete el tratamiento que le indiquen.",
        "No comparta ni guarde pastillas sobrantes.",
        "Pregunte si puede observar y esperar.",
      ],
      body: `## ¿Qué es?

El **uso responsable de antibióticos** significa usarlos solo cuando hacen falta, elegir el fármaco y la duración correctos, y tomarlos exactamente como se indica. Los antibióticos matan bacterias o impiden su crecimiento. No funcionan contra virus — causa de la mayoría de resfriados, gripe, bronquitis y muchos dolores de garganta. El mal uso impulsa la **resistencia antibiótica**, cuando las bacterias evolucionan y los medicamentos dejan de funcionar.

## ¿Cómo funciona?

Con un antibiótico apropiado, ataca las bacterias susceptibles de su infección. Suspender antes de tiempo o usar pastillas guardadas puede dejar bacterias más resistentes. Los antibióticos de amplio espectro afectan más que el sitio infectado, a veces alterando bacterias intestinales normales y provocando diarrea por **Clostridioides difficile** (C. diff). Los sistemas de salud rastrean patrones de resistencia locales para recetar fármacos que aún funcionen en su comunidad.

:::warning
No presione a un clínico por antibióticos ante una enfermedad viral. Los antibióticos innecesarios exponen a efectos secundarios sin beneficio y contribuyen a la resistencia que afecta a todos.
:::

## ¿Por qué importa?

Los CDC consideran la resistencia antibiótica una de las principales amenazas de salud pública. Las infecciones resistentes son más difíciles de tratar, requieren medicamentos más fuertes, hospitalizaciones más largas y pueden ser mortales. Niños y adultos mayores son vulnerables. El uso responsable protege hoy y preserva tratamientos efectivos para el futuro — incluyendo cirugías, cáncer e infecciones graves.

## Qué significa para usted

Si le recetan un antibiótico, tome cada dosis a tiempo aunque se sienta mejor. No guarde pastillas ni las comparta. Pregunte si su enfermedad es bacteriana o viral. En algunas condiciones — como sinusitis o otitis sin complicaciones — puede ser apropiado observar y esperar. Reporte diarrea severa durante o después de antibióticos de inmediato.

:::info
La prevención también importa: vacunas, higiene de manos y manipulación segura de alimentos reducen infecciones que necesitan antibióticos.
:::`,
    },
    quiz: {
      enTitle: "Antibiotic Stewardship Quiz",
      esTitle: "Cuestionario: Uso responsable de antibióticos",
      enQuestions: [
        {
          q: "Antibiotics are effective against which type of infection?",
          options: [
            "Most common colds caused by viruses",
            "Bacterial infections when appropriately prescribed",
            "All sore throats regardless of cause",
            "Seasonal allergies",
          ],
          answer: "B",
          explanation:
            "Antibiotics target bacteria, not viruses or allergies. Most colds and many sore throats are viral; only specific bacterial causes warrant antibiotics after proper evaluation.",
        },
        {
          q: "Why is stopping antibiotics early a concern?",
          options: [
            "It always causes instant resistance in the patient",
            "It may not fully clear the infection and can select harder-to-treat bacteria",
            "It makes the medicine work better later",
            "It has no effect on treatment outcomes",
          ],
          answer: "B",
          explanation:
            "Incomplete treatment can leave surviving bacteria and contribute to resistance. It does not instantly make you permanently resistant, does not improve future efficacy, and clearly affects outcomes.",
        },
        {
          q: "What is a serious side effect linked to antibiotic use?",
          options: [
            "C. difficile colitis",
            "Improved vision",
            "Permanent immunity to all infections",
            "Lower cholesterol",
          ],
          answer: "A",
          explanation:
            "Antibiotics can disrupt gut flora and allow C. diff overgrowth, causing severe diarrhea. They do not improve vision, grant broad immunity, or lower cholesterol.",
        },
        {
          q: "What should you do with leftover antibiotic pills?",
          options: [
            "Save them for the next cold",
            "Share with a family member with similar symptoms",
            "Dispose of them safely per pharmacy guidance — do not self-treat later",
            "Take double dose to finish the bottle faster",
          ],
          answer: "C",
          explanation:
            "Leftover antibiotics may be the wrong drug, dose, or duration for a new illness. Saving, sharing, or doubling doses without medical direction is unsafe.",
        },
        {
          q: "Why does the CDC emphasize antibiotic stewardship?",
          options: [
            "Antibiotics are no longer used in hospitals",
            "Resistant bacteria make infections harder and sometimes impossible to treat",
            "Viruses are becoming resistant to antibiotics",
            "Stewardship means avoiding all medical care",
          ],
          answer: "B",
          explanation:
            "Resistance limits treatment options for serious bacterial infections. Antibiotics remain essential in hospitals; viruses do not become antibiotic-resistant — bacteria do; stewardship promotes appropriate use, not avoiding care.",
        },
      ],
      esQuestions: [
        {
          q: "¿Contra qué tipo de infección son efectivos los antibióticos?",
          options: [
            "La mayoría de resfriados por virus",
            "Infecciones bacterianas cuando se recetan apropiadamente",
            "Todos los dolores de garganta sin importar la causa",
            "Alergias estacionales",
          ],
          answer: "B",
          explanation:
            "Los antibióticos atacan bacterias, no virus ni alergias. La mayoría de resfriados y muchas faringitis son virales; solo causas bacterianas específicas justifican antibióticos tras evaluación adecuada.",
        },
        {
          q: "¿Por qué preocupa suspender antibióticos antes de tiempo?",
          options: [
            "Siempre causa resistencia instantánea en el paciente",
            "Puede no eliminar la infección y seleccionar bacterias más difíciles de tratar",
            "Hace que el medicamento funcione mejor después",
            "No afecta los resultados del tratamiento",
          ],
          answer: "B",
          explanation:
            "El tratamiento incompleto puede dejar bacterias sobrevivientes y contribuir a resistencia. No causa resistencia permanente instantánea ni mejora la eficacia futura, y sí afecta los resultados.",
        },
        {
          q: "¿Qué efecto secundario grave se vincula con antibióticos?",
          options: [
            "Colitis por C. difficile",
            "Mejor visión",
            "Inmunidad permanente a todas las infecciones",
            "Colesterol más bajo",
          ],
          answer: "A",
          explanation:
            "Los antibióticos pueden alterar la flora intestinal y permitir proliferación de C. diff con diarrea severa. No mejoran la visión, no dan inmunidad amplia ni bajan el colesterol.",
        },
        {
          q: "¿Qué hacer con pastillas antibióticas sobrantes?",
          options: [
            "Guardarlas para el próximo resfriado",
            "Compartirlas con un familiar con síntomas similares",
            "Desecharlas de forma segura según indicación — no autotratarse después",
            "Tomar doble dosis para terminar el frasco más rápido",
          ],
          answer: "C",
          explanation:
            "Los sobrantes pueden ser el fármaco, dosis o duración incorrectos para una nueva enfermedad. Guardar, compartir o duplicar dosis sin indicación médica es inseguro.",
        },
        {
          q: "¿Por qué los CDC enfatizan el uso responsable de antibióticos?",
          options: [
            "Los antibióticos ya no se usan en hospitales",
            "Las bacterias resistentes hacen las infecciones más difíciles o imposibles de tratar",
            "Los virus se vuelven resistentes a antibióticos",
            "Significa evitar toda atención médica",
          ],
          answer: "B",
          explanation:
            "La resistencia limita opciones para infecciones bacterianas graves. Los antibióticos siguen siendo esenciales en hospitales; los virus no se vuelven resistentes a antibióticos — las bacterias sí; el uso responsable promueve el uso apropiado, no evitar la atención.",
        },
      ],
    },
  },
  {
    id: "drug-food-interactions",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "13 minutes",
    level: "intermediate",
    en: {
      title: "Drug-Food Interactions",
      description: "Discover how foods and drinks can change medicine absorption, effectiveness, and safety.",
      sidebarTitle: "Food & medicine",
      sidebarTips: [
        "Read medication labels for food warnings.",
        "Grapefruit can affect many drugs — ask first.",
        "Take some medicines with food, others without.",
        "Limit alcohol with most prescriptions.",
      ],
      body: `## What Is It

A **drug-food interaction** occurs when something you eat or drink changes how a medicine is absorbed, metabolized, or acts in the body. Food can slow or speed absorption, bind to a drug in the stomach, or affect liver enzymes. Common examples include grapefruit juice inhibiting enzymes that process statins and some blood pressure medicines, and vitamin K–rich foods affecting warfarin consistency.

## How It Works

Some medicines should be taken **with food** to reduce stomach upset — metformin and many NSAIDs are examples. Others work best on an **empty stomach** because food blocks absorption — certain thyroid hormones and some antibiotics fall in this group. Alcohol adds sedation with opioids, benzodiazepines, and sleep aids, and stresses the liver with acetaminophen. Tyramine-rich foods interact with older MAOI antidepressants. Calcium and iron supplements can bind levothyroxine if taken together.

:::warning
Grapefruit and some citrus products can raise blood levels of several medications to unsafe ranges. If your medicine label mentions grapefruit, avoid it unless your clinician says otherwise.
:::

## Why It Matters

Food interactions can make a drug too weak (treatment failure) or too strong (toxicity). People on warfarin, transplant medicines, or narrow therapeutic index drugs need consistent dietary patterns. Timing matters as much as the food itself — separating doses from meals or supplements by the recommended interval improves reliability.

## What This Means for You

Read prescription and OTC labels for food and alcohol guidance. Ask your pharmacist whether to take new medicines with meals. Keep dietary habits steady when on warfarin; sudden large changes in leafy greens can shift INR. Do not start restrictive diets or heavy supplement use without discussing your medication list with a clinician.

:::info
A food diary can help if you notice new symptoms after meals and medicines overlap — share it with your care team rather than guessing which interaction is to blame.
:::`,
    },
    es: {
      title: "Interacciones medicamento-alimento",
      description:
        "Descubra cómo alimentos y bebidas pueden cambiar la absorción, eficacia y seguridad de los medicamentos.",
      sidebarTitle: "Alimentos y medicinas",
      sidebarTips: [
        "Lea etiquetas de medicamentos sobre alimentos.",
        "El pomelo afecta muchos fármacos — pregunte primero.",
        "Algunos medicamentos van con comida, otros sin.",
        "Limite alcohol con la mayoría de recetas.",
      ],
      body: `## ¿Qué es?

Una **interacción medicamento-alimento** ocurre cuando algo que come o bebe cambia cómo un medicamento se absorbe, metaboliza o actúa. Los alimentos pueden retrasar o acelerar la absorción, unirse al fármaco en el estómago o afectar enzimas hepáticas. Ejemplos comunes: el jugo de pomelo inhibe enzimas que procesan estatinas y algunos antihipertensivos, y alimentos ricos en vitamina K afectan la consistencia de la warfarina.

## ¿Cómo funciona?

Algunos medicamentos deben tomarse **con comida** para reducir molestias gástricas — metformina y muchos AINE son ejemplos. Otros funcionan mejor en **ayunas** porque la comida bloquea la absorción — ciertas hormonas tiroideas y algunos antibióticos. El alcohol suma sedación con opioides, benzodiacepinas y inductores del sueño, y estresa el hígado con acetaminofén. Alimentos ricos en tiramina interactúan con IMAO antiguos. Calcio y hierro pueden unirse a levotiroxina si se toman juntos.

:::warning
El pomelo y algunos cítricos pueden elevar niveles sanguíneos de varios medicamentos a rangos inseguros. Si la etiqueta menciona pomelo, evítelo salvo indicación contraria de su clínico.
:::

## ¿Por qué importa?

Las interacciones alimentarias pueden debilitar un fármaco (fallo terapéutico) o intensificarlo (toxicidad). Quienes toman warfarina, medicamentos de trasplante o fármacos de índice terapéutico estrecho necesitan patrones dietéticos consistentes. El momento importa tanto como el alimento — separar dosis de comidas o suplementos mejora la fiabilidad.

## Qué significa para usted

Lea recetas y etiquetas OTC sobre alimentos y alcohol. Pregunte al farmacéutico si tomar nuevos medicamentos con comidas. Mantenga hábitos dietéticos estables con warfarina; cambios bruscos en verduras de hoja verde pueden alterar el INR. No inicie dietas restrictivas o suplementos intensivos sin revisar su lista de medicamentos con un clínico.

:::info
Un diario alimentario puede ayudar si nota síntomas nuevos cuando comidas y medicinas coinciden — compártalo con su equipo en lugar de adivinar la interacción.
:::`,
    },
    quiz: {
      enTitle: "Drug-Food Interactions Quiz",
      esTitle: "Cuestionario: Interacciones medicamento-alimento",
      enQuestions: [
        {
          q: "Why can grapefruit juice be problematic with certain medicines?",
          options: [
            "It always makes medicines work faster safely",
            "It can inhibit enzymes and raise drug blood levels",
            "It only affects vitamins, not prescriptions",
            "It has no clinical significance",
          ],
          answer: "B",
          explanation:
            "Grapefruit inhibits intestinal CYP3A4, increasing absorption of some drugs to potentially toxic levels. It does not universally speed drugs safely, affects many prescriptions, and has well-documented clinical effects.",
        },
        {
          q: "Why might levothyroxine be taken on an empty stomach?",
          options: [
            "Food always improves thyroid absorption",
            "Food and minerals like calcium can reduce absorption",
            "It must always be taken with a high-fat meal",
            "Timing never matters for thyroid medicine",
          ],
          answer: "B",
          explanation:
            "Food, calcium, and iron can interfere with levothyroxine absorption, so consistent fasting timing is often recommended. Food does not reliably improve absorption; high-fat meals are not required; timing does matter.",
        },
        {
          q: "What dietary approach helps people on warfarin?",
          options: [
            "Completely avoid all vitamin K forever",
            "Keep vitamin K intake fairly consistent day to day",
            "Double leafy greens weekly for health",
            "Stop warfarin when eating salad",
          ],
          answer: "B",
          explanation:
            "Warfarin dosing is adjusted to consistent vitamin K intake — sudden large changes matter more than moderate steady amounts. Avoiding all vitamin K is unnecessary; erratic doubling or stopping warfarin around meals is unsafe.",
        },
        {
          q: "Why limit alcohol with acetaminophen?",
          options: [
            "Alcohol improves liver detoxification of acetaminophen",
            "Both can stress the liver and increase injury risk",
            "Alcohol has no liver effects",
            "Only children are at risk",
          ],
          answer: "B",
          explanation:
            "Alcohol and acetaminophen both burden hepatic pathways; combined use raises liver injury risk. Alcohol does not protect the liver, does have hepatic effects, and adults are also at risk.",
        },
        {
          q: "What should you do when starting a medicine with food warnings on the label?",
          options: [
            "Ignore the label if you feel fine",
            "Follow label directions and ask a pharmacist if unclear",
            "Always take every drug with a full meal",
            "Only take medicines with grapefruit juice",
          ],
          answer: "B",
          explanation:
            "Labels reflect how food affects that specific drug. Ignoring guidance risks under- or overdosing; not every drug needs food; grapefruit is contraindicated for many medicines, not a universal aid.",
        },
      ],
      esQuestions: [
        {
          q: "¿Por qué el jugo de pomelo puede ser problemático con ciertos medicamentos?",
          options: [
            "Siempre hace que los medicamentos funcionen más rápido de forma segura",
            "Puede inhibir enzimas y elevar niveles sanguíneos del fármaco",
            "Solo afecta vitaminas, no recetas",
            "No tiene significado clínico",
          ],
          answer: "B",
          explanation:
            "El pomelo inhibe CYP3A4 intestinal, aumentando la absorción de algunos fármacos a niveles potencialmente tóxicos. No acelera todos los medicamentos de forma segura, afecta muchas recetas y tiene efectos clínicos documentados.",
        },
        {
          q: "¿Por qué la levotiroxina puede tomarse en ayunas?",
          options: [
            "La comida siempre mejora la absorción tiroidea",
            "La comida y minerales como calcio pueden reducir la absorción",
            "Debe tomarse siempre con comida alta en grasa",
            "El momento nunca importa para medicina tiroidea",
          ],
          answer: "B",
          explanation:
            "La comida, calcio e hierro pueden interferir con la levotiroxina, por eso a menudo se recomienda tomarla en ayunas de forma consistente. La comida no mejora la absorción de forma confiable; las comidas grasas no son obligatorias; el momento sí importa.",
        },
        {
          q: "¿Qué enfoque dietético ayuda a quienes toman warfarina?",
          options: [
            "Evitar toda vitamina K para siempre",
            "Mantener ingesta de vitamina K bastante consistente día a día",
            "Duplicar verduras de hoja semanalmente",
            "Suspender warfarina al comer ensalada",
          ],
          answer: "B",
          explanation:
            "La dosis de warfarina se ajusta a ingesta constante de vitamina K — los cambios bruscos importan más que cantidades moderadas y estables. Evitar toda vitamina K no es necesario; duplicar o suspender warfarina alrededor de comidas es inseguro.",
        },
        {
          q: "¿Por qué limitar alcohol con acetaminofén?",
          options: [
            "El alcohol mejora la detoxificación hepática del acetaminofén",
            "Ambos pueden estresar el hígado y aumentar riesgo de lesión",
            "El alcohol no tiene efectos hepáticos",
            "Solo los niños están en riesgo",
          ],
          answer: "B",
          explanation:
            "El alcohol y el acetaminofén cargan vías hepáticas; el uso combinado aumenta el riesgo de lesión hepática. El alcohol no protege el hígado, sí tiene efectos hepáticos, y los adultos también están en riesgo.",
        },
        {
          q: "¿Qué hacer al iniciar un medicamento con advertencias alimentarias en la etiqueta?",
          options: [
            "Ignorar la etiqueta si se siente bien",
            "Seguir las indicaciones y preguntar al farmacéutico si no está claro",
            "Tomar siempre todo fármaco con comida completa",
            "Tomar todos los medicamentos solo con jugo de pomelo",
          ],
          answer: "B",
          explanation:
            "Las etiquetas reflejan cómo la comida afecta ese fármaco específico. Ignorar la guía arriesga sub o sobredosis; no todo fármaco necesita comida; el pomelo está contraindicado para muchos medicamentos, no es ayuda universal.",
        },
      ],
    },
  },
  {
    id: "micronutrient-deficiencies",
    category: "Nutrition",
    categoryId: "nutrition",
    duration: "15 minutes",
    level: "beginner",
    en: {
      title: "Micronutrient Deficiencies",
      description:
        "Learn about common vitamin and mineral shortfalls, who is at risk, and how they are identified.",
      sidebarTitle: "Vitamins & minerals",
      sidebarTips: [
        "Eat varied whole foods first.",
        "Some groups need extra vitamin D or B12.",
        "Get tested before megadosing supplements.",
        "Malabsorption conditions raise deficiency risk.",
      ],
      body: `## What Is It

**Micronutrients** are vitamins and minerals your body needs in small amounts for immunity, bone health, nerve function, oxygen transport, and hundreds of metabolic reactions. A **deficiency** means intake or absorption is too low to maintain healthy levels. Common deficiencies in the U.S. include vitamin D, iron (leading to anemia), vitamin B12 (especially in older adults and vegans), folate in pregnancy, and iodine in limited diets.

## How It Works

You get micronutrients from food — dairy and sunlight exposure help vitamin D; red meat and legumes provide iron; B12 comes mainly from animal products or fortified foods. Absorption depends on gut health: celiac disease, bariatric surgery, and chronic PPI use can impair uptake. Requirements change with age, pregnancy, and medical conditions. Blood tests — such as ferritin for iron stores, 25-hydroxy vitamin D, and B12 levels — help confirm deficiency before treatment.

:::info
A balanced plate with vegetables, fruits, whole grains, lean proteins, and dairy or fortified alternatives covers most needs for healthy adults without routine megadoses.
:::

## Why It Matters

Deficiencies cause real symptoms: iron deficiency brings fatigue and shortness of breath; B12 deficiency can cause numbness and cognitive changes; severe vitamin D deficiency weakens bones; folate deficiency in pregnancy raises neural tube defect risk. Untreated deficiencies can mimic other illnesses, delaying correct care. Excess supplementation also harms — too much iron or fat-soluble vitamins can be toxic.

## What This Means for You

Prioritize food variety before buying high-dose supplements. If you follow a restrictive diet, have malabsorption, or take medicines that block nutrients, ask about screening. Pregnant people should take prenatal vitamins with folic acid per clinician guidance. Do not self-diagnose fatigue as "low vitamins" without testing — many causes exist.

:::warning
High-dose supplements can interact with medicines and mask B12 deficiency when folate is given alone. Work with a clinician for diagnosis and treatment plans.
:::`,
    },
    es: {
      title: "Deficiencias de micronutrientes",
      description:
        "Conozca carencias comunes de vitaminas y minerales, quién está en riesgo y cómo se identifican.",
      sidebarTitle: "Vitaminas y minerales",
      sidebarTips: [
        "Priorice alimentos variados y enteros.",
        "Algunos grupos necesitan más vitamina D o B12.",
        "Análisis antes de megadosis de suplementos.",
        "Condiciones de malabsorción aumentan el riesgo.",
      ],
      body: `## ¿Qué es?

Los **micronutrientes** son vitaminas y minerales que el cuerpo necesita en pequeñas cantidades para inmunidad, huesos, nervios, transporte de oxígeno y cientos de reacciones metabólicas. Una **deficiencia** significa que la ingesta o absorción es demasiado baja para mantener niveles saludables. Carencias comunes en EE. UU. incluyen vitamina D, hierro (anemia), vitamina B12 (especialmente en mayores y veganos), folato en embarazo e yodo en dietas limitadas.

## ¿Cómo funciona?

Se obtienen de alimentos — lácteos y exposición solar ayudan la vitamina D; carnes rojas y legumbres aportan hierro; B12 viene principalmente de productos animales o fortificados. La absorción depende de la salud intestinal: celiaquía, cirugía bariátrica y IBP crónicos pueden alterarla. Los requerimientos cambian con edad, embarazo y condiciones médicas. Análisis — ferritina, 25-hidroxivitamina D, B12 — confirman deficiencia antes del tratamiento.

:::info
Un plato equilibrado con verduras, frutas, granos integrales, proteínas magras y lácteos o alternativas fortificadas cubre la mayoría de necesidades en adultos sanos sin megadosis rutinarias.
:::

## ¿Por qué importa?

Las deficiencias causan síntomas reales: hierro bajo trae fatiga y falta de aire; B12 baja puede causar entumecimiento y cambios cognitivos; vitamina D severa debilita huesos; folato bajo en embarazo aumenta riesgo de defectos del tubo neural. Sin tratar, pueden imitar otras enfermedades. El exceso de suplementos también daña — demasiado hierro o vitaminas liposolubles pueden ser tóxicos.

## Qué significa para usted

Priorice variedad alimentaria antes de suplementos de alta dosis. Si sigue dieta restrictiva, tiene malabsorción o toma medicamentos que bloquean nutrientes, pregunte sobre pruebas. Las embarazadas deben tomar prenatales con ácido fólico según indicación. No autodiagnostique fatiga como "vitaminas bajas" sin análisis — hay muchas causas.

:::warning
Las megadosis pueden interactuar con medicamentos y enmascarar deficiencia de B12 si se da folato solo. Trabaje con un clínico para diagnóstico y tratamiento.
:::`,
    },
    quiz: {
      enTitle: "Micronutrient Deficiencies Quiz",
      esTitle: "Cuestionario: Deficiencias de micronutrientes",
      enQuestions: [
        {
          q: "Which nutrient deficiency is common and often linked to fatigue and anemia?",
          options: ["Iron", "Vitamin C only", "Sodium", "Caffeine"],
          answer: "A",
          explanation:
            "Iron deficiency reduces hemoglobin and commonly causes fatigue and anemia. Vitamin C aids absorption but alone does not cause classic anemia pattern; sodium and caffeine are not micronutrient deficiencies in this sense.",
        },
        {
          q: "Who may need extra attention to vitamin B12 intake?",
          options: [
            "Only infants under six months",
            "Older adults and people on strict vegan diets without fortification",
            "Everyone should avoid B12 entirely",
            "Only competitive athletes",
          ],
          answer: "B",
          explanation:
            "B12 absorption often declines with age; plant-only diets lack B12 unless fortified foods or supplements are used. Infants get B12 from formula or breast milk with adequate maternal intake; avoiding B12 is harmful; athletes are not the primary at-risk group.",
        },
        {
          q: "Why test before starting high-dose supplements?",
          options: [
            "All deficiencies feel identical",
            "Excess of some nutrients can be harmful and symptoms have many causes",
            "Blood tests never detect deficiencies",
            "Supplements always replace medical care",
          ],
          answer: "B",
          explanation:
            "Testing targets the right deficiency; iron overload and fat-soluble vitamin excess are dangerous. Deficiencies differ symptomatically; blood tests do detect many deficiencies; supplements complement but do not always replace treatment.",
        },
        {
          q: "Which condition can impair micronutrient absorption?",
          options: [
            "Celiac disease affecting the small intestine",
            "Wearing glasses",
            "Mild seasonal allergies",
            "Regular walking",
          ],
          answer: "A",
          explanation:
            "Celiac damages the small intestine and reduces absorption of iron, folate, and other nutrients. Glasses, mild allergies, and walking do not cause malabsorption syndromes.",
        },
        {
          q: "Why is folic acid emphasized in pregnancy?",
          options: [
            "It prevents all birth defects of any kind",
            "Adequate folate lowers risk of neural tube defects",
            "It replaces prenatal care visits",
            "It is only needed after delivery",
          ],
          answer: "B",
          explanation:
            "Folic acid before and early in pregnancy reduces neural tube defect risk — it does not prevent all birth defects, does not replace prenatal care, and is needed before conception and early pregnancy, not only postpartum.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué deficiencia nutricional es común y a menudo se vincula con fatiga y anemia?",
          options: ["Hierro", "Solo vitamina C", "Sodio", "Cafeína"],
          answer: "A",
          explanation:
            "La deficiencia de hierro reduce hemoglobina y comúnmente causa fatiga y anemia. La vitamina C ayuda la absorción pero sola no causa el patrón clásico de anemia; sodio y cafeína no son deficiencias de micronutrientes en este sentido.",
        },
        {
          q: "¿Quién puede necesitar atención extra a la vitamina B12?",
          options: [
            "Solo bebés menores de seis meses",
            "Adultos mayores y personas con dieta vegana estricta sin fortificación",
            "Todos deben evitar B12 por completo",
            "Solo atletas competitivos",
          ],
          answer: "B",
          explanation:
            "La absorción de B12 a menudo disminuye con la edad; las dietas solo vegetales carecen de B12 sin alimentos fortificados o suplementos. Los bebés obtienen B12 de fórmula o leche materna adecuada; evitar B12 es dañino; los atletas no son el grupo principal en riesgo.",
        },
        {
          q: "¿Por qué analizar antes de suplementos de alta dosis?",
          options: [
            "Todas las deficiencias se sienten igual",
            "El exceso de algunos nutrientes puede dañar y los síntomas tienen muchas causas",
            "Los análisis nunca detectan deficiencias",
            "Los suplementos siempre reemplazan atención médica",
          ],
          answer: "B",
          explanation:
            "Las pruebas orientan la deficiencia correcta; la sobrecarga de hierro y vitaminas liposolubles es peligrosa. Las deficiencias difieren; los análisis sí detectan muchas deficiencias; los suplementos complementan pero no siempre reemplazan el tratamiento.",
        },
        {
          q: "¿Qué condición puede alterar la absorción de micronutrientes?",
          options: [
            "Enfermedad celíaca que afecta el intestino delgado",
            "Usar gafas",
            "Alergias estacionales leves",
            "Caminar regularmente",
          ],
          answer: "A",
          explanation:
            "La celiaquía daña el intestino delgado y reduce absorción de hierro, folato y otros nutrientes. Las gafas, alergias leves y caminar no causan síndromes de malabsorción.",
        },
        {
          q: "¿Por qué se enfatiza el ácido fólico en el embarazo?",
          options: [
            "Previene todos los defectos de nacimiento de cualquier tipo",
            "El folato adecuado reduce el riesgo de defectos del tubo neural",
            "Reemplaza las visitas prenatales",
            "Solo se necesita después del parto",
          ],
          answer: "B",
          explanation:
            "El ácido fólico antes y al inicio del embarazo reduce el riesgo de defectos del tubo neural — no previene todos los defectos, no reemplaza atención prenatal, y se necesita antes de la concepción y al inicio, no solo posparto.",
        },
      ],
    },
  },
  {
    id: "glycemic-index-and-load",
    category: "Nutrition",
    categoryId: "nutrition",
    duration: "14 minutes",
    level: "intermediate",
    en: {
      title: "Glycemic Index and Load",
      description:
        "Understand how foods affect blood glucose differently and how to use GI and GL in meal planning.",
      sidebarTitle: "GI & GL basics",
      sidebarTips: [
        "Pair carbs with protein or fiber.",
        "Portion size affects glycemic load.",
        "Whole grains often beat refined grains.",
        "Individual responses vary — use glucose monitoring if advised.",
      ],
      body: `## What Is It

The **glycemic index (GI)** ranks carbohydrate-containing foods by how much they raise blood glucose compared to a reference (usually glucose or white bread). High-GI foods spike glucose faster; low-GI foods raise it more gradually. **Glycemic load (GL)** combines GI with portion size — a small serving of a high-GI food may have modest GL, while a large serving has higher impact. These tools help people with diabetes and anyone planning steadier energy, but they are guides, not rigid rules.

## How It Works

Digestion speed, fiber, fat, protein, and cooking method all change glucose response. White bread and sugary drinks tend toward high GI; legumes, non-starchy vegetables, and many whole grains trend lower. Adding protein, fat, or fiber to a meal slows absorption. Physical activity after eating also helps muscles take up glucose. The ADA emphasizes overall eating patterns — Mediterranean-style and DASH patterns — over single food rankings alone.

:::info
Type 2 diabetes develops from complex genetics, weight, activity, and metabolism — not from eating sugar alone. GL/GI tools help manage glucose after diagnosis, not assign blame for causing disease.
:::

## Why It Matters

Sharp glucose spikes can challenge insulin function over time in people with diabetes or prediabetes. Steadier glucose supports energy, mood, and long-term complication risk reduction when combined with medical care. Athletes sometimes use targeted high-GI carbs around activity. For most people, GL is more practical than GI because real portions matter.

## What This Means for You

Build meals with vegetables, lean protein, healthy fats, and high-fiber carbs. Prefer whole grains over refined when possible. If you have diabetes, follow your care team's carb counting or plate method — GI tables supplement, not replace, personalized plans. Check glucose responses if you use a meter or CGM to see what works for your body.

:::warning
Do not eliminate all carbohydrates without medical guidance — balanced carb intake with medication adjustment prevents unsafe lows and nutritional gaps.
:::`,
    },
    es: {
      title: "Índice y carga glucémica",
      description:
        "Entienda cómo los alimentos afectan la glucosa de forma distinta y cómo usar IG y CG en la planificación de comidas.",
      sidebarTitle: "Bases de IG y CG",
      sidebarTips: [
        "Combine carbohidratos con proteína o fibra.",
        "El tamaño de porción afecta la carga glucémica.",
        "Los granos integrales suelen superar los refinados.",
        "Las respuestas individuales varían — use monitoreo si le indican.",
      ],
      body: `## ¿Qué es?

El **índice glucémico (IG)** clasifica alimentos con carbohidratos según cuánto elevan la glucosa comparado con una referencia (generalmente glucosa o pan blanco). Los alimentos de IG alto suben la glucosa más rápido; los de IG bajo la suben más gradualmente. La **carga glucémica (CG)** combina IG con tamaño de porción — una porción pequeña de un alimento de IG alto puede tener CG modesta, mientras una porción grande tiene mayor impacto. Estas herramientas ayudan a personas con diabetes y a quien planea energía más estable, pero son guías, no reglas rígidas.

## ¿Cómo funciona?

La velocidad de digestión, fibra, grasa, proteína y método de cocción cambian la respuesta glucémica. Pan blanco y bebidas azucaradas tienden a IG alto; legumbres, verduras sin almidón y muchos granos integrales son más bajos. Añadir proteína, grasa o fibra ralentiza la absorción. La actividad física después de comer también ayuda a los músculos a captar glucosa. La ADA enfatiza patrones alimentarios generales — estilo mediterráneo y DASH — más que rankings de un solo alimento.

:::info
La diabetes tipo 2 se desarrolla por genética compleja, peso, actividad y metabolismo — no por comer azúcar sola. Las herramientas IG/CG ayudan a manejar glucosa tras el diagnóstico, no culpan por causar la enfermedad.
:::

## ¿Por qué importa?

Los picos bruscos de glucosa pueden desafiar la función de insulina con el tiempo en diabetes o prediabetes. Una glucosa más estable apoya energía, ánimo y reducción de riesgo de complicaciones junto con atención médica. Los atletas a veces usan carbohidratos de IG alto alrededor de la actividad. Para la mayoría, la CG es más práctica que el IG porque las porciones reales importan.

## Qué significa para usted

Arme comidas con verduras, proteína magra, grasas saludables y carbohidratos con fibra. Prefiera granos integrales sobre refinados cuando sea posible. Si tiene diabetes, siga el conteo de carbohidratos o método del plato de su equipo — las tablas de IG complementan, no reemplazan, planes personalizados. Revise respuestas glucémicas con medidor o MCG si los usa.

:::warning
No elimine todos los carbohidratos sin guía médica — la ingesta equilibrada con ajuste de medicamentos previene hipoglucemias inseguras y carencias nutricionales.
:::`,
    },
    quiz: {
      enTitle: "Glycemic Index and Load Quiz",
      esTitle: "Cuestionario: Índice y carga glucémica",
      enQuestions: [
        {
          q: "What does glycemic load (GL) add beyond glycemic index (GI)?",
          options: [
            "It ignores portion size entirely",
            "It accounts for both food GI and serving size",
            "It only measures protein content",
            "It replaces blood glucose monitoring",
          ],
          answer: "B",
          explanation:
            "GL multiplies GI by available carbohydrate amount per serving, making portion size part of the estimate. GL does not ignore portions, measure protein, or replace actual glucose monitoring.",
        },
        {
          q: "Which meal strategy tends to blunt glucose spikes?",
          options: [
            "Carbohydrates alone in large portions",
            "Adding fiber, protein, or healthy fat to carbohydrate foods",
            "Skipping all vegetables",
            "Only drinking sugary beverages",
          ],
          answer: "B",
          explanation:
            "Fiber, protein, and fat slow carbohydrate absorption and moderate post-meal glucose. Large carbs alone, avoiding vegetables, or sugary drinks tend to raise glucose more sharply.",
        },
        {
          q: "How does the ADA generally view GI/GI-only diets?",
          options: [
            "As the sole treatment for diabetes",
            "As one tool within broader healthy eating patterns",
            "As unnecessary for everyone with diabetes",
            "As a cure for type 1 diabetes",
          ],
          answer: "B",
          explanation:
            "ADA guidance emphasizes overall dietary patterns, medications, and activity — GI/GL can inform choices but are not standalone treatment or cures, and they remain useful for many with diabetes.",
        },
        {
          q: "Which statement about sugar and type 2 diabetes is most accurate?",
          options: [
            "Eating sugar alone directly causes type 2 diabetes in everyone",
            "Type 2 risk involves genetics, weight, activity, and metabolism — not sugar alone",
            "Only children develop type 2 diabetes",
            "Sugar has no effect on blood glucose",
          ],
          answer: "B",
          explanation:
            "Type 2 diabetes is multifactorial; sugar affects glucose but does not singularly cause the disease in everyone. Adults develop type 2 commonly; sugar clearly affects blood glucose.",
        },
        {
          q: "Why might two people respond differently to the same high-GI food?",
          options: [
            "GI is identical for every human always",
            "Individual metabolism, activity, and medications vary",
            "GI only applies to fats",
            "Blood glucose never changes after meals",
          ],
          answer: "B",
          explanation:
            "Real-world glucose responses differ by insulin sensitivity, activity, gut microbiome, and meds. GI varies by food, not only fats, and post-meal glucose clearly changes.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué añade la carga glucémica (CG) más allá del índice glucémico (IG)?",
          options: [
            "Ignora por completo el tamaño de porción",
            "Considera tanto el IG del alimento como el tamaño de porción",
            "Solo mide contenido de proteína",
            "Reemplaza el monitoreo de glucosa",
          ],
          answer: "B",
          explanation:
            "La CG multiplica el IG por la cantidad de carbohidrato disponible por porción. No ignora porciones, no mide proteína ni reemplaza el monitoreo real de glucosa.",
        },
        {
          q: "¿Qué estrategia de comida tiende a suavizar picos de glucosa?",
          options: [
            "Carbohidratos solos en porciones grandes",
            "Añadir fibra, proteína o grasa saludable a carbohidratos",
            "Omitir todas las verduras",
            "Solo beber bebidas azucaradas",
          ],
          answer: "B",
          explanation:
            "Fibra, proteína y grasa ralentizan la absorción de carbohidratos. Carbohidratos solos en exceso, sin verduras o con bebidas azucaradas elevan más la glucosa.",
        },
        {
          q: "¿Cómo ve generalmente la ADA las dietas basadas solo en IG?",
          options: [
            "Como el único tratamiento para diabetes",
            "Como una herramienta dentro de patrones alimentarios más amplios",
            "Como innecesarias para todos con diabetes",
            "Como cura para diabetes tipo 1",
          ],
          answer: "B",
          explanation:
            "La guía de la ADA enfatiza patrones generales, medicamentos y actividad — IG/CG informan elecciones pero no son tratamiento único ni curas, y siguen siendo útiles para muchos con diabetes.",
        },
        {
          q: "¿Qué afirmación sobre azúcar y diabetes tipo 2 es más precisa?",
          options: [
            "Comer azúcar sola causa diabetes tipo 2 en todos",
            "El riesgo de tipo 2 involucra genética, peso, actividad y metabolismo — no solo azúcar",
            "Solo los niños desarrollan diabetes tipo 2",
            "El azúcar no afecta la glucosa",
          ],
          answer: "B",
          explanation:
            "La diabetes tipo 2 es multifactorial; el azúcar afecta la glucosa pero no causa la enfermedad sola en todos. Los adultos desarrollan tipo 2 comúnmente; el azúcar sí cambia la glucosa.",
        },
        {
          q: "¿Por qué dos personas pueden responder distinto al mismo alimento de IG alto?",
          options: [
            "El IG es idéntico para todos siempre",
            "El metabolismo individual, actividad y medicamentos varían",
            "El IG solo aplica a grasas",
            "La glucosa nunca cambia después de comer",
          ],
          answer: "B",
          explanation:
            "Las respuestas reales difieren por sensibilidad a insulina, actividad, microbioma y medicamentos. El IG varía por alimento, no solo grasas, y la glucosa posprandial sí cambia.",
        },
      ],
    },
  },
  {
    id: "understanding-lipids",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "15 minutes",
    level: "beginner",
    en: {
      title: "Understanding Lipids",
      description:
        "Learn what cholesterol and triglycerides measure and why they matter for heart and stroke risk.",
      sidebarTitle: "Cholesterol basics",
      sidebarTips: [
        "LDL is often called 'bad' cholesterol.",
        "HDL helps carry cholesterol away from arteries.",
        "Triglycerides reflect fats from diet and liver.",
        "Lifestyle and medicines both can improve lipids.",
      ],
      body: `## What Is It

**Lipids** are fat-related substances in blood measured on a lipid panel. **Total cholesterol** sums several types. **LDL cholesterol** (low-density lipoprotein) carries cholesterol to tissues; high LDL is linked to plaque buildup in arteries. **HDL cholesterol** (high-density lipoprotein) helps remove cholesterol from arteries — higher HDL is generally protective. **Triglycerides** are another blood fat; high levels often accompany obesity, diabetes, and excess alcohol or refined carbs.

## How It Works

Your liver makes cholesterol and you also get some from food. Lipoproteins package fats for transport in blood, which is water-based. Plaque (**atherosclerosis**) forms when LDL particles penetrate artery walls, trigger inflammation, and narrow vessels — raising heart attack and stroke risk. Triglycerides store energy; very high levels can inflame the pancreas. Lipid levels respond to diet, exercise, weight, genetics, thyroid function, and medicines.

:::info
The ACC/AHA guidelines emphasize overall cardiovascular risk — age, blood pressure, diabetes, smoking, and LDL together — not a single number in isolation.
:::

## Why It Matters

Heart disease remains a leading cause of death in the U.S. Lowering LDL with lifestyle and, when indicated, statins reduces major cardiovascular events in high-risk groups per AHA/ACC evidence. Triglycerides above 500 mg/dL need urgent attention for pancreatitis risk. Knowing your numbers helps you and your clinician decide on diet changes, activity goals, and whether medication is appropriate.

## What This Means for You

Get a fasting or non-fasting lipid panel as your clinician recommends — many adults need periodic screening. Focus on Mediterranean-style eating, fiber, activity, and weight management. Do not stop prescribed lipid medicines without medical advice. Ask what your LDL goal should be based on your personal risk, not generic charts alone.

:::warning
Very low LDL from untreated illness is different from LDL lowered by therapy — always interpret labs with your care team in clinical context.
:::`,
    },
    es: {
      title: "Entendiendo los lípidos",
      description:
        "Aprenda qué miden colesterol y triglicéridos y por qué importan para el riesgo cardíaco y de accidente cerebrovascular.",
      sidebarTitle: "Bases del colesterol",
      sidebarTips: [
        "El LDL suele llamarse colesterol 'malo'.",
        "El HDL ayuda a alejar colesterol de arterias.",
        "Los triglicéridos reflejan grasas de dieta e hígado.",
        "Estilo de vida y medicinas pueden mejorar lípidos.",
      ],
      body: `## ¿Qué es?

Los **lípidos** son sustancias relacionadas con grasas en sangre medidas en un perfil lipídico. El **colesterol total** suma varios tipos. El **colesterol LDL** transporta colesterol a tejidos; LDL alto se vincula con placa en arterias. El **colesterol HDL** ayuda a retirar colesterol de arterias — HDL más alto suele ser protector. Los **triglicéridos** son otra grasa sanguínea; niveles altos a menudo acompañan obesidad, diabetes y exceso de alcohol o carbohidratos refinados.

## ¿Cómo funciona?

El hígado produce colesterol y también se obtiene de alimentos. Las lipoproteínas empaquetan grasas para transporte en sangre acuosa. La placa (**aterosclerosis**) forma cuando partículas LDL penetran paredes arteriales, provocan inflamación y estrechan vasos — elevando riesgo de infarto y accidente cerebrovascular. Los triglicéridos almacenan energía; niveles muy altos pueden inflamar el páncreas. Los lípidos responden a dieta, ejercicio, peso, genética, tiroides y medicamentos.

:::info
Las guías ACC/AHA enfatizan el riesgo cardiovascular global — edad, presión, diabetes, tabaco y LDL juntos — no un solo número aislado.
:::

## ¿Por qué importa?

La enfermedad cardíaca sigue siendo causa principal de muerte en EE. UU. Bajar LDL con estilo de vida y, cuando corresponda, estatinas reduce eventos cardiovasculares mayores en grupos de alto riesgo según evidencia AHA/ACC. Triglicéridos sobre 500 mg/dL necesitan atención urgente por riesgo de pancreatitis. Conocer sus números ayuda a decidir cambios dietéticos, metas de actividad y si medicación es apropiada.

## Qué significa para usted

Hágase un perfil lipídico en ayunas o no según indique su clínico — muchos adultos necesitan cribado periódico. Enfóquese en alimentación mediterránea, fibra, actividad y peso. No suspenda medicamentos para lípidos sin consejo médico. Pregunte cuál debe ser su meta de LDL según su riesgo personal, no solo tablas genéricas.

:::warning
LDL muy bajo por enfermedad no tratada es distinto de LDL bajado por terapia — interprete siempre los análisis con su equipo en contexto clínico.
:::`,
    },
    quiz: {
      enTitle: "Understanding Lipids Quiz",
      esTitle: "Cuestionario: Entendiendo los lípidos",
      enQuestions: [
        {
          q: "Which lipoprotein is most associated with artery plaque buildup when elevated?",
          options: ["LDL cholesterol", "HDL cholesterol", "Vitamin D", "Sodium"],
          answer: "A",
          explanation:
            "High LDL promotes atherosclerotic plaque. HDL generally helps remove cholesterol from arteries; vitamin D and sodium are not lipoprotein cholesterol types.",
        },
        {
          q: "What do very high triglycerides (e.g., above 500 mg/dL) especially risk?",
          options: [
            "Pancreatitis",
            "Improved athletic performance only",
            "Lower stroke risk automatically",
            "No health effects",
          ],
          answer: "A",
          explanation:
            "Severely elevated triglycerides increase acute pancreatitis risk. They do not improve performance by themselves, do not automatically lower stroke risk, and clearly have health effects.",
        },
        {
          q: "How do ACC/AHA guidelines typically use LDL results?",
          options: [
            "As the only factor in every decision",
            "Within overall cardiovascular risk assessment",
            "They ignore LDL completely",
            "Only for patients under age 18",
          ],
          answer: "B",
          explanation:
            "Guidelines integrate LDL with age, BP, diabetes, smoking, and other factors. LDL alone is not the sole driver; LDL is central, not ignored; lipid management applies across adult ages per risk.",
        },
        {
          q: "Which lifestyle change can improve lipid profiles?",
          options: [
            "Regular physical activity and heart-healthy eating",
            "Eliminating all dietary fat regardless of type",
            "Avoiding all medical screening",
            "Increasing added sugars for energy",
          ],
          answer: "A",
          explanation:
            "Activity and Mediterranean-style patterns lower LDL and triglycerides in many people. Not all fats are harmful; screening guides care; added sugars can worsen triglycerides.",
        },
        {
          q: "What does HDL cholesterol generally do?",
          options: [
            "Helps transport cholesterol away from arteries",
            "Directly clogs arteries when any amount is present",
            "Is identical to LDL in function",
            "Measures blood sugar control",
          ],
          answer: "A",
          explanation:
            "HDL participates in reverse cholesterol transport. It does not clog arteries by mere presence, is functionally different from LDL, and does not reflect glucose control (that is A1c).",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué lipoproteína se asocia más con acumulación de placa arterial cuando está elevada?",
          options: ["Colesterol LDL", "Colesterol HDL", "Vitamina D", "Sodio"],
          answer: "A",
          explanation:
            "LDL alto promueve placa aterosclerótica. HDL generalmente ayuda a retirar colesterol de arterias; vitamina D y sodio no son tipos de lipoproteína colesterol.",
        },
        {
          q: "¿Qué riesgo especial tienen triglicéridos muy altos (p. ej., sobre 500 mg/dL)?",
          options: [
            "Pancreatitis",
            "Solo mejor rendimiento atlético",
            "Menor riesgo de accidente cerebrovascular automáticamente",
            "Sin efectos en la salud",
          ],
          answer: "A",
          explanation:
            "Triglicéridos severamente elevados aumentan riesgo de pancreatitis aguda. No mejoran rendimiento solos, no bajan automáticamente riesgo de ACV y claramente tienen efectos en salud.",
        },
        {
          q: "¿Cómo usan típicamente las guías ACC/AHA los resultados de LDL?",
          options: [
            "Como único factor en cada decisión",
            "Dentro de evaluación global de riesgo cardiovascular",
            "Ignoran LDL por completo",
            "Solo para pacientes menores de 18 años",
          ],
          answer: "B",
          explanation:
            "Las guías integran LDL con edad, presión, diabetes, tabaco y otros factores. LDL solo no es el único motor; LDL es central, no ignorado; el manejo lipídico aplica en adultos según riesgo.",
        },
        {
          q: "¿Qué cambio de estilo de vida puede mejorar perfiles lipídicos?",
          options: [
            "Actividad física regular y alimentación cardiosaludable",
            "Eliminar toda grasa dietética sin importar el tipo",
            "Evitar todo cribado médico",
            "Aumentar azúcares añadidos para energía",
          ],
          answer: "A",
          explanation:
            "Actividad y patrones mediterráneos bajan LDL y triglicéridos en muchas personas. No todas las grasas son dañinas; el cribado orienta la atención; azúcares añadidos pueden empeorar triglicéridos.",
        },
        {
          q: "¿Qué hace generalmente el colesterol HDL?",
          options: [
            "Ayuda a transportar colesterol lejos de las arterias",
            "Obstruye arterias directamente por estar presente",
            "Es idéntico al LDL en función",
            "Mide control de glucosa",
          ],
          answer: "A",
          explanation:
            "HDL participa en transporte reverso de colesterol. No obstruye arterias por mera presencia, es funcionalmente distinto de LDL, y no refleja control glucémico (eso es A1c).",
        },
      ],
    },
  },
  {
    id: "how-statins-work",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "14 minutes",
    level: "intermediate",
    en: {
      title: "How Statins Work",
      description:
        "Understand how statin medicines lower LDL, who may benefit, and common questions about muscle side effects.",
      sidebarTitle: "Statin basics",
      sidebarTips: [
        "Statins block a liver enzyme that makes cholesterol.",
        "Benefits grow over years of use.",
        "Report unexplained muscle pain to your clinician.",
        "Do not stop statins without medical advice.",
      ],
      body: `## What Is It

**Statins** are medicines that lower LDL cholesterol by blocking **HMG-CoA reductase**, an enzyme your liver uses to make cholesterol. Less liver cholesterol production leads the liver to pull more LDL from blood. Common statins include atorvastatin, rosuvastatin, simvastatin, and pravastatin. They are among the most studied drugs in cardiology and are recommended by ACC/AHA guidelines for many people with established cardiovascular disease or high calculated risk.

## How It Works

When LDL drops, fewer cholesterol particles enter artery walls, slowing plaque growth and stabilizing existing plaque — lowering heart attack and stroke risk over time. Statins also have anti-inflammatory effects on blood vessels. Dose and potency vary; clinicians match intensity to risk. Liver enzymes are sometimes monitored. Muscle symptoms occur in a minority of patients — ranging from mild aches to rare severe muscle breakdown (rhabdomyolysis).

:::warning
If you develop significant muscle pain, dark urine, or weakness on a statin, contact your clinician promptly. Do not stop the medicine silently without a plan — sudden stops in high-risk patients can be harmful.
:::

## Why It Matters

Large trials show statins reduce major cardiovascular events in primary and secondary prevention populations. They work alongside blood pressure control, diabetes management, smoking cessation, and healthy eating — not instead of them. Fear of side effects leads some people to avoid proven therapy; open discussion with your clinician helps balance benefit and tolerance.

## What This Means for You

Take statins as prescribed, usually once daily. Grapefruit can raise levels of some statins — check your specific drug label. Tell your doctor about all medicines and supplements. If side effects occur, dose adjustment or a different statin may help rather than abandoning therapy entirely. Ask how your personal risk estimate supports the recommendation.

:::info
Statins are not a substitute for lifestyle change — they complement diet, activity, and other risk factor treatment for long-term heart and brain protection.
:::`,
    },
    es: {
      title: "Cómo funcionan las estatinas",
      description:
        "Entienda cómo las estatinas bajan LDL, quién puede beneficiarse y preguntas comunes sobre efectos musculares.",
      sidebarTitle: "Bases de estatinas",
      sidebarTips: [
        "Las estatinas bloquean una enzima hepática que hace colesterol.",
        "Los beneficios crecen con años de uso.",
        "Reporte dolor muscular inexplicado a su clínico.",
        "No suspenda estatinas sin consejo médico.",
      ],
      body: `## ¿Qué es?

Las **estatinas** son medicamentos que bajan el colesterol LDL bloqueando la **HMG-CoA reductasa**, enzima que el hígado usa para fabricar colesterol. Menos producción hepática lleva al hígado a extraer más LDL de la sangre. Estatinas comunes incluyen atorvastatina, rosuvastatina, simvastatina y pravastatina. Están entre los fármacos más estudiados en cardiología y las guías ACC/AHA las recomiendan para muchas personas con enfermedad cardiovascular establecida o riesgo calculado alto.

## ¿Cómo funciona?

Al bajar LDL, menos partículas de colesterol entran en paredes arteriales, frenando crecimiento de placa y estabilizando placa existente — reduciendo riesgo de infarto y accidente cerebrovascular con el tiempo. Las estatinas también tienen efectos antiinflamatorios vasculares. La dosis y potencia varían; los clínicos ajustan intensidad al riesgo. A veces se monitorean enzimas hepáticas. Síntomas musculares ocurren en minoría — desde molestias leves hasta rara ruptura muscular severa (rabdomiólisis).

:::warning
Si desarrolla dolor muscular significativo, orina oscura o debilidad con una estatina, contacte a su clínico de inmediato. No suspenda el medicamento en silencio sin plan — paradas bruscas en pacientes de alto riesgo pueden ser dañinas.
:::

## ¿Por qué importa?

Ensayos grandes muestran que las estatinas reducen eventos cardiovasculares mayores en prevención primaria y secundaria. Funcionan junto con control de presión, diabetes, dejar de fumar y alimentación saludable — no en lugar de ellos. El miedo a efectos secundarios lleva a algunos a evitar terapia probada; el diálogo abierto con su clínico ayuda a equilibrar beneficio y tolerancia.

## Qué significa para usted

Tome estatinas según receta, generalmente una vez al día. El pomelo puede elevar niveles de algunas estatinas — revise la etiqueta de su fármaco. Informe todos los medicamentos y suplementos. Si hay efectos secundarios, ajuste de dosis u otra estatina puede ayudar en lugar de abandonar la terapia por completo. Pregunte cómo su riesgo personal respalda la recomendación.

:::info
Las estatinas no sustituyen cambios de estilo de vida — complementan dieta, actividad y otro tratamiento de factores de riesgo para protección cardíaca y cerebral a largo plazo.
:::`,
    },
    quiz: {
      enTitle: "How Statins Work Quiz",
      esTitle: "Cuestionario: Cómo funcionan las estatinas",
      enQuestions: [
        {
          q: "What is the primary mechanism of statins?",
          options: [
            "Blocking liver HMG-CoA reductase to reduce cholesterol production",
            "Dissolving existing artery plaque overnight",
            "Raising HDL by exercising muscles directly",
            "Replacing all dietary cholesterol absorption",
          ],
          answer: "A",
          explanation:
            "Statins inhibit hepatic cholesterol synthesis, lowering LDL. They do not instantly dissolve plaque, do not directly exercise muscles, and do not block all dietary cholesterol uptake.",
        },
        {
          q: "Why should muscle symptoms on a statin be reported?",
          options: [
            "They are always harmless and should be ignored",
            "Rare severe muscle injury needs evaluation and possible medication change",
            "They mean the statin is curing diabetes",
            "Only athletes experience muscle effects",
          ],
          answer: "B",
          explanation:
            "Most muscle complaints are mild, but severe cases need assessment. Symptoms are not always harmless, do not indicate diabetes cure, and affect non-athletes too.",
        },
        {
          q: "How do ACC/AHA guidelines generally position statins?",
          options: [
            "Only for people already hospitalized",
            "For selected high-risk patients alongside lifestyle therapy",
            "As replacements for blood pressure medicines",
            "Only when LDL is normal",
          ],
          answer: "B",
          explanation:
            "Guidelines recommend statins based on risk and LDL in outpatient prevention too. They complement lifestyle, do not replace BP drugs, and are used when LDL or risk warrants treatment — not only at normal LDL.",
        },
        {
          q: "What should you do before stopping a prescribed statin due to side effects?",
          options: [
            "Stop immediately without telling anyone",
            "Discuss with your clinician for dose change or alternative",
            "Double the dose to push through pain",
            "Replace with unproven supplements only",
          ],
          answer: "B",
          explanation:
            "Clinicians can adjust therapy safely. Stopping without guidance risks cardiovascular events; doubling dose worsens toxicity; supplements alone lack proven event reduction.",
        },
        {
          q: "Why might grapefruit be mentioned on some statin labels?",
          options: [
            "It improves statin safety for all statins equally",
            "It can raise blood levels of certain statins via enzyme inhibition",
            "It has no interaction with any medicines",
            "It is required to absorb statins",
          ],
          answer: "B",
          explanation:
            "Grapefruit inhibits CYP3A4, increasing exposure for some statins like simvastatin and atorvastatin. It does not universally improve safety, does interact with drugs, and is not required for absorption.",
        },
      ],
      esQuestions: [
        {
          q: "¿Cuál es el mecanismo principal de las estatinas?",
          options: [
            "Bloquear HMG-CoA reductasa hepática para reducir producción de colesterol",
            "Disolver placa arterial existente de la noche a la mañana",
            "Elevar HDL ejercitando músculos directamente",
            "Reemplazar toda absorción de colesterol dietético",
          ],
          answer: "A",
          explanation:
            "Las estatinas inhiben la síntesis hepática de colesterol, bajando LDL. No disuelven placa al instante, no ejercitan músculos directamente ni bloquean toda absorción dietética.",
        },
        {
          q: "¿Por qué reportar síntomas musculares con una estatina?",
          options: [
            "Siempre son inofensivos y deben ignorarse",
            "La rara lesión muscular severa necesita evaluación y posible cambio de medicamento",
            "Significan que la estatina cura la diabetes",
            "Solo los atletas experimentan efectos musculares",
          ],
          answer: "B",
          explanation:
            "La mayoría de molestias musculares son leves, pero casos severos necesitan evaluación. No siempre son inofensivos, no curan diabetes y afectan también a no atletas.",
        },
        {
          q: "¿Cómo posicionan generalmente las guías ACC/AHA las estatinas?",
          options: [
            "Solo para personas ya hospitalizadas",
            "Para pacientes seleccionados de alto riesgo junto con terapia de estilo de vida",
            "Como reemplazo de medicamentos para presión",
            "Solo cuando el LDL es normal",
          ],
          answer: "B",
          explanation:
            "Las guías recomiendan estatinas según riesgo y LDL también en prevención ambulatoria. Complementan estilo de vida, no reemplazan antihipertensivos, y se usan cuando LDL o riesgo lo justifican.",
        },
        {
          q: "¿Qué hacer antes de suspender una estatina recetada por efectos secundarios?",
          options: [
            "Suspender de inmediato sin avisar a nadie",
            "Hablar con su clínico para cambio de dosis o alternativa",
            "Duplicar la dosis para superar el dolor",
            "Reemplazar solo con suplementos no probados",
          ],
          answer: "B",
          explanation:
            "Los clínicos pueden ajustar la terapia con seguridad. Suspender sin guía arriesga eventos cardiovasculares; duplicar dosis empeora toxicidad; suplementos solos carecen de reducción probada de eventos.",
        },
        {
          q: "¿Por qué el pomelo puede mencionarse en algunas etiquetas de estatinas?",
          options: [
            "Mejora la seguridad de todas las estatinas por igual",
            "Puede elevar niveles sanguíneos de ciertas estatinas por inhibición enzimática",
            "No tiene interacción con ningún medicamento",
            "Es necesario para absorber estatinas",
          ],
          answer: "B",
          explanation:
            "El pomelo inhibe CYP3A4, aumentando exposición de algunas estatinas como simvastatina y atorvastatina. No mejora universalmente la seguridad, sí interactúa con fármacos y no es necesario para absorción.",
        },
      ],
    },
  },
  {
    id: "heart-attack-vs-stroke-signs",
    category: "Emergency & First Aid",
    categoryId: "emergency",
    duration: "12 minutes",
    level: "beginner",
    en: {
      title: "Heart Attack vs Stroke Signs",
      description: "Learn how heart attack and stroke symptoms differ and when to call 911 immediately.",
      sidebarTitle: "Heart vs brain emergency",
      sidebarTips: [
        "Call 911 — do not drive yourself.",
        "Note time symptoms started for stroke care.",
        "Chewing aspirin only if directed for heart symptoms.",
        "FAST helps remember stroke warning signs.",
      ],
      body: `## What Is It

A **heart attack** (myocardial infarction) happens when blood flow to part of the heart muscle is blocked, usually by a clot in a coronary artery. A **stroke** happens when blood flow to part of the brain is blocked (ischemic stroke) or a blood vessel bursts (hemorrhagic stroke). Both are medical emergencies, but symptoms and immediate actions differ. Minutes matter — fast treatment limits heart damage and improves stroke recovery.

## How It Works

Heart attack symptoms often include chest pressure or pain that may spread to the arm, jaw, or back; shortness of breath; sweating; nausea; or unexplained fatigue — women may have subtler symptoms than classic chest pain. Stroke symptoms appear suddenly: face drooping on one side, arm weakness, slurred speech, vision loss, severe headache, or confusion. The **FAST** mnemonic helps — Face, Arms, Speech, Time to call 911. Stroke teams may offer clot-busting drugs or procedures within hours if patients arrive quickly.

:::warning
Never wait to see if symptoms pass. Call 911 for sudden chest discomfort with concerning features or any sudden stroke signs — EMS can start care en route.
:::

## Why It Matters

The AHA and American Stroke Association report that early reperfusion therapy for heart attack and time-sensitive stroke treatment save lives and reduce disability. Delays from driving oneself, ignoring mild symptoms, or sleeping it off worsen outcomes. Bystander recognition is critical — many events happen at home or work.

## What This Means for You

Know your personal risk factors: high blood pressure (ACC/AHA 2017 thresholds), smoking, diabetes, atrial fibrillation (stroke risk), and family history. If chest symptoms suggest a heart attack, sit or rest and call 911 — take aspirin only if already advised by a clinician. For stroke, note the last time the person was known well. Do not give food or drink if speech or swallowing is affected.

:::info
Heart attack and stroke can occur together or in sequence when clots travel. When in doubt, treat as emergency and let EMS sort the diagnosis.
:::`,
    },
    es: {
      title: "Signos de infarto vs accidente cerebrovascular",
      description: "Aprenda cómo difieren los síntomas de infarto y ACV y cuándo llamar al 911 de inmediato.",
      sidebarTitle: "Emergencia corazón vs cerebro",
      sidebarTips: [
        "Llame al 911 — no maneje usted mismo.",
        "Anote la hora de inicio para atención de ACV.",
        "Aspirina masticada solo si le indicaron para síntomas cardíacos.",
        "FAST ayuda a recordar signos de ACV.",
      ],
      body: `## ¿Qué es?

Un **infarto** (infarto de miocardio) ocurre cuando el flujo sanguíneo a parte del músculo cardíaco se bloquea, generalmente por un coágulo en arteria coronaria. Un **accidente cerebrovascular (ACV)** ocurre cuando el flujo al cerebro se bloquea (ACV isquémico) o un vaso se rompe (ACV hemorrágico). Ambos son emergencias, pero síntomas y acciones inmediatas difieren. Los minutos importan — el tratamiento rápido limita daño cardíaco y mejora recuperación del ACV.

## ¿Cómo funciona?

Síntomas de infarto incluyen presión o dolor torácico que puede extenderse a brazo, mandíbula o espalda; falta de aire; sudoración; náuseas o fatiga inexplicada — las mujeres pueden tener síntomas más sutiles. Síntomas de ACV aparecen de repente: caída de un lado de la cara, debilidad en brazo, habla arrastrada, pérdida de visión, dolor de cabeza severo o confusión. El mnemotécnico **FAST** ayuda — Face (cara), Arms (brazos), Speech (habla), Time (tiempo de llamar al 911). Equipos de ACV pueden ofrecer fármacos o procedimientos en horas si el paciente llega rápido.

:::warning
Nunca espere a ver si los síntomas pasan. Llame al 911 ante molestia torácica súbita con signos preocupantes o cualquier signo súbito de ACV — el EMS puede iniciar atención en camino.
:::

## ¿Por qué importa?

La AHA y la American Stroke Association reportan que la reperfusión temprana en infarto y el tratamiento sensible al tiempo en ACV salvan vidas y reducen discapacidad. Retrasos por manejar uno mismo, ignorar síntomas leves o dormir empeoran resultados. El reconocimiento de testigos es crítico — muchos eventos ocurren en casa o trabajo.

## Qué significa para usted

Conozca factores de riesgo: presión alta (umbrales ACC/AHA 2017), tabaco, diabetes, fibrilación auricular (riesgo de ACV) e historial familiar. Si síntomas torácicos sugieren infarto, siéntese o descanse y llame al 911 — tome aspirina solo si un clínico ya se lo indicó. En ACV, anote la última vez que la persona estuvo bien. No dé comida ni bebida si la deglución o habla están afectadas.

:::info
Infarto y ACV pueden ocurrir juntos o en secuencia cuando viajan coágulos. En duda, trate como emergencia y deje que el EMS determine el diagnóstico.
:::`,
    },
    quiz: {
      enTitle: "Heart Attack vs Stroke Signs Quiz",
      esTitle: "Cuestionario: Infarto vs ACV",
      enQuestions: [
        {
          q: "Which symptom cluster is most typical of stroke?",
          options: [
            "Gradual mild knee pain over weeks",
            "Sudden one-sided face droop and slurred speech",
            "Itchy eyes from pollen",
            "Slow weight gain over years",
          ],
          answer: "B",
          explanation:
            "Stroke symptoms are sudden and neurologic — face, arm, speech changes. Knee pain, allergies, and slow weight change are not stroke hallmarks.",
        },
        {
          q: "What does the 'T' in FAST stand for regarding stroke?",
          options: [
            "Take a nap first",
            "Time — call emergency services immediately",
            "Test blood sugar only",
            "Travel to clinic next week",
          ],
          answer: "B",
          explanation:
            "FAST emphasizes Time to call 911 because stroke treatments are time-limited. Napping, glucose checks alone, or delayed clinic visits waste critical minutes.",
        },
        {
          q: "Why call 911 instead of driving yourself for possible heart attack?",
          options: [
            "EMS can start care and route to appropriate hospital faster",
            "Driving is always faster than ambulances",
            "Hospitals refuse walk-in patients",
            "Symptoms always resolve during the drive",
          ],
          answer: "A",
          explanation:
            "Ambulances provide monitoring, aspirin when appropriate, and destination to capable centers. Self-driving risks collapse en route; hospitals accept emergencies; symptoms may worsen, not improve.",
        },
        {
          q: "Which heart attack symptom may be more subtle in women?",
          options: [
            "Chest discomfort, fatigue, or shortness of breath without classic crushing pain",
            "Only hair loss",
            "Chronic toenail fungus",
            "Seasonal sneezing",
          ],
          answer: "A",
          explanation:
            "Women more often present with atypical chest pressure, fatigue, nausea, or breathlessness. Hair, nail, and allergy symptoms are unrelated to acute MI presentation.",
        },
        {
          q: "Why note the time symptoms began in suspected stroke?",
          options: [
            "Clinicians use timing to decide eligibility for acute stroke therapies",
            "Hospitals charge by the minute only",
            "Time is irrelevant to stroke treatment",
            "It replaces all brain imaging",
          ],
          answer: "A",
          explanation:
            "IV thrombolysis and thrombectomy windows depend on last known well time. Billing is not the reason; timing is clinically critical; imaging still required.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué grupo de síntomas es más típico de ACV?",
          options: [
            "Dolor de rodilla leve gradual en semanas",
            "Caída súbita de un lado de la cara y habla arrastrada",
            "Picazón ocular por polen",
            "Aumento lento de peso en años",
          ],
          answer: "B",
          explanation:
            "Los síntomas de ACV son súbitos y neurológicos — cara, brazo, habla. Dolor de rodilla, alergias y cambio lento de peso no son signos clásicos de ACV.",
        },
        {
          q: "¿Qué significa la 'T' en FAST respecto al ACV?",
          options: [
            "Tomar una siesta primero",
            "Tiempo — llamar servicios de emergencia de inmediato",
            "Solo medir glucosa",
            "Ir a la clínica la próxima semana",
          ],
          answer: "B",
          explanation:
            "FAST enfatiza Tiempo para llamar al 911 porque los tratamientos de ACV son limitados en tiempo. Dormir, solo glucosa o clínica tardía desperdician minutos críticos.",
        },
        {
          q: "¿Por qué llamar al 911 en lugar de manejar ante posible infarto?",
          options: [
            "El EMS puede iniciar atención y dirigir al hospital adecuado más rápido",
            "Manejar siempre es más rápido que ambulancias",
            "Los hospitales rechazan pacientes sin cita",
            "Los síntomas siempre mejoran al manejar",
          ],
          answer: "A",
          explanation:
            "Las ambulancias ofrecen monitoreo, aspirina cuando corresponde y destino a centros capaces. Manejar arriesga colapso en ruta; hospitales atienden emergencias; síntomas pueden empeorar.",
        },
        {
          q: "¿Qué síntoma de infarto puede ser más sutil en mujeres?",
          options: [
            "Molestia torácica, fatiga o falta de aire sin dolor opresivo clásico",
            "Solo caída del cabello",
            "Hongo crónico en uñas de pies",
            "Estornudos estacionales",
          ],
          answer: "A",
          explanation:
            "Las mujeres presentan más a menudo presión atípica, fatiga, náuseas o disnea. Cabello, uñas y alergias no se relacionan con presentación aguda de IM.",
        },
        {
          q: "¿Por qué anotar la hora de inicio de síntomas en ACV sospechado?",
          options: [
            "Los clínicos usan el tiempo para decidir elegibilidad para terapias agudas de ACV",
            "Los hospitales cobran solo por minuto",
            "El tiempo es irrelevante para tratamiento de ACV",
            "Reemplaza toda imagen cerebral",
          ],
          answer: "A",
          explanation:
            "Trombólisis IV y trombectomía dependen del último momento conocido bien. No es por facturación; el tiempo es clínicamente crítico; la imagen sigue siendo necesaria.",
        },
      ],
    },
  },
  {
    id: "type-1-vs-type-2-diabetes",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "16 minutes",
    level: "beginner",
    en: {
      title: "Type 1 vs Type 2 Diabetes",
      description:
        "Understand how type 1 and type 2 diabetes differ in cause, treatment, and daily management.",
      sidebarTitle: "T1 vs T2 diabetes",
      sidebarTips: [
        "Type 1 is autoimmune — not caused by diet alone.",
        "Type 2 involves insulin resistance over time.",
        "Both need individualized care plans.",
        "Never stop insulin without medical guidance.",
      ],
      body: `## What Is It

**Diabetes mellitus** is a condition of high blood glucose from problems with insulin — the hormone that moves glucose into cells. **Type 1 diabetes** is an autoimmune disease: the immune system destroys insulin-producing beta cells in the pancreas. It often starts in childhood or young adulthood but can occur at any age. **Type 2 diabetes** develops when the body becomes **insulin resistant** and the pancreas cannot produce enough insulin to compensate — risk rises with genetics, higher body weight, inactivity, and age.

## How It Works

People with type 1 require **insulin therapy** from diagnosis — without insulin, the body breaks down fat dangerously (DKA). Type 2 is often managed first with lifestyle changes and oral or injectable non-insulin medicines; many eventually need insulin, but not always at diagnosis. Both types benefit from glucose monitoring, A1c targets set with clinicians, foot and eye screening, and blood pressure and lipid management per ADA standards.

:::info
Eating sugar does not directly cause type 1 diabetes. Type 2 risk reflects complex metabolism and genetics — not a single food choice. Blame and stigma harm care engagement.
:::

## Why It Matters

Over 37 million Americans have diabetes; many more have prediabetes. Untreated hyperglycemia damages kidneys, nerves, eyes, and blood vessels. Type 1 can become life-threatening within hours if insulin is missed. Type 2 often develops silently for years. Correct classification guides safe treatment — giving only pills to type 1 is dangerous; unnecessary insulin fear in type 2 can delay needed therapy.

## What This Means for You

If you or a child have unexplained thirst, frequent urination, weight loss, or fatigue, seek prompt evaluation — type 1 must be ruled out quickly. Follow your care team's plan for carbs, activity, medicines, and screening. Wear medical ID if on insulin. Learn hypoglycemia signs and sick-day rules. Family history matters for type 2; type 1 family history raises risk but many cases have no family link.

:::warning
Do not stop or ration insulin to manage cost or weight without clinician supervision — DKA and severe hyperglycemia are emergencies.
:::`,
    },
    es: {
      title: "Diabetes tipo 1 vs tipo 2",
      description: "Entienda cómo difieren diabetes tipo 1 y tipo 2 en causa, tratamiento y manejo diario.",
      sidebarTitle: "DT1 vs DT2",
      sidebarTips: [
        "Tipo 1 es autoinmune — no se debe solo a la dieta.",
        "Tipo 2 involucra resistencia a insulina con el tiempo.",
        "Ambas necesitan planes de atención individualizados.",
        "Nunca suspenda insulina sin guía médica.",
      ],
      body: `## ¿Qué es?

La **diabetes mellitus** es glucosa alta en sangre por problemas con la insulina — hormona que lleva glucosa a las células. La **diabetes tipo 1** es enfermedad autoinmune: el sistema inmune destruye células beta productoras de insulina en el páncreas. A menudo comienza en niñez o adultez joven pero puede ocurrir a cualquier edad. La **diabetes tipo 2** se desarrolla cuando el cuerpo tiene **resistencia a la insulina** y el páncreas no produce suficiente insulina — el riesgo sube con genética, mayor peso corporal, inactividad y edad.

## ¿Cómo funciona?

Quienes tienen tipo 1 requieren **terapia con insulina** desde el diagnóstico — sin insulina, el cuerpo descompone grasa peligrosamente (CAD). Tipo 2 a menudo se maneja primero con cambios de estilo de vida y medicamentos orales o inyectables no insulínicos; muchos eventualmente necesitan insulina, pero no siempre al diagnóstico. Ambos tipos se benefician de monitoreo glucémico, metas de A1c con clínicos, cribado de pies y ojos, y manejo de presión y lípidos según estándares ADA.

:::info
Comer azúcar no causa directamente diabetes tipo 1. El riesgo de tipo 2 refleja metabolismo y genética complejos — no una sola elección alimentaria. Culpa y estigma dañan el compromiso con el cuidado.
:::

## ¿Por qué importa?

Más de 37 millones de estadounidenses tienen diabetes; muchos más tienen prediabetes. La hiperglucemia sin tratar daña riñones, nervios, ojos y vasos. Tipo 1 puede volverse mortal en horas si falta insulina. Tipo 2 a menudo se desarrolla en silencio años. La clasificación correcta guía tratamiento seguro — dar solo pastillas en tipo 1 es peligroso; miedo innecesario a insulina en tipo 2 puede retrasar terapia necesaria.

## Qué significa para usted

Si usted o un niño tienen sed inexplicable, orina frecuente, pérdida de peso o fatiga, busque evaluación pronta — debe descartarse tipo 1 rápido. Siga el plan de su equipo para carbohidratos, actividad, medicamentos y cribado. Use identificación médica si usa insulina. Aprenda signos de hipoglucemia y reglas de días de enfermedad. Historial familiar importa para tipo 2; historial de tipo 1 eleva riesgo pero muchos casos no tienen antecedente familiar.

:::warning
No suspenda ni racione insulina por costo o peso sin supervisión clínica — CAD e hiperglucemia severa son emergencias.
:::`,
    },
    quiz: {
      enTitle: "Type 1 vs Type 2 Diabetes Quiz",
      esTitle: "Cuestionario: Diabetes tipo 1 vs tipo 2",
      enQuestions: [
        {
          q: "What causes type 1 diabetes?",
          options: [
            "Autoimmune destruction of insulin-producing pancreatic cells",
            "Eating too much candy alone in every person",
            "Only obesity in adults over 65",
            "Lack of exercise for one week",
          ],
          answer: "A",
          explanation:
            "Type 1 is immune-mediated beta cell loss requiring insulin. Candy alone does not cause type 1; obesity is central to type 2 risk, not type 1 mechanism; brief inactivity does not explain type 1.",
        },
        {
          q: "Which treatment is essential from diagnosis for type 1 diabetes?",
          options: [
            "Insulin therapy",
            "Only herbal supplements",
            "Avoiding all carbohydrates forever",
            "No monitoring needed",
          ],
          answer: "A",
          explanation:
            "Type 1 always needs insulin for survival. Supplements cannot replace insulin; zero-carb diets are not standard mandatory therapy; monitoring is essential for safety.",
        },
        {
          q: "What best describes type 2 diabetes pathophysiology?",
          options: [
            "Insulin resistance with progressive insulin secretory decline",
            "Complete absence of any insulin from birth in all cases",
            "Only a viral infection lasting two days",
            "Exclusively a childhood autoimmune disease",
          ],
          answer: "A",
          explanation:
            "Type 2 combines resistance and relative insulin deficiency over time. Total absence from birth describes type 1; brief viruses and childhood autoimmunity do not define type 2.",
        },
        {
          q: "Why is distinguishing type 1 from type 2 clinically important?",
          options: [
            "Treatment and urgency differ — insulin is lifesaving in type 1",
            "Both are identical and need no insulin ever",
            "Only type 2 requires any medical follow-up",
            "Type 1 never causes emergencies",
          ],
          answer: "A",
          explanation:
            "Misclassification risks DKA if type 1 is untreated with insulin. Types differ; both need follow-up; type 1 can cause rapid emergencies without insulin.",
        },
        {
          q: "Which statement about sugar and diabetes is most accurate?",
          options: [
            "Sugar alone directly causes all diabetes types",
            "Type 2 risk is multifactorial; type 1 is not caused by sugar intake alone",
            "Only people who never eat sugar get diabetes",
            "Sugar has no effect on blood glucose in any person",
          ],
          answer: "B",
          explanation:
            "Sugar affects glucose levels but does not singularly cause type 1 or all type 2. Avoiding sugar entirely does not guarantee prevention; sugar clearly impacts blood glucose.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué causa la diabetes tipo 1?",
          options: [
            "Destrucción autoinmune de células pancreáticas productoras de insulina",
            "Comer demasiados dulces sola en todas las personas",
            "Solo obesidad en adultos mayores de 65",
            "Falta de ejercicio por una semana",
          ],
          answer: "A",
          explanation:
            "Tipo 1 es pérdida de células beta mediada por inmunidad que requiere insulina. Dulces solos no causan tipo 1; obesidad es central en tipo 2, no en mecanismo de tipo 1; inactividad breve no explica tipo 1.",
        },
        {
          q: "¿Qué tratamiento es esencial desde el diagnóstico en diabetes tipo 1?",
          options: [
            "Terapia con insulina",
            "Solo suplementos herbales",
            "Evitar todos los carbohidratos para siempre",
            "Sin monitoreo necesario",
          ],
          answer: "A",
          explanation:
            "Tipo 1 siempre necesita insulina para sobrevivir. Suplementos no reemplazan insulina; dieta cero carbohidratos no es terapia obligatoria estándar; el monitoreo es esencial para seguridad.",
        },
        {
          q: "¿Qué describe mejor la fisiopatología de diabetes tipo 2?",
          options: [
            "Resistencia a insulina con declive progresivo de secreción insulínica",
            "Ausencia completa de insulina desde nacimiento en todos los casos",
            "Solo infección viral de dos días",
            "Exclusivamente enfermedad autoinmune infantil",
          ],
          answer: "A",
          explanation:
            "Tipo 2 combina resistencia y deficiencia relativa de insulina con el tiempo. Ausencia total desde nacimiento describe tipo 1; virus breves y autoinmunidad infantil no definen tipo 2.",
        },
        {
          q: "¿Por qué es clínicamente importante distinguir tipo 1 de tipo 2?",
          options: [
            "Tratamiento y urgencia difieren — insulina salva vidas en tipo 1",
            "Ambas son idénticas y nunca necesitan insulina",
            "Solo tipo 2 requiere seguimiento médico",
            "Tipo 1 nunca causa emergencias",
          ],
          answer: "A",
          explanation:
            "Clasificar mal arriesga CAD si tipo 1 no recibe insulina. Los tipos difieren; ambos necesitan seguimiento; tipo 1 puede causar emergencias rápidas sin insulina.",
        },
        {
          q: "¿Qué afirmación sobre azúcar y diabetes es más precisa?",
          options: [
            "El azúcar sola causa directamente todos los tipos de diabetes",
            "Riesgo de tipo 2 es multifactorial; tipo 1 no se debe solo a ingesta de azúcar",
            "Solo quienes nunca comen azúcar tienen diabetes",
            "El azúcar no afecta glucosa en ninguna persona",
          ],
          answer: "B",
          explanation:
            "El azúcar afecta glucosa pero no causa sola tipo 1 ni todo tipo 2. Evitar azúcar no garantiza prevención; el azúcar sí impacta glucosa sanguínea.",
        },
      ],
    },
  },
  {
    id: "thyroid-disorders-basics",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "14 minutes",
    level: "beginner",
    en: {
      title: "Thyroid Disorders Basics",
      description: "Learn how an overactive or underactive thyroid affects energy, weight, and metabolism.",
      sidebarTitle: "Thyroid basics",
      sidebarTips: [
        "TSH is the usual screening test.",
        "Hypothyroidism is more common than hyperthyroidism.",
        "Take levothyroxine consistently as directed.",
        "Report palpitations or neck swelling promptly.",
      ],
      body: `## What Is It

The **thyroid** is a butterfly-shaped gland in the neck that makes hormones (T4 and T3) controlling metabolism, heart rate, temperature, and energy. **Hypothyroidism** means the gland is underactive — common causes include Hashimoto's thyroiditis (autoimmune) and prior thyroid treatment. **Hyperthyroidism** means overactivity — causes include Graves' disease and thyroid nodules. Both are diagnosable with blood tests, mainly **TSH** with free T4 as needed.

## How It Works

Low thyroid hormone slows body systems: fatigue, weight gain, cold intolerance, constipation, dry skin, depression, and elevated cholesterol can occur. High thyroid hormone speeds systems: weight loss, heat intolerance, rapid heartbeat, anxiety, tremor, and eye changes in Graves' disease. TSH is pituitary feedback — high TSH usually means hypothyroidism; low TSH often signals hyperthyroidism. Treatment replaces hormone (levothyroxine) for hypothyroidism or reduces production (antithyroid drugs, radioiodine, surgery) for hyperthyroidism.

:::warning
Untreated hyperthyroidism can trigger dangerous heart rhythms; severe hypothyroidism can cause myxedema crisis — seek care for chest pain, severe weakness, or confusion.
:::

## Why It Matters

Thyroid disease is common — especially in women and after age 60. Symptoms overlap with mood disorders, anemia, and menopause, so testing prevents misdiagnosis. Pregnancy requires tight thyroid control for fetal development. Some medicines and supplements (biotin, iodine excess) can interfere with lab accuracy — tell labs what you take.

## What This Means for You

Ask about thyroid screening if you have persistent unexplained symptoms. Take levothyroxine the same way daily — often empty stomach — and do not change brands without clinician awareness. Hyperthyroid patients should report palpitations or fever. Once stable, periodic TSH monitoring maintains correct dose as weight and age change.

:::info
A neck lump or trouble swallowing needs evaluation — nodules are usually benign but require ultrasound and sometimes biopsy per clinician guidance.
:::`,
    },
    es: {
      title: "Conceptos básicos de trastornos tiroideos",
      description: "Aprenda cómo una tiroides hiperactiva o hipoactiva afecta energía, peso y metabolismo.",
      sidebarTitle: "Bases de tiroides",
      sidebarTips: [
        "TSH es la prueba de cribado habitual.",
        "Hipotiroidismo es más común que hipertiroidismo.",
        "Tome levotiroxina de forma consistente.",
        "Reporte palpitaciones o hinchazón de cuello pronto.",
      ],
      body: `## ¿Qué es?

La **tiroides** es una glándula en forma de mariposa en el cuello que produce hormonas (T4 y T3) que controlan metabolismo, ritmo cardíaco, temperatura y energía. **Hipotiroidismo** significa glándula hipoactiva — causas comunes incluyen tiroiditis de Hashimoto (autoinmune) y tratamiento previo de tiroides. **Hipertiroidismo** significa hiperactividad — causas incluyen enfermedad de Graves y nódulos tiroideos. Ambos se diagnostican con análisis de sangre, principalmente **TSH** con T4 libre según necesidad.

## ¿Cómo funciona?

Poca hormona tiroidea enlentece sistemas corporales: fatiga, aumento de peso, intolerancia al frío, estreñimiento, piel seca, depresión y colesterol elevado. Mucha hormona acelera sistemas: pérdida de peso, intolerancia al calor, ritmo cardíaco rápido, ansiedad, temblor y cambios oculares en Graves. TSH es retroalimentación pituitaria — TSH alto usualmente significa hipotiroidismo; TSH bajo a menudo señala hipertiroidismo. Tratamiento reemplaza hormona (levotiroxina) para hipotiroidismo o reduce producción (antitiroideos, yodo radioactivo, cirugía) para hipertiroidismo.

:::warning
Hipertiroidismo sin tratar puede desencadenar arritmias peligrosas; hipotiroidismo severo puede causar crisis de mixedema — busque atención ante dolor torácico, debilidad severa o confusión.
:::

## ¿Por qué importa?

Enfermedad tiroidea es común — especialmente en mujeres y después de los 60. Síntomas se superponen con trastornos del ánimo, anemia y menopausia, por eso las pruebas previenen diagnóstico erróneo. Embarazo requiere control tiroideo estricto para desarrollo fetal. Algunos medicamentos y suplementos (biotina, exceso de yodo) pueden interferir con precisión de laboratorio — informe lo que toma.

## Qué significa para usted

Pregunte sobre cribado tiroideo si tiene síntomas persistentes sin explicación. Tome levotiroxina igual cada día — a menudo en ayunas — y no cambie marcas sin que su clínico lo sepa. Pacientes hipertiroideos deben reportar palpitaciones o fiebre. Una vez estables, monitoreo periódico de TSH mantiene dosis correcta cuando cambian peso y edad.

:::info
Un bulto en cuello o dificultad para tragar necesita evaluación — los nódulos suelen ser benignos pero requieren ecografía y a veces biopsia según indicación clínica.
:::`,
    },
    quiz: {
      enTitle: "Thyroid Disorders Basics Quiz",
      esTitle: "Cuestionario: Trastornos tiroideos",
      enQuestions: [
        {
          q: "Which test is commonly used first to screen thyroid function?",
          options: ["TSH", "Cholesterol only", "Blood type", "Skin biopsy"],
          answer: "A",
          explanation:
            "TSH is the primary screening test for hypo- and hyperthyroidism. Cholesterol may rise in hypothyroidism but is not the screen; blood type and skin biopsy do not assess thyroid function.",
        },
        {
          q: "Which symptoms align more with hypothyroidism?",
          options: [
            "Fatigue, weight gain, and cold intolerance",
            "Only fever and rash for 24 hours",
            "Sudden face droop and arm weakness",
            "Improved marathon speed without training",
          ],
          answer: "A",
          explanation:
            "Hypothyroidism slows metabolism causing fatigue, weight gain, and cold sensitivity. Brief fever/rash, stroke signs, and unexplained athletic gains are not typical hypothyroid patterns.",
        },
        {
          q: "What is a standard treatment for hypothyroidism?",
          options: [
            "Levothyroxine hormone replacement",
            "High-dose iodine for everyone",
            "Avoiding all medical follow-up",
            "Only aspirin daily",
          ],
          answer: "A",
          explanation:
            "Levothyroxine replaces deficient T4. Iodine helps only in deficiency states and can worsen some conditions; follow-up is required; aspirin does not treat hypothyroidism.",
        },
        {
          q: "Why can hyperthyroidism be dangerous if untreated?",
          options: [
            "It can cause rapid heart rate and serious arrhythmias",
            "It always lowers heart rate to zero safely",
            "It only affects hair color",
            "It prevents all infections permanently",
          ],
          answer: "A",
          explanation:
            "Excess thyroid hormone stresses the cardiovascular system. It increases rather than safely zeroes heart rate; effects extend beyond cosmetic hair changes; it does not confer infection immunity.",
        },
        {
          q: "Why tell the lab if you take biotin supplements before thyroid blood work?",
          options: [
            "Biotin can falsely affect some immunoassay thyroid results",
            "Biotin is required for accurate TSH always",
            "Labs refuse all patients on vitamins",
            "Biotin cures Graves' disease",
          ],
          answer: "A",
          explanation:
            "High-dose biotin interferes with certain thyroid immunoassays. It is not required for accuracy; labs do not refuse vitamin users; biotin is not a Graves' cure.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué prueba se usa comúnmente primero para cribar función tiroidea?",
          options: ["TSH", "Solo colesterol", "Tipo de sangre", "Biopsia de piel"],
          answer: "A",
          explanation:
            "TSH es la prueba principal de cribado para hipo e hipertiroidismo. Colesterol puede subir en hipotiroidismo pero no es el cribado; tipo de sangre y biopsia de piel no evalúan tiroides.",
        },
        {
          q: "¿Qué síntomas se alinean más con hipotiroidismo?",
          options: [
            "Fatiga, aumento de peso e intolerancia al frío",
            "Solo fiebre y erupción por 24 horas",
            "Caída súbita de cara y debilidad de brazo",
            "Mejor velocidad en maratón sin entrenar",
          ],
          answer: "A",
          explanation:
            "Hipotiroidismo enlentece metabolismo causando fatiga, peso y sensibilidad al frío. Fiebre/erupción breve, signos de ACV y mejoras atléticas inexplicables no son patrones típicos.",
        },
        {
          q: "¿Cuál es tratamiento estándar para hipotiroidismo?",
          options: [
            "Reemplazo hormonal con levotiroxina",
            "Yodo en alta dosis para todos",
            "Evitar todo seguimiento médico",
            "Solo aspirina diaria",
          ],
          answer: "A",
          explanation:
            "Levotiroxina reemplaza T4 deficiente. Yodo solo ayuda en deficiencia y puede empeorar algunas condiciones; se requiere seguimiento; aspirina no trata hipotiroidismo.",
        },
        {
          q: "¿Por qué el hipertiroidismo sin tratar puede ser peligroso?",
          options: [
            "Puede causar ritmo cardíaco rápido y arritmias graves",
            "Siempre baja el ritmo cardíaco a cero de forma segura",
            "Solo afecta color del cabello",
            "Previene todas las infecciones permanentemente",
          ],
          answer: "A",
          explanation:
            "Exceso de hormona tiroidea estresa el sistema cardiovascular. Aumenta en lugar de anular ritmo cardíaco; efectos van más allá del cabello; no confiere inmunidad a infecciones.",
        },
        {
          q: "¿Por qué informar al laboratorio si toma biotina antes de análisis tiroideos?",
          options: [
            "La biotina puede falsificar algunos inmunoanálisis tiroideos",
            "La biotina siempre es necesaria para TSH preciso",
            "Los laboratorios rechazan pacientes con vitaminas",
            "La biotina cura enfermedad de Graves",
          ],
          answer: "A",
          explanation:
            "Biotina en alta dosis interfiere con ciertos inmunoanálisis tiroideos. No es necesaria para precisión; laboratorios no rechazan usuarios de vitaminas; biotina no cura Graves.",
        },
      ],
    },
  },
  {
    id: "insulin-resistance-explained",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "15 minutes",
    level: "intermediate",
    en: {
      title: "Insulin Resistance Explained",
      description:
        "Understand what insulin resistance means, how it links to prediabetes and type 2 diabetes, and what helps.",
      sidebarTitle: "Insulin resistance",
      sidebarTips: [
        "Prediabetes is a warning stage — action helps.",
        "Activity improves insulin sensitivity.",
        "Weight loss of 5–7% can lower risk.",
        "A1c and fasting glucose screen for progression.",
      ],
      body: `## What Is It

**Insulin resistance** means body cells — especially in muscle, liver, and fat — do not respond efficiently to insulin, so the pancreas makes more insulin to keep blood glucose normal. Over time, the pancreas may not keep up, leading to **prediabetes** (glucose higher than normal but below diabetes thresholds) and **type 2 diabetes**. Resistance is driven by genetics, excess visceral fat, inactivity, sleep apnea, some medicines, and aging — not by a single food exposure.

## How It Works

Insulin acts like a key opening doors for glucose to enter cells. When doors stick, glucose stays in blood and insulin levels rise (**hyperinsulinemia**). The ADA defines prediabetes as A1c 5.7–6.4%, fasting glucose 100–125 mg/dL, or abnormal glucose tolerance test. The NIH Diabetes Prevention Program showed intensive lifestyle change — modest weight loss (~7%), 150 minutes weekly activity — cut progression to type 2 by about 58% in high-risk adults. Metformin helps some high-risk patients per clinician judgment.

:::info
Insulin resistance also links to fatty liver disease, polycystic ovary syndrome (PCOS), and higher cardiovascular risk — management addresses the whole metabolic picture.
:::

## Why It Matters

More than one in three U.S. adults has prediabetes; most do not know it. Untreated progression damages vessels, kidneys, and nerves. Early lifestyle change is more effective than waiting for full diabetes diagnosis. Insulin resistance without high glucose can still signal metabolic risk — waist circumference, triglycerides, HDL, and blood pressure together describe **metabolic syndrome**.

## What This Means for You

Ask about screening if you have risk factors: family history, higher BMI, gestational diabetes history, or sedentary lifestyle. Focus on sustainable eating patterns (fiber-rich plants, lean protein, limited sugary drinks), regular activity, sleep, and stress management. Celebrate small weight changes. If prescribed metformin or other therapy, take as directed and monitor per your plan.

:::warning
Do not ignore prediabetes because you feel fine — damage can begin before symptoms. Work with your clinician on individualized goals rather than extreme fad diets.
:::`,
    },
    es: {
      title: "Resistencia a la insulina explicada",
      description:
        "Entienda qué significa resistencia a la insulina, cómo se vincula con prediabetes y diabetes tipo 2, y qué ayuda.",
      sidebarTitle: "Resistencia insulínica",
      sidebarTips: [
        "Prediabetes es etapa de alerta — actuar ayuda.",
        "La actividad mejora sensibilidad a insulina.",
        "Pérdida de peso del 5–7% puede bajar riesgo.",
        "A1c y glucosa en ayunas detectan progresión.",
      ],
      body: `## ¿Qué es?

**Resistencia a la insulina** significa que las células — especialmente en músculo, hígado y grasa — no responden eficientemente a la insulina, así el páncreas produce más insulina para mantener glucosa normal. Con el tiempo, el páncreas puede no alcanzar, llevando a **prediabetes** (glucosa más alta que normal pero bajo umbrales de diabetes) y **diabetes tipo 2**. La resistencia la impulsan genética, exceso de grasa visceral, inactividad, apnea del sueño, algunos medicamentos y envejecimiento — no una sola exposición alimentaria.

## ¿Cómo funciona?

La insulina actúa como llave que abre puertas para que la glucosa entre a células. Cuando las puertas se pegan, la glucosa queda en sangre y la insulina sube (**hiperinsulinemia**). La ADA define prediabetes como A1c 5.7–6.4%, glucosa en ayunas 100–125 mg/dL o prueba de tolerancia anormal. El Programa de Prevención de Diabetes del NIH mostró que cambio intensivo de estilo de vida — pérdida modesta de peso (~7%), 150 minutos semanales de actividad — redujo progresión a tipo 2 ~58% en adultos de alto riesgo. Metformina ayuda a algunos pacientes de alto riesgo según criterio clínico.

:::info
La resistencia también se vincula con hígado graso, síndrome de ovario poliquístico (SOP) y mayor riesgo cardiovascular — el manejo aborda el cuadro metabólico completo.
:::

## ¿Por qué importa?

Más de uno de cada tres adultos en EE. UU. tiene prediabetes; la mayoría no lo sabe. La progresión sin tratar daña vasos, riñones y nervios. El cambio temprano de estilo de vida es más efectivo que esperar diagnóstico completo de diabetes. Resistencia sin glucosa alta aún puede señalar riesgo metabólico — circunferencia de cintura, triglicéridos, HDL y presión juntos describen **síndrome metabólico**.

## Qué significa para usted

Pregunte sobre cribado si tiene factores de riesgo: historial familiar, IMC más alto, diabetes gestacional previa o sedentarismo. Enfóquese en patrones alimentarios sostenibles (plantas con fibra, proteína magra, menos bebidas azucaradas), actividad regular, sueño y manejo de estrés. Celebre pequeños cambios de peso. Si le recetan metformina u otra terapia, tómela según indicación y monitoree según su plan.

:::warning
No ignore prediabetes porque se sienta bien — el daño puede comenzar antes de síntomas. Trabaje con su clínico en metas individualizadas en lugar de dietas extremas de moda.
:::`,
    },
    quiz: {
      enTitle: "Insulin Resistance Explained Quiz",
      esTitle: "Cuestionario: Resistencia a la insulina",
      enQuestions: [
        {
          q: "What is insulin resistance?",
          options: [
            "Cells respond poorly to insulin, requiring more insulin to control glucose",
            "The pancreas makes too much insulin only in type 1 diabetes always",
            "Complete absence of any insulin from birth",
            "A condition cured by one day of fasting",
          ],
          answer: "A",
          explanation:
            "Resistance means reduced cellular response, driving compensatory hyperinsulinemia. Type 1 is insulin deficiency, not resistance-only; absence from birth describes type 1; one-day fasting does not cure metabolic disease.",
        },
        {
          q: "Which ADA A1c range defines prediabetes?",
          options: ["5.7% to 6.4%", "Below 4.0%", "Above 10% only", "Exactly 8.0% always"],
          answer: "A",
          explanation:
            "Prediabetes A1c is 5.7–6.4%; diabetes is ≥6.5%. Below 4% is unusually low; 10% suggests poorly controlled diabetes, not prediabetes definition; 8% is not the prediabetes band.",
        },
        {
          q: "What did the Diabetes Prevention Program lifestyle intervention achieve?",
          options: [
            "Roughly 58% reduction in progression to type 2 in high-risk adults",
            "100% cure of all diabetes types",
            "No effect compared to usual care",
            "Only worked in people under age 12",
          ],
          answer: "A",
          explanation:
            "DPP showed major risk reduction with weight loss and activity in adults. It did not cure all diabetes, clearly beat usual care, and targeted adults at risk, not only children.",
        },
        {
          q: "Which factor contributes to insulin resistance?",
          options: [
            "Excess visceral fat and physical inactivity",
            "Wearing glasses",
            "Drinking water daily",
            "Seasonal pollen allergies alone",
          ],
          answer: "A",
          explanation:
            "Visceral adiposity and inactivity worsen insulin signaling. Glasses, hydration, and pollen allergies are not established drivers of insulin resistance.",
        },
        {
          q: "Why screen for prediabetes even without symptoms?",
          options: [
            "Damage can start before symptoms and lifestyle change is most effective early",
            "Prediabetes always causes immediate pain",
            "Screening is only for hospitalized patients",
            "There is no proven way to slow progression",
          ],
          answer: "A",
          explanation:
            "Prediabetes is often silent yet progressive; early intervention works. It is not always painful, screening is outpatient, and DPP proves progression can be slowed.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué es la resistencia a la insulina?",
          options: [
            "Las células responden mal a insulina, requiriendo más insulina para controlar glucosa",
            "El páncreas solo hace demasiada insulina en diabetes tipo 1 siempre",
            "Ausencia completa de insulina desde nacimiento",
            "Condición curada con un día de ayuno",
          ],
          answer: "A",
          explanation:
            "Resistencia significa respuesta celular reducida, impulsando hiperinsulinemia compensatoria. Tipo 1 es deficiencia de insulina; ausencia desde nacimiento describe tipo 1; un día de ayuno no cura enfermedad metabólica.",
        },
        {
          q: "¿Qué rango de A1c de la ADA define prediabetes?",
          options: ["5.7% a 6.4%", "Bajo 4.0%", "Solo sobre 10%", "Exactamente 8.0% siempre"],
          answer: "A",
          explanation:
            "Prediabetes A1c es 5.7–6.4%; diabetes es ≥6.5%. Bajo 4% es inusualmente bajo; 10% sugiere diabetes mal controlada; 8% no es la banda de prediabetes.",
        },
        {
          q: "¿Qué logró la intervención de estilo de vida del Programa de Prevención de Diabetes?",
          options: [
            "Reducción aproximada del 58% en progresión a tipo 2 en adultos de alto riesgo",
            "Cura del 100% de todos los tipos de diabetes",
            "Sin efecto comparado con atención habitual",
            "Solo funcionó en menores de 12 años",
          ],
          answer: "A",
          explanation:
            "DPP mostró gran reducción de riesgo con pérdida de peso y actividad en adultos. No curó toda diabetes, claramente superó atención habitual y apuntó a adultos en riesgo, no solo niños.",
        },
        {
          q: "¿Qué factor contribuye a resistencia a la insulina?",
          options: [
            "Exceso de grasa visceral e inactividad física",
            "Usar gafas",
            "Beber agua diariamente",
            "Solo alergias estacionales al polen",
          ],
          answer: "A",
          explanation:
            "Adiposidad visceral e inactividad empeoran señalización de insulina. Gafas, hidratación y alergias al polen no son impulsores establecidos de resistencia insulínica.",
        },
        {
          q: "¿Por qué detectar prediabetes aunque no haya síntomas?",
          options: [
            "El daño puede comenzar antes de síntomas y el cambio de estilo de vida es más efectivo temprano",
            "Prediabetes siempre causa dolor inmediato",
            "Cribado solo es para hospitalizados",
            "No hay forma probada de frenar progresión",
          ],
          answer: "A",
          explanation:
            "Prediabetes suele ser silenciosa pero progresiva; intervención temprana funciona. No siempre duele, cribado es ambulatorio y DPP prueba que la progresión puede frenarse.",
        },
      ],
    },
  },
  {
    id: "how-antidepressants-work",
    category: "Mental Health",
    categoryId: "mental-health",
    duration: "16 minutes",
    level: "intermediate",
    en: {
      title: "How Antidepressants Work",
      description:
        "Learn major antidepressant classes, expected timelines, and how they fit with therapy and self-care.",
      sidebarTitle: "Antidepressant basics",
      sidebarTips: [
        "Benefits often take 4–8 weeks.",
        "Never stop suddenly without guidance.",
        "Report mood worsening or suicidal thoughts immediately.",
        "Therapy plus medicine helps many people.",
      ],
      body: `## What Is It

**Antidepressants** are prescription medicines that treat depression, anxiety disorders, and some chronic pain conditions. Major classes include **SSRIs** (e.g., sertraline, escitalopram), **SNRIs** (e.g., venlafaxine, duloxetine), **bupropion**, and older **tricyclics** and **MAOIs** used less often. They adjust brain chemical signaling — mainly serotonin and norepinephrine pathways — to improve mood regulation over time. They are not addictive in the traditional sense but require careful stopping.

## How It Works

Depression involves complex brain circuit and neurotransmitter changes; antidepressants gradually enhance synaptic signaling. SSRIs block serotonin reuptake; SNRIs affect serotonin and norepinephrine; bupropion mainly influences dopamine and norepinephrine. Full effect often takes **four to eight weeks**, though sleep or appetite may shift earlier. The first medicine tried may not be the right fit — clinicians adjust dose or class based on response and side effects like nausea, insomnia, or sexual dysfunction.

:::warning
Young adults starting antidepressants should be monitored for worsening mood or suicidal thoughts — contact your clinician immediately if these occur. Black box warnings exist for this reason.
:::

## Why It Matters

Depression is a leading cause of disability worldwide. Effective treatment reduces suicide risk, improves function, and helps people engage in therapy and daily life. Stopping abruptly can cause discontinuation symptoms — dizziness, flu-like feelings, mood swings. Combining medicines without oversight risks **serotonin syndrome** (agitation, fever, rapid heart rate) — especially with MAOIs, certain opioids, or St. John's wort.

## What This Means for You

Take antidepressants as prescribed and give them time before judging failure. Pair medication with psychotherapy (CBT, IPT, etc.) when possible per NIH and APA guidance. Tell all prescribers what you take — including OTC and supplements. Do not drink alcohol heavily while adjusting to new medicines. If pregnant or planning pregnancy, discuss risks and benefits with a specialist.

:::info
Antidepressants treat illness — they are not "happy pills" that change personality. Many people use them short-term; others need longer maintenance — decisions are individualized with your clinician.
:::`,
    },
    es: {
      title: "Cómo funcionan los antidepresivos",
      description:
        "Conozca las principales clases de antidepresivos, plazos esperados y cómo encajan con terapia y autocuidado.",
      sidebarTitle: "Bases de antidepresivos",
      sidebarTips: [
        "Beneficios suelen tardar 4–8 semanas.",
        "Nunca suspenda de golpe sin guía.",
        "Reporte empeoramiento del ánimo o pensamientos suicidas de inmediato.",
        "Terapia más medicamento ayuda a muchas personas.",
      ],
      body: `## ¿Qué es?

Los **antidepresivos** son medicamentos recetados que tratan depresión, trastornos de ansiedad y algunas condiciones de dolor crónico. Clases principales incluyen **ISRS** (p. ej., sertralina, escitalopram), **IRSN** (p. ej., venlafaxina, duloxetina), **bupropión**, y **tricíclicos** e **IMAO** más antiguos usados menos. Ajustan señalización química cerebral — principalmente vías de serotonina y norepinefrina — para mejorar regulación del ánimo con el tiempo. No son adictivos en sentido tradicional pero requieren suspensión cuidadosa.

## ¿Cómo funciona?

La depresión involucra cambios complejos en circuitos cerebrales y neurotransmisores; los antidepresivos mejoran gradualmente la señalización sináptica. ISRS bloquean recaptación de serotonina; IRSN afectan serotonina y norepinefrina; bupropión influye principalmente dopamina y norepinefrina. El efecto completo suele tardar **cuatro a ocho semanas**, aunque sueño o apetito pueden cambiar antes. El primer medicamento puede no ser el adecuado — los clínicos ajustan dosis o clase según respuesta y efectos como náuseas, insomnio o disfunción sexual.

:::warning
Adultos jóvenes que inician antidepresivos deben vigilarse por empeoramiento del ánimo o pensamientos suicidas — contacte a su clínico de inmediato si ocurren. Existen advertencias en caja negra por esta razón.
:::

## ¿Por qué importa?

La depresión es causa principal de discapacidad mundialmente. Tratamiento efectivo reduce riesgo suicida, mejora función y ayuda a participar en terapia y vida diaria. Suspender abruptamente puede causar síntomas de discontinuación — mareo, sensación gripal, cambios de ánimo. Combinar medicamentos sin supervisión arriesga **síndrome serotoninérgico** (agitación, fiebre, ritmo rápido) — especialmente con IMAO, ciertos opioides o hierba de San Juan.

## Qué significa para usted

Tome antidepresivos según receta y déles tiempo antes de juzgar fracaso. Combine medicamento con psicoterapia (TCC, TIP, etc.) cuando sea posible según guía NIH y APA. Informe a todos los prescriptores lo que toma — incluyendo OTC y suplementos. No consuma alcohol en exceso mientras se adapta a medicamentos nuevos. Si está embarazada o planea estarlo, discuta riesgos y beneficios con especialista.

:::info
Los antidepresivos tratan enfermedad — no son "pastillas de felicidad" que cambian personalidad. Muchas personas los usan a corto plazo; otras necesitan mantenimiento más largo — las decisiones son individualizadas con su clínico.
:::`,
    },
    quiz: {
      enTitle: "How Antidepressants Work Quiz",
      esTitle: "Cuestionario: Cómo funcionan antidepresivos",
      enQuestions: [
        {
          q: "How long do antidepressants often need before full benefit?",
          options: [
            "About 4 to 8 weeks for many people",
            "Full effect within 2 hours always",
            "At least 2 years before any change",
            "Only one dose is ever needed",
          ],
          answer: "A",
          explanation:
            "Most antidepressants require weeks of consistent use. Two hours is unrealistic for full mood effect; two years is not a standard wait for initial response; chronic treatment may continue but not as a single dose.",
        },
        {
          q: "What do SSRIs primarily affect?",
          options: [
            "Serotonin reuptake in the brain",
            "Insulin production in the pancreas",
            "Thyroid hormone synthesis only",
            "Blood type antigens",
          ],
          answer: "A",
          explanation:
            "SSRIs selectively inhibit serotonin reuptake. They do not primarily act on insulin, thyroid synthesis, or blood group antigens.",
        },
        {
          q: "Why monitor young adults when starting antidepressants?",
          options: [
            "Risk of worsening mood or suicidal thoughts in some patients early in treatment",
            "Antidepressants always cause instant cure without side effects",
            "Only children under age 2 take antidepressants",
            "Monitoring is required because medicines are placebos only",
          ],
          answer: "A",
          explanation:
            "FDA black box warnings address possible suicidality monitoring early in treatment. Medicines are not instant cure-only drugs, are used in adolescents/adults not toddlers only, and are active drugs not placebos.",
        },
        {
          q: "What can happen if antidepressants are stopped abruptly?",
          options: [
            "Discontinuation symptoms such as dizziness or flu-like feelings",
            "Guaranteed permanent happiness",
            "Instant cure of all anxiety forever",
            "No possible effects whatsoever",
          ],
          answer: "A",
          explanation:
            "Abrupt stop can cause discontinuation syndrome. Permanent happiness, instant universal anxiety cure, and zero effects are not accurate outcomes of sudden stops.",
        },
        {
          q: "Why tell all prescribers about antidepressants and supplements?",
          options: [
            "To avoid dangerous interactions like serotonin syndrome",
            "So they can discourage all mental health care",
            "Supplements never interact with prescriptions",
            "Only one doctor ever needs medication information",
          ],
          answer: "A",
          explanation:
            "Combining serotonergic drugs and some supplements risks serotonin syndrome. Providers support care, supplements can interact, and all prescribers need complete med lists.",
        },
      ],
      esQuestions: [
        {
          q: "¿Cuánto tiempo suelen necesitar los antidepresivos antes del beneficio completo?",
          options: [
            "Aproximadamente 4 a 8 semanas en muchas personas",
            "Efecto completo en 2 horas siempre",
            "Al menos 2 años antes de cualquier cambio",
            "Solo se necesita una dosis",
          ],
          answer: "A",
          explanation:
            "La mayoría requiere semanas de uso consistente. Dos horas es irreal para efecto completo; dos años no es espera estándar para respuesta inicial; tratamiento crónico puede continuar pero no como dosis única.",
        },
        {
          q: "¿Qué afectan principalmente los ISRS?",
          options: [
            "Recaptación de serotonina en el cerebro",
            "Producción de insulina en páncreas",
            "Solo síntesis de hormona tiroidea",
            "Antígenos de tipo sanguíneo",
          ],
          answer: "A",
          explanation:
            "Los ISRS inhiben selectivamente recaptación de serotonina. No actúan principalmente sobre insulina, síntesis tiroidea o grupos sanguíneos.",
        },
        {
          q: "¿Por qué vigilar adultos jóvenes al iniciar antidepresivos?",
          options: [
            "Riesgo de empeoramiento del ánimo o pensamientos suicidas al inicio en algunos pacientes",
            "Los antidepresivos siempre curan al instante sin efectos",
            "Solo niños menores de 2 años toman antidepresivos",
            "Vigilar porque son solo placebos",
          ],
          answer: "A",
          explanation:
            "Advertencias FDA abordan posible suicidio a vigilar al inicio. No son cura instantánea sin efectos, se usan en adolescentes/adultos no solo lactantes, y son fármacos activos no placebos.",
        },
        {
          q: "¿Qué puede pasar si se suspenden antidepresivos abruptamente?",
          options: [
            "Síntomas de discontinuación como mareo o sensación gripal",
            "Felicidad permanente garantizada",
            "Cura instantánea de toda ansiedad para siempre",
            "Ningún efecto posible",
          ],
          answer: "A",
          explanation:
            "Parada abrupta puede causar síndrome de discontinuación. Felicidad permanente, cura universal instantánea de ansiedad y cero efectos no son resultados precisos de paradas súbitas.",
        },
        {
          q: "¿Por qué informar antidepresivos y suplementos a todos los prescriptores?",
          options: [
            "Para evitar interacciones peligrosas como síndrome serotoninérgico",
            "Para que desanimen toda atención de salud mental",
            "Los suplementos nunca interactúan con recetas",
            "Solo un médico necesita información de medicamentos",
          ],
          answer: "A",
          explanation:
            "Combinar fármacos serotoninérgicos y algunos suplementos arriesga síndrome serotoninérgico. Proveedores apoyan cuidado, suplementos sí interactúan y todos los prescriptores necesitan lista completa.",
        },
      ],
    },
  },
  {
    id: "copd-vs-asthma",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "14 minutes",
    level: "beginner",
    en: {
      title: "COPD vs Asthma",
      description: "Learn how COPD and asthma differ in cause, symptoms, triggers, and long-term management.",
      sidebarTitle: "COPD vs asthma",
      sidebarTips: [
        "Smoking is the main COPD risk factor.",
        "Asthma often starts younger with variable symptoms.",
        "Use inhalers as prescribed — technique matters.",
        "Seek help for worsening breathlessness.",
      ],
      body: `## What Is It

**COPD** (chronic obstructive pulmonary disease) is a progressive lung disease — mainly emphysema and chronic bronchitis — usually caused by long-term exposure to irritants, especially **cigarette smoke**. Airflow limitation is largely **not fully reversible**. **Asthma** is chronic airway inflammation with **reversible** narrowing, often starting in childhood, triggered by allergens, exercise, cold air, or infections. Some older adults have features of both (**ACOS** — asthma-COPD overlap).

## How It Works

In COPD, damaged alveoli and mucus-plugged airways trap air — chronic cough, sputum, and progressive shortness of breath dominate. Exacerbations often follow respiratory infections. In asthma, bronchospasm comes and goes — wheeze, chest tightness, cough, especially at night or with triggers. Quick-relief **bronchodilators** (short-acting beta-agonists) relieve acute asthma symptoms; COPD also uses bronchodilators and inhaled steroids when indicated, plus smoking cessation and pulmonary rehab. Spirometry distinguishes reversible from fixed obstruction.

:::warning
Sudden severe breathlessness, blue lips, confusion, or inability to speak in full sentences is an emergency — use rescue inhaler if prescribed and call 911.
:::

## Why It Matters

COPD is a leading cause of disability and death worldwide; most cases are preventable by not smoking and reducing occupational dust/fume exposure. Asthma affects over 25 million Americans — uncontrolled asthma causes ER visits and missed school or work. Mislabeling COPD as asthma (or vice versa) leads to wrong therapy. Vaccines (flu, COVID-19, pneumococcal per CDC) reduce severe exacerbations in both conditions.

## What This Means for You

If you smoke, get help quitting — the single most impactful COPD intervention. Learn correct inhaler technique with your pharmacist or respiratory therapist. Track triggers for asthma and avoid them when possible. Follow action plans for exacerbations. Annual spirometry may be needed if symptoms change. Oxygen therapy is prescribed only when blood oxygen meets specific criteria — not for mild disease.

:::info
Long-term control medicines prevent attacks; rescue inhalers treat sudden symptoms. Using rescue medicine more than twice weekly may signal poor control — tell your clinician.
:::`,
    },
    es: {
      title: "EPOC vs asma",
      description:
        "Aprenda cómo difieren EPOC y asma en causa, síntomas, desencadenantes y manejo a largo plazo.",
      sidebarTitle: "EPOC vs asma",
      sidebarTips: [
        "Fumar es el principal factor de riesgo de EPOC.",
        "Asma a menudo comienza más joven con síntomas variables.",
        "Use inhaladores según receta — la técnica importa.",
        "Busque ayuda si empeora la falta de aire.",
      ],
      body: `## ¿Qué es?

**EPOC** (enfermedad pulmonar obstructiva crónica) es enfermedad pulmonar progresiva — principalmente enfisema y bronquitis crónica — usualmente por exposición prolongada a irritantes, especialmente **cigarrillo**. La limitación de flujo aéreo en gran parte **no es totalmente reversible**. **Asma** es inflamación crónica de vías aéreas con estrechamiento **reversible**, a menudo desde la infancia, desencadenada por alérgenos, ejercicio, aire frío o infecciones. Algunos adultos mayores tienen rasgos de ambas (**solapamiento EPOC-asma**).

## ¿Cómo funciona?

En EPOC, alvéolos dañados y vías obstruidas por mucosidad atrapan aire — tos crónica, esputo y falta de aire progresiva dominan. Exacerbaciones siguen a infecciones respiratorias. En asma, broncoespasmo va y viene — sibilancias, opresión torácica, tos, especialmente de noche o con desencadenantes. **Broncodilatadores** de acción rápida alivian síntomas agudos de asma; EPOC también usa broncodilatadores y esteroides inhalados cuando corresponde, más dejar de fumar y rehabilitación pulmonar. Espirometría distingue obstrucción reversible de fija.

:::warning
Falta de aire severa súbita, labios azules, confusión o incapacidad para hablar en frases completas es emergencia — use inhalador de rescate si le recetaron y llame al 911.
:::

## ¿Por qué importa?

EPOC es causa principal de discapacidad y muerte mundialmente; la mayoría de casos son prevenibles sin fumar y reduciendo polvo/humos laborales. Asma afecta más de 25 millones de estadounidenses — asma no controlada causa visitas a urgencias y ausencias escolares o laborales. Etiquetar mal EPOC como asma (o viceversa) lleva a terapia incorrecta. Vacunas (gripe, COVID-19, neumococo según CDC) reducen exacerbaciones graves en ambas condiciones.

## Qué significa para usted

Si fuma, busque ayuda para dejarlo — la intervención más impactante en EPOC. Aprenda técnica correcta de inhalador con farmacéutico o terapeuta respiratorio. Registre desencadenantes de asma y evítelos cuando sea posible. Siga planes de acción para exacerbaciones. Espirometría anual puede ser necesaria si cambian síntomas. Oxígeno se receta solo cuando oxígeno en sangre cumple criterios específicos — no para enfermedad leve.

:::info
Medicamentos de control a largo plazo previenen ataques; inhaladores de rescate tratan síntomas súbitos. Usar rescate más de dos veces por semana puede señalar mal control — informe a su clínico.
:::`,
    },
    quiz: {
      enTitle: "COPD vs Asthma Quiz",
      esTitle: "Cuestionario: EPOC vs asma",
      enQuestions: [
        {
          q: "Which factor is the leading preventable cause of COPD?",
          options: [
            "Cigarette smoking and long-term lung irritant exposure",
            "Drinking water daily",
            "Seasonal pollen only",
            "One episode of childhood asthma",
          ],
          answer: "A",
          explanation:
            "Tobacco smoke is the dominant COPD risk factor; occupational exposures also matter. Water intake, pollen alone, and resolved childhood asthma do not explain typical COPD pathogenesis.",
        },
        {
          q: "How does asthma airflow limitation typically differ from COPD?",
          options: [
            "Asthma obstruction is often largely reversible with bronchodilators",
            "Asthma never causes wheezing",
            "COPD always fully reverses with one dose of albuterol",
            "Only asthma is diagnosed with spirometry",
          ],
          answer: "A",
          explanation:
            "Asthma features reversible bronchospasm; wheezing is common. COPD has fixed or partially reversible obstruction — not full reversal with one rescue dose. Spirometry helps both conditions.",
        },
        {
          q: "Which symptoms suggest an asthma attack rather than stable COPD alone?",
          options: [
            "Sudden wheeze and chest tightness after a known trigger",
            "Gradual cough over 20 years in a heavy smoker only",
            "Slow nail growth over months",
            "Chronic knee arthritis",
          ],
          answer: "A",
          explanation:
            "Acute trigger-linked wheeze fits asthma exacerbation. Decades-long smoker's cough fits COPD; nail growth and knee arthritis are unrelated respiratory patterns.",
        },
        {
          q: "Why is correct inhaler technique important?",
          options: [
            "Poor technique delivers less medicine to the lungs",
            "Technique only matters for oral pills",
            "Any spray direction works equally",
            "Inhalers are decorative only",
          ],
          answer: "A",
          explanation:
            "Deposition in lungs depends on coordination and device use. Technique matters greatly for inhalers, not pills; spray direction and device mechanics affect dose; inhalers are active drug delivery.",
        },
        {
          q: "When should you seek emergency care for breathing symptoms?",
          options: [
            "Severe breathlessness, blue lips, or inability to speak full sentences",
            "Mild cough once in winter only",
            "Sneezing from allergies without breathing trouble",
            "After normal exercise in healthy young athletes only",
          ],
          answer: "A",
          explanation:
            "Severe respiratory distress with hypoxia signs is emergent. Isolated mild seasonal cough, allergic sneeze without dyspnea, and normal post-exercise breathing in healthy people are lower concern.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué factor es la principal causa prevenible de EPOC?",
          options: [
            "Cigarrillo y exposición prolongada a irritantes pulmonares",
            "Beber agua diariamente",
            "Solo polen estacional",
            "Un episodio de asma infantil",
          ],
          answer: "A",
          explanation:
            "Humo de tabaco es factor dominante de EPOC; exposiciones laborales también importan. Agua, polen solo y asma infantil resuelta no explican patogénesis típica de EPOC.",
        },
        {
          q: "¿Cómo difiere típicamente la limitación de flujo en asma respecto a EPOC?",
          options: [
            "Obstrucción en asma a menudo es en gran parte reversible con broncodilatadores",
            "Asma nunca causa sibilancias",
            "EPOC siempre revierte totalmente con una dosis de albuterol",
            "Solo asma se diagnostica con espirometría",
          ],
          answer: "A",
          explanation:
            "Asma presenta broncoespasmo reversible; sibilancias son comunes. EPOC tiene obstrucción fija o parcialmente reversible — no reversión total con una dosis de rescate. Espirometría ayuda en ambas.",
        },
        {
          q: "¿Qué síntomas sugieren ataque de asma más que EPOC estable solo?",
          options: [
            "Sibilancias súbitas y opresión torácica tras desencadenante conocido",
            "Tos gradual en 20 años solo en fumador pesado",
            "Crecimiento lento de uñas en meses",
            "Artritis crónica de rodilla",
          ],
          answer: "A",
          explanation:
            "Sibilancias agudas ligadas a desencadenante encajan con exacerbación de asma. Tos de décadas en fumador encaja con EPOC; uñas y rodilla no son patrones respiratorios relacionados.",
        },
        {
          q: "¿Por qué es importante la técnica correcta de inhalador?",
          options: [
            "Mala técnica entrega menos medicamento a los pulmones",
            "Técnica solo importa para pastillas orales",
            "Cualquier dirección del spray funciona igual",
            "Inhaladores son solo decorativos",
          ],
          answer: "A",
          explanation:
            "Depósito pulmonar depende de coordinación y uso del dispositivo. Técnica importa mucho en inhaladores, no en pastillas; dirección y mecánica afectan dosis; inhaladores son entrega activa de fármaco.",
        },
        {
          q: "¿Cuándo buscar atención de emergencia por síntomas respiratorios?",
          options: [
            "Falta de aire severa, labios azules o incapacidad para hablar en frases completas",
            "Tos leve una vez en invierno",
            "Estornudos por alergias sin dificultad respiratoria",
            "Solo después de ejercicio normal en atletas sanos jóvenes",
          ],
          answer: "A",
          explanation:
            "Dificultad respiratoria severa con signos de hipoxia es emergencia. Tos estacional leve aislada, estornudo alérgico sin disnea y respiración normal post-ejercicio en sanos son menor preocupación.",
        },
      ],
    },
  },
  {
    id: "understanding-oxygen-saturation",
    category: "Chronic Conditions",
    categoryId: "chronic-conditions",
    duration: "12 minutes",
    level: "beginner",
    en: {
      title: "Understanding Oxygen Saturation",
      description:
        "Learn what SpO2 measures, normal ranges, and when pulse oximeter readings need medical attention.",
      sidebarTitle: "Oxygen saturation",
      sidebarTips: [
        "SpO2 estimates oxygen in red blood cells.",
        "Typical healthy range is about 95–100%.",
        "Cold fingers and nail polish can skew readings.",
        "Low readings with symptoms need urgent evaluation.",
      ],
      body: `## What Is It

**Oxygen saturation (SpO2)** measures the percentage of hemoglobin in arterial blood carrying oxygen. A **pulse oximeter** — clip on finger, toe, or ear — uses light sensors to estimate SpO2 painlessly. It is widely used in clinics, hospitals, and at home for lung and heart conditions. SpO2 does not measure carbon dioxide levels or breathing effort — those require other tests like arterial blood gas.

## How It Works

Healthy lungs load oxygen onto hemoglobin as blood passes through. At sea level, **SpO2 of 95–100%** is typical for healthy adults per NIH guidance. Values **below 90%** often indicate hypoxemia needing clinical evaluation — especially with symptoms like shortness of breath, chest pain, or confusion. Chronic lung disease patients may have individual target ranges set by pulmonologists. Oximeters can be inaccurate with poor circulation, dark nail polish, motion, or certain dyshemoglobins.

:::warning
A normal SpO2 does not rule out serious illness — carbon monoxide poisoning and some lung problems can fool sensors. Seek care for trouble breathing even if the number looks fine.
:::

## Why It Matters

During COVID-19 and beyond, home oximeters helped detect silent hypoxemia. Supplemental oxygen is prescribed when sustained low saturation meets criteria — overuse without prescription wastes resources and can harm in some settings. Flight, high altitude, and sleep apnea also affect oxygen levels. ACC/AHA clinicians use saturation alongside exam and imaging for heart-lung emergencies.

## What This Means for You

Warm hands and remove nail polish before measuring. Sit still 30–60 seconds and record the steady reading. If SpO2 stays below 90% or you have breathing difficulty, seek medical care — call 911 for severe distress. Do not adjust prescribed oxygen flow without clinician direction. Tell your doctor if home readings trend downward over days.

:::info
Pediatric and high-altitude normal ranges differ slightly — compare your readings to guidance from your care team, not generic adult sea-level charts alone.
:::`,
    },
    es: {
      title: "Entendiendo la saturación de oxígeno",
      description:
        "Aprenda qué mide SpO2, rangos normales y cuándo lecturas de oxímetro requieren atención médica.",
      sidebarTitle: "Saturación de oxígeno",
      sidebarTips: [
        "SpO2 estima oxígeno en glóbulos rojos.",
        "Rango saludable típico es ~95–100%.",
        "Dedos fríos y esmalte pueden alterar lecturas.",
        "Lecturas bajas con síntomas necesitan evaluación urgente.",
      ],
      body: `## ¿Qué es?

La **saturación de oxígeno (SpO2)** mide el porcentaje de hemoglobina en sangre arterial que transporta oxígeno. Un **oxímetro de pulso** — clip en dedo, dedo del pie u oreja — usa sensores de luz para estimar SpO2 sin dolor. Se usa ampliamente en clínicas, hospitales y en casa para condiciones pulmonares y cardíacas. SpO2 no mide dióxido de carbono ni esfuerzo respiratorio — eso requiere otras pruebas como gasometría arterial.

## ¿Cómo funciona?

Pulmones sanos cargan oxígeno en hemoglobina al pasar la sangre. A nivel del mar, **SpO2 de 95–100%** es típico en adultos sanos según guía NIH. Valores **bajo 90%** a menudo indican hipoxemia que necesita evaluación clínica — especialmente con síntomas como falta de aire, dolor torácico o confusión. Pacientes con enfermedad pulmonar crónica pueden tener metas individuales con neumólogos. Oxímetros pueden ser inexactos con mala circulación, esmalte oscuro, movimiento o ciertas dishemoglobinas.

:::warning
SpO2 normal no descarta enfermedad grave — intoxicación por monóxido de carbono y algunos problemas pulmonares pueden engañar sensores. Busque atención ante dificultad respiratoria aunque el número parezca bien.
:::

## ¿Por qué importa?

Durante COVID-19 y después, oxímetros caseros ayudaron a detectar hipoxemia silenciosa. Oxígeno suplementario se receta cuando saturación baja sostenida cumple criterios — uso excesivo sin receta desperdicia recursos y puede dañar en algunos contextos. Vuelos, gran altitud y apnea del sueño también afectan oxígeno. Clínicos ACC/AHA usan saturación junto con examen e imagen en emergencias cardiopulmonares.

## Qué significa para usted

Caliente manos y retire esmalte antes de medir. Siéntese quieto 30–60 segundos y registre lectura estable. Si SpO2 permanece bajo 90% o tiene dificultad respiratoria, busque atención — llame al 911 ante angustia severa. No ajuste flujo de oxígeno recetado sin indicación clínica. Informe a su médico si lecturas caseras bajan en días.

:::info
Rangos normales pediátricos y de gran altitud difieren ligeramente — compare lecturas con guía de su equipo, no solo tablas genéricas de adultos a nivel del mar.
:::`,
    },
    quiz: {
      enTitle: "Understanding Oxygen Saturation Quiz",
      esTitle: "Cuestionario: Saturación de oxígeno",
      enQuestions: [
        {
          q: "What does a pulse oximeter SpO2 reading represent?",
          options: [
            "Estimated percentage of hemoglobin carrying oxygen",
            "Blood sugar level",
            "Heart valve function directly",
            "Liver enzyme activity",
          ],
          answer: "A",
          explanation:
            "SpO2 reflects oxyhemoglobin saturation via light absorption. It does not measure glucose, valve anatomy directly, or hepatic enzymes.",
        },
        {
          q: "Which SpO2 range is typical for healthy adults at sea level?",
          options: ["About 95% to 100%", "50% to 60%", "Exactly 70% always", "Below 40% normally"],
          answer: "A",
          explanation:
            "NIH cites roughly 95–100% as normal adult sea-level SpO2. 50–60%, fixed 70%, or below 40% indicate serious hypoxemia, not normal wellness.",
        },
        {
          q: "When is SpO2 below 90% especially concerning?",
          options: [
            "When accompanied by shortness of breath or other acute symptoms",
            "Only when measured during sleep in all people always",
            "Never — any reading is fine",
            "Only in people wearing glasses",
          ],
          answer: "A",
          explanation:
            "Hypoxemia with dyspnea or chest symptoms warrants urgent evaluation. Low SpO2 is not always benign during sleep for everyone; very low values are never fine; glasses do not define hypoxemia risk.",
        },
        {
          q: "What can falsely lower pulse oximeter accuracy?",
          options: [
            "Cold fingers, poor circulation, or dark nail polish",
            "Drinking water before the reading",
            "Sitting quietly with warm hands",
            "Using a calibrated device on the index finger",
          ],
          answer: "A",
          explanation:
            "Poor perfusion and nail pigment interfere with light signals. Hydration and proper warm still measurement improve accuracy; calibrated proper use is best practice, not a source of error.",
        },
        {
          q: "Why can a normal SpO2 still require medical attention?",
          options: [
            "Severe breathing trouble can occur before numbers drop in some conditions",
            "Oximeters diagnose every disease perfectly",
            "SpO2 above 100% is common and harmless always",
            "Carbon monoxide effects never matter",
          ],
          answer: "A",
          explanation:
            "Clinical distress matters beyond one number; oximeters are imperfect; SpO2 cannot exceed 100% meaningfully; carbon monoxide can cause tissue hypoxia with misleadingly normal SpO2.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué representa la lectura SpO2 de un oxímetro de pulso?",
          options: [
            "Porcentaje estimado de hemoglobina que transporta oxígeno",
            "Nivel de glucosa en sangre",
            "Función valvular cardíaca directamente",
            "Actividad de enzimas hepáticas",
          ],
          answer: "A",
          explanation:
            "SpO2 refleja saturación de oxihemoglobina vía absorción de luz. No mide glucosa, anatomía valvular directamente ni enzimas hepáticas.",
        },
        {
          q: "¿Qué rango de SpO2 es típico en adultos sanos a nivel del mar?",
          options: [
            "Aproximadamente 95% a 100%",
            "50% a 60%",
            "Exactamente 70% siempre",
            "Bajo 40% normalmente",
          ],
          answer: "A",
          explanation:
            "NIH cita ~95–100% como SpO2 normal en adultos a nivel del mar. 50–60%, 70% fijo o bajo 40% indican hipoxemia grave, no bienestar normal.",
        },
        {
          q: "¿Cuándo es especialmente preocupante SpO2 bajo 90%?",
          options: [
            "Cuando va acompañado de falta de aire u otros síntomas agudos",
            "Solo al medir durante sueño en todas las personas siempre",
            "Nunca — cualquier lectura está bien",
            "Solo en personas que usan gafas",
          ],
          answer: "A",
          explanation:
            "Hipoxemia con disnea o síntomas torácicos requiere evaluación urgente. SpO2 bajo no siempre es benigno en sueño para todos; valores muy bajos nunca están bien; gafas no definen riesgo de hipoxemia.",
        },
        {
          q: "¿Qué puede bajar falsamente la precisión del oxímetro?",
          options: [
            "Dedos fríos, mala circulación o esmalte oscuro",
            "Beber agua antes de la lectura",
            "Sentarse quieto con manos calientes",
            "Usar dispositivo calibrado en dedo índice",
          ],
          answer: "A",
          explanation:
            "Mala perfusión y pigmento en uñas interfieren con señales de luz. Hidratación y medición quieta con manos calientes mejoran precisión; uso calibrado correcto es buena práctica, no fuente de error.",
        },
        {
          q: "¿Por qué un SpO2 normal aún puede requerir atención médica?",
          options: [
            "Dificultad respiratoria severa puede ocurrir antes de que bajen los números en algunas condiciones",
            "Los oxímetros diagnostican toda enfermedad perfectamente",
            "SpO2 sobre 100% es común e inofensivo siempre",
            "Efectos de monóxido de carbono nunca importan",
          ],
          answer: "A",
          explanation:
            "Angustia clínica importa más allá de un número; oxímetros son imperfectos; SpO2 no puede exceder 100% de forma significativa; monóxido de carbono puede causar hipoxia tisular con SpO2 engañosamente normal.",
        },
      ],
    },
  },
  {
    id: "smoking-cessation-medicines",
    category: "Preventive Care",
    categoryId: "preventive-care",
    duration: "15 minutes",
    level: "beginner",
    en: {
      title: "Smoking Cessation Medicines",
      description:
        "Learn FDA-approved options to quit smoking, how they work, and how they combine with counseling.",
      sidebarTitle: "Quit-smoking medicines",
      sidebarTips: [
        "Nicotine replacement doubles quit rates with support.",
        "Varenicline and bupropion need prescriptions.",
        "Combine medicine with counseling when possible.",
        "Most insurers cover cessation treatment.",
      ],
      body: `## What Is It

**Smoking cessation medicines** reduce withdrawal and cravings so you can quit tobacco. FDA-approved options include **nicotine replacement therapy (NRT)** — patches, gum, lozenges, inhaler, nasal spray — and prescription **varenicline** and **bupropion**. Counseling (quitlines, behavioral therapy) significantly improves success. The USPSTF recommends clinicians offer cessation interventions to all adults who smoke.

## How It Works

Nicotine from tobacco is addictive; stopping causes irritability, craving, and concentration problems. NRT delivers controlled nicotine without most cigarette toxins, tapering dependence. **Varenicline** partially activates nicotine receptors and blocks nicotine from cigarettes, reducing reward. **Bupropion** (also an antidepressant) lessens cravings and withdrawal — mechanism is not fully nicotine-based. Combination NRT (patch plus short-acting form) often beats single product per CDC. Treatment length is typically 8–12 weeks or longer if needed — follow prescriber guidance, not self-directed megadosing.

:::warning
If you take bupropion, report mood changes or suicidal thoughts immediately. Varenicline may cause vivid dreams or nausea — discuss risks if you have psychiatric or cardiovascular history.
:::

## Why It Matters

Smoking causes cancer, COPD, heart disease, and stroke — quitting at any age adds years of life. Medicines can **double or triple** quit rates versus cold turkey alone. Pregnant smokers should seek specialized support — NRT risks must be weighed against continued smoking. E-cigarettes are not FDA-approved cessation devices; evidence favors proven therapies plus counseling.

## What This Means for You

Talk to your clinician or pharmacist about the best option for your health history. Set a quit date, remove cigarettes from your environment, and use 1-800-QUIT-NOW for free coaching. Do not smoke while on the nicotine patch — overdose causes nausea and palpitations. If one medicine fails, another approach may work. Celebrate smoke-free milestones; relapse is common — re-engage support rather than giving up.

:::info
Insurance and Medicare often cover cessation medicines without copay under preventive benefits — ask your plan before paying full retail price.
:::`,
    },
    es: {
      title: "Medicamentos para dejar de fumar",
      description:
        "Conozca opciones aprobadas por la FDA para dejar de fumar, cómo funcionan y cómo combinan con consejería.",
      sidebarTitle: "Medicinas para dejar de fumar",
      sidebarTips: [
        "Reposición de nicotina duplica tasas de éxito con apoyo.",
        "Vareniclina y bupropión requieren receta.",
        "Combine medicamento con consejería cuando sea posible.",
        "Muchos seguros cubren tratamiento para cesación.",
      ],
      body: `## ¿Qué es?

Los **medicamentos para dejar de fumar** reducen abstinencia y antojos para poder dejar el tabaco. Opciones aprobadas por la FDA incluyen **terapia de reposición de nicotina (TRN)** — parches, chicle, pastillas, inhalador, spray nasal — y **vareniclina** y **bupropión** con receta. La consejería (líneas para dejar de fumar, terapia conductual) mejora significativamente el éxito. USPSTF recomienda que clínicos ofrezcan intervenciones de cesación a todos los adultos que fuman.

## ¿Cómo funciona?

La nicotina del tabaco es adictiva; dejar causa irritabilidad, antojo y problemas de concentración. TRN entrega nicotina controlada sin la mayoría de toxinas del cigarrillo, reduciendo dependencia. **Vareniclina** activa parcialmente receptores de nicotina y bloquea nicotina de cigarrillos, reduciendo recompensa. **Bupropión** (también antidepresivo) disminuye antojos y abstinencia — mecanismo no es totalmente basado en nicotina. TRN combinada (parche más forma de acción corta) a menudo supera un solo producto según CDC. Duración típica es 8–12 semanas o más si hace falta — siga guía del prescriptor, no megadosis autodirigida.

:::warning
Si toma bupropión, reporte cambios de ánimo o pensamientos suicidas de inmediato. Vareniclina puede causar sueños vívidos o náuseas — discuta riesgos si tiene historial psiquiátrico o cardiovascular.
:::

## ¿Por qué importa?

Fumar causa cáncer, EPOC, enfermedad cardíaca y accidente cerebrovascular — dejar a cualquier edad añade años de vida. Medicamentos pueden **duplicar o triplicar** tasas de éxito versus dejar en frío solo. Fumadoras embarazadas deben buscar apoyo especializado — riesgos de TRN deben sopesarse contra seguir fumando. Cigarrillos electrónicos no son dispositivos de cesación aprobados por FDA; evidencia favorece terapias probadas más consejería.

## Qué significa para usted

Hable con clínico o farmacéutico sobre la mejor opción para su historial. Fije fecha para dejar, retire cigarrillos de su entorno y use 1-800-QUIT-NOW para coaching gratis. No fume con parche de nicotina — sobredosis causa náuseas y palpitaciones. Si un medicamento falla, otro enfoque puede funcionar. Celebre hitos sin humo; la recaída es común — reenganche apoyo en lugar de rendirse.

:::info
Seguros y Medicare a menudo cubren medicamentos de cesación sin copago en beneficios preventivos — pregunte a su plan antes de pagar precio completo.
:::`,
    },
    quiz: {
      enTitle: "Smoking Cessation Medicines Quiz",
      esTitle: "Cuestionario: Medicamentos para dejar de fumar",
      enQuestions: [
        {
          q: "Which are FDA-approved smoking cessation medicines?",
          options: [
            "Nicotine replacement, varenicline, and bupropion",
            "Only unregulated herbal cigarettes",
            "High-dose antibiotics",
            "Daily aspirin as the sole quit therapy",
          ],
          answer: "A",
          explanation:
            "NRT, varenicline, and bupropion are established FDA-approved pharmacotherapies. Herbal cigarettes are not approved quit aids; antibiotics and aspirin alone are not standard cessation drugs.",
        },
        {
          q: "How does nicotine replacement therapy help quitting?",
          options: [
            "Delivers controlled nicotine to reduce withdrawal while avoiding most cigarette toxins",
            "Makes cigarettes taste better",
            "Eliminates all nicotine addiction instantly in one day",
            "Replaces the need for any behavioral support",
          ],
          answer: "A",
          explanation:
            "NRT eases withdrawal without most combustion toxins. It does not enhance cigarette flavor, does not instantly erase addiction, and works best combined with counseling per CDC.",
        },
        {
          q: "What does the USPSTF recommend for adults who smoke?",
          options: [
            "Offer tobacco cessation interventions including pharmacotherapy when appropriate",
            "Avoid discussing smoking until age 80",
            "Only recommend quitting without any support tools",
            "Discourage all quit attempts as futile",
          ],
          answer: "A",
          explanation:
            "USPSTF strongly recommends cessation support for all adult smokers. Clinicians should address smoking at relevant visits, not delay until old age, and evidence supports tools beyond willpower alone.",
        },
        {
          q: "Why combine patch plus short-acting nicotine product?",
          options: [
            "Steady baseline plus relief for breakthrough cravings often improves quit rates",
            "It guarantees instant harm from nicotine overdose always",
            "Patches alone contain zero nicotine",
            "Short-acting forms are only for non-smokers",
          ],
          answer: "A",
          explanation:
            "Combination NRT is a CDC-supported strategy for difficult cravings. Used correctly it is not designed to overdose; patches do deliver nicotine; short-acting NRT is for people quitting smoking.",
        },
        {
          q: "What should you do if bupropion for quitting causes mood worsening?",
          options: [
            "Contact your clinician immediately — do not ignore psychiatric side effects",
            "Double the dose to push through",
            "Start smoking more to balance mood",
            "Stop all medical care permanently",
          ],
          answer: "A",
          explanation:
            "Bupropion carries neuropsychiatric monitoring needs. Doubling dose worsens risk; smoking more undermines quitting; stopping all care is unsafe — clinician guidance is required.",
        },
      ],
      esQuestions: [
        {
          q: "¿Cuáles son medicamentos aprobados por FDA para dejar de fumar?",
          options: [
            "Reposición de nicotina, vareniclina y bupropión",
            "Solo cigarrillos herbales no regulados",
            "Antibióticos en alta dosis",
            "Aspirina diaria como única terapia para dejar",
          ],
          answer: "A",
          explanation:
            "TRN, vareniclina y bupropión son farmacoterapias establecidas aprobadas por FDA. Cigarrillos herbales no son ayudas aprobadas; antibióticos y aspirina solos no son fármacos estándar de cesación.",
        },
        {
          q: "¿Cómo ayuda la terapia de reposición de nicotina a dejar?",
          options: [
            "Entrega nicotina controlada para reducir abstinencia evitando la mayoría de toxinas del cigarrillo",
            "Hace que los cigarrillos sepan mejor",
            "Elimina toda adicción a nicotina al instante en un día",
            "Reemplaza necesidad de apoyo conductual",
          ],
          answer: "A",
          explanation:
            "TRN alivia abstinencia sin la mayoría de toxinas de combustión. No mejora sabor de cigarrillos, no borra adicción al instante, y funciona mejor combinada con consejería según CDC.",
        },
        {
          q: "¿Qué recomienda USPSTF para adultos que fuman?",
          options: [
            "Ofrecer intervenciones de cesación incluyendo farmacoterapia cuando corresponda",
            "Evitar hablar de tabaco hasta los 80 años",
            "Solo recomendar dejar sin herramientas de apoyo",
            "Desalentar intentos de dejar como fútiles",
          ],
          answer: "A",
          explanation:
            "USPSTF recomienda fuertemente apoyo de cesación para todos los fumadores adultos. Clínicos deben abordar tabaco en visitas relevantes, no retrasar hasta edad avanzada, y evidencia apoya herramientas más allá de solo fuerza de voluntad.",
        },
        {
          q: "¿Por qué combinar parche más nicotina de acción corta?",
          options: [
            "Línea base estable más alivio de antojos repentinos a menudo mejora tasas de éxito",
            "Garantiza daño instantáneo por sobredosis siempre",
            "Parches solos no contienen nicotina",
            "Formas de acción corta son solo para no fumadores",
          ],
          answer: "A",
          explanation:
            "TRN combinada es estrategia apoyada por CDC para antojos difíciles. Usada correctamente no busca sobredosis; parches sí entregan nicotina; formas cortas son para quienes dejan de fumar.",
        },
        {
          q: "¿Qué hacer si bupropión para dejar causa empeoramiento del ánimo?",
          options: [
            "Contactar a su clínico de inmediato — no ignore efectos psiquiátricos",
            "Duplicar la dosis para superar",
            "Fumar más para equilibrar ánimo",
            "Detener toda atención médica permanentemente",
          ],
          answer: "A",
          explanation:
            "Bupropión requiere vigilancia neuropsiquiátrica. Duplicar dosis empeora riesgo; fumar más socava dejar; detener toda atención es inseguro — se requiere guía clínica.",
        },
      ],
    },
  },
  {
    id: "understanding-cbc",
    category: "Lab Results",
    categoryId: "lab-results",
    duration: "16 minutes",
    level: "intermediate",
    en: {
      title: "Understanding a CBC",
      description: "Learn what a complete blood count measures and what high or low results may suggest.",
      sidebarTitle: "CBC explained",
      sidebarTips: [
        "CBC measures cells — not cholesterol or glucose.",
        "Low hemoglobin may mean anemia.",
        "High WBC can follow infection or inflammation.",
        "Always interpret results with your clinician.",
      ],
      body: `## What Is It

A **complete blood count (CBC)** is one of the most common blood tests. It measures **red blood cells (RBC)**, **hemoglobin** and **hematocrit** (oxygen-carrying capacity), **white blood cells (WBC)** (immune cells), and **platelets** (clotting). A differential may list WBC subtypes — neutrophils, lymphocytes, monocytes, eosinophils, basophils. CBC is a screening tool — not a diagnosis by itself.

## How It Works

**Low hemoglobin/hematocrit** suggests anemia — causes include iron deficiency, B12 or folate deficiency, chronic disease, or blood loss. **High hemoglobin** may reflect dehydration, lung disease, smoking, or bone marrow disorders. **Low WBC** can follow viral illness, some medicines, or bone marrow problems. **High WBC** often signals infection, inflammation, stress, or rarely leukemia. **Low platelets** increase bleeding risk; **high platelets** may follow inflammation or iron deficiency. Reference ranges vary slightly by lab and sex.

:::warning
A single abnormal CBC needs clinical context — repeat testing, history, exam, and follow-up tests (iron studies, B12, reticulocyte count) clarify cause. Do not self-treat anemia with iron without confirmation.
:::

## Why It Matters

Anemia explains fatigue, weakness, and shortness of breath. Platelet disorders affect surgery and bleeding safety. WBC patterns guide infection workups. CBC is routine before surgery, during chemotherapy, and in chronic illness monitoring. Pediatric and pregnancy ranges differ from standard adult values.

## What This Means for You

Bring prior CBC results to appointments for trend comparison. Ask what each flagged value means for you — "mildly low" in one context may be urgent in another. If prescribed iron or B12, recheck labs as directed. Sudden bruising, gum bleeding, or extreme fatigue with abnormal platelets or hemoglobin warrants prompt contact with your care team.

:::info
Fasting is usually not required for CBC. Hydration and recent illness can shift counts — mention these when reviewing results.
:::`,
    },
    es: {
      title: "Entendiendo un hemograma completo",
      description:
        "Aprenda qué mide un hemograma completo (CBC) y qué pueden sugerir resultados altos o bajos.",
      sidebarTitle: "CBC explicado",
      sidebarTips: [
        "CBC mide células — no colesterol ni glucosa.",
        "Hemoglobina baja puede significar anemia.",
        "GB alto puede seguir a infección o inflamación.",
        "Interprete siempre resultados con su clínico.",
      ],
      body: `## ¿Qué es?

Un **hemograma completo (CBC)** es uno de los análisis de sangre más comunes. Mide **glóbulos rojos (GR)**, **hemoglobina** y **hematocrito** (capacidad de transporte de oxígeno), **glóbulos blancos (GB)** (células inmunes) y **plaquetas** (coagulación). Un diferencial puede listar subtipos de GB — neutrófilos, linfocitos, monocitos, eosinófilos, basófilos. CBC es herramienta de cribado — no diagnóstico por sí solo.

## ¿Cómo funciona?

**Hemoglobina/hematocrito bajos** sugieren anemia — causas incluyen deficiencia de hierro, B12 o folato, enfermedad crónica o pérdida de sangre. **Hemoglobina alta** puede reflejar deshidratación, enfermedad pulmonar, tabaco o trastornos de médula ósea. **GB bajos** pueden seguir a enfermedad viral, algunos medicamentos o problemas de médula. **GB altos** a menudo señalan infección, inflamación, estrés o raramente leucemia. **Plaquetas bajas** aumentan riesgo de sangrado; **plaquetas altas** pueden seguir a inflamación o deficiencia de hierro. Rangos de referencia varían ligeramente por laboratorio y sexo.

:::warning
Un CBC anormal aislado necesita contexto clínico — repetir pruebas, historial, examen y análisis de seguimiento (estudios de hierro, B12, reticulocitos) aclaran causa. No autotrate anemia con hierro sin confirmación.
:::

## ¿Por qué importa?

La anemia explica fatiga, debilidad y falta de aire. Trastornos plaquetarios afectan seguridad quirúrgica y sangrado. Patrones de GB orientan estudios de infección. CBC es rutinario antes de cirugía, durante quimioterapia y en monitoreo de enfermedad crónica. Rangos pediátricos y de embarazo difieren de valores adultos estándar.

## Qué significa para usted

Lleve CBC previos a citas para comparar tendencias. Pregunte qué significa cada valor marcado para usted — "ligeramente bajo" en un contexto puede ser urgente en otro. Si le recetan hierro o B12, repita análisis según indicación. Moretones súbitos, sangrado de encías o fatiga extrema con plaquetas o hemoglobina anormales requiere contacto pronto con su equipo.

:::info
Ayuno usualmente no es necesario para CBC. Hidratación y enfermedad reciente pueden cambiar conteos — menciónelo al revisar resultados.
:::`,
    },
    quiz: {
      enTitle: "Understanding a CBC Quiz",
      esTitle: "Cuestionario: Entendiendo un CBC",
      enQuestions: [
        {
          q: "What does a CBC primarily measure?",
          options: [
            "Blood cells including RBCs, WBCs, and platelets",
            "Cholesterol and triglycerides only",
            "Kidney function creatinine only",
            "Thyroid hormone TSH only",
          ],
          answer: "A",
          explanation:
            "CBC counts cellular blood components. Lipid panels, creatinine, and TSH are separate tests — not components of a standard CBC.",
        },
        {
          q: "Low hemoglobin on a CBC most often suggests which condition?",
          options: ["Anemia", "High blood sugar diabetes", "Broken bone", "Seasonal allergy"],
          answer: "A",
          explanation:
            "Hemoglobin carries oxygen; low values define anemia. Diabetes, fractures, and allergies are not directly diagnosed by low hemoglobin alone on CBC.",
        },
        {
          q: "Why might white blood cell count be elevated?",
          options: [
            "Infection, inflammation, or physiological stress",
            "Only because of drinking water",
            "Always means leukemia with no other causes",
            "WBC never changes in illness",
          ],
          answer: "A",
          explanation:
            "Leukocytosis commonly follows infection and inflammation. Hydration alone does not typically spike WBC; leukemia is one rare cause among many; WBC clearly shifts with illness.",
        },
        {
          q: "Why should you avoid starting iron supplements solely because of fatigue?",
          options: [
            "Anemia cause should be confirmed — excess iron can be harmful",
            "Iron never treats anemia",
            "CBC never detects low hemoglobin",
            "Fatigue only comes from lack of sleep always",
          ],
          answer: "A",
          explanation:
            "Iron helps iron-deficiency anemia but harms if given unnecessarily. Iron does treat deficiency; CBC detects low hemoglobin; fatigue has many causes beyond sleep alone.",
        },
        {
          q: "What do low platelets (thrombocytopenia) increase risk for?",
          options: [
            "Bleeding and bruising",
            "Improved blood clotting always",
            "Higher oxygen saturation automatically",
            "Lower infection risk always",
          ],
          answer: "A",
          explanation:
            "Platelets enable clotting; low counts raise bleeding risk. Thrombocytopenia does not improve clotting, raise SpO2, or universally prevent infection.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué mide principalmente un CBC?",
          options: [
            "Células sanguíneas incluyendo GR, GB y plaquetas",
            "Solo colesterol y triglicéridos",
            "Solo creatinina de función renal",
            "Solo hormona tiroidea TSH",
          ],
          answer: "A",
          explanation:
            "CBC cuenta componentes celulares de sangre. Perfiles lipídicos, creatinina y TSH son pruebas separadas — no componentes de un CBC estándar.",
        },
        {
          q: "¿Hemoglobina baja en CBC sugiere más a menudo qué condición?",
          options: ["Anemia", "Diabetes con glucosa alta", "Hueso roto", "Alergia estacional"],
          answer: "A",
          explanation:
            "Hemoglobina transporta oxígeno; valores bajos definen anemia. Diabetes, fracturas y alergias no se diagnostican directamente solo por hemoglobina baja en CBC.",
        },
        {
          q: "¿Por qué el conteo de glóbulos blancos puede estar elevado?",
          options: [
            "Infección, inflamación o estrés fisiológico",
            "Solo por beber agua",
            "Siempre significa leucemia sin otras causas",
            "GB nunca cambia en enfermedad",
          ],
          answer: "A",
          explanation:
            "Leucocitosis comúnmente sigue a infección e inflamación. Hidratación sola no eleva típicamente GB; leucemia es causa rara entre muchas; GB claramente cambia con enfermedad.",
        },
        {
          q: "¿Por qué evitar iniciar suplementos de hierro solo por fatiga?",
          options: [
            "Debe confirmarse causa de anemia — exceso de hierro puede dañar",
            "Hierro nunca trata anemia",
            "CBC nunca detecta hemoglobina baja",
            "Fatiga solo viene de falta de sueño siempre",
          ],
          answer: "A",
          explanation:
            "Hierro ayuda anemia ferropénica pero daña si se da innecesariamente. Hierro sí trata deficiencia; CBC detecta hemoglobina baja; fatiga tiene muchas causas además del sueño.",
        },
        {
          q: "¿Qué riesgo aumentan plaquetas bajas (trombocitopenia)?",
          options: [
            "Sangrado y moretones",
            "Coagulación mejorada siempre",
            "Saturación de oxígeno más alta automáticamente",
            "Menor riesgo de infección siempre",
          ],
          answer: "A",
          explanation:
            "Plaquetas permiten coagulación; conteos bajos elevan riesgo de sangrado. Trombocitopenia no mejora coagulación, eleva SpO2 ni previene infección universalmente.",
        },
      ],
    },
  },
  {
    id: "understanding-a1c",
    category: "Lab Results",
    categoryId: "lab-results",
    duration: "14 minutes",
    level: "beginner",
    en: {
      title: "Understanding A1c",
      description:
        "Learn what the A1c test measures, how it reflects blood sugar over time, and what results mean.",
      sidebarTitle: "A1c explained",
      sidebarTips: [
        "A1c reflects ~3 months of glucose.",
        "Diabetes is generally A1c 6.5% or higher.",
        "Prediabetes is 5.7% to 6.4%.",
        "Targets are individualized with your clinician.",
      ],
      body: `## What Is It

The **A1c** (hemoglobin A1c or HbA1c) test measures the percentage of hemoglobin coated with glucose, reflecting average blood sugar over roughly the **past two to three months**. Unlike a fingerstick glucose snapshot, A1c shows longer-term glycemic exposure. It is used to **diagnose** diabetes and prediabetes and to **monitor** treatment in people with diabetes per ADA criteria.

## How It Works

Glucose in blood attaches to hemoglobin in red blood cells for the cell's lifespan (~120 days). Higher average glucose yields a higher A1c. ADA thresholds: **A1c ≥6.5%** diagnoses diabetes (confirmed on repeat testing unless symptoms are present); **5.7–6.4%** is prediabetes; **below 5.7%** is usually normal in adults. Many people with diabetes aim below **7%** — or stricter/higher targets based on age, hypoglycemia risk, and comorbidities. Conditions affecting red blood cells (anemia, hemoglobin variants, recent transfusion) can skew A1c — clinicians may use glucose tests instead.

:::info
A1c does not replace daily glucose monitoring when on insulin or sulfonylureas — severe highs and lows can average out to a misleading A1c.
:::

## Why It Matters

Long-term high glucose damages eyes, kidneys, nerves, and vessels. Lowering A1c reduces complication risk, but overly aggressive targets in frail elders raise hypoglycemia harm. A1c helps track whether lifestyle and medicines are working. Pregnancy uses different glucose testing — standard A1c is not used to diagnose gestational diabetes.

## What This Means for You

Know your last A1c and discuss personal goals with your clinician. Improve A1c through balanced eating, activity, weight management, and prescribed medicines — not extreme restriction without guidance. Repeat A1c every three to six months when adjusting therapy. If results do not match home glucose readings, ask about anemia, kidney disease, or variant hemoglobin effects.

:::warning
Prediabetes (A1c 5.7–6.4%) is a chance to act — CDC-led lifestyle programs can cut progression to type 2 diabetes. Do not ignore borderline results because you feel well.
:::`,
    },
    es: {
      title: "Entendiendo la A1c",
      description:
        "Aprenda qué mide la prueba A1c, cómo refleja glucosa en el tiempo y qué significan los resultados.",
      sidebarTitle: "A1c explicada",
      sidebarTips: [
        "A1c refleja ~3 meses de glucosa.",
        "Diabetes es generalmente A1c 6.5% o más.",
        "Prediabetes es 5.7% a 6.4%.",
        "Las metas se individualizan con su clínico.",
      ],
      body: `## ¿Qué es?

La prueba **A1c** (hemoglobina A1c o HbA1c) mide el porcentaje de hemoglobina recubierta de glucosa, reflejando glucosa promedio en sangre durante aproximadamente los **últimos dos a tres meses**. A diferencia de una medición puntual de glucosa, A1c muestra exposición glucémica a más largo plazo. Se usa para **diagnosticar** diabetes y prediabetes y para **monitorear** tratamiento en personas con diabetes según criterios ADA.

## ¿Cómo funciona?

La glucosa en sangre se une a hemoglobina en glóbulos rojos durante la vida de la célula (~120 días). Mayor glucosa promedio produce A1c más alta. Umbrales ADA: **A1c ≥6.5%** diagnostica diabetes (confirmado en repetición salvo síntomas); **5.7–6.4%** es prediabetes; **bajo 5.7%** suele ser normal en adultos. Muchas personas con diabetes apuntan bajo **7%** — o metas más estrictas/altas según edad, riesgo de hipoglucemia y comorbilidades. Condiciones que afectan glóbulos rojos (anemia, variantes de hemoglobina, transfusión reciente) pueden alterar A1c — clínicos pueden usar pruebas de glucosa en su lugar.

:::info
A1c no reemplaza monitoreo glucémico diario con insulina o sulfonilureas — picos y caídas severas pueden promediarse a una A1c engañosa.
:::

## ¿Por qué importa?

Glucosa alta a largo plazo daña ojos, riñones, nervios y vasos. Bajar A1c reduce riesgo de complicaciones, pero metas demasiado agresivas en ancianos frágiles elevan daño por hipoglucemia. A1c ayuda a ver si estilo de vida y medicinas funcionan. Embarazo usa pruebas de glucosa distintas — A1c estándar no diagnostica diabetes gestacional.

## Qué significa para usted

Conozca su última A1c y discuta metas personales con su clínico. Mejore A1c con alimentación equilibrada, actividad, peso y medicinas recetadas — no restricción extrema sin guía. Repita A1c cada tres a seis meses al ajustar terapia. Si resultados no coinciden con lecturas caseras, pregunte por anemia, enfermedad renal o efectos de hemoglobina variante.

:::warning
Prediabetes (A1c 5.7–6.4%) es oportunidad de actuar — programas de estilo de vida del CDC pueden reducir progresión a diabetes tipo 2. No ignore resultados limítrofes porque se sienta bien.
:::`,
    },
    quiz: {
      enTitle: "Understanding A1c Quiz",
      esTitle: "Cuestionario: Entendiendo la A1c",
      enQuestions: [
        {
          q: "What time period does A1c roughly reflect?",
          options: [
            "Average blood glucose over about 2 to 3 months",
            "Only the last meal eaten",
            "Blood pressure over one week",
            "Cholesterol for six years",
          ],
          answer: "A",
          explanation:
            "A1c integrates glycation over red blood cell lifespan (~120 days). It is not meal-specific, does not measure BP, and is unrelated to cholesterol duration.",
        },
        {
          q: "Which A1c range does ADA use for prediabetes?",
          options: ["5.7% to 6.4%", "Below 4.0%", "8.0% to 9.0% only", "Exactly 10% always"],
          answer: "A",
          explanation:
            "ADA prediabetes is 5.7–6.4%; diabetes ≥6.5%. Below 4% is abnormally low; 8–10% suggests diabetes, not prediabetes band definition.",
        },
        {
          q: "At what A1c is diabetes generally diagnosed (with confirmation rules)?",
          options: ["6.5% or higher", "4.0% exactly", "3.0% or lower", "9.9% only on Tuesdays"],
          answer: "A",
          explanation:
            "ADA diagnostic threshold for diabetes is A1c ≥6.5% with repeat confirmation when asymptomatic. 4% and 3% are not diabetes thresholds; arbitrary day-specific cutoffs are not clinical criteria.",
        },
        {
          q: "Why might A1c disagree with daily glucose meter readings?",
          options: [
            "Anemia or hemoglobin variants can falsely lower or raise A1c",
            "Meters and A1c always match perfectly",
            "A1c measures insulin dose directly",
            "Home glucose never varies",
          ],
          answer: "A",
          explanation:
            "RBC turnover and hemoglobin variants affect glycation measurement. Perfect match is not guaranteed; A1c is not an insulin assay; home glucose varies daily.",
        },
        {
          q: "Why act on prediabetes even without symptoms?",
          options: [
            "Lifestyle change can slow or prevent progression to type 2 diabetes",
            "Prediabetes means you already need insulin always",
            "A1c cannot detect prediabetes",
            "Only children get prediabetes",
          ],
          answer: "A",
          explanation:
            "DPP and CDC programs show progression can be reduced. Prediabetes does not mandate immediate insulin; A1c defines prediabetes band; adults commonly have prediabetes.",
        },
      ],
      esQuestions: [
        {
          q: "¿Qué período refleja aproximadamente la A1c?",
          options: [
            "Glucosa promedio en sangre durante unos 2 a 3 meses",
            "Solo la última comida",
            "Presión arterial de una semana",
            "Colesterol de seis años",
          ],
          answer: "A",
          explanation:
            "A1c integra glicación durante vida de glóbulo rojo (~120 días). No es específica de comida, no mide presión y no se relaciona con duración de colesterol.",
        },
        {
          q: "¿Qué rango de A1c usa ADA para prediabetes?",
          options: ["5.7% a 6.4%", "Bajo 4.0%", "Solo 8.0% a 9.0%", "Exactamente 10% siempre"],
          answer: "A",
          explanation:
            "Prediabetes ADA es 5.7–6.4%; diabetes ≥6.5%. Bajo 4% es anormalmente bajo; 8–10% sugiere diabetes, no banda de prediabetes.",
        },
        {
          q: "¿A qué A1c se diagnostica generalmente diabetes (con reglas de confirmación)?",
          options: ["6.5% o más", "Exactamente 4.0%", "3.0% o menos", "Solo 9.9% los martes"],
          answer: "A",
          explanation:
            "Umbral diagnóstico ADA para diabetes es A1c ≥6.5% con confirmación repetida si asintomático. 4% y 3% no son umbrales de diabetes; cortes arbitrarios por día no son criterio clínico.",
        },
        {
          q: "¿Por qué A1c puede no coincidir con lecturas diarias de glucómetro?",
          options: [
            "Anemia o variantes de hemoglobina pueden bajar o subir falsamente A1c",
            "Medidores y A1c siempre coinciden perfectamente",
            "A1c mide dosis de insulina directamente",
            "Glucosa casera nunca varía",
          ],
          answer: "A",
          explanation:
            "Renovación de GR y variantes de hemoglobina afectan medición de glicación. Coincidencia perfecta no está garantizada; A1c no es ensayo de insulina; glucosa casera varía diariamente.",
        },
        {
          q: "¿Por qué actuar ante prediabetes aunque no haya síntomas?",
          options: [
            "Cambio de estilo de vida puede frenar o prevenir progresión a diabetes tipo 2",
            "Prediabetes significa que siempre necesita insulina",
            "A1c no puede detectar prediabetes",
            "Solo niños tienen prediabetes",
          ],
          answer: "A",
          explanation:
            "DPP y programas CDC muestran que progresión puede reducirse. Prediabetes no exige insulina inmediata; A1c define banda de prediabetes; adultos comúnmente tienen prediabetes.",
        },
      ],
    },
  },
];

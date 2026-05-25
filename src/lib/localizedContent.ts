import { glossaryTerms } from "@/data/glossary";
import { learningPaths } from "@/data/learningPaths";
import { lessons } from "@/data/lessons";
import type { Locale } from "@/lib/i18n";

const esLearningPathCopy: Record<string, { title: string; description: string; duration: string }> = {
  "safer-medicine-use": {
    title: "Uso más seguro de medicamentos",
    description: "Aprende a tomar y organizar tus medicinas de forma segura, entender las etiquetas y evitar interacciones.",
    duration: "30 minutos",
  },
  "doctor-visit-prep": {
    title: "Prepararte para tus consultas médicas",
    description: "Llega a tus citas con más confianza sabiendo qué llevar, qué preguntar y cómo dar seguimiento.",
    duration: "25 minutos",
  },
  "understanding-labs": {
    title: "Entender los resultados de laboratorio",
    description: "Aprende a leer análisis de sangre comunes y a comprender qué significan los números para tu salud.",
    duration: "40 minutos",
  },
};

type LessonTranslation = {
  title: string;
  description: string;
  category: string;
  duration: string;
  sections?: {
    title: string;
    content: string;
    callouts?: string[];
  }[];
};

const esLessonCopy: Record<string, LessonTranslation> = {
  "understanding-prescription-labels": {
    title: "Entender las etiquetas de receta",
    description: "Aprende a leer y entender las etiquetas de tus medicinas para tomarlas de forma segura.",
    category: "Seguridad con medicamentos",
    duration: "15 minutos",
    sections: [
      {
        title: "¿Qué es una etiqueta de receta?",
        content: "La etiqueta de receta es la información adherida al frasco o empaque de tu medicina. Te indica cómo tomarla de manera segura e incluye datos importantes como la dosis, cuándo tomarla y cualquier instrucción especial.",
      },
      {
        title: "Partes clave de una etiqueta",
        content: "Toda etiqueta de receta tiene varias partes importantes:\n\n1. Tu nombre: para confirmar que la medicina es para ti\n2. Nombre y concentración del medicamento: qué medicina es y qué tan fuerte es\n3. Dosis: cuánto debes tomar\n4. Frecuencia: cada cuánto debes tomarla\n5. Instrucciones especiales: advertencias o indicaciones especiales\n6. Fecha de vencimiento: cuándo deja de ser seguro usarla",
        callouts: ["Siempre verifica que tu nombre esté en la etiqueta antes de tomar cualquier medicina."],
      },
      {
        title: "Cómo entender la dosis",
        content: "Las instrucciones de dosis te dicen exactamente cuánto medicamento tomar y cuándo hacerlo. Ejemplos comunes:\n\n- \"Toma una tableta al día\" significa una pastilla todos los días a la misma hora\n- \"Tómalo con comida\" significa comer algo antes de tomar la medicina\n- \"Tómalo con el estómago vacío\" significa esperar 2 horas después de comer o 1 hora antes de comer\n- \"Dos veces al día\" normalmente significa por la mañana y por la noche",
        callouts: ["Nunca tomes más de la cantidad indicada. Si olvidas una dosis, pregunta a tu farmacéutico qué debes hacer."],
      },
      {
        title: "Advertencias especiales",
        content: "Las etiquetas de receta pueden incluir advertencias especiales como:\n\n- \"Puede causar sueño\": la medicina podría darte somnolencia, así que no manejes\n- \"Evita el alcohol\": beber alcohol con esta medicina puede ser peligroso\n- \"Guardar en un lugar fresco y seco\": mantén la medicina lejos del calor y la humedad\n- \"Agitar bien antes de usar\": en medicinas líquidas, mézclala antes de servirla",
      },
      {
        title: "Preguntas para tu farmacéutico",
        content: "Si algo en la etiqueta no está claro, pregunta a tu farmacéutico:\n\n1. ¿Para qué sirve esta medicina?\n2. ¿Cómo y cuándo debo tomarla?\n3. ¿Qué hago si olvido una dosis?\n4. ¿Qué efectos secundarios debo conocer?\n5. ¿Puedo tomarla con mis otras medicinas?",
        callouts: ["Tu farmacéutico está para ayudarte. Nunca dudes en hacer preguntas sobre tus medicamentos."],
      },
    ],
  },
  "asking-about-medications": {
    title: "Preguntar sobre tus medicamentos",
    description: "Aprende qué preguntas hacer a tu médico o farmacéutico sobre una medicina nueva.",
    category: "Seguridad con medicamentos",
    duration: "10 minutos",
    sections: [
      {
        title: "¿Por qué hacer preguntas?",
        content: "Hacer preguntas sobre tus medicamentos te ayuda a entender qué estás tomando y por qué. Puede prevenir errores, efectos secundarios e interacciones peligrosas. Tienes derecho a saber lo necesario sobre tus medicinas.",
      },
      {
        title: "Preguntas esenciales",
        content: "Cuando tu médico te receta una medicina nueva, pregunta:\n\n1. ¿Cómo se llama la medicina?\n2. ¿Para qué sirve?\n3. ¿Cómo y cuándo debo tomarla?\n4. ¿Por cuánto tiempo debo tomarla?\n5. ¿Qué efectos secundarios debo vigilar?\n6. ¿Hay alimentos o bebidas que debo evitar?\n7. ¿Qué debo hacer si olvido una dosis?",
      },
      {
        title: "Sobre las interacciones",
        content: "Las interacciones ocurren cuando dos o más medicinas reaccionan entre sí. Siempre informa a tu médico y farmacéutico sobre:\n\n- Todas tus medicinas con receta\n- Medicinas de venta libre\n- Vitaminas y suplementos\n- Remedios herbales\n- Cualquier alergia que tengas",
        callouts: ["Lleva una lista de todas tus medicinas y muéstrala en cada consulta médica."],
      },
    ],
  },
  "managing-side-effects": {
    title: "Manejar los efectos secundarios",
    description: "Aprende qué efectos secundarios pueden ser normales y cuándo debes llamar a tu médico.",
    category: "Seguridad con medicamentos",
    duration: "12 minutos",
    sections: [
      {
        title: "¿Qué son los efectos secundarios?",
        content: "Los efectos secundarios son reacciones no deseadas a un medicamento. Pueden variar desde algo leve, como resequedad en la boca, hasta algo grave, como una reacción alérgica. No todas las personas los presentan y a veces desaparecen cuando el cuerpo se adapta.",
      },
      {
        title: "Efectos secundarios leves comunes",
        content: "Estos efectos secundarios suelen no ser graves y pueden desaparecer solos:\n\n- Náusea o malestar estomacal\n- Sueño o mareo\n- Boca seca\n- Dolor de cabeza\n- Sarpullido leve o comezón\n\nSi te molestan, habla con tu médico o farmacéutico para recibir orientación.",
      },
      {
        title: "Cuándo llamar al médico",
        content: "Llama a tu médico de inmediato si presentas:\n\n- Dificultad para respirar o tragar\n- Sarpullido severo o ronchas\n- Hinchazón en cara, labios o lengua\n- Mareo intenso o desmayo\n- Dolor de pecho o latidos rápidos\n- Dolor de estómago intenso o vómito\n- Color amarillo en piel u ojos\n- Sangrado o moretones inusuales",
        callouts: ["Si crees que tienes una reacción grave, llama al 911 o ve a la sala de emergencia."],
      },
    ],
  },
  "before-your-visit": {
    title: "Antes de tu consulta médica",
    description: "Prepárate para aprovechar mejor el tiempo con tu médico.",
    category: "Consultas médicas",
    duration: "10 minutos",
    sections: [
      {
        title: "Reúne tu información",
        content: "Antes de tu cita, reúne estos elementos importantes:\n\n- Tarjeta del seguro e identificación\n- Lista de todas tus medicinas actuales\n- Historial médico, si verás a un médico nuevo\n- Resultados previos o expedientes\n- Lista de síntomas y cuándo comenzaron\n- Preguntas que quieres hacer",
      },
      {
        title: "Anota tus síntomas",
        content: "Sé específico sobre tus síntomas. Para cada uno, anota:\n\n- Cuándo empezó\n- Con qué frecuencia ocurre\n- Qué lo mejora o empeora\n- Qué tan fuerte es, por ejemplo del 1 al 10\n- Qué otros síntomas pasan al mismo tiempo",
      },
      {
        title: "Prepara tus preguntas",
        content: "Escribe tus preguntas antes de la visita y coloca primero las más importantes. Algunas buenas preguntas son:\n\n- ¿Qué podría estar causando mis síntomas?\n- ¿Qué pruebas necesito?\n- ¿Cuáles son mis opciones de tratamiento?\n- ¿Qué debo hacer si empeoro?\n- ¿Cuándo debo volver a consulta?",
        callouts: ["Lleva libreta y pluma para anotar lo que diga tu médico."],
      },
    ],
  },
  "during-your-visit": {
    title: "Durante tu consulta médica",
    description: "Aprende a comunicarte con claridad y confianza durante tu cita.",
    category: "Consultas médicas",
    duration: "10 minutos",
    sections: [
      {
        title: "Sé honesto y completo",
        content: "Cuéntale a tu médico todo sobre tu salud, incluso si algo te da pena. Necesita la historia completa para ayudarte. No omitas información, incluyendo:\n\n- Todas las medicinas que tomas\n- Hábitos de vida como fumar, alcohol o ejercicio\n- Cambios recientes en tu salud\n- Preocupaciones o miedos que tengas",
      },
      {
        title: "Pide aclaraciones",
        content: "Si tu médico usa términos que no entiendes, pídele que te los explique con lenguaje sencillo. Puedes decir:\n\n- \"¿Puede explicarlo con palabras más simples?\"\n- \"¿Qué significa esa palabra?\"\n- \"¿Puede escribirlo para mí?\"\n- \"¿Me puede dar un ejemplo?\"",
      },
      {
        title: "Toma notas",
        content: "Anota información importante durante tu visita, como:\n\n- Tu diagnóstico\n- Tu plan de tratamiento\n- Instrucciones sobre medicamentos\n- Cuándo debes regresar\n- Señales de alerta que debes vigilar",
        callouts: ["Está bien pedir a tu médico que hable más despacio o repita algo."],
      },
    ],
  },
  "after-your-visit": {
    title: "Después de tu consulta médica",
    description: "Da seguimiento a tu plan de cuidado y mantén un registro de tu salud.",
    category: "Consultas médicas",
    duration: "8 minutos",
    sections: [
      {
        title: "Revisa tus instrucciones",
        content: "Tan pronto llegues a casa, revisa lo que te explicó tu médico. Asegúrate de entender:\n\n- Qué medicinas tomar y cuándo\n- Qué cambios de hábitos necesitas hacer\n- Cuándo programar seguimiento\n- Qué hacer si tus síntomas empeoran",
      },
      {
        title: "Surte tus recetas",
        content: "Si tu médico te recetó medicina:\n\n- Ve a la farmacia lo antes posible\n- Lleva tu tarjeta de seguro\n- Haz preguntas al farmacéutico\n- Lee cuidadosamente la etiqueta antes de tomar la medicina",
      },
      {
        title: "Da seguimiento a tu progreso",
        content: "Lleva un registro de salud para seguir:\n\n- Tus síntomas y cómo cambian\n- Efectos secundarios de medicinas\n- Preguntas que surjan entre visitas\n- Mejorías o empeoramientos",
        callouts: ["Lleva tu registro de salud a la próxima cita para ayudar a tu médico a entender tu progreso."],
      },
    ],
  },
  "blood-basics": {
    title: "Conceptos básicos de análisis de sangre",
    description: "Entiende qué miden los análisis de sangre y por qué son importantes.",
    category: "Resultados de laboratorio",
    duration: "15 minutos",
    sections: [
      {
        title: "¿Por qué se hacen análisis?",
        content: "Los análisis de sangre ayudan a los médicos a entender qué pasa dentro de tu cuerpo. Pueden mostrar:\n\n- Qué tan bien funcionan tus órganos\n- Si tienes ciertas enfermedades o condiciones\n- Cómo están funcionando los medicamentos\n- Si tu sistema inmune está combatiendo una infección",
      },
      {
        title: "Análisis de sangre comunes",
        content: "Algunos análisis de sangre frecuentes incluyen:\n\n- Biometría hemática completa: mide distintas partes de tu sangre\n- Panel metabólico básico: revisa riñones, electrolitos y azúcar\n- Perfil de lípidos: mide colesterol y triglicéridos\n- Prueba de glucosa: revisa azúcar en sangre\n- Panel tiroideo: revisa el funcionamiento de la tiroides",
      },
      {
        title: "Cómo entender los rangos de referencia",
        content: "Los resultados comparan tus números con un \"rango de referencia\", que es el rango considerado normal para la mayoría de las personas. Tu resultado puede estar:\n\n- Dentro del rango normal\n- Arriba del rango normal\n- Debajo del rango normal\n\nEstar un poco fuera del rango no siempre significa un problema. Tu médico revisará el panorama completo.",
        callouts: ["Los rangos pueden variar según el laboratorio, la edad y el sexo. Pide a tu médico que te explique tus resultados."],
      },
    ],
  },
  "common-tests": {
    title: "Entender análisis de laboratorio comunes",
    description: "Aprende qué miden pruebas específicas y qué pueden significar los resultados anormales.",
    category: "Resultados de laboratorio",
    duration: "20 minutos",
    sections: [
      {
        title: "Biometría hemática completa (CBC)",
        content: "Una biometría hemática completa mide varias partes de tu sangre:\n\n- Glóbulos rojos: llevan oxígeno por el cuerpo\n- Glóbulos blancos: combaten infecciones\n- Plaquetas: ayudan a coagular la sangre\n- Hemoglobina: proteína que transporta oxígeno\n- Hematocrito: porcentaje de sangre formado por glóbulos rojos",
      },
      {
        title: "Prueba de colesterol",
        content: "Las pruebas de colesterol miden distintos tipos de grasa en tu sangre:\n\n- Colesterol total\n- LDL o colesterol malo\n- HDL o colesterol bueno\n- Triglicéridos",
        callouts: ["Tener LDL alto y HDL bajo puede aumentar tu riesgo de enfermedad del corazón."],
      },
      {
        title: "Pruebas de azúcar en sangre",
        content: "Las pruebas de azúcar ayudan a detectar diabetes o prediabetes:\n\n- Glucosa en ayuno\n- A1C, que muestra el promedio de azúcar de los últimos 2 a 3 meses\n- Prueba de tolerancia a la glucosa, que evalúa cómo maneja tu cuerpo el azúcar",
      },
    ],
  },
  "when-to-worry": {
    title: "Cuándo preocuparte por resultados de laboratorio",
    description: "Aprende qué resultados requieren atención inmediata y cuáles pueden esperar.",
    category: "Resultados de laboratorio",
    duration: "10 minutos",
    sections: [
      {
        title: "Resultados que necesitan atención rápida",
        content: "Llama a tu médico de inmediato si tus resultados muestran:\n\n- Azúcar en sangre muy baja o muy alta\n- Señales de infección\n- Problemas renales\n- Problemas hepáticos\n- Anemia severa",
        callouts: ["Si no puedes localizar a tu médico y te sientes muy mal, ve a urgencias o a la sala de emergencia."],
      },
      {
        title: "Resultados para vigilar",
        content: "Algunos resultados anormales requieren atención pero no son emergencias:\n\n- Colesterol ligeramente alto\n- Azúcar un poco elevada\n- Niveles tiroideos un poco altos o bajos\n- Anemia leve\n\nTu médico puede repetir la prueba más adelante o recomendar cambios de hábitos.",
      },
      {
        title: "Preguntas para tu médico",
        content: "Cuando hables de resultados anormales, pregunta:\n\n- ¿Qué tan serio es este resultado?\n- ¿Qué podría causarlo?\n- ¿Necesito más pruebas?\n- ¿Qué tratamiento necesito?\n- ¿Cómo vamos a vigilarlo?\n- ¿Qué cambios debo hacer?",
      },
    ],
  },
};

const esGlossaryCopy: Record<string, { term: string; definition: string; category: string }> = {
  "blood-pressure": { term: "Presión arterial", definition: "La fuerza con la que la sangre empuja las paredes de tus arterias. Se mide con dos números: sistólica sobre diastólica.", category: "General" },
  hypertension: { term: "Hipertensión", definition: "Presión arterial alta. Puede dañar los vasos sanguíneos y aumentar el riesgo de enfermedad cardíaca y derrame cerebral.", category: "Condiciones" },
  hypotension: { term: "Hipotensión", definition: "Presión arterial baja. Puede causar mareo, desmayo o cansancio y debe evaluarse si produce síntomas.", category: "Condiciones" },
  cholesterol: { term: "Colesterol", definition: "Sustancia cerosa similar a la grasa que existe en las células del cuerpo. Demasiado colesterol puede acumularse en las arterias.", category: "General" },
  ldl: { term: "Colesterol LDL", definition: "Lipoproteína de baja densidad, conocida como colesterol malo. Puede acumularse en las arterias.", category: "Resultados de laboratorio" },
  hdl: { term: "Colesterol HDL", definition: "Lipoproteína de alta densidad, conocida como colesterol bueno. Ayuda a eliminar LDL de las arterias.", category: "Resultados de laboratorio" },
  triglycerides: { term: "Triglicéridos", definition: "Tipo de grasa en la sangre que el cuerpo usa para obtener energía. Niveles altos aumentan el riesgo cardiovascular.", category: "Resultados de laboratorio" },
  diabetes: { term: "Diabetes", definition: "Enfermedad crónica que afecta cómo el cuerpo convierte los alimentos en energía. Puede causar niveles altos de azúcar en sangre.", category: "Condiciones" },
  "blood-sugar": { term: "Azúcar en sangre", definition: "También llamada glucosa en sangre. Es la principal fuente de energía del cuerpo y está controlada por la insulina.", category: "General" },
  glucose: { term: "Glucosa", definition: "Azúcar simple que sirve como fuente principal de energía para el cuerpo.", category: "General" },
  insulin: { term: "Insulina", definition: "Hormona producida por el páncreas que ayuda a que la glucosa entre a las células para usarse como energía.", category: "General" },
  chronic: { term: "Crónico", definition: "Condición de salud que dura mucho tiempo y a menudo requiere manejo continuo.", category: "General" },
  acute: { term: "Agudo", definition: "Condición de salud que aparece de repente y suele durar poco tiempo.", category: "General" },
  symptom: { term: "Síntoma", definition: "Problema físico o mental que siente una persona y que puede indicar una enfermedad o condición.", category: "General" },
  sign: { term: "Signo", definition: "Algo que un profesional de salud puede observar o medir durante un examen, como fiebre o presión alta.", category: "General" },
  diagnosis: { term: "Diagnóstico", definition: "Proceso de identificar una enfermedad o condición a partir de síntomas, historia clínica y resultados de pruebas.", category: "General" },
  prognosis: { term: "Pronóstico", definition: "La evolución o resultado probable de una enfermedad o condición con el tiempo.", category: "General" },
  "side-effect": { term: "Efecto secundario", definition: "Efecto no deseado que puede aparecer al tomar un medicamento.", category: "Medicamentos" },
  dosage: { term: "Dosis", definition: "Cantidad de medicamento que debes tomar y con qué frecuencia.", category: "Medicamentos" },
  "generic-drug": { term: "Medicamento genérico", definition: "Medicamento con los mismos ingredientes activos que uno de marca, usualmente a menor costo.", category: "Medicamentos" },
  prescription: { term: "Receta médica", definition: "Orden escrita de un médico para recibir un medicamento o tratamiento.", category: "Medicamentos" },
  "over-the-counter": { term: "De venta libre (OTC)", definition: "Medicamentos que puedes comprar sin receta, aunque aún pueden tener riesgos e interacciones.", category: "Medicamentos" },
  biopsy: { term: "Biopsia", definition: "Procedimiento en el que se extrae una pequeña muestra de tejido para examinarla.", category: "Procedimientos" },
  "ct-scan": { term: "Tomografía computarizada", definition: "Prueba de imagen que usa rayos X y una computadora para crear imágenes detalladas del cuerpo.", category: "Procedimientos" },
  mri: { term: "Resonancia magnética", definition: "Prueba que usa imanes y ondas de radio para crear imágenes detalladas del cuerpo.", category: "Procedimientos" },
  ultrasound: { term: "Ultrasonido", definition: "Prueba que usa ondas sonoras para crear imágenes del interior del cuerpo.", category: "Procedimientos" },
  inflammation: { term: "Inflamación", definition: "Respuesta del cuerpo a una lesión o infección que puede causar enrojecimiento, hinchazón, calor o dolor.", category: "General" },
  "immune-system": { term: "Sistema inmunitario", definition: "Sistema de defensa del cuerpo contra infecciones y enfermedades.", category: "General" },
  metabolism: { term: "Metabolismo", definition: "Procesos químicos del cuerpo que convierten alimentos y bebidas en energía.", category: "General" },
  placebo: { term: "Placebo", definition: "Sustancia sin ingredientes activos que se usa como comparación en estudios médicos.", category: "Investigación" },
  "clinical-trial": { term: "Ensayo clínico", definition: "Estudio de investigación que prueba tratamientos, medicamentos o dispositivos médicos en personas.", category: "Investigación" },
};

export function getLearningPaths(locale: Locale) {
  if (locale === "en") {
    return learningPaths;
  }

  return learningPaths.map((path) => ({
    ...path,
    ...esLearningPathCopy[path.id],
  }));
}

export function getLessons(locale: Locale) {
  if (locale === "en") {
    return lessons;
  }

  return lessons.map((lesson) => {
    const translation = esLessonCopy[lesson.id];
    return {
      ...lesson,
      title: translation?.title ?? lesson.title,
      description: translation?.description ?? lesson.description,
      category: translation?.category ?? lesson.category,
      duration: translation?.duration ?? lesson.duration,
      content: {
        sections: lesson.content.sections.map((section, index) => ({
          ...section,
          title: translation?.sections?.[index]?.title ?? section.title,
          content: translation?.sections?.[index]?.content ?? section.content,
          callouts: section.callouts?.map((callout, calloutIndex) => ({
            ...callout,
            content: translation?.sections?.[index]?.callouts?.[calloutIndex] ?? callout.content,
          })),
        })),
      },
    };
  });
}

export function getGlossaryTerms(locale: Locale) {
  if (locale === "en") {
    return glossaryTerms;
  }

  return glossaryTerms.map((term) => ({
    ...term,
    term: esGlossaryCopy[term.id]?.term ?? term.term,
    definition: esGlossaryCopy[term.id]?.definition ?? term.definition,
    category: esGlossaryCopy[term.id]?.category ?? term.category,
  }));
}

export function getLessonById(id: string, locale: Locale) {
  return getLessons(locale).find((lesson) => lesson.id === id);
}

export function getPathById(id: string, locale: Locale) {
  return getLearningPaths(locale).find((path) => path.id === id);
}

export function getGlossaryLabel(id: string, locale: Locale) {
  const term = getGlossaryTerms(locale).find((item) => item.id === id);
  return term?.term ?? id;
}

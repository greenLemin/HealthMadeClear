/**
 * Glossary definitions and lesson links — used by scripts/enrich-glossary.ts
 */
import type { LessonId } from "../src/types/content";

export type GlossaryEnrichment = {
  relatedLessons: LessonId[];
  en: string;
  es: string;
};

export const GLOSSARY_ENRICHMENT: Record<string, GlossaryEnrichment> = {
  acute: {
    relatedLessons: ["when-to-call-911", "building-first-aid-kit"],
    en: "Acute means sudden in onset and often short in duration. Acute illnesses or injuries develop quickly and may need prompt care — for example a broken bone, strep throat, or a panic attack. Acute is the opposite of chronic, which lasts months or years.",
    es: "Agudo significa de inicio repentino y a menudo de corta duración. Las enfermedades o lesiones agudas se desarrollan rápido y pueden requerir atención pronta — por ejemplo una fractura, faringitis estreptocócica o un ataque de pánico. Agudo es lo opuesto a crónico, que dura meses o años.",
  },
  biopsy: {
    relatedLessons: ["common-tests", "blood-basics"],
    en: "A biopsy is a procedure where a small sample of tissue or cells is removed for laboratory examination. Doctors use biopsies to check for cancer, infection, or other diseases. Results usually take several days to weeks depending on the type of test.",
    es: "Una biopsia es un procedimiento en el que se extrae una pequeña muestra de tejido o células para examen en laboratorio. Los médicos usan biopsias para detectar cáncer, infección u otras enfermedades. Los resultados suelen tardar varios días o semanas según el tipo de prueba.",
  },
  "blood-pressure": {
    relatedLessons: ["living-with-hypertension", "blood-basics"],
    en: "Blood pressure is the force of blood pushing against artery walls as the heart pumps. It is recorded as two numbers: systolic (pressure when the heart beats) over diastolic (pressure between beats). Normal adult readings are often around 120/80 mmHg, but targets vary by age and health conditions.",
    es: "La presión arterial es la fuerza con la que la sangre empuja las paredes de las arterias cuando el corazón bombea. Se registra con dos números: sistólica (presión al latir) sobre diastólica (presión entre latidos). En adultos, lecturas normales suelen rondar 120/80 mmHg, pero las metas varían según edad y condiciones de salud.",
  },
  "blood-sugar": {
    relatedLessons: ["understanding-type2-diabetes", "common-tests"],
    en: "Blood sugar (blood glucose) is the amount of sugar in your bloodstream. The body uses glucose for energy, and insulin helps move it into cells. High blood sugar over time can damage nerves, kidneys, eyes, and blood vessels — a hallmark of diabetes.",
    es: "El azúcar en sangre (glucosa) es la cantidad de azúcar en el torrente sanguíneo. El cuerpo usa la glucosa como energía, y la insulina ayuda a que entre en las células. El azúcar alta con el tiempo puede dañar nervios, riñones, ojos y vasos sanguíneos — característica de la diabetes.",
  },
  cholesterol: {
    relatedLessons: ["common-tests", "introduction-to-heart-disease"],
    en: 'Cholesterol is a waxy fat-like substance found in your blood. Your body needs some cholesterol to build cells, but too much LDL ("bad") cholesterol can build up in arteries and raise heart attack and stroke risk. HDL ("good") cholesterol helps remove excess cholesterol from the bloodstream.',
    es: 'El colesterol es una sustancia cerosa similar a la grasa en la sangre. El cuerpo necesita algo de colesterol para formar células, pero demasiado LDL ("malo") puede acumularse en las arterias y aumentar el riesgo de infarto o derrame. El HDL ("bueno") ayuda a eliminar el exceso de colesterol de la sangre.',
  },
  chronic: {
    relatedLessons: ["living-with-hypertension", "asthma-basics", "introduction-to-heart-disease"],
    en: "Chronic describes a condition that lasts a long time — usually three months or more. Examples include diabetes, hypertension, asthma, and heart disease. Chronic conditions often need ongoing treatment, lifestyle changes, and regular monitoring rather than a one-time cure.",
    es: "Crónico describe una condición que dura mucho tiempo — por lo general tres meses o más. Ejemplos: diabetes, hipertensión, asma y enfermedad cardíaca. Las condiciones crónicas suelen requerir tratamiento continuo, cambios de estilo de vida y monitoreo regular en lugar de una cura única.",
  },
  "clinical-trial": {
    relatedLessons: ["understanding-vaccines", "common-adult-screenings"],
    en: "A clinical trial is a research study that tests new treatments, drugs, or medical approaches in people. Trials follow strict safety rules and informed consent. Participants help advance medicine but may receive placebo or standard care depending on study design.",
    es: "Un ensayo clínico es un estudio de investigación que prueba nuevos tratamientos, medicamentos o enfoques médicos en personas. Los ensayos siguen reglas estrictas de seguridad y consentimiento informado. Los participantes ayudan a avanzar la medicina pero pueden recibir placebo o atención estándar según el diseño del estudio.",
  },
  "ct-scan": {
    relatedLessons: ["common-tests", "blood-basics"],
    en: "A CT (computed tomography) scan uses X-rays and computer processing to create detailed cross-sectional images of the body. It can show bones, organs, and blood vessels. Doctors use CT scans to diagnose injuries, tumors, infections, and other internal problems.",
    es: "Una tomografía computarizada (TC) usa rayos X y procesamiento por computadora para crear imágenes detalladas en cortes del cuerpo. Puede mostrar huesos, órganos y vasos sanguíneos. Los médicos usan TC para diagnosticar lesiones, tumores, infecciones y otros problemas internos.",
  },
  diabetes: {
    relatedLessons: ["understanding-type2-diabetes", "common-tests"],
    en: "Diabetes is a chronic disease that affects how your body turns food into energy. With diabetes, your body either does not make enough insulin or cannot use insulin properly, causing high blood sugar. Over time, high blood sugar can damage the heart, kidneys, nerves, and eyes if not managed.",
    es: "La diabetes es una enfermedad crónica que afecta cómo el cuerpo convierte los alimentos en energía. Con diabetes, el cuerpo no produce suficiente insulina o no puede usarla bien, lo que causa azúcar alta en sangre. Con el tiempo, el azúcar alta puede dañar corazón, riñones, nervios y ojos si no se controla.",
  },
  diagnosis: {
    relatedLessons: ["introduction-to-heart-disease", "understanding-type2-diabetes"],
    en: "A diagnosis is the identification of a disease or condition based on symptoms, exams, and test results. Receiving a diagnosis can feel overwhelming, but it is the starting point for treatment and planning. Always ask your doctor what the diagnosis means for your daily life and next steps.",
    es: "Un diagnóstico es la identificación de una enfermedad o condición según síntomas, exámenes y resultados de pruebas. Recibir un diagnóstico puede ser abrumador, pero es el punto de partida para tratamiento y planificación. Pregunte siempre a su médico qué significa el diagnóstico para su vida diaria y los siguientes pasos.",
  },
  dosage: {
    relatedLessons: ["understanding-prescription-labels", "asking-about-medications"],
    en: 'Dosage is the amount of medicine prescribed and how often you take it — for example "one tablet twice daily." Taking the correct dose at the right time is essential for safety and effectiveness. Never change your dose without talking to your doctor or pharmacist.',
    es: 'La dosis es la cantidad de medicamento recetada y con qué frecuencia debe tomarla — por ejemplo "una tableta dos veces al día". Tomar la dosis correcta a la hora indicada es esencial para seguridad y eficacia. Nunca cambie la dosis sin hablar con su médico o farmacéutico.',
  },
  "generic-drug": {
    relatedLessons: ["understanding-prescription-labels", "asking-about-medications"],
    en: "A generic drug contains the same active ingredient as a brand-name medicine and must meet the same FDA standards for safety and effectiveness. Generics often cost less because manufacturers do not repeat expensive marketing and development. They may look different but work the same way.",
    es: "Un medicamento genérico contiene el mismo ingrediente activo que una marca y debe cumplir los mismos estándares de seguridad y eficacia. Los genéricos suelen costar menos porque no repiten costos de marketing y desarrollo. Pueden verse distintos pero actúan igual.",
  },
  glucose: {
    relatedLessons: ["understanding-type2-diabetes", "blood-basics"],
    en: "Glucose is a simple sugar and the body's main source of energy from food. After you eat, glucose enters the bloodstream and insulin helps cells absorb it. Fasting glucose and A1C tests measure how well your body manages blood sugar over time.",
    es: "La glucosa es un azúcar simple y la principal fuente de energía del cuerpo a partir de los alimentos. Después de comer, la glucosa entra en la sangre y la insulina ayuda a las células a absorberla. La glucosa en ayunas y la A1C miden cómo el cuerpo controla el azúcar con el tiempo.",
  },
  hdl: {
    relatedLessons: ["common-tests", "reading-nutrition-labels"],
    en: 'HDL (high-density lipoprotein) is often called "good" cholesterol because it carries cholesterol away from arteries back to the liver. Higher HDL levels are generally associated with lower heart disease risk. Exercise, not smoking, and healthy fats can help raise HDL.',
    es: 'El HDL (lipoproteína de alta densidad) se llama a menudo colesterol "bueno" porque transporta el colesterol desde las arterias al hígado. Niveles más altos de HDL suelen asociarse con menor riesgo cardíaco. El ejercicio, no fumar y grasas saludables pueden ayudar a subir el HDL.',
  },
  hypertension: {
    relatedLessons: ["living-with-hypertension", "blood-basics"],
    en: 'Hypertension is the medical term for high blood pressure — when blood pushes too hard against artery walls over time. It is often called a "silent killer" because it may cause no symptoms while damaging the heart, brain, kidneys, and eyes. Treatment includes lifestyle changes and often medication.',
    es: 'La hipertensión es el término médico para presión arterial alta — cuando la sangre empuja con demasiada fuerza las paredes arteriales con el tiempo. A menudo se llama "asesino silencioso" porque puede no dar síntomas mientras daña corazón, cerebro, riñones y ojos. El tratamiento incluye cambios de estilo de vida y a menudo medicamentos.',
  },
  hypotension: {
    relatedLessons: ["when-to-call-911", "blood-basics"],
    en: "Hypotension means abnormally low blood pressure. It can cause dizziness, fainting, or fatigue, especially when standing up quickly. Causes include dehydration, certain medicines, heart problems, or severe infection. Sudden severe low blood pressure needs urgent medical care.",
    es: "La hipotensión significa presión arterial anormalmente baja. Puede causar mareos, desmayos o fatiga, especialmente al levantarse rápido. Las causas incluyen deshidratación, ciertos medicamentos, problemas cardíacos o infección grave. La hipotensión severa repentina requiere atención médica urgente.",
  },
  "immune-system": {
    relatedLessons: ["understanding-vaccines", "asthma-basics"],
    en: "The immune system is the body's defense network against germs, viruses, and abnormal cells. It includes white blood cells, antibodies, and organs like the spleen and lymph nodes. Vaccines train the immune system to recognize specific threats without causing full illness.",
    es: "El sistema inmunológico es la red de defensa del cuerpo contra gérmenes, virus y células anormales. Incluye glóbulos blancos, anticuerpos y órganos como el bazo y ganglios linfáticos. Las vacunas entrenan al sistema inmune para reconocer amenazas específicas sin causar la enfermedad completa.",
  },
  inflammation: {
    relatedLessons: ["introduction-to-heart-disease", "asthma-basics"],
    en: "Inflammation is the body's response to injury or infection — redness, swelling, heat, and pain. Acute inflammation helps healing. Chronic inflammation lasting months can contribute to heart disease, arthritis, and other conditions. Lifestyle and treatment can reduce harmful chronic inflammation.",
    es: "La inflamación es la respuesta del cuerpo a lesión o infección — enrojecimiento, hinchazón, calor y dolor. La inflamación aguda ayuda a sanar. La inflamación crónica de meses puede contribuir a enfermedad cardíaca, artritis y otras condiciones. El estilo de vida y el tratamiento pueden reducir la inflamación crónica dañina.",
  },
  insulin: {
    relatedLessons: ["understanding-type2-diabetes", "blood-basics"],
    en: "Insulin is a hormone made by the pancreas that helps glucose enter cells for energy. In type 1 diabetes the body makes little or no insulin; in type 2 diabetes cells resist insulin's effects. People with diabetes may need insulin injections or other medicines to control blood sugar.",
    es: "La insulina es una hormona del páncreas que ayuda a que la glucosa entre en las células como energía. En diabetes tipo 1 el cuerpo produce poca o ninguna insulina; en tipo 2 las células resisten sus efectos. Las personas con diabetes pueden necesitar insulina inyectable u otros medicamentos para controlar el azúcar.",
  },
  ldl: {
    relatedLessons: ["common-tests", "reading-nutrition-labels"],
    en: 'LDL (low-density lipoprotein) is often called "bad" cholesterol because high levels can deposit cholesterol in artery walls, forming plaque. This narrows arteries and raises heart attack and stroke risk. Diet, exercise, and medicines called statins can lower LDL.',
    es: 'El LDL (lipoproteína de baja densidad) se llama a menudo colesterol "malo" porque niveles altos depositan colesterol en las paredes arteriales, formando placa. Esto estrecha arterias y aumenta riesgo de infarto y derrame. Dieta, ejercicio y medicamentos como estatinas pueden bajar el LDL.',
  },
  metabolism: {
    relatedLessons: ["reading-nutrition-labels", "building-balanced-plate"],
    en: 'Metabolism is the set of chemical processes that convert food into energy and building blocks for the body. Basal metabolic rate is energy used at rest. Age, muscle mass, activity, and hormones affect metabolism. A "slow metabolism" is rarely the sole cause of weight gain.',
    es: 'El metabolismo es el conjunto de procesos químicos que convierten alimentos en energía y materiales para el cuerpo. La tasa metabólica basal es la energía en reposo. Edad, masa muscular, actividad y hormonas afectan el metabolismo. Un "metabolismo lento" rara vez es la única causa de aumento de peso.',
  },
  mri: {
    relatedLessons: ["common-tests", "blood-basics"],
    en: "MRI (magnetic resonance imaging) uses strong magnets and radio waves — not X-rays — to create detailed images of soft tissues like the brain, spine, joints, and organs. It is useful for detecting tumors, injuries, and neurological conditions. The scan can take 30–60 minutes and is painless.",
    es: "La resonancia magnética (RM) usa imanes potentes y ondas de radio — no rayos X — para crear imágenes detalladas de tejidos blandos como cerebro, columna, articulaciones y órganos. Es útil para detectar tumores, lesiones y condiciones neurológicas. El estudio puede durar 30–60 minutos y es indoloro.",
  },
  "over-the-counter": {
    relatedLessons: ["asking-about-medications", "understanding-prescription-labels"],
    en: "Over-the-counter (OTC) medicines can be bought without a prescription — examples include acetaminophen, ibuprofen, and allergy pills. They still have risks and drug interactions. Tell your doctor and pharmacist about all OTC products you use, including how often and at what dose.",
    es: "Los medicamentos de venta libre (OTC) se compran sin receta — por ejemplo acetaminofén, ibuprofeno y antialérgicos. Aun así tienen riesgos e interacciones. Informe a su médico y farmacéutico sobre todos los productos OTC que usa, con frecuencia y dosis.",
  },
  placebo: {
    relatedLessons: ["understanding-vaccines", "asking-about-medications"],
    en: "A placebo is an inactive treatment — such as a sugar pill — used in research to compare against real medicine. Some people feel better on placebo due to the mind-body response (placebo effect). Placebos in clinical trials help prove whether a treatment works beyond expectation alone.",
    es: "Un placebo es un tratamiento inactivo — como una pastilla de azúcar — usado en investigación para comparar con medicina real. Algunas personas mejoran con placebo por la respuesta mente-cuerpo (efecto placebo). En ensayos clínicos, los placebos ayudan a demostrar si un tratamiento funciona más allá de las expectativas.",
  },
  prescription: {
    relatedLessons: ["understanding-prescription-labels", "asking-about-medications"],
    en: "A prescription is a written or electronic order from a licensed provider for a specific medicine, dose, and instructions. Only pharmacies can dispense prescription drugs. The label includes your name, drug name, how to take it, refills, and pharmacy contact information.",
    es: "Una receta es una orden escrita o electrónica de un profesional autorizado para un medicamento, dosis e instrucciones específicas. Solo las farmacias dispensan medicamentos con receta. La etiqueta incluye su nombre, medicamento, cómo tomarlo, resurtidos y contacto de la farmacia.",
  },
  prognosis: {
    relatedLessons: ["understanding-depression", "introduction-to-heart-disease"],
    en: "Prognosis is a doctor's best estimate of how a disease or condition is likely to progress over time — including chances of recovery, stability, or complications. Prognosis is not a guarantee; treatment, lifestyle, and new research can change outcomes. Always ask what factors affect your personal prognosis.",
    es: "El pronóstico es la mejor estimación del médico sobre cómo probablemente evolucionará una enfermedad — incluyendo recuperación, estabilidad o complicaciones. El pronóstico no es una garantía; tratamiento, estilo de vida e investigación pueden cambiar resultados. Pregunte qué factores afectan su pronóstico personal.",
  },
  "side-effect": {
    relatedLessons: ["managing-side-effects", "asking-about-medications"],
    en: "A side effect is an unwanted reaction to a medicine — from mild (dry mouth) to severe (allergic reaction). Not everyone gets side effects, and many fade as the body adjusts. Report bothersome or serious side effects to your doctor; do not stop prescribed medicine without guidance.",
    es: "Un efecto secundario es una reacción no deseada a un medicamento — de leve (boca seca) a grave (reacción alérgica). No todos los tienen, y muchos desaparecen al adaptarse el cuerpo. Reporte efectos molestos o graves a su médico; no suspenda medicamentos recetados sin orientación.",
  },
  sign: {
    relatedLessons: ["blood-basics", "when-to-worry"],
    en: "A sign is an objective finding that others can observe or measure — such as a fever, rash, or high blood pressure reading. Signs differ from symptoms, which are what the patient feels and reports. Doctors use both signs and symptoms to make diagnoses.",
    es: "Un signo es un hallazgo objetivo que otros pueden observar o medir — como fiebre, erupción o presión arterial alta. Los signos difieren de los síntomas, que son lo que el paciente siente y reporta. Los médicos usan signos y síntomas para diagnosticar.",
  },
  symptom: {
    relatedLessons: ["before-your-visit", "during-your-visit"],
    en: "A symptom is something you feel or experience — pain, fatigue, nausea, anxiety — that you report to your doctor. Tracking when symptoms started, how often they occur, and what makes them better or worse helps your care team find causes and plan treatment.",
    es: "Un síntoma es algo que usted siente o experimenta — dolor, fatiga, náuseas, ansiedad — que reporta al médico. Anotar cuándo empezaron, con qué frecuencia ocurren y qué los mejora o empeora ayuda al equipo de salud a encontrar causas y planear tratamiento.",
  },
  triglycerides: {
    relatedLessons: ["common-tests", "reading-nutrition-labels"],
    en: "Triglycerides are a type of fat in the blood used for energy storage. High triglycerides — often linked to excess sugar, alcohol, or refined carbs — increase heart disease and pancreatitis risk. A lipid panel measures triglycerides along with cholesterol levels.",
    es: "Los triglicéridos son un tipo de grasa en sangre usada como reserva de energía. Triglicéridos altos — a menudo por exceso de azúcar, alcohol o carbohidratos refinados — aumentan riesgo cardíaco y de pancreatitis. Un perfil lipídico mide triglicéridos junto con colesterol.",
  },
  ultrasound: {
    relatedLessons: ["common-tests", "common-adult-screenings"],
    en: "Ultrasound uses high-frequency sound waves to create images of structures inside the body, such as a developing fetus, gallbladder, heart, or blood vessels. It does not use radiation. Gel is applied to the skin and a probe sends and receives sound waves to build a live image.",
    es: "El ultrasonido usa ondas sonoras de alta frecuencia para crear imágenes de estructuras internas, como un feto en desarrollo, vesícula, corazón o vasos sanguíneos. No usa radiación. Se aplica gel en la piel y una sonda envía y recibe ondas para formar una imagen en vivo.",
  },
};

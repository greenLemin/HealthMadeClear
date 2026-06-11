/** Term-specific "Why It Matters" and "Talk With Your Care Team" sections for glossary terms. */
export type GlossaryContextSections = {
  whyMatters: { en: string; es: string };
  talkTeam: { en: string; es: string };
};

export const GLOSSARY_CONTEXT: Record<string, GlossaryContextSections> = {
  acute: {
    whyMatters: {
      en: "Knowing whether a problem is acute or chronic helps you set expectations for recovery time and urgency of follow-up. Acute symptoms that worsen quickly may need same-day care rather than waiting for a routine appointment.",
      es: "Saber si un problema es agudo o crónico ayuda a fijar expectativas de recuperación y urgencia del seguimiento. Síntomas agudos que empeoran rápido pueden requerir atención el mismo día.",
    },
    talkTeam: {
      en: "Ask: Is this condition likely to resolve on its own, and what warning signs mean I should call sooner? How long should I wait before expecting improvement?",
      es: "Pregunte: ¿Es probable que esta condición se resuelva sola y qué señales de alerta indican llamar antes? ¿Cuánto debo esperar antes de esperar mejoría?",
    },
  },
  biopsy: {
    whyMatters: {
      en: "Biopsy results often determine cancer staging and treatment plans. Understanding the procedure reduces anxiety and helps you prepare for possible waiting periods and follow-up appointments.",
      es: "Los resultados de biopsia a menudo determinan estadificación y tratamiento del cáncer. Entender el procedimiento reduce ansiedad y ayuda a prepararse para tiempos de espera y citas de seguimiento.",
    },
    talkTeam: {
      en: "Ask: How will I receive results, and who calls me if something urgent is found? What restrictions apply after the procedure (activity, bathing, medications)?",
      es: "Pregunte: ¿Cómo recibiré resultados y quién me llama si hay algo urgente? ¿Qué restricciones aplican tras el procedimiento (actividad, baño, medicamentos)?",
    },
  },
  "blood-pressure": {
    whyMatters: {
      en: "Blood pressure readings guide treatment for stroke and heart disease prevention. Home and clinic readings can differ — tracking both helps your doctor adjust medicines accurately.",
      es: "Las lecturas de presión guían tratamiento para prevenir ACV y enfermedad cardíaca. Las lecturas en casa y clínica pueden diferir — registrar ambas ayuda a ajustar medicamentos con precisión.",
    },
    talkTeam: {
      en: "Ask: What is my target blood pressure, and should I monitor at home? How do my readings compare at different times of day?",
      es: "Pregunte: ¿Cuál es mi meta de presión y debo monitorear en casa? ¿Cómo se comparan mis lecturas a distintas horas del día?",
    },
  },
  "blood-sugar": {
    whyMatters: {
      en: "Blood sugar levels affect energy, mood, and long-term organ health. Recognizing high and low patterns helps you respond before emergencies and stick to your management plan.",
      es: "Los niveles de azúcar en sangre afectan energía, ánimo y salud de órganos a largo plazo. Reconocer patrones altos y bajos ayuda a responder antes de emergencias y seguir su plan.",
    },
    talkTeam: {
      en: "Ask: What range should I aim for before meals and at bedtime? What symptoms mean I should check my sugar immediately or seek help?",
      es: "Pregunte: ¿Qué rango debo buscar antes de comidas y al acostarme? ¿Qué síntomas indican medir azúcar de inmediato o buscar ayuda?",
    },
  },
  cholesterol: {
    whyMatters: {
      en: "Cholesterol levels help estimate cardiovascular risk alongside blood pressure, smoking, and family history. Lifestyle and medicines target LDL and triglycerides to protect arteries over decades.",
      es: "Los niveles de colesterol ayudan a estimar riesgo cardiovascular junto con presión, tabaco e historial familiar. Estilo de vida y medicamentos apuntan al LDL y triglicéridos para proteger arterias.",
    },
    talkTeam: {
      en: "Ask: Which numbers on my lipid panel matter most for me? When should we repeat the test after starting diet changes or statins?",
      es: "Pregunte: ¿Qué números de mi perfil lipídico importan más para mí? ¿Cuándo repetir la prueba tras cambios de dieta o estatinas?",
    },
  },
  chronic: {
    whyMatters: {
      en: "Chronic conditions require ongoing self-management, not just one visit. Understanding the label helps you plan for monitoring, medication adherence, and realistic long-term goals.",
      es: "Las condiciones crónicas requieren autocuidado continuo, no solo una visita. Entender la etiqueta ayuda a planear monitoreo, adherencia a medicamentos y metas realistas a largo plazo.",
    },
    talkTeam: {
      en: "Ask: What does living with this condition look like day to day, and what are my top three self-care priorities? Who do I contact between visits if symptoms change?",
      es: "Pregunte: ¿Cómo es vivir con esta condición día a día y cuáles son mis tres prioridades de autocuidado? ¿A quién contacto entre visitas si cambian los síntomas?",
    },
  },
  "clinical-trial": {
    whyMatters: {
      en: "Clinical trials advance treatment options but involve uncertainty and strict protocols. Knowing how trials work helps you decide whether participation fits your values and health needs.",
      es: "Los ensayos clínicos avanzan opciones de tratamiento pero implican incertidumbre y protocolos estrictos. Saber cómo funcionan ayuda a decidir si participar encaja con sus valores y necesidades.",
    },
    talkTeam: {
      en: "Ask: What phase is this trial, and what are the known risks and benefits? Can I leave the trial at any time, and how does it affect my standard care?",
      es: "Pregunte: ¿En qué fase está este ensayo y cuáles son riesgos y beneficios conocidos? ¿Puedo salir en cualquier momento y cómo afecta mi atención estándar?",
    },
  },
  "ct-scan": {
    whyMatters: {
      en: "CT scans expose you to more radiation than a single X-ray. They provide fast, detailed images for emergencies and complex diagnoses — worth discussing when alternatives like ultrasound or MRI may suffice.",
      es: "La TC expone a más radiación que una radiografía simple. Ofrece imágenes rápidas y detalladas para emergencias y diagnósticos complejos — conviene discutir cuando alternativas como ultrasonido o RM pueden bastar.",
    },
    talkTeam: {
      en: "Ask: Why is CT the best test for my situation, and will I need contrast dye? How do I prepare, and when will someone explain the results?",
      es: "Pregunte: ¿Por qué la TC es la mejor prueba para mi situación y necesitaré contraste? ¿Cómo me preparo y cuándo explicarán los resultados?",
    },
  },
  diabetes: {
    whyMatters: {
      en: "Diabetes affects daily food choices, activity, foot care, eye exams, and medication timing. Early and consistent management prevents complications that develop silently over years.",
      es: "La diabetes afecta elecciones diarias de alimentos, actividad, cuidado de pies, exámenes oculares y horarios de medicamentos. Manejo temprano y constante previene complicaciones silenciosas.",
    },
    talkTeam: {
      en: "Ask: What A1C or blood sugar targets are right for me? How often should I see an eye doctor and foot specialist, and what new symptoms should I report right away?",
      es: "Pregunte: ¿Qué metas de A1C o azúcar son adecuadas para mí? ¿Con qué frecuencia debo ver oftalmólogo y especialista en pies, y qué síntomas nuevos debo reportar de inmediato?",
    },
  },
  diagnosis: {
    whyMatters: {
      en: "A diagnosis shapes treatment options, insurance coverage, and your emotional response. Clear understanding reduces fear and helps you advocate for second opinions when something does not feel right.",
      es: "Un diagnóstico moldea opciones de tratamiento, cobertura de seguro y su respuesta emocional. Entender con claridad reduce miedo y ayuda a pedir segundas opiniones cuando algo no cuadra.",
    },
    talkTeam: {
      en: "Ask: What evidence supports this diagnosis, and what else could it be? What are the next steps this week and this month?",
      es: "Pregunte: ¿Qué evidencia apoya este diagnóstico y qué más podría ser? ¿Cuáles son los siguientes pasos esta semana y este mes?",
    },
  },
  dosage: {
    whyMatters: {
      en: "Wrong dose — too much, too little, or at the wrong time — is a leading cause of medication harm. Dosage instructions on the label are legal and medical orders, not suggestions.",
      es: "Dosis incorrecta — demasiada, poca o a hora equivocada — es causa principal de daño por medicamentos. Las instrucciones en la etiqueta son órdenes médicas y legales, no sugerencias.",
    },
    talkTeam: {
      en: "Ask: What if I miss a dose or take one late? Can I split or crush this tablet, and should I take it with food or on an empty stomach?",
      es: "Pregunte: ¿Qué pasa si olvido una dosis o la tomo tarde? ¿Puedo partir o triturar esta tableta y debo tomarla con comida o en ayunas?",
    },
  },
  "generic-drug": {
    whyMatters: {
      en: "Generics save money and improve access for most people. Knowing they are FDA-equivalent helps you discuss switches confidently while watching for rare filler sensitivities.",
      es: "Los genéricos ahorran dinero y mejoran acceso para la mayoría. Saber que son equivalentes según FDA ayuda a discutir cambios con confianza mientras vigila sensibilidades raras a excipientes.",
    },
    talkTeam: {
      en: "Ask: Is a generic appropriate for this medicine, and will my insurance require it? What should I do if the new pill looks different or I feel different after a switch?",
      es: "Pregunte: ¿Es apropiado un genérico para este medicamento y mi seguro lo exigirá? ¿Qué hago si la pastilla se ve distinta o me siento diferente tras el cambio?",
    },
  },
  glucose: {
    whyMatters: {
      en: "Glucose is the fuel your cells use and the number most diabetes tests track. Spikes after meals and fasting levels tell different stories — both matter for treatment decisions.",
      es: "La glucosa es el combustible celular y el número que rastrean la mayoría de pruebas de diabetes. Picos tras comidas y niveles en ayunas cuentan historias distintas — ambos importan para tratamiento.",
    },
    talkTeam: {
      en: "Ask: Should I check glucose at home, and how do fasting versus after-meal readings change my plan? What carbs or activities affect my levels most?",
      es: "Pregunte: ¿Debo medir glucosa en casa y cómo cambian mi plan las lecturas en ayunas versus después de comer? ¿Qué carbohidratos o actividades afectan más mis niveles?",
    },
  },
  hdl: {
    whyMatters: {
      en: "HDL helps remove cholesterol from arteries, but it is one piece of heart risk — not a standalone guarantee of protection. Very low HDL may prompt lifestyle changes even when LDL looks acceptable.",
      es: "El HDL ayuda a quitar colesterol de arterias, pero es una pieza del riesgo cardíaco — no garantía sola de protección. HDL muy bajo puede motivar cambios de estilo aunque el LDL parezca aceptable.",
    },
    talkTeam: {
      en: "Ask: Is my HDL level a concern given my overall heart risk? What lifestyle changes could raise HDL, and when would medicine be considered?",
      es: "Pregunte: ¿Mi nivel de HDL es preocupante dado mi riesgo cardíaco total? ¿Qué cambios de estilo podrían subir el HDL y cuándo se consideraría medicamento?",
    },
  },
  hypertension: {
    whyMatters: {
      en: "Untreated hypertension damages blood vessels silently for years. Home monitoring and medication adherence directly lower stroke, heart attack, and kidney failure risk.",
      es: "La hipertensión sin tratar daña vasos silenciosamente por años. Monitoreo en casa y adherencia a medicamentos reducen directamente riesgo de ACV, infarto e insuficiencia renal.",
    },
    talkTeam: {
      en: "Ask: What blood pressure goal should I work toward, and how often should I check at home? What side effects from my blood pressure medicine should I report?",
      es: "Pregunte: ¿Hacia qué meta de presión debo trabajar y con qué frecuencia revisar en casa? ¿Qué efectos secundarios de mi medicamento para presión debo reportar?",
    },
  },
  hypotension: {
    whyMatters: {
      en: "Low blood pressure can cause falls, especially in older adults on multiple medicines. Distinguishing harmless low readings from dangerous drops prevents injury and guides medication adjustments.",
      es: "La presión baja puede causar caídas, especialmente en adultos mayores con varios medicamentos. Distinguir lecturas bajas inofensivas de caídas peligrosas previene lesiones y guía ajustes.",
    },
    talkTeam: {
      en: "Ask: Is my low blood pressure causing my dizziness, and should any medicines be changed? When should I sit or lie down, and what hydration goals do you recommend?",
      es: "Pregunte: ¿Mi presión baja causa mareos y debo cambiar algún medicamento? ¿Cuándo debo sentarme o acostarme y qué metas de hidratación recomienda?",
    },
  },
  "immune-system": {
    whyMatters: {
      en: "Immune health affects how you respond to vaccines, infections, and some medicines that suppress immunity. Autoimmune conditions happen when the immune system attacks the body itself.",
      es: "La salud inmune afecta respuesta a vacunas, infecciones y algunos medicamentos que suprimen inmunidad. Enfermedades autoinmunes ocurren cuando el sistema ataca al propio cuerpo.",
    },
    talkTeam: {
      en: "Ask: Am I considered immunocompromised, and do I need extra vaccines or precautions? What infections should I watch for on my current treatment?",
      es: "Pregunte: ¿Se me considera inmunocomprometido y necesito vacunas o precauciones extra? ¿Qué infecciones debo vigilar con mi tratamiento actual?",
    },
  },
  inflammation: {
    whyMatters: {
      en: "Short-term inflammation heals injuries; chronic inflammation contributes to heart disease, diabetes complications, and joint damage. Treatment targets the underlying cause, not just pain.",
      es: "La inflamación a corto plazo sana lesiones; la crónica contribuye a enfermedad cardíaca, complicaciones de diabetes y daño articular. El tratamiento apunta a la causa, no solo al dolor.",
    },
    talkTeam: {
      en: "Ask: Is my inflammation from an infection, autoimmune disease, or lifestyle factors? How will we know if treatment is working?",
      es: "Pregunte: ¿Mi inflamación es por infección, enfermedad autoinmune o estilo de vida? ¿Cómo sabremos si el tratamiento funciona?",
    },
  },
  insulin: {
    whyMatters: {
      en: "Insulin timing and dosing errors can cause dangerous highs and lows within hours. Understanding how your body uses insulin helps you coordinate meals, activity, and sick-day rules.",
      es: "Errores de horario y dosis de insulina pueden causar picos y caídas peligrosas en horas. Entender cómo su cuerpo usa insulina ayuda a coordinar comidas, actividad y reglas en días de enfermedad.",
    },
    talkTeam: {
      en: "Ask: When should I take each insulin type relative to meals? What sick-day adjustments apply, and what blood sugar levels mean I need emergency help?",
      es: "Pregunte: ¿Cuándo debo tomar cada tipo de insulina respecto a comidas? ¿Qué ajustes aplican en días de enfermedad y qué niveles de azúcar indican ayuda de emergencia?",
    },
  },
  ldl: {
    whyMatters: {
      en: "High LDL contributes to plaque buildup that narrows arteries. Lowering LDL with diet, exercise, and statins is one of the most proven ways to reduce heart attack and stroke risk.",
      es: "LDL alto contribuye a placa que estrecha arterias. Bajar LDL con dieta, ejercicio y estatinas es una de las formas más probadas de reducir riesgo de infarto y ACV.",
    },
    talkTeam: {
      en: "Ask: What LDL level are we targeting, and how soon will we recheck labs? What side effects from statins should I watch for?",
      es: "Pregunte: ¿Qué nivel de LDL buscamos y cuándo repetiremos laboratorios? ¿Qué efectos secundarios de estatinas debo vigilar?",
    },
  },
  metabolism: {
    whyMatters: {
      en: "Metabolism affects weight, energy, and how medicines are processed. Thyroid disorders, muscle mass, and age shift metabolic rate — blaming metabolism alone often misses treatable causes.",
      es: "El metabolismo afecta peso, energía y procesamiento de medicamentos. Trastornos tiroideos, masa muscular y edad cambian la tasa metabólica — culpar solo al metabolismo a menudo omite causas tratables.",
    },
    talkTeam: {
      en: "Ask: Could a thyroid or hormone issue be affecting my weight or energy? What realistic changes could help beyond dieting alone?",
      es: "Pregunte: ¿Podría un problema tiroideo u hormonal afectar mi peso o energía? ¿Qué cambios realistas ayudarían más allá de solo dieta?",
    },
  },
  mri: {
    whyMatters: {
      en: "MRI provides detailed soft-tissue images without radiation but requires staying still in a enclosed space. Metal implants and claustrophobia may require special scheduling or alternative tests.",
      es: "La RM ofrece imágenes detalladas de tejidos blandos sin radiación pero requiere permanecer quieto en espacio cerrado. Implantes metálicos y claustrofobia pueden requerir programación especial u otras pruebas.",
    },
    talkTeam: {
      en: "Ask: Do I need contrast for this MRI, and is my implant safe inside the scanner? What happens if I feel anxious during the test?",
      es: "Pregunte: ¿Necesito contraste para esta RM y mi implante es seguro dentro del escáner? ¿Qué pasa si me siento ansioso durante la prueba?",
    },
  },
  "over-the-counter": {
    whyMatters: {
      en: "OTC products are real medicines with overdose and interaction risks — especially acetaminophen hidden in cold formulas. They belong on your full medication list for every visit.",
      es: "Los productos OTC son medicamentos reales con riesgo de sobredosis e interacciones — especialmente acetaminofén oculto en fórmulas para resfriado. Deben estar en su lista completa en cada visita.",
    },
    talkTeam: {
      en: "Ask: Is this OTC product safe with my prescriptions and health conditions? What is the maximum daily dose from all sources combined?",
      es: "Pregunte: ¿Este producto OTC es seguro con mis recetas y condiciones de salud? ¿Cuál es la dosis diaria máxima sumando todas las fuentes?",
    },
  },
  placebo: {
    whyMatters: {
      en: "Understanding placebos helps you interpret health claims and clinical trial consent forms. Improvement on placebo shows how expectations and care rituals affect symptoms — but does not replace proven treatments for serious disease.",
      es: "Entender placebos ayuda a interpretar afirmaciones de salud y consentimientos de ensayos. Mejorar con placebo muestra cómo expectativas y rituales de cuidado afectan síntomas — pero no reemplaza tratamientos probados para enfermedad grave.",
    },
    talkTeam: {
      en: "Ask: In this study or treatment, how do we know improvement is from the active drug and not expectation alone? What is the evidence this treatment works beyond placebo?",
      es: "Pregunte: En este estudio o tratamiento, ¿cómo sabemos que la mejoría es del fármaco activo y no solo expectativa? ¿Qué evidencia hay de que funciona más allá del placebo?",
    },
  },
  prescription: {
    whyMatters: {
      en: "Prescriptions carry legal requirements for refills, controlled substances, and pharmacy transfers. Expired or shared prescriptions can be unsafe and may not be filled.",
      es: "Las recetas tienen requisitos legales para resurtidos, sustancias controladas y transferencias entre farmacias. Recetas vencidas o compartidas pueden ser inseguras y no surtirse.",
    },
    talkTeam: {
      en: "Ask: How many refills remain, and should I schedule a follow-up before they run out? Can this prescription be sent electronically to my preferred pharmacy?",
      es: "Pregunte: ¿Cuántos resurtidos quedan y debo programar seguimiento antes de que se acaben? ¿Esta receta puede enviarse electrónicamente a mi farmacia preferida?",
    },
  },
  prognosis: {
    whyMatters: {
      en: "Prognosis helps plan work, family, and treatment intensity — but numbers are averages, not destiny. New therapies and personal factors can shift outcomes after the first conversation.",
      es: "El pronóstico ayuda a planear trabajo, familia e intensidad de tratamiento — pero los números son promedios, no destino. Nuevas terapias y factores personales pueden cambiar resultados tras la primera conversación.",
    },
    talkTeam: {
      en: "Ask: What factors most affect my individual outlook? What would change the prognosis if I follow treatment versus if I do not?",
      es: "Pregunte: ¿Qué factores afectan más mi panorama individual? ¿Qué cambiaría el pronóstico si sigo tratamiento versus si no?",
    },
  },
  "side-effect": {
    whyMatters: {
      en: "Some side effects fade with time; others signal allergy or organ stress. Reporting problems early lets your team adjust dose or switch medicines before serious harm occurs.",
      es: "Algunos efectos secundarios desaparecen con el tiempo; otros señalan alergia o estrés orgánico. Reportar problemas temprano permite ajustar dosis o cambiar medicamentos antes de daño grave.",
    },
    talkTeam: {
      en: "Ask: Which side effects are common and temporary versus reasons to stop the drug immediately? Should I report mild symptoms to you or the pharmacist first?",
      es: "Pregunte: ¿Qué efectos son comunes y temporales versus motivos para suspender el medicamento de inmediato? ¿Debo reportar síntomas leves primero a usted o al farmacéutico?",
    },
  },
  sign: {
    whyMatters: {
      en: "Signs give objective evidence doctors measure — fever, blood pressure, lab flags. Knowing the difference from symptoms helps you describe both clearly at visits.",
      es: "Los signos dan evidencia objetiva que los médicos miden — fiebre, presión, banderas de laboratorio. Conocer la diferencia con síntomas ayuda a describir ambos claramente en visitas.",
    },
    talkTeam: {
      en: "Ask: What signs will you monitor at follow-up, and can I track any of them at home? Which new signs should prompt a call before my next appointment?",
      es: "Pregunte: ¿Qué signos monitoreará en seguimiento y puedo registrar alguno en casa? ¿Qué signos nuevos indican llamar antes de mi próxima cita?",
    },
  },
  symptom: {
    whyMatters: {
      en: "Clear symptom descriptions — onset, severity, triggers — often matter more than test results early in evaluation. A symptom diary speeds diagnosis and reduces repeat visits.",
      es: "Descripciones claras de síntomas — inicio, severidad, desencadenantes — a menudo importan más que resultados de pruebas al inicio. Un diario de síntomas acelera diagnóstico y reduce visitas repetidas.",
    },
    talkTeam: {
      en: "Ask: What details about my symptoms would help you most — timing, location, what makes it better or worse? Should I keep a log until our next visit?",
      es: "Pregunte: ¿Qué detalles de mis síntomas le ayudarían más — horario, ubicación, qué mejora o empeora? ¿Debo llevar un registro hasta la próxima visita?",
    },
  },
  triglycerides: {
    whyMatters: {
      en: "High triglycerides often respond to cutting sugary drinks, alcohol, and refined carbs. Very high levels can cause pancreatitis — a painful emergency — so treatment urgency depends on the number.",
      es: "Triglicéridos altos suelen responder a reducir bebidas azucaradas, alcohol y carbohidratos refinados. Niveles muy altos pueden causar pancreatitis — emergencia dolorosa — así que la urgencia depende del número.",
    },
    talkTeam: {
      en: "Ask: How high are my triglycerides compared to my last test, and what diet changes matter most? Do I need medicine now or can we recheck after lifestyle changes?",
      es: "Pregunte: ¿Qué tan altos están mis triglicéridos respecto a la última prueba y qué cambios de dieta importan más? ¿Necesito medicamento ahora o podemos repetir tras cambios de estilo?",
    },
  },
  ultrasound: {
    whyMatters: {
      en: "Ultrasound is safe during pregnancy and for repeated monitoring because it uses sound, not radiation. Results depend on operator skill — some findings need follow-up CT or MRI for detail.",
      es: "El ultrasonido es seguro en embarazo y para monitoreo repetido porque usa sonido, no radiación. Los resultados dependen de la habilidad del operador — algunos hallazgos necesitan TC o RM de seguimiento.",
    },
    talkTeam: {
      en: "Ask: What will this ultrasound show, and might I need a full bladder or fasting beforehand? Who explains results — the technician or my doctor — and when?",
      es: "Pregunte: ¿Qué mostrará este ultrasonido y necesito vejiga llena o ayuno antes? ¿Quién explica resultados — el técnico o mi médico — y cuándo?",
    },
  },
};

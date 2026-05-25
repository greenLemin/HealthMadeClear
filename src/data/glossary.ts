export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'blood-pressure',
    term: 'Blood Pressure',
    definition: 'The force of blood pushing against the walls of your arteries. It\'s measured with two numbers: systolic (when the heart beats) over diastolic (when the heart rests). Normal blood pressure is usually around 120/80.',
    category: 'General',
    relatedTerms: ['hypertension', 'hypotension'],
  },
  {
    id: 'hypertension',
    term: 'Hypertension',
    definition: 'High blood pressure. This means the force of blood against your artery walls is consistently too high. It can damage your blood vessels and increase your risk of heart disease and stroke.',
    category: 'Conditions',
    relatedTerms: ['blood-pressure'],
  },
  {
    id: 'hypotension',
    term: 'Hypotension',
    definition: 'Low blood pressure. This can cause dizziness, fainting, and fatigue. While often less serious than high blood pressure, it still needs medical attention if it causes symptoms.',
    category: 'Conditions',
    relatedTerms: ['blood-pressure'],
  },
  {
    id: 'cholesterol',
    term: 'Cholesterol',
    definition: 'A waxy, fat-like substance found in all cells of your body. Your body needs some cholesterol to work properly, but too much can build up in your arteries and cause heart disease.',
    category: 'General',
    relatedTerms: ['ldl', 'hdl', 'triglycerides'],
  },
  {
    id: 'ldl',
    term: 'LDL Cholesterol',
    definition: 'Low-density lipoprotein, often called "bad" cholesterol. It can build up in your arteries and form plaque, which can narrow your arteries and increase your risk of heart disease.',
    category: 'Lab Results',
    relatedTerms: ['cholesterol', 'hdl'],
  },
  {
    id: 'hdl',
    term: 'HDL Cholesterol',
    definition: 'High-density lipoprotein, often called "good" cholesterol. It helps remove LDL cholesterol from your arteries and carries it back to your liver to be processed. Higher HDL levels are generally better.',
    category: 'Lab Results',
    relatedTerms: ['cholesterol', 'ldl'],
  },
  {
    id: 'triglycerides',
    term: 'Triglycerides',
    definition: 'A type of fat in your blood that your body uses for energy. High levels can increase your risk of heart disease, especially when combined with high LDL or low HDL cholesterol.',
    category: 'Lab Results',
    relatedTerms: ['cholesterol'],
  },
  {
    id: 'diabetes',
    term: 'Diabetes',
    definition: 'A chronic disease that affects how your body turns food into energy. With diabetes, your body either doesn\'t make enough insulin or can\'t use insulin properly, causing high blood sugar levels.',
    category: 'Conditions',
    relatedTerms: ['blood-sugar', 'insulin', 'glucose'],
  },
  {
    id: 'blood-sugar',
    term: 'Blood Sugar',
    definition: 'Also called blood glucose, this is the main sugar found in your blood. It comes from the food you eat and is your body\'s main source of energy. Insulin helps move blood sugar into your cells.',
    category: 'General',
    relatedTerms: ['diabetes', 'glucose', 'insulin'],
  },
  {
    id: 'glucose',
    term: 'Glucose',
    definition: 'A simple sugar that is the body\'s main source of energy. It\'s also known as blood sugar when it\'s in your bloodstream. Your body gets glucose from the carbohydrates you eat.',
    category: 'General',
    relatedTerms: ['blood-sugar', 'diabetes'],
  },
  {
    id: 'insulin',
    term: 'Insulin',
    definition: 'A hormone made by your pancreas that helps your body use glucose for energy. It acts like a key that lets sugar into your cells. In diabetes, the body either doesn\'t make enough insulin or can\'t use it properly.',
    category: 'General',
    relatedTerms: ['diabetes', 'blood-sugar'],
  },
  {
    id: 'chronic',
    term: 'Chronic',
    definition: 'A health condition that lasts for a long time, often for the rest of a person\'s life. Chronic conditions usually can\'t be cured but can be managed with treatment and lifestyle changes.',
    category: 'General',
  },
  {
    id: 'acute',
    term: 'Acute',
    definition: 'A health condition that comes on suddenly and usually lasts for a short time. Acute conditions often need immediate treatment but can be cured or resolve on their own.',
    category: 'General',
  },
  {
    id: 'symptom',
    term: 'Symptom',
    definition: 'A physical or mental problem that a person experiences that may indicate a disease or condition. Symptoms are what you feel and report to your doctor, like pain, fatigue, or nausea.',
    category: 'General',
    relatedTerms: ['sign'],
  },
  {
    id: 'sign',
    term: 'Sign',
    definition: 'Something a doctor can observe or measure during an examination, like fever, rash, or high blood pressure. Signs are different from symptoms, which are what you feel.',
    category: 'General',
    relatedTerms: ['symptom'],
  },
  {
    id: 'diagnosis',
    term: 'Diagnosis',
    definition: 'The process of identifying a disease or condition based on a person\'s symptoms, medical history, and test results. It\'s also the name given to the identified condition.',
    category: 'General',
  },
  {
    id: 'prognosis',
    term: 'Prognosis',
    definition: 'The likely course or outcome of a disease or condition. A prognosis tells you what to expect in the future, such as whether a condition will improve, stay the same, or get worse.',
    category: 'General',
  },
  {
    id: 'side-effect',
    term: 'Side Effect',
    definition: 'An unwanted effect that happens when you take a medication. Side effects can range from mild (like dry mouth) to severe (like allergic reactions). Not everyone experiences side effects.',
    category: 'Medications',
  },
  {
    id: 'dosage',
    term: 'Dosage',
    definition: 'The amount of medication you should take and how often you should take it. Dosage is carefully determined by your doctor based on your age, weight, medical condition, and other factors.',
    category: 'Medications',
  },
  {
    id: 'generic-drug',
    term: 'Generic Drug',
    definition: 'A medication that has the same active ingredients as a brand-name drug but usually costs less. Generic drugs are just as safe and effective as brand-name drugs and must meet the same quality standards.',
    category: 'Medications',
  },
  {
    id: 'prescription',
    term: 'Prescription',
    definition: 'A written order from a doctor for a medication or treatment. Prescription medications can only be obtained from a pharmacy with a doctor\'s authorization.',
    category: 'Medications',
  },
  {
    id: 'over-the-counter',
    term: 'Over-the-Counter (OTC)',
    definition: 'Medications you can buy without a prescription from a doctor. These include common medicines like pain relievers, cold medicines, and allergy medications. Even though they don\'t require a prescription, they can still have side effects and interactions.',
    category: 'Medications',
  },
  {
    id: 'biopsy',
    term: 'Biopsy',
    definition: 'A medical procedure where a small sample of tissue is removed from your body for examination under a microscope. Biopsies are often used to diagnose cancer or other diseases.',
    category: 'Procedures',
  },
  {
    id: 'ct-scan',
    term: 'CT Scan',
    definition: 'Computed Tomography scan. A special X-ray test that uses a computer to create detailed pictures of your body. It can help diagnose many conditions, including cancer, heart disease, and injuries.',
    category: 'Procedures',
  },
  {
    id: 'mri',
    term: 'MRI',
    definition: 'Magnetic Resonance Imaging. A test that uses powerful magnets and radio waves to create detailed pictures of your body. It\'s especially useful for looking at soft tissues like the brain, muscles, and joints.',
    category: 'Procedures',
  },
  {
    id: 'ultrasound',
    term: 'Ultrasound',
    definition: 'A test that uses sound waves to create pictures of the inside of your body. It\'s commonly used during pregnancy but can also examine organs like the heart, liver, and kidneys.',
    category: 'Procedures',
  },
  {
    id: 'inflammation',
    term: 'Inflammation',
    definition: 'Your body\'s response to injury or infection. It causes redness, swelling, heat, and pain. Short-term inflammation helps your body heal, but long-term (chronic) inflammation can damage your body.',
    category: 'General',
  },
  {
    id: 'immune-system',
    term: 'Immune System',
    definition: 'Your body\'s defense system against infections and diseases. It includes white blood cells, antibodies, and other organs and tissues that work together to protect you from germs and harmful substances.',
    category: 'General',
  },
  {
    id: 'metabolism',
    term: 'Metabolism',
    definition: 'The chemical processes in your body that convert food and drink into energy. It includes all the reactions that keep your body functioning, like breathing, digesting food, and repairing cells.',
    category: 'General',
  },
  {
    id: 'placebo',
    term: 'Placebo',
    definition: 'A substance with no active ingredients, used in medical studies as a control. In clinical trials, some people get the real treatment while others get a placebo to compare the effects.',
    category: 'Research',
  },
  {
    id: 'clinical-trial',
    term: 'Clinical Trial',
    definition: 'A research study that tests new medical treatments, drugs, or devices in people. Clinical trials help determine if new treatments are safe and effective before they\'re made available to the public.',
    category: 'Research',
  },
];

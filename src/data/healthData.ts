export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  title: string;
  subtitle: string;
  points: { title: string; desc: string; iconName: string }[];
  interactiveComponentId: string; // ID of custom interactive component to show
  takeaway: string;
}

export interface TopicData {
  id: string;
  title: string;
  shortDesc: string;
  category: string;
  badgeName: string;
  badgeIcon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  colorTheme: string; // tailwind border/bg colors
  lesson: LessonSection;
  quiz: QuizQuestion[];
}

export const HEALTH_TOPICS: TopicData[] = [
  {
    id: "medical-terminology",
    title: "Cracking the Doctor's Code",
    shortDesc: "Demystify complex clinical jargon, prefixes, and medical terminology into plain English.",
    category: "Terminology",
    badgeName: "Term Decoder",
    badgeIcon: "Stethoscope",
    difficulty: "Beginner",
    readTime: "4 mins",
    colorTheme: "emerald",
    lesson: {
      title: "Understanding Doctor-Speak",
      subtitle: "Medical terms can sound intimidating, but they are just constructed like Lego blocks with predictable roots, prefixes, and suffixes.",
      points: [
        {
          title: "The Suffix '-itis' (Swelling/Inflammation)",
          desc: "Whenever you see '-itis', it just means something is swollen, irritated, or inflamed. E.g., 'Arthritis' = joint inflammation (arthr- = joint). 'Tonsillitis' = tonsil inflammation.",
          iconName: "Thermometer"
        },
        {
          title: "Prefix 'Hyper-' vs. 'Hypo-'",
          desc: "'Hyper-' means too high or over-active. 'Hypo-' means too low or under-active. E.g., 'Hypertension' is high blood pressure. 'Hypoglycemia' is low blood sugar.",
          iconName: "TrendingUp"
        },
        {
          title: "The Suffix '-opathy' (Disease/Condition)",
          desc: "'-opathy' signals a disease or dysfunction. E.g., 'Neuropathy' is a disease or damage of the nerves (neuro-). 'Cardiomyopathy' is a disease of the heart muscle.",
          iconName: "Heart"
        },
        {
          title: "Acute vs. Chronic",
          desc: "These describe speed, not severity! 'Acute' means sudden and short-lived (like a sprained ankle or flu). 'Chronic' means long-lasting and slow-developing (like asthma or diabetes).",
          iconName: "Clock"
        }
      ],
      interactiveComponentId: "jargon-builder",
      takeaway: "Doctors use these terms to be precise with each other, but as a patient, you have the absolute right to have every term explained in plain words during your visit. Never feel embarrassed to ask!"
    },
    quiz: [
      {
        id: "mt-q1",
        question: "If a doctor tells you that your blood test indicates 'hyperglycemia', what does that mean in simple terms?",
        options: [
          "Your blood pressure is too low.",
          "Your blood sugar level is abnormally high.",
          "Your blood oxygen level is perfect.",
          "Your thyroid gland is under-active."
        ],
        correctIndex: 1,
        explanation: "'Hyper-' means high/over, and '-glycemia' refers to sugar in the blood. Therefore, hyperglycemia translates directly to high blood sugar."
      },
      {
        id: "mt-q2",
        question: "Which of the following conditions is considered a 'chronic' illness?",
        options: [
          "A sudden throat infection that resolves in 5 days.",
          "A broken wrist from falling off a bicycle.",
          "Type 2 diabetes that requires daily management over many years.",
          "A mild headache after spending the afternoon in the sun."
        ],
        correctIndex: 2,
        explanation: "'Chronic' describes conditions that persist long-term (usually three months or more) and require ongoing management."
      },
      {
        id: "mt-q3",
        question: "What does the word 'idiopathic' mean when a clinician says you have 'idiopathic hives'?",
        options: [
          "The hives are highly contagious and dangerous to others.",
          "The hives were caused by an idiomatic phrase.",
          "The exact cause of your hives is unknown.",
          "The hives will disappear instantly with ice."
        ],
        correctIndex: 2,
        explanation: "'Idiopathic' is a medical term used when a symptom or disease arises spontaneously and has no known or clear identifiable origin."
      }
    ]
  },
  {
    id: "prescription-labels",
    title: "Reading Prescription Labels",
    shortDesc: "Understand exactly how, when, and how much medication to take to avoid dangerous errors.",
    category: "Medication Safety",
    badgeName: "Safe Rx Scholar",
    badgeIcon: "Pill",
    difficulty: "Beginner",
    readTime: "5 mins",
    colorTheme: "blue",
    lesson: {
      title: "Decoding Your Pill Bottle",
      subtitle: "Prescription (Rx) labels contain life-saving safety information, yet up to 60% of people misunderstand instructions like 'take twice daily'.",
      points: [
        {
          title: "Look for Active Ingredients",
          desc: "Many generic and brand-name drugs contain the same active ingredients. For example, taking Brand Tylenol and Brand NyQuil together can cause dangerous double-doses of acetaminophen.",
          iconName: "ShieldAlert"
        },
        {
          title: "The Directions (Sig Codes) Made Simple",
          desc: "Instructions like 'Take 1 tablet every 12 hours' are safer than 'Take twice daily' because they keep drug levels in your blood constant. Ask your pharmacist to specify absolute times if you are unsure.",
          iconName: "CalendarDays"
        },
        {
          title: "Critical Auxiliary Warning Stickers",
          desc: "Color warning labels on bottles are NOT optional. 'Take with food' means the drug needs fat/food to absorb and protect your stomach. 'Do not drink alcohol' indicates a dangerous liver or drowsiness interaction.",
          iconName: "Flame"
        },
        {
          title: "Understanding Refill Deadlines",
          desc: "'Refills: 3 before 12/2026' means the insurance / doctor allows three extra bottle fills, but only before that date, regardless of how many pills you have left.",
          iconName: "RefreshCw"
        }
      ],
      interactiveComponentId: "prescription-diagram",
      takeaway: "Always inspect the active ingredient, absolute schedule instructions, and warning stickers before leaving the pharmacy counter. Pharmacists are free safety consultants—use them!"
    },
    quiz: [
      {
        id: "rx-q1",
        question: "You have two bottles of medication: one is brand-name Tylenol for headaches, and the other is a prescription cold medicine. Both list 'acetaminophen' under active ingredients. What should you do?",
        options: [
          "Take both simultaneously to double the speed of cure.",
          "Consult your pharmacist before taking both, to avoid dangerous liver-damaging double dosing in active ingredients.",
          "Take the cold medicine at night and double doses of Tylenol during the day.",
          "Crush them both together and drink them with milk."
        ],
        correctIndex: 1,
        explanation: "Acetaminophen is the active chemical in Tylenol and many over-the-counter flu remedies. Taking both concurrently can exceed the daily toxic limit (4,000 mg) and cause severe irreversible liver damage."
      },
      {
        id: "rx-q2",
        question: "What does an auxiliary label saying 'Take with a Full Glass of Water and Food' mean?",
        options: [
          "You should chew the pills dry, and then drink milk.",
          "The medication needs food to prevent severe stomach irritation and to absorb correctly into your body.",
          "You only need to eat food if you feel hungry while on the pill.",
          "This label is a recommendation for general hydration, not specific to the pill."
        ],
        correctIndex: 1,
        explanation: "'Take with food' means the active ingredients can cause severe irritation/ulcers on an empty stomach, or require fats/acids from food to dissolve and enter your bloodstream successfully."
      },
      {
        id: "rx-q3",
        question: "If your prescription label instructions state: 'Take 1 tablet PO Q12H', what does that code mean?",
        options: [
          "Take 1 tablet by mouth every 12 hours.",
          "Take 1 tablet post-original meal daily.",
          "Take 1 tablet after physical work 12 times a day.",
          "Apply 1 tablet topically on a wound every morning."
        ],
        correctIndex: 0,
        explanation: "In pharmaceutical abbreviations (Sig), 'PO' stands for 'per os' (by mouth) and 'Q12H' stands for 'quaque 12 horae' (every 12 hours)."
      }
    ]
  },
  {
    id: "nutrition-labels",
    title: "Mastering Nutrition Labels",
    shortDesc: "Cut through marketing hype and read nutrition panels to protect your cardiovascular and metabolic health.",
    category: "Nutrition Literacy",
    badgeName: "Nutrition Analyst",
    badgeIcon: "Apple",
    difficulty: "Intermediate",
    readTime: "5 mins",
    colorTheme: "amber",
    lesson: {
      title: "Analyzing the Food Label",
      subtitle: "Food boxes have bright claims like 'Healthy' or 'All Natural' on the front, but the real, government-regulated truth is on the black-and-white panel on the back.",
      points: [
        {
          title: "The Serving Size Trap",
          desc: "A small bottle of tea may list '90 Calories' on the label, but check 'Servings per Container'. If it is 2.5, drinking the whole bottle is 225 calories, not 90!",
          iconName: "Scale"
        },
        {
          title: "Added Sugars vs. Total Sugars",
          desc: "Natural sugars are bound to fiber (like in fruits), which digests slowly. 'Added Sugars' are directly dumped in during processing, spiking blood insulin, causing fat storage, and metabolic issues.",
          iconName: "Activity"
        },
        {
          title: "Sodium (The Silent Hypertension Driver)",
          desc: "Your body only needs about 500 mg of sodium daily. The maximum safe daily limit is 2,300 mg (about 1 teaspoon of salt!). Check the sodium level—frozen dinners can have 1,200 mg in one serving!",
          iconName: "Droplet"
        },
        {
          title: "The % Daily Value (% DV) Rule",
          desc: "Quick math: 5% DV or less is considered LOW for that nutrient. 20% DV or more is considered HIGH. You want low % DV for sodium, saturated fat, and added sugar, but high % DV for fiber and potassium.",
          iconName: "Percent"
        }
      ],
      interactiveComponentId: "nutrition-fact-picker",
      takeaway: "Do not buy packaged food based on the cardboard front marketing. Turn it around, check the serving multiplier, look at added sugar, and inspect sodium totals."
    },
    quiz: [
      {
        id: "nut-q1",
        question: "A pre-packaged cup of soup lists '400 mg sodium per serving', and says the container holds 3 servings. If you eat the entire cup, how much sodium have you consumed?",
        options: [
          "400 mg",
          "800 mg",
          "1,200 mg",
          "120 mg"
        ],
        correctIndex: 2,
        explanation: "If you eat the entire container, you must multiply the sodium per serving (400 mg) by the number of servings (3), yielding 1,200 mg. That is more than half of the daily allowance!"
      },
      {
        id: "nut-q2",
        question: "According to the food safety guidelines, what is the '5/20 standard Rule' for % Daily Value (% DV) in food labels?",
        options: [
          "5% is the amount of fruit, and 20% is the amount of vegetables you should eat.",
          "Under 5% DV means a food is low in that nutrient; over 20% DV means it is high.",
          "5 servings of carbs should be balanced against 20 minutes of cardio exercise.",
          "Food must expire in 5 days if kept at 20 degrees Celsius."
        ],
        correctIndex: 1,
        explanation: "The 5/20 rule is an easy trick: 5% DV or less is low (good for things you want limit like trans fat and sodium), and 20% or more is high (great for fiber, iron, and calcium)."
      },
      {
        id: "nut-q3",
        question: "Why is 'Added Sugar' listed separately from 'Total Carbohydrates/Sugars' on contemporary nutrition labels?",
        options: [
          "Added sugars are chemical synthetics, while regular sugar is normal.",
          "Because added sugars are heavily correlated with chronic metabolic diseases and heart condition risk, and can be avoided easily by consumers.",
          "Added sugar is of zero caloric value.",
          "It helps food companies market their sugary products more effectively."
        ],
        correctIndex: 1,
        explanation: "Added sugars represent empty calories added by manufacturers during processing, which spike blood sugar rapidly and are distinct from sugars structurally integrated with fiber (like whole fruits)."
      }
    ]
  },
  {
    id: "healthcare-navigation",
    title: "Navigating Healthcare Costs & Services",
    shortDesc: "Understand how insurance works, avoid emergency room traps, and save thousands of dollars on clinical visits.",
    category: "System Navigation",
    badgeName: "Health Care Navigator",
    badgeIcon: "Map",
    difficulty: "Advanced",
    readTime: "6 mins",
    colorTheme: "purple",
    lesson: {
      title: "How to Avoid Medical Debt",
      subtitle: "The healthcare system is notoriously complex. Knowing how insurance structures fees and where to seek care can save you life-altering debt.",
      points: [
        {
          title: "Deductible vs. Copayment",
          desc: "A **Deductible** is a yearly fixed amount you pay before insurance covers *anything* (except basic preventative care). A **Copay** is a small fixed fee per visit (e.g. $25) you pay even after hitting the deductible.",
          iconName: "DollarSign"
        },
        {
          title: "The Out-of-Pocket Maximum",
          desc: "This is the 'safety net' cap. It's the absolute max amount you can spend on medical bills in a year. Once you reach it, the insurance company pays 100% of all in-network expenses.",
          iconName: "Shield"
        },
        {
          title: "ER (Emergency Room) vs. Urgent Care",
          desc: "An ER visit costs over $2,000 on average. Going to Urgent Care costs about $150. Use Urgent Care for sprains, minor stitches, fever, and mild asthma. Use the ER only for life-threatening emergencies (heart attack symptoms, severe head trauma, intense bleeding).",
          iconName: "Ampersand"
        },
        {
          title: "In-Network vs. Out-of-Network",
          desc: "Insurance companies contract with specific doctors ('In-Network') for massive discounts. Visiting an Out-of-Network provider means your insurance may refuse to pay, leaving you with the full, unnegotiated bill.",
          iconName: "GitMerge"
        }
      ],
      interactiveComponentId: "cost-calculator",
      takeaway: "When choosing healthcare, always double-check that both the facility and the specific doctor are 'in-network' with your policy. Seek primary care or urgent care before defaulting to the ER!"
    },
    quiz: [
      {
        id: "hc-q1",
        question: "Your insurance policy has an annual 'Deductible' of $2,000, a 'Copay' of $30 for specialist visits, and an 'Out-of-Pocket Maximum' of $5,000. Under this plan, what is your initial responsibility during your first doctor scan of the year costing $1,200?",
        options: [
          "You pay $30 copay, and the insurance covers the remaining $1,170.",
          "You pay the full $1,200 out-of-pocket because you have not met your $2,000 deductible.",
          "You pay $5,000 maximum instantly.",
          "The insurance company pays the full $1,200 because it's a doctor scan."
        ],
        correctIndex: 1,
        explanation: "Since your deductible is $2,000, you are responsible for 100% of non-preventive medical bills up to that threshold before the insurance begins paying."
      },
      {
        id: "hc-q2",
        question: "On a Saturday afternoon, you twist your ankle playing soccer. It is painful to walk, but there is no bone sticking out, no numbness, and no severe swelling. Where is the most financially sensible, appropriate place to go?",
        options: [
          "The nearest hospital Emergency Room (ER).",
          "An Urgent Care clinic.",
          "Wait until Monday morning to see a surgeon.",
          "Calling 911 for an ambulance."
        ],
        correctIndex: 1,
        explanation: "Urgent care clinics are open on weekends, possess X-ray machines, and can treat sprains/minor fractures for a fraction of the cost ($100-$200) and waiting time of an Emergency Room ($2,000+)."
      },
      {
        id: "hc-q3",
        question: "What does it mean if a medical provider is 'out-of-network' for your insurance plan?",
        options: [
          "The doctor works in a clinic that has no internet connection.",
          "The provider does not contract with your insurance provider, meaning you will face significantly higher out-of-pocket prices.",
          "The doctor is licensed in an entirely different state.",
          "The doctor only treats patients of other insurance types."
        ],
        correctIndex: 1,
        explanation: "Out-of-network providers have no price-discount agreement with your insurance plan. The insurance may cover 0% or a much lower percentage, exposing you to catastrophic balance billing."
      }
    ]
  },
  {
    id: "self-advocacy",
    title: "Speaking Up: Self-Advocacy at the Clinic",
    shortDesc: "Learn the 'Ask Me 3' technique and how to effectively prepare for and control your medical appointments.",
    category: "Communication",
    badgeName: "Empowered Patient",
    badgeIcon: "Volume2",
    difficulty: "Beginner",
    readTime: "4 mins",
    colorTheme: "rose",
    lesson: {
      title: "Being Your Own Health Advocate",
      subtitle: "Appointments are often rushed. On average, a patient is interrupted by their doctor within 11 seconds. Preparing a strategic communication checklist is vital.",
      points: [
        {
          title: "The 'Ask Me 3' Strategy",
          desc: "Before you leave, ask these three questions:\n1. WHAT is my main medical problem?\n2. WHAT do I need to do about it?\n3. WHY is it critical for me to do this?",
          iconName: "HelpCircle"
        },
        {
          title: "Bring a Detailed Diary / Medication List",
          desc: "Do not rely on memory! Write down your symptoms, when they happen, what trigger events occur, and a complete ledger of current supplements, dosages, and prescriptions.",
          iconName: "Notebook"
        },
        {
          title: "Write Down Your Top 3 Questions First",
          desc: "At the start of the visit, hand the list or verbally declare: 'Doctor, I have three specific questions I must cover before we finish today.' This sets an agenda.",
          iconName: "MessageSquareCode"
        },
        {
          title: "You Can Request a Teach-Back",
          desc: "Say: 'To make sure I have this exactly right, let me explain back what I think you want me to do...' This verifies that you and your doctor are aligned.",
          iconName: "Speech"
        }
      ],
      interactiveComponentId: "ask-me-three-builder",
      takeaway: "A good healthcare provider wants you to understand your plan. If a clinician dismisses your questions, raises their eyes, or refuses to translate terms, it is a sign you need a different advocate."
    },
    quiz: [
      {
        id: "sa-q1",
        question: "Which of the following is the core triad of questions in the 'Ask Me 3' health literacy communication protocol?",
        options: [
          "How much does this cost? Can I get a generic? Where is the pharmacy?",
          "What is my main problem? What do I need to do? Why is it important for me to do this?",
          "How long have you been a doctor? Where did you go to school? Are you in-network?",
          "Can I have a second doctor? Is this a terminal problem? Should I google this?"
        ],
        correctIndex: 1,
        explanation: "The 'Ask Me 3' program, developed by the National Patient Safety Foundation, centers on: 1) What is my main problem? 2) What do I need to do? and 3) Why is it important for me to do this?"
      },
      {
        id: "sa-q2",
        question: "What is the primary benefit of using the 'Teach-Back' method at the end of a clinical consultation?",
        options: [
          "It proves you are smarter than the medical doctor.",
          "It lets you explain the plan in your own words so the doctor can verify you understand the recovery steps and clear up any confusion.",
          "It saves the doctor from having to write clinical notes in your file.",
          "It automatically triggers a discount on your general copayment."
        ],
        correctIndex: 1,
        explanation: "Teach-back is a scientific communication technique where you describe the instructions in your own vocabulary. This allows the provider to instantly verify your comprehension and correct any misremembered instructions."
      }
    ]
  }
];

import { useState } from "react";
import { HelpCircle, AlertTriangle, Info, RefreshCw, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LabelFeature {
  id: string;
  title: string;
  subtitle: string;
  expl: string;
  impact: string;
  color: string;
}

const FEATURES: LabelFeature[] = [
  {
    id: "rx-num",
    title: "Prescription Number (Rx#)",
    subtitle: "The identifier sequence: Rx# 6049281-002",
    expl: "This is a unique tracking number assigned strictly to this individual bottle order by the pharmacist. The clinic name matches it.",
    impact: "Impact: Give this exact number to the pharmacy or medical staff when requesting telephone refills, instead of saying 'the yellow circle pill'. It guarantees zero mix-ups.",
    color: "indigo"
  },
  {
    id: "active-ingredient",
    title: "Active Ingredient & Strengths",
    subtitle: "ATORVASTATIN 40MG TAB",
    expl: "This lists the actual pharmaceutical chemical (Atorvastatin) inside. It is the generic chemical name for brand Lipitor, which controls cholesterol.",
    impact: "Impact: CRITICAL! Do NOT take Atorvastatin and brand Lipitor together. Always check active chemicals across multiple bottles to avoid severe accidental liver or muscle toxicity.",
    color: "emerald"
  },
  {
    id: "sig-schedule",
    title: "Directions (The 'Sig')",
    subtitle: "TAKE 1 TABLET BY MOUTH ONCE DAILY AT BEDTIME",
    expl: "Specific instructions written by the doctor. Note 'at bedtime' because cholesterol-producing liver enzymes are most active in physical sleep states.",
    impact: "Impact: Taking pills arbitrarily 'once a day' in the morning is less medically effective here. Adhering to precise times maximizes drug effects and matches body rhythm.",
    color: "amber"
  },
  {
    id: "refills",
    title: "Refills Allowed",
    subtitle: "Refills: 4 before 12/15/2026",
    expl: "The quantity of duplicates permitted. It also states an absolute expiration date.",
    impact: "Impact: Even if you have '4 refills' left on the label, they automatically expire on 12/15/2026. After that date, the pharmacy must call the doctor's office.",
    color: "purple"
  },
  {
    id: "auxiliary-stickers",
    title: "Warning Sticker Icons",
    subtitle: "DO NOT TAKE WITH GRAPEFRUIT JUICE",
    expl: "These colored indicators highlight strict food, drink, or activity rules.",
    impact: "Impact: Grapefruit contains chemical enzymes that block the breakdown of Atorvastatin. Drinking juice with it effectively triples the medicine dose in your bloodstream, sparking harmful toxicity!",
    color: "rose"
  }
];

export default function PrescriptionDiagram() {
  const [selectedNum, setSelectedNum] = useState<string>("active-ingredient");

  const activeObj = FEATURES.find((f) => f.id === selectedNum) || FEATURES[0];

  return (
    <div id="prescription-diagram-root" className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-slate-800 text-base">Interactive Rx Prescription Bottle Decoder</h4>
      </div>
      <p className="text-slate-600 text-xs mb-5 leading-relaxed">
        Hover or click the highlighted <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-mono font-bold">orange targets</span> on the bottle label below. Master what each piece of text actually means to prevent dosage mistakes!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Bottle Representation */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-h-[320px]">
          {/* Bottle Caps */}
          <div className="w-32 h-6 bg-slate-300 rounded-t-lg border-b border-slate-400"></div>
          {/* Orange glass body */}
          <div className="relative w-64 bg-amber-500 rounded-b-xl border border-amber-600 shadow-lg p-3 flex flex-col items-center">
            
            {/* White sticker Label */}
            <div className="w-full bg-white rounded border border-slate-300 p-2.5 text-slate-800 text-[10px] space-y-2 select-none shadow-sm relative overflow-hidden">
              {/* Pharmacy Title */}
              <div className="flex justify-between border-b border-dashed border-red-200 pb-1">
                <span className="font-bold text-red-600 font-mono">CITIZEN MED CARE PHARMACY</span>
                <span className="text-slate-400">Tel: (555) 019-9230</span>
              </div>

              {/* Rx Num Info */}
              <div className="flex justify-between items-center bg-slate-50 p-1 rounded">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-400">Rx#:</span>
                  <button
                    onClick={() => setSelectedNum("rx-num")}
                    className={`font-bold font-mono px-1 py-0.5 rounded transition-all ${
                      selectedNum === "rx-num"
                        ? "bg-indigo-600 text-white"
                        : "bg-amber-100 text-amber-900 border border-amber-400 hover:bg-amber-200 animate-pulse"
                    }`}
                  >
                    6049281-002
                  </button>
                </div>
                <div>Date: 05/22/2026</div>
              </div>

              {/* Patient */}
              <div>
                <div className="text-slate-400">PATIENT:</div>
                <div className="font-bold text-slate-900 text-xs">JANE CITIZEN</div>
              </div>

              {/* Active Ingredient */}
              <div className="space-y-0.5">
                <div className="text-slate-400 font-sans">MEDICATION & DOSE:</div>
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedNum("active-ingredient")}
                    className={`font-semibold font-mono text-left px-1.5 py-0.5 rounded transition-all ${
                      selectedNum === "active-ingredient"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-100 text-amber-900 border border-amber-400 hover:bg-amber-200 animate-pulse"
                    }`}
                  >
                    ATORVASTATIN 40MG TAB
                  </button>
                </div>
              </div>

              {/* The Sig directions */}
              <div className="space-y-1">
                <div className="text-slate-400">DIRECTIONS:</div>
                <button
                  onClick={() => setSelectedNum("sig-schedule")}
                  className={`font-semibold text-left p-1.5 rounded transition-all block w-full leading-tight ${
                    selectedNum === "sig-schedule"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 text-amber-900 border border-amber-400 hover:bg-amber-200 animate-pulse"
                  }`}
                >
                  TAKE 1 TABLET BY MOUTH ONCE DAILY AT BEDTIME
                </button>
              </div>

              {/* Doctor / refills */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-1">
                <div>Dr. Arthur Cooper</div>
                <button
                  onClick={() => setSelectedNum("refills")}
                  className={`font-bold px-1.5 py-0.5 rounded transition-all ${
                    selectedNum === "refills"
                      ? "bg-purple-600 text-white"
                      : "bg-amber-100 text-amber-900 border border-amber-400 hover:bg-amber-200 animate-pulse"
                  }`}
                >
                  Refills Remaining: 4
                </button>
              </div>

              {/* Simulated Warnings */}
              <div className="flex gap-2 pt-1.5 border-t border-dashed border-slate-150">
                <button
                  onClick={() => setSelectedNum("auxiliary-stickers")}
                  className={`flex items-center gap-1 p-1 rounded text-[9px] font-semibold tracking-tight transition-all ${
                    selectedNum === "auxiliary-stickers"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-100 text-rose-800 border-2 border-dashed border-rose-400 animate-pulse"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  NO GRAPEFRUIT
                </button>
                <div className="bg-amber-100 text-amber-800 p-1 rounded text-[9px] font-semibold flex items-center gap-1 select-none">
                  <Info className="w-3 h-3" />
                  TAKE WITH WATER
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Explainer Panel */}
        <div className="lg:col-span-5 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeObj.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`p-1.5 rounded-lg bg-${activeObj.color}-50 text-${activeObj.color}-600 shrink-0`}>
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{activeObj.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono block leading-none">{activeObj.subtitle}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {activeObj.expl}
                  </p>
                  <div className={`p-3 bg-slate-50 rounded-lg border-l-4 border-slate-500 text-slate-700 text-xs font-sans`}>
                    {activeObj.impact}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Click on other orange areas to continue learning.</span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-300 animate-spin-slow" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

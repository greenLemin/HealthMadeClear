import { useState } from "react";
import { ClipboardList, Printer, Copy, Check, MessageSquare } from "lucide-react";

interface Symptom {
  id: string;
  name: string;
  suggestedQuestion: string;
}

const PRESETS: Symptom[] = [
  { id: "pain", name: "Persistent pain or swelling", suggestedQuestion: "Does this pain point to swelling inside, or structural wear? Is there a non-drug therapy?" },
  { id: "med", name: "Starting a new medication", suggestedQuestion: "What are the common side effects, and are there active chemical conflicts with my supplements?" },
  { id: "dizzy", name: "Dizziness or extreme fatigue", suggestedQuestion: "Could this fatigue be linked directly to my thyroid, hydration, or sleep habits?" },
  { id: "ins", name: "Alternative insurance or price-cap concerns", suggestedQuestion: "Are there low-cost generic substitutes or patient-assistance plans for this scan?" }
];

export default function AskMeThreeBuilder() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([" pain"]);
  const [patientNote, setPatientNote] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentQuestions = PRESETS.filter((p) => selectedSymptoms.includes(p.id));

  const handleCopy = () => {
    let text = "HEALTH ADVOCACY PLAN - CLINIC VISIT PREPARATION\n";
    text += "================================================\n\n";
    text += "MY SYMPTOMS & CONCERNS:\n";
    if (patientNote) {
      text += `- ${patientNote}\n`;
    }
    PRESETS.filter(p => selectedSymptoms.includes(p.id)).forEach(p => {
      text += `- ${p.name}\n`;
    });
    
    text += "\nCORE 'ASK ME 3' QUESTION ROADMAP TO REVEAL DURING MY VISIT:\n";
    text += "1. What is my main medical problem? (Ask doctor to specify and translate any jargon)\n";
    text += "2. What do I need to do? (Write down exactly how to adhere, eat, or sleep)\n";
    text += "3. Why is it important for me to do this? (What is the exact outcome, and what happens if I do not do this?)\n";

    text += "\nSPECIFIC QUESTIONS BASED ON MY SELECTIONS:\n";
    currentQuestions.forEach((q, idx) => {
      text += `${idx + 1}. ${q.suggestedQuestion}\n`;
    });

    text += "\nTEACH-BACK TARGET STATEMENTS:\n";
    text += "- 'To ensure I have everything set up perfectly, let me recite back what I think the plan is: [explain instructions in my own words]'\n";

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ask-me-three-builder-root" className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-rose-500" />
        <h4 className="font-semibold text-slate-800 text-base">Self-Advocacy Clinic Appointment Planner</h4>
      </div>
      <p className="text-slate-600 text-xs mb-5 leading-relaxed">
        Appointments are often rushed and stressful. Check off your general visit goals below, add notes, and compile a tailored <b>Ask Me 3</b> printout checklist to hand to your doctor or read!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Interactive Selection panel */}
        <div className="md:col-span-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">1. Select Patient Concerns:</span>
            <div className="space-y-1.5">
              {PRESETS.map((p) => (
                <label
                  key={p.id}
                  id={`symptom-label-${p.id}`}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    selectedSymptoms.includes(p.id)
                      ? "bg-rose-50 border-rose-300 text-rose-900 font-medium"
                      : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(p.id)}
                    onChange={() => toggleSymptom(p.id)}
                    className="rounded text-rose-500 accent-rose-500 w-3.5 h-3.5 mt-0.5 border-slate-300"
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">2. Additional Notes or Specific Pain Indicators:</span>
            <textarea
              id="patient-advocacy-notes-input"
              value={patientNote}
              onChange={(e) => setPatientNote(e.target.value)}
              placeholder="E.g., Left shoulder pain dull, hurts worst after lifting items, constant for 3 weeks..."
              className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Right Planner render screen */}
        <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-250 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Prepared Visit Roadmap
              </span>
              <button
                id="copy-advocacy-plan-btn"
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Plan"}
              </button>
            </div>

            <div className="text-slate-800 text-xs space-y-3 font-sans">
              {/* Patient Note line */}
              {(patientNote || currentQuestions.length > 0) && (
                <div className="text-[11px] text-slate-500 border-l-2 border-slate-200 pl-3.5 italic space-y-1">
                  {patientNote && <div className="truncate">" {patientNote} "</div>}
                  {currentQuestions.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-sans leading-none">
                      Focus: {currentQuestions.map(q => q.name).join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* CORE ASK ME 3 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-rose-500" /> Core Ask Me 3 Checklist:
                </span>
                <ol className="space-y-1.5 pl-3 list-decimal font-medium text-slate-700">
                  <li>
                    <span className="font-bold text-slate-900">What is my main problem?</span>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-tight">Prompt: Ask the doctor to explain any clinical terms in daily, simple words.</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">What do I need to do?</span>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-tight">Prompt: Listen for safety rules, active limits, or pill dosage routines.</span>
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">Why is it important for me to do this?</span>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-tight">Prompt: Ask what physical risk happens if you skip or misuse treatments.</span>
                  </li>
                </ol>
              </div>

              {/* Specific Questions compiled */}
              {currentQuestions.length > 0 && (
                <div className="pt-1 select-none">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Tailored Action Questions to ask:</span>
                  <ul className="space-y-1 pl-4 list-disc text-slate-700 leading-tight">
                    {currentQuestions.map((q) => (
                      <li key={q.id}>
                        <span className="font-semibold">{q.suggestedQuestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Teach-Back cue */}
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
                <strong>Clinician Teach-Back Rule:</strong> At the very end, say: <span className="text-slate-600 font-sans">"Just to make sure I have this entirely right, let me explain back what I think you want me to do..."</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

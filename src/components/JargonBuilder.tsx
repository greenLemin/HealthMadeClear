import { useState } from "react";
import { Plus, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JargonPart {
  text: string;
  type: "prefix" | "root" | "suffix";
  meaning: string;
}

const PARTS: JargonPart[] = [
  { text: "Hyper-", type: "prefix", meaning: "Overactive, too high, excessive" },
  { text: "Hypo-", type: "prefix", meaning: "Underactive, too low, deficient" },
  { text: "Neuro-", type: "root", meaning: "Nerves or nervous system" },
  { text: "Cardio-", type: "root", meaning: "Heart or cardiovascular" },
  { text: "Gastro-", type: "root", meaning: "Stomach or digestion" },
  { text: "-itis", type: "suffix", meaning: "Inflammation, swelling, pain" },
  { text: "-opathy", type: "suffix", meaning: "Disease, disorder, dysfunction" },
  { text: "-ology", type: "suffix", meaning: "Study of, field of science" }
];

interface ComboExample {
  title: string;
  formula: string[];
  translation: string;
  clinicalNote: string;
}

const EXAMPLES: ComboExample[] = [
  {
    title: "Hypertension",
    formula: ["Hyper-", "Cardio-"], // representing high pressure (heart)
    translation: "High blood pressure",
    clinicalNote: "Overworks the heart and blood vessels, leading to cardiovascular risks."
  },
  {
    title: "Gastroenteritis",
    formula: ["Gastro-", "-itis"],
    translation: "Stomach inflammation / stomach flu",
    clinicalNote: "Often caused by viruses, resulting in temporary digestive pain and swelling."
  },
  {
    title: "Neuropathy",
    formula: ["Neuro-", "-opathy"],
    translation: "Nerve damage / nerve disease",
    clinicalNote: "Commonly causes numbness, tingling, or pain in hands and feet of diabetes patients."
  },
  {
    title: "Cardiopathology",
    formula: ["Cardio-", "-opathy"],
    translation: "Heart muscle disease",
    clinicalNote: "Refers broadly to structural anomalies or conditions of the cardiac muscle tissues."
  }
];

export default function JargonBuilder() {
  const [selectedPrefix, setSelectedPrefix] = useState<JargonPart | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<JargonPart | null>(null);
  const [selectedSuffix, setSelectedSuffix] = useState<JargonPart | null>(null);
  const [customMeaning, setCustomMeaning] = useState<string | null>(null);

  const handlePartClick = (part: JargonPart) => {
    if (part.type === "prefix") {
      setSelectedPrefix(selectedPrefix?.text === part.text ? null : part);
    } else if (part.type === "root") {
      setSelectedRoot(selectedRoot?.text === part.text ? null : part);
    } else if (part.type === "suffix") {
      setSelectedSuffix(selectedSuffix?.text === part.text ? null : part);
    }
    setCustomMeaning(null);
  };

  const getCombinedName = () => {
    let parts: string[] = [];
    if (selectedPrefix) parts.push(selectedPrefix.text.replace("-", ""));
    if (selectedRoot) {
      let rText = selectedRoot.text.replace("-", "");
      // adjust link vowel o
      parts.push(rText.toLowerCase());
    }
    if (selectedSuffix) {
      let sText = selectedSuffix.text.replace("-", "");
      // if root ends in o and suffix starts with i, strip root vowel
      if (parts.length > 0 && parts[parts.length - 1].endsWith("o") && (sText.startsWith("i") || sText.startsWith("o"))) {
        parts[parts.length - 1] = parts[parts.length - 1].slice(0, -1);
      }
      parts.push(sText);
    }

    if (parts.length === 0) return "Select components...";
    return parts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p.toLowerCase()).join("");
  };

  const decodeCustom = () => {
    if (!selectedPrefix && !selectedRoot && !selectedSuffix) return;
    let meanings: string[] = [];
    if (selectedSuffix) meanings.push(`${selectedSuffix.meaning.toLowerCase()}`);
    if (selectedRoot) meanings.push(`of the ${selectedRoot.meaning.toLowerCase().split(" or ")[0]}`);
    if (selectedPrefix) meanings.push(`characterized by ${selectedPrefix.meaning.toLowerCase()}`);

    if (meanings.length === 0) return "Select components to translate.";
    
    // Joint grammar check
    const rawResult = meanings.join(" ");
    setCustomMeaning(rawResult.charAt(0).toUpperCase() + rawResult.slice(1));
  };

  const clearSelection = () => {
    setSelectedPrefix(null);
    setSelectedRoot(null);
    setSelectedSuffix(null);
    setCustomMeaning(null);
  };

  return (
    <div id="jargon-builder-root" className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        <h4 className="font-semibold text-slate-800 text-base">Interactive Lego-Medical Term Lab</h4>
      </div>
      <p className="text-slate-600 text-xs mb-5 leading-relaxed">
        Medical terms are often just linguistic Lego layers! Mix and match the parts below to build clinical terms, or click on the pre-made words to dissect them instantly.
      </p>

      {/* Dissect Pre-Made Cards */}
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">Dissect Real Clinical Words:</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.title}
              id={`example-dissect-${ex.title.toLowerCase()}`}
              onClick={() => {
                const pre = PARTS.find(p => p.type === "prefix" && p.text === ex.formula[0]) || null;
                const rot = PARTS.find(p => p.type === "root" && p.text === ex.formula[0] || p.text === ex.formula[1]) || null;
                const suf = PARTS.find(p => p.type === "suffix" && (p.text === ex.formula[0] || p.text === ex.formula[1] || p.text === ex.formula[2])) || null;
                
                setSelectedPrefix(pre);
                setSelectedRoot(rot);
                setSelectedSuffix(suf);
                setCustomMeaning(`${ex.translation} (${ex.clinicalNote})`);
              }}
              className="px-3 py-2 text-left bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <div className="text-xs font-bold font-mono text-emerald-800">{ex.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{ex.translation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* The Lego Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Prefixes */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-2">1. Prefix (Modifier at Start)</span>
          <div className="space-y-1">
            {PARTS.filter(p => p.type === "prefix").map((part) => (
              <button
                key={part.text}
                id={`part-click-${part.text.replace("-", "").toLowerCase()}`}
                onClick={() => handlePartClick(part)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border transition-all ${
                  selectedPrefix?.text === part.text
                    ? "bg-indigo-50 border-indigo-300 font-medium text-indigo-800 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                }`}
              >
                <code className="font-bold">{part.text}</code>
                <span className="text-[10px] text-slate-500 text-right max-w-[130px] truncate">{part.meaning}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Roots */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-2">2. Root (The Body Location)</span>
          <div className="space-y-1">
            {PARTS.filter(p => p.type === "root").map((part) => (
              <button
                key={part.text}
                id={`part-click-${part.text.replace("-", "").toLowerCase()}`}
                onClick={() => handlePartClick(part)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border transition-all ${
                  selectedRoot?.text === part.text
                    ? "bg-amber-50 border-amber-300 font-medium text-amber-800 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                }`}
              >
                <code className="font-bold">{part.text}</code>
                <span className="text-[10px] text-slate-500 text-right max-w-[130px] truncate">{part.meaning}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Suffixes */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-2">3. Suffix (Condition at End)</span>
          <div className="space-y-1">
            {PARTS.filter(p => p.type === "suffix").map((part) => (
              <button
                key={part.text}
                id={`part-click-${part.text.replace("-", "").toLowerCase()}`}
                onClick={() => handlePartClick(part)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border transition-all ${
                  selectedSuffix?.text === part.text
                    ? "bg-purple-50 border-purple-300 font-medium text-purple-800 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                }`}
              >
                <code className="font-bold">{part.text}</code>
                <span className="text-[10px] text-slate-500 text-right max-w-[130px] truncate">{part.meaning}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assembly Lab Station */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#a7f3d0] font-bold block mb-1">Your Built Medical Term</span>
          <div className="flex flex-wrap items-center gap-1.5 text-lg font-mono font-semibold tracking-wide">
            {selectedPrefix && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/35">
                {selectedPrefix.text.replace("-", "")}
              </span>
            )}
            {selectedPrefix && selectedRoot && <Plus className="w-4 h-4 text-slate-500" />}
            {selectedRoot && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/35">
                {selectedRoot.text.replace("-", "").toLowerCase()}
              </span>
            )}
            {(selectedRoot || selectedPrefix) && selectedSuffix && <Plus className="w-4 h-4 text-slate-500" />}
            {selectedSuffix && (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/35">
                {selectedSuffix.text.replace("-", "").toLowerCase()}
              </span>
            )}

            {!selectedPrefix && !selectedRoot && !selectedSuffix && (
              <span className="text-slate-500 text-xs font-sans italic">Select sections above to start building...</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {(!selectedPrefix && !selectedRoot && !selectedSuffix) ? null : (
            <>
              <button
                id="jargon-clear-btn"
                onClick={clearSelection}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
              >
                Reset
              </button>
              <button
                id="jargon-decode-btn"
                onClick={decodeCustom}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Translate Term
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meaning Output */}
      <AnimatePresence mode="wait">
        {customMeaning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 shadow-xs"
          >
            <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-900 font-mono mb-1">{getCombinedName()} Dissected:</div>
              <p className="text-xs text-emerald-800 leading-relaxed font-sans">{customMeaning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

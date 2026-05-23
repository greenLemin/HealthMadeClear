import { useState, useEffect } from "react";
import { Sparkles, MessageSquare, AlertTriangle, ShieldCheck, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const LOADING_TIPS = [
  "Tip: Up to 90% of adults struggle to understand standard clinic discharge instructions.",
  "Tip: Never leave a pharmacy counter without verifying any warning labels.",
  "Tip: 'PO' stands for 'per os' - which is medical shorthand for 'by mouth'.",
  "Tip: Generic medications contain the exact same active chemicals as brand-names but cost up to 80% less.",
  "Tip: Your primary care doctor is your guide; write down questions before visits."
];

export default function AiCompanion() {
  const [activeTab, setActiveTab] = useState<"jargon" | "prescription" | "general">("jargon");
  const [inputText, setInputText] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loadingTipIdx, setLoadingTipIdx] = useState<number>(0);

  // Cycle tips during loading
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          type: activeTab,
        }),
      });

      if (!res.ok) {
        throw new Error("The AI translation server encountered an issue. Ensure your API key is correctly configured.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResponse(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    if (activeTab === "jargon") {
      setInputText(
        "Patient presents with acute idiopathic bilateral otitis media and mild tachycardia. Recommend strict rest and OTC acetaminophen Q6H PRN cephalalgia."
      );
    } else if (activeTab === "prescription") {
      setInputText(
        "Metformin 500mg TAB - SIG: 1 TAB PO BID with meals. Qty: 60. Refills: 3 before 12/2026. Avoid dehydration. Warning: Do not drink excessive alcohol."
      );
    } else {
      setInputText("What is a Prior Authorization and why does my insurance require it for my scan?");
    }
  };

  // Safe manual markdown parser for clean custom JSX outputs
  const renderParsedResult = (text: string) => {
    if (!text) return null;

    const sections = text.split("\n");
    return (
      <div className="space-y-2.5 font-sans text-xs text-slate-700 leading-relaxed">
        {sections.map((line, idx) => {
          let cleanLine = line.trim();
          
          if (!cleanLine) return <div key={idx} className="h-2"></div>;

          // Header levels
          if (cleanLine.startsWith("###")) {
            return (
              <h5 key={idx} className="font-bold text-slate-900 text-xs mt-4 pb-1 border-b border-slate-100 flex items-center gap-1">
                {cleanLine.replace("###", "").trim()}
              </h5>
            );
          }
          if (cleanLine.startsWith("##") || cleanLine.startsWith("#")) {
            return (
              <h4 key={idx} className="font-extrabold text-slate-900 text-sm mt-5 pb-1 border-b border-slate-200 text-indigo-900">
                {cleanLine.replace(/##|#/g, "").trim()}
              </h4>
            );
          }

          // Bullet point lists
          if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
            let listText = cleanLine.substring(1).trim();
            // simple inline bold parse (supports **bold**)
            return (
              <li key={idx} className="ml-4 list-disc text-slate-700 list-item mt-1">
                {parseInlineBold(listText)}
              </li>
            );
          }

          // Numbered lists
          const numMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="ml-2 pl-1 mt-2 flex items-start gap-1.5">
                <span className="font-bold text-indigo-600 shrink-0 font-mono text-[10px] bg-indigo-50 px-1 rounded">{numMatch[1]}</span>
                <span className="text-slate-800">{parseInlineBold(numMatch[2])}</span>
              </div>
            );
          }

          // Normal paragraphs
          return <p key={idx}>{parseInlineBold(cleanLine)}</p>;
        })}
      </div>
    );
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-companion-root" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full font-sans">
      {/* Top Section Header */}
      <div className="bg-indigo-900 text-white p-5 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full bg-indigo-800/45 shrink-0 select-none"></div>
        
        <div className="flex items-center gap-2 relative z-10">
          <span className="p-1 px-1.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/15">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </span>
          <div>
            <h3 className="font-bold tracking-tight text-base">Health Literacy AI Companion</h3>
            <span className="text-[10px] text-indigo-200">Instant Clinical Decoding powered by Gemini AI</span>
          </div>
        </div>
      </div>

      {/* Federally Compliant Educational Disclaimer banner */}
      <div className="bg-amber-50 border-b border-amber-100 p-3 flex gap-2.5 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-[10px] text-amber-900 leading-tight">
          <strong>EDUCATIONAL PURPOSE ONLY:</strong> This translator simplifies medical terms to improve your vocabulary. It is NOT official medical advice, diagnosis, or triage. Always review complete treatment steps directly with your doctor.
        </div>
      </div>

      {/* Tabs list Bar */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1.5">
        <button
          id="companion-tab-jargon"
          onClick={() => { setActiveTab("jargon"); setInputText(""); setResponse(""); }}
          className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold tracking-tight uppercase transition-all ${
            activeTab === "jargon"
              ? "bg-white text-indigo-900 border border-slate-200 shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Clinical Notes
        </button>
        <button
          id="companion-tab-prescription"
          onClick={() => { setActiveTab("prescription"); setInputText(""); setResponse(""); }}
          className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold tracking-tight uppercase transition-all ${
            activeTab === "prescription"
              ? "bg-white text-indigo-900 border border-slate-200 shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Prescription Rx
        </button>
        <button
          id="companion-tab-general"
          onClick={() => { setActiveTab("general"); setInputText(""); setResponse(""); }}
          className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold tracking-tight uppercase transition-all ${
            activeTab === "general"
              ? "bg-white text-indigo-900 border border-slate-200 shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Healthcare Q&A
        </button>
      </div>

      {/* Layout Grid */}
      <div className="p-5 space-y-4 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {activeTab === "jargon" && "Clinical summary notes, diagnosis terms, or doctor scribbles:"}
              {activeTab === "prescription" && "Pasted prescription label string content:"}
              {activeTab === "general" && "Open question regarding insurance rules, terminology, or visiting doctors:"}
            </span>
            <button
              id="ai-example-load-btn"
              onClick={loadExample}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Load Example
            </button>
          </div>

          <textarea
            id="ai-inputText-area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeTab === "jargon"
                ? "E.g., Patient is experiencing cephalea with acute subclinical tachycardia during exercise..."
                : activeTab === "prescription"
                ? "E.g., Sig: 1 tab PO QD PC. Refills 2."
                : "E.g., What is copayment coinsurance split? Why is keeping a medication journal useful?"
            }
            className="w-full h-24 p-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Translation trigger button */}
        <button
          id="ai-translate-trigger-btn"
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all focus:outline-none cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Decrypting Terms..." : "Simplifying and Translating Web Jargon"}
        </button>

        {/* Custom progress loading panel */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5 bg-indigo-55/60 border border-indigo-100 rounded-xl">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <div className="text-xs font-bold text-indigo-900 leading-tight animate-pulse">Consulting Health Literacy Teacher...</div>
            <p className="text-[10px] text-indigo-700 font-medium px-6 max-w-sm italic">
              {LOADING_TIPS[loadingTipIdx]}
            </p>
          </div>
        )}

        {/* Display Error if any */}
        {error && (
          <div className="bg-red-50 border border-red-150 p-4 rounded-xl text-red-900 text-xs flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Connection Error</span>
              {error}
            </div>
          </div>
        )}

        {/* AI Result Card display */}
        {response && !loading && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shrink-0 flex-1 overflow-y-auto">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-widest font-mono">Simplified Translation Result:</span>
            </div>
            
            {/* Parsed MD elements */}
            <div className="bg-white p-4 rounded-lg border border-slate-150 shadow-inner">
              {renderParsedResult(response)}
            </div>

            {/* Advocate message */}
            <div className="flex items-center gap-1.5 text-[9px] text-[#047857] font-sans font-bold bg-[#ecfdf5] p-2 rounded justify-center">
              <Heart className="w-3.5 h-3.5" />
              Empower yourself—you always have the right to ask for a plain explanation!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

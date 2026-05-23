import { useState } from "react";
import { Info, HelpCircle, Scale, Flame, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NutritionHighlight {
  id: string;
  title: string;
  baseVal: string;
  expl: string;
  advice: string;
  alert: boolean;
}

const HIGHLIGHTS: NutritionHighlight[] = [
  {
    id: "serving",
    title: "Serving Size & count",
    baseVal: "1 Cup (240ml)",
    expl: "This is the benchmark unit used for all listed stats. It is NOT a statement of how much you are expected or recommended to eat.",
    advice: "Tip: Packages often look like single-servings but hold 2 or 3 servings. If you eat the full bag, you must multiply all calories/sugars by that number!",
    alert: false
  },
  {
    id: "calories",
    title: "Calories (Energy measure)",
    baseVal: "150 kcal",
    expl: "Shows the amount of physical energy you gain from one single serving.",
    advice: "Check: High calories in fluids (sodas/teas) digest rapidly and don't make you feel full. Be conscious of empty calorie fluids.",
    alert: false
  },
  {
    id: "sodium",
    title: "Sodium (Salt total)",
    baseVal: "380 mg",
    expl: "Excess sodium forces the kidneys to retain water, increasing circulating blood volume and driving high blood pressure (hypertension).",
    advice: "Check: Healthy daily target is under 1,500-2,300 mg. One can of soup can easily contain 1,100 mg - over half your daily safe budget!",
    alert: true
  },
  {
    id: "sugars",
    title: "Added Sugars",
    baseVal: "12 g",
    expl: "Total sugar includes natural fruit/dairy sugars. Added Sugar is refined sugar dumped in manually during processing.",
    advice: "Warning: High added sugar causes quick insulin spikes, liver fat accumulation, and accelerates metabolic diabetes.",
    alert: true
  }
];

export default function NutritionFactPicker() {
  const [selectedId, setSelectedId] = useState<string>("serving");
  const [servingsCount, setServingsCount] = useState<number>(2);

  const activeObj = HIGHLIGHTS.find((h) => h.id === selectedId) || HIGHLIGHTS[0];

  // Base Nutrient metrics (per 1 serving of our custom snack)
  const baseCalories = 150;
  const baseCalFromFat = 45;
  const baseSodiumVal = 380;
  const basesodiumPct = 16;
  const baseAddedSugars = 12;
  const baseAddedSugarsPct = 24;

  const currentCal = baseCalories * servingsCount;
  const currentSodium = baseSodiumVal * servingsCount;
  const currentSodiumPct = basesodiumPct * servingsCount;
  const currentSugars = baseAddedSugars * servingsCount;
  const currentSugarsPct = baseAddedSugarsPct * servingsCount;

  return (
    <div id="nutrition-fact-picker-root" className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-amber-600" />
        <h4 className="font-semibold text-slate-800 text-base">Interactive Smart Nutrition Fact Board</h4>
      </div>
      <p className="text-slate-600 text-xs mb-5 leading-relaxed">
        Nutrition tags lie on the back, hiding critical metrics. Use the <span className="font-bold text-amber-700">Multiplier Slider</span> to simulate eating multiple servings, and notice how calories and sodium inflate!
      </p>

      {/* Servings count Slider */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-0.5">Simulate How Much You Eat</span>
          <div className="text-slate-700 text-xs font-semibold">
            I consumed: <span className="text-base font-bold text-amber-600 font-mono">{servingsCount}</span> {servingsCount === 1 ? "serving" : "servings"} {servingsCount === 2 ? "(typical bottle size)" : ""}
          </div>
        </div>

        <div className="w-full md:w-64">
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            id="servings-multiplier-slider"
            value={servingsCount}
            onChange={(e) => setServingsCount(parseInt(e.target.value))}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[9px] text-amber-700 font-mono px-1 font-semibold mt-1">
            <span>1 Serving</span>
            <span>2 Servings</span>
            <span>3 Servings</span>
            <span>4 Servings</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Interactive nutrition label */}
        <div className="md:col-span-6 bg-white p-4 rounded-xl border border-slate-350 shadow-md font-sans text-xs max-w-[280px] mx-auto select-none border-2 border-slate-900">
          <h2 className="text-center text-xl font-black tracking-tight leading-none uppercase border-b-8 border-slate-900 pb-1">Nutrition Facts</h2>
          
          <div className="border-b border-slate-800 py-1.5 flex justify-between tracking-wide font-medium">
            <span>{servingsCount} Servings Per Box</span>
          </div>

          {/* Interactive target: Servings count */}
          <button
            onClick={() => setSelectedId("serving")}
            className={`w-full text-left py-1 px-1.5 rounded transition-all flex justify-between font-mono mt-1 ${
              selectedId === "serving"
                ? "bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600"
                : "hover:bg-slate-50 border-l-4 border-transparent text-slate-700"
            }`}
          >
            <span className="font-bold font-sans">Serving size:</span>
            <span>1 Cup (240ml)</span>
          </button>

          <div className="border-b-4 border-slate-900 py-1 flex justify-between items-center bg-slate-900 text-white px-1.5 rounded-xs mt-1.5">
            <button
              onClick={() => setSelectedId("calories")}
              className="text-left font-sans"
            >
              <div className="text-[10px] text-slate-300 font-semibold uppercase leading-none">Amount per serving</div>
              <div className="text-sm font-bold tracking-tight">Calories</div>
            </button>
            <div className="text-right font-mono font-black text-lg">
              {currentCal}
            </div>
          </div>

          <div className="text-right font-bold text-[9px] py-1 border-b border-slate-300">% Daily Value (% DV)*</div>

          {/* Saturated Fat */}
          <div className="py-1 border-b border-slate-300 flex justify-between">
            <span><strong className="font-semibold">Saturated Fat</strong> 2.5g</span>
            <span className="font-mono">13%</span>
          </div>

          {/* Interactive target: Sodium */}
          <button
            onClick={() => setSelectedId("sodium")}
            className={`w-full text-left py-1.5 px-1.5 rounded transition-all flex justify-between font-mono border-b border-indigo-200 mt-0.5 ${
              selectedId === "sodium"
                ? "bg-amber-100 text-amber-900 font-bold border-l-4 border-amber-600"
                : "hover:bg-slate-50 border-l-4 border-transparent text-slate-700"
            }`}
          >
            <span className="font-sans text-xs">
              <strong className="font-bold">Sodium</strong> {currentSodium}mg
            </span>
            <span>{currentSodiumPct}%</span>
          </button>

          {/* Total carbs */}
          <div className="py-1.5 border-b border-slate-300 flex justify-between">
            <span><strong className="font-semibold">Total Carbohydrate</strong> 28g</span>
            <span className="font-mono">10%</span>
          </div>

          {/* Interactive target: Sugars & Added Sugars */}
          <button
            onClick={() => setSelectedId("sugars")}
            className={`w-full text-left py-1.5 px-1.5 rounded transition-all flex flex-col font-mono border-b border-indigo-100 ${
              selectedId === "sugars"
                ? "bg-amber-100 text-amber-900 border-l-4 border-amber-600"
                : "hover:bg-slate-50 border-l-4 border-transparent text-slate-700"
            }`}
          >
            <div className="flex justify-between w-full font-sans text-xs">
              <span>Total Sugars {currentSugars}g</span>
              <span>-</span>
            </div>
            <div className="flex justify-between w-full pl-3 text-[10px] mt-0.5 text-rose-800">
              <span className="font-semibold">Includes {currentSugars}g Added Sugars</span>
              <span>{currentSugarsPct}%</span>
            </div>
          </button>

          <div className="text-[8px] text-slate-500 leading-tight mt-3">
            * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet of 2,000 calories. 5% DV or less is low, 20% DV or more is high.
          </div>
        </div>

        {/* Explainers side desk */}
        <div className="md:col-span-6 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeObj.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold block mb-1">SELECTED METRIC:</span>
                <h5 className="font-bold text-slate-800 text-sm mb-2">{activeObj.title}</h5>

                <div className="mt-4 space-y-3 font-sans">
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {activeObj.expl}
                  </p>
                  <div className={`p-3 bg-amber-50 rounded-lg border-l-4 ${activeObj.alert ? "border-rose-400" : "border-amber-400"} text-slate-700 text-xs`}>
                    {activeObj.advice}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Click elements directly in the nutrition facts label to analyze.</span>
                <Info className="w-4 h-4 text-slate-300" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

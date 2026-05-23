import { useState, useEffect } from "react";
import { DollarSign, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface Scenario {
  name: string;
  cost: number;
  type: "in-network" | "out-of-network";
  desc: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Doctor Visit (Preventative Care)",
    cost: 150,
    type: "in-network",
    desc: "A routine yearly vaccine/checkup. Under the law, ACA-compliant plans MUST cover primary preventative checkups at 100% with no deductible!"
  },
  {
    name: "Urgent Care ankle cast",
    cost: 350,
    type: "in-network",
    desc: "You went to an in-network Urgent Care clinic. You have a $50 copay for walk-ins, and the rest is processed through your deductible."
  },
  {
    name: "ER (Emergency Room) Chest Pain Scan",
    cost: 4800,
    type: "in-network",
    desc: "A massive, traumatic ER visit. Requires emergency machines and services, prompting major insurance thresholds."
  },
  {
    name: "Out-of-Network MRI Scan",
    cost: 3200,
    type: "out-of-network",
    desc: "You had an MRI at a facility that doesn't contract with your insurance provider. You are billed for the full, uncoordinated charge!"
  }
];

export default function CostCalculator() {
  const [deductible, setDeductible] = useState<number>(1500); // standard deductible
  const [outOfPocketMax, setOutOfPocketMax] = useState<number>(4000); // standard oop max
  const [billCost, setBillCost] = useState<number>(2000); // standard bill cost
  const [isOutOfNetwork, setIsOutOfNetwork] = useState<boolean>(false);
  const [copay, setCopay] = useState<number>(0);

  // outputs
  const [youPay, setYouPay] = useState<number>(0);
  const [insurancePays, setInsurancePays] = useState<number>(0);
  const [calcExplanation, setCalcExplanation] = useState<string>("");

  useEffect(() => {
    // Basic compliance check: Out-of-pocket maximum cannot be less than deductible
    if (outOfPocketMax < deductible) {
      setOutOfPocketMax(deductible);
    }
  }, [deductible, outOfPocketMax]);

  useEffect(() => {
    // Calculate shares
    if (isOutOfNetwork) {
      setYouPay(billCost);
      setInsurancePays(0);
      setCalcExplanation(
        "Because this clinic/provider was Out-of-Network, they do not have a contract with your insurance company. Your insurance refuses to pay, leaving you 100% responsible for the full balance of $" +
          billCost +
          "."
      );
      return;
    }

    // Special case: Preventative care (doctor visit scenario at $150)
    if (billCost === 150) {
      setYouPay(0);
      setInsurancePays(150);
      setCalcExplanation(
        "Preventative Checkup Law: Compliant health insurance is federally mandated to cover primary preventative appointments (vaccinations, annual checkups) at 100% charge list with ZERO cost to you, bypassing the deductible entirely!"
      );
      return;
    }

    // Urgent care copay check
    let effectiveCopay = billCost === 350 ? 50 : 0;
    setCopay(effectiveCopay);

    let remainingBill = billCost - effectiveCopay;
    let patientCost = effectiveCopay;

    if (remainingBill > 0) {
      // First, patient pays up to the deductible
      let remainingDeductible = Math.max(0, deductible);
      
      // We assume for simplicity this is the first bill.
      let deductibleContribution = Math.min(remainingBill, remainingDeductible);
      patientCost += deductibleContribution;
      
      remainingBill -= deductibleContribution;

      // After deductible is met, let's assume 20% co-insurance applies
      if (remainingBill > 0) {
        let coinsuranceShare = remainingBill * 0.20;
        patientCost += coinsuranceShare;
      }
    }

    // Patient payment is strictly safety-capped by the Out-of-Pocket Max!
    let finalPatientCost = Math.min(patientCost, outOfPocketMax);
    let finalInsuranceCost = Math.max(0, billCost - finalPatientCost);

    setYouPay(Math.round(finalPatientCost));
    setInsurancePays(Math.round(finalInsuranceCost));

    let explText = "";
    if (finalPatientCost === outOfPocketMax) {
      explText = `Your Out-of-Pocket Maximum of $${outOfPocketMax} was reached! This means even though the total bill is $${billCost}, you are only legally required to pay $${outOfPocketMax}. Insurance covers the remaining $${finalInsuranceCost} at 100% rate! This is the ultimate health insurance safety net.`;
    } else if (finalPatientCost > deductible) {
      explText = `Insurance process: Since the bill ($${billCost}) exceeds your deductible ($${deductible}), you pay the first $${deductible} out of pocket, plus a 20% co-insurance share ($${Math.round(finalPatientCost - deductible)}) for the rest. Insurance paid $${finalInsuranceCost}!`;
    } else {
      explText = `Under deductible: Your bill ($${billCost}) is lower than your deductible threshold ($${deductible}). Therefore, you must pay the entire active charge of $${finalPatientCost} before insurance will contribute anything.`;
    }

    if (effectiveCopay > 0) {
      explText = `Copay + Bill processing: You paid an immediate flat $${effectiveCopay} clinic copay, then the remaining $${billCost - effectiveCopay} was evaluated against your deductible/coinsurance rules. ` + explText;
    }

    setCalcExplanation(explText);
  }, [deductible, outOfPocketMax, billCost, isOutOfNetwork]);

  const selectScenario = (sc: Scenario) => {
    setBillCost(sc.cost);
    setIsOutOfNetwork(sc.type === "out-of-network");
  };

  return (
    <div id="cost-calculator-root" className="bg-slate-50 p-5 rounded-2xl border border-slate-200 font-sans">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-slate-800 text-base">Interactive Medical Bill & Costs Simulator</h4>
      </div>
      <p className="text-slate-600 text-xs mb-5 leading-relaxed">
        Understand insurance rules to safeguard your finances. Select a preset clinical scenario below, or adjust the slider parameters yourself to calculate exactly who pays what.
      </p>

      {/* Preset Buttons */}
      <div className="mb-5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Preset Clinical Fees Scenarios:</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.name}
              id={`preset-bill-btn-${sc.name.split(" ")[0].toLowerCase()}`}
              onClick={() => selectScenario(sc)}
              className="px-3 py-2 text-left bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="text-[10px] font-bold text-slate-900 truncate leading-tight w-full">{sc.name}</div>
              <div className="flex items-baseline justify-between mt-1 w-full">
                <span className="text-xs font-black text-purple-700 font-mono">${sc.cost}</span>
                <span className={`text-[8px] font-bold uppercase rounded px-1 ${
                  sc.type === "in-network" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {sc.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
        {/* Sliders Input column */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Your Annual Deductible</span>
              <span className="font-bold text-slate-700 font-mono">${deductible}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={deductible}
              onChange={(e) => setDeductible(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-[9px] text-slate-400 block mt-1">First dollars you pay before insurance kicks in.</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Your Out-of-Pocket Maximum</span>
              <span className="font-bold text-slate-700 font-mono">${outOfPocketMax}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="8000"
              step="500"
              value={outOfPocketMax}
              onChange={(e) => setOutOfPocketMax(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-purple-700"
            />
            <span className="text-[9px] text-slate-400 block mt-1">The maximum total limit you pay in a plan year.</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">Medical Bill Charge</span>
              <span className="font-bold text-slate-700 font-mono">${billCost}</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={billCost}
              onChange={(e) => setBillCost(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-purple-800"
            />
            <div className="flex justify-between mt-1 items-center pb-0.5">
              <span className="text-[9px] text-slate-400">Total clinical invoice cost received.</span>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOutOfNetwork}
                  onChange={(e) => setIsOutOfNetwork(e.target.checked)}
                  className="rounded text-purple-600 accent-purple-600 w-3 h-3"
                />
                Out-Of-Network?
              </label>
            </div>
          </div>
        </div>

        {/* Calculated split Results column */}
        <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between border border-slate-800 shadow-lg">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block mb-3">Simulated Bill Breakdown</span>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Total Invoice Charge:</span>
                <span className="font-mono text-lg font-bold">${billCost}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> You Pay (Out-of-Pocket):
                </span>
                <span className="font-mono text-lg font-bold text-rose-300">${youPay}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Insurance Pays:
                </span>
                <span className="font-mono text-lg font-bold text-emerald-300">${insurancePays}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-sans leading-relaxed">
            {calcExplanation}
          </div>
        </div>
      </div>

      {/* Out-Of-Network Warnings */}
      {isOutOfNetwork && (
        <div className="flex gap-2.5 bg-red-50 border border-red-150 p-4 rounded-xl text-red-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Understanding Out-Of-Network Hazards</span>
            Even if your plan has a $200 deductible, if a provider is 'out-of-network' and has no negotiated contract with your insurance insurer, they will pass 100% of the raw, non-discounted costs directly to you. This is how the majority of surprise emergency department debt happens!
          </div>
        </div>
      )}
    </div>
  );
}

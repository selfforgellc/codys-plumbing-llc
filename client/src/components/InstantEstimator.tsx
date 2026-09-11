import React, { useState } from "react";
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { COMPANY } from "@/const";

interface EstimatorProps {
  onOpenBookingWithService: (serviceName: string, estimate: string) => void;
}

export default function InstantEstimator({ onOpenBookingWithService }: EstimatorProps) {
  const [propertyType, setPropertyType] = useState<"residential" | "commercial">("residential");
  const [serviceCategory, setServiceCategory] = useState<string>("water-heater");
  const [urgency, setUrgency] = useState<"standard" | "emergency">("standard");
  const [addons, setAddons] = useState<string[]>([]);

  // Base pricing logic
  const calculateEstimate = () => {
    let min = 150;
    let max = 350;
    let title = "General Plumbing Diagnostic";

    if (serviceCategory === "water-heater") {
      title = "Water Heater Replacement or Repair";
      min = propertyType === "residential" ? 280 : 550;
      max = propertyType === "residential" ? 1850 : 3800;
    } else if (serviceCategory === "filtration") {
      title = "Water Softener & Reverse Osmosis System";
      min = propertyType === "residential" ? 550 : 1200;
      max = propertyType === "residential" ? 2200 : 4900;
    } else if (serviceCategory === "drain-camera") {
      title = "Drain Clearing & HD Video Pipe Inspection";
      min = 99;
      max = 380;
    } else if (serviceCategory === "pipe-burst") {
      title = "Emergency Burst Pipe / Mainline Repair";
      min = propertyType === "residential" ? 350 : 650;
      max = propertyType === "residential" ? 1200 : 2800;
    } else if (serviceCategory === "backflow") {
      title = "Commercial Backflow Preventer Test & Certification";
      min = 195;
      max = 550;
    }

    if (urgency === "emergency") {
      min += 75;
      max += 120;
    }

    if (addons.includes("camera")) {
      min += 95;
      max += 150;
    }
    if (addons.includes("flush")) {
      min += 110;
      max += 160;
    }

    return { min, max, title };
  };

  const toggleAddon = (id: string) => {
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const estimate = calculateEstimate();
  const estimateString = `$${estimate.min} – $${estimate.max}`;

  return (
    <section id="estimator" className="py-20 relative overflow-hidden bg-slate-900/90 border-y border-cyan-500/20">
      {/* Background glow and subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00d2ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-cyan-950">
            <Calculator className="w-4 h-4" />
            <span>Interactive Transparency Tool</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight font-heading mb-4">
            Instant Plumbing <span className="text-cyan-400">Estimate Calculator</span>
          </h2>
          <p className="text-slate-300 text-base md:text-lg">
            Use this quick budgeting tool to plan for common plumbing work in Kingman, Lake Havasu, and Mohave County.
            It is not an exact quote—your local Cody's plumber will confirm the final price after seeing the job.
          </p>
        </div>

        {/* Calculator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-slate-950/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
            {/* Step 1: Property Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Property Classification
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyType("residential")}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    propertyType === "residential"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>🏡 Residential Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType("commercial")}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    propertyType === "commercial"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>🏢 Commercial / Industrial</span>
                </button>
              </div>
            </div>

            {/* Step 2: Service Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Select Scope of Service Needed
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "water-heater", label: "Water Heater (Tank / Tankless)" },
                  { id: "filtration", label: "Water Softener & Filtration" },
                  { id: "drain-camera", label: "Clogged Drain & Video Pipe Snaking" },
                  { id: "pipe-burst", label: "Burst Pipe / Leak Detection" },
                  { id: "backflow", label: "Commercial Backflow Testing" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setServiceCategory(item.id)}
                    className={`py-2.5 px-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                      serviceCategory === item.id
                        ? "bg-cyan-950 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Urgency Timing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Dispatch Timeframe
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency("standard")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    urgency === "standard"
                      ? "bg-blue-950/60 border-blue-400 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold text-blue-300">Standard Scheduled Visit</div>
                  <div className="text-[11px] text-slate-400">Next available window or booked day</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency("emergency")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    urgency === "emergency"
                      ? "bg-red-950/60 border-red-400 text-white shadow-lg shadow-red-950"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    <span>24/7 Immediate Emergency</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Immediate truck dispatch (30-60m)</div>
                </button>
              </div>
            </div>

            {/* Step 4: Optional Enhancements */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                4. Optional Diagnostic Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.includes("camera")}
                    onChange={() => toggleAddon("camera")}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200">Include HD Sewer Camera Line Video Inspection</span>
                    <span className="text-slate-400 block text-[11px]">Pinpoints exact root intrusion and cracked pipe depth (+~$95)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.includes("flush")}
                    onChange={() => toggleAddon("flush")}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-200">Deep Hard-Water Descaling Chemical Flush</span>
                    <span className="text-slate-400 block text-[11px]">Removes heavy calcium & lime scale built up in Mohave County lines (+~$110)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 rounded-2xl border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget Planning Range</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ROC #{COMPANY.rocPrimary} Guaranteed
                </span>
              </div>

              <div className="text-center py-4 bg-slate-950/70 rounded-xl border border-cyan-500/20 mb-6 shadow-inner">
                <div className="text-xs text-cyan-300 font-bold uppercase tracking-wide mb-1">
                  Budgeting Tool Range
                </div>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tight font-heading">
                  {estimateString}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Planning range for: <span className="text-slate-200 font-semibold">{estimate.title}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Licensed master technicians, fully stocked diagnostic trucks</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Your local plumber confirms the exact quote before work starts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>100% parts & labor warranty backed by AZ Registrar of Contractors</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => onOpenBookingWithService(estimate.title, estimateString)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Use This Budget & Book a Visit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-400">For an exact quote, speak with our local dispatch team: </span>
                <a href={`tel:${COMPANY.phoneRaw}`} className="text-cyan-400 font-bold text-xs hover:underline">
                  {COMPANY.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { COMPANY } from "@/const";
import { ShieldCheck, ExternalLink, Award, FileText, CheckCircle2 } from "lucide-react";

export default function RocVerificationSection() {
  return (
    <section id="licensing" className="py-16 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800">
      <div className="container">
        <div className="max-w-4xl mx-auto bg-slate-950 rounded-2xl border-2 border-cyan-500/30 p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Cyan glow corner accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Left Badge Emblem */}
            <div className="shrink-0 text-center">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-700 via-cyan-500 to-sky-300 p-1 shadow-xl shadow-cyan-500/20">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-2 text-center">
                    <ShieldCheck className="w-8 h-8 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AZ ROC</span>
                    <span className="text-base font-black text-white font-heading">#{COMPANY.rocPrimary}</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                    Active & Bonded
                  </span>
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Official Arizona Registrar of Contractors Compliance</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white font-heading">
                Fully Licensed, Bonded & Insured: <span className="text-cyan-400">ROC #{COMPANY.rocPrimary}</span>
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                Hiring an unlicensed contractor risks invalidating property insurance claims, failing municipal code inspections,
                and paying twice for shoddy repairs. Cody’s Plumbing, LLC holds clean, active ROC licensing for commercial and
                residential plumbing across Kingman, Lake Havasu City, and all of Mohave County.
              </p>

              {/* License Specs Table / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Primary License</div>
                  <div className="text-cyan-300 font-extrabold text-sm">ROC #{COMPANY.rocPrimary}</div>
                  <div className="text-emerald-400 text-[10px] font-semibold">Active thru May 31, 2028</div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Secondary / Equipment</div>
                  <div className="text-cyan-300 font-extrabold text-sm">ROC #{COMPANY.rocSecondary}</div>
                  <div className="text-slate-400 text-[10px]">Water Treatment & Systems</div>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Bond & Insurance</div>
                  <div className="text-cyan-300 font-extrabold text-sm">$2M Commercial Policy</div>
                  <div className="text-slate-400 text-[10px]">Complete Liability Coverage</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold">
                <a
                  href={COMPANY.rocVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Verify Contractor License on Public Registry</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  No Complaints on File
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

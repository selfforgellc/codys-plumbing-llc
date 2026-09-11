import React, { useState, useEffect } from "react";
import { COMPANY } from "@/const";
import { Phone, ShieldCheck, Clock, Menu, X, ArrowRight, Wrench } from "lucide-react";

interface NavbarProps {
  onOpenBooking: (serviceName?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Emergency Announcement Ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-sky-600 to-blue-700 text-white text-xs font-semibold py-1.5 px-4 shadow-md sticky top-0 z-50">
        <div className="container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
            <span className="uppercase tracking-wider font-extrabold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 inline" /> 24/7 Emergency Service Active
            </span>
            <span className="hidden md:inline text-sky-200">|</span>
            <span className="hidden md:inline text-sky-100 font-normal">
              Serving Kingman, Lake Havasu City, Bullhead City & Tri-State Mohave
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur px-2 py-0.5 rounded border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>AZ ROC #{COMPANY.rocPrimary}</span>
            </div>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="text-white hover:text-cyan-200 transition-colors flex items-center gap-1.5 underline underline-offset-2"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Direct: {COMPANY.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Glass Navigation Header */}
      <header
        className={`sticky top-[31px] z-40 transition-all duration-300 border-b ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-md border-cyan-500/20 shadow-2xl shadow-cyan-950/40 py-2.5"
            : "bg-slate-950/80 backdrop-blur-sm border-slate-800 py-3.5"
        }`}
      >
        <div className="container flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none">
            <img
              src={COMPANY.logoUrl}
              alt="Cody's Plumbing, LLC"
              className="h-12 md:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,210,255,0.4)] transition-transform group-hover:scale-105 duration-200"
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black italic tracking-tight uppercase text-white font-heading">
                  Cody's <span className="text-cyan-400">Plumbing</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  LLC
                </span>
              </div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <span className="text-cyan-300">Commercial</span> • <span>Residential</span>
                <span className="text-emerald-400 font-bold">• ROC #{COMPANY.rocPrimary}</span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-300">
            <a href="#services" className="hover:text-cyan-400 transition-colors">
              Services
            </a>
            <a href="#licensing" className="hover:text-cyan-400 transition-colors">
              ROC License
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-white transition-all text-xs font-bold shadow-inner"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">24/7 Dispatch line</div>
                <div className="text-sm text-cyan-300 font-extrabold">{COMPANY.phone}</div>
              </div>
            </a>

            <button
              onClick={() => onOpenBooking()}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wrench className="w-4 h-4 text-slate-950 group-hover:rotate-45 transition-transform" />
              <span>Book Plumber</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/98 border-t border-slate-800 px-4 py-5 mt-3 space-y-4 shadow-2xl">
            <div className="p-3 bg-gradient-to-r from-blue-950/60 to-cyan-950/60 rounded-xl border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Need Immediate Help?</div>
                <div className="text-base font-extrabold text-cyan-300">{COMPANY.phone}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">AZ ROC #{COMPANY.rocPrimary} • Verified Active</div>
              </div>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Phone className="w-3.5 h-3.5 fill-current" /> Call
              </a>
            </div>

            <nav className="flex flex-col space-y-3 font-semibold text-slate-200">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-cyan-400"
              >
                Plumbing Services
              </a>
              <a
                href="#licensing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-cyan-400"
              >
                ROC License Verification
              </a>
            </nav>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Wrench className="w-4 h-4" /> Schedule Service / Get Quote
            </button>
          </div>
        )}
      </header>
    </>
  );
}

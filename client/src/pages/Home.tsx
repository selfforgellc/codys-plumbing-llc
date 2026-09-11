import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import InstantEstimator from "@/components/InstantEstimator";
import { COMPANY, SERVICES } from "@/const";
import { Phone, Wrench, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [service, setService] = useState("General Plumbing Service");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar onOpenBooking={() => setBookingOpen(true)} />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-cyan-500/20">
          <div className="absolute inset-0 opacity-25">
            <img src={COMPANY.images.hero} alt="Plumbing service" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
          </div>
          <div className="container relative z-10 py-16 md:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Emergency Service · ROC #{COMPANY.rocPrimary}
                </div>
                <h1 className="mt-5 text-5xl font-black leading-tight font-heading md:text-7xl">
                  Plumbing done right.<br />
                  <span className="text-cyan-400">When you need it.</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-slate-300">
                  Your local commercial and residential plumbing team for Kingman, Lake Havasu City, Bullhead City, and Mohave County.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-xl bg-red-600 px-5 py-3.5 text-center font-black hover:bg-red-500">
                    <Phone className="mr-2 inline h-4 w-4 fill-current" />Call {COMPANY.phone}
                  </a>
                  <button onClick={() => setBookingOpen(true)} className="rounded-xl bg-cyan-500 px-5 py-3.5 font-black text-slate-950 hover:bg-cyan-400">
                    <Wrench className="mr-2 inline h-4 w-4" />Schedule Service <ArrowRight className="ml-1 inline h-4 w-4" />
                  </button>
                </div>
                <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
                  <span><Clock className="mr-1 inline h-4 w-4 text-cyan-400" />24/7 Local Dispatch</span>
                  <span><ShieldCheck className="mr-1 inline h-4 w-4 text-cyan-400" />Licensed & Bonded</span>
                  <span><CheckCircle2 className="mr-1 inline h-4 w-4 text-cyan-400" />Clear Quotes</span>
                </div>
              </div>
              <div className="mx-auto max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-2xl">
                <img src={COMPANY.logoUrl} alt="Cody's Plumbing LLC" className="w-full" />
                <div className="mt-5 border-t border-slate-800 pt-4 text-center text-sm text-slate-300">
                  Local help with water heaters · drain cleaning · leak repair · filtration · commercial plumbing
                  <a href={`tel:${COMPANY.phoneRaw}`} className="mt-4 block rounded-lg border border-cyan-400/40 bg-cyan-500/10 p-3 font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950">
                    Call your local plumber: {COMPANY.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container py-16">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Our services</p>
            <h2 className="mt-2 text-3xl font-black font-heading">Plumbing for homes and businesses</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{item.badge}</p>
                  <h3 className="mt-1 text-lg font-black font-heading">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.shortDesc}</p>
                  <button onClick={() => { setService(item.title); setBookingOpen(true); }} className="mt-4 text-xs font-bold text-cyan-300 hover:text-white">
                    Request service <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Budgeting Tool Section (Instant Estimator Component) */}
        <section id="budgeting" className="container py-12">
          <InstantEstimator />
        </section>

        {/* Licensing Section */}
        <section id="licensing" className="border-y border-cyan-500/20 bg-slate-900/70 py-12">
          <div className="container flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Local, licensed & trusted</p>
              <h2 className="mt-2 text-2xl font-black font-heading">Built for Mohave County</h2>
              <p className="mt-1 text-sm text-slate-400">AZ ROC #{COMPANY.rocPrimary} · Commercial & residential plumbing · ROC #{COMPANY.rocSecondary} water systems</p>
            </div>
            <button onClick={() => setBookingOpen(true)} className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-400">
              Request a local quote
            </button>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-14 text-center">
          <div className="container">
            <h2 className="text-3xl font-black font-heading">Need a local plumber today?</h2>
            <p className="mt-2 text-sm text-slate-400">Call Cody's Plumbing or book online. Friendly local help across Mohave County.</p>
            <div className="mt-5 flex justify-center gap-3">
              <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-lg bg-red-600 px-5 py-3 font-black hover:bg-red-500">
                <Phone className="mr-2 inline h-4 w-4 fill-current" />{COMPANY.phone}
              </a>
              <button onClick={() => setBookingOpen(true)} className="rounded-lg bg-cyan-500 px-5 py-3 font-black text-slate-950 hover:bg-cyan-400">
                Book online
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Cody's Plumbing, LLC · {COMPANY.address} · AZ ROC #{COMPANY.rocPrimary}
      </footer>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} initialService={service} />
    </div>
  );
}
import { trackConversion } from "@/lib/conversions";
import React, { useEffect, useState } from "react";
import { recordWebsiteVisit } from "@/lib/websiteVisit";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import { COMPANY, SERVICES } from "@/const";
import { Phone, Wrench, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [service, setService] = useState("General Plumbing Service");

  useEffect(() => {
    const selected = SERVICES.find((item) => item.id === new URLSearchParams(window.location.search).get("service"));
    if (selected) {
      setService(selected.title);
      openBooking();
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleVisit() {
      clearTimeout(timer);
      if (document.visibilityState === "visible") timer = setTimeout(recordWebsiteVisit, 1500);
    }

    scheduleVisit();
    document.addEventListener("visibilitychange", scheduleVisit);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", scheduleVisit);
    };
  }, []);

  const openBooking = () => { trackConversion("booking_open"); setBookingOpen(true); };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar onOpenBooking={() => openBooking()} />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-cyan-500/20">
          <div className="absolute inset-0 opacity-25">
            <img src={COMPANY.images.hero} alt="Plumbing service" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
          </div>
          <div className="container relative z-10 mx-auto px-5 py-9 sm:px-6 md:py-16 lg:py-24">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Emergency Service Available · ROC #{COMPANY.rocPrimary}
                </div>
                <h1 className="mt-4 text-[clamp(1.9rem,8.5vw,2.5rem)] font-black leading-[1.12] font-heading sm:text-5xl md:text-7xl">
                  Plumbing done right.<br />
                  <span className="text-cyan-400">When you need it.</span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
                  Local plumbers in Kingman, Arizona, serving homes and businesses in Lake Havasu City, Bullhead City, and across Mohave County.
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row md:mt-7 md:gap-3">
                  <a href={`tel:${COMPANY.phoneRaw}`} onClick={() => trackConversion("phone_click")} className="rounded-xl bg-red-600 px-5 py-3 text-center font-black md:py-3.5 hover:bg-red-500">
                    <Phone className="mr-2 inline h-4 w-4 fill-current" />Call {COMPANY.phone}
                  </a>
                  <button onClick={() => openBooking()} className="rounded-xl bg-cyan-500 px-5 py-3 font-black text-slate-950 md:py-3.5 hover:bg-cyan-400">
                    <Wrench className="mr-2 inline h-4 w-4" />Schedule Service <ArrowRight className="ml-1 inline h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-300 md:mt-7 md:gap-4">
                  <span><Clock className="mr-1 inline h-4 w-4 text-cyan-400" />After-Hours Emergencies</span>
                  <span><ShieldCheck className="mr-1 inline h-4 w-4 text-cyan-400" />Licensed & Bonded</span>
                  <span><CheckCircle2 className="mr-1 inline h-4 w-4 text-cyan-400" />Clear Quotes</span>
                </div>
              </div>
              <div className="hidden mx-auto max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-2xl lg:block">
                <img src={COMPANY.logoUrl} alt="Cody's Plumbing LLC" loading="lazy" decoding="async" className="w-full" />
                <div className="mt-5 border-t border-slate-800 pt-4 text-center text-sm text-slate-300">
                  Local help with water heaters · drain cleaning · leak repair · filtration · commercial plumbing
                  <a href={`tel:${COMPANY.phoneRaw}`} onClick={() => trackConversion("phone_click")} className="mt-4 block rounded-lg border border-cyan-400/40 bg-cyan-500/10 p-3 font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950">
                    Call your local plumber: {COMPANY.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container mx-auto scroll-mt-36 px-5 py-12 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Our services</p>
            <h2 className="mt-2 text-3xl font-black font-heading">Plumbing for homes and businesses</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <img src={item.image} alt={`${item.title} in Mohave County, Arizona`} loading="lazy" decoding="async" className={`w-full object-cover ${item.id === "water-heaters" ? "h-56 object-top" : "h-40"}`} />
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{item.badge}</p>
                  <h3 className="mt-1 text-lg font-black font-heading">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.shortDesc}</p>
                  <a href={`/services/${item.id}.html`} className="mt-3 block w-fit text-sm font-semibold text-cyan-300 hover:underline">Learn more about {item.title}</a>
                  <button onClick={() => { setService(item.title); openBooking(); }} className="mt-4 text-xs font-bold text-cyan-300 hover:text-white">
                    Request service <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="service-areas" className="container mx-auto px-5 py-8 sm:px-6">
          <h2 className="text-2xl font-black font-heading">Local plumbing across Mohave County</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">Based in Kingman, Cody's Plumbing serves residential and commercial customers in Lake Havasu City, Bullhead City, Fort Mohave, Golden Valley and surrounding communities. Call to confirm availability at your property.</p>
          <a href="/service-area.html" className="mt-4 inline-block font-semibold text-cyan-300 hover:underline">Explore our service area</a>
        </section>

        {/* Licensing Section */}
        <section id="licensing" className="border-y border-cyan-500/20 bg-slate-900/70 py-12">
          <div className="container flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Local, licensed & trusted</p>
              <h2 className="mt-2 text-2xl font-black font-heading">Built for Mohave County</h2>
              <p className="mt-1 text-sm text-slate-400">AZ ROC #{COMPANY.rocPrimary} · Commercial & residential plumbing</p>
            </div>
            <button onClick={() => openBooking()} className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-400">
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
              <a href={`tel:${COMPANY.phoneRaw}`} onClick={() => trackConversion("phone_click")} className="rounded-lg bg-red-600 px-5 py-3 font-black hover:bg-red-500">
                <Phone className="mr-2 inline h-4 w-4 fill-current" />{COMPANY.phone}
              </a>
              <button onClick={() => openBooking()} className="rounded-lg bg-cyan-500 px-5 py-3 font-black text-slate-950 hover:bg-cyan-400">
                Book online
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Cody's Plumbing, LLC · {COMPANY.address} · AZ ROC #{COMPANY.rocPrimary}
        <a href="/admin" className="mx-auto mt-2 block w-fit rounded px-2 py-1 font-semibold text-slate-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400">
          Dispatch sign-in
        </a>
      </footer>

      {/* Mobile conversion bar: visible on small screens without covering page content. */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-500/30 bg-slate-950/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md md:hidden" role="region" aria-label="Quick plumbing contact options">
        <div className="mx-auto flex max-w-lg gap-2">
          <a href={`tel:${COMPANY.phoneRaw}`} onClick={() => trackConversion("phone_click")} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-extrabold text-white hover:bg-red-500" aria-label={`Call Cody's Plumbing at ${COMPANY.phone}`}>
            <Phone className="h-5 w-5" aria-hidden="true" /> Call Cody
          </a>
          <button type="button" onClick={() => openBooking()} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 text-sm font-extrabold text-slate-950 hover:bg-cyan-300">
            <Wrench className="h-5 w-5" aria-hidden="true" /> Request Service
          </button>
        </div>
      </div>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} initialService={service} />
    </div>
  );
}

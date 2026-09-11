import React, { useState } from "react";
import { X, Phone, Calendar, Clock, Wrench, ShieldCheck, CheckCircle2, Send, MapPin } from "lucide-react";
import { COMPANY } from "@/const";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialEstimate?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialService = "24/7 Emergency / General Plumbing",
  initialEstimate = ""
}: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kingman");
  const [service, setService] = useState(initialService);
  const [urgency, setUrgency] = useState("Urgent (Within 1-2 Hours)");
  const [details, setDetails] = useState(initialEstimate ? `Estimated range requested: ${initialEstimate}` : "");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please provide your name and contact phone number");
      return;
    }

    const message = [
      "Cody's Plumbing dispatch request",
      `Name: ${name}`,
      `Callback: ${phone}`,
      `City: ${city}`,
      `Urgency: ${urgency}`,
      `Service: ${service}`,
      address ? `Address/Cross streets: ${address}` : "",
      details ? `Details: ${details}` : "",
      email ? `Email: ${email}` : "",
    ].filter(Boolean).join("\n");

    // A static site cannot send SMS by itself. This opens the visitor's
    // messaging app with the complete request addressed to Cody's number.
    window.location.href = `sms:${COMPANY.phoneRaw}?body=${encodeURIComponent(message)}`;
    setSubmitted(true);
    toast.success("Your text message app is opening with the dispatch request.");
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-100 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Fast Dispatch & Scheduling</span>
              </div>
              <h3 className="text-2xl font-black text-white font-heading">
                Book a Plumber or <span className="text-cyan-400">Request Quote</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Serving Kingman, Lake Havasu City, Bullhead City & Mohave County. Licensed AZ ROC #{COMPANY.rocPrimary}.
              </p>
            </div>

            {/* Emergency Hotline callout */}
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl mb-6 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-extrabold text-red-300 block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  Have an active water leak or flooded room right now?
                </span>
                <span className="text-slate-300 text-[11px]">Don't wait for form response. Call dispatch directly!</span>
              </div>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow"
              >
                <Phone className="w-3.5 h-3.5 fill-current" /> Call Now
              </a>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. (928) 555-0192"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Service Area / City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Kingman">Kingman, AZ</option>
                    <option value="Lake Havasu City">Lake Havasu City, AZ</option>
                    <option value="Bullhead City">Bullhead City, AZ</option>
                    <option value="Fort Mohave">Fort Mohave, AZ</option>
                    <option value="Golden Valley">Golden Valley, AZ</option>
                    <option value="Other Mohave County">Other Mohave County Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Emergency (Immediate Dispatch)">🚨 Emergency (Immediate Dispatch)</option>
                    <option value="Same Day Service">Today (Same Day Window)</option>
                    <option value="Scheduled Maintenance / Quote">This Week (Scheduled Appointment)</option>
                    <option value="Commercial Bid Request">Commercial Bid / Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Street Address or Cross Streets
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Stockton Hill Rd, Kingman"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Plumbing Service Requested
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Describe Symptoms or Problem
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us what's happening (e.g. water heater is leaking from the base, toilet is backing up into tub, water tastes like sulfur...)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg p-3 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Text Dispatch Request to Cody's</span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> AZ ROC #{COMPANY.rocPrimary}
                </span>
                <span>•</span>
                <span>No obligation upfront estimate</span>
                <span>•</span>
                <span>Strict privacy guaranteed</span>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-white font-heading">
              Dispatch Text Ready!
            </h4>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Thank you, <span className="font-bold text-white">{name}</span>. Your request was prepared as a text message
              to Cody's Plumbing dispatch in <span className="font-bold text-cyan-400">{city}</span>.
            </p>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-left max-w-sm mx-auto text-xs space-y-1.5">
              <div><span className="text-slate-400">Service:</span> <span className="text-white font-semibold">{service}</span></div>
              <div><span className="text-slate-400">Callback Phone:</span> <span className="text-white font-semibold">{phone}</span></div>
              <div><span className="text-slate-400">Priority:</span> <span className="text-cyan-300 font-semibold">{urgency}</span></div>
              <div><span className="text-slate-400">License:</span> <span className="text-emerald-400 font-semibold">AZ ROC #{COMPANY.rocPrimary}</span></div>
            </div>
            <p className="text-xs text-slate-400">
              If your messaging app did not open, call or text dispatch directly at:{" "}
              <a href={`tel:${COMPANY.phoneRaw}`} className="text-cyan-400 font-bold underline">
                {COMPANY.phone}
              </a>
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

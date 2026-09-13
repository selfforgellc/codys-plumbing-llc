import React, { useEffect, useState } from "react";
import { X, Phone, Wrench, ShieldCheck, CheckCircle2, Send, MapPin, Loader2 } from "lucide-react";
import { COMPANY } from "@/const";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialEstimate?: string;
}

type FormState = {
  name: string; phone: string; address: string; city: string; service_type: string;
  description: string; is_emergency: string; preferred_time: string;
};

const emptyForm: FormState = {
  name: "", phone: "", address: "", city: "Kingman", service_type: "24/7 Emergency / General Plumbing",
  description: "", is_emergency: "no", preferred_time: "As soon as possible",
};

export default function BookingModal({ isOpen, onClose, initialService = "24/7 Emergency / General Plumbing", initialEstimate = "" }: BookingModalProps) {
  const [form, setForm] = useState<FormState>({ ...emptyForm, service_type: initialService, description: initialEstimate ? `Budgeting range requested: ${initialEstimate}` : "" });
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ ...emptyForm, service_type: initialService, description: initialEstimate ? `Budgeting range requested: ${initialEstimate}` : "" });
  }, [isOpen, initialService, initialEstimate]);

  if (!isOpen) return null;
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_emergency: form.is_emergency === "yes" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send request");
      setRequestId(payload.request.id);
      setSubmitted(true);
      toast.success("Service request sent to Cody's Plumbing.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to send request. Please call dispatch.");
    } finally { setSending(false); }
  };

  const close = () => { setSubmitted(false); setRequestId(""); onClose(); };
  const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400";
  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400";

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
    <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border-2 border-cyan-500/40 bg-slate-950 p-6 text-slate-100 shadow-2xl md:p-8">
      <button onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
      {!submitted ? <>
        <div className="mb-6"><div className="mb-2 inline-flex items-center gap-1.5 rounded border border-cyan-500/30 bg-cyan-950 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300"><Wrench className="h-3.5 w-3.5" />Real Service Request</div><h3 className="font-heading text-2xl font-black text-white">Request a <span className="text-cyan-400">Plumber</span></h3><p className="mt-1 text-xs text-slate-400">Your request is saved securely and sent to Cody's Plumbing dispatch. Licensed AZ ROC #{COMPANY.rocPrimary}.</p></div>
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/40 p-3"><div className="text-xs"><span className="flex items-center gap-1 font-extrabold text-red-300"><span className="h-2 w-2 animate-ping rounded-full bg-red-400" />Active leak or flooding?</span><span className="text-[11px] text-slate-300">Call dispatch for immediate help.</span></div><a href={`tel:${COMPANY.phoneRaw}`} className="flex shrink-0 items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5 fill-current" />Call</a></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Full name *</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="John Miller" /></div><div><label className={labelClass}>Phone *</label><input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="(928) 555-0192" /></div></div>
          <div><label className={labelClass}>Street address *</label><div className="relative"><MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input required value={form.address} onChange={(e) => update("address", e.target.value)} className={`${inputClass} pl-9`} placeholder="123 Stockton Hill Rd, Kingman" /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>City *</label><select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass}><option>Kingman</option><option>Lake Havasu City</option><option>Bullhead City</option><option>Fort Mohave</option><option>Golden Valley</option><option>Other Mohave County</option></select></div><div><label className={labelClass}>Preferred time *</label><select required value={form.preferred_time} onChange={(e) => update("preferred_time", e.target.value)} className={inputClass}><option>As soon as possible</option><option>Today — morning</option><option>Today — afternoon</option><option>Today — evening</option><option>Tomorrow</option><option>This week</option><option>Call me to coordinate</option></select></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Service type *</label><input required value={form.service_type} onChange={(e) => update("service_type", e.target.value)} className={inputClass} /></div><div><label className={labelClass}>Emergency?</label><select value={form.is_emergency} onChange={(e) => update("is_emergency", e.target.value)} className={inputClass}><option value="no">No — regular service</option><option value="yes">Yes — emergency</option></select></div></div>
          <div><label className={labelClass}>Describe the problem *</label><textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} p-3`} placeholder="Tell us what is happening..." /></div>
          <button disabled={sending} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3.5 text-sm font-black tracking-wide text-slate-950 shadow-xl shadow-cyan-500/25 disabled:cursor-wait disabled:opacity-60">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span>{sending ? "Sending request..." : "Send Service Request"}</span></button>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400"><span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />AZ ROC #{COMPANY.rocPrimary}</span><span>•</span><span>Secure request</span></div>
        </form>
      </> : <div className="space-y-4 py-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-8 w-8" /></div><h4 className="font-heading text-2xl font-black text-white">Request received!</h4><p className="mx-auto max-w-md text-sm text-slate-300">Thanks, <b className="text-white">{form.name}</b>. Cody's Plumbing has your service request and will contact you at <b className="text-cyan-300">{form.phone}</b>.</p><div className="mx-auto max-w-sm rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-left text-xs"><div><span className="text-slate-400">Request ID:</span> <span className="font-semibold text-white">{requestId.slice(0, 8)}</span></div><div><span className="text-slate-400">Service:</span> <span className="font-semibold text-white">{form.service_type}</span></div><div><span className="text-slate-400">Preferred time:</span> <span className="font-semibold text-cyan-300">{form.preferred_time}</span></div></div><p className="text-xs text-slate-400">For immediate emergencies, call <a href={`tel:${COMPANY.phoneRaw}`} className="font-bold text-cyan-400 underline">{COMPANY.phone}</a>.</p><button onClick={close} className="rounded-lg bg-slate-800 px-6 py-2 text-xs font-bold text-white hover:bg-slate-700">Done</button></div>}
    </div>
  </div>;
}

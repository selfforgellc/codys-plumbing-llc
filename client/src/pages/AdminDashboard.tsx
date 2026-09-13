import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Copy, ExternalLink, LogOut, MapPin, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Status = "New" | "Contacted" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type Request = { id: string; created_at: string; name: string; phone: string; address: string; city: string; service_type: string; description: string; is_emergency: boolean; preferred_time: string; status: Status };
const statuses: Status[] = ["New", "Contacted", "Scheduled", "In Progress", "Completed", "Cancelled"];

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState("unknown");
  const focusId = new URLSearchParams(window.location.search).get("request");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/requests");
    if (response.status === 401) { setAuthed(false); setLoading(false); return; }
    const payload = await response.json();
    if (!response.ok) toast.error(payload.error || "Unable to load requests"); else { setAuthed(true); setRequests(payload.requests || []); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoginLoading(true);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) toast.error("Invalid admin password"); else { setPassword(""); setAuthed(true); await load(); }
    setLoginLoading(false);
  };

  const updateStatus = async (id: string, status: Status) => {
    const response = await fetch(`/api/requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) return toast.error("Unable to update status");
    setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    toast.success(`Marked ${status}`);
  };

  const enableNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Use Chrome on Android for push notifications.");
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      const configResponse = await fetch("/api/push/config");
      const { publicKey, error } = await configResponse.json();
      if (!configResponse.ok) throw new Error(error || "Push notifications are not configured.");
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const saveResponse = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
      if (!saveResponse.ok) throw new Error("Could not save this device.");
      setNotifications("enabled"); toast.success("Push notifications enabled on this device.");
    } catch (error: any) { setNotifications("error"); toast.error(error?.message || "Unable to enable notifications"); }
  };

  const counts = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status]: requests.filter((request) => request.status === status).length }), {} as Record<Status, number>), [requests]);

  if (!authed) return <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100"><div className="mx-auto max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900 p-8 shadow-2xl"><ShieldCheck className="h-10 w-10 text-cyan-400" /><h1 className="mt-4 text-3xl font-black font-heading">Cody's Dispatch</h1><p className="mt-2 text-sm text-slate-400">Protected admin dashboard</p><form onSubmit={login} className="mt-6 space-y-4"><input autoFocus required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-cyan-400 focus:outline-none" /><button disabled={loginLoading} className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-black text-slate-950 disabled:opacity-60">{loginLoading ? "Signing in..." : "Open dashboard"}</button></form><a href="/" className="mt-5 block text-center text-xs text-cyan-300">Back to website</a></div></main>;

  return <main className="min-h-screen bg-slate-950 text-slate-100"><header className="border-b border-slate-800 bg-slate-900/90"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Cody's Plumbing</p><h1 className="text-2xl font-black font-heading">Dispatch dashboard</h1></div><div className="flex gap-2"><button onClick={enableNotifications} className="flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10"><Bell className="h-4 w-4" />{notifications === "enabled" ? "Notifications on" : "Enable notifications"}</button><button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"><LogOut className="h-4 w-4" />Sign out</button></div></div></header><div className="mx-auto max-w-7xl px-4 py-8"><div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">{statuses.map((status) => <div key={status} className="rounded-xl border border-slate-800 bg-slate-900 p-3"><div className="text-xs text-slate-400">{status}</div><div className="mt-1 text-2xl font-black">{counts[status]}</div></div>)}</div><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black font-heading">Service requests</h2><p className="text-sm text-slate-400">{requests.length} total request{requests.length === 1 ? "" : "s"}</p></div><button onClick={load} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold hover:bg-slate-800"><RefreshCw className="h-4 w-4" />Refresh</button></div>{loading ? <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Loading requests...</div> : requests.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-400">No service requests yet.</div> : <div className="space-y-4">{requests.map((request) => <article id={request.id} key={request.id} className={`rounded-2xl border bg-slate-900 p-5 ${request.id === focusId ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-slate-800"}`}><div className="flex flex-col justify-between gap-4 lg:flex-row"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${request.is_emergency ? "bg-red-500/20 text-red-300" : "bg-cyan-500/10 text-cyan-300"}`}>{request.is_emergency ? "Emergency" : "Standard"}</span><span className="text-xs text-slate-500">{new Date(request.created_at).toLocaleString()}</span></div><h3 className="mt-2 text-xl font-black">{request.name}</h3><p className="mt-1 text-sm text-cyan-300">{request.service_type}</p></div><select value={request.status} onChange={(e) => updateStatus(request.id, e.target.value as Status)} className="h-fit rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div className="mt-4 grid gap-4 border-t border-slate-800 pt-4 text-sm md:grid-cols-2"><div className="space-y-2"><div><span className="text-slate-500">Phone:</span> <a className="font-bold text-cyan-300" href={`tel:${request.phone}`}>{request.phone}</a></div><div><span className="text-slate-500">Address:</span> {request.address}, {request.city}</div><div><span className="text-slate-500">Preferred:</span> {request.preferred_time}</div></div><div><span className="text-slate-500">Description:</span><p className="mt-1 whitespace-pre-wrap text-slate-300">{request.description}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><a href={`tel:${request.phone}`} className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950"><Phone className="h-3.5 w-3.5" />Call customer</a><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${request.address}, ${request.city}, AZ`)}`} className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"><MapPin className="h-3.5 w-3.5" />Open address <ExternalLink className="h-3 w-3" /></a><button onClick={() => { navigator.clipboard?.writeText(`${request.address}, ${request.city}, AZ`); toast.success("Address copied"); }} className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200"><Copy className="h-3.5 w-3.5" />Copy address</button></div></article>)}</div>}</div></main>;
}

function urlBase64ToUint8Array(value: string) { const padding = "=".repeat((4 - value.length % 4) % 4); const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)); }

import { useEffect, useState } from "react";

export default function WebsiteVisits() {
  const [stats, setStats] = useState<{ today: number; week: number }>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch("/api/visits", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load visits");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setStats(data);
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    void refresh();
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <section aria-label="Website traffic" className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-bold">Website visits</h2>
      {failed ? (
        <p className="mt-2 text-sm text-slate-400">Visit totals are temporarily unavailable.</p>
      ) : stats ? (
        <dl className="mt-3 grid max-w-sm grid-cols-2 gap-4">
          <div><dt className="text-sm text-slate-400">Today</dt><dd className="text-2xl font-black">{stats.today}</dd></div>
          <div><dt className="text-sm text-slate-400">Last 7 days</dt><dd className="text-2xl font-black">{stats.week}</dd></div>
        </dl>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Loading visit totals…</p>
      )}
    </section>
  );
}

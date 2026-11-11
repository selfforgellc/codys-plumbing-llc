import { useState } from "react";

export type AccountAction = "setup" | "recover" | "change";

const titles = { setup: "Set up your account", recover: "Reset your password", change: "Change your password" };
const inputClass = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-cyan-400 focus:outline-none";

export function DispatchAccountForm({ action, onCancel, onComplete }: {
  action: AccountAction;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (fields.get("password") !== fields.get("confirm")) {
      setError("The new passwords don’t match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action, username: fields.get("username"), credential: fields.get("credential"), password: fields.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not update your account.");
      } else if (action === "setup") {
        setCodes(result.recoveryCodes);
      } else {
        onComplete();
      }
    } catch {
      setError("Could not reach Dispatch. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (codes.length) return (
    <section className="mt-6 space-y-4">
      <h2 className="text-lg font-bold">Save your three recovery codes</h2>
      <p className="text-sm text-slate-300">These codes are shown once. Keep them in a password manager or somewhere private. Each code works once.</p>
      <ul className="space-y-2 rounded-lg bg-slate-950 p-3 font-mono text-sm">
        {codes.map((code) => <li key={code} className="break-all">{code}</li>)}
      </ul>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} />
        I saved my recovery codes
      </label>
      <button type="button" disabled={!saved} onClick={onComplete} className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">Continue to sign-in</button>
    </section>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <h2 className="text-lg font-bold">{titles[action]}</h2>
      {action !== "change" && <label className="block text-sm">Username
        <input name="username" required autoComplete="username" autoCapitalize="none" className={inputClass} />
      </label>}
      <label className="block text-sm">
        {action === "change" ? "Current password" : action === "setup" ? "One-time setup code" : "Unused recovery code"}
        <input name="credential" type="password" required autoComplete={action === "change" ? "current-password" : "off"} className={inputClass} />
      </label>
      <label className="block text-sm">New password
        <input name="password" type="password" minLength={12} maxLength={72} required autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block text-sm">Confirm new password
        <input name="confirm" type="password" minLength={12} maxLength={72} required autoComplete="new-password" className={inputClass} />
      </label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">
        {busy ? "Saving…" : action === "setup" ? "Create account" : "Save password"}
      </button>
      <button type="button" disabled={busy} onClick={onCancel} className="text-sm text-cyan-300">Cancel</button>
    </form>
  );
}


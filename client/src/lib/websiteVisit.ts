const visitKey = "codys-plumbing-visit";
const visitWindow = 30 * 60 * 1000;
let currentVisit: { id: string; at: number; recorded?: boolean } | undefined;
let saving = false;

function saveVisitState() {
  try {
    sessionStorage.setItem(visitKey, JSON.stringify(currentVisit));
  } catch {
    // Use the in-memory visit when browser storage is disabled.
  }
}

export async function recordWebsiteVisit() {
  if (saving || document.visibilityState !== "visible" || !globalThis.crypto?.randomUUID) return;

  if (!currentVisit) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(visitKey) ?? "null");
      if (typeof saved?.id === "string" && typeof saved.at === "number") currentVisit = saved;
    } catch {
      // A new visit can still be measured without browser storage.
    }
  }

  const now = Date.now();
  if (!currentVisit || now - currentVisit.at >= visitWindow) {
    currentVisit = { id: crypto.randomUUID(), at: now };
    saveVisitState();
  }
  if (currentVisit.recorded) return;

  saving = true;
  try {
    // Retry using the same anonymous ID if the response is lost.
    const response = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentVisit.id }),
      keepalive: true,
    });
    if (response.ok) {
      currentVisit.recorded = true;
      saveVisitState();
    }
  } catch {
    // Analytics must not interrupt the public site.
  } finally {
    saving = false;
  }
}

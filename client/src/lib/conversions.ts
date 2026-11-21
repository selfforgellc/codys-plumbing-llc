export type ConversionType = "phone_click" | "booking_open" | "booking_success" | "booking_error";
export function trackConversion(type: ConversionType) {
  try {
    void fetch("/api/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* Analytics must never block booking. */ }
}

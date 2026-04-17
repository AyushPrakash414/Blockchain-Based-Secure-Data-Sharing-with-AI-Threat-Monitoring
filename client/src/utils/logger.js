import supabase from "./supabaseClient";
import { LOG_URL } from "./apiConfig";

export async function logEvent(event = {}) {
  const payload = {
    ts: event.ts ?? new Date().toISOString(),
    wallet: event.wallet ?? null,
    action: event.action ?? null,
    result: event.result ?? "info",
    resource: event.resource ?? null,
    meta: event.meta ?? {},
  };

  if (!payload.action) {
    return;
  }

  // 1. Send to Supabase (primary — works everywhere)
  try {
    const { error } = await supabase.from("access_logs").insert([
      {
        wallet_address: payload.wallet,
        action: payload.action,
        result: payload.result,
        timestamp: payload.ts,
        metadata: payload.meta,
      },
    ]);
    if (error) console.error("Supabase log error:", error);
  } catch (err) {
    console.error("Supabase insert failed:", err);
  }

  // 2. Send to local Python backend (best-effort, won't block)
  try {
    void fetch(LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    return;
  }
}

export default logEvent;

const LOG_ENDPOINT = "http://localhost:8000/log";

export function logEvent(event = {}) {
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

  try {
    void fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    return;
  }
}

export default logEvent;

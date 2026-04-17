import { useEffect, useState } from "react";

const ALERTS_ENDPOINT = "http://localhost:8000/alerts";
const POLL_INTERVAL_MS = 8000;

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Checking backend...");

  useEffect(() => {
    let isMounted = true;

    const loadAlerts = async () => {
      try {
        const response = await fetch(ALERTS_ENDPOINT);
        if (!response.ok) {
          throw new Error("Unable to load alerts");
        }

        const payload = await response.json();
        if (!isMounted) {
          return;
        }

        setAlerts(Array.isArray(payload) ? payload : []);
        setBackendStatus("Alerts sync is active.");
      } catch {
        if (!isMounted) {
          return;
        }

        setAlerts([]);
        setBackendStatus("Backend unavailable. Alerts will appear when the API is running.");
      }
    };

    void loadAlerts();
    const intervalId = window.setInterval(() => {
      void loadAlerts();
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="mx-auto my-8 max-w-7xl bg-black bg-opacity-75 px-6 py-6 text-white">
      <div className="mb-2 text-3xl font-bold">Alerts</div>
      <p className="mb-6 text-sm text-slate-300">{backendStatus}</p>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-6 text-slate-200">
          No alerts available.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700 bg-slate-950 text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Wallet</th>
                <th className="px-4 py-3 text-sm font-semibold">Score</th>
                <th className="px-4 py-3 text-sm font-semibold">Reason</th>
                <th className="px-4 py-3 text-sm font-semibold">Recommended Action</th>
                <th className="px-4 py-3 text-sm font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts.map((alert) => (
                <tr key={`${alert.wallet}-${alert.ts}`}>
                  <td className="px-4 py-3 text-sm">{alert.wallet}</td>
                  <td className="px-4 py-3 text-sm">{alert.score}</td>
                  <td className="px-4 py-3 text-sm">{alert.reason}</td>
                  <td className="px-4 py-3 text-sm">{alert.recommended_action}</td>
                  <td className="px-4 py-3 text-sm">{alert.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

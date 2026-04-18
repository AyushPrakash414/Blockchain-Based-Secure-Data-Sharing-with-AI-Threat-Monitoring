import { useEffect, useMemo, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Brain, Loader2, Shield, ShieldAlert } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

import { fetchAlerts, subscribeToAlerts } from '../utils/monitorApi.js';
import { ANALYZE_URL, TRIGGER_DEMO_URL } from '../utils/apiConfig.js';
import { formatChartTime, formatDateTime, getDateValue, shortAddress } from '../lib/format.js';
import { EmptyState, GlassCard, MetricCard, StatusBadge } from '../ui/Primitives.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

const severityOrder = ['critical', 'high', 'medium', 'low'];

function mergeAlerts(current, incoming) {
  const items = [...current, ...incoming].filter(Boolean);
  const byId = new Map();

  items.forEach(alert => {
    const key = alert.id ?? `${alert.wallet_address}-${alert.created_at}-${alert.risk_score}`;
    byId.set(key, alert);
  });

  return [...byId.values()]
    .sort((left, right) => getDateValue(right.created_at) - getDateValue(left.created_at))
    .slice(0, 60);
}

export default function MonitorPage() {
  const { account } = useOutletContext();
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const simulatingRef = useRef(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    simulatingRef.current = simulating;
  }, [simulating]);

  const severityCounts = useMemo(() => ({
    critical: alerts.filter(alert => String(alert.severity).toLowerCase() === 'critical').length,
    high: alerts.filter(alert => String(alert.severity).toLowerCase() === 'high').length,
    medium: alerts.filter(alert => String(alert.severity).toLowerCase() === 'medium').length,
    low: alerts.filter(alert => String(alert.severity).toLowerCase() === 'low').length,
  }), [alerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(alert => String(alert.severity).toLowerCase() === filter);
  }, [alerts, filter]);
  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      setLoading(true);
      try {
        const initialAlerts = await fetchAlerts();
        if (!active) return;
        setAlerts(Array.isArray(initialAlerts) ? mergeAlerts([], initialAlerts) : []);
      } catch (error) {
        console.error('Initial alert fetch failed', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAlerts();

    const channel = subscribeToAlerts(newAlert => {
      setAlerts(current => mergeAlerts(current, [newAlert]));
      
      // Check if this alert was triggered during a simulation run
      const isSim = simulatingRef.current || newAlert.is_simulation;
      
      addNotification({
        title: isSim ? 'Security Simulation' : 'Real-Time Threat',
        message: isSim 
          ? `Simulated ${newAlert.severity} threat detected for triage testing.`
          : `High risk activity detected on wallet ${shortAddress(newAlert.wallet_address, 6, 4)}`,
        severity: String(newAlert.severity).toLowerCase(),
        type: isSim ? 'simulation' : 'threat'
      });
    });

    return () => {
      active = false;
      channel?.unsubscribe?.();
    };
  }, [addNotification]);
  
  const chartData = useMemo(() => {
    // Sort by time first to ensure sequence is correct
    const sorted = [...filteredAlerts].sort((left, right) => getDateValue(left.created_at) - getDateValue(right.created_at));
    
    return sorted.map((alert, index) => ({
      count: index + 1,
      risk: Number(alert.risk_score || 0),
      wallet: shortAddress(alert.wallet_address, 6, 4),
      time: alert.created_at
    }));
  }, [filteredAlerts]);
  
  const triggerSimulation = async () => {
    setSimulating(true);
    setAlerts([]); // Clear UI immediately for fresh demo
    try {
      await fetch(TRIGGER_DEMO_URL, { method: 'POST' });
    } catch (error) {
      console.error('Simulation trigger failed', error);
    } finally {
      // Keep simulating true for slightly longer to let the background task start
      setTimeout(() => setSimulating(false), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total alerts" value={alerts.length} detail="Live anomaly stream from Supabase." icon={ShieldAlert} tone={alerts.length > 0 ? 'warning' : 'success'} change="realtime" />
        <MetricCard label="Critical" value={severityCounts.critical} detail="Highest-priority events requiring immediate review." icon={AlertTriangle} tone={severityCounts.critical > 0 ? 'danger' : 'success'} change="urgent" />
        <MetricCard label="Filter scope" value={filter.toUpperCase()} detail="Current view on the alert stream." icon={Shield} tone="info" change={account ? shortAddress(account, 8, 6) : 'all wallets'} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2 text-center lg:text-left">
          <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Threat monitoring</p>
          <h2 className="text-3xl font-serif text-base-strong md:text-4xl">AI anomaly scoring and triage</h2>
          <p className="font-sans leading-7 text-base-muted">The monitoring surface keeps the highest-risk wallets visible, with clear severity labels and a fast path to triggering a fresh security simulation.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
          <button type="button" onClick={triggerSimulation} disabled={simulating} className="btn-primary flex items-center gap-3 px-8 py-3 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
            {simulating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
            {simulating ? 'Injecting Attack...' : 'Run Security Simulation'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {severityOrder.map(level => (
          <button key={level} type="button" onClick={() => setFilter(level)} className={`rounded-xl border px-4 py-3 text-left transition-theme ${filter === level ? 'border-accent bg-accent-strong' : 'border-base-strong bg-surface hover:bg-surface-inset'}`}>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-base-soft">{level}</p>
            <p className="mt-2 text-2xl font-serif text-base-strong">{severityCounts[level]}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        {/* Graph Section */}
        <div className="xl:col-span-8">
          <GlassCard title="Risk Progression" eyebrow="Analytics">
            <div className="h-[432px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C05C39" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#C05C39" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="count"
                    stroke="#8E9B84"
                    fontSize={11}
                    tickMargin={8}
                    label={{ value: 'Risk Event Count', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#8E9B84' }}
                  />
                  <YAxis stroke="#8E9B84" fontSize={11} tickFormatter={value => `${value}%`} />
                  <RechartsTooltip
                    labelFormatter={value => `Risk Event #${value}`}
                    formatter={(value, _name, payload) => [
                      `${value}%`, 
                      `Score ${payload?.payload?.wallet ? `(${payload.payload.wallet})` : ''}`.trim()
                    ]}
                    contentStyle={{ backgroundColor: '#FCF9F3', border: '1px solid #DCC1B8', borderRadius: '8px' }}
                    itemStyle={{ color: '#1C1C18' }}
                  />
                  <Area type="monotone" dataKey="risk" stroke="#C05C39" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" activeDot={{ r: 6, fill: '#C05C39', stroke: '#FCF9F3', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Alerts Section (Side) */}
        <div className="space-y-4 xl:col-span-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft px-1 mb-3">Live stream</p>
          {loading ? (
            <div className="surface rounded-[var(--radius-xl)] p-10 text-center text-base-muted border border-base">
              <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
              Syncing telemetry...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No alerts" description="All indicators summary within safe bounds." />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAlerts.map((alert, index) => {
                const severity = String(alert.severity || 'medium').toLowerCase();
                const score = Number(alert.risk_score || 0);

                return (
                  <div key={alert.id || index} className="rounded-[20px] border border-base bg-[var(--bg-inset)] p-4 transition-theme hover:bg-white/50">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge tone={severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : severity === 'low' ? 'success' : 'info'}>{severity}</StatusBadge>
                      <span className="mono text-[10px] text-base-muted">{shortAddress(alert.wallet_address, 4, 3)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-base-soft font-bold">
                      <span>Anomalous load</span>
                      <span>{score}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-base/10">
                      <div className={`h-full rounded-full ${score > 80 ? 'bg-[var(--danger)]' : score > 50 ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`} style={{ width: `${Math.min(score, 100)}%` }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                       <p className="text-[10px] text-base-faint">{formatDateTime(alert.created_at)}</p>
                       <span className="text-[9px] font-bold text-[var(--accent)] opacity-50">EVENT #{filteredAlerts.length - index}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Brain, Loader2, RefreshCw, AlertTriangle, Shield, Activity } from 'lucide-react';
import { fetchAlerts, subscribeToAlerts } from '../utils/monitorApi';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400', badge: 'bg-red-500 text-white' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-400', text: 'text-orange-400', badge: 'bg-orange-500 text-white' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-500 text-black' },
  low: { bg: 'bg-green-500/10', border: 'border-green-400', text: 'text-green-400', badge: 'bg-green-500 text-black' },
};

export default function ThreatPage() {
  const { account } = useOutletContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchAlerts();
      if (mounted && Array.isArray(data)) setAlerts(data);
      setLoading(false);
    };
    load();

    const sub = subscribeToAlerts((newAlert) => {
      if (mounted) setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    });

    return () => { mounted = false; sub?.unsubscribe(); };
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', { method: 'POST' });
      const data = await res.json();
      if (Array.isArray(data)) setAlerts(prev => [...data, ...prev]);
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity?.toUpperCase() === filter);
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  alerts.forEach(a => { const s = a.severity?.toUpperCase(); if (severityCounts[s] !== undefined) severityCounts[s]++; });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Threat Monitor</h1>
          <p className="text-secondary mt-1">AI-powered anomaly detection via IsolationForest.</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-accent text-black font-semibold py-2.5 px-5 rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {analyzing ? 'Analyzing...' : 'Analyze Now'}
        </button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Alerts', value: alerts.length, icon: ShieldAlert, color: 'text-accent' },
          { label: 'Critical', value: severityCounts.CRITICAL, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'High', value: severityCounts.HIGH, icon: Activity, color: 'text-orange-400' },
          { label: 'Low/Medium', value: severityCounts.LOW + severityCounts.MEDIUM, icon: Shield, color: 'text-accent' },
        ].map((s, i) => (
          <div key={i} className="glass p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-muted text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color} font-mono`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 flex-wrap">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-accent text-black' : 'bg-tertiary text-muted hover:text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted py-8 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading threat data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <Shield className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-primary font-medium">All Clear</p>
          <p className="text-muted text-sm mt-1">No threats detected. The system is secure.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => {
            const style = SEVERITY_STYLES[alert.severity?.toLowerCase()] || SEVERITY_STYLES.medium;
            return (
              <motion.div
                key={alert.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass p-4 border-l-4 ${style.border}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.badge}`}>{alert.severity}</span>
                    {alert.wallet_address && (
                      <span className="font-mono text-xs text-secondary">{alert.wallet_address.slice(0,8)}...{alert.wallet_address.slice(-6)}</span>
                    )}
                  </div>
                  {alert.risk_score && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-tertiary overflow-hidden">
                        <div className={`h-full rounded-full ${Number(alert.risk_score) > 80 ? 'bg-red-500' : Number(alert.risk_score) > 50 ? 'bg-orange-400' : 'bg-accent'}`}
                             style={{ width: `${Math.min(alert.risk_score, 100)}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted">{alert.risk_score}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-primary">{alert.message || alert.reason}</p>
                {alert.recommended_action && (
                  <p className="text-xs text-muted mt-2">Recommended: <span className="text-secondary">{alert.recommended_action}</span></p>
                )}
                {alert.created_at && (
                  <p className="text-xs text-faint mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

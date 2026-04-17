import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { fetchLogs } from '../utils/monitorApi';

const RESULT_COLORS = {
  success: 'bg-green-500/10 text-green-400',
  error: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
  pending: 'bg-yellow-500/10 text-yellow-400',
};

export default function AuditPage() {
  const { account } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletFilter, setWalletFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs(walletFilter || account, 200);
      if (Array.isArray(data)) setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) loadLogs();
  }, [account]);

  const filteredLogs = actionFilter
    ? logs.filter(l => l.action?.toLowerCase().includes(actionFilter.toLowerCase()))
    : logs;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Audit Logs</h1>
          <p className="text-secondary mt-1">Complete event trail across your blockchain operations.</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-tertiary border border-theme text-primary font-medium py-2 px-4 rounded-lg transition-all hover:bg-elevated"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            placeholder="Filter by wallet address..."
            className="w-full bg-tertiary border border-theme text-primary pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm font-mono"
          />
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by action..."
            className="w-full bg-tertiary border border-theme text-primary pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <button onClick={loadLogs} className="bg-accent text-black font-semibold py-2.5 px-5 rounded-lg hover:opacity-90 transition-all whitespace-nowrap">
          Apply
        </button>
      </div>

      <div className="text-xs text-muted">{filteredLogs.length} events</div>

      {/* Log table */}
      {loading ? (
        <div className="glass p-12 text-center text-muted">Loading events...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass p-12 text-center">
          <FileText className="w-10 h-10 text-faint mx-auto mb-3" />
          <p className="text-muted">No audit events found.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-tertiary border-b border-theme text-xs text-muted font-medium uppercase tracking-wider">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Action</div>
            <div className="col-span-3">Wallet</div>
            <div className="col-span-2">Result</div>
            <div className="col-span-2">Details</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--color-border)]">
            {filteredLogs.map((log, i) => (
              <div key={log.id || i}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-3 px-4 py-3 text-sm hover:bg-tertiary transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                >
                  <div className="md:col-span-2 text-xs text-muted font-mono">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </div>
                  <div className="md:col-span-3 text-primary font-medium text-xs">
                    {log.action}
                  </div>
                  <div className="md:col-span-3 font-mono text-xs text-secondary truncate">
                    {log.wallet_address || '—'}
                  </div>
                  <div className="md:col-span-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${RESULT_COLORS[log.result] || 'bg-tertiary text-muted'}`}>
                      {log.result}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    {expandedRow === i ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                  </div>
                </div>

                {/* Expanded metadata */}
                {expandedRow === i && log.metadata && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-3"
                  >
                    <pre className="bg-inset p-3 rounded-lg text-xs font-mono text-secondary overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

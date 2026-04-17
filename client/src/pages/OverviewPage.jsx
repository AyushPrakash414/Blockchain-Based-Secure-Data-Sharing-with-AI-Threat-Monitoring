import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Database, Brain, Wallet, FileText, Users, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAlerts, fetchLogs } from '../utils/monitorApi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function OverviewPage() {
  const { account, contract } = useOutletContext();
  const [stats, setStats] = useState({ files: 0, alerts: 0, logs: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [alertData, logData] = await Promise.all([
          fetchAlerts(),
          fetchLogs(account, 100),
        ]);
        setStats({
          alerts: Array.isArray(alertData) ? alertData.length : 0,
          logs: Array.isArray(logData) ? logData.length : 0,
        });
      } catch {}
    };
    if (account) load();
  }, [account]);

  const pillars = [
    {
      icon: Shield,
      title: 'Blockchain Integrity',
      desc: 'Every file CID is anchored to the Ethereum Sepolia network via a smart contract. Immutable, transparent, and verifiable.',
      color: 'text-accent',
      bg: 'bg-accent-soft',
    },
    {
      icon: Database,
      title: 'IPFS Storage',
      desc: 'Files are encrypted and pinned to the InterPlanetary File System via Pinata, ensuring decentralized, censorship-resistant storage.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Brain,
      title: 'AI Threat Monitoring',
      desc: 'An IsolationForest ML model continuously analyzes access patterns, flagging anomalous wallet behaviors in real-time.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto space-y-10">
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl lg:text-4xl font-bold text-primary tracking-tight">
          Welcome to <span className="text-accent">Sentinel Drive</span>
        </h1>
        <p className="text-secondary mt-2 text-lg max-w-2xl">
          Blockchain-secured file storage with AI-powered threat detection. Your sovereign digital vault.
        </p>
      </motion.div>

      {/* Wallet banner */}
      {!account && (
        <motion.div variants={fadeUp} className="glass p-5 flex items-center gap-4 border-l-4" style={{ borderLeftColor: 'var(--color-warning)' }}>
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-primary font-medium text-sm">Wallet Not Connected</p>
            <p className="text-muted text-xs mt-0.5">Please install MetaMask and connect your wallet to access all features.</p>
          </div>
        </motion.div>
      )}

      {/* Three Pillars */}
      <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-5">
        {pillars.map((p, i) => (
          <div key={i} className="glass p-6 hover:shadow-elevated transition-shadow duration-300 group">
            <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <p.icon className={`w-6 h-6 ${p.color}`} />
            </div>
            <h3 className="text-primary font-semibold text-base mb-2">{p.title}</h3>
            <p className="text-secondary text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      {account && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Connected Wallet', value: `${account.slice(0,6)}...${account.slice(-4)}`, icon: Wallet, color: 'text-accent' },
            { label: 'Network', value: 'Sepolia', icon: Shield, color: 'text-blue-400' },
            { label: 'Active Alerts', value: stats.alerts, icon: AlertTriangle, color: stats.alerts > 0 ? 'text-danger' : 'text-accent' },
            { label: 'Audit Events', value: stats.logs, icon: FileText, color: 'text-secondary' },
          ].map((stat, i) => (
            <div key={i} className="glass p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-muted text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color === 'text-secondary' ? 'text-primary' : stat.color} font-mono`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

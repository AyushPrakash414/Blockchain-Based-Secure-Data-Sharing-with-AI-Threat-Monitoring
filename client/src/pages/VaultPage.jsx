import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderLock, Share2, ExternalLink, FileText, Search } from 'lucide-react';
import { logEvent } from '../utils/logger';

export default function VaultPage() {
  const { account, contract } = useOutletContext();
  const [tab, setTab] = useState('mine');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [error, setError] = useState('');

  const loadFiles = async () => {
    if (!contract) return;
    setLoading(true);
    setError('');
    try {
      let address = account;
      if (tab === 'shared') {
        if (!targetAddress || !targetAddress.startsWith('0x')) {
          setError('Please enter a valid wallet address');
          setLoading(false);
          return;
        }
        address = targetAddress;
      }

      logEvent({
        wallet: account,
        action: 'FILES_DISPLAY_REQUESTED',
        result: 'info',
        meta: { shared: tab === 'shared', targetWallet: address },
      });

      const result = await contract.display(address);
      setFiles(result || []);
      setLoaded(true);
    } catch (e) {
      setError('Access denied or no files found.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    setFiles([]);
    setLoaded(false);
    setError('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-primary">File Vault</h1>
        <p className="text-secondary mt-1">Browse your encrypted file ecosystem on Ethereum.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-tertiary rounded-lg p-1 w-fit">
        {[
          { key: 'mine', label: 'My Files', icon: FolderLock },
          { key: 'shared', label: 'Shared With Me', icon: Share2 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-secondary text-primary shadow-card' : 'text-muted hover:text-primary'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Shared address input */}
      {tab === 'shared' && (
        <div className="glass p-4">
          <label className="text-muted text-xs font-medium uppercase tracking-wider block mb-2">Target Wallet Address</label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="0x..."
            className="w-full bg-tertiary border border-theme text-primary px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
          />
        </div>
      )}

      {/* Load button */}
      <button
        onClick={loadFiles}
        disabled={!account || !contract || loading}
        className="flex items-center gap-2 bg-accent text-black font-semibold py-2.5 px-5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4" />
        {loading ? 'Loading...' : 'Load Files'}
      </button>

      {/* Error */}
      {error && (
        <div className="glass p-4 border-l-4 text-danger text-sm" style={{ borderLeftColor: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Files grid */}
      {loaded && files.length === 0 && !error && (
        <div className="glass p-12 flex flex-col items-center text-center">
          <FileText className="w-12 h-12 text-faint mb-4" />
          <p className="text-muted font-medium">No files found</p>
          <p className="text-faint text-sm mt-1">{tab === 'mine' ? 'Upload your first file to get started.' : 'This wallet has not shared any files with you.'}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((fileUrl, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-4 group hover:shadow-elevated transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary flex items-center justify-center flex-shrink-0 group-hover:bg-accent-soft transition-colors">
                  <FileText className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-faint font-mono truncate">ipfs://{fileUrl.substring(36, 56)}...</p>
                  <p className="text-sm text-primary font-medium mt-0.5">Vault Document #{i + 1}</p>
                </div>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  logEvent({
                    wallet: account,
                    action: 'FILE_VIEW_CLICKED',
                    result: 'info',
                    meta: { fileUrl, shared: tab === 'shared' },
                  })
                }
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-tertiary text-accent text-xs font-semibold uppercase tracking-wider hover:bg-accent-soft transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open File
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

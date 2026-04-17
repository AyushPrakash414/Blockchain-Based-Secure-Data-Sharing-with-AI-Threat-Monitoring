import { useEffect, useMemo, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, FolderLock, Search, Share2, FileText, Loader2 } from 'lucide-react';

import { logEvent } from '../utils/logger.js';
import { parseIpfsCid, shortAddress } from '../lib/format.js';
import DataTable from '../ui/DataTable.jsx';
import { EmptyState, GlassCard, StatusBadge } from '../ui/Primitives.jsx';

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export default function VaultPage() {
  const { account, contract } = useOutletContext();
  const [tab, setTab] = useState('mine');
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);

  const loadFiles = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    setError('');

    try {
      const address = tab === 'mine' ? account : targetAddress;

      if (tab === 'shared' && !isValidAddress(address)) {
        setError('Enter a valid Ethereum wallet address.');
        setLoading(false);
        return;
      }

      logEvent({ wallet: account, action: 'FILES_DISPLAY_REQUESTED', result: 'info', meta: { tab, targetWallet: address } });

      const result = await contract.display(address);
      const list = Array.isArray(result) ? result : [];

      setFiles(list.map((url, index) => ({
        id: `${address}-${index}`,
        index: index + 1,
        url,
        cid: parseIpfsCid(url),
        wallet: address,
      })));
    } catch {
      setFiles([]);
      setError('Access denied or no files are available for this wallet.');
    } finally {
      setLoading(false);
    }
  }, [account, contract, tab, targetAddress]);

  useEffect(() => {
    if (tab === 'mine' && account && contract) {
      loadFiles();
    }
  }, [tab, account, contract, loadFiles]);

  const sourceLabel = tab === 'mine' ? 'My files' : 'Shared with me';
  const rows = useMemo(() => files, [files]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <GlassCard
        eyebrow="File storage"
        title="My Files"
        action={<StatusBadge tone={account ? 'success' : 'warning'}>{account ? shortAddress(account, 8, 6) : 'wallet required'}</StatusBadge>}
      >
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'mine', label: 'My files', icon: FolderLock },
            { key: 'shared', label: 'Shared with me', icon: Share2 },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key);
                setFiles([]);
                setError('');
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-theme ${tab === item.key ? 'btn-tab-active' : 'btn-secondary'}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'shared' ? (
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="flex items-center gap-3 rounded-md border border-base-strong bg-white px-4 py-3 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
              <Search className="h-4 w-4 text-base-soft" />
              <input
                value={targetAddress}
                onChange={event => setTargetAddress(event.target.value)}
                placeholder="0x wallet address"
                className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-base-soft placeholder:font-sans"
              />
            </label>
            <button type="button" onClick={loadFiles} className="btn-primary px-6 py-3 text-sm font-medium transition-theme">
              <Search className="h-4 w-4" />
              Load shared files
            </button>
          </div>
        ) : null}

        {tab === 'mine' && loading ? (
          <div className="mt-5 flex justify-center py-6">
            <div className="flex items-center gap-3 text-base-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your files...</span>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </GlassCard>

      {!files.length && !loading ? (
        <EmptyState
          icon={FileText}
          title={`No files loaded in ${sourceLabel.toLowerCase()}`}
          description={tab === 'mine' ? 'Upload a file to populate your secure storage.' : 'Enter a wallet address to inspect the files that were shared with you.'}
        />
      ) : null}

      {rows.length > 0 ? (
        <DataTable
          title={sourceLabel}
          description="Search, sort, and inspect the documents associated with the selected wallet."
          data={rows}
          searchableKeys={['cid', 'url', 'wallet']}
          rowKey={row => row.id}
          pageSize={6}
          accentColumn="cid"
          columns={[
            { key: 'index', label: '#', sortable: true, render: row => row.index },
            { key: 'cid', label: 'CID', sortable: true, render: row => row.cid },
            { key: 'wallet', label: 'Owner', sortable: true, render: row => shortAddress(row.wallet, 8, 6) },
            {
              key: 'url',
              label: 'Gateway',
              sortable: false,
              render: row => (
                <a href={row.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline">
                  Open file <ExternalLink className="h-4 w-4" />
                </a>
              ),
            },
          ]}
        />
      ) : null}
    </motion.div>
  );
}

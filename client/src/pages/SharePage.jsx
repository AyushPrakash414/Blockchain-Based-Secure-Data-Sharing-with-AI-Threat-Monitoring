import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, UserPlus, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { logEvent } from '../utils/logger';

export default function SharePage() {
  const { account, contract } = useOutletContext();
  const [addressInput, setAddressInput] = useState('');
  const [sharedList, setSharedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const loadAccessList = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const list = await contract.shareAccess();
      setSharedList(list || []);
    } catch (e) {
      console.error('Failed to load access list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) loadAccessList();
  }, [contract]);

  const grantAccess = async () => {
    if (!isValidAddress(addressInput)) {
      setError('Invalid Ethereum address format');
      return;
    }
    setError('');
    setSuccess('');
    setGranting(true);
    try {
      const tx = await contract.allow(addressInput);
      logEvent({ wallet: account, action: 'ACCESS_GRANTED', result: 'success', meta: { targetWallet: addressInput, txHash: tx.hash } });
      await tx.wait();
      setSuccess(`Access granted to ${addressInput.slice(0,6)}...${addressInput.slice(-4)}`);
      setAddressInput('');
      await loadAccessList();
    } catch (e) {
      setError(e?.reason || e?.message || 'Transaction failed');
    } finally {
      setGranting(false);
    }
  };

  const revokeAccess = async (address) => {
    setRevoking(address);
    setError('');
    setSuccess('');
    try {
      const tx = await contract.disallow(address);
      logEvent({ wallet: account, action: 'ACCESS_REVOKED', result: 'success', meta: { targetWallet: address, txHash: tx.hash } });
      await tx.wait();
      setSuccess(`Access revoked for ${address.slice(0,6)}...${address.slice(-4)}`);
      await loadAccessList();
    } catch (e) {
      setError(e?.reason || e?.message || 'Revocation failed');
    } finally {
      setRevoking('');
    }
  };

  const activeGrants = sharedList.filter(entry => entry[1]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-primary">Access Control</h1>
        <p className="text-secondary mt-1">Grant or revoke file access to other Ethereum wallets.</p>
      </div>

      {/* Grant Access Card */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-5 h-5 text-accent" />
          <h2 className="text-primary font-semibold">Grant Access</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-tertiary border border-theme text-primary px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
          />
          <button
            onClick={grantAccess}
            disabled={!addressInput || granting || !contract}
            className="flex items-center justify-center gap-2 bg-accent text-black font-semibold py-2.5 px-5 rounded-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {granting ? 'Granting...' : 'Grant Access'}
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-warning-soft rounded-lg">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-secondary">This action writes to the Ethereum blockchain. Gas fees apply and the transaction is recorded immutably.</p>
        </div>
      </div>

      {/* Status messages */}
      {success && (
        <div className="glass p-4 flex items-center gap-3 border-l-4" style={{ borderLeftColor: 'var(--color-accent)' }}>
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <p className="text-primary text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="glass p-4 flex items-center gap-3 border-l-4" style={{ borderLeftColor: 'var(--color-danger)' }}>
          <AlertTriangle className="w-5 h-5 text-danger" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Access List */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-primary font-semibold">Active Grants</h2>
          <span className="text-xs font-medium text-muted bg-tertiary px-2.5 py-1 rounded-full">
            {activeGrants.length} {activeGrants.length === 1 ? 'grant' : 'grants'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading access list...</span>
          </div>
        ) : activeGrants.length === 0 ? (
          <div className="p-8 text-center bg-tertiary rounded-lg">
            <Share2 className="w-8 h-8 text-faint mx-auto mb-2" />
            <p className="text-muted text-sm">No active access grants.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGrants.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-tertiary rounded-lg group hover:bg-elevated transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                    <span className="text-accent text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="font-mono text-sm text-primary truncate">{entry[0]}</span>
                </div>
                <button
                  onClick={() => revokeAccess(entry[0])}
                  disabled={revoking === entry[0]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-soft text-danger hover:bg-danger hover:text-white transition-all disabled:opacity-50 flex-shrink-0"
                >
                  {revoking === entry[0] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

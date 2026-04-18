import { useRef, useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, CheckCircle2, Copy, ExternalLink, FileUp, Loader2, Smartphone, XCircle, Shield, UserPlus, X } from 'lucide-react';

import { JWT } from '../utils/constants.js';
import { logEvent } from '../utils/logger.js';
import { formatBytes, shortAddress } from '../lib/format.js';
import { GlassCard, ProgressBar, StatusBadge } from '../ui/Primitives.jsx';

const steps = ['Select file', 'Pin to IPFS', 'Sign transaction', 'Confirm chain state'];

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openWalletForSigning() {
  window.location.href = 'metamask://wc';
  window.setTimeout(() => window.open('https://metamask.app.link/wc', '_self'), 500);
}

export default function UploadPage() {
  const { account, contract } = useOutletContext();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copyState, setCopyState] = useState('');
  const [awaitingWallet, setAwaitingWallet] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Share state
  const [shareAddress, setShareAddress] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState({ type: '', message: '' });
  const [sharedList, setSharedList] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  
  const inputRef = useRef(null);

  const fetchSharedList = async () => {
    if (!contract || !account) return;
    setLoadingShares(true);
    try {
      const list = await contract.shareAccess();
      // list is an array of tuples [address, bool]
      const activeShares = list.filter(item => item.access === true)
                               .map(item => item.user);
      setSharedList(activeShares);
    } catch (err) {
      console.error('Failed to fetch shared list:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  useEffect(() => {
    fetchSharedList();
  }, [contract, account, result]);

  const handleSelect = event => {
    const nextFile = event.target.files?.[0];
    if (nextFile) {
      setFile(nextFile);
      setError('');
      setResult(null);
      setStep(0);
    }
  };

  const handleDrop = event => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) {
      setFile(nextFile);
      setError('');
      setResult(null);
      setStep(0);
    }
  };

  const copyValue = async (value, key) => {
    await navigator.clipboard.writeText(value);
    setCopyState(key);
    window.setTimeout(() => setCopyState(''), 1500);
  };

  const upload = async () => {
    if (!file || !account || !contract) return;

    setUploading(true);
    setError('');
    setResult(null);
    setAwaitingWallet(false);

    const meta = { fileName: file.name, fileSize: file.size };

    try {
      setStep(1);
      logEvent({ wallet: account, action: 'FILE_UPLOAD_STARTED', result: 'info', meta });

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          Authorization: `Bearer ${JWT}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const cid = response.data.IpfsHash;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
      setStep(2);
      logEvent({ wallet: account, action: 'FILE_UPLOADED_TO_IPFS', result: 'success', meta: { ...meta, cid, gatewayUrl } });

      if (isMobile()) {
        setAwaitingWallet(true);
      }

      const txPromise = contract.add(account, gatewayUrl);
      if (isMobile()) {
        window.setTimeout(openWalletForSigning, 1800);
      }

      const tx = await txPromise;
      logEvent({ wallet: account, action: 'FILE_STORED_ONCHAIN_PENDING', result: 'pending', meta: { ...meta, cid, gatewayUrl, txHash: tx.hash } });

      setStep(3);
      await tx.wait();

      logEvent({ wallet: account, action: 'FILE_STORED_ONCHAIN_SUCCESS', result: 'success', meta: { ...meta, cid, gatewayUrl, txHash: tx.hash } });

      setResult({ cid, gatewayUrl, txHash: tx.hash });
      setFile(null);
    } catch (uploadError) {
      const message = uploadError?.response?.data?.error || uploadError?.reason || uploadError?.message || 'Upload failed';
      setError(message);
      logEvent({ wallet: account, action: 'FILE_UPLOAD_FAILED', result: 'error', meta: { ...meta, error: message } });
    } finally {
      setAwaitingWallet(false);
      setUploading(false);
    }
  };

  const shareAccess = async () => {
    if (!shareAddress || !contract) return;
    
    // Address format validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(shareAddress)) {
      setShareStatus({ type: 'error', message: 'Invalid Ethereum address format.' });
      return;
    }

    setSharing(true);
    setShareStatus({ type: '', message: '' });

    try {
      const tx = await contract.allow(shareAddress);
      logEvent({
        wallet: account,
        action: "ACCESS_GRANTED",
        result: "success",
        meta: { targetWallet: shareAddress, txHash: tx.hash },
      });
      await tx.wait();
      setShareAddress('');
      setShareStatus({ type: 'success', message: 'Access granted successfully!' });
      window.setTimeout(() => setShareStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      console.error(err);
      setShareStatus({ type: 'error', message: err?.reason || err?.message || 'Failed to grant access.' });
    } finally {
      setSharing(false);
    }
  };

  const revokeAccess = async (targetWallet) => {
    if (!contract || !account) return;
    setShareStatus({ type: '', message: '' });
    try {
      const tx = await contract.disallow(targetWallet);
      logEvent({
        wallet: account,
        action: "ACCESS_REVOKED",
        result: "success",
        meta: { targetWallet, txHash: tx.hash },
      });
      await tx.wait();
      setShareStatus({ type: 'success', message: 'Access revoked successfully!' });
      fetchSharedList();
      window.setTimeout(() => setShareStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      console.error(err);
      setShareStatus({ type: 'error', message: err?.reason || err?.message || 'Failed to revoke access.' });
    }
  };

  const reset = () => {
    setFile(null);
    setStep(0);
    setError('');
    setResult(null);
    setAwaitingWallet(false);
  };

  const stepProgress = (step / (steps.length - 1)) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <GlassCard
          eyebrow="Secure ingest"
          title="Upload to DataFort AI"
          action={<StatusBadge tone={account ? 'success' : 'warning'}>{account ? shortAddress(account, 8, 6) : 'Wallet required'}</StatusBadge>}
        >
          <div className="space-y-5">
            <ProgressBar label="Pipeline progress" value={stepProgress} tone={error ? 'danger' : step === 3 ? 'success' : 'accent'} />

            <div className="grid gap-4 md:grid-cols-4">
              {steps.map((label, index) => {
                const active = step >= index;
                return (
                  <div key={label} className={`rounded-xl border p-4 transition-theme ${active ? 'border-accent bg-accent-strong' : 'border-base bg-surface-inset'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-base-soft">Step {index + 1}</span>
                      {active ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <div className="h-2 w-2 rounded-full border border-base-strong" />}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-tight text-base-strong">{label}</p>
                  </div>
                );
              })}
            </div>

            {awaitingWallet ? (
              <div className="rounded-xl border border-warning bg-warning p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Smartphone className="h-6 w-6 animate-pulse text-warning" />
                  <div>
                    <p className="font-semibold font-serif text-base-strong">Confirm in MetaMask</p>
                    <p className="mt-1 text-sm leading-relaxed text-base-muted font-sans">The transaction is waiting for wallet approval on a mobile device.</p>
                    <button type="button" onClick={openWalletForSigning} className="btn-secondary mt-4 px-4 py-2 text-sm font-medium transition-theme">
                      Open MetaMask <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {!result && (
              <div
                onDragOver={event => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-theme ${file ? 'border-accent bg-accent-strong cursor-default' : 'border-base-strong bg-surface hover:border-accent hover:bg-surface-inset'}`}
              >
                <input ref={inputRef} type="file" className="hidden" onChange={handleSelect} disabled={!account || uploading} />
                
                {file ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-serif font-medium break-all max-w-[500px] text-base-strong">{file.name}</p>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-base-soft">{formatBytes(file.size)}</p>
                    </div>
                    {error ? null : (
                      <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <button type="button" onClick={(e) => { e.stopPropagation(); upload(); }} disabled={uploading} className="btn-primary px-6 py-2.5 text-sm font-bold transition-theme disabled:cursor-not-allowed disabled:opacity-50">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                          {uploading ? 'Processing...' : 'Upload File'}
                        </button>
                        {!uploading && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn-secondary px-4 py-2.5 text-sm font-medium transition-theme">
                            <X className="h-4 w-4" /> Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-base-strong bg-white/50 text-accent shadow-sm mb-4">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-serif font-medium text-base-strong">Drop a file here or browse</p>
                      <p className="text-sm text-base-muted font-sans">Files are encrypted and pinned to IPFS exclusively.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {error ? (
              <div className="flex items-start gap-4 rounded-xl border border-danger bg-danger p-5">
                <XCircle className="mt-0.5 h-5 w-5 text-danger" />
                <div>
                  <p className="font-serif font-medium text-danger">Upload failed</p>
                  <p className="mt-1 text-sm leading-relaxed text-base-muted font-sans">{error}</p>
                </div>
              </div>
            ) : null}

            {result ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-accent bg-accent-strong p-6">
                  <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <p className="font-serif text-lg font-medium text-base-strong">Upload confirmed on chain</p>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { label: 'IPFS CID', value: result.cid, key: 'cid' },
                      { label: 'Gateway URL', value: result.gatewayUrl, key: 'gateway' },
                      { label: 'Transaction hash', value: result.txHash, key: 'tx' },
                    ].map(item => (
                      <div key={item.key} className="rounded-lg border border-base-strong bg-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-base-soft">{item.label}</p>
                          <p className="mt-1 font-mono text-sm text-base-strong break-all">{item.value}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button type="button" onClick={() => copyValue(item.value, item.key)} className="rounded-md border border-base-strong bg-white/50 p-2 transition-theme hover:bg-white shadow-sm">
                            {copyState === item.key ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-base-soft" />}
                          </button>
                          {item.key === 'gateway' ? (
                            <a href={item.value} target="_blank" rel="noreferrer" className="flex items-center rounded-md border border-base-strong bg-white/50 p-2 transition-theme hover:bg-white shadow-sm">
                              <ExternalLink className="h-4 w-4 text-base-soft" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-end">
                    <button type="button" onClick={reset} className="btn-secondary border-terracotta px-5 py-2.5 text-sm font-bold text-terracotta transition-theme">
                      Upload another file
                    </button>
                    <button type="button" onClick={() => navigate('/app/files')} className="btn-primary px-5 py-2.5 text-sm font-bold transition-theme">
                      View in My Files
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-base-strong bg-surface p-6 shadow-sm">
                  <div className="flex items-center gap-4 border-b border-base-strong pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-base-strong bg-white/50 text-base-strong shadow-sm">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-base-strong">Share your Vault</h3>
                      <p className="text-sm text-base-muted font-sans mt-1">Grant another wallet access to view your file storage.</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Enter Ethereum Address (0x...)"
                      value={shareAddress}
                      onChange={(e) => setShareAddress(e.target.value)}
                      className="flex-1 rounded-md border border-base-strong bg-white px-4 py-2.5 text-sm font-mono focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={shareAccess}
                      disabled={!shareAddress || sharing || !account}
                      className="btn-primary w-full px-4 py-2.5 text-sm font-bold transition-theme disabled:cursor-not-allowed disabled:opacity-50 sm:w-[130px]"
                    >
                      {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Grant Access'}
                    </button>
                  </div>

                  {sharedList.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-base-strong">
                      <h4 className="text-sm font-serif font-bold text-base-strong mb-3">Active Shares</h4>
                      <ul className="space-y-2">
                        {sharedList.map(address => (
                          <li key={address} className="flex items-center justify-between bg-surface-inset border border-base p-3 rounded-md">
                            <span className="font-mono text-xs text-base-strong">{shortAddress(address, 10, 8)}</span>
                            <button
                              onClick={() => revokeAccess(address)}
                              className="text-xs font-bold text-danger hover:underline"
                            >
                              Revoke
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {shareStatus.message && (
                    <div className={`mt-4 rounded-md p-3 text-sm font-medium font-sans border ${shareStatus.type === 'error' ? 'border-danger bg-danger text-danger' : 'border-success bg-success text-success'}`}>
                      {shareStatus.message}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

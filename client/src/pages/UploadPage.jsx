import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, XCircle, Loader2, Copy, Check, ExternalLink, FileUp } from 'lucide-react';
import axios from 'axios';
import { API_Key, API_Secret } from '../utils/constants';
import { logEvent } from '../utils/logger';

const STEPS = ['Select File', 'IPFS Upload', 'Wallet Signature', 'Confirmed'];

export default function UploadPage() {
  const { account, contract } = useOutletContext();
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const inputRef = useRef(null);

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError('');
      setResult(null);
      setStep(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setError('');
      setResult(null);
      setStep(0);
    }
  };

  const handleUpload = async () => {
    if (!file || !account || !contract) return;

    setError('');
    setResult(null);
    const baseMeta = { fileName: file.name, fileSize: file.size };

    try {
      // Step 1: IPFS upload
      setStep(1);
      logEvent({ wallet: account, action: 'FILE_UPLOAD_STARTED', result: 'info', meta: baseMeta });

      const formData = new FormData();
      formData.append('file', file);

      const resFile = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: { pinata_api_key: API_Key, pinata_secret_api_key: API_Secret, 'Content-Type': 'multipart/form-data' },
      });

      const cid = resFile.data.IpfsHash;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      logEvent({ wallet: account, action: 'FILE_UPLOADED_TO_IPFS', result: 'success', meta: { ...baseMeta, cid, gatewayUrl } });

      // Step 2: Wallet signature
      setStep(2);
      const tx = await contract.add(account, gatewayUrl);
      logEvent({ wallet: account, action: 'FILE_STORED_ONCHAIN_PENDING', result: 'pending', meta: { ...baseMeta, cid, gatewayUrl, txHash: tx.hash } });

      // Step 3: Wait for confirmation
      await tx.wait();
      setStep(3);

      logEvent({ wallet: account, action: 'FILE_STORED_ONCHAIN_SUCCESS', result: 'success', meta: { ...baseMeta, cid, gatewayUrl, txHash: tx.hash } });

      setResult({ cid, gatewayUrl, txHash: tx.hash });
      setFile(null);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.reason || err?.message || 'Unknown error';
      setError(msg);
      logEvent({ wallet: account, action: 'FILE_UPLOAD_FAILED', result: 'error', meta: { ...baseMeta, error: msg } });
    }
  };

  const reset = () => {
    setFile(null);
    setStep(0);
    setError('');
    setResult(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-primary">Secure Upload</h1>
        <p className="text-secondary mt-1">Encrypt & pin files to IPFS, then anchor to Ethereum.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > i ? 'bg-accent text-black' :
                step === i && !error ? 'bg-accent-soft text-accent ring-2 ring-accent' :
                step === i && error ? 'bg-danger-soft text-danger ring-2 ring-danger' :
                'bg-tertiary text-muted'
              }`}>
                {step > i ? <CheckCircle2 className="w-4 h-4" /> :
                 step === i && error ? <XCircle className="w-4 h-4" /> :
                 step === i && step > 0 && !result ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${step >= i ? 'text-primary' : 'text-muted'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded ${step > i ? 'bg-accent' : 'bg-tertiary'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Dropzone */}
      {!result && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`glass p-10 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-all ${
            file ? 'border-accent bg-accent-soft' : 'border-theme hover:border-accent'
          } ${step > 0 ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input ref={inputRef} type="file" onChange={handleFileSelect} className="hidden" disabled={!account || step > 0} />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${file ? 'bg-accent text-black' : 'bg-tertiary text-muted'}`}>
            <FileUp className="w-7 h-7" />
          </div>
          {file ? (
            <div>
              <p className="text-primary font-medium">{file.name}</p>
              <p className="text-muted text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-primary font-medium">Drop your file here or click to browse</p>
              <p className="text-muted text-xs mt-2">Supports all file types • Stored on IPFS via Pinata</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass p-4 border-l-4" style={{ borderLeftColor: 'var(--color-danger)' }}>
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-danger font-medium text-sm">Upload Failed</p>
              <p className="text-secondary text-xs mt-1 break-all">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4 border-l-4" style={{ borderLeftColor: 'var(--color-accent)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="text-primary font-semibold">Upload Complete</h3>
          </div>
          {[
            { label: 'IPFS CID', value: result.cid, key: 'cid' },
            { label: 'Gateway URL', value: result.gatewayUrl, key: 'url' },
            { label: 'Tx Hash', value: result.txHash, key: 'tx' },
          ].map(item => (
            <div key={item.key} className="bg-tertiary p-3 rounded-lg">
              <p className="text-muted text-xs font-medium uppercase tracking-wider mb-1">{item.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-primary text-sm font-mono break-all flex-1">{item.value}</p>
                <button onClick={() => copyText(item.value, item.key)} className="p-1 rounded hover:bg-elevated transition-colors flex-shrink-0">
                  {copiedField === item.key ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted" />}
                </button>
                {item.key === 'url' && (
                  <a href={item.value} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-elevated transition-colors flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-muted" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!result ? (
          <button
            onClick={handleUpload}
            disabled={!file || !account || step > 0}
            className="flex items-center gap-2 bg-accent text-black font-semibold py-3 px-6 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step > 0 && !error ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {step > 0 && !error ? 'Processing...' : 'Begin Secure Transfer'}
          </button>
        ) : (
          <button onClick={reset} className="flex items-center gap-2 bg-accent text-black font-semibold py-3 px-6 rounded-lg transition-all hover:opacity-90">
            <Upload className="w-4 h-4" /> Upload Another
          </button>
        )}
        {(file || error) && !result && step === 0 && (
          <button onClick={reset} className="py-3 px-6 rounded-lg border border-theme text-secondary font-medium hover:bg-tertiary transition-colors">
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );
}

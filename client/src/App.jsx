import { useEffect, useState } from 'react'
import "./App.css";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from './utils/constants';
import FileUpload from './components/FileUpload';
import Files from './components/Files';
import { logEvent } from './utils/logger';
import SecurityConsole from './components/security/SecurityConsole';
import { motion } from 'framer-motion';
import { Shield, Lock, Wallet, Fingerprint } from 'lucide-react';

export default function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    if (window.ethereum) {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const loadProvider = async () => {
        if (provider) {
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          })

          window.ethereum.on('accountsChanged', () => {
            window.location.reload();
          })

          await provider.send("eth_requestAccounts", [])
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          logEvent({
            wallet: address,
            action: "WALLET_CONNECTED",
            result: "success",
          });

          const contract = new ethers.Contract(
            contractAddress, contractAbi, signer
          )
          setContract(contract);
          setProvider(provider)
        }
        else {
          console.log("MetaMask is not installed")
        }
      }

      provider && loadProvider();
    }
    else {
      alert('Please Install Metamask')
    }
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="theme-bg theme-text font-['Inter',sans-serif] overflow-x-hidden min-h-screen transition-colors duration-300">

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 min-h-[90vh] flex flex-col justify-center">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 z-0 pointer-events-none bg-[var(--color-accent)]/8 dark:bg-[var(--color-accent)]/5"></div>
        {/* Dot grid — very subtle in light, slightly visible in dark */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]" style={{ backgroundImage: "radial-gradient(var(--color-text-faint) 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 max-w-[1600px]">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">

              <div className="mb-12">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full theme-bg-card border theme-border text-sm font-medium mb-6 theme-shadow transition-colors duration-300">
                  <Shield className="w-4 h-4 theme-accent" />
                  <span className="theme-text-secondary">Web3-first encrypted storage</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tighter mb-6 theme-text transition-colors duration-300">
                  Blockchain Drive.<br />
                  <span className="theme-text-muted">Ethereum & IPFS.</span>
                </motion.h1>

                <motion.p variants={fadeUp} className="text-lg sm:text-xl theme-text-secondary max-w-2xl font-medium transition-colors duration-300">
                  Decentralized storage with zero-knowledge encryption. Your files are mapped onto IPFS and anchored to Ethereum — completely controlled by you.
                </motion.p>
              </div>

              {/* Wallet & Upload Cards */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6 items-stretch">

                {/* Account Status Card */}
                <div className="theme-bg-card border theme-border rounded-2xl p-6 theme-shadow-elevated relative overflow-hidden group hover:border-[var(--color-accent)] transition-all duration-300">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-3 rounded-xl transition-colors duration-300 ${account ? 'theme-accent-soft accent-glow border border-[var(--color-accent)]' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`} style={account ? { borderColor: 'var(--color-accent)' } : {}}>
                        <Wallet className={`w-5 h-5 transition-colors duration-300 ${account ? 'theme-accent' : 'text-red-500 dark:text-red-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-xs theme-text-muted font-semibold uppercase tracking-wider">Connection</h3>
                        <div className={`font-bold text-base ${account ? 'theme-text' : 'text-red-500 dark:text-red-400'}`}>
                          {account ? 'Wallet Active' : 'Not Connected'}
                        </div>
                      </div>
                    </div>

                    {account ? (
                      <div className="mt-auto theme-bg-surface p-4 rounded-xl border theme-border-subtle transition-colors duration-300">
                        <span className="text-xs theme-text-muted block mb-1">Account Address</span>
                        <span className="font-mono text-sm theme-accent break-all">{account}</span>
                      </div>
                    ) : (
                      <div className="mt-auto p-4 rounded-xl border transition-colors duration-300" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)' }}>
                        <span className="text-sm" style={{ color: 'var(--color-danger)' }}>Please install and connect MetaMask.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Card */}
                <div className="theme-bg-card border theme-border rounded-2xl p-6 theme-shadow-elevated relative overflow-hidden hover:border-[var(--color-accent)] transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
                    <Fingerprint className="w-32 h-32 theme-text" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col">
                    <h3 className="text-lg font-bold theme-text mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4 theme-accent" />
                      Secure Upload
                    </h3>
                    <p className="text-sm theme-text-muted mb-5">Encrypt & pin documents to IPFS via Pinata.</p>

                    <div className="mt-auto">
                      <FileUpload account={account} provider={provider} contract={contract} />
                    </div>
                  </div>
                </div>
              </motion.div>

            </motion.div>

            {/* Right: Security Console */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="lg:col-span-5 xl:col-span-4 w-full relative z-20">
              <div className="theme-bg-card border theme-border rounded-2xl p-6 sm:p-8 theme-shadow-elevated relative overflow-hidden transition-colors duration-300">
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-bold theme-accent tracking-wide mb-1 uppercase">
                        Vault Security Console
                      </h2>
                      <p className="text-xs theme-text-faint uppercase tracking-widest">Real-time Monitoring</p>
                    </div>
                    <div className="w-10 h-10 theme-bg-surface rounded-full flex items-center justify-center border theme-border accent-glow transition-colors duration-300">
                      <Lock className="w-4 h-4 theme-accent" />
                    </div>
                  </div>

                  <SecurityConsole account={account} />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FILES SECTION */}
      <section id="files" className="py-24 relative border-t theme-border-subtle transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1600px] relative z-10">

          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 theme-text transition-colors duration-300">
                Your Encrypted <span className="theme-accent">Ecosystem</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-lg theme-text-muted transition-colors duration-300">
                Access and manage your securely mapped files across the Ethereum network.
              </motion.p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Files Container */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="theme-bg-card border theme-border rounded-2xl theme-shadow-elevated hover:border-[var(--color-accent)] transition-all duration-300 overflow-hidden group">
              <div className="p-6 md:p-8 border-b theme-border theme-bg-surface flex items-center gap-4 transition-colors duration-300">
                <div className="w-11 h-11 theme-bg-card rounded-xl flex items-center justify-center border theme-border group-hover:accent-glow transition-all duration-300">
                  <Lock className="w-5 h-5 theme-text-muted group-hover:theme-accent transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text tracking-tight">My Files</h3>
                  <p className="text-sm theme-text-muted mt-0.5">Owned by your wallet</p>
                </div>
              </div>
              <div className="p-6 md:p-8 min-h-[350px] transition-colors duration-300">
                <Files contract={contract} account={account} title="" />
              </div>
            </motion.div>

            {/* Shared With Me */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="theme-bg-card border theme-border rounded-2xl theme-shadow-elevated hover:border-[var(--color-accent)] transition-all duration-300 overflow-hidden group">
              <div className="p-6 md:p-8 border-b theme-border theme-bg-surface flex items-center gap-4 transition-colors duration-300">
                <div className="w-11 h-11 theme-bg-card rounded-xl flex items-center justify-center border theme-border group-hover:accent-glow transition-all duration-300">
                  <Shield className="w-5 h-5 theme-text-muted group-hover:theme-accent transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text tracking-tight">Shared With Me</h3>
                  <p className="text-sm theme-text-muted mt-0.5">Authorized external documents</p>
                </div>
              </div>
              <div className="p-6 md:p-8 min-h-[350px] transition-colors duration-300">
                <Files contract={contract} account={account} title="" shared='1' />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

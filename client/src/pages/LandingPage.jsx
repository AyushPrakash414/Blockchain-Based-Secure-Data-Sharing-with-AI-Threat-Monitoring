import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield } from 'lucide-react';

import { useWallet } from '../context/WalletContext.jsx';
import { productFeatures, workflowSteps } from '../data/product.js';
import { GlassCard } from '../ui/Primitives.jsx';

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { connectWallet, hasWallet, isConnected, isConnecting } = useWallet();
  const heroSignals = [
    { label: 'Encrypted ingest', value: 'IPFS + wallet signature' },
    { label: 'Threat visibility', value: 'Live anomaly scoring' },
    { label: 'Audit confidence', value: 'Chain-backed file trail' },
  ];

  const handleEnter = () => {
    if (isConnected) {
      navigate('/app');
    } else {
      connectWallet().catch(error => {
        console.error('Wallet connection failed', error);
      });
    }
  };

  return (
    <div className="hero-stage relative min-h-screen overflow-hidden app-shell flex flex-col font-sans">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-[-8rem] h-[34rem] bg-[radial-gradient(circle_at_top,rgba(252,249,243,0.98),rgba(252,249,243,0))]" />

      <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-8 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-base-strong bg-white/65 shadow-sm">
            <img src="/datafort-mark.svg" alt="" className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-base-strong">DataFort AI</h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button type="button" onClick={() => connectWallet().catch(error => console.error('Wallet connection failed', error))} className="text-sm font-bold text-base-strong transition-colors hover:text-[var(--accent)] disabled:opacity-50" disabled={isConnecting || !hasWallet}>
            {hasWallet ? (isConnecting ? 'Connecting...' : 'Connect Wallet') : 'Install MetaMask'}
          </button>
          <button type="button" onClick={handleEnter} className="btn-primary px-6 py-2.5 text-sm font-bold transition-theme">
            Get Started
          </button>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-[1440px] px-6 pb-20 pt-8 md:px-12 lg:pb-32">
        <section className="relative isolate min-h-[calc(100vh-140px)]">
          <motion.img
            src="/datafort-hand.svg"
            alt=""
            initial={{ opacity: 0, scale: 0.96, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-6 z-0 hidden h-auto w-[920px] max-w-none -translate-x-1/2 opacity-[0.42] lg:block xl:top-0 xl:w-[1020px]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-10 z-0 mx-auto h-[28rem] max-w-4xl rounded-full bg-[radial-gradient(circle,rgba(252,249,243,0.95),rgba(252,249,243,0)_72%)] blur-2xl" />

          <div className="relative z-10 grid min-h-[calc(100vh-140px)] items-center gap-14 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              className="max-w-3xl space-y-10 text-center lg:text-left"
            >
              <motion.div variants={fade} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.3em] uppercase text-accent shadow-sm">
                Secure vault orchestration
              </motion.div>

              <motion.div variants={fade} className="space-y-8">
                <h2 className="text-5xl font-serif leading-[1.04] md:text-7xl text-base-strong xl:text-[5.6rem]">
                  Your files.<br />
                  Your chain.<br />
                  <span className="text-accent italic relative inline-block">
                    Your control.
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.85, duration: 0.85, ease: 'easeOut' }}
                      className="absolute bottom-1 left-0 h-1 bg-accent/20"
                    />
                  </span>
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-base-soft md:text-xl font-sans lg:max-w-xl">
                  Move sensitive files through a calmer Web3 workflow with encrypted uploads, live anomaly scoring, and a cleaner audit trail from ingest to investigation.
                </p>
              </motion.div>

              <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {heroSignals.map(signal => (
                  <span key={signal.label} className="rounded-full border border-base-strong bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-base-muted shadow-sm">
                    {signal.label}
                  </span>
                ))}
              </motion.div>

              <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
                <button type="button" onClick={() => navigate('/app')} className="btn-primary h-12 px-8 text-sm font-bold transition-theme">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => connectWallet().catch(error => console.error('Wallet connection failed', error))} className="btn-secondary h-12 px-8 text-sm font-bold transition-theme hover:scale-[0.98] disabled:opacity-50" disabled={isConnecting || !hasWallet}>
                  <Lock className="h-4 w-4 text-base-soft" /> {hasWallet ? (isConnecting ? 'Connecting...' : 'Connect Wallet') : 'Install MetaMask'}
                </button>
              </motion.div>
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
              className="relative mx-auto w-full max-w-[420px]"
            >
              <GlassCard className="relative overflow-hidden bg-white/75 backdrop-blur-md">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-32 rounded-b-[40px] bg-[radial-gradient(circle_at_top,rgba(192,92,57,0.18),rgba(192,92,57,0))]" />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-base-soft">Live workspace</p>
                      <h3 className="mt-2 text-2xl font-serif text-base-strong">Ready for upload, review, and response</h3>
                    </div>
                    <div className="animate-drift flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {heroSignals.map((signal, index) => (
                      <motion.div
                        key={signal.label}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, delay: 0.25 + (index * 0.12), ease: 'easeOut' }}
                        className="flex items-center justify-between rounded-2xl border border-base-strong bg-white/70 px-4 py-3"
                      >
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.26em] text-base-soft">{signal.label}</p>
                          <p className="mt-1 text-sm font-medium text-base-strong">{signal.value}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="relative mt-32 w-full max-w-5xl"
        >
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-xl font-serif uppercase tracking-widest text-base-strong">How it works</h2>
            <div className="mx-auto h-px w-24 bg-accent/30" />
          </div>
          <div className="relative mx-auto flex flex-col items-center justify-between gap-16 md:flex-row md:gap-8">
            {workflowSteps.map((step, index) => {
              const imageMap = ['/workflow_upload.png', '/workflow_ai.png', '/workflow_share.png'];
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  key={step.step}
                  className="group relative z-10 flex flex-1 flex-col items-center text-center"
                >
                  <div className="relative mb-8 aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-base-strong bg-surface shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                    <img src={imageMap[index]} alt={step.title} className="h-full w-full object-cover opacity-90 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-xl font-serif text-base-strong">{step.title}</h3>
                  <div className="mt-3 font-sans text-sm text-base-soft">
                    {step.description}
                  </div>

                  {index < workflowSteps.length - 1 ? (
                    <div className="absolute left-[65%] top-[120px] hidden w-[70%] flex-1 -z-10 md:block">
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                        className="h-px w-full text-accent/30"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 1"
                      >
                        <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                      </motion.svg>
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1 }}
          className="mt-32 grid w-full max-w-5xl gap-6 md:grid-cols-3"
        >
          {productFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
            >
              <GlassCard className="flex h-full flex-col items-start border border-base-strong bg-surface p-8 text-left shadow-[0_4px_24px_rgba(28,28,24,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(192,92,57,0.06)]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent/5 text-accent">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 text-xl font-serif text-base-strong">{feature.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-base-soft">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.section>
      </main>
    </div>
  );
}

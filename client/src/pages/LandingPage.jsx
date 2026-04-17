import { useNavigate } from 'react-router-dom';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers5/react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield } from 'lucide-react';

import { productFeatures, workflowSteps } from '../data/product.js';
import { GlassCard } from '../ui/Primitives.jsx';

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected } = useWeb3ModalAccount();

  const handleEnter = () => {
    if (isConnected) {
      navigate('/app');
    } else {
      open();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden app-shell flex flex-col font-sans">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-8 md:px-12 relative z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-base-strong bg-white/20 shadow-sm">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-base-strong">DataFort AI</h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button type="button" onClick={() => open()} className="text-sm font-bold text-base-strong transition-colors hover:text-terracotta">
            Connect Wallet
          </button>
          <button type="button" onClick={handleEnter} className="btn-primary px-6 py-2.5 text-sm font-bold transition-theme">
            Get Started
          </button>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-[1440px] px-6 pb-20 pt-16 md:px-12 lg:pb-32 lg:pt-24 flex flex-col items-center text-center">
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }} 
          className="relative z-10 max-w-3xl space-y-10 flex flex-col items-center"
        >
          
          <motion.div variants={fade} className="inline-flex items-center gap-2 border-b border-accent pb-1 text-xs font-semibold tracking-widest uppercase text-accent">
            Military-grade data protection
          </motion.div>

          <motion.div variants={fade} className="space-y-8">
            <h2 className="text-5xl font-serif leading-[1.1] md:text-7xl text-base-strong">
              Your files.<br/>
              Your chain.<br/>
              <span className="text-accent italic relative inline-block">
                Your control.
                <motion.span 
                  initial={{ width: 0 }} 
                  animate={{ width: '100%' }} 
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 h-1 bg-accent/20"
                />
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-base-soft md:text-xl font-sans">
              The minimalist Web3 vault for encrypted file transfer, AI threat monitoring, and immutable auditability. Stress-free security for the decentralized web.
            </p>
          </motion.div>

          <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button type="button" onClick={() => navigate('/app')} className="btn-primary h-12 px-8 text-sm font-bold transition-theme">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => open()} className="btn-secondary h-12 px-8 text-sm font-bold transition-theme hover:scale-[0.98]">
              <Lock className="h-4 w-4 text-base-soft" /> Connect Wallet
            </button>
          </motion.div>
        </motion.section>

        {/* Visual Workflow Section */}
        <motion.section 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }} 
          className="relative mt-32 w-full max-w-5xl"
        >
          <div className="text-center mb-16">
            <h2 className="text-xl font-serif text-base-strong uppercase tracking-widest mb-4">How it works</h2>
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
                  className="relative z-10 flex flex-1 flex-col items-center text-center group"
                >
                  <div className="relative w-full aspect-square max-w-[240px] mb-8 overflow-hidden rounded-xl border border-base-strong bg-surface transition-transform duration-500 group-hover:scale-[1.02] shadow-sm">
                    <img src={imageMap[index]} alt={step.title} className="w-full h-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100 mix-blend-multiply" />
                  </div>
                  <h3 className="text-xl font-serif text-base-strong">{step.title}</h3>
                  <div className="mt-3 font-sans text-sm text-base-soft">
                    {step.description}
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden absolute top-[120px] left-[65%] w-[70%] flex-1 md:block -z-10">
                      <motion.svg 
                        initial={{ pathLength: 0 }} 
                        whileInView={{ pathLength: 1 }} 
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                        className="w-full h-px text-accent/30" preserveAspectRatio="none" viewBox="0 0 100 1"
                      >
                        <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                      </motion.svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Minimal Feature Cards */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }} 
          className="mt-32 grid gap-6 w-full max-w-5xl md:grid-cols-3"
        >
          {productFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
            >
              <GlassCard className="flex h-full flex-col items-start text-left hover:-translate-y-1 transition-all duration-500 p-8 border border-base-strong bg-surface shadow-[0_4px_24px_rgba(28,28,24,0.02)] hover:shadow-[0_8px_32px_rgba(192,92,57,0.06)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent/5 text-accent mb-6">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-serif text-base-strong mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-base-soft font-sans">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.section>
      </main>
    </div>
  );
}

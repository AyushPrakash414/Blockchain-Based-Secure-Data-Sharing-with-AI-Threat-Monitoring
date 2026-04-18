import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ethers } from 'ethers';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import { roleOptions } from '../data/product.js';
import { contractAbi, contractAddress } from '../utils/constants.js';
import { logEvent } from '../utils/logger.js';

const ROLE_STORAGE_KEY = 'datafort-role';
const LEGACY_ROLE_STORAGE_KEY = 'sentinel-role';
const DEFAULT_ROLE = 'admin';

function resolveStoredRole() {
  const allowedRoles = new Set(roleOptions.map(option => option.value));
  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) || window.localStorage.getItem(LEGACY_ROLE_STORAGE_KEY) || DEFAULT_ROLE;
  return allowedRoles.has(storedRole) ? storedRole : DEFAULT_ROLE;
}

export default function AppFrame() {
  const location = useLocation();
  const { account: walletAccount, isConnected, provider } = useWallet();

  const [contract, setContract] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = window.localStorage.getItem('datafort-sidebar-collapsed');
    return saved ? saved === 'true' : true;
  });
  const [role, setRole] = useState(resolveStoredRole);

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  }, [role]);

  useEffect(() => {
    window.localStorage.setItem('datafort-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!isConnected || !provider || !walletAccount) {
      setContract(null);
      return;
    }

    let stale = false;

    const setup = async () => {
      try {
        const signer = provider.getSigner();
        const nextAccount = await signer.getAddress();

        if (stale) return;

        setContract(new ethers.Contract(contractAddress, contractAbi, signer));

        logEvent({ wallet: nextAccount, action: 'WALLET_CONNECTED', result: 'success' });
      } catch (error) {
        console.error('Wallet setup failed', error);
      }
    };

    setup();

    return () => {
      stale = true;
    };
  }, [walletAccount, isConnected, provider]);

  const contextValue = useMemo(() => ({ account: walletAccount, provider, contract, role, setRole }), [walletAccount, provider, contract, role]);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none" />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(current => !current)} role={role} account={walletAccount} />

      <div className={`dashboard-pane relative z-10 ${collapsed ? 'lg:pl-[var(--sidebar-collapsed)]' : 'lg:pl-[var(--sidebar-width)]'}`}>
        <Topbar account={walletAccount} role={role} setRole={setRole} isConnected={isConnected} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 md:px-6 lg:pb-12"
          >
            <Outlet context={contextValue} />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

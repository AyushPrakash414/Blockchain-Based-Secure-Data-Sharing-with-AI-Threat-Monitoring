import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import { contractAbi, contractAddress } from '../utils/constants.js';
import { logEvent } from '../utils/logger.js';

export default function AppFrame() {
  const { account: walletAccount, isConnected, provider } = useWallet();

  const [contract, setContract] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState(() => window.localStorage.getItem('sentinel-role') || 'analyst');

  useEffect(() => {
    window.localStorage.setItem('sentinel-role', role);
  }, [role]);

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

      <div className="relative z-10 lg:pl-[var(--sidebar-width)]">
        <Topbar account={walletAccount} role={role} setRole={setRole} isConnected={isConnected} />

        <main className={`mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 md:px-6 lg:pb-12 ${collapsed ? 'lg:pl-[calc(var(--sidebar-collapsed)-var(--sidebar-width))]' : ''}`}>
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}

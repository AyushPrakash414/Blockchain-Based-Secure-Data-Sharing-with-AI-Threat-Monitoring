import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Outlet } from 'react-router-dom';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { contractAbi, contractAddress } from '../utils/constants.js';
import { logEvent } from '../utils/logger.js';

export default function AppFrame() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState(() => window.localStorage.getItem('sentinel-role') || 'analyst');

  useEffect(() => {
    window.localStorage.setItem('sentinel-role', role);
  }, [role]);

  useEffect(() => {
    if (!isConnected || !walletProvider || !address) {
      setAccount('');
      setProvider(null);
      setContract(null);
      return;
    }

    let stale = false;

    const setup = async () => {
      try {
        if (typeof window === "undefined" || !walletProvider) return;
        
        const web3Provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = web3Provider.getSigner();
        const nextAccount = await signer.getAddress();

        if (stale) return;

        setAccount(nextAccount);
        setProvider(web3Provider);
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
  }, [address, isConnected, walletProvider]);

  const contextValue = useMemo(() => ({ account, provider, contract, role, setRole }), [account, provider, contract, role]);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none" />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(current => !current)} role={role} account={account} />

      <div className="relative z-10 lg:pl-[var(--sidebar-width)]">
        <Topbar account={account} role={role} setRole={setRole} isConnected={isConnected} />

        <main className={`mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 md:px-6 lg:pb-12 ${collapsed ? 'lg:pl-[calc(var(--sidebar-collapsed)-var(--sidebar-width))]' : ''}`}>
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../utils/constants';
import { logEvent } from '../utils/logger';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AlertToast from './security/AlertToast';

export default function AppShell() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Wallet connection — single source of truth for entire app
  useEffect(() => {
    if (!window.ethereum) return;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      try {
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', () => window.location.reload());

        await web3Provider.send('eth_requestAccounts', []);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();

        setAccount(address);
        setProvider(web3Provider);
        setContract(new ethers.Contract(contractAddress, contractAbi, signer));

        logEvent({ wallet: address, action: 'WALLET_CONNECTED', result: 'success' });
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    };

    loadProvider();
  }, []);

  const sidebarPx = sidebarCollapsed ? 72 : 260;
  const contentMargin = isDesktop ? sidebarPx : 0;

  return (
    <div className="min-h-screen bg-primary text-primary">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Desktop fixed topbar — offset by sidebar */}
      {isDesktop && (
        <div className="fixed top-0 right-0 z-30 transition-all duration-300" style={{ left: sidebarPx }}>
          <Topbar account={account} />
        </div>
      )}

      {/* Mobile topbar — normal flow */}
      {!isDesktop && <Topbar account={account} />}

      {/* Main content */}
      <main
        className="min-h-[calc(100vh-4rem)] px-4 lg:px-8 py-6 pb-24 lg:pb-8 transition-all duration-300"
        style={{ marginLeft: contentMargin, paddingTop: isDesktop ? 88 : 24 }}
      >
        <Outlet context={{ account, contract, provider }} />
      </main>

      <AlertToast />
    </div>
  );
}

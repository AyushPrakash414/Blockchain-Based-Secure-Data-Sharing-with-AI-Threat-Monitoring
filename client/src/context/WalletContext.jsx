import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

function getEthereum() {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const syncWallet = async () => {
    const ethereum = getEthereum();

    if (!ethereum) {
      setAccount('');
      setProvider(null);
      return;
    }

    const web3Provider = new ethers.providers.Web3Provider(ethereum);
    const accounts = await web3Provider.listAccounts();

    setProvider(web3Provider);
    setAccount(accounts[0] ?? '');
  };

  useEffect(() => {
    syncWallet().catch(error => {
      console.error('Wallet sync failed', error);
    });

    const ethereum = getEthereum();
    if (!ethereum) return undefined;

    const handleAccountsChanged = accounts => {
      setAccount(accounts[0] ?? '');
      setProvider(accounts.length ? new ethers.providers.Web3Provider(ethereum) : null);
    };

    const handleChainChanged = () => {
      syncWallet().catch(error => {
        console.error('Wallet chain refresh failed', error);
      });
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask is not installed.');
    }

    setIsConnecting(true);

    try {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        if (switchError?.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
        } else if (switchError?.code !== 4001) {
          throw switchError;
        }
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(ethereum);

      setProvider(web3Provider);
      setAccount(accounts?.[0] ?? '');
      return accounts?.[0] ?? '';
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setProvider(null);
  };

  const value = useMemo(() => ({
    account,
    provider,
    isConnected: Boolean(account),
    isConnecting,
    connectWallet,
    disconnectWallet,
    hasWallet: Boolean(getEthereum()),
  }), [account, provider, isConnecting]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider.');
  }

  return context;
}

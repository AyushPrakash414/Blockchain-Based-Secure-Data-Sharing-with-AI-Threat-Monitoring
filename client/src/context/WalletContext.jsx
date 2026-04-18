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

async function ensureSepolia(ethereum) {
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
      return;
    }

    if (switchError?.code !== 4001) {
      throw switchError;
    }
  }
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

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

    const handleAccountsChanged = (accounts) => {
      const nextAccount = accounts[0] ?? '';
      setAccount(nextAccount);
      if (ethereum && nextAccount) {
        setProvider(new ethers.providers.Web3Provider(ethereum));
      } else {
        setProvider(null);
      }
    };

    const handleChainChanged = () => {
      // Refresh the page on chain change as recommended by MetaMask
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask is not installed.');
    }

    setIsConnecting(true);

    try {
      await ensureSepolia(ethereum);

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(ethereum);

      setProvider(web3Provider);
      setAccount(accounts?.[0] ?? '');
      return accounts?.[0] ?? '';
    } finally {
      setIsConnecting(false);
    }
  };

  const switchAccount = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask is not installed.');
    }

    setIsSwitchingAccount(true);

    try {
      try {
        await ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permissionError) {
        if (permissionError?.code === 4001) {
          throw permissionError;
        }

        if (permissionError?.code !== -32601) {
          throw permissionError;
        }
      }

      await ensureSepolia(ethereum);

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(ethereum);

      setProvider(web3Provider);
      setAccount(accounts?.[0] ?? '');
      return accounts?.[0] ?? '';
    } finally {
      setIsSwitchingAccount(false);
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
    isSwitchingAccount,
    connectWallet,
    switchAccount,
    disconnectWallet,
    hasWallet: Boolean(getEthereum()),
  }), [account, provider, isConnecting, isSwitchingAccount]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider.');
  }

  return context;
}

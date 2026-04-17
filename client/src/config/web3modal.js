import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8641a06561322f0a6cd6743632e2f6e7';

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org',
};

const metadata = {
  name: 'Sentinel Drive',
  description: 'Blockchain-secured file storage with AI threat monitoring',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5050',
  icons: ['/icon-512.png'],
};

export function initWallet() {
  try {
    createWeb3Modal({
      ethersConfig: defaultConfig({ metadata }),
      chains: [sepolia],
      projectId,
      enableAnalytics: false,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#34d399',
        '--w3m-border-radius-master': '2px',
      },
    });
  } catch (error) {
    console.error("Wallet init failed:", error);
  }
}

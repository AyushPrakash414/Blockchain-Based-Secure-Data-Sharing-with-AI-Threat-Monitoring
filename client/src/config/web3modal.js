import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';

const projectId = 'd572964914cb01516b3de3cffcf465fb';

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

# Blockchain-Based Secure Data Sharing 🔗

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Solidity](https://img.shields.io/badge/Solidity-0.8.x-lightgrey?logo=solidity)
![IPFS](https://img.shields.io/badge/IPFS-Pinata-yellow?logo=ipfs)

A decentralized, highly secure platform for storing and sharing files leveraging **Ethereum** and **IPFS**. This application allows users to upload documents to the IPFS network, anchor the proofs on the Ethereum blockchain, and manage permissioned access directly using smart contracts.

---

## 🚀 Features

- **Web3 Authentication:** Secure login & session management using your MetaMask wallet.
- **Decentralized Storage:** Files are continuously pinned to the IPFS network via Pinata, ensuring zero-knowledge persistence and true decentralization.
- **On-Chain Access Control:** File CIDs are stored on smart contracts. Users can grant or revoke file access to other Ethereum wallets transparently via blockchain transactions.
- **My Files & Shared With Me Navigation:** Easily distinct separated vaults showing what you own and what external users have permitted you to view.

---

## 🏗️ Architecture & Workflow

The platform comprises two major interconnected modules:

### 1. Smart Contracts (Solidity + Hardhat)
Handles the core business logic of data anchoring and access controls on the blockchain.
- `add()`: Stores the IPFS Gateway URL tied specifically to the user's wallet address.
- `allow()` / `disallow()`: Granular permission granting and revoking to other designated wallet addresses.
- `display()`: Returns authorized files by verifying on-chain ownership mappings and approved access lists.

### 2. Frontend App (React + Vite + Tailwind CSS)
Delivers a premium, dark-mode native interface for user interaction.
- Prompts the user to connect their MetaMask wallet.
- Direct integration with Pinata SDK to encrypt and upload files right from the browser interface.
- Initiates smart contract transactions securely using `ethers.js`.

---

## 💻 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Ethers.js, Lucide-React |
| **Smart Contracts** | Solidity, Hardhat, Alchemy |
| **Storage & Infrastructure** | IPFS (Pinata Node Provider), Ethereum Sepolia Testnet |

---

## ⚙️ Local Setup Guide

Follow these steps to get the environment running on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/SarvagyaGupta-19/Blockchain-Based-Secure-Data-Sharing-with-AI-Threat-Monitoring.git
cd Blockchain-Based-Secure-Data-Sharing-with-AI-Threat-Monitoring
```

### 2. Smart Contract Initialization
Ensure you have an Alchemy URL and your wallet private key for deployment.
```bash
cd smart_contract
npm install
# Deploy the contract -> Copy the returned deployed address
npx hardhat run scripts/deploy.js --network sepolia 
```

### 3. Frontend Implementation
```bash
cd client
npm install
```
*Create a `.env` file or update `client/src/utils/constants.js` with your specific variables:*
- `contractAddress` (from step 2 deployed contract)
- `Pinata API Key` and `Pinata API Secret`

Start the frontend server:
```bash
npm run dev
```

---

## 🔒 Security Best Practices Implemented

1. **Transaction Security**: All file sharing states are securely managed purely by Ethereum consensus, ensuring file tracking remains tamper-proof and robust.
2. **Decentralized Access Limits**: Even if the front end is disrupted, documents stored on IPFS remain strictly locked by the smart contract's `require` condition: `require(_user==msg.sender || ownership[_user][msg.sender])`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License.

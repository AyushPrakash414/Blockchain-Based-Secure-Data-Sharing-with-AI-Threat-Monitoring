# 🛡️ DataFort AI: Secure Web3 Drive with AI Threat Monitoring
### Developed by Team Viterbee

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Blockchain-Solidity%200.8-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![IPFS](https://img.shields.io/badge/Storage-IPFS%2FPinata-65C2CB?logo=ipfs&logoColor=white)](https://ipfs.tech/)

**DataFort AI** is a next-generation decentralized storage platform that harmonizes the immutability of Blockchain with the proactive intelligence of AI. It provides a secure, permissioned environment for sensitive data sharing while maintaining a real-time "Security Operations Center" (SOC) to detect and mitigate anomalous wallet activities.

---

## 🏗️ System Architecture

DataFort AI utilizes a multi-layered architecture to ensure data integrity, privacy, and real-time responsiveness.

```mermaid
graph TD
    User((User)) -->|Connect Wallet| Frontend[React + Vite Dashboard]
    Frontend -->|Upload/Encrypt| IPFS[IPFS Storage via Pinata]
    Frontend -->|Anchor CID| BC[Ethereum Sepolia Smart Contract]
    
    subgraph "AI Security Layer"
        Backend[FastAPI Security Service] -->|Isolation Forest ML| Analyzer[Threat Analyzer]
        Analyzer -->|Anomaly Detected| Supabase[(Supabase Real-time DB)]
        Supabase -->|Push Notification| Frontend
    end
    
    BC -->|Metadata/Permissions| Frontend
    IPFS -->|Encrypted Payload| User
```

---

## 🔄 Core Workflow

The lifecycle of a file in DataFort AI is protected by dual verification: On-chain permissions and AI-driven behavior monitoring.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Smart Contract
    participant I as IPFS (Pinata)
    participant A as AI Security Service
    
    U->>F: Upload File (Encryption happens locally)
    F->>I: Store Encrypted Blob
    I-->>F: Return CID
    F->>S: anchor(CID, Permissions)
    Note over S: Record immutable proof of ownership
    
    loop Real-time Monitoring
        A->>S: Monitor Wallet Activity
        A->>A: Run Anomaly Scoring (ML)
        A-->>F: Push Threat Alert (via Supabase)
    end
    
    U->>F: Request File Access
    F->>S: verifyPermission(msg.sender)
    S-->>F: Success
    F->>I: Retrieve Blob
    F->>U: Decrypt & Display
```

---

## ✨ Key Features

- **Decentralized Integrity**: Files are stored on IPFS and anchored to the Ethereum Sepolia testnet, ensuring no single point of failure.
- **AI Threat Monitoring**: A custom-built ML pipeline uses **Isolation Forest** algorithms to detect unusual wallet interactions and brute-force attempts.
- **SOC Dashboard**: A professional-grade monitoring interface with real-time risk charts, event sequence tracking, and instant alerts.
- **Smart Access Control**: Granular `allow` and `disallow` logic handled natively by Solidity smart contracts.
- **Zero-Knowledge Privacy**: Data is encrypted before leaving the client's browser, ensuring that even node providers cannot view raw contents.

---

## 💻 Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind CSS, Framer Motion | Premium Responsive UI & UX |
| **Web3** | Ethers.js, Web3Modal, WalletConnect | Wallet orchestration & Chain interaction |
| **Backend** | FastAPI, Python | AI Security Service & API Gateway |
| **Machine Learning** | Scikit-learn (Isolation Forest) | Anomaly detection & behavior scoring |
| **Blockchain** | Solidity, Hardhat | On-chain metadata and permissions |
| **Real-time** | Supabase | Live threat telemetry and alerts |
| **Storage** | IPFS (Pinata) | Scalable decentralized file storage |

---

## ⚙️ Quick Start

### 1. Requirements
- Node.js v16+
- Python 3.9+
- MetaMask Extension
- Supabase Project & URL

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Variables: Update `client/src/utils/constants.js` with your Deployed Contract Address.*

### 3. Backend (AI Service) Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

### 4. Smart Contract
```bash
cd smart_contract
npm install
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🛡️ Security
DataFort AI is designed for maximum transparency and security. Threat alerts are delivered via a custom-implemented **Notification Bell** system that tracks event sequences to provide clear attack vectors to the end-user.

---

## 🤝 Team Viterbee
Built with passion for the future of secure, intelligent Web3 storage.

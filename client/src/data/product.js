import { Blocks, Brain, Database, FileUp, FolderLock, Shield, ShieldAlert } from 'lucide-react';

export const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Threat monitoring, review, and vault operations in one workspace' },
  { value: 'client', label: 'Client', description: 'Upload, share, and inspect vault activity' },
];

export const roleNavigation = {
  admin: [
    { to: '/app', label: 'Upload', icon: FileUp },
    { to: '/app/files', label: 'My Files', icon: FolderLock },
    { to: '/app/monitor', label: 'Monitor', icon: ShieldAlert },
  ],
  client: [
    { to: '/app', label: 'Upload', icon: FileUp },
    { to: '/app/files', label: 'My Files', icon: FolderLock },
    { to: '/app/monitor', label: 'Monitor', icon: ShieldAlert },
  ],
};

export const productFeatures = [
  {
    icon: Shield,
    title: 'Blockchain Integrity',
    description: 'Immutable provenance stored directly on-chain.',
  },
  {
    icon: Database,
    title: 'IPFS Storage',
    description: 'Decentralized and encrypted file availability.',
  },
  {
    icon: Brain,
    title: 'AI Protection',
    description: 'Real-time threat monitoring and anomaly scoring.',
  },
];

export const workflowSteps = [
  {
    step: '1',
    title: 'Upload & Encrypt',
    description: 'Select a file, encrypt the payload, and prepare it for secure decentralized storage.',
    icon: FileUp,
  },
  {
    step: '2',
    title: 'Anchor to Chain',
    description: 'Pin the asset to IPFS and sign the on-chain confirmation with your connected wallet.',
    icon: Blocks,
  },
  {
    step: '3',
    title: 'AI Threat Monitor',
    description: 'Track wallet activity, review elevated risk signals, and respond from a single dashboard.',
    icon: Brain,
  },
];

export const severityOrder = ['critical', 'high', 'medium', 'low'];

import {
  Activity,
  Archive,
  ArrowUpRight,
  Blocks,
  Brain,
  Database,
  FileUp,
  FolderLock,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  Share2,
  Sparkles,
  Table2,
  Users,
  Waves,
} from 'lucide-react';

export const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full visibility across blockchain, AI, and operations' },
  { value: 'analyst', label: 'Analyst', description: 'Threat hunting and alert triage workflows' },
  { value: 'client', label: 'Client', description: 'Upload, share, and inspect vault activity' },
];

export const roleNavigation = {
  admin: [
    { to: '/app', label: 'Upload', icon: FileUp },
    { to: '/app/files', label: 'My Files', icon: FolderLock },
    { to: '/app/monitor', label: 'Monitor', icon: ShieldAlert },
  ],
  analyst: [
    { to: '/app', label: 'Upload', icon: FileUp },
    { to: '/app/files', label: 'My Files', icon: FolderLock },
    { to: '/app/monitor', label: 'Monitor', icon: ShieldAlert },
  ],
  client: [
    { to: '/app', label: 'Upload', icon: FileUp },
    { to: '/app/files', label: 'My Files', icon: FolderLock },
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
    icon: FileUp
  },
  {
    step: '2',
    title: 'Anchor to Chain',
    icon: Blocks
  },
  {
    step: '3',
    title: 'AI Threat Monitor',
    icon: Brain
  },
];

export const severityOrder = ['critical', 'high', 'medium', 'low'];
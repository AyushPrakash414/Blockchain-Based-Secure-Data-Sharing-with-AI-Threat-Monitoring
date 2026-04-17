import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5050,
  },

  plugins: [
    react(),
    nodePolyfills(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icon-512.png'],
      manifest: {
        name: 'Sentinel Drive — Blockchain Secured Storage',
        short_name: 'Sentinel Drive',
        description: 'Blockchain-secured file storage with AI-powered threat monitoring on Ethereum & IPFS',
        theme_color: '#0c0d10',
        background_color: '#0c0d10',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      ethers5: 'ethers',
    },
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          const normalized = id.replace(/\\/g, '/');

          if (normalized.includes('@web3modal/scaffold-ui')) return 'vendor-web3modal-scaffold-ui';
          if (normalized.includes('@web3modal/ui')) return 'vendor-web3modal-ui';
          if (normalized.includes('@web3modal/scaffold') || normalized.includes('@web3modal/core') || normalized.includes('@web3modal/common') || normalized.includes('@web3modal/siwe')) {
            return 'vendor-web3modal-core';
          }
          if (normalized.includes('@walletconnect') || normalized.includes('@coinbase/wallet-sdk')) return 'vendor-walletconnect';
          if (normalized.includes('node_modules/ethers/') || normalized.includes('@ethersproject')) return 'vendor-ethers';

          if (normalized.includes('react-router-dom') || normalized.includes('@remix-run/router')) return 'vendor-router';
          if (normalized.includes('node_modules/react/') || normalized.includes('node_modules/react-dom/') || normalized.includes('node_modules/scheduler/')) return 'vendor-react';
          if (normalized.includes('framer-motion') || normalized.includes('motion-dom') || normalized.includes('motion-utils')) return 'vendor-motion';
          if (normalized.includes('@supabase/')) return 'vendor-supabase';
          if (normalized.includes('lucide-react')) return 'vendor-icons';

          return 'vendor-misc';
        },
      },
    },
  },

  define: {
    global: 'globalThis',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5050,
  },
  plugins: [react()],
  resolve: {
    alias: {
      ethers5: 'ethers',
    },
  },
  build: {
    sourcemap: false,
  },
})

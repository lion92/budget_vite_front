import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts (lourd, chargé uniquement sur la page Analytics)
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          // Table
          'vendor-table': ['@tanstack/react-table'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/client-portal/',
  server: {
    host: true,
    port: 5173,
    origin: 'http://localhost:5000',
    strictPort: true,
    proxy: {
      // ✅ CORRECTED: Also needs to target the 'server' service
      '/api': {
        target: 'http://server:5001',
        changeOrigin: true,
      },
    },
  },
});
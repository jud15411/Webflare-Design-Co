// File: apps/portal/vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/client-portal/', // Set the base path to match the Nginx/Netlify location
  server: {
    port: 5174, // ⬅️ Use a different port than the Admin Panel (5173) to avoid conflicts
    proxy: {
      // ⬅️ Proxy API requests to the Nginx container (port 5000 from host perspective)
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
      },
    },
  },
});
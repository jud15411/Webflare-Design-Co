import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/firmaplex-admin-panel/',
  server: {
    host: true,
    port: 5173,
    // Explicitly set the origin for development
    origin: 'http://localhost:5000',
    // Ensure Vite handles the base path correctly
    strictPort: true,
  },
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});

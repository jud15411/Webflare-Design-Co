import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // String shorthand for all requests starting with /api
      '/api': {
        target: 'http://localhost:5001', // Your backend server address
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This tells Vite that the app will be served from the /portal/ subdirectory
  base: '/portal/',
  server: {
    host: true, // Allows the server to be accessible from outside the container
    port: 5173,
    // This setting can help with file change detection in Docker
    watch: {
      usePolling: true,
    },
  },
});

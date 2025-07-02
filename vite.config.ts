import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  // Load env file based on mode (development, production)
  // This will load .env, .env.local, .env.[mode], .env.[mode].local
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Example: '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Expose environment variables to client code
      // VITE_GEMINI_API_KEY will be available as import.meta.env.VITE_GEMINI_API_KEY
      // No need to define process.env here if using import.meta.env
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Generate source maps except for production
    },
    server: {
      port: 3000,
    },
  };
});

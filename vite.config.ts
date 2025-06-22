import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copy } from 'vite-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: 'assets' // copies to dist/assets/pdf.worker.min.mjs
        }
      ],
      hook: 'writeBundle' // Run after the bundle is written
    })
  ],
  server: {
    port: 3000, 
  },
  build: {
    outDir: 'dist',
  }
})
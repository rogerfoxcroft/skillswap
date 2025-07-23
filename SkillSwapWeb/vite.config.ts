import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for custom domain
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})
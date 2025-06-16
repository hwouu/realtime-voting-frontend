import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    __PWA__: false,
  },
  optimizeDeps: {
    include: ['tailwindcss'],
  },
})

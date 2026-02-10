import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '::',
    port: 3003,
    strictPort: true,
    proxy: {
      '/fonts': {
        target: 'https://signin-alpha.globalwebindex.com',
        changeOrigin: true,
      },
    },
  },
})

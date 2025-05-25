import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/iss-now/v1/': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
      }
    },
    host: '0.0.0.0'
  }
})

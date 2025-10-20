import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // We no longer need the 'build.rollupOptions'
  // Vite will now default to 'index.html' as the only entry point.

  // This 'server' section is for DEVELOPMENT (npm run dev)
  // It tells your React dev server to send API calls to Flask
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000', 
      '/auth': 'http://127.0.0.1:5000'
    }
  }
})
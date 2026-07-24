import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built site works when hosted from any sub-path (e.g. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})

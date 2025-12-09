import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative base for flexibility in deployment
  publicDir: 'public', // Explicitly set public directory for static assets
  plugins: [react()],
  resolve: {
    alias: {
      // FASD Structure Aliases
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/features": path.resolve(__dirname, "./src/features"),
      // Legacy aliases (for gradual migration)
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

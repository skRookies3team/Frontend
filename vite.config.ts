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
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // API Gateway 주소
        changeOrigin: true,
        secure: false,
        // 만약 백엔드 경로가 /api로 시작하지 않는다면 rewrite 필요하지만,
        // Petlog 명세상 /api로 시작하므로 rewrite 불필요
      },
      '/ws-chat': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/s3-images': {
        target: 'https://petlog-images-bucket.s3.ap-northeast-2.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3-images/, ''),
        secure: false,
      },
    },
  },
})
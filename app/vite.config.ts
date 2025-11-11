import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";
const isDocker = process.env.DOCKER === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: isDocker ? '0.0.0.0' : 'localhost',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `
      } as any
    }
  },

})

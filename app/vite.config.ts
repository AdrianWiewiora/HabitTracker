import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
const isDocker = process.env.DOCKER === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: isDocker ? '0.0.0.0' : 'localhost',
    port: 5173,
  },
})

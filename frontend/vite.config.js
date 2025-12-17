import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite conexiones desde la red (IP)
    port: 5173  // Aseguramos el puerto
  }
})

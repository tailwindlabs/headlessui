import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: { port: 3000 },
  plugins: [react(), vue()],
})

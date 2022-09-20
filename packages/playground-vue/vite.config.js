import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: { port: 3000 },
  plugins: [react(), vue()],
  resolve: {
    alias: [{ find: '@/', replacement: path.join(__dirname, 'src/') }],
  },
})

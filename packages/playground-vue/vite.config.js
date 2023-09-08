import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: { port: 3000 },
  define: {
    __VUE_PROD_DEVTOOLS__: true,
  },
  plugins: [vue()],
})

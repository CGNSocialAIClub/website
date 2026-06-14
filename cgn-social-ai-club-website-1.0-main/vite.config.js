import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/website/', // Project page
  // base: '/',  // User/org page
  plugins: [
    react(),
    tailwindcss(),
  ],
})

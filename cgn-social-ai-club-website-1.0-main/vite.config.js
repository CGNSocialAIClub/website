import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Cloudflare Workers serves the site from the domain root
  plugins: [
    react(),
    tailwindcss(),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Per GitHub Pages: cambia 'kebab-restaurant' con il nome del tuo repository
  base: '/kebab-restaurant/',
})

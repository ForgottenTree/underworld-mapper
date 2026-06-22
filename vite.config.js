import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  base: 'https://github.com/ForgottenTree/underworld-mapper',
  plugins: [react(),tailwindcss()],
})

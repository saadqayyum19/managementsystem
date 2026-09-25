import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Guard against duplicate React copies (e.g. hoisted dependencies resolving their own react).
  resolve: { dedupe: ['react', 'react-dom'] },
})

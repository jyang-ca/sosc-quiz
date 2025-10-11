import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment:
  // If deploying to https://<USERNAME>.github.io/<REPO>/, set base to '/<REPO>/'
  // If deploying to https://<USERNAME>.github.io/, set base to '/'
  base: './',
})

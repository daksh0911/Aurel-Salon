import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Builds the static site into the project web/ directory served by Express.
export default defineConfig({
  plugins: [react()], base: './',
  build: { outDir: 'web', emptyOutDir: true },
  server: { proxy: { '/api': 'http://localhost:5000' } },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Builds only the assistant island — the rest of the app stays a
   zero-build vanilla site. Output lands in assistant/ at the repo
   root (gitignored) so the static dev server picks it up too. */
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'assistant',
    emptyOutDir: true,
    lib: {
      entry: 'src/assistant/main.jsx',
      name: 'FwiendsAssistant',
      formats: ['iife'],
      fileName: () => 'assistant.js',
    },
    rollupOptions: {
      output: { assetFileNames: 'assistant.[ext]' },
    },
  },
});

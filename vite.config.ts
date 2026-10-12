import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://ops-09.github.io/Prototypes/
// Local `npm run dev` keeps base `/` so localhost works at the root.
declare const process: { env: Record<string, string | undefined> };
const base = process.env.GITHUB_ACTIONS === 'true' ? '/Prototypes/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: ['node_modules'],
      },
    },
  },
});

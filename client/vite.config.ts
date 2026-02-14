import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';

  return {
    plugins: [react()],
    // GitHub Pages deploys to /unity-pulse/ subpath
    base: isGitHubPages ? '/unity-pulse/' : '/',
    server: {
      port: 3000,
      host: '127.0.0.1',
      strictPort: true,
      // Proxy API requests to the backend during development
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true,
        },
      },
    },
  };
});

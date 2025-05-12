import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [tailwind()],
  vite: {
    build: {
      target: 'es2022'
    },
    server: {
      hmr: {
        timeout: 300000
      },
      fs: {
        strict: false,
        allow: ['.', 'node_modules']
      },
      watch: {
        usePolling: true,
        interval: 1000
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022'
      },
      force: true,
      exclude: [],
      include: []
    },
    clearScreen: false,
    cacheDir: '.vite'
  }
});
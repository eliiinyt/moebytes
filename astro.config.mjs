// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://moebytes.org',
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false,
  },
  vite: {
    ssr: {
      external: ["bun:sqlite"]
    }
  },
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});

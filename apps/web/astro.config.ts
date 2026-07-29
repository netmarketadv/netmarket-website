import { defineConfig } from 'astro/config';

const site = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  srcDir: './src',
  build: {
    assets: 'assets'
  },
  vite: {
    envPrefix: ['PUBLIC_', 'CMS_']
  }
});

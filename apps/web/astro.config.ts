import { defineConfig } from 'astro/config';
import { headingItalicOIntegration } from './src/lib/typography/heading-italic-o-integration';

const site = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [headingItalicOIntegration()],
  srcDir: './src',
  build: {
    assets: 'assets'
  },
  vite: {
    envPrefix: ['PUBLIC_', 'CMS_']
  }
});

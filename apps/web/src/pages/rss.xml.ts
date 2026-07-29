import rss from '@astrojs/rss';
import { getPublicEnv } from '@/lib/env';

export async function GET() {
  const env = getPublicEnv();
  return rss({
    title: 'Netmarket',
    description: 'Aggiornamenti Netmarket',
    site: env.PUBLIC_SITE_URL,
    items: []
  });
}

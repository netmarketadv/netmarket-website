import { getPublicEnv } from '@/lib/env';

export function GET() {
  const env = getPublicEnv();
  const body =
    env.PUBLIC_DEPLOY_ENV === 'production'
      ? `User-agent: *\nAllow: /\nSitemap: ${env.PUBLIC_SITE_URL}/sitemap-index.xml\n`
      : 'User-agent: *\nDisallow: /\n';

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

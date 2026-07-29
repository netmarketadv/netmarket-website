import { getPublicEnv } from '@/lib/env';

export function GET() {
  const env = getPublicEnv();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${env.PUBLIC_SITE_URL}/</loc></url>\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

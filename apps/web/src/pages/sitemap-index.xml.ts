import { getPublicEnv } from '@/lib/env';
import { getProjectArchiveData, projectPath } from '@/lib/projects/content';
import { getServiceArchiveData, servicePath } from '@/lib/services/content';

export async function GET() {
  const env = getPublicEnv();
  const [{ projects }, { services }] = await Promise.all([
    getProjectArchiveData(),
    getServiceArchiveData()
  ]);
  const paths = [
    '/',
    '/servizi/',
    ...services.filter((service) => !service.seo.noindex).map((service) => servicePath(service.slug)),
    '/progetti/',
    ...projects.filter((project) => !project.seo.noindex).map((project) => projectPath(project.slug))
  ];
  const urls = [...new Set(paths)].map(
    (path) => `  <url><loc>${new URL(path, env.PUBLIC_SITE_URL).toString()}</loc></url>`
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

import rss from '@astrojs/rss';
import { getPublicEnv } from '@/lib/env';
import { getInsightArchiveData, insightDescription, insightPath } from '@/lib/insights/content';

export async function GET() {
  const env = getPublicEnv();
  const { insights } = await getInsightArchiveData();
  return rss({
    title: 'Netmarket',
    description: 'Insight, guide e aggiornamenti Netmarket su web, marketing e comunicazione.',
    site: env.PUBLIC_SITE_URL,
    items: insights
      .filter((insight) => !insight.seo.noindex)
      .slice(0, 20)
      .map((insight) => ({
        title: insight.title,
        description: insightDescription(insight),
        link: insightPath(insight.slug),
        pubDate: insight.publishedAt ? new Date(insight.publishedAt) : undefined
      }))
  });
}

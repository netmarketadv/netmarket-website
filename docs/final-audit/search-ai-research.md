# Search And AI Research Log

Date checked: 2026-09-02

Scope: current official guidance for search indexing, structured data, AI search/crawler access and practical impact on the Netmarket go-live plan. No production robots.txt, DNS or Search Console setting has been changed.

## Google Search

| Source | Guidance | Impact on Netmarket | Implementation decision |
| --- | --- | --- | --- |
| Google Search Essentials, `https://developers.google.com/search/docs/essentials` | Google eligibility still depends on crawlable pages, helpful reliable content, descriptive titles/headings/link text, and correct controls for content that should not appear in Search. | The new static site should prioritize crawlable HTML, clear IA, real service/project/insight evidence and avoid SEO-first copy. | Keep service, project and insight pages server-rendered/static. Keep staging noindex. Do not add hidden SEO text or doorway pages. |
| Google helpful, reliable, people-first content, `https://developers.google.com/search/docs/fundamentals/creating-helpful-content` | Content should provide original value, satisfy user goals, show evidence/expertise, avoid artificial freshness and avoid content made primarily for search traffic. | Netmarket should surface first-party evidence: projects, people, client history, process and real insights. | Use case studies as proof, classify outdated insights, avoid mass AI content and do not update article dates unless content materially changes. |
| Google AI-generated content guidance, `https://developers.google.com/search/docs/fundamentals/using-gen-ai-content` | AI can help structure/research, but scaled low-value content and manipulative automation can violate spam policies. Metadata, alt text and structured data must remain accurate. | Copy can be refined with assistance, but every claim must be true and grounded. | No automated article generation campaign. Editorial roadmap should favor fewer stronger first-party pieces. |
| Google canonical guidance, `https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls` | Redirects, rel canonical and sitemap inclusion are canonicalization signals; do not use robots.txt for canonicalization. | Legacy URL migration must use 301s and self-referential canonicals. | Prepare redirects master but do not apply before go-live. Keep canonical URLs production-ready. |
| Google structured data guidelines, `https://developers.google.com/search/docs/appearance/structured-data/sd-policies` | JSON-LD is recommended, must match visible content, must not be misleading, and does not guarantee rich results. | Organization, Service, Article, Person, CreativeWork and BreadcrumbList are useful only where supported by visible content. | Keep schema conservative. Do not add FAQ/review schema unless visible content and current policies justify it. |
| Google sitemap guidance, `https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap` | Sitemaps should include canonical, fetchable URLs intended for Search. `lastmod` should reflect significant changes. | Production sitemap must exclude staging utilities, design system, redirects, 404, noindex and CMS URLs. | Audit sitemap before go-live. Use meaningful lastmod only where reliable. |
| Google robots.txt intro, `https://developers.google.com/search/docs/crawling-indexing/robots/intro` | robots.txt controls crawl access, not indexing. Use noindex/password protection for pages that must not appear in Search. | Staging and CMS should remain noindex/protected; production should not block indexable pages with robots. | Keep staging noindex. Prepare production robots that allows public frontend and declares sitemap. |
| Google AI optimization guide, `https://developers.google.com/search/docs/fundamentals/ai-optimization-guide` | No special writing style or schema is required for generative AI features. Google ignores `llms.txt`; it neither helps nor hurts Google rankings. | GEO work should improve clarity, evidence, crawlability and entity consistency, not invent AI-specific tricks. | Consider `llms.txt` only as experimental interoperability, not as a ranking factor. |
| Google common crawlers / Google-Extended, `https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers` | `Google-Extended` is a control token for use of content in future Gemini model training/grounding contexts; it does not affect Google Search inclusion or ranking. | Robots policy must distinguish search indexing from model-training preferences. | Prepare policy proposal; do not block Googlebot. Decide separately whether to allow or disallow Google-Extended. |

## Bing / Copilot

| Source | Guidance | Impact on Netmarket | Implementation decision |
| --- | --- | --- | --- |
| Bing Webmaster Guidelines, `https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a` | SEO fundamentals support both Bing Search and Copilot/grounding: crawlable URLs, sitemaps, content clarity, structured data and trust signals. | Same technical SEO work helps Bing/Copilot eligibility. | Keep pages crawlable, schema accurate and internal links descriptive. |
| Bing robots.txt help, `https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec` | Robots rules need clear user-agent sections; sitemap can be declared. Custom bot sections require maintenance care. | Production robots should stay simple unless specific policy is needed. | Use a simple default allow/block strategy and sitemap declaration. Avoid fragile custom crawl-delay unless needed. |
| Bing robots meta tags, `https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240` | Bing supports meta robots and X-Robots-Tag; some directives also affect Copilot/chat use and training. | Meta directives have AI/grounding implications in Bing ecosystem. | Avoid `noarchive`/`nosnippet` on production content unless intentionally limiting citation/display. |
| Bing structured data overview, `https://www.bing.com/webmasters/help/marking-up-your-site-with-structured-data-3a93e731` | Bing supports Schema.org JSON-LD, Microdata, RDFa, Open Graph; structured data helps understanding but does not replace visible content. | Existing JSON-LD and OG should remain aligned to visible content. | Keep JSON-LD central and conservative. |
| Bing URL Submission / IndexNow, `https://www.bing.com/webmasters/help/URL-Submission-62f2860b` | Bing strongly recommends IndexNow for notifying URL additions, updates and removals. | Static deploy can integrate IndexNow after production cutover if a key and owner decision exist. | Prepare optional IndexNow plan. Do not implement production submission until go-live authorization. |

## OpenAI

| Source | Guidance | Impact on Netmarket | Implementation decision |
| --- | --- | --- | --- |
| OpenAI crawler guidance, `https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers` | OpenAI crawlers respect robots.txt. For ad/web crawling, OAI-AdsBot is required and OAI-SearchBot is recommended; bot mitigation can block crawlers accidentally. | If Netmarket wants ChatGPT/Search or ads landing-page accessibility, production robots and hosting security must not block desired OpenAI crawlers. | Prepare explicit allow policy for OAI-SearchBot and OAI-AdsBot only if aligned with owner preference. Do not alter production robots now. |

## Anthropic / Claude

| Source | Guidance | Impact on Netmarket | Implementation decision |
| --- | --- | --- | --- |
| Anthropic crawler help, `https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler` | Anthropic distinguishes crawlers for model development and user-directed retrieval; robots.txt can block specific bots such as ClaudeBot. | Netmarket can allow user-directed retrieval while making a separate training decision. | Document preference options before go-live; do not invent crawler names. |

## Perplexity

| Source | Guidance | Impact on Netmarket | Implementation decision |
| --- | --- | --- | --- |
| Perplexity robots.txt help, `https://www.perplexity.ai/help-center/en/articles/10354969-how-does-perplexity-follow-robots-txt` | Perplexity states PerplexityBot respects robots.txt and is not used for AI model pre-training. | Perplexity visibility depends on crawl access and clear content, not special markup. | Allow PerplexityBot if AI search retrieval visibility is desired; document as a policy choice. |
| Perplexity crawler docs, `https://perplexity.mintlify.app/docs/resources/perplexity-crawlers` | PerplexityBot is for search results; WAF/IP allowlisting may matter. | Bot mitigation should not block desired crawlers post go-live. | Add to go-live crawler verification checklist, not to staging. |

## Netmarket Decisions

- Do not implement hidden SEO text, doorway pages, city programmatic pages or fake FAQ/schema.
- Keep primary optimization focused on crawlable static HTML, clean IA, real entities and first-party proof.
- Use `llms.txt` only if generated from real sitemap/content and documented as experimental, not as a Google ranking factor.
- Prepare a production robots policy that distinguishes search crawlers, AI retrieval crawlers and model-training tokens where official documentation supports that distinction.
- Do not apply production crawler policy until explicit go-live authorization.

#!/usr/bin/env node

const origin = 'https://netmarket.it';
const expectedSha = process.env.EXPECTED_BUILD_SHA ?? '';
const requiredRoutes = [
  '/', '/servizi/', '/servizi/siti-web/', '/servizi/ecommerce/', '/servizi/seo/',
  '/servizi/advertising/', '/servizi/social-media/', '/servizi/branding-e-comunicazione/',
  '/servizi/content-production/', '/servizi/software-e-integrazioni/',
  '/servizi/concorsi-a-premi/', '/agenzia/', '/lavora-con-noi/', '/progetti/', '/insight/',
  '/nod/', '/contatti/', '/grazie/'
];

if (!expectedSha) throw new Error('EXPECTED_BUILD_SHA mancante.');

function meta(html, name) {
  return html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)`, 'i'))?.[1] ?? '';
}

async function get(path, redirect = 'follow') {
  const response = await fetch(`${origin}${path}`, {
    redirect,
    headers: { 'cache-control': 'no-cache', 'user-agent': 'Netmarket-Production-Smoke/1.0' }
  });
  return { response, body: await response.text() };
}

const failures = [];
for (const route of requiredRoutes) {
  const { response, body } = await get(route);
  if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
  if (!body.includes('<main')) failures.push(`${route}: main assente`);
  if (body.includes('staging.netmarket.it') || body.includes('localhost:')) failures.push(`${route}: URL non production`);
  if (route !== '/grazie/' && /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body)) failures.push(`${route}: noindex inatteso`);
}

const home = await get('/');
if (meta(home.body, 'netmarket-build') !== expectedSha) failures.push('homepage: SHA non corrispondente');
if (meta(home.body, 'netmarket-environment') !== 'production') failures.push('homepage: environment non production');
if (!home.body.includes('GTM-K782CJ46')) failures.push('homepage: GTM production assente');
if (!home.body.includes("analytics_storage: 'denied'")) failures.push('homepage: Consent Mode denied assente');

const assetUrls = [...home.body.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)/g)].map((match) => match[1]);
for (const asset of [...new Set(assetUrls)].slice(0, 12)) {
  const response = await fetch(`${origin}${asset}`, { method: 'HEAD', redirect: 'follow' });
  if (!response.ok) failures.push(`${asset}: asset HTTP ${response.status}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Smoke production PASS: ${requiredRoutes.length} route, build ${expectedSha}.`);

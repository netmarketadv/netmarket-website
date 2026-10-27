import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const base = '6b2e5524ba43e237229e0f56e86161edd87e1165';
const path = 'apps/web/src/components/analytics/TrackingController.astro';
const before = execFileSync('git', ['show', base + ':' + path], { encoding: 'utf8' });
const after = readFileSync(path, 'utf8');
const consent = /window\.__netmarketConsentReady = false;[\s\S]*?window\._iub\.csLangConfiguration = .*?;/;
if (before.match(consent)?.[0] !== after.match(consent)?.[0] ||
    before.split('\n<script>\n')[1] !== after.split('\n<script>\n')[1]) {
  throw new Error('Iubenda, Consent Mode, dataLayer o eventi divergenti dalla produzione approvata.');
}
const analytics = 'packages/analytics/src/index.ts';
if (execFileSync('git', ['show', base + ':' + analytics], { encoding: 'utf8' }) !== readFileSync(analytics, 'utf8')) {
  throw new Error('Dispatcher analytics modificato.');
}
if (readFileSync('apps/web/src/layouts/BaseLayout.astro', 'utf8').includes('<noscript')) {
  throw new Error('Fallback noscript non autorizzato.');
}
const loader = after.match(/function loadTagManager\(\) \{[\s\S]*?\n      <\/script>/)?.[0];
if (!loader || createHash('sha256').update(loader).digest('hex') !== '146c60a26682c4bd1ad67fff577f77c1e0ba719867ee8a7c7b7ee33306544d91') {
  throw new Error('Custom Loader o temporizzazione diversi dalla versione approvata.');
}
console.log('Tracking invariato: Iubenda, consensi, eventi, dispatcher e loader approvato.');

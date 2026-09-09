#!/usr/bin/env node

import { appendFileSync } from 'node:fs';

const stagingUrl = 'https://staging.netmarket.it';
const checkUrl = `${stagingUrl}/?nm_challenge=${Date.now()}`;
const outputPath = process.env.GITHUB_OUTPUT;

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(checkUrl, {
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'cache-control': 'no-cache',
      'user-agent': 'Netmarket-Staging-Smoke/1.0 (+https://staging.netmarket.it)'
    }
  });
  const html = await response.text();
  const challenged = response.status === 202 && html.includes('/.well-known/sgcaptcha/');

  if (outputPath) {
    appendFileSync(outputPath, `challenged=${challenged ? 'true' : 'false'}\n`);
  }

  if (challenged) {
    console.warn('SiteGround CAPTCHA challenge rilevato per il runner GitHub; Playwright staging verra saltato.');
  } else {
    console.log('Nessuna challenge SiteGround rilevata per il runner GitHub.');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Impossibile determinare la challenge SiteGround: ${message}`);
  if (outputPath) {
    appendFileSync(outputPath, 'challenged=false\n');
  }
} finally {
  clearTimeout(timeout);
}

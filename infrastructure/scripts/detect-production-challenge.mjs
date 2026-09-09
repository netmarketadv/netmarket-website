#!/usr/bin/env node

import { appendFileSync } from 'node:fs';

const origin = 'https://netmarket.it';
const outputPath = process.env.GITHUB_OUTPUT;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(`${origin}/?nm_challenge=${Date.now()}`, {
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'cache-control': 'no-cache',
      'user-agent': 'Netmarket-Production-Smoke/1.0 (+https://netmarket.it)'
    }
  });
  const html = await response.text();
  const challenged = response.status === 202 && html.includes('/.well-known/sgcaptcha/');

  if (outputPath) appendFileSync(outputPath, `challenged=${challenged ? 'true' : 'false'}\n`);

  if (challenged) {
    console.warn('SiteGround CAPTCHA challenge rilevato per il runner GitHub production.');
  } else {
    console.log(`Nessuna challenge SiteGround production rilevata (HTTP ${response.status}).`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Impossibile determinare la challenge production: ${message}`);
  if (outputPath) appendFileSync(outputPath, 'challenged=false\n');
} finally {
  clearTimeout(timeout);
}

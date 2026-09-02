#!/usr/bin/env node

const allowedUrl = 'https://staging.netmarket.it';
const url = process.env.SMOKE_URL ?? allowedUrl;
const expectedSha = process.env.EXPECTED_BUILD_SHA ?? '';
const expectedEnvironment = process.env.EXPECTED_BUILD_ENV ?? 'staging';
const retries = Number.parseInt(process.env.SMOKE_RETRIES ?? '5', 10);
const retryDelayMs = Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS ?? '3000', 10);

if (url !== allowedUrl) {
  console.error(`URL smoke test rifiutato: ${url}`);
  process.exit(1);
}

if (!expectedSha) {
  console.error('EXPECTED_BUILD_SHA mancante.');
  process.exit(1);
}

function readMeta(html, name) {
  const pattern = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  const match = html.match(pattern);
  return match?.[1] ?? '';
}

function fail(message) {
  throw new Error(message);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runSmoke() {
  const checkUrl = `${url}?nm_smoke=${Date.now()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(checkUrl, {
      redirect: 'follow',
    signal: controller.signal,
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'cache-control': 'no-cache',
      'user-agent': 'Mozilla/5.0 NetmarketStagingSmoke/1.0'
    }
  });

    if (!response.ok) {
      fail(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    const buildSha = readMeta(html, 'netmarket-build');
    const environment = readMeta(html, 'netmarket-environment');

    if (!/^<!doctype html>|<html[\s>]/i.test(html)) {
      fail('documento HTML non riconosciuto.');
    }

    if (!/<header\b[^>]*class=["'][^"']*site-header/i.test(html)) {
      fail('header principale mancante.');
    }

    if (!/<footer\b[^>]*class=["'][^"']*site-footer/i.test(html)) {
      fail('footer principale mancante.');
    }

    if (html.includes('http://localhost:4321')) {
      fail('metadata localhost rilevati.');
    }

    if (buildSha !== expectedSha) {
      fail(`build online ${buildSha || '(assente)'} diversa da ${expectedSha}.`);
    }

    if (environment !== expectedEnvironment) {
      fail(`environment online ${environment || '(assente)'} diverso da ${expectedEnvironment}.`);
    }

    console.log(`Smoke staging ok: build ${buildSha} su ${environment}.`);
  } finally {
    clearTimeout(timeout);
  }
}

let lastError = '';
for (let attempt = 1; attempt <= retries; attempt += 1) {
  try {
    await runSmoke();
    process.exit(0);
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    if (attempt < retries) {
      console.warn(`Smoke staging tentativo ${attempt}/${retries} fallito: ${lastError}`);
      await delay(retryDelayMs);
    }
  }
}

console.error(`Smoke staging fallito: ${lastError}`);
process.exit(1);

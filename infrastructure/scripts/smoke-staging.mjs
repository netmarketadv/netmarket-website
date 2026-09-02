#!/usr/bin/env node

const allowedUrl = 'https://staging.netmarket.it';
const url = process.env.SMOKE_URL ?? allowedUrl;
const expectedSha = process.env.EXPECTED_BUILD_SHA ?? '';
const expectedEnvironment = process.env.EXPECTED_BUILD_ENV ?? 'staging';
const maxAttempts = 6;

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
  console.error(`Smoke staging fallito: ${message}`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(attempt) {
  const checkUrl = `${url}?nm_smoke=${Date.now()}_${attempt}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(checkUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'cache-control': 'no-cache'
      }
    });
    return { response, html: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function validateHtml(response, html) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const buildSha = readMeta(html, 'netmarket-build');
  const environment = readMeta(html, 'netmarket-environment');

  if (!/^<!doctype html>|<html[\s>]/i.test(html)) {
    throw new Error('documento HTML non riconosciuto.');
  }

  if (!/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) {
    throw new Error('head/body mancanti.');
  }

  if (!/<header\b[^>]*class=["'][^"']*site-header/i.test(html)) {
    throw new Error('header principale mancante.');
  }

  if (!/<footer\b[^>]*class=["'][^"']*site-footer/i.test(html)) {
    throw new Error('footer principale mancante.');
  }

  if (html.includes('http://localhost:4321')) {
    throw new Error('metadata localhost rilevati.');
  }

  if (buildSha !== expectedSha) {
    throw new Error(`build online ${buildSha || '(assente)'} diversa da ${expectedSha}.`);
  }

  if (environment !== expectedEnvironment) {
    throw new Error(`environment online ${environment || '(assente)'} diverso da ${expectedEnvironment}.`);
  }

  return { buildSha, environment };
}

let lastError = '';

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    const { response, html } = await fetchHtml(attempt);
    const { buildSha, environment } = validateHtml(response, html);
    console.log(`Smoke staging ok: build ${buildSha} su ${environment}.`);
    process.exit(0);
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    if (attempt < maxAttempts) {
      console.warn(`Smoke staging tentativo ${attempt}/${maxAttempts} non pronto: ${lastError}`);
      await sleep(2_000 * attempt);
    }
  }
}

fail(lastError);

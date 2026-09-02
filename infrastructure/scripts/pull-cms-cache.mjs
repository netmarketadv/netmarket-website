#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const required = [
  'SG_SSH_HOST',
  'SG_SSH_PORT',
  'SG_SSH_USER',
  'SG_SSH_PRIVATE_KEY',
  'SG_SSH_KNOWN_HOSTS',
  'SG_CMS_WORDPRESS_PATH'
];

for (const name of required) {
  if (!process.env[name]) {
    console.error(`Secret mancante: ${name}`);
    process.exit(1);
  }
}

const wpPath = process.env.SG_CMS_WORDPRESS_PATH;
if (!wpPath.startsWith('/') || !wpPath.includes('/cms.netmarket.it/')) {
  console.error('Percorso WordPress CMS mancante o non consentito.');
  process.exit(1);
}

const cacheDir =
  process.env.CMS_API_CACHE_DIR || join(process.cwd(), 'apps/web/.cms-cache/netmarket/v1');
const endpoints = [
  '/health',
  '/settings',
  '/services?per_page=50&sort=priority',
  '/case-studies?per_page=50&sort=priority',
  '/clients',
  '/people',
  '/insights?per_page=50&sort=date',
  '/resources?per_page=50&sort=priority',
  '/testimonials'
];

const tempDir = mkdtempSync(join(tmpdir(), 'netmarket-cms-cache-'));
const keyFile = join(tempDir, 'key');
const knownHostsFile = join(tempDir, 'known_hosts');
writeFileSync(keyFile, `${process.env.SG_SSH_PRIVATE_KEY}\n`, { mode: 0o600 });
writeFileSync(knownHostsFile, `${process.env.SG_SSH_KNOWN_HOSTS}\n`, { mode: 0o600 });
mkdirSync(cacheDir, { recursive: true });

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function cacheFilename(path) {
  return `${encodeURIComponent(path.replace(/^\//, ''))}.json`;
}

function endpointToRequest(path) {
  const parsed = new URL(path.replace(/^\//, ''), 'https://cache.local/');
  return {
    route: `/netmarket/v1${parsed.pathname}`,
    params: Object.fromEntries(parsed.searchParams.entries())
  };
}

function fetchEndpoint(path) {
  const request = endpointToRequest(path);
  const php = `
$request = new WP_REST_Request('GET', ${JSON.stringify(request.route)});
$request->set_query_params(${phpArray(request.params)});
$response = rest_do_request($request);
$data = rest_get_server()->response_to_data($response, false);
if ($response->is_error()) {
  fwrite(STDERR, wp_json_encode($data));
  exit(1);
}
echo wp_json_encode($data);
`;
  const remote = `cd ${shellQuote(wpPath)} && wp --skip-themes eval ${shellQuote(php)}`;
  const result = spawnSync(
    'ssh',
    [
      '-p',
      process.env.SG_SSH_PORT,
      '-i',
      keyFile,
      '-o',
      `UserKnownHostsFile=${knownHostsFile}`,
      '-o',
      'StrictHostKeyChecking=yes',
      `${process.env.SG_SSH_USER}@${process.env.SG_SSH_HOST}`,
      remote
    ],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) {
    console.error(`CMS endpoint non valido: ${path}`);
    if (result.stderr) console.error(result.stderr.trim());
    process.exit(result.status || 1);
  }

  try {
    const payload = JSON.parse(result.stdout);
    if (path === '/health' && payload.status !== 'ok') {
      console.error('CMS health endpoint proprietario non risponde status ok.');
      process.exit(1);
    }
    return `${JSON.stringify(payload, null, 2)}\n`;
  } catch (error) {
    console.error(`CMS endpoint non JSON: ${path}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function phpArray(params) {
  const entries = Object.entries(params).map(
    ([key, value]) => `${JSON.stringify(key)} => ${JSON.stringify(value)}`
  );
  return `array(${entries.join(', ')})`;
}

try {
  for (const endpoint of endpoints) {
    const json = fetchEndpoint(endpoint);
    writeFileSync(join(cacheDir, cacheFilename(endpoint)), json);
    console.log(`CMS cache: ${endpoint}`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

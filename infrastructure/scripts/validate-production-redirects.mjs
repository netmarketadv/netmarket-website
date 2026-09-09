#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import migration from '../../data/migrations/go-live/legacy-url-map.json' with { type: 'json' };

const origin = 'https://netmarket.it';
const outputDir = process.env.REDIRECT_REPORT_DIR ?? 'artifacts';
const report = [];
let failed = false;

for (const entry of migration.entries) {
  const oldUrl = `${origin}${entry.oldPath}`;
  const response = await fetch(oldUrl, { redirect: 'manual', headers: { 'user-agent': 'Netmarket-Redirect-Audit/1.0' } });
  const location = response.headers.get('location');
  const expectedStatus = entry.action === '301' ? 301 : entry.action === '410' ? 410 : 200;
  let finalUrl = oldUrl;
  let finalStatus = response.status;

  if (entry.action === '301' && location) {
    finalUrl = new URL(location, oldUrl).href;
    const finalResponse = await fetch(finalUrl, { redirect: 'manual', headers: { 'user-agent': 'Netmarket-Redirect-Audit/1.0' } });
    finalStatus = finalResponse.status;
  }

  const expectedFinal = entry.newPath ? `${origin}${entry.newPath}` : oldUrl;
  const ok = response.status === expectedStatus &&
    (entry.action !== '301' || (finalUrl === expectedFinal && finalStatus === 200));
  if (!ok) failed = true;
  report.push({ oldUrl, action: entry.action, status: response.status, finalUrl, finalStatus, ok });
}

await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/production-redirect-report.json`, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(
  `${outputDir}/production-redirect-report.csv`,
  `OLD URL,STATUS,FINAL URL,FINAL STATUS,OK\n${report.map((row) =>
    [row.oldUrl, row.status, row.finalUrl, row.finalStatus, row.ok].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')
  ).join('\n')}\n`
);

if (failed) {
  console.error('Redirect production FAIL. Consultare il report artifact.');
  process.exit(1);
}
console.log(`Redirect production PASS: ${report.length} URL validate.`);

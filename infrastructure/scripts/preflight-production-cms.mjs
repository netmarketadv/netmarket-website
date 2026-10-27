import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export async function inspectProductionCms({
  baseUrl,
  user,
  secret,
  fetchImpl = fetch,
  inventory = {}
}) {
  if (baseUrl !== 'https://cms.netmarket.it/wp-json/netmarket/v1/') {
    throw new Error('Origine CMS production non autorizzata.');
  }
  if (!user || !secret)
    throw new Error('Secret CMS esistenti mancanti: nessuna richiesta anonima alternativa.');
  const checks = [];
  for (const endpoint of [
    'health',
    'services?per_page=50&sort=priority',
    'case-studies?per_page=50&sort=priority',
    'insights?page=1&per_page=50&sort=date'
  ]) {
    const check = { endpoint, status: 'error' };
    try {
      const response = await fetchImpl(baseUrl + endpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Basic ' + Buffer.from(user + ':' + secret).toString('base64')
        },
        redirect: 'error',
        signal: AbortSignal.timeout(30_000)
      });
      check.httpStatus = response.status;
      if (!response.ok) throw new Error('HTTP ' + response.status);
      if (response.url && new URL(response.url).origin !== 'https://cms.netmarket.it')
        throw new Error('Origine risposta inattesa');
      const payload = await response.json();
      check.sha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      if (endpoint === 'health') {
        if (payload.status !== 'ok') throw new Error('Health CMS non valido');
      } else {
        if (
          !Array.isArray(payload.data) ||
          !Number.isInteger(payload.pagination?.total) ||
          !Number.isInteger(payload.pagination?.totalPages) ||
          payload.pagination?.page !== 1
        ) {
          throw new Error('Contratto archivio non valido');
        }
        check.count = payload.data.length;
        check.total = payload.pagination.total;
        check.totalPages = payload.pagination.totalPages;
        if (check.count === 0 || check.total < check.count || check.totalPages < 1) {
          throw new Error('Archivio principale vuoto o incoerente: pubblicazione CMS necessaria');
        }
      }
      const required = inventory[endpoint.split('?')[0]] ?? [];
      if (required.length) {
        const slugs = new Set(payload.data?.map((item) => item?.slug));
        check.missingSlugs = required.filter((slug) => !slugs.has(slug));
        if (check.missingSlugs.length) throw new Error('Contenuti approvati mancanti in CMS');
      }
      check.status = 'ok';
    } catch (error) {
      // Never serialize responses, request headers, credentials or arbitrary server errors.
      check.reason =
        error instanceof SyntaxError
          ? 'Risposta non JSON'
          : error instanceof Error &&
              /^(HTTP \d+|Origine risposta inattesa|Health CMS non valido|Contratto archivio non valido|Contenuti approvati mancanti in CMS|Archivio principale vuoto o incoerente: pubblicazione CMS necessaria)$/.test(
                error.message
              )
            ? error.message
            : 'Accesso CMS non completato';
    }
    checks.push(check);
  }
  return {
    source: 'authenticated-https-cms-preflight',
    complete: checks.every((check) => check.status === 'ok'),
    checks
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sha = process.env.PUBLIC_BUILD_SHA;
  if (!/^[0-9a-f]{40}$/.test(sha ?? '')) throw new Error('SHA candidate completo obbligatorio.');
  const result = await inspectProductionCms({
    baseUrl: process.env.CMS_API_BASE_URL,
    user: process.env.CMS_BASIC_AUTH_USER,
    secret: process.env.CMS_BASIC_AUTH_PASSWORD,
    inventory: JSON.parse(
      readFileSync(new URL('../../data/releases/stape-cms-inventory.json', import.meta.url), 'utf8')
    ).requiredSlugs
  });
  const report = resolve('artifacts/production-candidate-' + sha, 'cms-preflight.json');
  mkdirSync(dirname(report), { recursive: true });
  writeFileSync(report, JSON.stringify(result, null, 2) + '\n');
  if (!result.complete) {
    console.error(
      'CMS non pronto: ' +
        result.checks
          .filter((check) => check.status !== 'ok')
          .map((check) => check.endpoint + ' (' + check.reason + ')')
          .join('; ')
    );
    process.exitCode = 1;
  } else {
    console.log('Preflight CMS autenticato superato; il controllo completo avverra sulla build.');
  }
}

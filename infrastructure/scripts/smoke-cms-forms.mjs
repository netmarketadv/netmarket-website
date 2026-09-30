import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';

// Deliberately invalid name AND denied consent: these probes must never send mail,
// including against older plugin versions that cast multipart booleans incorrectly.
const endpoint = 'https://cms.netmarket.it/wp-json/netmarket/v1/forms/contact';
const origin = 'https://netmarket.it';
const payload = {
  name: '',
  email: 'form-diagnostic@example.com',
  message: 'Verifica tecnica automatica del contratto form. Non inviare.',
  privacyConsent: false,
  website: '',
  sourceUrl: `${origin}/lavora-con-noi/`,
  elapsedMs: 5000
};

async function check(label, body, expectedFields, headers = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
    headers: { Origin: origin, Accept: 'application/json', ...headers },
    body
  });
  const responseBody = await response.text();
  if (
    process.env.GITHUB_ACTIONS === 'true' &&
    response.status === 202 &&
    responseBody.includes('/.well-known/sgcaptcha/')
  ) {
    const warning =
      'SiteGround ha intercettato il runner GitHub. Verifica CMS form differita: eseguire node infrastructure/scripts/smoke-cms-forms.mjs da una rete esterna prima di dichiarare il rilascio verificato.';
    console.warn(`::warning::${warning}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `\n### Verifica CMS form differita\n\n${warning}\n`
      );
    }
    process.exit(0);
  }
  assert.equal(
    response.status,
    422,
    `${label}: expected field validation (422), got ${response.status}`
  );
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    origin,
    `${label}: production CORS`
  );
  const result = JSON.parse(responseBody);
  assert.equal(result.code, 'validation_failed', `${label}: backend validation contract`);
  assert.deepEqual(result.fields, expectedFields, `${label}: unexpected field errors`);
  console.log(`PASS ${label}: payload parsed and validated; no email sent`);
}

const deniedFields = { name: 'invalid_name', privacyConsent: 'privacy_required' };
await check('contact JSON', JSON.stringify(payload), deniedFields, {
  'Content-Type': 'application/json'
});

function careerBody() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...payload, service: 'lavora-con-noi' })) {
    form.append(key, String(value));
  }
  return form;
}

await check('career without CV', careerBody(), { ...deniedFields, cv: 'cv_required' });

const withCv = careerBody();
withCv.append(
  'cv',
  new Blob(
    ['%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'],
    { type: 'application/pdf' }
  ),
  'netmarket-diagnostic.pdf'
);
await check('career with PDF', withCv, deniedFields);

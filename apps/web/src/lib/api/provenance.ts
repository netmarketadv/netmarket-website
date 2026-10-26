import { appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function recordCmsAccess(
  path: string,
  result: { status: 'ok'; authenticated: boolean; payload: unknown } | { status: 'error' }
): void {
  const output = process.env.CMS_AUDIT_PATH;
  if (!output) return;
  const payload = result.status === 'ok' ? result.payload : undefined;
  const collection =
    payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)
      ? payload.data
      : undefined;
  appendFileSync(
    output,
    JSON.stringify({
      path,
      origin: 'https://cms.netmarket.it',
      status: result.status,
      authenticated: result.status === 'ok' && result.authenticated,
      ...(result.status === 'ok'
        ? {
            sha256: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
            count: collection ? collection.length : null,
            pagination: payload && typeof payload === 'object' && 'pagination' in payload ? payload.pagination : null
          }
        : {})
    }) + '\n'
  );
}

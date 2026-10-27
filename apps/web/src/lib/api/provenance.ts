import { appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function recordCmsAccess(
  path: string,
  result: (
    { status: 'ok'; authenticated: boolean; payload: unknown; origin: string } | { status: 'error' }
  ) & { attempts?: number; retries?: Array<'transport' | number> }
): void {
  const output = process.env.CMS_AUDIT_PATH;
  if (!output) return;
  const payload = result.status === 'ok' ? result.payload : undefined;
  const collection: unknown[] | undefined =
    payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)
      ? payload.data
      : undefined;
  appendFileSync(
    output,
    JSON.stringify({
      path,
      origin: result.status === 'ok' ? result.origin : 'https://cms.netmarket.it',
      status: result.status,
      authenticated: result.status === 'ok' && result.authenticated,
      attempts: result.attempts ?? 1,
      retries: result.retries ?? [],
      ...(result.status === 'ok'
        ? {
            sha256: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
            count: collection ? collection.length : null,
            slugs:
              collection?.flatMap((item) =>
                item && typeof item === 'object' && 'slug' in item && typeof item.slug === 'string'
                  ? [item.slug]
                  : []
              ) ?? null,
            pagination:
              payload && typeof payload === 'object' && 'pagination' in payload
                ? payload.pagination
                : null
          }
        : {})
    }) + '\n'
  );
}

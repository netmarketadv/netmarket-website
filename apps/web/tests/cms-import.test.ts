import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { serviceSchema, caseStudySchema } from '@netmarket/schemas';
import {
  auditImportedContent,
  verifyPublicMedia
} from '../../../infrastructure/migrations/stape/audit-import.mjs';

const root = resolve('../..');
const planPath = resolve(root, 'data/releases/stape-cms-import.json');
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const digest = createHash('sha256').update(readFileSync(planPath)).digest('hex');

describe('create-only CMS import of the complete baseline inventory', () => {
  it('retains the exact 9 services and 8 case studies, real asset bytes and no synthetic IDs', () => {
    const inventory = JSON.parse(
      readFileSync(resolve(root, 'data/releases/stape-cms-inventory.json'), 'utf8')
    );
    for (const [type, key] of [
      ['nm_service', 'services'],
      ['nm_case_study', 'case-studies']
    ] as const) {
      expect(
        plan.records
          .filter((record: { type: string }) => record.type === type)
          .map((record: { slug: string }) => record.slug)
          .sort()
      ).toEqual(inventory.requiredSlugs[key].sort());
    }
    for (const media of plan.media) {
      expect(
        createHash('sha256')
          .update(readFileSync(resolve(root, media.assetPath)))
          .digest('hex')
      ).toBe(media.sha256);
    }
    for (const record of plan.records) {
      expect(record).not.toHaveProperty('id');
      expect(record.meta).not.toHaveProperty('migration_legacy_id');
    }
  });

  it('simulates every record with native registry/sanitizers/serializer, idempotency and scoped rollback', () => {
    const temp = mkdtempSync(join(tmpdir(), 'netmarket-import-test-'));
    try {
      execFileSync(process.execPath, ['infrastructure/migrations/stape/materialize.mjs'], {
        cwd: root,
        env: { ...process.env, PLAN_SHA256: digest },
        stdio: 'pipe'
      });
      const result = JSON.parse(
        execFileSync(
          'php',
          [
            'infrastructure/migrations/stape/simulate.php',
            planPath,
            resolve(root, 'artifacts/stape-cms-preparation/media'),
            temp
          ],
          { cwd: root, encoding: 'utf8' }
        )
      );
      expect(result.dry).toMatchObject({ records: 24, media: 38, writes: 0 });
      expect(result.applied.created).toBe(62);
      expect(result.again.unchanged).toBe(true);
      expect(result.guardEdited).toBe(true);
      expect(result.guardReferenced).toBe(true);
      expect(result.rollbackPlan.execute).toBe(false);
      expect(result.rolled).toMatchObject({ objects: 62, execute: true });
      expect(result.payloads.services).toHaveLength(9);
      expect(result.payloads.projects).toHaveLength(8);
      expect(auditImportedContent(plan, result.payloads)).toEqual({ recordsVerified: 17 });
      const edited = structuredClone(result.payloads);
      edited.projects[0].seo.noindex = !edited.projects[0].seo.noindex;
      expect(() => auditImportedContent(plan, edited)).toThrow('CMS differs from reviewed plan');
      for (const value of result.payloads.services) {
        const parsed = serviceSchema.parse(value);
        const record = plan.records.find((entry: { slug: string }) => entry.slug === parsed.slug);
        expect(parsed.title).toBe(record.title);
        expect(parsed.seo.noindex).toBe(record.meta.noindex);
        expect(parsed.seo.title).toBe(record.meta.seo_title);
        expect(parsed.seo.description).toBe(record.meta.meta_description);
        for (const [key, native] of [
          ['subtitle', 'subtitle'],
          ['shortDescription', 'short_description'],
          ['valueProps', 'value_props'],
          ['problems', 'problems'],
          ['process', 'process'],
          ['results', 'results'],
          ['faq', 'faq']
        ] as const) {
          expect(parsed[key]).toEqual(record.meta[native]);
        }
        expect(parsed.relatedServices.map((entry) => 'nm_service/' + entry.slug)).toEqual(
          record.meta.related_services.map((entry: { record: string }) => entry.record)
        );
      }
      for (const value of result.payloads.projects) {
        const parsed = caseStudySchema.parse(value);
        const record = plan.records.find((entry: { slug: string }) => entry.slug === parsed.slug);
        expect(parsed.seo.noindex).toBe(record.meta.noindex);
        expect(parsed.seo.title).toBe(record.meta.seo_title);
        expect(parsed.seo.description).toBe(record.meta.meta_description);
        expect(parsed.additionalContent).toBe(record.meta.additional_content);
        for (const key of ['context', 'challenge', 'objectives', 'approach', 'solution'] as const)
          expect(parsed[key]).toEqual(record.meta[key]);
        expect(parsed.numericResults).toEqual(record.meta.numeric_results);
        expect(parsed.client?.slug).toBe(record.meta.client.record.split('/')[1]);
        expect(parsed.publicClientName).toBe(record.meta.public_client_name);
        expect(parsed.client?.image).toBeTruthy();
        expect(parsed.services.map((entry) => 'nm_service/' + entry.slug)).toEqual(
          record.meta.services.map((entry: { record: string }) => entry.record)
        );
        expect(parsed.gallery).toHaveLength(record.meta.gallery.length);
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it('refuses a changed source plan before touching media or WordPress', () => {
    const result = spawnSync(
      process.execPath,
      ['infrastructure/migrations/stape/materialize.mjs'],
      { cwd: root, env: { ...process.env, PLAN_SHA256: '0'.repeat(64) }, encoding: 'utf8' }
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Exact approved plan digest required');
  });

  it('refuses unknown native fields and unresolved relationships without creating a journal', () => {
    const temp = mkdtempSync(join(tmpdir(), 'netmarket-import-invalid-'));
    try {
      for (const mutate of [
        (value: typeof plan) => {
          value.records[0].meta.not_a_field = 'unexpected';
        },
        (value: typeof plan) => {
          value.records[0].meta.related_services = [{ record: 'nm_service/does-not-exist' }];
        }
      ]) {
        const changed = structuredClone(plan);
        mutate(changed);
        const file = resolve(temp, 'plan.json');
        writeFileSync(file, JSON.stringify(changed));
        const result = spawnSync(
          'php',
          [
            'infrastructure/migrations/stape/simulate.php',
            file,
            resolve(root, 'artifacts/stape-cms-preparation/media'),
            temp
          ],
          { cwd: root, encoding: 'utf8' }
        );
        expect(result.status).not.toBe(0);
        expect(result.stderr).toMatch(/Unknown native CMS field|Unresolved record relationship/);
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
  it('refuses a live content operation outside the protected workflow', () => {
    const result = spawnSync('bash', ['infrastructure/scripts/import-stape-cms.sh'], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_ACTIONS: 'false', MODE: 'apply', PLAN_SHA256: digest }
    });
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('Official protected pipeline only');
  });

  it('rejects corrupted media before creating any content', () => {
    const temp = mkdtempSync(join(tmpdir(), 'netmarket-import-corrupt-'));
    try {
      const media = plan.media[0];
      writeFileSync(resolve(temp, media.key + '-' + media.filename), 'corrupted bytes');
      const result = spawnSync(
        'php',
        ['infrastructure/migrations/stape/simulate.php', planPath, temp, temp],
        { cwd: root, encoding: 'utf8' }
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Media integrity mismatch');
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it('never overwrites a preexisting unowned editorial record', () => {
    const temp = mkdtempSync(join(tmpdir(), 'netmarket-import-conflict-'));
    try {
      const result = spawnSync(
        'php',
        [
          'infrastructure/migrations/stape/simulate.php',
          planPath,
          resolve(root, 'artifacts/stape-cms-preparation/media'),
          temp,
          'conflict'
        ],
        { cwd: root, encoding: 'utf8' }
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Existing content conflict');
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it('recovers a partially applied batch without touching unrelated content', () => {
    const temp = mkdtempSync(join(tmpdir(), 'netmarket-import-partial-'));
    try {
      const result = JSON.parse(
        execFileSync(
          'php',
          [
            'infrastructure/migrations/stape/simulate.php',
            planPath,
            resolve(root, 'artifacts/stape-cms-preparation/media'),
            temp,
            'partial-failure'
          ],
          { cwd: root, encoding: 'utf8' }
        )
      );
      expect(result.partialFailureRecovered).toBe(true);
      expect(result.rolled).toMatchObject({ objects: 62, execute: true });
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
  it('requires public media access with correct MIME and without credentials', async () => {
    const collections = {
      media: [
        { url: 'https://cms.netmarket.it/wp-content/uploads/image.webp', mimeType: 'image/webp' }
      ]
    };
    const calls: Array<RequestInit | undefined> = [];
    const result = await verifyPublicMedia(
      collections,
      async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
        calls.push(options);
        return new Response(null, { status: 200, headers: { 'content-type': 'image/webp' } });
      }
    );
    expect(result).toBe(1);
    expect(calls[0]?.method).toBe('HEAD');
    expect(calls[0]?.redirect).toBe('error');
    expect(calls[0]?.headers).toBeUndefined();
    await expect(
      verifyPublicMedia(collections, async () => new Response(null, { status: 403 }))
    ).rejects.toThrow('unavailable publicly');
    await expect(
      verifyPublicMedia(
        collections,
        async () => new Response(null, { status: 200, headers: { 'content-type': 'text/html' } })
      )
    ).rejects.toThrow('unexpected MIME');
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const migration = JSON.parse(
  readFileSync(
    new URL('../../../data/migrations/go-live/legacy-url-map.json', import.meta.url),
    'utf8'
  )
) as {
  entries: Array<{
    oldPath: string;
    action: 'KEEP' | '301' | '410';
    newPath: string | null;
  }>;
};

describe('go-live safeguards', () => {
  it('maps every discovered legacy URL exactly once', () => {
    expect(migration.entries).toHaveLength(66);
    expect(new Set(migration.entries.map((entry) => entry.oldPath)).size).toBe(66);
    expect(migration.entries.filter((entry) => entry.action === 'KEEP')).toHaveLength(3);
    expect(migration.entries.filter((entry) => entry.action === '301')).toHaveLength(59);
    expect(migration.entries.filter((entry) => entry.action === '410')).toHaveLength(4);
    expect(migration.entries.every((entry) => entry.action === '410' || entry.newPath)).toBe(true);
  });

  it('does not introduce redirect chains inside the migration map', () => {
    const byOldPath = new Map(migration.entries.map((entry) => [entry.oldPath, entry]));
    const chains = migration.entries.filter(
      (entry) => entry.action === '301' && byOldPath.get(entry.newPath ?? '')?.action === '301'
    );
    expect(chains).toEqual([]);
  });

  it('keeps the production host non-www and includes NOD in the sitemap', () => {
    const pages = [
      '../src/pages/index.astro',
      '../src/pages/nod.astro',
      '../src/pages/servizi/index.astro',
      '../src/pages/servizi/[slug].astro'
    ];
    for (const page of pages) {
      expect(readFileSync(new URL(page, import.meta.url), 'utf8')).not.toContain(
        'https://www.netmarket.it'
      );
    }
    expect(
      readFileSync(new URL('../src/pages/sitemap-index.xml.ts', import.meta.url), 'utf8')
    ).toContain("'/nod/'");
  });

  it('loads GTM only for an explicitly enabled production build', () => {
    const tracking = readFileSync(
      new URL('../src/components/analytics/TrackingController.astro', import.meta.url),
      'utf8'
    );
    expect(tracking).toContain("env.PUBLIC_DEPLOY_ENV === 'production'");
    expect(tracking).toContain("window.gtag('consent', 'default'");
    expect(tracking).toContain("analytics_storage: 'denied'");
    expect(tracking).toContain("window.setTimeout(loadTagManager, 2500)");
  });
});

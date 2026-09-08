import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const publicUrl = new URL('../public/', import.meta.url);

function pngDimensions(name: string): [number, number] {
  const image = readFileSync(new URL(name, publicUrl));
  expect(image.subarray(1, 4).toString('ascii')).toBe('PNG');
  return [image.readUInt32BE(16), image.readUInt32BE(20)];
}

describe('favicon assets', () => {
  it.each([
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['favicon-48x48.png', 48],
    ['mstile-150x150.png', 150],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512]
  ])('provides %s at the declared size', (name, size) => {
    expect(pngDimensions(name)).toEqual([size, size]);
  });

  it('provides the conventional root ICO fallback', () => {
    const favicon = readFileSync(new URL('favicon.ico', publicUrl));
    expect([...favicon.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  });

  it('uses same-origin favicon URLs independently from the SEO canonical domain', () => {
    const seo = readFileSync(
      new URL('../src/components/seo/Seo.astro', import.meta.url),
      'utf8'
    );

    expect(seo).toContain('href="/favicon.ico"');
    expect(seo).toContain('href="/favicon-48x48.png"');
    expect(seo).toContain('href="/apple-touch-icon.png"');
    expect(seo).toContain('href="/site.webmanifest"');
    expect(existsSync(new URL('browserconfig.xml', publicUrl))).toBe(true);
  });
});

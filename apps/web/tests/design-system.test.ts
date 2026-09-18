import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import registry from '../../../docs/design-system-registry.json';

const source = resolve('src');
const read = (path: string) => readFileSync(resolve(source, path), 'utf8');
function files(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const components = files(resolve(source, 'components')).filter((p) => p.endsWith('.astro'));
const sources = files(source).filter((p) => /\.(astro|ts)$/.test(p));

describe('design system governance', () => {
  it('requires every component to have an explicit role in the registry', () => {
    const registered = [
      ...registry.canonical,
      ...registry.compositions,
      ...registry.infrastructure
    ];
    expect(new Set(registered).size).toBe(registered.length);
    expect(
      components
        .map((p) => relative(resolve(source, 'components'), p).replace(/\.astro$/, ''))
        .sort()
    ).toEqual(registered.sort());
  });

  it('does not retain unused component alternatives', () => {
    const unused = components.filter((component) => {
      const name = component.split('/').pop()!;
      return !sources.some(
        (path) => path !== component && readFileSync(path, 'utf8').includes(`/${name}`)
      );
    });
    expect(unused.map((p) => relative(source, p))).toEqual([]);
  });

  it('routes primary actions through Button, not handwritten variants', () => {
    const copies = sources.filter(
      (path) =>
        path.endsWith('.astro') &&
        !path.endsWith('/Button.astro') &&
        /class(?:[:=]|\s).*nm-button--/.test(readFileSync(path, 'utf8'))
    );
    expect(copies.map((p) => relative(source, p))).toEqual([]);
    for (const name of ['ContactForm', 'CareerForm']) {
      const content = read(`components/forms/${name}.astro`);
      expect(content).toContain("import '@/styles/forms.css'");
      expect(content).toContain('<Button type="submit"');
      expect(content).not.toMatch(/\.contact-form(?:\s+input|__submit)\s*\{/);
    }
  });

  it('keeps approved text pairings above 4.5:1', () => {
    const tokens = read('styles/tokens.css');
    function color(name: string) {
      const hex = tokens.match(new RegExp(`--nm-color-${name}:\\s*#([a-f0-9]{6})`, 'i'))?.[1];
      if (!hex) throw new Error(`Missing color ${name}`);
      const rgb = [0, 2, 4]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
    }
    for (const [foreground, background] of [
      ['ink', 'surface'],
      ['muted', 'surface'],
      ['subtle', 'canvas'],
      ['subtle', 'surface-2'],
      ['blue', 'surface'],
      ['error', 'surface'],
      ['success', 'surface'],
      ['on-inverse', 'inverse'],
      ['on-inverse', 'blue']
    ]) {
      const a = color(foreground!);
      const b = color(background!);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        `${foreground} on ${background}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

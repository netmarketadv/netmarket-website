import { describe, expect, it } from 'vitest';
import {
  headingItalicOClass,
  headingItalicOOptOutClass,
  headingItalicOWordClass,
  styleHeadingText,
  transformHeadingItalicOHtml
} from '../src/lib/typography/heading-italic-o';

describe('heading typography', () => {
  function styledLetterCount(value: string) {
    return value.match(new RegExp(`class="${headingItalicOClass}"`, 'g'))?.length ?? 0;
  }

  it('does not add spans when the string has no o', () => {
    expect(styleHeadingText('Strategia digitale')).toBe('Strategia digitale');
  });

  it('styles one lowercase o', () => {
    expect(styleHeadingText('Progetti')).toBe(
      `<span class="${headingItalicOWordClass}">Pr<span class="${headingItalicOClass}">o</span>getti</span>`
    );
  });

  it('styles every lowercase o', () => {
    expect(styleHeadingText('Soluzioni ecommerce per il mondo digitale')).toContain(
      `<span class="${headingItalicOClass}">o</span>`
    );
    expect(styledLetterCount(styleHeadingText('Soluzioni ecommerce per il mondo digitale'))).toBe(5);
  });

  it('styles uppercase O', () => {
    expect(styleHeadingText('ORO')).toBe(
      `<span class="${headingItalicOWordClass}"><span class="${headingItalicOClass}">O</span>R<span class="${headingItalicOClass}">O</span></span>`
    );
  });

  it('preserves accents and apostrophes while escaping HTML', () => {
    expect(styleHeadingText("Com'è <forte> l'identità")).toBe(
      `<span class="${headingItalicOWordClass}">C<span class="${headingItalicOClass}">o</span>m&#39;è</span> <span class="${headingItalicOWordClass}">&lt;f<span class="${headingItalicOClass}">o</span>rte&gt;</span> l&#39;identità`
    );
  });

  it('transforms only heading text in HTML', () => {
    const transformed = transformHeadingItalicOHtml('<main><h1>Comunichiamo valore</h1><p>body con o normale</p></main>');
    expect(transformed).toContain(`<span class="${headingItalicOClass}">o</span>`);
    expect(transformed).toContain('<p>body con o normale</p>');
  });

  it('keeps styled heading text accessible with the original label', () => {
    const transformed = transformHeadingItalicOHtml('<h2>Progetti</h2>');
    expect(transformed).toContain('aria-label="Progetti"');
    expect(transformed).not.toContain('aria-hidden');
    expect(transformed.replace(/<[^>]+>/g, '')).toBe('Progetti');
  });

  it('keeps short words with o from breaking away from their letters', () => {
    const transformed = transformHeadingItalicOHtml('<h2>CTA con form</h2>');
    expect(transformed).toContain(`<span class="${headingItalicOWordClass}">c<span class="${headingItalicOClass}">o</span>n</span>`);
    expect(transformed).toContain(`<span class="${headingItalicOWordClass}">f<span class="${headingItalicOClass}">o</span>rm</span>`);
  });

  it('does not style the standalone Italian conjunction o', () => {
    const transformed = transformHeadingItalicOHtml('<h2>Problema o focus</h2>');
    expect(transformed).toContain('</span> o <span');
    expect(transformed).toContain(`<span class="${headingItalicOWordClass}">f<span class="${headingItalicOClass}">o</span>cus</span>`);
  });

  it('allows functional headings to opt out of the italic o treatment', () => {
    const transformed = transformHeadingItalicOHtml(
      `<h3 class="${headingItalicOOptOutClass}">Organizzare</h3>`
    );
    expect(transformed).toContain(`<h3 class="${headingItalicOOptOutClass}">Organizzare</h3>`);
    expect(transformed).not.toContain(`<span class="${headingItalicOClass}">`);
  });
});

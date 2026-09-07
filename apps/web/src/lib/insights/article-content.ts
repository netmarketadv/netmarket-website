import { parseFragment, serialize } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
type TextNode = DefaultTreeAdapterMap['textNode'];

export interface ArticleHeading {
  id: string;
  label: string;
  level: 2 | 3;
}

export interface PreparedArticleContent {
  html: string;
  headings: ArticleHeading[];
}

function isElement(node: Node): node is Element {
  return 'tagName' in node;
}

function isTextNode(node: Node): node is TextNode {
  return node.nodeName === '#text' && 'value' in node;
}

function textContent(node: Node): string {
  if (isTextNode(node)) return node.value;
  if (!isElement(node)) return '';
  return node.childNodes.map(textContent).join('');
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'sezione';
}

function walk(node: Node, callback: (element: Element) => void): void {
  if (!isElement(node)) return;
  callback(node);
  node.childNodes.forEach((child) => walk(child, callback));
}

export function prepareArticleContent(markup: string): PreparedArticleContent {
  const fragment = parseFragment(markup);
  const headingElements: Element[] = [];

  fragment.childNodes.forEach((child) =>
    walk(child, (element) => {
      if (element.tagName === 'h2' || element.tagName === 'h3') headingElements.push(element);
    })
  );

  const hasH2 = headingElements.some((heading) => heading.tagName === 'h2');
  const usedIds = new Map<string, number>();
  const headings = headingElements.map((heading) => {
    if (!hasH2 && heading.tagName === 'h3') {
      heading.tagName = 'h2';
      heading.nodeName = 'h2';
    }

    const label = textContent(heading).replace(/\s+/g, ' ').trim();
    const baseId = slugify(label);
    const occurrence = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, occurrence + 1);
    const id = occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`;
    const idAttribute = heading.attrs.find((attribute) => attribute.name === 'id');
    if (idAttribute) idAttribute.value = id;
    else heading.attrs.push({ name: 'id', value: id });

    return { id, label, level: Number(heading.tagName.slice(1)) as 2 | 3 };
  });

  return { html: serialize(fragment), headings };
}

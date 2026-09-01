import { parse, serialize } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';

export const headingItalicOClass = 'nm-heading-o';
export const headingItalicOWordClass = 'nm-heading-o-word';

type Node = DefaultTreeAdapterMap['node'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type Element = DefaultTreeAdapterMap['element'];
type TextNode = DefaultTreeAdapterMap['textNode'];

const headingTags = new Set(['h1', 'h2', 'h3', 'h4']);
const headingClassNames = new Set(['nm-heading', 'nm-display-heading']);

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isElement(node: Node): node is Element {
  return 'tagName' in node;
}

function isTextNode(node: Node): node is TextNode {
  return node.nodeName === '#text' && 'value' in node;
}

function classList(element: Element) {
  const classAttribute = element.attrs.find((attribute) => attribute.name === 'class');
  return new Set(classAttribute?.value.split(/\s+/).filter(Boolean) ?? []);
}

function isHeadingElement(element: Element) {
  if (headingTags.has(element.tagName)) {
    return true;
  }

  const classes = classList(element);
  return [...headingClassNames].some((className) => classes.has(className));
}

function isAlreadyStyledElement(element: Element) {
  const classes = classList(element);
  return classes.has(headingItalicOClass) || classes.has(headingItalicOWordClass);
}

function createTextNode(value: string, parentNode: Element): TextNode {
  return {
    nodeName: '#text',
    value,
    parentNode
  } as TextNode;
}

function createSpanNode(className: string, parentNode: Element): Element {
  const element = {
    nodeName: 'span',
    tagName: 'span',
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    attrs: [{ name: 'class', value: className }],
    childNodes: [],
    parentNode
  } as Element;
  return element;
}

function createItalicONode(value: 'o' | 'O', parentNode: Element): Element {
  const element = createSpanNode(headingItalicOClass, parentNode);
  element.childNodes = [createTextNode(value, element)];
  return element;
}

function textContent(node: Node): string {
  if (isTextNode(node)) {
    return node.value;
  }

  if (!isElement(node)) {
    return '';
  }

  return node.childNodes.map((child) => textContent(child)).join('');
}

function hasAttribute(element: Element, name: string): boolean {
  return element.attrs.some((attribute) => attribute.name === name);
}

function addAccessibleHeadingName(element: Element): void {
  if (!headingTags.has(element.tagName) || hasAttribute(element, 'aria-label')) {
    return;
  }

  const label = textContent(element).replace(/\s+/g, ' ').trim();
  if (!/[oO]/.test(label)) {
    return;
  }

  element.attrs.push({ name: 'aria-label', value: label });
}

function createStyledWordNode(value: string, parentNode: Element): Element {
  const word = createSpanNode(headingItalicOWordClass, parentNode);
  let buffer = '';

  for (const character of value) {
    if (character === 'o' || character === 'O') {
      if (buffer) {
        word.childNodes.push(createTextNode(buffer, word));
        buffer = '';
      }

      word.childNodes.push(createItalicONode(character, word));
    } else {
      buffer += character;
    }
  }

  if (buffer) {
    word.childNodes.push(createTextNode(buffer, word));
  }

  return word;
}

function shouldStylePart(value: string) {
  const wordCharacters = value.match(/[\p{L}\p{N}]/gu) ?? [];
  return wordCharacters.length > 1 && /[oO]/.test(value);
}

function splitHeadingTextNode(node: TextNode, parentNode: Element): ChildNode[] {
  if (!/[oO]/.test(node.value)) {
    return [node];
  }

  return node.value.split(/(\s+)/).map((part) => {
    if (!part || /^\s+$/.test(part) || !shouldStylePart(part)) {
      return createTextNode(part, parentNode);
    }

    return createStyledWordNode(part, parentNode);
  });
}

function transformChildren(element: Element, insideHeading: boolean) {
  const nextChildren: ChildNode[] = [];

  for (const child of element.childNodes) {
    if (isTextNode(child) && insideHeading) {
      nextChildren.push(...splitHeadingTextNode(child, element));
      continue;
    }

    if (isElement(child)) {
      const childIsStyled = isAlreadyStyledElement(child);
      transformChildren(child, insideHeading && !childIsStyled);
    }

    nextChildren.push(child);
  }

  element.childNodes = nextChildren;
}

function walk(node: Node, insideHeading = false) {
  if (!isElement(node)) {
    return;
  }

  const nodeIsHeading = isHeadingElement(node);
  const nodeIsStyled = isAlreadyStyledElement(node);
  const nextInsideHeading = (insideHeading || nodeIsHeading) && !nodeIsStyled;

  if (nodeIsHeading && !nodeIsStyled) {
    addAccessibleHeadingName(node);
  }

  transformChildren(node, nextInsideHeading);

  for (const child of node.childNodes) {
    walk(child, nextInsideHeading);
  }
}

export function styleHeadingText(value: string) {
  return value
    .split(/(\s+)/)
    .map((part) => {
      if (!shouldStylePart(part) || /^\s+$/.test(part)) {
        return escapeHtml(part);
      }

      const styledWord = [...part]
        .map((character) => {
          const escapedCharacter = escapeHtml(character);
          return character === 'o' || character === 'O'
            ? `<span class="${headingItalicOClass}">${escapedCharacter}</span>`
            : escapedCharacter;
        })
        .join('');

      return `<span class="${headingItalicOWordClass}">${styledWord}</span>`;
    })
    .join('');
}

export function transformHeadingItalicOHtml(html: string) {
  const document = parse(html);

  for (const child of document.childNodes) {
    walk(child);
  }

  return serialize(document);
}

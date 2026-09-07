import { styleHeadingText } from '@/lib/typography/heading-italic-o';
import { motionConfig } from './config';
import { isFinePointer, prefersReducedMotion } from './reduced-motion';

type GsapTarget = string | Element | Element[] | HTMLElement[] | NodeListOf<Element>;
type GsapVars = Record<string, unknown>;
type Gsap = {
  registerPlugin: (...plugins: unknown[]) => void;
  set: (target: GsapTarget, vars: GsapVars) => void;
  to: (target: GsapTarget, vars: GsapVars) => void;
  fromTo: (target: GsapTarget, fromVars: GsapVars, toVars: GsapVars) => void;
  quickTo: (target: GsapTarget, property: string, vars: GsapVars) => (value: number) => void;
};
type ScrollTrigger = {
  refresh: () => void;
  getAll: () => Array<{ refresh: () => void }>;
};

const revealSelector = '[data-reveal]';
const lineRevealSelector = '[data-reveal="line"]';
const mediaRevealSelector = '[data-reveal="media"]';
const headingAccentClasses = [
  'nm-heading-accent',
  'nm-heading-muted',
  'nm-heading-marker',
  'nm-heading-marker--strong'
] as const;

type HeadingAccentClass = (typeof headingAccentClasses)[number];
type TextRun = {
  start: number;
  end: number;
  classes: HeadingAccentClass[];
};

function delayFor(target: HTMLElement): number {
  const parsed = Number.parseInt(target.dataset.revealDelay ?? '0', 10);
  const delayIndex = Number.isNaN(parsed)
    ? 0
    : Math.min(Math.max(parsed, 0), motionConfig.maxDelayIndex);
  const step = window.innerWidth < 768 ? motionConfig.mobileDelayStepMs : motionConfig.delayStepMs;
  return (delayIndex * step) / 1000;
}

function applyStagger(root: HTMLElement): HTMLElement[] {
  const stagger = Number.parseInt(root.dataset.revealStagger ?? '0', 10);
  if (!stagger) return [];

  return Array.from(root.children).flatMap((child, index) => {
    if (!(child instanceof HTMLElement)) return [];
    if (!child.dataset.reveal) child.dataset.reveal = 'up';
    child.dataset.revealDelay = String(Math.min(index, motionConfig.maxDelayIndex));
    return [child];
  });
}

function collectRevealTargets(): HTMLElement[] {
  const roots = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
  return Array.from(new Set([...roots, ...roots.flatMap(applyStagger)]));
}

function elementIsNearViewport(target: HTMLElement): boolean {
  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom >= 0 && rect.top <= viewportHeight * 1.04;
}

function headingTargets(root: HTMLElement): HTMLElement[] {
  if (
    /^H[1-4]$/.test(root.tagName) ||
    root.classList.contains('nm-heading') ||
    root.classList.contains('nm-display-heading')
  ) {
    return [root];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, .nm-heading, .nm-display-heading')
  );
}

function inheritedAccentClasses(element: Element | null): HeadingAccentClass[] {
  const classes = new Set<HeadingAccentClass>();
  let current: Element | null = element;

  while (current) {
    headingAccentClasses.forEach((className) => {
      if (current?.classList.contains(className)) classes.add(className);
    });
    current = current.parentElement;
  }

  return [...classes];
}

function collectTextRuns(root: HTMLElement): TextRun[] {
  const runs: TextRun[] = [];
  let cursor = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.textContent ?? '';
    const classes = inheritedAccentClasses(node.parentElement);
    if (classes.length > 0 && value.length > 0) {
      runs.push({ start: cursor, end: cursor + value.length, classes });
    }
    cursor += value.length;
  }

  return runs;
}

function classesForRange(runs: TextRun[], start: number, end: number): string {
  const classes = new Set<HeadingAccentClass>();

  runs.forEach((run) => {
    if (start < run.end && end > run.start) {
      run.classes.forEach((className) => classes.add(className));
    }
  });

  return [...classes].join(' ');
}

function splitHeadingWords(heading: HTMLElement): HTMLElement[] {
  if (heading.dataset.motionLineSplit === 'ready') {
    return Array.from(heading.querySelectorAll<HTMLElement>('.nm-motion-word'));
  }

  const text = heading.textContent ?? heading.getAttribute('aria-label') ?? '';
  if (!text.trim()) return [];

  const runs = collectTextRuns(heading);
  let cursor = 0;
  heading.dataset.motionLineSplit = 'ready';
  heading.innerHTML = text
    .split(/(\s+)/)
    .map((part) => {
      const start = cursor;
      const end = start + part.length;
      cursor = end;
      if (!part) return '';
      if (/^\s+$/.test(part)) return part;
      const accentClasses = classesForRange(runs, start, end);
      return `<span class="nm-motion-word"><span class="nm-motion-word__inner${accentClasses ? ` ${accentClasses}` : ''}">${styleHeadingText(part)}</span></span>`;
    })
    .join('');

  return Array.from(heading.querySelectorAll<HTMLElement>('.nm-motion-word__inner'));
}

function lineIndexForWords(words: HTMLElement[]): Map<HTMLElement, number> {
  const tops: number[] = [];
  const indexes = new Map<HTMLElement, number>();

  words.forEach((word) => {
    const top = Math.round(word.getBoundingClientRect().top);
    let lineIndex = tops.findIndex((value) => Math.abs(value - top) <= 2);
    if (lineIndex === -1) {
      lineIndex = tops.length;
      tops.push(top);
    }
    indexes.set(word, lineIndex);
  });

  return indexes;
}

function initialVarsFor(target: HTMLElement) {
  const variant = target.dataset.reveal;
  if (variant === 'down') return { opacity: 0, y: -18, filter: 'blur(6px)' };
  if (variant === 'scale') return { opacity: 0, y: 18, scale: 0.965, filter: 'blur(8px)' };
  if (variant === 'media')
    return {
      opacity: 0,
      y: 36,
      scale: 0.94,
      clipPath: 'inset(8% round 1.25rem)',
      filter: 'brightness(0.92) blur(10px)'
    };
  if (variant === 'line') return { opacity: 1 };
  if (variant === 'fade') return { opacity: 0 };
  return { opacity: 0, y: 28, filter: 'blur(8px)' };
}

function finalVarsFor(target: HTMLElement) {
  const variant = target.dataset.reveal;
  if (variant === 'media')
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: 'inset(0% round 0rem)',
      filter: 'brightness(1) blur(0px)'
    };
  if (variant === 'line') return { opacity: 1 };
  return { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' };
}

function revealWithGsap(gsap: Gsap, ScrollTrigger: ScrollTrigger): void {
  const targets = collectRevealTargets().filter(
    (target) => target.dataset.motionState !== 'revealed'
  );
  targets.forEach((target) => {
    target.dataset.motionState = 'ready';
    target.dataset.motionReveal = 'ready';

    if (target.matches(lineRevealSelector)) {
      const headings = headingTargets(target);
      const words = headings.flatMap(splitHeadingWords);
      if (words.length > 0) {
        const lineIndexes = lineIndexForWords(words);
        gsap.set(words, { yPercent: 112, opacity: 0, rotate: 0.001 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.82,
          ease: 'expo.out',
          stagger: (index: number, element: Element) =>
            (lineIndexes.get(element as HTMLElement) ?? index) * 0.075,
          delay: delayFor(target),
          scrollTrigger: {
            trigger: target,
            start: 'top 94%',
            once: true
          },
          onStart: () => {
            target.dataset.motionState = 'revealed';
            target.classList.add('is-visible');
          }
        });
        return;
      }
    }

    gsap.set(target, initialVarsFor(target));
    gsap.to(target, {
      ...finalVarsFor(target),
      duration: target.matches(mediaRevealSelector) ? 0.96 : 0.72,
      ease: target.matches(mediaRevealSelector) ? 'power4.out' : 'expo.out',
      delay: delayFor(target),
      scrollTrigger: {
        trigger: target,
        start: 'top 96%',
        once: true
      },
      onStart: () => {
        target.dataset.motionState = 'revealed';
        target.classList.add('is-visible');
      },
      onComplete: () => {
        target.style.removeProperty('filter');
      }
    });
  });

  window.requestAnimationFrame(() => {
    targets.forEach((target) => {
      if (target.dataset.motionState === 'revealed') return;
      if (elementIsNearViewport(target)) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.refresh());
      }
    });
  });
}

function enhanceMediaScroll(gsap: Gsap): void {
  document
    .querySelectorAll<HTMLElement>(
      '.project-card__media img, .service-tile img, .landscape-cta__image img, .insight-card img'
    )
    .forEach((image) => {
      gsap.fromTo(
        image,
        { scale: 1.035, filter: 'brightness(0.96)' },
        {
          scale: 1,
          filter: 'brightness(1)',
          ease: 'none',
          scrollTrigger: {
            trigger: image,
            start: 'top 98%',
            end: 'bottom 18%',
            scrub: 0.8
          }
        }
      );
    });
}

function enhanceCursorPreview(gsap: Gsap): void {
  if (!isFinePointer()) return;
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card, .insight-card'));
  if (cards.length === 0 || document.querySelector('.motion-image-preview')) return;

  const preview = document.createElement('div');
  preview.className = 'motion-image-preview';
  preview.setAttribute('aria-hidden', 'true');
  const previewImage = document.createElement('img');
  preview.append(previewImage);
  document.body.append(preview);

  const quickX = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3.out' });
  const quickY = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3.out' });

  document.addEventListener(
    'pointermove',
    (event) => {
      quickX(event.clientX + 24);
      quickY(event.clientY + 24);
    },
    { passive: true }
  );

  cards.forEach((card) => {
    const image = card.querySelector<HTMLImageElement>('img');
    if (!image) return;
    card.addEventListener('pointerenter', () => {
      previewImage.src = image.currentSrc || image.src;
      preview.dataset.visible = 'true';
      gsap.fromTo(
        preview,
        { opacity: 0, scale: 0.92, y: '+=10' },
        { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: 'power3.out' }
      );
    });
    card.addEventListener('pointerleave', () => {
      preview.dataset.visible = 'false';
      gsap.to(preview, { opacity: 0, scale: 0.96, duration: 0.18, ease: 'power2.out' });
    });
  });
}

function enhanceScrollProgress(gsap: Gsap): void {
  document
    .querySelectorAll<HTMLElement>('.approval-grid article, .process-tabs article')
    .forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 36, opacity: 0.55 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            end: 'top 48%',
            scrub: 0.7
          },
          delay: index * 0.02
        }
      );
    });
}

function enhanceAgencyTimeline(gsap: Gsap): void {
  const timeline = document.querySelector<HTMLElement>('[data-agency-timeline]');
  if (!timeline) return;
  const progress = timeline.querySelector<HTMLElement>('[data-agency-timeline-progress]');
  const steps = Array.from(timeline.querySelectorAll<HTMLElement>('[data-agency-timeline-step]'));

  if (progress) {
    gsap.fromTo(
      progress,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 62%',
          end: 'bottom 72%',
          scrub: 0.7
        }
      }
    );
  }

  steps.forEach((step) => {
    gsap.fromTo(
      step,
      { opacity: 0.42, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 78%',
          once: true
        }
      }
    );
  });
}

export async function initGsapMotion(): Promise<boolean> {
  if (prefersReducedMotion()) return false;

  try {
    const [gsapModule, scrollTriggerModule] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]);
    const gsap = gsapModule.gsap as Gsap;
    const ScrollTrigger = scrollTriggerModule.ScrollTrigger as ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('motion-gsap');
    document.documentElement.dataset.motionEngine = 'gsap';
    revealWithGsap(gsap, ScrollTrigger);
    enhanceMediaScroll(gsap);
    enhanceScrollProgress(gsap);
    enhanceAgencyTimeline(gsap);
    enhanceCursorPreview(gsap);
    window.setTimeout(() => ScrollTrigger.refresh(), 250);
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
    return true;
  } catch (error) {
    console.warn('[motion] GSAP unavailable, falling back to CSS reveal.', error);
    return false;
  }
}

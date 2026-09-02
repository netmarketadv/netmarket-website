import { motionConfig } from './config';
import { prefersReducedMotion } from './reduced-motion';

const debugEnabled = () => new URLSearchParams(window.location.search).get('motionDebug') === '1';

function debug(message: string, element?: Element): void {
  if (!debugEnabled()) return;
  console.info(`[motion] ${message}`, element ?? '');
}

function clampDelayIndex(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), motionConfig.maxDelayIndex);
}

function reveal(target: HTMLElement, immediate = false): void {
  target.dataset.motionState = 'revealed';
  target.classList.add('is-visible');
  if (immediate) {
    target.style.setProperty('--nm-reveal-delay', '0ms');
  }
  window.setTimeout(() => {
    target.style.removeProperty('--nm-reveal-delay');
  }, motionConfig.revealFailsafeDelayMs);
}

function prepare(target: HTMLElement): void {
  if (target.dataset.motionState === 'revealed') return;
  target.dataset.motionState = 'ready';
  target.dataset.motionReveal = 'ready';
}

function isPastOrNearViewport(target: HTMLElement): boolean {
  const rect = target.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom >= 0 && rect.top <= viewportHeight * 1.08;
}

function isAboveViewport(target: HTMLElement): boolean {
  return target.getBoundingClientRect().bottom < 0;
}

function delayFor(target: HTMLElement): number {
  const delayIndex = clampDelayIndex(target.dataset.revealDelay);
  const step = window.innerWidth < 768 ? motionConfig.mobileDelayStepMs : motionConfig.delayStepMs;
  return delayIndex * step;
}

function applyStagger(root: HTMLElement): HTMLElement[] {
  const stagger = Number.parseInt(root.dataset.revealStagger ?? '0', 10);
  if (!stagger) return [];

  return Array.from(root.children).flatMap((child, index) => {
    if (!(child instanceof HTMLElement)) return [];
    if (!child.dataset.reveal) child.dataset.reveal = 'up';
    const delay = Math.min(index, motionConfig.maxDelayIndex) * stagger * (window.innerWidth < 768 ? 20 : 28);
    child.style.setProperty('--nm-reveal-delay', `${delay}ms`);
    return [child];
  });
}

function collectTargets(): HTMLElement[] {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const staggerChildren = roots.flatMap(applyStagger);
  return Array.from(new Set([...roots, ...staggerChildren]));
}

function revealEligibleTargets(targets: HTMLElement[], observer?: IntersectionObserver): void {
  targets.forEach((target) => {
    if (target.dataset.motionState === 'revealed') return;
    if (isAboveViewport(target)) {
      reveal(target, true);
      observer?.unobserve(target);
      debug('revealed above viewport', target);
      return;
    }
    if (isPastOrNearViewport(target)) {
      reveal(target);
      observer?.unobserve(target);
      debug('revealed in viewport', target);
    }
  });
}

export function initReveal(): void {
  const targets = collectTargets().filter((target) => target.dataset.motionReveal !== 'ready' && target.dataset.motionState !== 'revealed');
  if (targets.length === 0) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((target) => reveal(target, true));
    return;
  }

  targets.forEach((target) => {
    const currentDelay = target.style.getPropertyValue('--nm-reveal-delay');
    if (!currentDelay) target.style.setProperty('--nm-reveal-delay', `${delayFor(target)}ms`);
    prepare(target);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        reveal(target);
        observer.unobserve(target);
        debug('revealed by observer', target);
      });
    },
    {
      rootMargin: motionConfig.revealRootMargin,
      threshold: motionConfig.revealThreshold
    }
  );

  window.requestAnimationFrame(() => {
    targets.forEach((target) => {
      if (target.dataset.motionState === 'revealed') return;
      observer.observe(target);
    });

    window.requestAnimationFrame(() => revealEligibleTargets(targets, observer));
  });

  window.setTimeout(() => revealEligibleTargets(targets, observer), motionConfig.revealFailsafeDelayMs);

  let resizeFrame = 0;
  const refresh = () => {
    resizeFrame = 0;
    revealEligibleTargets(targets, observer);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(refresh);
    },
    { passive: true }
  );
  window.addEventListener(
    'resize',
    () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(refresh);
    },
    { passive: true }
  );
  window.addEventListener('pageshow', () => revealEligibleTargets(targets, observer), { once: true });
  document.fonts?.ready.then(() => revealEligibleTargets(targets, observer)).catch(() => undefined);
}

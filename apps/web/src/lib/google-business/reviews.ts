interface ReviewElements {
  carousel: HTMLElement;
  track: HTMLElement;
  cards: HTMLElement[];
  modal: HTMLDialogElement | null;
}

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getElements(carousel: HTMLElement): ReviewElements | null {
  const track = carousel.querySelector<HTMLElement>('[data-reviews-track]');
  if (!track) return null;

  return {
    carousel,
    track,
    cards: Array.from(track.querySelectorAll<HTMLElement>('[data-review-card]:not([aria-hidden="true"])')),
    modal: carousel.querySelector<HTMLDialogElement>('[data-review-modal]')
  };
}

function updateTruncation(card: HTMLElement): void {
  const quote = card.querySelector<HTMLElement>('[data-review-text-node]');
  const trigger = card.querySelector<HTMLButtonElement>('[data-review-open]');
  if (!quote || !trigger) return;

  const isTruncated = quote.scrollHeight > quote.clientHeight + 2;
  card.dataset.truncated = String(isTruncated);
  trigger.hidden = !isTruncated;
}

function cloneForLoop(elements: ReviewElements): void {
  if (elements.track.dataset.loopReady === 'true') return;

  const clones = elements.cards.map((card) => {
    const clone = card.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    clone.querySelectorAll('a, button').forEach((node) => {
      node.setAttribute('tabindex', '-1');
    });
    return clone;
  });

  elements.track.append(...clones);
  elements.track.dataset.loopReady = 'true';
}

function normalizeLoopPosition(track: HTMLElement): void {
  const midpoint = track.scrollWidth / 2;
  if (midpoint <= 0) return;

  if (track.scrollLeft >= midpoint) {
    track.scrollLeft -= midpoint;
  }
}

function getCardStep(elements: ReviewElements): number {
  const first = elements.cards[0];
  if (!first) return Math.round(elements.track.clientWidth * 0.82);

  const styles = window.getComputedStyle(elements.track);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');
  return first.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
}

function scrollByCard(elements: ReviewElements, direction: 1 | -1): void {
  const behavior: ScrollBehavior = reducedMotionQuery.matches ? 'auto' : 'smooth';
  const step = getCardStep(elements);
  const midpoint = elements.track.scrollWidth / 2;
  if (direction === -1 && elements.track.scrollLeft <= step * 0.25 && midpoint > step) {
    elements.track.scrollLeft = midpoint;
  }
  elements.track.scrollBy({ left: step * direction, behavior });
}

function setModalStars(modal: HTMLDialogElement, rating: number): void {
  const stars = modal.querySelector<HTMLElement>('[data-review-modal-stars]');
  if (!stars) return;

  stars.replaceChildren();
  stars.setAttribute('aria-label', `Valutazione: ${rating} su 5`);
  for (let index = 0; index < rating; index += 1) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    star.setAttribute('viewBox', '0 0 24 24');
    star.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', 'M12 3.5l2.58 5.23 5.77.84-4.17 4.07.98 5.74L12 16.66l-5.16 2.72.98-5.74-4.17-4.07 5.77-.84L12 3.5z');
    path.setAttribute('fill', 'currentColor');
    star.append(path);
    stars.append(star);
  }
}

function restoreFocus(modal: HTMLDialogElement): void {
  const previousFocus = text(modal.dataset.previousFocus);
  if (!previousFocus) return;
  document.getElementById(previousFocus)?.focus();
}

function openReviewModal(card: HTMLElement, modal: HTMLDialogElement): void {
  const author = text(card.dataset.reviewAuthor);
  const source = text(card.dataset.reviewSource) || 'Google';
  const quote = text(card.dataset.reviewText);
  const avatar = text(card.dataset.reviewAvatar);
  const rating = Math.max(1, Math.min(5, Number.parseInt(card.dataset.reviewRating ?? '5', 10)));

  modal.querySelector('[data-review-modal-author]')!.textContent = author;
  modal.querySelector('[data-review-modal-source]')!.textContent = source;
  modal.querySelector('[data-review-modal-text]')!.textContent = quote;

  const image = modal.querySelector<HTMLImageElement>('[data-review-modal-avatar]');
  if (image) {
    image.src = avatar;
    image.hidden = !avatar;
  }

  setModalStars(modal, rating);

  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (focused) {
    const id = focused.id || `review-focus-${Date.now()}`;
    focused.id = id;
    modal.dataset.previousFocus = id;
  }

  document.documentElement.classList.add('has-review-modal');
  modal.showModal();
  modal.querySelector<HTMLButtonElement>('[data-review-modal-close]')?.focus();
}

function closeReviewModal(modal: HTMLDialogElement): void {
  if (modal.open) modal.close();
}

function bindModal(elements: ReviewElements): void {
  if (!elements.modal) return;
  const modal = elements.modal;

  elements.carousel.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>('[data-review-open]');
    if (!trigger) return;

    const card = trigger.closest<HTMLElement>('[data-review-card]');
    if (!card) return;
    openReviewModal(card, modal);
  });

  modal.querySelector('[data-review-modal-close]')?.addEventListener('click', () => closeReviewModal(modal));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeReviewModal(modal);
  });
  modal.addEventListener('close', () => {
    document.documentElement.classList.remove('has-review-modal');
    restoreFocus(modal);
  });
}

function bindCarousel(elements: ReviewElements): void {
  elements.carousel.querySelector('[data-reviews-prev]')?.addEventListener('click', () => scrollByCard(elements, -1));
  elements.carousel.querySelector('[data-reviews-next]')?.addEventListener('click', () => scrollByCard(elements, 1));

  let frame = 0;
  elements.track.addEventListener('scroll', () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => normalizeLoopPosition(elements.track));
  }, { passive: true });

  const resizeObserver = new ResizeObserver(() => {
    for (const card of elements.cards) updateTruncation(card);
    normalizeLoopPosition(elements.track);
  });

  for (const card of elements.cards) {
    updateTruncation(card);
    resizeObserver.observe(card);
  }
}

function initCarousel(root: HTMLElement): void {
  const elements = getElements(root);
  if (!elements || elements.cards.length === 0) return;

  for (const card of elements.cards) updateTruncation(card);
  cloneForLoop(elements);
  bindCarousel(elements);
  bindModal(elements);
  root.dataset.ready = 'true';
}

export function initReviewsCarousel(): void {
  document.querySelectorAll<HTMLElement>('[data-reviews-carousel]').forEach(initCarousel);
}

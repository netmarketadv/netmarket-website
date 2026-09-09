const AUTOPLAY_SPEED = 18;
const RESUME_DELAY = 3200;
const DRAG_THRESHOLD = 5;

type RailState = {
  loopWidth: number;
  dragging: boolean;
  dragged: boolean;
  startPointerX: number;
  lastPointerX: number;
  resumeTimer: number;
  visible: boolean;
  backwardWrapEnabled: boolean;
};

function initRail(viewport: HTMLElement) {
  if (viewport.dataset.infiniteRailReady === 'true') return;

  const track = viewport.querySelector<HTMLElement>('[data-infinite-rail-track]');
  const firstItem = track?.firstElementChild as HTMLElement | null;
  const cloneStart = track?.querySelector<HTMLElement>('[data-infinite-rail-clone-start]');

  if (!track || !firstItem || !cloneStart) return;

  const state: RailState = {
    loopWidth: 0,
    dragging: false,
    dragged: false,
    startPointerX: 0,
    lastPointerX: 0,
    resumeTimer: 0,
    visible: true,
    backwardWrapEnabled: false
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let autoplayPaused = false;
  let previousFrame = 0;

  const measure = () => {
    state.loopWidth = cloneStart.offsetLeft - firstItem.offsetLeft;
  };

  const normalize = () => {
    if (state.loopWidth <= 0) return;

    if (viewport.scrollLeft >= state.loopWidth) {
      viewport.scrollLeft -= state.loopWidth;
    } else if (state.backwardWrapEnabled && viewport.scrollLeft <= 0) {
      viewport.scrollLeft += state.loopWidth;
    }
  };

  const pause = () => {
    window.clearTimeout(state.resumeTimer);
    autoplayPaused = true;
    viewport.classList.add('is-paused');
  };

  const resumeLater = () => {
    window.clearTimeout(state.resumeTimer);
    state.resumeTimer = window.setTimeout(() => {
      autoplayPaused = false;
      viewport.classList.remove('is-paused');
    }, RESUME_DELAY);
  };

  const finishDrag = () => {
    if (!state.dragging) return;
    state.dragging = false;
    viewport.classList.remove('is-dragging');
    resumeLater();
  };

  viewport.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    pause();
    state.backwardWrapEnabled = true;
    if (viewport.scrollLeft <= 0) viewport.scrollLeft = state.loopWidth;
    state.dragging = true;
    state.dragged = false;
    state.startPointerX = event.clientX;
    state.lastPointerX = event.clientX;
    viewport.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (event) => {
    if (!state.dragging) return;
    const delta = event.clientX - state.lastPointerX;
    state.lastPointerX = event.clientX;
    if (Math.abs(event.clientX - state.startPointerX) >= DRAG_THRESHOLD) state.dragged = true;
    if (!state.dragged) return;
    event.preventDefault();
    viewport.scrollLeft -= delta;
    normalize();
  });

  window.addEventListener('mouseup', finishDrag);
  window.addEventListener('blur', finishDrag);
  viewport.addEventListener('dragstart', (event) => event.preventDefault());
  viewport.addEventListener(
    'touchstart',
    () => {
      state.backwardWrapEnabled = true;
      if (viewport.scrollLeft <= 0) viewport.scrollLeft = state.loopWidth;
    },
    { passive: true }
  );

  viewport.addEventListener(
    'click',
    (event) => {
      if (!state.dragged) return;
      event.preventDefault();
      event.stopPropagation();
      state.dragged = false;
    },
    true
  );

  let scrollFrame = 0;
  viewport.addEventListener(
    'scroll',
    () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(normalize);
    },
    { passive: true }
  );

  viewport.addEventListener('wheel', () => {
    pause();
    resumeLater();
  }, { passive: true });

  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resumeLater);
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', resumeLater);

  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    pause();
    state.backwardWrapEnabled = true;
    if (viewport.scrollLeft <= 0) viewport.scrollLeft = state.loopWidth;
    viewport.scrollBy({
      left: event.key === 'ArrowRight' ? viewport.clientWidth * 0.72 : -viewport.clientWidth * 0.72,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
    resumeLater();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      state.visible = entry?.isIntersecting ?? false;
    },
    { rootMargin: '160px 0px' }
  );
  observer.observe(viewport);

  const resizeObserver = new ResizeObserver(() => {
    const progress = state.loopWidth > 0 ? viewport.scrollLeft / state.loopWidth : 0;
    measure();
    if (state.loopWidth > 0) viewport.scrollLeft = Math.max(1, progress * state.loopWidth);
  });
  resizeObserver.observe(track);

  const tick = (time: number) => {
    const elapsed = previousFrame ? Math.min(time - previousFrame, 50) : 0;
    previousFrame = time;

    if (
      elapsed > 0 &&
      state.visible &&
      !autoplayPaused &&
      !state.dragging &&
      finePointer.matches &&
      !reducedMotion.matches &&
      !document.hidden
    ) {
      viewport.scrollLeft += (AUTOPLAY_SPEED * elapsed) / 1000;
      normalize();
    }

    window.requestAnimationFrame(tick);
  };

  measure();
  viewport.scrollLeft = 1;
  viewport.dataset.infiniteRailReady = 'true';
  window.requestAnimationFrame(tick);
}

export function initInfiniteHorizontalRails(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-infinite-rail]').forEach(initRail);
}

export function initAdvertisingLanding(): void {
  const root = document.querySelector<HTMLElement>('.adv-page');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const message = document.querySelector<HTMLTextAreaElement>('#contact-message');
  root.querySelectorAll<HTMLAnchorElement>('[data-advertising-goal]').forEach((link) => {
    link.addEventListener('click', () => {
      if (message && !message.value.trim()) {
        message.value = `Il nostro obiettivo: ${link.dataset.advertisingGoal}.\n\n`;
        message.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
  root.querySelectorAll<HTMLAnchorElement>('.adv-project-rail a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const detail = document.getElementById(link.hash.slice(1));
      if (detail instanceof HTMLDetailsElement) detail.open = true;
    });
  });
  const openHash = () => {
    const detail = document.getElementById(window.location.hash.slice(1));
    if (detail instanceof HTMLDetailsElement) detail.open = true;
  };
  openHash();
  window.addEventListener('hashchange', openHash);

  const rail = root.querySelector<HTMLElement>('[data-project-rail]');
  const previous = root.querySelector<HTMLButtonElement>('[data-project-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-project-next]');
  if (rail && previous && next) {
    const update = () => {
      previous.disabled = rail.scrollLeft < 2;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    };
    const move = (direction: number) => {
      const first = rail.firstElementChild;
      const gap = Number.parseFloat(getComputedStyle(rail).gap) || 0;
      rail.scrollBy({
        left: direction * ((first?.getBoundingClientRect().width || rail.clientWidth) + gap),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    rail.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(rail);
    update();
  }
  const choices = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-market-choice]'));
  const map = root.querySelector<HTMLElement>('[data-market-map]');
  let selectedMarket = 'Sul territorio';
  choices.forEach((choice) => {
    choice.addEventListener('click', () => {
      const value = choice.dataset.marketChoice;
      choices.forEach((button) => button.setAttribute('aria-pressed', String(button === choice)));
      root.querySelectorAll<HTMLElement>('[data-market-copy]').forEach((copy) => {
        copy.hidden = copy.dataset.marketCopy !== value;
      });
      if (map && value) map.dataset.marketMap = value;
      selectedMarket = choice.textContent?.trim() || 'Sul territorio';
    });
  });
  root.querySelector('[data-market-contact]')?.addEventListener('click', () => {
    if (message && !message.value.trim()) {
      message.value = `Vorremmo sviluppare il nostro mercato: ${selectedMarket.toLowerCase()}.\n\n`;
      message.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

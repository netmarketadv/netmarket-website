import { motionConfig } from './config';
import { isFinePointer, prefersReducedMotion } from './reduced-motion';
import { initReveal } from './reveal';

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  if (header.dataset.motionHeader === 'ready') return;
  header.dataset.motionHeader = 'ready';

  let ticking = false;
  const update = () => {
    header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function initMegaMenus(): void {
  const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>('.mega-menu'));
  let closeTimer: number | undefined;

  const closeOthers = (current?: HTMLDetailsElement) => {
    menus.forEach((menu) => {
      if (menu !== current) menu.open = false;
    });
  };

  menus.forEach((menu) => {
    if (menu.dataset.motionMenu === 'ready') return;
    menu.dataset.motionMenu = 'ready';
    const summary = menu.querySelector('summary');
    if (!summary) return;
    summary.setAttribute('aria-haspopup', 'menu');
    summary.setAttribute('aria-expanded', String(menu.open));

    const sync = () => summary.setAttribute('aria-expanded', String(menu.open));
    menu.addEventListener('toggle', sync);

    menu.addEventListener('pointerenter', () => {
      if (!isFinePointer()) return;
      window.clearTimeout(closeTimer);
      closeOthers(menu);
      if (menu.dataset.pinned !== 'true') menu.open = true;
      sync();
    });

    menu.addEventListener('pointerleave', () => {
      if (!isFinePointer()) return;
      if (menu.dataset.pinned === 'true') return;
      closeTimer = window.setTimeout(() => {
        menu.open = false;
        sync();
      }, 170);
    });

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const shouldClose = menu.open && menu.dataset.pinned === 'true';
      closeOthers(menu);
      if (shouldClose) {
        delete menu.dataset.pinned;
        menu.open = false;
      } else {
        menu.dataset.pinned = 'true';
        menu.open = true;
      }
      sync();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const active = menus.find((menu) => menu.open);
    if (!active) return;
    delete active.dataset.pinned;
    active.open = false;
    active.querySelector('summary')?.focus();
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menus.some((menu) => menu.contains(target))) return;
    menus.forEach((menu) => delete menu.dataset.pinned);
    closeOthers();
  });
}

function initMobileMenu(): void {
  const menu = document.querySelector<HTMLDetailsElement>('.site-header__mobile');
  const summary = menu?.querySelector('summary');
  const focusables = Array.from(menu?.querySelectorAll<HTMLElement>('.site-header__mobile-links > a, .mobile-submenu > summary, .site-header__mobile-actions a, button') ?? []);
  const closers = Array.from(menu?.querySelectorAll<HTMLElement>('.site-header__mobile-panel a, .site-header__mobile-panel button') ?? []);
  const submenus = Array.from(menu?.querySelectorAll<HTMLDetailsElement>('.mobile-submenu') ?? []);
  if (!menu || !summary) return;
  if (menu.dataset.motionMobileMenu === 'ready') return;
  menu.dataset.motionMobileMenu = 'ready';

  summary.setAttribute('aria-expanded', String(menu.open));
  summary.setAttribute('aria-label', menu.open ? 'Chiudi menu' : 'Apri menu');

  submenus.forEach((submenu) => {
    const trigger = submenu.querySelector('summary');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', String(submenu.open));
    submenu.addEventListener('toggle', () => {
      trigger.setAttribute('aria-expanded', String(submenu.open));
      if (!submenu.open) return;
      submenus.forEach((other) => {
        if (other !== submenu) other.open = false;
      });
    });
  });

  menu.addEventListener('toggle', () => {
    summary.setAttribute('aria-expanded', String(menu.open));
    summary.setAttribute('aria-label', menu.open ? 'Chiudi menu' : 'Apri menu');
    document.documentElement.classList.toggle('has-mobile-menu', menu.open);
    if (menu.open) window.setTimeout(() => focusables[0]?.focus(), 80);
    if (!menu.open) submenus.forEach((submenu) => (submenu.open = false));
  });

  document.addEventListener('keydown', (event) => {
    if (!menu.open || event.key !== 'Escape') return;
    menu.open = false;
    summary.focus();
  });

  closers.forEach((closer) => {
    closer.addEventListener('click', () => {
      menu.open = false;
    });
  });
}

function initAccordions(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]'));
  const reduced = prefersReducedMotion();
  const animations = new WeakMap<HTMLElement, Animation>();

  buttons.forEach((button) => {
    if (button.dataset.motionAccordion === 'ready') return;
    button.dataset.motionAccordion = 'ready';
    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;
      button.setAttribute('aria-expanded', String(nextExpanded));
      animations.get(panel)?.cancel();
      panel.hidden = false;

      if (reduced) {
        panel.hidden = !nextExpanded;
        return;
      }

      const start = expanded ? panel.scrollHeight : 0;
      const end = nextExpanded ? panel.scrollHeight : 0;
      panel.style.overflow = 'hidden';
      const animation = panel.animate([{ height: `${start}px`, opacity: expanded ? 1 : 0 }, { height: `${end}px`, opacity: nextExpanded ? 1 : 0 }], {
        duration: 240,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });
      animations.set(panel, animation);
      animation.finished
        .catch(() => undefined)
        .finally(() => {
          if (animations.get(panel) !== animation) return;
          animations.delete(panel);
          panel.hidden = !nextExpanded;
          panel.style.height = '';
          panel.style.overflow = '';
        });
    });
  });
}

function initCountUp(): void {
  if (prefersReducedMotion()) return;

  const metrics = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-count]'));
  if (metrics.length === 0 || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target as HTMLElement;
      if (element.dataset.motionCountState === 'done') {
        observer.unobserve(element);
        return;
      }
      element.dataset.motionCountState = 'done';
      const finalValue = element.dataset.motionCount ?? element.textContent ?? '';
      const match = finalValue.match(/^(\D*)([\d,.]+)(.*)$/);
      if (!match) {
        observer.unobserve(element);
        return;
      }
      const prefix = match[1] ?? '';
      const number = match[2] ?? '';
      const suffix = match[3] ?? '';
      const target = Number.parseFloat(number.replace(',', '.'));
      if (Number.isNaN(target)) return;
      const startTime = performance.now();
      const decimals = number.includes('.') || number.includes(',') ? 1 : 0;

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / motionConfig.countDurationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        element.textContent = `${prefix}${current.toLocaleString('it-IT', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals
        })}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(tick);
        else element.textContent = finalValue;
      };

      window.requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  });

  metrics.forEach((metric) => observer.observe(metric));
}

function initCursorLabel(): void {
  if (!isFinePointer() || prefersReducedMotion()) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-cursor-label]'));
  if (targets.length === 0) return;
  if (document.querySelector('.motion-cursor-label')) return;

  const label = document.createElement('div');
  label.className = 'motion-cursor-label';
  label.setAttribute('aria-hidden', 'true');
  document.body.append(label);

  let frame = 0;
  let x = 0;
  let y = 0;

  const move = () => {
    label.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0) scale(1)`;
    frame = 0;
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(move);
    },
    { passive: true }
  );

  window.addEventListener(
    'blur',
    () => {
      label.dataset.visible = 'false';
    },
    { passive: true }
  );
  document.addEventListener('mouseleave', () => {
    label.dataset.visible = 'false';
  });

  targets.forEach((target) => {
    if (target.dataset.motionCursor === 'ready') return;
    target.dataset.motionCursor = 'ready';
    target.addEventListener('pointerenter', () => {
      label.textContent = target.dataset.cursorLabel ?? 'Guarda';
      label.dataset.visible = 'true';
    });
    target.addEventListener('pointerleave', () => {
      label.dataset.visible = 'false';
    });
  });
}

function initMagnetic(): void {
  if (!isFinePointer() || prefersReducedMotion()) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-motion-magnetic]'));

  targets.forEach((target) => {
    if (target.dataset.motionMagnetic === 'ready') return;
    target.dataset.motionMagnetic = 'ready';
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * motionConfig.magneticStrength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * motionConfig.magneticStrength;
      target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    target.addEventListener('pointerleave', () => {
      target.style.transform = '';
    });
  });
}

interface MotionInitOptions {
  useGsap?: boolean;
  useGsapForLines?: boolean;
}

export function initMotion(options: MotionInitOptions = {}): void {
  const { useGsap = true, useGsapForLines = false } = options;

  initHeader();
  if (useGsap) {
    void import('./gsap-motion')
      .then(({ initGsapMotion }) => initGsapMotion())
      .then((handled) => {
        if (!handled) initReveal();
      })
      .catch(() => initReveal());
  } else if (useGsapForLines && document.querySelector('[data-reveal="line"]')) {
    void import('./gsap-motion')
      .then(({ initGsapMotion }) => initGsapMotion({ lineOnly: true }))
      .then(() => initReveal())
      .catch(() => initReveal());
  } else {
    initReveal();
  }
  initMegaMenus();
  initMobileMenu();
  initAccordions();
  initCountUp();
  initCursorLabel();
  initMagnetic();
}

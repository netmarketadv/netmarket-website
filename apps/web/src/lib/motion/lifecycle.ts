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
  const summary = menu?.querySelector<HTMLElement>(':scope > summary');
  const panel = menu?.querySelector<HTMLElement>(':scope > .site-header__mobile-panel');
  const focusables = Array.from(menu?.querySelectorAll<HTMLElement>('.site-header__mobile-links > a, .mobile-submenu > summary, button') ?? []);
  const closers = Array.from(menu?.querySelectorAll<HTMLElement>('.site-header__mobile-panel a, .site-header__mobile-panel button') ?? []);
  const submenus = Array.from(menu?.querySelectorAll<HTMLDetailsElement>('.mobile-submenu') ?? []);
  if (!menu || !summary || !panel) return;
  if (menu.dataset.motionMobileMenu === 'ready') return;
  menu.dataset.motionMobileMenu = 'ready';

  const reduced = prefersReducedMotion();
  const rootStyles = getComputedStyle(document.documentElement);
  const readDuration = (property: string, fallback: number) => {
    const value = Number.parseFloat(rootStyles.getPropertyValue(property));
    return Number.isFinite(value) ? value : fallback;
  };
  const baseDuration = readDuration('--nm-motion-duration-base', 320);
  const fastDuration = readDuration('--nm-motion-duration-fast', 190);
  const menuOpenDuration = baseDuration + fastDuration / 2;
  const emphasizedEase =
    rootStyles.getPropertyValue('--nm-motion-ease-emphasized').trim() ||
    'cubic-bezier(0.16, 1, 0.16, 1)';
  const layoutEase =
    rootStyles.getPropertyValue('--nm-motion-ease-layout').trim() ||
    'cubic-bezier(0.22, 1, 0.25, 1)';
  const exitEase =
    rootStyles.getPropertyValue('--nm-motion-ease-exit').trim() || 'cubic-bezier(0.4, 0, 1, 1)';
  const submenuAnimations = new WeakMap<HTMLDetailsElement, Animation>();
  let menuAnimation: Animation | undefined;

  const syncMenuA11y = (open: boolean) => {
    summary.setAttribute('aria-expanded', String(open));
    summary.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  };

  const resetSubmenu = (submenu: HTMLDetailsElement) => {
    submenuAnimations.get(submenu)?.cancel();
    submenuAnimations.delete(submenu);
    submenu.open = false;
    submenu.dataset.submenuState = 'closed';
    submenu.querySelector<HTMLElement>(':scope > summary')?.setAttribute('aria-expanded', 'false');
    const submenuPanel = submenu.querySelector<HTMLElement>(':scope > .mobile-submenu__panel');
    submenuPanel?.removeAttribute('style');
  };

  const animateSubmenu = (submenu: HTMLDetailsElement, shouldOpen: boolean) => {
    const trigger = submenu.querySelector<HTMLElement>(':scope > summary');
    const submenuPanel = submenu.querySelector<HTMLElement>(':scope > .mobile-submenu__panel');
    if (!trigger || !submenuPanel) return;

    const running = submenuAnimations.get(submenu);
    if (running) {
      try {
        running.commitStyles();
      } catch {
        // Older WebKit versions do not expose commitStyles.
      }
      running.cancel();
    }

    const wasOpen = submenu.open;
    const currentHeight = wasOpen ? submenuPanel.getBoundingClientRect().height : 0;
    const currentOpacity = wasOpen
      ? Number.parseFloat(getComputedStyle(submenuPanel).opacity) || 1
      : 0;

    if (shouldOpen && !wasOpen) submenu.open = true;
    trigger.setAttribute('aria-expanded', String(shouldOpen));
    submenu.dataset.submenuState = shouldOpen ? 'opening' : 'closing';

    if (reduced) {
      submenu.open = shouldOpen;
      submenu.dataset.submenuState = shouldOpen ? 'open' : 'closed';
      submenuPanel.removeAttribute('style');
      return;
    }

    submenuPanel.style.height = `${currentHeight}px`;
    submenuPanel.style.overflow = 'hidden';
    const targetHeight = shouldOpen ? submenuPanel.scrollHeight : 0;
    const progress = Math.abs(targetHeight - currentHeight) / Math.max(submenuPanel.scrollHeight, 1);
    const duration = Math.max(90, (shouldOpen ? baseDuration : fastDuration) * progress);
    const animation = submenuPanel.animate(
      [
        {
          height: `${currentHeight}px`,
          opacity: currentOpacity,
          transform: currentHeight === 0 ? 'translateY(-0.35rem)' : 'translateY(0)'
        },
        {
          height: `${targetHeight}px`,
          opacity: shouldOpen ? 1 : 0,
          transform: shouldOpen ? 'translateY(0)' : 'translateY(-0.35rem)'
        }
      ],
      {
        duration,
        easing: shouldOpen ? layoutEase : exitEase,
        fill: 'forwards'
      }
    );
    submenuAnimations.set(submenu, animation);
    animation.finished
      .catch(() => undefined)
      .finally(() => {
        if (submenuAnimations.get(submenu) !== animation) return;
        submenuAnimations.delete(submenu);
        submenu.open = shouldOpen;
        submenu.dataset.submenuState = shouldOpen ? 'open' : 'closed';
        animation.cancel();
        submenuPanel.removeAttribute('style');
      });
  };

  submenus.forEach((submenu) => {
    submenu.dataset.motionSubmenu = 'ready';
    submenu.dataset.submenuState = submenu.open ? 'open' : 'closed';
    const trigger = submenu.querySelector<HTMLElement>(':scope > summary');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', String(submenu.open));
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const shouldOpen = !submenu.open || submenu.dataset.submenuState === 'closing';
      if (shouldOpen) {
        submenus.forEach((other) => {
          if (other !== submenu && other.open) animateSubmenu(other, false);
        });
      }
      animateSubmenu(submenu, shouldOpen);
    });
  });

  const openMenu = () => {
    if (menu.dataset.menuState === 'open' || menu.dataset.menuState === 'opening') return;
    menuAnimation?.cancel();
    menu.open = true;
    menu.dataset.menuState = 'opening';
    document.documentElement.classList.add('has-mobile-menu');
    syncMenuA11y(true);

    if (reduced) {
      menu.dataset.menuState = 'open';
      focusables[0]?.focus();
      return;
    }

    menuAnimation = panel.animate(
      [
        { transform: 'translateY(-100%)', opacity: 0.98 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      { duration: menuOpenDuration, easing: emphasizedEase, fill: 'forwards' }
    );
    const currentAnimation = menuAnimation;
    currentAnimation.finished
      .catch(() => undefined)
      .finally(() => {
        if (menuAnimation !== currentAnimation) return;
        menuAnimation = undefined;
        menu.dataset.menuState = 'open';
        currentAnimation.cancel();
        focusables[0]?.focus();
      });
  };

  const closeMenu = (restoreFocus = false) => {
    if (!menu.open || menu.dataset.menuState === 'closing') return;
    if (menuAnimation) {
      try {
        menuAnimation.commitStyles();
      } catch {
        // Older WebKit versions do not expose commitStyles.
      }
      menuAnimation.cancel();
    }
    menu.dataset.menuState = 'closing';

    const finish = () => {
      menu.open = false;
      menu.dataset.menuState = 'closed';
      panel.removeAttribute('style');
      document.documentElement.classList.remove('has-mobile-menu');
      submenus.forEach(resetSubmenu);
      syncMenuA11y(false);
      if (restoreFocus) summary.focus();
    };

    if (reduced) {
      finish();
      return;
    }

    const startTransform = getComputedStyle(panel).transform;
    menuAnimation = panel.animate(
      [
        { transform: startTransform === 'none' ? 'translateY(0)' : startTransform, opacity: 1 },
        { transform: 'translateY(-100%)', opacity: 0.98 }
      ],
      { duration: baseDuration, easing: exitEase, fill: 'forwards' }
    );
    const currentAnimation = menuAnimation;
    currentAnimation.finished
      .catch(() => undefined)
      .finally(() => {
        if (menuAnimation !== currentAnimation) return;
        menuAnimation = undefined;
        currentAnimation.cancel();
        finish();
      });
  };

  menu.dataset.menuState = menu.open ? 'open' : 'closed';
  syncMenuA11y(menu.open);
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (menu.open) closeMenu();
    else openMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (!menu.open || event.key !== 'Escape') return;
    closeMenu(true);
  });

  closers.forEach((closer) => {
    closer.addEventListener('click', () => {
      closeMenu();
    });
  });
}

function initAccordions(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]'));
  const reduced = prefersReducedMotion();
  const animations = new WeakMap<HTMLElement, Animation>();
  const rootStyles = getComputedStyle(document.documentElement);
  const readDuration = (property: string, fallback: number) => {
    const value = Number.parseFloat(rootStyles.getPropertyValue(property));
    return Number.isFinite(value) ? value : fallback;
  };
  const openDuration = readDuration('--nm-motion-duration-base', 320);
  const closeDuration = readDuration('--nm-motion-duration-fast', 190);
  const layoutEase =
    rootStyles.getPropertyValue('--nm-motion-ease-layout').trim() ||
    'cubic-bezier(0.22, 1, 0.25, 1)';
  const exitEase =
    rootStyles.getPropertyValue('--nm-motion-ease-exit').trim() || 'cubic-bezier(0.4, 0, 1, 1)';

  buttons.forEach((button) => {
    if (button.dataset.motionAccordion === 'ready') return;
    button.dataset.motionAccordion = 'ready';
    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    const item = button.closest<HTMLElement>('.faq-list__item');

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;
      const runningAnimation = animations.get(panel);
      const currentHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
      const currentOpacity = panel.hidden
        ? 0
        : Number.parseFloat(getComputedStyle(panel).opacity) || 0;

      button.setAttribute('aria-expanded', String(nextExpanded));
      runningAnimation?.cancel();
      panel.hidden = false;

      if (reduced) {
        panel.hidden = !nextExpanded;
        item?.classList.toggle('is-open', nextExpanded);
        return;
      }

      if (nextExpanded) item?.classList.add('is-open');

      panel.style.height = `${currentHeight}px`;
      panel.style.overflow = 'hidden';
      panel.style.willChange = 'height, opacity';
      const fullHeight = panel.scrollHeight;
      const targetHeight = nextExpanded ? fullHeight : 0;
      const progress = Math.abs(targetHeight - currentHeight) / Math.max(fullHeight, 1);
      const duration = Math.max(90, (nextExpanded ? openDuration : closeDuration) * progress);
      const animation = panel.animate(
        [
          { height: `${currentHeight}px`, opacity: currentOpacity },
          { height: `${targetHeight}px`, opacity: nextExpanded ? 1 : 0 }
        ],
        {
          duration,
          easing: nextExpanded ? layoutEase : exitEase,
          fill: 'forwards'
        }
      );
      animations.set(panel, animation);
      animation.finished
        .catch(() => undefined)
        .finally(() => {
          if (animations.get(panel) !== animation) return;
          animations.delete(panel);
          panel.style.height = `${targetHeight}px`;
          panel.style.opacity = nextExpanded ? '1' : '0';
          animation.cancel();
          panel.hidden = !nextExpanded;
          if (!nextExpanded) item?.classList.remove('is-open');
          panel.style.height = '';
          panel.style.opacity = '';
          panel.style.overflow = '';
          panel.style.willChange = '';
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
  initMagnetic();
}

export interface ChoiceState {
  value: string;
  automatic: string | null;
  edited: boolean;
}

/** A CTA can replace its own previous selection, never a visitor's explicit choice. */
export function nextAutomaticChoice(state: ChoiceState, next: string): ChoiceState {
  if (state.value && (state.edited || state.value !== state.automatic)) return state;
  return { value: next, automatic: next, edited: false };
}

export function initAdvertisingPrefill(): void {
  const root = document.querySelector<HTMLElement>('.adv-page--comparison');
  if (!root || root.dataset.prefillInitialized) return;
  root.dataset.prefillInitialized = 'true';
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  root.querySelector('[data-project-rail]')?.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      event.target.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    }
  });

  for (const [selector, attribute] of [
    ['#contact-service', 'data-advertising-objective'],
    ['#contact-channel', 'data-advertising-channel']
  ] as const) {
    const field = form?.querySelector<HTMLSelectElement>(selector);
    if (!field) continue;
    let state: ChoiceState = { value: field.value, automatic: null, edited: Boolean(field.value) };
    let applying = false;
    field.addEventListener('change', () => {
      if (!applying) state = { value: field.value, automatic: null, edited: true };
    });
    form?.addEventListener('reset', () => {
      state = { value: '', automatic: null, edited: false };
    });
    root.querySelectorAll<HTMLAnchorElement>(`[${attribute}]`).forEach((link) => {
      link.addEventListener('click', () => {
        const next = link.getAttribute(attribute);
        if (!next || !Array.from(field.options).some((option) => option.value === next)) return;
        state = nextAutomaticChoice({ ...state, value: field.value }, next);
        if (field.value === state.value) return;
        applying = true;
        field.value = state.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        applying = false;
      });
    });
  }
  // The project message is intentionally never generated: it must come from the visitor.
}

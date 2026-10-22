export function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const shadowControl = target.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  if (shadowControl) {
    shadowControl.focus({ preventScroll: true });
    return;
  }

  if (target.matches('input, select, textarea, button, a, [tabindex]')) {
    target.focus({ preventScroll: true });
    return;
  }

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-textarea, ontario-input, ontario-radio-buttons, ontario-dropdown-list, ontario-search-box, ontario-date-input, ontario-checkboxes',
  );
  const nestedShadowControl = nestedHost?.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea',
  );
  if (nestedShadowControl) {
    nestedShadowControl.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
}

export function getEventValue(event: globalThis.Event) {
  const target = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null;
  return target?.value ?? '';
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

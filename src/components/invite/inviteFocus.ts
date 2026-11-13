/** Focus a field (or ODS control inside it) after an error-summary link click. */
export function focusInviteField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-input, ontario-radio-buttons, ontario-checkboxes, ontario-dropdown-list',
  );
  const nestedShadowControl = nestedHost?.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button',
  );
  if (nestedShadowControl) {
    nestedShadowControl.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, select, textarea, button, a, [tabindex]:not([tabindex="-1"])',
  );
  if (focusable) {
    focusable.focus({ preventScroll: true });
    return;
  }

  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}

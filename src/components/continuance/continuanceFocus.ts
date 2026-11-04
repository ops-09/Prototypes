const ODS_FOCUSABLE =
  'ontario-input, ontario-radio-buttons, ontario-textarea, ontario-checkboxes, ontario-dropdown-list, ontario-button, ontario-date-input';

function focusShadowControl(host: HTMLElement) {
  const nested = host.shadowRoot?.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, button',
  );
  nested?.focus({ preventScroll: true });
}

/**
 * ODS puts `elementId` on the inner shadow input, so document.getElementById often fails.
 * Resolve light-DOM wrappers, `[element-id]`, or the host that owns the shadow id.
 */
export function focusField(anchorId: string) {
  const byId = document.getElementById(anchorId);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const host = byId.matches(ODS_FOCUSABLE)
      ? byId
      : byId.querySelector<HTMLElement>(ODS_FOCUSABLE);
    if (host) {
      focusShadowControl(host);
      return;
    }
    if (typeof byId.focus === 'function') {
      byId.focus({ preventScroll: true });
    }
    return;
  }

  const byElementId = document.querySelector<HTMLElement>(
    `[element-id="${CSS.escape(anchorId)}"]`,
  );
  if (byElementId) {
    byElementId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (byElementId.matches(ODS_FOCUSABLE)) {
      focusShadowControl(byElementId);
    } else {
      const nestedHost = byElementId.querySelector<HTMLElement>(ODS_FOCUSABLE);
      if (nestedHost) {
        focusShadowControl(nestedHost);
      } else if (typeof byElementId.focus === 'function') {
        byElementId.focus({ preventScroll: true });
      }
    }
    return;
  }

  for (const host of document.querySelectorAll<HTMLElement>(ODS_FOCUSABLE)) {
    const inner = host.shadowRoot?.getElementById(anchorId);
    if (inner) {
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inner.focus({ preventScroll: true });
      return;
    }
  }
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

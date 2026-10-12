/**
 * ODS RadioButtons (v8.1.0) adds `.ontario-input--error` when `errorMessage` is set,
 * but the radio stylesheet never paints the visible circle (label:before). Text inputs
 * use `.ontario-input--error input { border-color: $ontario-colour-alert }`. Inject the
 * radio equivalent into each host shadow root once.
 */
const STYLE_ID = 'ops-rbac-ontario-radio-error';

// $ontario-colour-alert / $ontario-colour-system-alert — docs/ods/TOKENS.md
const RADIO_ERROR_CSS = `
.ontario-input--error .ontario-radios__label:before {
  border-color: #cd0000;
}
`;

type StencilHost = HTMLElement & {
  componentOnReady?: () => Promise<HTMLElement>;
};

function injectStyles(host: HTMLElement) {
  const root = host.shadowRoot;
  if (!root || root.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = RADIO_ERROR_CSS;
  root.appendChild(style);
}

export function ensureOntarioRadioErrorStyles(host: Element) {
  const el = host as StencilHost;
  if (el.shadowRoot) {
    injectStyles(el);
    return;
  }

  void Promise.resolve(el.componentOnReady?.())
    .catch(() => undefined)
    .then(() => injectStyles(el));
}

function visit(node: Node) {
  if (!(node instanceof Element)) {
    return;
  }
  if (node.localName === 'ontario-radio-buttons') {
    ensureOntarioRadioErrorStyles(node);
  }
  node.querySelectorAll('ontario-radio-buttons').forEach(ensureOntarioRadioErrorStyles);
}

/** Patch all current and future ontario-radio-buttons hosts. Call once at app boot. */
export function installOntarioRadioErrorStyles() {
  visit(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(visit);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

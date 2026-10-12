import { isIsoDateComplete } from '../form1/nameValidation';

type DateHost = HTMLElement & { value?: string };

function readShadowDateParts(host: HTMLElement): {
  day: string;
  month: string;
  year: string;
} {
  const root = host.shadowRoot;
  if (!root) {
    return { day: '', month: '', year: '' };
  }

  const year =
    root.querySelector<HTMLInputElement>('input[id^="year-"]')?.value ?? '';
  const month =
    root.querySelector<HTMLInputElement>('input[id^="month-"]')?.value ?? '';
  const day =
    root.querySelector<HTMLInputElement>('input[id^="day-"]')?.value ?? '';

  return { day, month, year };
}

/**
 * ODS `inputOnChange` / `inputOnInput` detail.value is the day/month/year
 * fragment only. The aggregate ISO date lives on the host `value`.
 *
 * Returns:
 * - complete ISO date when year/month/day form a valid date
 * - `''` when all fields are cleared
 * - `null` while the user is mid-entry (do not write to React — a controlled
 *   empty `value` prop clears ODS internal day/month/year via @Watch)
 */
export function aggregateDateFromEvent(event: Event): string | null {
  const host = (event.currentTarget ?? event.target) as DateHost | null;
  if (!host) {
    return null;
  }

  const aggregate = typeof host.value === 'string' ? host.value : '';
  if (aggregate && isIsoDateComplete(aggregate)) {
    return aggregate;
  }

  const parts = readShadowDateParts(host);
  if (parts.day || parts.month || parts.year) {
    return null;
  }

  return '';
}

/**
 * OntarioDateInput only paints red field borders after blur validation when
 * `isDateTyped` is true. Force that path so submit-time errors match OntarioInput.
 */
export function syncOntarioDateInputError(host: HTMLElement | null, message?: string) {
  if (!host) {
    return;
  }
  const typedHost = host as HTMLElement & { isDateTyped?: boolean };
  typedHost.isDateTyped = true;
  const input = host.shadowRoot?.querySelector('input');
  input?.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

  const root = host.shadowRoot;
  if (!root) {
    return;
  }
  const wrappers = root.querySelectorAll('.ontario-date__group-input');
  const errBox = root.querySelector('.ontario-error-messaging');
  const errContent = root.querySelector('.ontario-error-messaging__content');
  if (message) {
    wrappers.forEach((wrap) => wrap.classList.add('ontario-date--error'));
    errBox?.classList.remove('ontario-error__hidden');
    if (errContent) {
      errContent.textContent = message;
    }
  } else {
    wrappers.forEach((wrap) => wrap.classList.remove('ontario-date--error'));
    errBox?.classList.add('ontario-error__hidden');
    if (errContent) {
      errContent.textContent = '';
    }
  }
}

export function syncDateFieldByAnchor(anchorId: string, message?: string) {
  const host = document
    .getElementById(anchorId)
    ?.querySelector<HTMLElement>('ontario-date-input');
  syncOntarioDateInputError(host, message);
}

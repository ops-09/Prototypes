import type { MouseEvent } from 'react';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { focusField } from '../form11/form11Focus';

const PERSON_FIELD_SUFFIXES: Record<string, string[]> = {
  type: ['type'],
  firstName: ['first-name'],
  middleName: ['middle-name'],
  lastName: ['last-name'],
  email: ['email'],
  residentCanadian: ['resident-canadian'],
  alsoIncorporator: ['also-incorporator'],
  numberOfShares: ['shares'],
  classDesignation: ['class'],
  amountToBePaid: ['amount'],
  consent: ['consent'],
  consentFile: ['consent-file'],
  addressType: ['address-type'],
  postalCodeLookup: ['postal-lookup'],
  unitType: ['unit-type'],
  streetNumber: ['street-number'],
  streetName: ['street-name'],
  addressLine1: ['line1'],
  // Canadian and foreign address fields share error keys; only one set is rendered at a time.
  cityTown: ['city', 'foreign-city'],
  provinceState: ['province', 'state-region'],
  postalCode: ['postal', 'zip'],
  country: ['country'],
  corporationSearch: ['corporation-search'],
  corporation: ['corporation-name', 'corporation-search'],
  signerPosition: ['position'],
};

export function personFieldCandidates(prefix: string) {
  return (key: string) =>
    (PERSON_FIELD_SUFFIXES[key] ?? [key]).map((suffix) => `${prefix}-${suffix}`);
}

const ODS_FIELD_HOSTS =
  'ontario-input, ontario-dropdown-list, ontario-textarea, ontario-date-input, ontario-search-box';

// ODS inputs render `elementId` on the control inside their shadow root, so it isn't in the light DOM.
function findShadowControl(id: string) {
  for (const host of document.querySelectorAll<HTMLElement>(ODS_FIELD_HOSTS)) {
    const control = host.shadowRoot?.getElementById(id);
    if (control) {
      return { host, control };
    }
  }
  return null;
}

function focusFirstMatch(candidates: string[]) {
  for (const id of candidates) {
    if (document.getElementById(id)) {
      focusField(id);
      return;
    }
    const match = findShadowControl(id);
    if (match) {
      match.host.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.control.focus({ preventScroll: true });
      return;
    }
  }
}

type SubflowErrorSummaryProps = {
  errors: Partial<Record<string, string | undefined>>;
  anchorCandidates: (key: string) => string[];
  alertClassName?: string;
  linkClassName?: string;
};

export function SubflowErrorSummary({
  errors,
  anchorCandidates,
  alertClassName,
  linkClassName,
}: SubflowErrorSummaryProps) {
  const items = Object.entries(errors).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  if (items.length === 0) {
    return null;
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>, key: string) {
    event.preventDefault();
    focusFirstMatch(anchorCandidates(key));
  }

  return (
    <div className={alertClassName} tabIndex={-1}>
      <OntarioPageAlert type="error" heading="There is a problem">
        <p>Errors were found on this page:</p>
        <ul>
          {items.map(([key, message]) => (
            <li key={key}>
              <a
                className={linkClassName}
                href={`#${anchorCandidates(key)[0]}`}
                onClick={(event) => handleClick(event, key)}
              >
                {message}
              </a>
            </li>
          ))}
        </ul>
      </OntarioPageAlert>
    </div>
  );
}

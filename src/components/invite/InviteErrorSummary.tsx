import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { type MouseEvent, type RefObject } from 'react';
import { focusInviteField } from './inviteFocus';
import type { InviteErrorSummaryItem } from './inviteValidation';
import styles from './InviteUserWizard.module.scss';

type InviteErrorSummaryProps = {
  items: InviteErrorSummaryItem[];
  summaryRef: RefObject<HTMLDivElement | null>;
};

export function InviteErrorSummary({ items, summaryRef }: InviteErrorSummaryProps) {
  if (items.length === 0) {
    return null;
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusInviteField(href.replace('#', ''));
  }

  return (
    <div ref={summaryRef} className={styles.errorSummary} tabIndex={-1}>
      <OntarioPageAlert type="error" heading="There is a problem">
        <p>Errors were found on this page:</p>
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              <a
                className={styles.errorSummaryLink}
                href={item.href}
                onClick={(event) => handleSummaryLinkClick(event, item.href)}
              >
                {item.message}
              </a>
            </li>
          ))}
        </ul>
      </OntarioPageAlert>
    </div>
  );
}

import type { ReactNode } from 'react';
import formStyles from '../form7/Form7SummaryList.module.scss';
import styles from './InviteUserWizard.module.scss';

export type InviteSummaryListItem = {
  name: string;
  description: string;
  onChange?: () => void;
  /** Nested rows under this item (e.g. project permissions). */
  children?: Array<{ name: string; description: string }>;
};

type InviteSummaryListProps = {
  caption: string;
  items: InviteSummaryListItem[];
};

/**
 * ODS Summary List pattern for invite review.
 * OntarioSummaryList is not exported in ODS React 8.1.0 — compose the documented structure.
 * @see https://designsystem.ontario.ca/developer-docs/components/ontario-summary-list/
 */
export function InviteSummaryList({ caption, items }: InviteSummaryListProps) {
  return (
    <div className={formStyles.summaryList}>
      <div className={formStyles.headingContainer}>
        <h2 className={`ontario-h4 ${formStyles.heading}`}>{caption}</h2>
      </div>

      <dl className={`${formStyles.container} ${formStyles.ratio1_2}`}>
        {items.map((item) => (
          <div key={`${item.name}-${item.description}`} className={styles.inviteSummaryBlock}>
            <div className={formStyles.row}>
              <dt className={formStyles.key}>{item.name}</dt>
              <dd className={formStyles.value}>
                <span className={formStyles.srOnly}>Your answer is: </span>
                {item.description}
              </dd>
              {item.onChange ? (
                <div className={styles.inviteSummaryAction}>
                  <button
                    type="button"
                    className={formStyles.changeButton}
                    onClick={item.onChange}
                  >
                    Change
                    <span className={formStyles.srOnly}>
                      {' '}
                      your answer for: <q>{item.name}</q>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            {item.children?.map((child) => (
              <div
                key={`${item.name}-${child.name}-${child.description}`}
                className={formStyles.row}
              >
                <dt className={formStyles.key}>{child.name}</dt>
                <dd className={formStyles.value}>
                  <span className={formStyles.srOnly}>Your answer is: </span>
                  {child.description}
                </dd>
                <div className={styles.inviteSummaryAction} aria-hidden="true" />
              </div>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}

export function InviteSummaryListSpacer({ children }: { children: ReactNode }) {
  return <div className={styles.inviteSummaryAfter}>{children}</div>;
}

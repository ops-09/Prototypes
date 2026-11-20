import { BYB_FORM_NAME } from './form7BeforeYouBeginContent';
import styles from './Form7HeaderCard.module.scss';

const SECTOR_MINISTRY_NAME =
  'Ministry of Public and Business Service Delivery and Procurement';

/**
 * Static Form 7 context header under the step indicator.
 * ODS has no metadata header-card component — layout composed with tokens only.
 */
export function Form7HeaderCard() {
  return (
    <aside className={styles.card} aria-label="Filing details">
      <div className={styles.grid}>
        <div className={styles.field}>
          <p className={styles.label}>Application type</p>
          <p className={styles.value}>{BYB_FORM_NAME}</p>
        </div>
        <div className={styles.field}>
          <p className={styles.label}>Sector</p>
          <p className={styles.value}>{SECTOR_MINISTRY_NAME}</p>
        </div>
      </div>
    </aside>
  );
}

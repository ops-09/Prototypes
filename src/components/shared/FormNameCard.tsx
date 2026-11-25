import styles from './FormNameCard.module.scss';

const DEFAULT_SECTOR =
  'Ministry of Public and Business Service Delivery and Procurement';

type FormNameCardProps = {
  /** Form title shown as Application type (e.g. BYB_FORM_NAME). */
  applicationType: string;
  sector?: string;
};

/**
 * Static filing context header under the step indicator.
 * ODS has no metadata header-card component — layout composed with tokens only.
 */
export function FormNameCard({
  applicationType,
  sector = DEFAULT_SECTOR,
}: FormNameCardProps) {
  return (
    <aside className={styles.card} aria-label="Filing details">
      <div className={styles.grid}>
        <div className={styles.field}>
          <p className={styles.label}>Application type</p>
          <p className={styles.value}>{applicationType}</p>
        </div>
        <div className={styles.field}>
          <p className={styles.label}>Sector</p>
          <p className={styles.value}>{sector}</p>
        </div>
      </div>
    </aside>
  );
}

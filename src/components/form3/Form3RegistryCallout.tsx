import { OntarioCallout } from '@ongov/ontario-design-system-component-library-react';
import styles from './Form3Step1.module.scss';

type Form3RegistryCalloutProps = {
  corporationName: string;
  ocn: string;
  incorporationDate: string;
};

function formatObrDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${year}-${month}-${day}`;
}

/** Read-only OBR registry summary shown after the page title on Form 3 steps. */
export function Form3RegistryCallout({
  corporationName,
  ocn,
  incorporationDate,
}: Form3RegistryCalloutProps) {
  return (
    <OntarioCallout
      headingType="h2"
      headingContent="Corporation details"
      headingContentType="string"
      highlightColour="teal"
    >
      <div className={styles.registryCalloutBody}>
        <div className={styles.registryCalloutRow}>
          <p className={styles.registryCalloutLabel}>Corporation name</p>
          <p className={styles.registryCalloutValue}>{corporationName}</p>
        </div>
        <div className={styles.registryCalloutRow}>
          <p className={styles.registryCalloutLabel}>OCN Number</p>
          <p className={styles.registryCalloutValue}>{ocn}</p>
        </div>
        <div className={styles.registryCalloutRow}>
          <p className={styles.registryCalloutLabel}>Date of incorporation/amalgamation</p>
          <p className={styles.registryCalloutValue}>{formatObrDate(incorporationDate)}</p>
        </div>
      </div>
    </OntarioCallout>
  );
}

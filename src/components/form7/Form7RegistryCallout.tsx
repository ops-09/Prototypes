import { OntarioCallout } from '@ongov/ontario-design-system-component-library-react';
import styles from './Form7Step1.module.scss';

type Form7RegistryCalloutProps = {
  cooperativeName: string;
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

/** Read-only OBR registry summary shown after the page title on Form 7 steps. */
export function Form7RegistryCallout({
  cooperativeName,
  ocn,
  incorporationDate,
}: Form7RegistryCalloutProps) {
  return (
    <OntarioCallout
      headingType="h2"
      headingContent="Co-operative details"
      headingContentType="string"
      highlightColour="teal"
    >
      <div className={styles.registryCalloutBody}>
        <div className={styles.registryCalloutRow}>
          <p className={styles.registryCalloutLabel}>Current co-operative name</p>
          <p className={styles.registryCalloutValue}>{cooperativeName}</p>
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

import {
  BYB_PAYMENT_CHECKLIST_INTRO,
  BYB_PAYMENT_HEADING,
} from './beforeYouBeginPaymentContent';
import styles from './BeforeYouBeginPaymentSection.module.scss';

export type BeforeYouBeginPaymentSectionProps = {
  lead: string;
  items: readonly string[];
};

export function BeforeYouBeginPaymentSection({
  lead,
  items,
}: BeforeYouBeginPaymentSectionProps) {
  return (
    <section
      className={styles.section}
      aria-labelledby="byb-payment-heading"
    >
      <h2 id="byb-payment-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
        {BYB_PAYMENT_HEADING}
      </h2>
      <p className={styles.sectionIntro}>{lead}</p>
      {items.length > 0 ? (
        <>
          <p className={styles.sectionIntro}>{BYB_PAYMENT_CHECKLIST_INTRO}</p>
          <ul className={styles.bulletList}>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

import {
  BYB_CONTACT_ADDRESS,
  BYB_CONTACT_EMAIL,
  BYB_CONTACT_HEADING,
  BYB_CONTACT_INTRO,
  BYB_CONTACT_MINISTRY_NAME,
  BYB_CONTACT_TELEPHONE,
} from './beforeYouBeginContactContent';
import styles from './BeforeYouBeginContactSection.module.scss';

export function BeforeYouBeginContactSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="byb-contact-heading"
    >
      <h2 id="byb-contact-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
        {BYB_CONTACT_HEADING}
      </h2>
      <p className={styles.sectionIntro}>{BYB_CONTACT_INTRO}</p>
      <div className={styles.contactDetails}>
        <p className={styles.contactLine}>{BYB_CONTACT_MINISTRY_NAME}</p>
        <p className={styles.contactLine}>{BYB_CONTACT_ADDRESS}</p>
        <p className={styles.contactLine}>
          Telephone: {BYB_CONTACT_TELEPHONE}
        </p>
        <p className={styles.contactLine}>
          Email:{' '}
          <a href={`mailto:${BYB_CONTACT_EMAIL}`}>{BYB_CONTACT_EMAIL}</a>
        </p>
      </div>
    </section>
  );
}

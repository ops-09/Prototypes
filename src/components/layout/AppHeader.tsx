import {
  OntarioIconAccount,
  OntarioLanguageToggle,
} from '@ongov/ontario-design-system-component-library-react';
import { InviteWizardVersionToggle } from '../invite/InviteWizardVersionToggle';
import { useOptionalInviteWizardVersionContext } from '../invite/InviteWizardVersionContext';
import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  serviceTitle?: string;
  serviceHref?: string;
  frenchLink?: string;
};

export function AppHeader({
  serviceTitle = 'ServiceOntario',
  serviceHref = '/',
  frenchLink = '/fr',
}: AppHeaderProps) {
  const inviteVersionContext = useOptionalInviteWizardVersionContext();

  return (
    <header className={styles.appHeader}>
      <div className={styles.topBar}>
        <a href="https://www.ontario.ca" className={styles.logoLink}>
          <img
            src="/assets/ontario-logo--desktop.svg"
            alt="Ontario"
            className={styles.logo}
          />
        </a>
        <div className={styles.topBarActions}>
          {inviteVersionContext?.toggleVisible && (
            <InviteWizardVersionToggle
              version={inviteVersionContext.version}
              onChange={inviteVersionContext.setVersion}
            />
          )}
          <div className={styles.languageToggle}>
            <OntarioLanguageToggle size="default" url={frenchLink} />
          </div>
        </div>
      </div>

      <div className={styles.serviceBar}>
        <a href={serviceHref} className={styles.serviceTitleLink}>
          <span className={`ontario-h3 ${styles.serviceTitle}`}>{serviceTitle}</span>
        </a>
        <button type="button" className={styles.accountButton} aria-label="Account">
          <OntarioIconAccount colour="white" iconWidth={32} />
        </button>
      </div>
    </header>
  );
}

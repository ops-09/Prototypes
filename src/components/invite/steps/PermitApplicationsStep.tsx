import type { PermitApplicationAccess } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';
import { PermitApplicationsSection } from './PermitApplicationsSection';

type PermitApplicationsStepProps = {
  permitApplicationAccess: PermitApplicationAccess;
  permitAccessError?: string;
  onChange: (access: PermitApplicationAccess) => void;
  /** V4 = per-ministry All|Selected; V5/V6 = All ministries | Individual (V6 adds Selected tray). */
  createVariant?: 'v4' | 'v5' | 'v6';
};

export function PermitApplicationsStep({
  permitApplicationAccess,
  permitAccessError,
  onChange,
  createVariant = 'v4',
}: PermitApplicationsStepProps) {
  const sectionVariant =
    createVariant === 'v6' ? 'tabs-v6' : createVariant === 'v5' ? 'tabs-v5' : 'tabs';

  return (
    <section className={styles.stepPanel} aria-label="Permit Applications">
      <div className={styles.stepPanelHeader}>
        <h2 className={`ontario-h4 ${styles.stepPanelTitle}`}>
          {formatInviteStepTitle('Permit Applications')}
        </h2>
      </div>

      <div id={INVITE_FIELD_ANCHORS.permitAccess} tabIndex={-1}>
        <PermitApplicationsSection
          access={permitApplicationAccess}
          onChange={onChange}
          errorMessage={permitAccessError}
          variant={sectionVariant}
        />
      </div>
    </section>
  );
}

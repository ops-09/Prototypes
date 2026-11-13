import type { PermitApplicationAccess } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';
import { PermitApplicationsSection } from './PermitApplicationsSection';

type PermitApplicationsStepProps = {
  permitApplicationAccess: PermitApplicationAccess;
  permitAccessError?: string;
  onChange: (access: PermitApplicationAccess) => void;
};

export function PermitApplicationsStep({
  permitApplicationAccess,
  permitAccessError,
  onChange,
}: PermitApplicationsStepProps) {
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
          variant="tabs"
        />
      </div>
    </section>
  );
}

import type { InviteWizardVersion } from '../../config/inviteWizardVersion';
import headerStyles from '../layout/AppHeader.module.scss';

type InviteWizardVersionToggleProps = {
  version: InviteWizardVersion;
  onChange: (version: InviteWizardVersion) => void;
};

export function InviteWizardVersionToggle({
  version,
  onChange,
}: InviteWizardVersionToggleProps) {
  return (
    <div
      className={headerStyles.versionTogglerGroup}
      role="group"
      aria-label="Invite wizard version"
    >
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v1'}
        onClick={() => onChange('v1')}
      >
        V1
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v2'}
        onClick={() => onChange('v2')}
      >
        V2
      </button>
    </div>
  );
}

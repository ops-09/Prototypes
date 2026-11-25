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
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v3'}
        onClick={() => onChange('v3')}
      >
        V3
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v4'}
        onClick={() => onChange('v4')}
      >
        V4
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v5'}
        onClick={() => onChange('v5')}
      >
        V5
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v6'}
        onClick={() => onChange('v6')}
      >
        V6
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v7'}
        onClick={() => onChange('v7')}
      >
        V7
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v8'}
        onClick={() => onChange('v8')}
      >
        V8
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v9'}
        onClick={() => onChange('v9')}
      >
        V9
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v10'}
        onClick={() => onChange('v10')}
      >
        V10
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v11'}
        onClick={() => onChange('v11')}
      >
        V11
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v12'}
        onClick={() => onChange('v12')}
      >
        V12
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v13'}
        onClick={() => onChange('v13')}
      >
        V13
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v14'}
        onClick={() => onChange('v14')}
      >
        V14
      </button>
      <button
        type="button"
        className={headerStyles.versionTogglerButton}
        aria-pressed={version === 'v15'}
        onClick={() => onChange('v15')}
      >
        V15
      </button>
    </div>
  );
}

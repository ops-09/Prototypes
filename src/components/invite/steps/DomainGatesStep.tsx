import {
  OntarioCheckboxes,
  OntarioHintText,
} from '@ongov/ontario-design-system-component-library-react';
import type { PermitApplicationAccess, ServiceAccess } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';

type DomainGatesStepProps = {
  serviceAccess: ServiceAccess;
  permitApplicationAccess: PermitApplicationAccess;
  onServiceAccessChange: (serviceAccess: ServiceAccess) => void;
  onPermitApplicationAccessChange: (access: PermitApplicationAccess) => void;
};

function applyCheckboxToggle(current: string[], event: globalThis.Event): string[] {
  const target = event.target as HTMLInputElement | null;
  if (!target?.value) {
    return current;
  }

  const checked =
    typeof target.checked === 'boolean' ? target.checked : !current.includes(target.value);

  if (checked) {
    return current.includes(target.value) ? current : [...current, target.value];
  }

  return current.filter((value) => value !== target.value);
}

export function DomainGatesStep({
  serviceAccess,
  permitApplicationAccess,
  onServiceAccessChange,
  onPermitApplicationAccessChange,
}: DomainGatesStepProps) {
  const miningEnabled = serviceAccess.services.mining.enabled;
  const miningEntry = serviceAccess.services.mining;

  const domainValues = [
    ...(miningEnabled ? ['mining'] : []),
    ...(permitApplicationAccess.enabled ? ['permits'] : []),
  ];

  function handleDomainChange(event: globalThis.Event) {
    const nextValues = applyCheckboxToggle(domainValues, event);
    const nextMiningEnabled = nextValues.includes('mining');
    const nextPermitsEnabled = nextValues.includes('permits');

    if (nextMiningEnabled !== miningEnabled) {
      onServiceAccessChange({
        ...serviceAccess,
        services: {
          ...serviceAccess.services,
          mining: {
            ...miningEntry,
            enabled: nextMiningEnabled,
          },
        },
      });
    }

    if (nextPermitsEnabled !== permitApplicationAccess.enabled) {
      onPermitApplicationAccessChange({
        ...permitApplicationAccess,
        enabled: nextPermitsEnabled,
        // Open both scope tracks when entering the permits path (tabs assign grants).
        create: {
          ...permitApplicationAccess.create,
          enabled: nextPermitsEnabled ? true : permitApplicationAccess.create.enabled,
        },
        view: {
          ...permitApplicationAccess.view,
          enabled: nextPermitsEnabled ? true : permitApplicationAccess.view.enabled,
        },
        edit: {
          ...permitApplicationAccess.edit,
          enabled: nextPermitsEnabled ? true : permitApplicationAccess.edit.enabled,
        },
      });
    }
  }

  return (
    <section className={styles.stepPanel} aria-label="Choose access domains">
      <div className={styles.stepPanelHeader}>
        <h2 className={`ontario-h4 ${styles.stepPanelTitle}`}>
          {formatInviteStepTitle('Choose access domains')}
        </h2>
      </div>

      <div
        id={INVITE_FIELD_ANCHORS.serviceAccess}
        className={styles.domainAccessRoot}
        tabIndex={-1}
      >
        <OntarioHintText hint="Choose Mining Projects, Permit Applications, both, or neither. You will configure each selected domain on the next steps." />

        <OntarioCheckboxes
          caption="Permission domains"
          name="invite-v4-domain-gates"
          value={domainValues}
          options={[
            {
              value: 'mining',
              elementId: 'v4-domain-mining',
              label: 'Mining Projects',
            },
            {
              value: 'permits',
              elementId: 'v4-domain-permits',
              label: 'Permit Applications',
            },
          ]}
          customOnChange={handleDomainChange}
        />
      </div>
    </section>
  );
}

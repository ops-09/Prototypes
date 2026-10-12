import { OntarioRadioButtons } from '@ongov/ontario-design-system-component-library-react';
import type { BatchInviteMode } from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';

export type InviteAudience = 'single' | 'multiple';

type InviteModeStepProps = {
  audience: InviteAudience | '';
  batchMode: BatchInviteMode | '';
  onAudienceChange: (audience: InviteAudience) => void;
  onBatchModeChange: (mode: BatchInviteMode) => void;
};

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

export function InviteModeStep({
  audience,
  batchMode,
  onAudienceChange,
  onBatchModeChange,
}: InviteModeStepProps) {
  return (
    <section className={styles.stepPanel} aria-label="Invite mode">
      <div className={styles.formStack}>
        <OntarioRadioButtons
          caption={{ captionText: 'Number of users', captionType: 'default' }}
          name="invite-audience"
          value={audience}
          required
          options={[
            { value: 'single', label: 'One user', elementId: 'invite-audience-single' },
            {
              value: 'multiple',
              label: 'Multiple users',
              elementId: 'invite-audience-multiple',
            },
          ]}
          customOnChange={(event) => onAudienceChange(getRadioValue(event) as InviteAudience)}
        />

        {audience === 'multiple' && (
          <OntarioRadioButtons
            caption={{ captionText: 'Access configuration', captionType: 'default' }}
            name="invite-batch-mode"
            value={batchMode}
            required
            options={[
              {
                value: 'same',
                label: 'Same access for everyone',
                elementId: 'invite-batch-mode-same',
              },
              {
                value: 'custom',
                label: 'Customize access per person',
                elementId: 'invite-batch-mode-custom',
              },
            ]}
            customOnChange={(event) => onBatchModeChange(getRadioValue(event) as BatchInviteMode)}
          />
        )}
      </div>
    </section>
  );
}

import { useRef } from 'react';
import {
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import { ROLES, getRoleById, getRoleInfoHeading } from '../../../rbac/roles';
import type { RoleId } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';

type RoleStepProps = {
  selectedRoleId: RoleId | '';
  roleError?: string;
  onSelectRole: (roleId: RoleId) => void;
};

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

export function RoleStep({ selectedRoleId, roleError, onSelectRole }: RoleStepProps) {
  const radioGroupRef = useRef<HTMLOntarioRadioButtonsElement | null>(null);
  const selectedRole = selectedRoleId ? getRoleById(selectedRoleId) : undefined;

  function selectRole(roleId: RoleId) {
    onSelectRole(roleId);

    const input = radioGroupRef.current?.shadowRoot?.querySelector(
      `#invite-role-${roleId}`,
    ) as HTMLInputElement | null;
    input?.click();
  }

  function handleCardKeyDown(event: React.KeyboardEvent, roleId: RoleId) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      selectRole(roleId);
    }
  }

  function getCardTabIndex(roleId: RoleId) {
    if (selectedRoleId === '') {
      return roleId === ROLES[0].id ? 0 : -1;
    }

    return selectedRoleId === roleId ? 0 : -1;
  }

  return (
    <section className={styles.stepPanel} aria-label="Assign role">
      <div className={styles.stepPanelHeader}>
        <h2 id="assign-role-heading" className={styles.stepPanelTitle}>
          {formatInviteStepTitle('Assign role')}
        </h2>
      </div>

      <div
        id={INVITE_FIELD_ANCHORS.role}
        className={styles.roleStack}
        role="radiogroup"
        aria-labelledby="assign-role-heading"
        aria-required="true"
        aria-invalid={roleError ? true : undefined}
        aria-describedby={roleError ? 'invite-role-error' : undefined}
        tabIndex={-1}
      >
        {ROLES.map((role) => {
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              className={`${styles.roleRadioCard} ${isSelected ? styles.roleRadioCardSelected : ''} ${roleError ? styles.roleRadioCardError : ''}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={getCardTabIndex(role.id)}
              onClick={() => selectRole(role.id)}
              onKeyDown={(event) => handleCardKeyDown(event, role.id)}
            >
              <div className={styles.roleRadioCardContent}>
                <span
                  className={`${styles.roleRadioIndicator} ${isSelected ? styles.roleRadioIndicatorSelected : ''}`}
                  aria-hidden="true"
                />
                <div className={styles.roleRadioCardText}>
                  <span className={styles.roleCardTitle}>{role.label}</span>
                  <p className={styles.roleCardDescription}>{role.shortDescription}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {roleError ? (
        <p id="invite-role-error" className={styles.fieldErrorMessage} role="alert">
          {roleError}
        </p>
      ) : null}

      <OntarioRadioButtons
        ref={radioGroupRef}
        className={styles.roleRadioGroupOffscreen}
        caption={{ captionText: 'Assign role', captionType: 'default' }}
        name="invite-user-role"
        value={selectedRoleId}
        required
        errorMessage={roleError}
        options={ROLES.map((role) => ({
          value: role.id,
          label: role.label,
          elementId: `invite-role-${role.id}`,
          checked: selectedRoleId === role.id,
        }))}
        customOnChange={(event) => onSelectRole(getRadioValue(event) as RoleId)}
      />

      {selectedRole && (
        <OntarioPageAlert
          type="informational"
          heading={getRoleInfoHeading(selectedRole.id)}
          content={selectedRole.longDescription}
        />
      )}
    </section>
  );
}

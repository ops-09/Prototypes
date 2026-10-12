import { useRef } from 'react';
import {
  OntarioCallout,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import { ROLES, getRoleById } from '../../../rbac/roles';
import type { RoleId } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
type RoleStepProps = {
  selectedRoleId: RoleId | '';
  onSelectRole: (roleId: RoleId) => void;
};

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

export function RoleStep({
  selectedRoleId,
  onSelectRole,
}: RoleStepProps) {
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
    <section className={styles.stepPanel} aria-label="Assign a role">
      <div className={styles.stepPanelHeader}>
        <h2 id="assign-role-heading" className={styles.stepPanelTitle}>
          {formatInviteStepTitle('Assign a role')}
        </h2>
      </div>

      <div
        className={styles.roleGrid}
        role="radiogroup"
        aria-labelledby="assign-role-heading"
        aria-required="true"
      >
        {ROLES.map((role) => {
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              className={`${styles.roleRadioCard} ${isSelected ? styles.roleRadioCardSelected : ''}`}
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

      <OntarioRadioButtons
        ref={radioGroupRef}
        className={styles.roleRadioGroupOffscreen}
        caption={{ captionText: 'Assign a role', captionType: 'default' }}
        name="invite-user-role"
        value={selectedRoleId}
        required
        options={ROLES.map((role) => ({
          value: role.id,
          label: role.label,
          elementId: `invite-role-${role.id}`,
          checked: selectedRoleId === role.id,
        }))}
        customOnChange={(event) => onSelectRole(getRadioValue(event) as RoleId)}
      />

      {selectedRole?.id === 'secondary_admin' && (
        <OntarioCallout
          headingType="h3"
          headingContent="No service configuration needed"
          headingContentType="string"
          highlightColour="blue"
        >
          Secondary Admins can manage users, service access, and permissions for assigned
          services. You can proceed directly to Review.
        </OntarioCallout>
      )}

      {selectedRole?.id === 'delegate' && (
        <OntarioCallout
          headingType="h3"
          headingContent="Authorized Representative — configure service access in the next step"
          headingContentType="string"
          highlightColour="blue"
        >
          Authorized Representatives get access to selected services and data based on view or edit
          permission granted.
        </OntarioCallout>
      )}

      {selectedRole?.id === 'member' && (
        <OntarioCallout
          headingType="h3"
          headingContent="Member — configure service access in the next step"
          headingContentType="string"
          highlightColour="blue"
        >
          Members get access to assigned services and data based on view or edit permission
          granted.
        </OntarioCallout>
      )}

    </section>
  );
}

import { useMemo } from 'react';
import {
  INVITE_ACCESS_NEEDS,
  type InviteAccessNeed,
  type InviteAccessNeedId,
} from './inviteAccessNeedsCatalog';
import { INVITE_FIELD_ANCHORS } from './inviteValidation';
import styles from './InviteUserWizard.module.scss';

type AccessNeedsFilterProps = {
  selectedIds: string[];
  errorMessage?: string;
  onChange: (selectedIds: string[]) => void;
  /** When true, show the step-style heading (V13 step). */
  showHeading?: boolean;
  headingId?: string;
};

/**
 * Multi-select cards for “what this person needs to do”.
 * Used as V13 step content and as an in-flow filter on V14 Permissions.
 */
export function AccessNeedsFilter({
  selectedIds,
  errorMessage,
  onChange,
  showHeading = false,
  headingId = 'access-needs-heading',
}: AccessNeedsFilterProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggleNeed(needId: InviteAccessNeedId) {
    if (selectedSet.has(needId)) {
      onChange(selectedIds.filter((id) => id !== needId));
      return;
    }
    onChange([...selectedIds, needId]);
  }

  function handleCardKeyDown(event: React.KeyboardEvent, need: InviteAccessNeed) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleNeed(need.id);
    }
  }

  return (
    <div className={styles.accessNeedsFilterBlock}>
      {showHeading ? (
        <div className={styles.accessNeedsHeader}>
          <h2 id={headingId} className={styles.stepPanelTitle}>
            What will this person need to do?
          </h2>
          <p className={styles.permitSubsectionHint}>
            Select a service to provide the permission.
          </p>
        </div>
      ) : (
        <div className={styles.accessNeedsHeader}>
          <h3 id={headingId} className={`ontario-h5 ${styles.permitSubsectionTitle}`}>
            Filter by what they need to do
          </h3>
          <p className={styles.permitSubsectionHint}>
            Select a service to provide the permission.
          </p>
        </div>
      )}

      <div
        id={INVITE_FIELD_ANCHORS.accessNeeds}
        className={styles.roleStack}
        role="group"
        aria-labelledby={headingId}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? 'invite-access-needs-error' : undefined}
        tabIndex={-1}
      >
        {INVITE_ACCESS_NEEDS.map((need) => {
          const isSelected = selectedSet.has(need.id);
          return (
            <div
              key={need.id}
              className={`${styles.roleRadioCard} ${isSelected ? styles.roleRadioCardSelected : ''} ${errorMessage ? styles.roleRadioCardError : ''}`}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => toggleNeed(need.id)}
              onKeyDown={(event) => handleCardKeyDown(event, need)}
            >
              <div className={styles.roleRadioCardContent}>
                <span
                  className={`${styles.roleCheckboxIndicator} ${isSelected ? styles.roleCheckboxIndicatorSelected : ''}`}
                  aria-hidden="true"
                />
                <div className={styles.roleRadioCardText}>
                  <span className={styles.roleCardTitle}>{need.label}</span>
                  <p className={styles.roleCardDescription}>{need.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errorMessage ? (
        <p id="invite-access-needs-error" className={styles.fieldErrorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

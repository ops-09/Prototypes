import styles from './InviteUserWizard.module.scss';

type CreateProjectSectionProps = {
  groupId: string;
  checked: boolean;
  errorMessage?: string;
  onChange: (checked: boolean) => void;
};

/**
 * ODS OntarioRadioButtons only stacks options vertically (shadow DOM; no horizontal prop).
 * Compose a side-by-side Yes/No group with tokens for the Mining Permissions mock.
 */
export function CreateProjectSection({
  groupId,
  checked,
  errorMessage,
  onChange,
}: CreateProjectSectionProps) {
  const labelId = `${groupId}-create-project-label`;
  const hintId = `${groupId}-create-project-hint`;
  const errorId = `${groupId}-create-project-error`;

  return (
    <div className={styles.createProjectSection}>
      <div className={styles.createProjectRow}>
        <div className={styles.createProjectCopy}>
          <p id={labelId} className={styles.createProjectLabel}>
            Permission to add or create project
          </p>
          <p id={hintId} className={styles.createProjectHint}>
            Enable this option if you want this user to create new projects.
          </p>
          {errorMessage ? (
            <p id={errorId} className={styles.fieldErrorMessage} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div
          className={styles.createProjectRadios}
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={errorMessage ? `${hintId} ${errorId}` : hintId}
          aria-invalid={errorMessage ? true : undefined}
        >
          <label className={styles.createProjectRadioOption} htmlFor={`${groupId}-create-project-yes`}>
            <input
              id={`${groupId}-create-project-yes`}
              className={styles.createProjectRadioInput}
              type="radio"
              name={`${groupId}-create-project`}
              value="yes"
              checked={checked}
              onChange={() => onChange(true)}
            />
            <span className={styles.createProjectRadioControl} aria-hidden="true" />
            <span className={styles.createProjectRadioText}>Yes</span>
          </label>

          <label className={styles.createProjectRadioOption} htmlFor={`${groupId}-create-project-no`}>
            <input
              id={`${groupId}-create-project-no`}
              className={styles.createProjectRadioInput}
              type="radio"
              name={`${groupId}-create-project`}
              value="no"
              checked={!checked}
              onChange={() => onChange(false)}
            />
            <span className={styles.createProjectRadioControl} aria-hidden="true" />
            <span className={styles.createProjectRadioText}>No</span>
          </label>
        </div>
      </div>
    </div>
  );
}

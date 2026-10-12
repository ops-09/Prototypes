import userTableStyles from '../user-management/UsersTable.module.scss';
import styles from './InviteUserWizard.module.scss';

type CreateProjectSectionProps = {
  groupId: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function CreateProjectSection({
  groupId,
  checked,
  onChange,
}: CreateProjectSectionProps) {
  const elementId = `${groupId}-create-project`;

  return (
    <div className={styles.createProjectSection}>
      <label
        className={`${styles.createProjectCard} ${checked ? styles.createProjectCardSelected : ''}`}
        htmlFor={elementId}
      >
        <span className={styles.createProjectCardContent}>
          <span className={styles.createProjectCheckboxControl}>
            <input
              id={elementId}
              type="checkbox"
              className={userTableStyles.tableCheckboxInput}
              name={`${groupId}-create-project`}
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
            />
            <span className={userTableStyles.tableCheckboxIndicator} aria-hidden="true" />
          </span>
          <span className={styles.createProjectCardText}>
            <span className={styles.createProjectCardTitle}>Project Creation</span>
            <span className={styles.createProjectCardDescription}>
              Select this option if you want this user to create new projects
            </span>
          </span>
        </span>
      </label>
    </div>
  );
}

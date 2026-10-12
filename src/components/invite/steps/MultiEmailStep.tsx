import { MultiEmailInput } from '../MultiEmailInput';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type MultiEmailStepProps = {
  emails: string[];
  existingEmails: string[];
  errorMessage?: string;
  onChange: (emails: string[]) => void;
};

export function MultiEmailStep({
  emails,
  existingEmails,
  errorMessage,
  onChange,
}: MultiEmailStepProps) {
  return (
    <section className={styles.stepPanel} aria-label="Add users">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>
          {formatInviteStepTitle('Add users')}
        </h2>
      </div>

      <MultiEmailInput
        emails={emails}
        existingEmails={existingEmails}
        errorMessage={errorMessage}
        onChange={onChange}
      />
    </section>
  );
}

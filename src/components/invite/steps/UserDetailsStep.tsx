import {
  OntarioIconAlertSuccess,
  OntarioInput,
} from '@ongov/ontario-design-system-component-library-react';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type UserDetailsStepProps = {
  email: string;
  confirmEmail: string;
  emailError?: string;
  confirmEmailError?: string;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
};

function getInputValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

export function UserDetailsStep({
  email,
  confirmEmail,
  emailError,
  confirmEmailError,
  onEmailChange,
  onConfirmEmailChange,
}: UserDetailsStepProps) {
  const emailsMatch =
    email.trim().length > 0 &&
    confirmEmail.trim().length > 0 &&
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  return (
    <section className={styles.stepPanel} aria-label="User details">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>{formatInviteStepTitle('User details')}</h2>
      </div>

      <div className={styles.formStack}>
        <OntarioInput
          caption="Email address"
          name="invite-email"
          type="email"
          required
          requiredValidationMessage="Enter an email address."
          value={email}
          errorMessage={emailError}
          customOnInput={(event) => onEmailChange(getInputValue(event))}
        />
        <OntarioInput
          caption="Confirm email"
          name="invite-confirm-email"
          type="email"
          required
          requiredValidationMessage="Confirm the email address."
          value={confirmEmail}
          errorMessage={confirmEmailError}
          customOnInput={(event) => onConfirmEmailChange(getInputValue(event))}
        />
        {emailsMatch && (
          <p className={styles.matchMessage}>
            <OntarioIconAlertSuccess />
            Emails match
          </p>
        )}
      </div>
    </section>
  );
}

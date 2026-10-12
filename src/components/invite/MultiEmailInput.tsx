import {
  OntarioButton,
  OntarioIconAlertSuccess,
  OntarioIconClose,
  OntarioInput,
  OntarioPageAlert,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import { useId, useState } from 'react';
import {
  emailListsMatch,
  isValidEmail,
  mergeEmailLists,
  parseCsvEmailLines,
  validateEmailList,
} from '../../rbac/inviteEmailUtils';
import wizardStyles from './InviteUserWizard.module.scss';
import styles from './MultiEmailInput.module.scss';

type MultiEmailInputProps = {
  emails: string[];
  existingEmails: string[];
  onChange: (emails: string[]) => void;
  errorMessage?: string;
};

function getInputValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function getTextareaValue(event: globalThis.Event) {
  const target = event.target as HTMLTextAreaElement | null;
  return target?.value ?? '';
}

export function MultiEmailInput({
  emails,
  existingEmails,
  onChange,
  errorMessage,
}: MultiEmailInputProps) {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [confirmEmailError, setConfirmEmailError] = useState<string | undefined>();
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvDraft, setCsvDraft] = useState('');
  const [csvConfirmDraft, setCsvConfirmDraft] = useState('');
  const [csvError, setCsvError] = useState<string | undefined>();

  const emailsMatch =
    email.trim().length > 0 &&
    confirmEmail.trim().length > 0 &&
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  const csvEmailsMatch =
    csvDraft.trim().length > 0 &&
    csvConfirmDraft.trim().length > 0 &&
    emailListsMatch(parseCsvEmailLines(csvDraft), parseCsvEmailLines(csvConfirmDraft));

  function addEmailToList() {
    const trimmedEmail = email.trim();
    const trimmedConfirm = confirmEmail.trim();
    let valid = true;

    if (!trimmedEmail) {
      setEmailError('Enter an email address.');
      valid = false;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError(undefined);
    }

    if (!trimmedConfirm) {
      setConfirmEmailError('Confirm the email address.');
      valid = false;
    } else if (trimmedEmail.toLowerCase() !== trimmedConfirm.toLowerCase()) {
      setConfirmEmailError('Email addresses must match.');
      valid = false;
    } else {
      setConfirmEmailError(undefined);
    }

    if (!valid) {
      return;
    }

    const { valid: validEmails, issues } = validateEmailList(
      [trimmedEmail],
      [...existingEmails, ...emails],
    );

    if (validEmails.length === 0) {
      setEmailError(issues[0]?.reason ?? 'Unable to add this email.');
      return;
    }

    onChange(mergeEmailLists(emails, validEmails));
    setEmail('');
    setConfirmEmail('');
    setEmailError(undefined);
    setConfirmEmailError(undefined);
  }

  function removeEmail(emailToRemove: string) {
    onChange(emails.filter((entry) => entry !== emailToRemove));
  }

  function importCsvEmails() {
    const parsed = parseCsvEmailLines(csvDraft);
    const confirmParsed = parseCsvEmailLines(csvConfirmDraft);

    if (parsed.length === 0) {
      setCsvError('Add at least one email address.');
      return;
    }

    if (!emailListsMatch(parsed, confirmParsed)) {
      setCsvError('Email lists must match.');
      return;
    }

    const { valid } = validateEmailList(parsed, [...existingEmails, ...emails]);
    if (valid.length === 0) {
      setCsvError('No new valid email addresses to import.');
      return;
    }

    onChange(mergeEmailLists(emails, valid));
    setCsvDraft('');
    setCsvConfirmDraft('');
    setCsvError(undefined);
    setShowCsvImport(false);
  }

  return (
    <div className={styles.multiEmailInput}>
      <div className={wizardStyles.formStack}>
        <OntarioInput
          caption="Email address"
          name="invite-batch-email"
          elementId={emailInputId}
          type="email"
          required
          requiredValidationMessage="Enter an email address."
          hintText="Add one user at a time. Confirm each address before adding to the list."
          value={email}
          errorMessage={emailError}
          customOnInput={(event) => {
            setEmail(getInputValue(event));
            setEmailError(undefined);
          }}
        />
        <OntarioInput
          caption="Confirm email"
          name="invite-batch-confirm-email"
          elementId={`${emailInputId}-confirm`}
          type="email"
          required
          requiredValidationMessage="Confirm the email address."
          value={confirmEmail}
          errorMessage={confirmEmailError}
          customOnInput={(event) => {
            setConfirmEmail(getInputValue(event));
            setConfirmEmailError(undefined);
          }}
        />
        {emailsMatch && (
          <p className={wizardStyles.matchMessage}>
            <OntarioIconAlertSuccess />
            Emails match
          </p>
        )}
      </div>

      <div className={styles.multiEmailActions}>
        <OntarioButton type="secondary" htmlType="button" onClick={addEmailToList}>
          Add to list
        </OntarioButton>
        <OntarioButton
          type="tertiary"
          htmlType="button"
          onClick={() => {
            setShowCsvImport((current) => !current);
            setCsvError(undefined);
          }}
        >
          {showCsvImport ? 'Hide CSV import' : 'Import from CSV'}
        </OntarioButton>
      </div>

      {showCsvImport && (
        <div className={styles.csvImportPanel}>
          <div className={wizardStyles.formStack}>
            <OntarioTextarea
              caption="Paste CSV or one email per line"
              name="invite-batch-csv-emails"
              elementId={`${emailInputId}-csv`}
              hintText="Only email addresses are imported; permissions are configured in later steps."
              value={csvDraft}
              customOnInput={(event) => {
                setCsvDraft(getTextareaValue(event));
                setCsvError(undefined);
              }}
            />
            <OntarioTextarea
              caption="Confirm emails"
              name="invite-batch-csv-confirm-emails"
              elementId={`${emailInputId}-csv-confirm`}
              hintText="Re-enter the same email addresses to confirm."
              value={csvConfirmDraft}
              customOnInput={(event) => {
                setCsvConfirmDraft(getTextareaValue(event));
                setCsvError(undefined);
              }}
            />
            {csvEmailsMatch && (
              <p className={wizardStyles.matchMessage}>
                <OntarioIconAlertSuccess />
                Email lists match
              </p>
            )}
          </div>
          {csvError && (
            <OntarioPageAlert type="error" heading="Unable to import" content={csvError} />
          )}
          <OntarioButton type="secondary" htmlType="button" onClick={importCsvEmails}>
            Import emails
          </OntarioButton>
        </div>
      )}

      {errorMessage && (
        <OntarioPageAlert type="error" heading="Email required" content={errorMessage} />
      )}

      {emails.length > 0 && (
        <div className={styles.emailListSection}>
          <label className={styles.emailListLabel} id={`${emailInputId}-list-label`}>
            Email list
          </label>
          <p className={styles.emailListHint}>{emails.length} users selected</p>
          <ul
            className={styles.emailChipList}
            aria-labelledby={`${emailInputId}-list-label`}
          >
            {emails.map((entry) => (
              <li key={entry} className={styles.emailChip}>
                <span>{entry}</span>
                <button
                  type="button"
                  className={styles.emailChipRemove}
                  aria-label={`Remove ${entry}`}
                  onClick={() => removeEmail(entry)}
                >
                  <OntarioIconClose colour="black" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {emails.length === 0 && (
        <p className={styles.emailCount}>{emails.length} users selected</p>
      )}
    </div>
  );
}

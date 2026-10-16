import { OntarioIconAlertError } from '@ongov/ontario-design-system-component-library-react';
import styles from './FieldErrorMessage.module.scss';

type FieldErrorMessageProps = {
  id?: string;
  message?: string;
};

/** Matches ODS ontario-error-messaging (icon + message above the control). */
export function FieldErrorMessage({ id, message }: FieldErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div id={id} className={styles.errorMessaging} role="alert">
      <OntarioIconAlertError iconWidth={24} isDecorative />
      <div className={styles.content}>{message}</div>
    </div>
  );
}

import styles from './InviteUserWizard.module.scss';

type AccessToggleProps = {
  enabled: boolean;
  label: string;
  onChange: (enabled: boolean) => void;
};

// ODS v8.1 has no toggle/switch component — Ontario blue switch using design tokens.
export function AccessToggle({ enabled, label, onChange }: AccessToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      className={`${styles.accessToggle} ${enabled ? styles.accessToggleOn : ''}`}
      aria-checked={enabled}
      aria-label={`${enabled ? 'Disable' : 'Enable'} access to ${label}`}
      onClick={() => onChange(!enabled)}
    >
      <span className={styles.accessToggleThumb} aria-hidden="true" />
    </button>
  );
}

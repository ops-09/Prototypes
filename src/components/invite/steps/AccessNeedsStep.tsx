import { AccessNeedsFilter } from '../AccessNeedsFilter';
import styles from '../InviteUserWizard.module.scss';

type AccessNeedsStepProps = {
  selectedIds: string[];
  errorMessage?: string;
  onChange: (selectedIds: string[]) => void;
};

/** V13 dedicated step — checkbox cards. */
export function AccessNeedsStep({
  selectedIds,
  errorMessage,
  onChange,
}: AccessNeedsStepProps) {
  return (
    <section className={styles.stepPanel} aria-label="Access needs">
      <AccessNeedsFilter
        selectedIds={selectedIds}
        errorMessage={errorMessage}
        onChange={onChange}
        showHeading
      />
    </section>
  );
}

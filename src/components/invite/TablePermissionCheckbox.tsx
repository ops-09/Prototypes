import userTableStyles from '../user-management/UsersTable.module.scss';

type TablePermissionCheckboxProps = {
  projectLabel: string;
  permissionLabel: 'View' | 'Edit';
  name: string;
  elementId: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

// ODS OntarioCheckboxes always renders a fieldset legend, which breaks inside table cells.
export function TablePermissionCheckbox({
  projectLabel,
  permissionLabel,
  name,
  elementId,
  checked,
  onChange,
}: TablePermissionCheckboxProps) {
  return (
    <label className={userTableStyles.tableCheckbox} htmlFor={elementId}>
      <input
        id={elementId}
        type="checkbox"
        className={userTableStyles.tableCheckboxInput}
        name={name}
        checked={checked}
        aria-label={`${permissionLabel} access for ${projectLabel}`}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={userTableStyles.tableCheckboxIndicator} aria-hidden="true" />
    </label>
  );
}

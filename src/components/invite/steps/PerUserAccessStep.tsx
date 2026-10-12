import {
  OntarioButton,
  OntarioDropdownList,
  OntarioInput,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { useMemo, useState } from 'react';
import {
  applyTemplateToServiceAccess,
  getAccessTemplateById,
  listAccessTemplates,
  saveAccessTemplate,
} from '../../../rbac/accessTemplates';
import { ROLES } from '../../../rbac/roles';
import { DEFAULT_SERVICE_ACCESS } from '../../../rbac/services';
import { formatRoleLabel, summarizeServiceAccess } from '../../../rbac/rbacService';
import type { AccessTemplate, BatchUserEntry, BusinessUser, RoleId } from '../../../rbac/types';
import userTableStyles from '../../user-management/UsersTable.module.scss';
import { AccessCustomizeOverlay } from '../AccessCustomizeOverlay';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type PerUserAccessStepProps = {
  entries: BatchUserEntry[];
  users: BusinessUser[];
  onChange: (entries: BatchUserEntry[]) => void;
};

function getSelectValue(event: globalThis.Event) {
  const target = event.target as HTMLSelectElement | null;
  return target?.value ?? '';
}

function getInputValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

export function PerUserAccessStep({ entries, users, onChange }: PerUserAccessStepProps) {
  const templates = useMemo(() => listAccessTemplates(), []);
  const [customizeEmail, setCustomizeEmail] = useState<string | null>(null);
  const [copyFromUserId, setCopyFromUserId] = useState('');
  const [templateNameDraft, setTemplateNameDraft] = useState('');
  const [saveTemplateForEmail, setSaveTemplateForEmail] = useState<string | null>(null);

  const customizeEntry = entries.find((entry) => entry.email === customizeEmail);

  const copyableUsers = users.filter((user) => user.status !== 'removed');

  function updateEntry(email: string, patch: Partial<BatchUserEntry>) {
    onChange(
      entries.map((entry) => (entry.email === email ? { ...entry, ...patch } : entry)),
    );
  }

  function applyTemplate(email: string, templateId: string) {
    const template = getAccessTemplateById(templateId);
    if (!template) {
      return;
    }

    updateEntry(email, {
      roleId: template.roleId,
      serviceAccess: applyTemplateToServiceAccess(template),
    });
  }

  function copyFromPrevious(index: number) {
    if (index <= 0) {
      return;
    }

    const previous = entries[index - 1];
    const current = entries[index];
    updateEntry(current.email, {
      roleId: previous.roleId,
      serviceAccess: structuredClone(previous.serviceAccess),
    });
  }

  function applyCopyFromUserToAll() {
    const user = copyableUsers.find((entry) => entry.id === copyFromUserId);
    if (!user) {
      return;
    }

    onChange(
      entries.map((entry) => ({
        ...entry,
        roleId: user.roleId,
        serviceAccess: structuredClone(user.serviceAccess ?? DEFAULT_SERVICE_ACCESS),
      })),
    );
  }

  function saveTemplateForEntry(email: string) {
    const entry = entries.find((item) => item.email === email);
    if (!entry || !templateNameDraft.trim()) {
      return;
    }

    saveAccessTemplate(templateNameDraft, entry.roleId, entry.serviceAccess);
    setTemplateNameDraft('');
    setSaveTemplateForEmail(null);
  }

  const templateOptions = templates.map((template: AccessTemplate) => ({
    value: template.id,
    label: template.name,
  }));

  const roleOptions = ROLES.map((role: (typeof ROLES)[number]) => ({
    value: role.id,
    label: role.label,
  }));

  const userOptions = copyableUsers.map((user) => ({
    value: user.id,
    label: `${user.email} (${formatRoleLabel(user.roleId)})`,
  }));

  return (
    <section className={styles.stepPanel} aria-label="Assign access per user">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>
          {formatInviteStepTitle('Assign access')}
        </h2>
      </div>

      <p className={styles.serviceAccessIntro}>
        Choose a role and access template for each user. Use Customize to fine-tune project
        permissions.
      </p>

      {copyableUsers.length > 0 && (
        <div className={styles.perUserBulkActions}>
          <OntarioDropdownList
            caption="Copy access from existing user"
            name="copy-access-from-user"
            elementId="copy-access-from-user"
            isEmptyStartOption
            options={userOptions}
            value={copyFromUserId}
            customOnChange={(event) => setCopyFromUserId(getSelectValue(event))}
          />
          <OntarioButton type="secondary" htmlType="button" onClick={applyCopyFromUserToAll}>
            Apply to all rows
          </OntarioButton>
        </div>
      )}

      <div className={userTableStyles.tableWrap}>
        <table className={userTableStyles.table}>
          <caption className="ontario-show-for-sr">Per-user access assignment</caption>
          <thead>
            <tr>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Email
              </th>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Role
              </th>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Access template
              </th>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Summary
              </th>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.email}>
                <td>
                  <span className={userTableStyles.cellText}>{entry.email}</span>
                </td>
                <td>
                  <OntarioDropdownList
                    caption={{ captionText: `Role for ${entry.email}`, captionType: 'default' }}
                    name={`role-${entry.email}`}
                    elementId={`role-${index}`}
                    options={roleOptions}
                    value={entry.roleId}
                    customOnChange={(event) =>
                      updateEntry(entry.email, {
                        roleId: getSelectValue(event) as RoleId,
                      })
                    }
                  />
                </td>
                <td>
                  <OntarioDropdownList
                    caption={{
                      captionText: `Template for ${entry.email}`,
                      captionType: 'default',
                    }}
                    name={`template-${entry.email}`}
                    elementId={`template-${index}`}
                    isEmptyStartOption
                    options={templateOptions}
                    customOnChange={(event) => applyTemplate(entry.email, getSelectValue(event))}
                  />
                </td>
                <td>
                  <span className={userTableStyles.cellText}>
                    {summarizeServiceAccess(entry.serviceAccess)}
                  </span>
                </td>
                <td>
                  <div className={styles.perUserRowActions}>
                    <OntarioButton
                      type="tertiary"
                      htmlType="button"
                      onClick={() => setCustomizeEmail(entry.email)}
                    >
                      Customize
                    </OntarioButton>
                    {index > 0 && (
                      <OntarioButton
                        type="tertiary"
                        htmlType="button"
                        onClick={() => copyFromPrevious(index)}
                      >
                        Same as above
                      </OntarioButton>
                    )}
                    <OntarioButton
                      type="tertiary"
                      htmlType="button"
                      onClick={() =>
                        setSaveTemplateForEmail(
                          saveTemplateForEmail === entry.email ? null : entry.email,
                        )
                      }
                    >
                      Save as template
                    </OntarioButton>
                  </div>
                  {saveTemplateForEmail === entry.email && (
                    <div className={styles.saveTemplateRow}>
                      <OntarioInput
                        caption="Template name"
                        name={`template-name-${index}`}
                        elementId={`template-name-${index}`}
                        value={templateNameDraft}
                        customOnInput={(event) => setTemplateNameDraft(getInputValue(event))}
                      />
                      <OntarioButton
                        type="secondary"
                        htmlType="button"
                        onClick={() => saveTemplateForEntry(entry.email)}
                      >
                        Save template
                      </OntarioButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <OntarioPageAlert
          type="informational"
          heading="No users selected"
          content="Go back and add at least one email address."
        />
      )}

      {customizeEntry && (
        <AccessCustomizeOverlay
          email={customizeEntry.email}
          roleId={customizeEntry.roleId}
          serviceAccess={customizeEntry.serviceAccess}
          onClose={() => setCustomizeEmail(null)}
          onSave={(serviceAccess) => {
            updateEntry(customizeEntry.email, { serviceAccess });
            setCustomizeEmail(null);
          }}
        />
      )}
    </section>
  );
}

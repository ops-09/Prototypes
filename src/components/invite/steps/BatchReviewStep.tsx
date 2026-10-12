import { OntarioCallout, OntarioTable } from '@ongov/ontario-design-system-component-library-react';
import { useMemo, useState } from 'react';
import { formatRoleLabel, summarizeServiceAccess } from '../../../rbac/rbacService';
import type { BatchUserEntry, RoleId, ServiceAccess } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type BatchReviewStepProps = {
  entries: BatchUserEntry[];
  sharedRoleId?: RoleId;
  sharedServiceAccess?: ServiceAccess;
};

export function BatchReviewStep({
  entries,
  sharedRoleId,
  sharedServiceAccess,
}: BatchReviewStepProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const tableColumns = useMemo(
    () => [
      { title: 'Email', key: 'email' },
      { title: 'Role', key: 'role' },
      { title: 'Access summary', key: 'access' },
    ],
    [],
  );

  const tableData = useMemo(
    () =>
      entries.map((entry) => ({
        data: {
          email: entry.email,
          role: formatRoleLabel(entry.roleId),
          access: summarizeServiceAccess(entry.serviceAccess),
        },
      })),
    [entries],
  );

  const sharedAccessSummary =
    sharedRoleId && sharedServiceAccess
      ? `${formatRoleLabel(sharedRoleId)} — ${summarizeServiceAccess(sharedServiceAccess)}`
      : null;

  return (
    <section className={styles.stepPanel} aria-label="Review and confirm">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>
          {formatInviteStepTitle('Review and confirm')}
        </h2>
      </div>

      {sharedAccessSummary && (
        <p className={styles.batchReviewSharedSummary}>
          Same access for all {entries.length} users: {sharedAccessSummary}
        </p>
      )}

      <OntarioTable
        caption={`${entries.length} invitations to send`}
        fullWidth
        zebraStripes="enabled"
        tableColumns={tableColumns}
        tableData={tableData}
      />

      {entries.length > 1 && !sharedAccessSummary && (
        <div className={styles.batchReviewExpandList}>
          {entries.map((entry) => {
            const isExpanded = expandedEmail === entry.email;
            return (
              <div key={entry.email} className={styles.batchReviewExpandItem}>
                <button
                  type="button"
                  className={styles.batchReviewExpandButton}
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedEmail(isExpanded ? null : entry.email)
                  }
                >
                  {entry.email} — {formatRoleLabel(entry.roleId)}
                </button>
                {isExpanded && (
                  <p className={styles.batchReviewExpandDetail}>
                    {summarizeServiceAccess(entry.serviceAccess)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <OntarioCallout
        headingType="h3"
        headingContent="Invitation emails"
        headingContentType="string"
        highlightColour="blue"
      >
        {entries.length === 1
          ? `An invitation will be sent to ${entries[0].email}. They will appear as Pending until they accept.`
          : `Invitations will be sent to ${entries.length} users. They will appear as Pending until they accept.`}
      </OntarioCallout>
    </section>
  );
}

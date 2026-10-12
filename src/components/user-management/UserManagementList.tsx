import {
  OntarioButton,
  OntarioLoadingIndicator,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { withBasePath } from '../../config/basePath';
import { isBatchInviteEnabled } from '../../config/features';
import { useRbac } from '../../rbac/RbacContext';
import type { InviteLocationState, InvitePrefillState } from '../../rbac/types';
import styles from './UserManagement.module.scss';
import { UsersTable } from './UsersTable';

function formatBatchSuccessContent(
  invitedCount: number,
  skipped: InviteLocationState['inviteBatchSuccess'] extends infer T
    ? T extends { skipped: infer S }
      ? S
      : never
    : never,
) {
  const skippedCount = skipped?.length ?? 0;
  let content = `${invitedCount} invitation${invitedCount === 1 ? '' : 's'} sent.`;

  if (skippedCount > 0) {
    const reasons = skipped
      ?.map((entry) => `${entry.email} (${entry.reason})`)
      .join('; ');
    content += ` ${skippedCount} skipped: ${reasons}`;
  }

  return content;
}

export function UserManagementList() {
  const location = useLocation();
  const navigate = useNavigate();
  const batchInviteEnabled = isBatchInviteEnabled();
  const successAlertRef = useRef<HTMLDivElement>(null);
  const handledInviteEmailRef = useRef<string | null>(null);
  const handledBatchSuccessRef = useRef<string | null>(null);
  const { users, pageAlert, isLoading, clearPageAlert, setPageAlert, removeBusinessUser } = useRbac();
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [inviteAnotherPrefill, setInviteAnotherPrefill] = useState<InvitePrefillState | null>(
    null,
  );

  const pendingUser = users.find((user) => user.id === pendingDeleteId);
  const locationState = location.state as InviteLocationState | null;

  useLayoutEffect(() => {
    const inviteSuccessEmail = locationState?.inviteSuccessEmail;
    if (!inviteSuccessEmail || handledInviteEmailRef.current === inviteSuccessEmail) {
      return;
    }

    handledInviteEmailRef.current = inviteSuccessEmail;

    setPageAlert({
      type: 'success',
      heading: 'Invitation sent',
      content: `An invitation was sent to ${inviteSuccessEmail}. They will appear as Pending until they accept.`,
    });
    navigate(location.pathname, { replace: true, state: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, locationState, navigate, setPageAlert]);

  useLayoutEffect(() => {
    const batchSuccess = locationState?.inviteBatchSuccess;
    if (!batchSuccess) {
      return;
    }

    const signature = `${batchSuccess.invitedCount}:${batchSuccess.skipped.map((s) => s.email).join(',')}`;
    if (handledBatchSuccessRef.current === signature) {
      return;
    }

    handledBatchSuccessRef.current = signature;

    if (locationState?.inviteAnotherSameAccess) {
      setInviteAnotherPrefill(locationState.inviteAnotherSameAccess);
    }

    setPageAlert({
      type: 'success',
      heading: 'Invitations sent',
      content: formatBatchSuccessContent(batchSuccess.invitedCount, batchSuccess.skipped),
    });
    navigate(location.pathname, { replace: true, state: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, locationState, navigate, setPageAlert]);

  useEffect(() => {
    if (pageAlert?.type === 'success') {
      successAlertRef.current?.focus();
    }
  }, [pageAlert]);

  function inviteMoreWithSameAccess() {
    navigate('/user-management/invite', {
      state: { inviteAnotherSameAccess: inviteAnotherPrefill ?? undefined },
    });
  }

  async function confirmDelete() {
    if (!pendingDeleteId) {
      return;
    }

    try {
      await removeBusinessUser(pendingDeleteId);
      setPendingDeleteId('');
    } catch {
      // Alert handled in context.
    }
  }

  return (
    <div>
      <OntarioLoadingIndicator
        isLoading={isLoading}
        type="large"
        fullScreenOverlay
        message="Updating users"
      />

      {pageAlert && (
        <div ref={successAlertRef} tabIndex={-1} className={styles.section}>
          <OntarioPageAlert
            type={pageAlert.type}
            heading={pageAlert.heading}
            content={pageAlert.content}
          />
          {pageAlert.type === 'success' && inviteAnotherPrefill && batchInviteEnabled && (
            <div className={styles.inviteAnotherActions}>
              <OntarioButton type="secondary" htmlType="button" onClick={inviteMoreWithSameAccess}>
                Invite more with same access
              </OntarioButton>
            </div>
          )}
        </div>
      )}

      <section className={styles.listCard} aria-label="User list">
        <div className={styles.listCardHeader}>
          <p className={`ontario-h5 ${styles.listCardHeading}`}>{users.length} users</p>
          <OntarioButton
            type="tertiary"
            htmlType="button"
            href={withBasePath('/user-management/invite')}
          >
            {batchInviteEnabled ? 'Invite users' : 'Invite user'}
          </OntarioButton>
        </div>

        <UsersTable users={users} onDeleteUser={setPendingDeleteId} />
      </section>

      {pendingUser && (
        <div className={styles.section}>
          <OntarioPageAlert
            type="warning"
            heading="Remove user access?"
            content={`${pendingUser.email} will lose access to this business profile.`}
          />
          <div className={styles.confirmActions}>
            <OntarioButton type="primary" htmlType="button" onClick={confirmDelete}>
              Confirm removal
            </OntarioButton>
            <OntarioButton
              type="secondary"
              htmlType="button"
              onClick={() => {
                setPendingDeleteId('');
                clearPageAlert();
              }}
            >
              Cancel
            </OntarioButton>
          </div>
        </div>
      )}
    </div>
  );
}

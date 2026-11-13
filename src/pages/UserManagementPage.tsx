import { useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import { UserManagementList } from '../components/user-management/UserManagementList';
import {
  InviteWizardVersionProvider,
  useInviteWizardVersionContext,
} from '../components/invite/InviteWizardVersionContext';

function UserManagementPageContent() {
  const { setToggleVisible } = useInviteWizardVersionContext();

  useEffect(() => {
    setToggleVisible(true);
    return () => {
      setToggleVisible(false);
    };
  }, [setToggleVisible]);

  return (
    <AppShell>
      <PageBoilerplate
        title="User management"
        description="Track and manage users associated with Ontario Business Corporation - 48525334."
      >
        <UserManagementList />
      </PageBoilerplate>
    </AppShell>
  );
}

export function UserManagementPage() {
  return (
    <InviteWizardVersionProvider>
      <UserManagementPageContent />
    </InviteWizardVersionProvider>
  );
}

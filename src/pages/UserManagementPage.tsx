import { AppShell } from '../components/layout/AppShell';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import { UserManagementList } from '../components/user-management/UserManagementList';

export function UserManagementPage() {
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

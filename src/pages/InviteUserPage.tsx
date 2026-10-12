import { AppShell } from '../components/layout/AppShell';
import { InviteEntryOrchestrator } from '../components/invite/InviteEntryOrchestrator';
import { InviteWizardVersionProvider } from '../components/invite/InviteWizardVersionContext';

export function InviteUserPage() {
  return (
    <InviteWizardVersionProvider>
      <AppShell>
        <InviteEntryOrchestrator />
      </AppShell>
    </InviteWizardVersionProvider>
  );
}

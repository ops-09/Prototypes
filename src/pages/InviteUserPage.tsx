import { useEffect } from 'react';
import { usesFocusedInviteLayout } from '../config/inviteWizardVersion';
import { AppShell } from '../components/layout/AppShell';
import { InviteEntryOrchestrator } from '../components/invite/InviteEntryOrchestrator';
import {
  InviteWizardVersionProvider,
  useInviteWizardVersionContext,
} from '../components/invite/InviteWizardVersionContext';

function InviteUserPageContent() {
  const { version, setToggleVisible } = useInviteWizardVersionContext();

  useEffect(() => {
    setToggleVisible(true);
    return () => {
      setToggleVisible(false);
    };
  }, [setToggleVisible]);

  return (
    <AppShell hideSideNav={usesFocusedInviteLayout(version)} flushContentTop>
      <InviteEntryOrchestrator />
    </AppShell>
  );
}

export function InviteUserPage() {
  return (
    <InviteWizardVersionProvider>
      <InviteUserPageContent />
    </InviteWizardVersionProvider>
  );
}

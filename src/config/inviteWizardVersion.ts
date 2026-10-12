import { useCallback, useState } from 'react';

export type InviteWizardVersion = 'v1' | 'v2';

const STORAGE_KEY = 'ops-rbac:invite-wizard-version';
const MIGRATION_KEY = 'ops-rbac:invite-wizard-version-labels-swapped';

function migrateStoredVersionLabels() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (localStorage.getItem(MIGRATION_KEY)) {
    return;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'v1') {
    localStorage.setItem(STORAGE_KEY, 'v2');
  } else if (stored === 'v2') {
    localStorage.setItem(STORAGE_KEY, 'v1');
  }

  localStorage.setItem(MIGRATION_KEY, '1');
}

export function getInviteWizardVersion(): InviteWizardVersion {
  migrateStoredVersionLabels();

  if (typeof localStorage === 'undefined') {
    return 'v2';
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'v1' || stored === 'v2') {
    return stored;
  }

  return 'v2';
}

export function setInviteWizardVersion(version: InviteWizardVersion): InviteWizardVersion {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, version);
  }

  return version;
}

export function useInviteWizardVersion() {
  const [version, setVersionState] = useState<InviteWizardVersion>(getInviteWizardVersion);

  const setVersion = useCallback((next: InviteWizardVersion) => {
    setInviteWizardVersion(next);
    setVersionState(next);
  }, []);

  return { version, setVersion };
}

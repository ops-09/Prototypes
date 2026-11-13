import { useCallback, useState } from 'react';

export type InviteWizardVersion = 'v1' | 'v2' | 'v3' | 'v4';

/** V2 splits provision and permissions into separate steps. */
export function usesV2InviteSteps(version: InviteWizardVersion) {
  return version === 'v2';
}

/** V3 uses the combined Service access step (no side nav). */
export function usesV3InviteSteps(version: InviteWizardVersion) {
  return version === 'v3';
}

/** V4 uses domain gates then dynamic Mining / Permits steps (no side nav). */
export function usesV4InviteSteps(version: InviteWizardVersion) {
  return version === 'v4';
}

/** Focused layouts that hide the app side nav. */
export function usesFocusedInviteLayout(version: InviteWizardVersion) {
  return version === 'v3' || version === 'v4';
}

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

function isInviteWizardVersion(value: string | null): value is InviteWizardVersion {
  return value === 'v1' || value === 'v2' || value === 'v3' || value === 'v4';
}

export function getInviteWizardVersion(): InviteWizardVersion {
  migrateStoredVersionLabels();

  if (typeof localStorage === 'undefined') {
    return 'v2';
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (isInviteWizardVersion(stored)) {
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

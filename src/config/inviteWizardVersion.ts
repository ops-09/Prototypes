import { useCallback, useState } from 'react';

export type InviteWizardVersion =
  | 'v1'
  | 'v2'
  | 'v3'
  | 'v4'
  | 'v5'
  | 'v6'
  | 'v7'
  | 'v8'
  | 'v9'
  | 'v10'
  | 'v11'
  | 'v12'
  | 'v13'
  | 'v14'
  | 'v15';

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

/** V5 same dynamic path as V4; create scope is All ministries vs individual permits. */
export function usesV5InviteSteps(version: InviteWizardVersion) {
  return version === 'v5';
}

/** V6 same path/model as V5; Individual adds browse + search affordances. */
export function usesV6InviteSteps(version: InviteWizardVersion) {
  return version === 'v6';
}

/** V7: one Permissions step with Mining | New | Existing tabs (no domain-gates step). */
export function usesV7InviteSteps(version: InviteWizardVersion) {
  return version === 'v7';
}

/** V8: same path as V7; Create uses expandable ministry cards. */
export function usesV8InviteSteps(version: InviteWizardVersion) {
  return version === 'v8';
}

/** V9: same as V8; ministry filter is a searchable multi-select combo. */
export function usesV9InviteSteps(version: InviteWizardVersion) {
  return version === 'v9';
}

/** V10: same as V9; combo shows permit match context and permit-name tags. */
export function usesV10InviteSteps(version: InviteWizardVersion) {
  return version === 'v10';
}

/** V11: search + tags only (no ministry cards below). */
export function usesV11InviteSteps(version: InviteWizardVersion) {
  return version === 'v11';
}

/** V12: catalog page (cards) + selected permits table on Permissions. */
export function usesV12InviteSteps(version: InviteWizardVersion) {
  return version === 'v12';
}

/** V13: same as V12 + invitee callout; dedicated Access needs step after role. */
export function usesV13InviteSteps(version: InviteWizardVersion) {
  return version === 'v13';
}

/**
 * V14: V13-like Permissions (callout + catalog table) without Access needs step
 * or scope tabs — Add opens the catalog; application filters reveal new permits,
 * existing apps, mining, and other applications.
 */
export function usesV14InviteSteps(version: InviteWizardVersion) {
  return version === 'v14';
}

/**
 * V15: same as V13 (access needs + callout) but Permissions uses ministry-style
 * expanders instead of create / existing / mining tabs.
 */
export function usesV15InviteSteps(version: InviteWizardVersion) {
  return version === 'v15';
}

/** V13 + V15 share the Access needs step after role. */
export function usesAccessNeedsInviteStep(version: InviteWizardVersion) {
  return version === 'v13' || version === 'v15';
}

/** V7–V15 share the combined Permissions step path (no domain gates). */
export function usesCombinedPermissionsSteps(version: InviteWizardVersion) {
  return (
    version === 'v7' ||
    version === 'v8' ||
    version === 'v9' ||
    version === 'v10' ||
    version === 'v11' ||
    version === 'v12' ||
    version === 'v13' ||
    version === 'v14' ||
    version === 'v15'
  );
}

/** V4–V6 use domain gates + split mining/permits; V7–V15 use combined permissions. */
export function usesDynamicDomainInviteSteps(version: InviteWizardVersion) {
  return (
    version === 'v4' ||
    version === 'v5' ||
    version === 'v6' ||
    version === 'v7' ||
    version === 'v8' ||
    version === 'v9' ||
    version === 'v10' ||
    version === 'v11' ||
    version === 'v12' ||
    version === 'v13' ||
    version === 'v14' ||
    version === 'v15'
  );
}

/** Focused layouts that hide the app side nav. */
export function usesFocusedInviteLayout(version: InviteWizardVersion) {
  return (
    version === 'v3' ||
    version === 'v4' ||
    version === 'v5' ||
    version === 'v6' ||
    version === 'v7' ||
    version === 'v8' ||
    version === 'v9' ||
    version === 'v10' ||
    version === 'v11' ||
    version === 'v12' ||
    version === 'v13' ||
    version === 'v14' ||
    version === 'v15'
  );
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
  return (
    value === 'v1' ||
    value === 'v2' ||
    value === 'v3' ||
    value === 'v4' ||
    value === 'v5' ||
    value === 'v6' ||
    value === 'v7' ||
    value === 'v8' ||
    value === 'v9' ||
    value === 'v10' ||
    value === 'v11' ||
    value === 'v12' ||
    value === 'v13' ||
    value === 'v14' ||
    value === 'v15'
  );
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

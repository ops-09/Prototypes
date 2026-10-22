const STORAGE_KEY = 'ops-rbac.form11.draft';

/** Remaining Form 11 steps are not built yet — update when later stories land. */
export const FORM11_TOTAL_STEPS = 5;

export type Form11Step2Data = {
  primaryActivity: string;
  email: string;
};

export type Form11Draft = {
  step2: Form11Step2Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: 0 | 2;
  confirmationNumber?: string;
};

export const OBR_CORPORATION_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_PRIMARY_ACTIVITY = '624410 - Child day-care services';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';

export const OBR_STEP2_DEFAULTS: Form11Step2Data = {
  primaryActivity: OBR_PRIMARY_ACTIVITY,
  email: OBR_OFFICIAL_EMAIL,
};

export function saveForm11Draft(draft: Form11Draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function readForm11Draft(): Form11Draft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Form11Draft;
    return {
      ...parsed,
      step2: {
        ...OBR_STEP2_DEFAULTS,
        ...(parsed.step2 ?? {}),
      },
    };
  } catch {
    return null;
  }
}

export function clearForm11Draft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function upsertForm11Step2(
  step2: Form11Step2Data,
  savedAs: Form11Draft['savedAs'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (savedAs === 'continue') {
    draft.lastCompletedStep = 2;
  }
  saveForm11Draft(draft);
  return draft;
}

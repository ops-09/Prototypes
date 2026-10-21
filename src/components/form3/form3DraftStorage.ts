import type { UploadedFileMeta } from '../form1/FileUpload';
import {
  createEmptyNuansReport,
  emptyNameNuans,
  normalizeNameNuans,
  type NameNuansFields,
  type SupportingDocMeta,
} from '../form7/form7DraftStorage';

const STORAGE_KEY = 'ops-rbac.form3.draft';

export const FORM3_TOTAL_STEPS = 5;
export const MAX_SUPPORTING_DOC_BYTES = 20 * 1024 * 1024;
export const MAX_PROVISIONS_CHARS = 900_000;

export type Form3NameLanguage = 'english' | 'french' | 'combined' | 'separate' | '';

export type Form3Step1Data = {
  corporationName: string;
  ocn: string;
  primaryActivity: string;
  email: string;
  incorporationDate: string;
};

export type Form3NameChangeData = {
  changeCorporationName: 'change' | 'no' | '';
  hasNumberName: 'yes' | 'no' | '';
  legalElement: string;
  nameLanguage: Form3NameLanguage;
  nameNuans: NameNuansFields;
  proposedNameFr: string;
  notInsolvent: boolean;
};

export type Form3Step4Data = {
  resolutionConfirmedDate: string;
  requestedProvisions: string;
  additional: SupportingDocMeta[];
};

export type Form3Step5Data = {
  authorizationConfirmed: boolean;
  signedPdf: UploadedFileMeta | null;
};

export type Form3Draft = {
  step1: Form3Step1Data;
  nameChange: Form3NameChangeData;
  step4: Form3Step4Data;
  step5: Form3Step5Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: 0 | 1 | 2 | 3 | 4;
  confirmationNumber?: string;
};

export const OBR_CORPORATION_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_INCORPORATION_DATE = '2008-06-15';
export const OBR_OCN = '100003456';
export const OBR_PRIMARY_ACTIVITY = '624410';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';
export const OBR_FILER_FIRST_NAME = 'Alex';
export const OBR_FILER_LAST_NAME = 'Rivera';

export const OBR_STEP1_DEFAULTS: Form3Step1Data = {
  corporationName: OBR_CORPORATION_NAME,
  ocn: OBR_OCN,
  primaryActivity: '',
  email: OBR_OFFICIAL_EMAIL,
  incorporationDate: OBR_INCORPORATION_DATE,
};

export const EMPTY_NAME_CHANGE: Form3NameChangeData = {
  changeCorporationName: '',
  hasNumberName: '',
  legalElement: '',
  nameLanguage: '',
  nameNuans: emptyNameNuans(),
  proposedNameFr: '',
  notInsolvent: false,
};

export const EMPTY_STEP4: Form3Step4Data = {
  resolutionConfirmedDate: '',
  requestedProvisions: '',
  additional: [],
};

export const EMPTY_STEP5: Form3Step5Data = {
  authorizationConfirmed: false,
  signedPdf: null,
};

export function saveForm3Draft(draft: Form3Draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function readForm3Draft(): Form3Draft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Form3Draft;
    return {
      ...parsed,
      step1: {
        ...OBR_STEP1_DEFAULTS,
        ...(parsed.step1 ?? {}),
        primaryActivity:
          parsed.step1?.primaryActivity?.trim() === OBR_PRIMARY_ACTIVITY
            ? ''
            : (parsed.step1?.primaryActivity ?? ''),
      },
      nameChange: {
        ...EMPTY_NAME_CHANGE,
        ...(parsed.nameChange ?? {}),
        nameNuans: normalizeNameNuans(parsed.nameChange?.nameNuans),
      },
      step4: {
        ...EMPTY_STEP4,
        ...(parsed.step4 ?? {}),
        additional: parsed.step4?.additional ?? [],
      },
      step5: {
        ...EMPTY_STEP5,
        ...(parsed.step5 ?? {}),
      },
    };
  } catch {
    return null;
  }
}

export function clearForm3Draft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function upsertForm3Step1(
  step1: Form3Step1Data,
  savedAs: Form3Draft['savedAs'],
): Form3Draft {
  const existing = readForm3Draft();
  const draft: Form3Draft = {
    step1,
    nameChange: existing?.nameChange ?? { ...EMPTY_NAME_CHANGE, nameNuans: emptyNameNuans() },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (savedAs === 'continue') {
    draft.lastCompletedStep = Math.max(draft.lastCompletedStep, 1) as Form3Draft['lastCompletedStep'];
  }
  saveForm3Draft(draft);
  return draft;
}

export function upsertForm3NameChange(
  nameChange: Form3NameChangeData,
  savedAs: Form3Draft['savedAs'],
  lastCompletedStep: Form3Draft['lastCompletedStep'] = 2,
): Form3Draft | null {
  const existing = readForm3Draft();
  if (!existing?.step1.corporationName) {
    return null;
  }
  const draft: Form3Draft = {
    ...existing,
    nameChange,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      savedAs === 'continue'
        ? (Math.max(existing.lastCompletedStep, lastCompletedStep) as Form3Draft['lastCompletedStep'])
        : existing.lastCompletedStep,
  };
  saveForm3Draft(draft);
  return draft;
}

export function upsertForm3Step4(
  step4: Form3Step4Data,
  savedAs: Form3Draft['savedAs'],
  lastCompletedStep: Form3Draft['lastCompletedStep'] = 3,
): Form3Draft | null {
  const existing = readForm3Draft();
  if (!existing?.step1.corporationName || !existing.nameChange.changeCorporationName) {
    return null;
  }
  const draft: Form3Draft = {
    ...existing,
    step4,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      savedAs === 'continue'
        ? (Math.max(existing.lastCompletedStep, lastCompletedStep) as Form3Draft['lastCompletedStep'])
        : existing.lastCompletedStep,
  };
  saveForm3Draft(draft);
  return draft;
}

export function upsertForm3Step5(
  step5: Form3Step5Data,
  savedAs: Form3Draft['savedAs'],
  lastCompletedStep: Form3Draft['lastCompletedStep'] = 4,
  confirmationNumber?: string,
): Form3Draft | null {
  const existing = readForm3Draft();
  if (
    !existing?.step1.corporationName ||
    !existing.nameChange.changeCorporationName ||
    !existing.step4.resolutionConfirmedDate
  ) {
    return null;
  }
  const draft: Form3Draft = {
    ...existing,
    step5,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
    confirmationNumber: confirmationNumber ?? existing.confirmationNumber,
  };
  saveForm3Draft(draft);
  return draft;
}

export function createForm3ConfirmationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `F3-${stamp}-${rand}`;
}

export { createEmptyNuansReport, emptyNameNuans, type NameNuansFields, type SupportingDocMeta };

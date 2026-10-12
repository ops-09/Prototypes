import type { UploadedFileMeta } from '../form1/FileUpload';
import type { NameLanguageOption } from '../form1/nameValidation';

const STORAGE_KEY = 'ops-rbac-form7-draft';

/** Configurable maximum supporting-document size (prototype default 20 MB). */
export const MAX_SUPPORTING_DOC_BYTES = 20 * 1024 * 1024;

export type AmendmentType =
  | 'change-name'
  | 'convert-business-corp'
  | 'convert-not-for-profit'
  | 'reduction-capital'
  | 'amend-other';

export type Form7Step1Data = {
  cooperativeName: string;
  ocn: string;
  primaryActivity: string;
  returnAddress: string;
  email: string;
  cooperativeType: string;
  incorporationDate: string;
};

export type NameNuansFields = {
  languageOption: NameLanguageOption | '';
  proposedName: string;
  proposedNameEn: string;
  proposedNameFr: string;
  nuansFile: UploadedFileMeta | null;
  nuansFileEn: UploadedFileMeta | null;
  nuansFileFr: UploadedFileMeta | null;
  nuansDate: string;
  nuansDateEn: string;
  nuansDateFr: string;
};

export type Form7Step2Data = {
  amendmentType: AmendmentType | '';
  /** Articles of Amendment: Change vs keep current co-operative name. */
  changeCooperativeName: 'change' | 'no' | '';
  nameNuans: NameNuansFields;
  hasNumberName: 'yes' | 'no' | '';
  legalElement: string;
  numberNameNuansFile: UploadedFileMeta | null;
  numberNameNuansDate: string;
  capitalReductionDescription: string;
  capitalReductionDetails: string;
  otherAmendmentDetails: string;
};

export type SupportingDocMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type Form7Step3Data = {
  certifiedResolution: SupportingDocMeta[];
  affidavits: SupportingDocMeta[];
  additional: SupportingDocMeta[];
  /** CCA s.151 subsections authorizing the amendment. */
  authorizationSubsections: string[];
  resolutionConfirmedDate: string;
};

export type Form7Step4Data = {
  authorizationConfirmed: boolean;
  /** Signed review PDF uploaded after generate → sign → upload. */
  signedPdf: UploadedFileMeta | null;
};

export type Form7Draft = {
  step1: Form7Step1Data;
  step2: Form7Step2Data;
  step3: Form7Step3Data;
  step4: Form7Step4Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: 1 | 2 | 3 | 4;
  confirmationNumber?: string;
};

export const EMPTY_NAME_NUANS: NameNuansFields = {
  languageOption: '',
  proposedName: '',
  proposedNameEn: '',
  proposedNameFr: '',
  nuansFile: null,
  nuansFileEn: null,
  nuansFileFr: null,
  nuansDate: '',
  nuansDateEn: '',
  nuansDateFr: '',
};

export const EMPTY_STEP2: Form7Step2Data = {
  amendmentType: '',
  changeCooperativeName: '',
  nameNuans: { ...EMPTY_NAME_NUANS },
  hasNumberName: '',
  legalElement: '',
  numberNameNuansFile: null,
  numberNameNuansDate: '',
  capitalReductionDescription: '',
  capitalReductionDetails: '',
  otherAmendmentDetails: '',
};

export const EMPTY_STEP3: Form7Step3Data = {
  certifiedResolution: [],
  affidavits: [],
  additional: [],
  authorizationSubsections: [],
  resolutionConfirmedDate: '',
};

export const EMPTY_STEP4: Form7Step4Data = {
  authorizationConfirmed: false,
  signedPdf: null,
};

/** Sample OBR registry values for this Articles of Amendment prototype. */
export const OBR_COOPERATIVE_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_INCORPORATION_DATE = '2008-06-15';
export const OBR_OCN = '100003456';
export const OBR_PRIMARY_ACTIVITY = '624410';
export const OBR_RETURN_ADDRESS =
  '123 King Street West\nSuite 400\nToronto ON M5H 1A1';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';
export const OBR_COOPERATIVE_TYPE = 'Worker Co-operative';
/** Prototype authorized filer name for the review authorization statement. */
export const OBR_FILER_FIRST_NAME = 'Alex';
export const OBR_FILER_LAST_NAME = 'Rivera';

/** Default Step 1 values as loaded from OBR (editable fields may be updated by the filer). */
export const OBR_STEP1_DEFAULTS: Form7Step1Data = {
  cooperativeName: OBR_COOPERATIVE_NAME,
  ocn: OBR_OCN,
  primaryActivity: '',
  returnAddress: OBR_RETURN_ADDRESS,
  email: OBR_OFFICIAL_EMAIL,
  cooperativeType: OBR_COOPERATIVE_TYPE,
  incorporationDate: OBR_INCORPORATION_DATE,
};

export function affidavitsRequired(
  amendmentType: AmendmentType | '',
  changeCooperativeName: 'change' | 'no' | '' = '',
) {
  // Affidavits of Solvency apply only when the filer is changing the co-operative name.
  return amendmentType === 'change-name' && changeCooperativeName === 'change';
}

export function saveForm7Draft(draft: Form7Draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function readForm7Draft(): Form7Draft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Form7Draft & {
      step3?: Partial<Form7Step3Data> & {
        authorizationConfirmed?: boolean;
        resolutionConfirmedDate?: string;
      };
      step4?: Partial<Form7Step4Data> & {
        authorizationConfirmed?: boolean;
        resolutionConfirmedDate?: string;
      };
    };
    return {
      ...parsed,
      step1: {
        ...parsed.step1,
        // Legacy drafts seeded the OBR NAICS code — treat as unselected.
        primaryActivity:
          parsed.step1?.primaryActivity?.trim() === OBR_PRIMARY_ACTIVITY
            ? ''
            : (parsed.step1?.primaryActivity ?? ''),
      },
      step3: {
        ...EMPTY_STEP3,
        ...(parsed.step3 ?? {}),
        authorizationSubsections: parsed.step3?.authorizationSubsections ?? [],
        resolutionConfirmedDate:
          parsed.step3?.resolutionConfirmedDate ??
          parsed.step4?.resolutionConfirmedDate ??
          '',
      },
      step4: {
        ...EMPTY_STEP4,
        ...(parsed.step4 ?? {}),
        authorizationConfirmed:
          parsed.step4?.authorizationConfirmed ??
          parsed.step3?.authorizationConfirmed ??
          false,
      },
    };
  } catch {
    return null;
  }
}

export function clearForm7Draft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function emptyStep3(): Form7Step3Data {
  return { ...EMPTY_STEP3 };
}

function emptyStep4(): Form7Step4Data {
  return { ...EMPTY_STEP4 };
}

export function upsertForm7Step1(
  step1: Form7Step1Data,
  savedAs: Form7Draft['savedAs'],
): Form7Draft {
  const existing = readForm7Draft();
  const draft: Form7Draft = {
    step1,
    step2: existing?.step2 ?? { ...EMPTY_STEP2, nameNuans: { ...EMPTY_NAME_NUANS } },
    step3: existing?.step3 ?? emptyStep3(),
    step4: existing?.step4 ?? emptyStep4(),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: 1,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm7Draft(draft);
  return draft;
}

export function upsertForm7Step2(
  step2: Form7Step2Data,
  savedAs: Form7Draft['savedAs'],
  lastCompletedStep: 1 | 2 | 3 | 4 = 2,
): Form7Draft | null {
  const existing = readForm7Draft();
  if (!existing?.step1.cooperativeName) {
    return null;
  }
  const draft: Form7Draft = {
    ...existing,
    step2,
    step3: existing.step3 ?? emptyStep3(),
    step4: existing.step4 ?? emptyStep4(),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
  };
  saveForm7Draft(draft);
  return draft;
}

export function upsertForm7Step3(
  step3: Form7Step3Data,
  savedAs: Form7Draft['savedAs'],
  lastCompletedStep: 1 | 2 | 3 | 4 = 3,
): Form7Draft | null {
  const existing = readForm7Draft();
  if (!existing?.step1.cooperativeName || !existing.step2.amendmentType) {
    return null;
  }
  const draft: Form7Draft = {
    ...existing,
    step3,
    step4: existing.step4 ?? emptyStep4(),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
  };
  saveForm7Draft(draft);
  return draft;
}

export function upsertForm7Step4(
  step4: Form7Step4Data,
  savedAs: Form7Draft['savedAs'],
  lastCompletedStep: 1 | 2 | 3 | 4 = 4,
  confirmationNumber?: string,
): Form7Draft | null {
  const existing = readForm7Draft();
  if (!existing?.step1.cooperativeName || !existing.step2.amendmentType) {
    return null;
  }
  const draft: Form7Draft = {
    ...existing,
    step4,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
    confirmationNumber: confirmationNumber ?? existing.confirmationNumber,
  };
  saveForm7Draft(draft);
  return draft;
}

export function createForm7ConfirmationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `F7-${stamp}-${rand}`;
}

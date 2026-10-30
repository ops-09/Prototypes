import type { UploadedFileMeta } from '../form1/FileUpload';

const STORAGE_KEY = 'ops-rbac-form7-draft';

/** Configurable maximum supporting-document size (prototype default 20 MB). */
export const MAX_SUPPORTING_DOC_BYTES = 20 * 1024 * 1024;

/** Maximum NUANS reports a filer can attach for a proposed name. */
export const MAX_NUANS_REPORTS = 5;

export type AmendmentType =
  | 'change-name'
  | 'convert-business-corp'
  | 'convert-not-for-profit'
  | 'reduction-capital'
  | 'amend-other';

/** Used on Form 7 NFP conversion when the corporation does not take a number name. */
export type Form7NameLanguage = 'english' | 'french' | 'combined' | 'separate' | '';

export type Form7Step1Data = {
  cooperativeName: string;
  ocn: string;
  primaryActivity: string;
  returnAddress: string;
  email: string;
  cooperativeType: string;
  incorporationDate: string;
};

export type NuansReportEntry = {
  id: string;
  file: UploadedFileMeta | null;
  date: string;
};

export type NameNuansFields = {
  proposedName: string;
  nuansReports: NuansReportEntry[];
};

export function createEmptyNuansReport(): NuansReportEntry {
  return {
    id: crypto.randomUUID(),
    file: null,
    date: '',
  };
}

export function emptyNameNuans(): NameNuansFields {
  return {
    proposedName: '',
    nuansReports: [createEmptyNuansReport()],
  };
}

type LegacyNameNuansFields = {
  languageOption?: string;
  proposedName?: string;
  proposedNameEn?: string;
  proposedNameFr?: string;
  nuansFile?: UploadedFileMeta | null;
  nuansFileEn?: UploadedFileMeta | null;
  nuansFileFr?: UploadedFileMeta | null;
  nuansDate?: string;
  nuansDateEn?: string;
  nuansDateFr?: string;
  nuansReports?: NuansReportEntry[];
};

/** Normalize current or legacy draft shapes into proposed name + NUANS report list. */
export function normalizeNameNuans(raw: unknown): NameNuansFields {
  if (!raw || typeof raw !== 'object') {
    return emptyNameNuans();
  }

  const value = raw as LegacyNameNuansFields;

  if (Array.isArray(value.nuansReports) && value.nuansReports.length > 0) {
    return {
      proposedName: value.proposedName ?? '',
      nuansReports: value.nuansReports.map((report) => ({
        id: report.id || crypto.randomUUID(),
        file: report.file ?? null,
        date: report.date ?? '',
      })),
    };
  }

  const reports: NuansReportEntry[] = [];
  const separate =
    value.languageOption === 'separate' ||
    value.languageOption === 'english-french';

  if (separate) {
    reports.push({
      id: crypto.randomUUID(),
      file: value.nuansFileEn ?? null,
      date: value.nuansDateEn ?? '',
    });
    reports.push({
      id: crypto.randomUUID(),
      file: value.nuansFileFr ?? null,
      date: value.nuansDateFr ?? '',
    });
  } else if (value.nuansFile || value.nuansDate) {
    reports.push({
      id: crypto.randomUUID(),
      file: value.nuansFile ?? null,
      date: value.nuansDate ?? '',
    });
  }

  return {
    proposedName:
      value.proposedName?.trim() ||
      value.proposedNameEn?.trim() ||
      value.proposedNameFr?.trim() ||
      '',
    nuansReports: reports.length > 0 ? reports : [createEmptyNuansReport()],
  };
}

export type Form7Step2Data = {
  amendmentType: AmendmentType | '';
  /** Articles of Amendment: Change vs keep current co-operative name. */
  changeCooperativeName: 'change' | 'no' | '';
  nameNuans: NameNuansFields;
  hasNumberName: 'yes' | 'no' | '';
  legalElement: string;
  /** NFP conversion, not a number name: English / French / combined / separate. */
  nameLanguage: Form7NameLanguage;
  proposedNameFr: string;
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
  lastCompletedStep: 1 | 2 | 3 | 4 | 5;
  confirmationNumber?: string;
};

/** Prefer `emptyNameNuans()` when resetting so each report gets a fresh id. */
export const EMPTY_NAME_NUANS: NameNuansFields = {
  proposedName: '',
  nuansReports: [],
};

export const EMPTY_STEP2: Form7Step2Data = {
  amendmentType: '',
  changeCooperativeName: '',
  nameNuans: emptyNameNuans(),
  hasNumberName: '',
  legalElement: '',
  nameLanguage: '',
  proposedNameFr: '',
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
      step2: {
        ...EMPTY_STEP2,
        ...(parsed.step2 ?? {}),
        nameNuans: normalizeNameNuans(parsed.step2?.nameNuans),
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
    step2: existing?.step2 ?? { ...EMPTY_STEP2, nameNuans: emptyNameNuans() },
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
  lastCompletedStep: Form7Draft['lastCompletedStep'] = 2,
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
  lastCompletedStep: Form7Draft['lastCompletedStep'] = 3,
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
  lastCompletedStep: Form7Draft['lastCompletedStep'] = 4,
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

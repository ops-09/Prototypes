import type { UploadedFileMeta } from '../form1/FileUpload';

const STORAGE_KEY = 'ops-rbac.form10.draft';

/** Configurable maximum supporting-document size (prototype default 20 MB). */
export const MAX_SUPPORTING_DOC_BYTES = 20 * 1024 * 1024;

export type Form10Step1Data = {
  cooperativeName: string;
  ocn: string;
  primaryActivity: string;
  email: string;
  cooperativeType: string;
  incorporationDate: string;
};

export type AmalgamatingCooperative = {
  id: string;
  legalName: string;
  ocn: string;
  /** Date of members’ approval for this amalgamating co-operative (ISO date). */
  membersApprovalDate: string;
};

export type Form10Step2Data = {
  amalgamatingCooperatives: AmalgamatingCooperative[];
  /** Confirmed amalgamation agreement duly approved under CCA s.156. */
  agreementApproved: boolean;
};

export type SupportingDocMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type AmalgamatingCoopDocuments = {
  cooperativeId: string;
  certifiedAgreement: SupportingDocMeta[];
  affidavits: SupportingDocMeta[];
};

export type Form10Step3Data = {
  documentsByCooperative: AmalgamatingCoopDocuments[];
};

export type Form10Step4Data = {
  authorizationConfirmed: boolean;
  /** Signed review PDF uploaded after generate → sign → upload. */
  signedPdf: UploadedFileMeta | null;
};

export type Form10Draft = {
  step1: Form10Step1Data;
  step2: Form10Step2Data;
  step3: Form10Step3Data;
  step4: Form10Step4Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: 0 | 1 | 2 | 3 | 4;
  confirmationNumber?: string;
};

/** Sample OBR registry values for this Articles of Amalgamation prototype. */
export const OBR_COOPERATIVE_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_INCORPORATION_DATE = '2008-06-15';
export const OBR_OCN = '100003456';
export const OBR_PRIMARY_ACTIVITY = '624410';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';
export const OBR_COOPERATIVE_TYPE = 'Worker Co-operative';
/** Prototype authorized filer name for the review authorization statement. */
export const OBR_FILER_FIRST_NAME = 'Alex';
export const OBR_FILER_LAST_NAME = 'Rivera';

export const OBR_STEP1_DEFAULTS: Form10Step1Data = {
  cooperativeName: OBR_COOPERATIVE_NAME,
  ocn: OBR_OCN,
  primaryActivity: '',
  email: OBR_OFFICIAL_EMAIL,
  cooperativeType: OBR_COOPERATIVE_TYPE,
  incorporationDate: OBR_INCORPORATION_DATE,
};

export function createEmptyAmalgamatingCooperative(): AmalgamatingCooperative {
  return {
    id: crypto.randomUUID(),
    legalName: '',
    ocn: '',
    membersApprovalDate: '',
  };
}

/** Prototype seed: two amalgamating co-operatives for deep-link / demo. */
export function createSeedAmalgamatingCooperatives(): AmalgamatingCooperative[] {
  return [
    {
      id: crypto.randomUUID(),
      legalName: OBR_COOPERATIVE_NAME,
      ocn: OBR_OCN,
      membersApprovalDate: '2026-09-01',
    },
    {
      id: crypto.randomUUID(),
      legalName: 'NORTHERN SUPPLY CO-OPERATIVE INC.',
      ocn: '100009876',
      membersApprovalDate: '2026-09-01',
    },
  ];
}

export const EMPTY_STEP2: Form10Step2Data = {
  amalgamatingCooperatives: [
    createEmptyAmalgamatingCooperative(),
    createEmptyAmalgamatingCooperative(),
  ],
  agreementApproved: false,
};

export const EMPTY_STEP3: Form10Step3Data = {
  documentsByCooperative: [],
};

export const EMPTY_STEP4: Form10Step4Data = {
  authorizationConfirmed: false,
  signedPdf: null,
};

export function emptyDocsForCooperatives(
  cooperatives: AmalgamatingCooperative[],
  existing?: AmalgamatingCoopDocuments[],
): AmalgamatingCoopDocuments[] {
  return cooperatives.map((coop) => {
    const prior = existing?.find((row) => row.cooperativeId === coop.id);
    return {
      cooperativeId: coop.id,
      certifiedAgreement: prior?.certifiedAgreement ?? [],
      affidavits: prior?.affidavits ?? [],
    };
  });
}

function normalizeAmalgamatingCooperative(
  raw: Partial<AmalgamatingCooperative> | undefined,
): AmalgamatingCooperative {
  return {
    id: raw?.id || crypto.randomUUID(),
    legalName: raw?.legalName ?? '',
    ocn: raw?.ocn ?? '',
    membersApprovalDate: raw?.membersApprovalDate ?? '',
  };
}

export function saveForm10Draft(draft: Form10Draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function normalizeLastCompletedStep(value: unknown): Form10Draft['lastCompletedStep'] {
  if (value === 1 || value === 2 || value === 3 || value === 4) {
    return value;
  }
  return 0;
}

export function readForm10Draft(): Form10Draft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Form10Draft>;
    const step2: Form10Step2Data = {
      ...EMPTY_STEP2,
      ...(parsed.step2 ?? {}),
      amalgamatingCooperatives: parsed.step2?.amalgamatingCooperatives?.length
        ? parsed.step2.amalgamatingCooperatives.map(normalizeAmalgamatingCooperative)
        : EMPTY_STEP2.amalgamatingCooperatives.map(normalizeAmalgamatingCooperative),
    };
    const step3Existing = parsed.step3;
    return {
      step1: {
        ...OBR_STEP1_DEFAULTS,
        ...(parsed.step1 ?? {}),
        primaryActivity:
          parsed.step1?.primaryActivity?.trim() === OBR_PRIMARY_ACTIVITY
            ? ''
            : (parsed.step1?.primaryActivity ?? ''),
      },
      step2,
      step3: {
        documentsByCooperative: emptyDocsForCooperatives(
          step2.amalgamatingCooperatives,
          step3Existing?.documentsByCooperative,
        ),
      },
      step4: {
        ...EMPTY_STEP4,
        ...(parsed.step4 ?? {}),
        signedPdf: parsed.step4?.signedPdf ?? null,
      },
      savedAs: parsed.savedAs ?? 'draft',
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      lastCompletedStep: normalizeLastCompletedStep(parsed.lastCompletedStep),
      confirmationNumber: parsed.confirmationNumber,
    };
  } catch {
    return null;
  }
}

export function clearForm10Draft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function upsertForm10Step1(
  step1: Form10Step1Data,
  savedAs: Form10Draft['savedAs'],
): Form10Draft {
  const existing = readForm10Draft();
  const draft: Form10Draft = {
    step1,
    step2: existing?.step2 ?? {
      ...EMPTY_STEP2,
      amalgamatingCooperatives: [
        createEmptyAmalgamatingCooperative(),
        createEmptyAmalgamatingCooperative(),
      ],
    },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: 1,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm10Draft(draft);
  return draft;
}

export function upsertForm10Step2(
  step2: Form10Step2Data,
  savedAs: Form10Draft['savedAs'],
  lastCompletedStep: Form10Draft['lastCompletedStep'] = 2,
): Form10Draft | null {
  const existing = readForm10Draft();
  if (!existing?.step1.cooperativeName) {
    return null;
  }
  const draft: Form10Draft = {
    ...existing,
    step2,
    step3: {
      documentsByCooperative: emptyDocsForCooperatives(
        step2.amalgamatingCooperatives,
        existing.step3?.documentsByCooperative,
      ),
    },
    step4: existing.step4 ?? { ...EMPTY_STEP4 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
  };
  saveForm10Draft(draft);
  return draft;
}

export function upsertForm10Step3(
  step3: Form10Step3Data,
  savedAs: Form10Draft['savedAs'],
  lastCompletedStep: Form10Draft['lastCompletedStep'] = 3,
): Form10Draft | null {
  const existing = readForm10Draft();
  if (!existing?.step1.cooperativeName || !existing.step2.amalgamatingCooperatives.length) {
    return null;
  }
  const draft: Form10Draft = {
    ...existing,
    step3: {
      documentsByCooperative: emptyDocsForCooperatives(
        existing.step2.amalgamatingCooperatives,
        step3.documentsByCooperative,
      ),
    },
    step4: existing.step4 ?? { ...EMPTY_STEP4 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
  };
  saveForm10Draft(draft);
  return draft;
}

export function upsertForm10Step4(
  step4: Form10Step4Data,
  savedAs: Form10Draft['savedAs'],
  lastCompletedStep: Form10Draft['lastCompletedStep'] = 4,
  confirmationNumber?: string,
): Form10Draft | null {
  const existing = readForm10Draft();
  if (
    !existing?.step1.cooperativeName ||
    !existing.step2.amalgamatingCooperatives.length
  ) {
    return null;
  }
  const draft: Form10Draft = {
    ...existing,
    step4,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep,
    confirmationNumber: confirmationNumber ?? existing.confirmationNumber,
  };
  saveForm10Draft(draft);
  return draft;
}

export function createForm10ConfirmationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `F10-${stamp}-${rand}`;
}

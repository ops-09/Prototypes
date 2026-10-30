import type { UploadedFileMeta } from '../form1/FileUpload';
import {
  formatHeadOfficeAddressLine,
  validateHeadOfficeAddress,
  type HeadOfficeAddress,
} from '../shared/OntarioHeadOfficeAddressFields';
import {
  EMPTY_DIRECTOR_ADDRESS,
  EMPTY_STEP3 as EMPTY_HEAD_OFFICE_STEP,
  type DirectorAddressType,
  type DirectorCountMode,
  type DirectorResidentialAddress,
  type YesNoAnswer,
} from '../form1/form1DraftStorage';
import {
  emptyNameNuans,
  normalizeNameNuans,
  type NameNuansFields,
  type SupportingDocMeta,
} from '../form7/form7DraftStorage';
import { SIGNED_IN_INDIVIDUAL } from '../../mock/signedInIndividual';

const STORAGE_KEY = 'ops-rbac.form11.draft';

export const FORM11_TOTAL_STEPS = 9;
export const MIN_AMALGAMATING_NFPS = 2;
export const MIN_DIRECTORS = 3;

export type Form11Step2Data = {
  primaryActivity: string;
  email: string;
};

export type AmalgamatingNfp = {
  id: string;
  legalName: string;
  ocn: string;
  membersApprovalDate: string;
  addedFromAccount: boolean;
};

export type Form11Step3Data = {
  corporations: AmalgamatingNfp[];
  agreementApproved: boolean;
};

export type Form11NameChangeChoice = '' | 'yes' | 'no';

export type Form11Step4Data = {
  changeName: Form11NameChangeChoice;
  nameNuans: NameNuansFields;
  selectedAmalgamatedCorporationId: string;
};

export type Form11Step5Data = HeadOfficeAddress;

export type Form11Director = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  alsoIncorporator: YesNoAnswer | '';
  address: DirectorResidentialAddress;
  consentConfirmed: boolean;
  consentFile: UploadedFileMeta | null;
  addedFromAccount: boolean;
};

export type Form11Step6Data = {
  countMode: DirectorCountMode | '';
  fixedNumber: string;
  minimumNumber: string;
  maximumNumber: string;
  directors: Form11Director[];
};

export type Form11Step7Data = {
  amalgamationAgreement: UploadedFileMeta | null;
  additionalDocuments: SupportingDocMeta[];
};

export type Form11Step8Data = {
  authorizationConfirmed: boolean;
  signedPdf: SupportingDocMeta | null;
};

export type Form11Draft = {
  step2: Form11Step2Data;
  step3: Form11Step3Data;
  step4: Form11Step4Data;
  step5: Form11Step5Data;
  step6: Form11Step6Data;
  step7: Form11Step7Data;
  step8: Form11Step8Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  confirmationNumber?: string;
};

export const OBR_CORPORATION_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_OCN = '100003456';
export const OBR_PRIMARY_ACTIVITY = '624410 - Child day-care services';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';

export const OBR_STEP2_DEFAULTS: Form11Step2Data = {
  primaryActivity: OBR_PRIMARY_ACTIVITY,
  email: OBR_OFFICIAL_EMAIL,
};

export const EMPTY_STEP3: Form11Step3Data = {
  corporations: [],
  agreementApproved: false,
};

export const EMPTY_STEP4: Form11Step4Data = {
  changeName: '',
  nameNuans: emptyNameNuans(),
  selectedAmalgamatedCorporationId: '',
};

export const EMPTY_STEP5: Form11Step5Data = { ...EMPTY_HEAD_OFFICE_STEP };

/** Sample head office used when a later step is opened directly from the playground. */
export const SAMPLE_HEAD_OFFICE: Form11Step5Data = {
  ...EMPTY_HEAD_OFFICE_STEP,
  selectedAddressId: 'm5h-1',
  streetNumber: '100',
  streetName: 'Queen',
  streetType: 'St',
  streetDirection: 'W',
  cityTown: 'Toronto',
  municipalityStatus: 'City',
  municipalityName: 'Toronto',
  countyStatus: 'Regional Municipality',
  countyName: 'Toronto',
  postalCode: 'M5H 2N2',
};

export const EMPTY_STEP6: Form11Step6Data = {
  countMode: '',
  fixedNumber: '',
  minimumNumber: '',
  maximumNumber: '',
  directors: [],
};

export const EMPTY_STEP7: Form11Step7Data = {
  amalgamationAgreement: null,
  additionalDocuments: [],
};

export const EMPTY_STEP8: Form11Step8Data = {
  authorizationConfirmed: false,
  signedPdf: null,
};

export const AGREEMENT_EMPTY_ERROR = 'Upload a copy of the amalgamation agreement.';

export const SAMPLE_AMALGAMATION_AGREEMENT: UploadedFileMeta = {
  name: 'amalgamation-agreement.pdf',
  size: 124_000,
  type: 'application/pdf',
};

function normalizeAgreementFile(value: unknown): UploadedFileMeta | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const file = value as Partial<UploadedFileMeta>;
  if (!file.name?.trim()) {
    return null;
  }
  return {
    name: file.name,
    size: typeof file.size === 'number' ? file.size : 0,
    type: file.type || 'application/pdf',
  };
}

export function hasForm11DirectorsComplete(step6: Form11Step6Data | undefined) {
  if (!step6) {
    return false;
  }
  const added = step6.directors.length;
  if (step6.countMode === 'fixed') {
    const fixed = Number.parseInt(step6.fixedNumber, 10);
    return Number.isFinite(fixed) && fixed >= MIN_DIRECTORS && added === fixed;
  }
  if (step6.countMode === 'minMax') {
    const min = Number.parseInt(step6.minimumNumber, 10);
    const max = Number.parseInt(step6.maximumNumber, 10);
    return (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      min >= MIN_DIRECTORS &&
      min <= max &&
      added >= min &&
      added <= max
    );
  }
  return false;
}

export function createSeedDirector(index: number): Form11Director {
  const people = [
    { firstName: 'Alex', middleName: 'Jordan', lastName: 'Rivera' },
    { firstName: 'Sam', middleName: '', lastName: 'Chen' },
    { firstName: 'Priya', middleName: '', lastName: 'Nair' },
  ];
  const person = people[index] ?? people[0];
  return {
    ...createEmptyDirector(),
    ...person,
    email: `${person.firstName.toLowerCase()}@example.com`,
    alsoIncorporator: 'yes',
    address: {
      ...EMPTY_DIRECTOR_ADDRESS,
      addressType: 'canadian',
      enterManually: true,
      selectedAddressId: `seed-director-${index}`,
      streetNumber: '100',
      streetName: 'Queen',
      streetType: 'St',
      streetDirection: 'W',
      cityTown: 'Toronto',
      provinceState: 'Ontario',
      postalCode: 'M5H 2N2',
      country: 'Canada',
    },
  };
}

export function hasForm11HeadOffice(step5: Form11Step5Data | undefined) {
  return step5 ? Object.keys(validateHeadOfficeAddress(step5)).length === 0 : false;
}

function newDirectorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `director-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** New Form 11 directors start on a Canadian address for service; US and international remain available. */
const EMPTY_FORM11_DIRECTOR_ADDRESS: DirectorResidentialAddress = {
  ...EMPTY_DIRECTOR_ADDRESS,
  addressType: 'canadian',
  country: 'Canada',
};

function normalizeAddressType(value: unknown): DirectorAddressType {
  if (value === 'canadian' || value === 'us' || value === 'international') {
    return value;
  }
  return 'canadian';
}

export function createEmptyDirector(id = newDirectorId()): Form11Director {
  return {
    id,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    alsoIncorporator: '',
    address: { ...EMPTY_FORM11_DIRECTOR_ADDRESS },
    consentConfirmed: false,
    consentFile: null,
    addedFromAccount: false,
  };
}

export function createAccountDirector(id = newDirectorId()): Form11Director {
  return {
    ...createEmptyDirector(id),
    firstName: SIGNED_IN_INDIVIDUAL.firstName,
    middleName: SIGNED_IN_INDIVIDUAL.middleName,
    lastName: SIGNED_IN_INDIVIDUAL.lastName,
    email: SIGNED_IN_INDIVIDUAL.email,
    addedFromAccount: true,
  };
}

export function getDirectorLimit(step6: Form11Step6Data): number | null {
  if (step6.countMode === 'fixed') {
    const fixed = Number.parseInt(step6.fixedNumber, 10);
    return Number.isFinite(fixed) && fixed > 0 ? fixed : null;
  }
  if (step6.countMode === 'minMax') {
    const max = Number.parseInt(step6.maximumNumber, 10);
    return Number.isFinite(max) && max > 0 ? max : null;
  }
  return null;
}

export function getDirectorMinimum(step6: Form11Step6Data): number | null {
  if (step6.countMode === 'fixed') {
    return getDirectorLimit(step6);
  }
  if (step6.countMode === 'minMax') {
    const min = Number.parseInt(step6.minimumNumber, 10);
    return Number.isFinite(min) && min > 0 ? min : null;
  }
  return null;
}

function normalizeDirector(entry: Partial<Form11Director> | undefined): Form11Director {
  const addressType = normalizeAddressType(entry?.address?.addressType);
  return {
    ...createEmptyDirector(entry?.id),
    ...(entry ?? {}),
    address: {
      ...EMPTY_FORM11_DIRECTOR_ADDRESS,
      ...(entry?.address ?? {}),
      addressType,
      country:
        addressType === 'canadian'
          ? entry?.address?.country || 'Canada'
          : addressType === 'us'
            ? 'United States'
            : entry?.address?.country || '',
    },
    consentConfirmed: Boolean(entry?.consentConfirmed),
    consentFile: entry?.consentFile ?? null,
    addedFromAccount: Boolean(entry?.addedFromAccount),
  };
}

export const HEAD_OFFICE_INFO =
  'The head office of the corporation must be located in Ontario. The address must be set out in full. A post office box alone is not an acceptable address.';

export function form11HeadOfficeLine(step5: Form11Step5Data) {
  return formatHeadOfficeAddressLine(step5);
}

function normalizeNameChangeChoice(value: unknown): Form11NameChangeChoice {
  return value === 'yes' || value === 'no' ? value : '';
}

export function form11AmalgamatedName(draft: Form11Draft) {
  if (draft.step4.changeName === 'yes') {
    return draft.step4.nameNuans.proposedName.trim();
  }
  if (draft.step4.changeName === 'no') {
    return (
      draft.step3.corporations.find(
        (entry) => entry.id === draft.step4.selectedAmalgamatedCorporationId,
      )?.legalName.trim() ?? ''
    );
  }
  return '';
}

export function createEmptyAmalgamatingNfp(): AmalgamatingNfp {
  return {
    id: crypto.randomUUID(),
    legalName: '',
    ocn: '',
    membersApprovalDate: '',
    addedFromAccount: false,
  };
}

export function createAccountAmalgamatingNfp(): AmalgamatingNfp {
  return {
    ...createEmptyAmalgamatingNfp(),
    legalName: OBR_CORPORATION_NAME,
    ocn: OBR_OCN,
    membersApprovalDate: '2026-03-01',
    addedFromAccount: true,
  };
}

export function isValidOcnFormat(value: string) {
  return /^\d{6,12}$/.test(value.replace(/\s/g, ''));
}

export function normalizeOcn(value: string) {
  return value.replace(/\s/g, '');
}

export function saveForm11Draft(draft: Form11Draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function normalizeAmalgamatingNfp(entry: Partial<AmalgamatingNfp> | undefined): AmalgamatingNfp {
  return {
    id: entry?.id || crypto.randomUUID(),
    legalName: entry?.legalName ?? '',
    ocn: entry?.ocn ?? '',
    membersApprovalDate: entry?.membersApprovalDate ?? '',
    addedFromAccount: Boolean(entry?.addedFromAccount),
  };
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
      step3: {
        ...EMPTY_STEP3,
        ...(parsed.step3 ?? {}),
        corporations: (parsed.step3?.corporations ?? []).map(normalizeAmalgamatingNfp),
        agreementApproved: Boolean(parsed.step3?.agreementApproved),
      },
      step4: {
        ...EMPTY_STEP4,
        ...(parsed.step4 ?? {}),
        changeName: normalizeNameChangeChoice(parsed.step4?.changeName),
        nameNuans: normalizeNameNuans(parsed.step4?.nameNuans),
        selectedAmalgamatedCorporationId:
          parsed.step4?.selectedAmalgamatedCorporationId ?? '',
      },
      step5: {
        ...EMPTY_STEP5,
        ...(parsed.step5 ?? {}),
        province: 'Ontario',
      },
      step6: {
        ...EMPTY_STEP6,
        ...(parsed.step6 ?? {}),
        directors: (parsed.step6?.directors ?? []).map(normalizeDirector),
      },
      step7: {
        ...EMPTY_STEP7,
        ...(parsed.step7 ?? {}),
        amalgamationAgreement: normalizeAgreementFile(parsed.step7?.amalgamationAgreement),
        additionalDocuments: parsed.step7?.additionalDocuments ?? [],
      },
      step8: {
        ...EMPTY_STEP8,
        ...(parsed.step8 ?? {}),
        authorizationConfirmed: Boolean(parsed.step8?.authorizationConfirmed),
        signedPdf: parsed.step8?.signedPdf ?? null,
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
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
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

export function upsertForm11Step3(
  step3: Form11Step3Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3,
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 3;
  }
  saveForm11Draft(draft);
  return draft;
}

export function upsertForm11Step4(
  step4: Form11Step4Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4,
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 4;
  }
  saveForm11Draft(draft);
  return draft;
}

export function upsertForm11Step5(
  step5: Form11Step5Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5,
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 5;
  }
  saveForm11Draft(draft);
  return draft;
}

export function upsertForm11Step6(
  step6: Form11Step6Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6,
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 6;
  }
  saveForm11Draft(draft);
  return draft;
}

export function upsertForm11Step7(
  step7: Form11Step7Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7,
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 7;
  }
  saveForm11Draft(draft);
  return draft;
}

export function upsertForm11Step8(
  step8: Form11Step8Data,
  savedAs: Form11Draft['savedAs'],
  lastCompletedStep?: Form11Draft['lastCompletedStep'],
  confirmationNumber?: string,
): Form11Draft {
  const existing = readForm11Draft();
  const draft: Form11Draft = {
    step2: existing?.step2 ?? { ...OBR_STEP2_DEFAULTS },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4, nameNuans: emptyNameNuans() },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep: existing?.lastCompletedStep ?? 0,
    confirmationNumber: confirmationNumber ?? existing?.confirmationNumber,
  };
  if (lastCompletedStep !== undefined) {
    draft.lastCompletedStep = lastCompletedStep;
  } else if (savedAs === 'submitted') {
    draft.lastCompletedStep = 9;
  } else if (savedAs === 'continue') {
    draft.lastCompletedStep = 8;
  }
  saveForm11Draft(draft);
  return draft;
}

export function createForm11ConfirmationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `F11-${stamp}-${rand}`;
}

export function hasForm11Agreement(step7: Form11Step7Data | undefined) {
  return Boolean(step7?.amalgamationAgreement?.name.trim());
}

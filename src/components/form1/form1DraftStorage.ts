import type { NameLanguageOption } from './nameValidation';
import type { UploadedFileMeta } from './FileUpload';

export const FORM1_DRAFT_STORAGE_KEY = 'ops-rbac.form1.draft';
/** @deprecated legacy key — migrated on read */
const LEGACY_STEP1_STORAGE_KEY = 'ops-rbac.form1.step1.draft';

export type Form1Step1Data = {
  languageOption: NameLanguageOption | '';
  cooperativeName: string;
  englishName: string;
  frenchName: string;
  nuansDate: string;
  nuansDateEn: string;
  nuansDateFr: string;
  nuansFile: UploadedFileMeta | null;
  nuansFileEn: UploadedFileMeta | null;
  nuansFileFr: UploadedFileMeta | null;
};

export type Form1Step2Data = {
  cooperativeSubtype: string;
  primaryActivity: string;
  email: string;
  confirmEmail: string;
};

export type Form1Step3Data = {
  postalCodeLookup: string;
  enterManually: boolean;
  selectedAddressId: string;
  roomNumber: string;
  streetNumber: string;
  streetName: string;
  streetNumberSuffix: string;
  streetType: string;
  streetDirection: string;
  cityTown: string;
  province: string;
  postalCode: string;
  country: string;
  municipalityStatus: string;
  municipalityName: string;
  countyStatus: string;
  countyName: string;
};

export type DirectorCountMode = 'fixed' | 'minMax';
export type YesNoAnswer = 'yes' | 'no';
export type DirectorAddressType = 'canadian' | 'us' | 'international';

export type DirectorResidentialAddress = {
  addressType: DirectorAddressType | '';
  postalCodeLookup: string;
  enterManually: boolean;
  selectedAddressId: string;
  unitNumber: string;
  streetNumber: string;
  streetName: string;
  streetNumberSuffix: string;
  streetType: string;
  streetDirection: string;
  addressLine1: string;
  addressLine2: string;
  cityTown: string;
  provinceState: string;
  postalCode: string;
  country: string;
};

export type Form1Director = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  residentCanadian: YesNoAnswer | '';
  alsoIncorporator: YesNoAnswer | '';
  address: DirectorResidentialAddress;
  consentConfirmed: boolean;
  consentFile: UploadedFileMeta | null;
};

export type Form1Step4Data = {
  countMode: DirectorCountMode | '';
  fixedNumber: string;
  minimumNumber: string;
  maximumNumber: string;
  multiStakeholder: YesNoAnswer | '';
  stakeholderDirectorsText: string;
  directors: Form1Director[];
};

export type Form1Draft = {
  step1: Form1Step1Data;
  step2: Form1Step2Data;
  step3: Form1Step3Data;
  step4: Form1Step4Data;
  savedAt: string;
  mode: 'continue' | 'draft';
  lastCompletedStep: 0 | 1 | 2 | 3 | 4;
};

export const EMPTY_STEP1: Form1Step1Data = {
  languageOption: '',
  cooperativeName: '',
  englishName: '',
  frenchName: '',
  nuansDate: '',
  nuansDateEn: '',
  nuansDateFr: '',
  nuansFile: null,
  nuansFileEn: null,
  nuansFileFr: null,
};

export const EMPTY_STEP2: Form1Step2Data = {
  cooperativeSubtype: '',
  primaryActivity: '',
  email: '',
  confirmEmail: '',
};

export const EMPTY_STEP3: Form1Step3Data = {
  postalCodeLookup: '',
  enterManually: false,
  selectedAddressId: '',
  roomNumber: '',
  streetNumber: '',
  streetName: '',
  streetNumberSuffix: '',
  streetType: '',
  streetDirection: '',
  cityTown: '',
  province: 'Ontario',
  postalCode: '',
  country: 'Canada',
  municipalityStatus: '',
  municipalityName: '',
  countyStatus: '',
  countyName: '',
};

export const EMPTY_DIRECTOR_ADDRESS: DirectorResidentialAddress = {
  addressType: '',
  postalCodeLookup: '',
  enterManually: false,
  selectedAddressId: '',
  unitNumber: '',
  streetNumber: '',
  streetName: '',
  streetNumberSuffix: '',
  streetType: '',
  streetDirection: '',
  addressLine1: '',
  addressLine2: '',
  cityTown: '',
  provinceState: '',
  postalCode: '',
  country: '',
};

function newDirectorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `director-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyDirector(id = newDirectorId()): Form1Director {
  return {
    id,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    residentCanadian: '',
    alsoIncorporator: '',
    address: { ...EMPTY_DIRECTOR_ADDRESS },
    consentConfirmed: false,
    consentFile: null,
  };
}

export const EMPTY_STEP4: Form1Step4Data = {
  countMode: '',
  fixedNumber: '',
  minimumNumber: '',
  maximumNumber: '',
  multiStakeholder: '',
  stakeholderDirectorsText: '',
  directors: [],
};

export const CANADIAN_PROVINCE_OPTIONS = [
  { value: 'Alberta', label: 'Alberta' },
  { value: 'British Columbia', label: 'British Columbia' },
  { value: 'Manitoba', label: 'Manitoba' },
  { value: 'New Brunswick', label: 'New Brunswick' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
  { value: 'Northwest Territories', label: 'Northwest Territories' },
  { value: 'Nova Scotia', label: 'Nova Scotia' },
  { value: 'Nunavut', label: 'Nunavut' },
  { value: 'Ontario', label: 'Ontario' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island' },
  { value: 'Quebec', label: 'Quebec' },
  { value: 'Saskatchewan', label: 'Saskatchewan' },
  { value: 'Yukon', label: 'Yukon' },
];

/** Consent to Act as a First Director (Form 3) — Central Forms Repository. */
export const DIRECTOR_CONSENT_FORM_URL =
  'https://www.forms.ssb.gov.on.ca/mbs/ssb/forms/ssbforms.nsf/FormDetail?OpenForm&ACT=RDR&TAB=PROFILE&ENV=WWE&NO=007-07240';

/** Story order for co-operative sub-type dropdown. */
export const FORM1_COOPERATIVE_SUBTYPES = [
  'Child-Care Co-operative',
  'Consumer Co-operative',
  'Farming and Supply Co-operative',
  'Financing Co-operative',
  'Housing Co-operative',
  'Housing Development Co-operative',
  'Marketing Co-operative',
  'Milk Transport Co-operative',
  'Other',
  'Renewable Energy Co-operative',
  'Service Co-operative',
  'Wholesale Supply Co-operative',
  'Worker Co-operative',
] as const;

export const FORM1_COOPERATIVE_SUBTYPE_OPTIONS = FORM1_COOPERATIVE_SUBTYPES.map(
  (label) => ({ value: label, label }),
);

export const OFFICIAL_EMAIL_INFO =
  'Provide a current email address where the corporation or other entity will receive official documents and notices. All official documents or notices and correspondence to the corporation or other entity will be sent to this email address. The contact person will also receive official documents or notices and correspondence related only to this filing.';

export const HEAD_OFFICE_INFO =
  'The head office of a co-operative must be located in Ontario. The address must be set out in full. A post office box alone is not an acceptable address.';

export const STREET_NUMBER_SUFFIX_OPTIONS = [
  { value: '1/2', label: '1/2' },
  { value: '1/4', label: '1/4' },
  { value: '3/4', label: '3/4' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

export const STREET_TYPE_OPTIONS = [
  { value: 'Ave', label: 'Ave' },
  { value: 'Blvd', label: 'Blvd' },
  { value: 'Cres', label: 'Cres' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Lane', label: 'Lane' },
  { value: 'Pl', label: 'Pl' },
  { value: 'Rd', label: 'Rd' },
  { value: 'St', label: 'St' },
  { value: 'Way', label: 'Way' },
];

export const STREET_DIRECTION_OPTIONS = [
  { value: 'N', label: 'N' },
  { value: 'S', label: 'S' },
  { value: 'E', label: 'E' },
  { value: 'W', label: 'W' },
  { value: 'NE', label: 'NE' },
  { value: 'NW', label: 'NW' },
  { value: 'SE', label: 'SE' },
  { value: 'SW', label: 'SW' },
];

export const MUNICIPALITY_STATUS_OPTIONS = [
  { value: 'City', label: 'City' },
  { value: 'Town', label: 'Town' },
  { value: 'Township', label: 'Township' },
  { value: 'Village', label: 'Village' },
  { value: 'Municipality', label: 'Municipality' },
];

export const COUNTY_STATUS_OPTIONS = [
  { value: 'County', label: 'County' },
  { value: 'District', label: 'District' },
  { value: 'Regional Municipality', label: 'Regional Municipality' },
];

function isLegacyStep1Draft(value: unknown): value is Form1Step1Data & {
  savedAt?: string;
  mode?: 'continue' | 'draft';
} {
  return Boolean(value && typeof value === 'object' && 'languageOption' in value);
}

function normalizeLastCompletedStep(value: unknown): Form1Draft['lastCompletedStep'] {
  if (value === 0 || value === 1 || value === 2 || value === 3 || value === 4) {
    return value;
  }
  return 0;
}

function normalizeStep4(raw: Partial<Form1Step4Data> | undefined): Form1Step4Data {
  const directors = Array.isArray(raw?.directors)
    ? raw.directors.map((director) => ({
        ...createEmptyDirector(director.id || newDirectorId()),
        ...director,
        address: {
          ...EMPTY_DIRECTOR_ADDRESS,
          ...(director.address ?? {}),
        },
      }))
    : [];

  return {
    ...EMPTY_STEP4,
    ...(raw ?? {}),
    directors,
  };
}

export function saveForm1Draft(draft: Form1Draft) {
  sessionStorage.setItem(FORM1_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  sessionStorage.removeItem(LEGACY_STEP1_STORAGE_KEY);
}

export function readForm1Draft(): Form1Draft | null {
  const raw = sessionStorage.getItem(FORM1_DRAFT_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Form1Draft>;
      return {
        step1: { ...EMPTY_STEP1, ...(parsed.step1 ?? {}) },
        step2: { ...EMPTY_STEP2, ...(parsed.step2 ?? {}) },
        step3: { ...EMPTY_STEP3, ...(parsed.step3 ?? {}) },
        step4: normalizeStep4(parsed.step4),
        savedAt: parsed.savedAt ?? new Date().toISOString(),
        mode: parsed.mode ?? 'draft',
        lastCompletedStep: normalizeLastCompletedStep(parsed.lastCompletedStep),
      };
    } catch {
      return null;
    }
  }

  // Migrate older Step-1-only drafts.
  const legacyRaw = sessionStorage.getItem(LEGACY_STEP1_STORAGE_KEY);
  if (!legacyRaw) {
    return null;
  }
  try {
    const legacy = JSON.parse(legacyRaw) as unknown;
    if (!isLegacyStep1Draft(legacy)) {
      return null;
    }
    const { savedAt, mode, ...step1Fields } = legacy;
    const migrated: Form1Draft = {
      step1: { ...EMPTY_STEP1, ...step1Fields },
      step2: { ...EMPTY_STEP2 },
      step3: { ...EMPTY_STEP3 },
      step4: { ...EMPTY_STEP4 },
      savedAt: savedAt ?? new Date().toISOString(),
      mode: mode ?? 'draft',
      lastCompletedStep: mode === 'continue' ? 1 : 0,
    };
    saveForm1Draft(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function clearForm1Draft() {
  sessionStorage.removeItem(FORM1_DRAFT_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_STEP1_STORAGE_KEY);
}

function maxStep(
  a: Form1Draft['lastCompletedStep'],
  b: Form1Draft['lastCompletedStep'],
): Form1Draft['lastCompletedStep'] {
  return Math.max(a, b) as Form1Draft['lastCompletedStep'];
}

export function upsertForm1Step1(
  step1: Form1Step1Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 1,
): Form1Draft {
  const existing = readForm1Draft();
  const draft: Form1Draft = {
    step1,
    step2: existing?.step2 ?? { ...EMPTY_STEP2 },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing?.lastCompletedStep ?? 0, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step2(
  step2: Form1Step2Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 2,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (!existing?.step1.languageOption) {
    return null;
  }
  const draft: Form1Draft = {
    ...existing,
    step2,
    step3: existing.step3 ?? { ...EMPTY_STEP3 },
    step4: existing.step4 ?? { ...EMPTY_STEP4 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step3(
  step3: Form1Step3Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 3,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (!existing?.step1.languageOption || !existing.step2.cooperativeSubtype) {
    return null;
  }
  const draft: Form1Draft = {
    ...existing,
    step3: {
      ...step3,
      province: 'Ontario',
      country: 'Canada',
    },
    step4: existing.step4 ?? { ...EMPTY_STEP4 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step4(
  step4: Form1Step4Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 4,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (
    !existing?.step1.languageOption ||
    !existing.step2.cooperativeSubtype ||
    !existing.step3.streetNumber
  ) {
    return null;
  }

  const normalized: Form1Step4Data = {
    ...step4,
    stakeholderDirectorsText:
      step4.multiStakeholder === 'yes' ? step4.stakeholderDirectorsText : '',
    directors: step4.directors.map((director) => {
      if (director.alsoIncorporator === 'yes') {
        return {
          ...director,
          consentConfirmed: false,
          consentFile: null,
        };
      }
      return director;
    }),
  };

  const draft: Form1Draft = {
    ...existing,
    step4: normalized,
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function getDirectorLimit(step4: Form1Step4Data): number | null {
  if (step4.countMode === 'fixed') {
    const fixed = Number.parseInt(step4.fixedNumber, 10);
    return Number.isFinite(fixed) && fixed > 0 ? fixed : null;
  }
  if (step4.countMode === 'minMax') {
    const max = Number.parseInt(step4.maximumNumber, 10);
    return Number.isFinite(max) && max > 0 ? max : null;
  }
  return null;
}

export function getDirectorMinimum(step4: Form1Step4Data): number | null {
  if (step4.countMode === 'fixed') {
    return getDirectorLimit(step4);
  }
  if (step4.countMode === 'minMax') {
    const min = Number.parseInt(step4.minimumNumber, 10);
    return Number.isFinite(min) && min > 0 ? min : null;
  }
  return null;
}

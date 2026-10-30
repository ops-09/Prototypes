import type { UploadedFileMeta } from './FileUpload';

export const FORM1_DRAFT_STORAGE_KEY = 'ops-rbac.form1.draft';
/** @deprecated legacy key — migrated on read */
const LEGACY_STEP1_STORAGE_KEY = 'ops-rbac.form1.step1.draft';

/** Maximum NUANS reports a filer can attach for a proposed name. */
export const MAX_NUANS_REPORTS = 5;

export type NuansReportEntry = {
  id: string;
  file: UploadedFileMeta | null;
  date: string;
};

export type Form1Step1Data = {
  cooperativeName: string;
  nuansReports: NuansReportEntry[];
};

export function createEmptyNuansReport(): NuansReportEntry {
  return {
    id: crypto.randomUUID(),
    file: null,
    date: '',
  };
}

export function emptyStep1(): Form1Step1Data {
  return {
    cooperativeName: '',
    nuansReports: [createEmptyNuansReport()],
  };
}

/** Prototype seed for deep-linked later steps. */
export function createSeedStep1(): Form1Step1Data {
  return {
    cooperativeName: 'GREEN INSTITUTE CO-OPERATIVE INC.',
    nuansReports: [
      {
        ...createEmptyNuansReport(),
        file: {
          name: 'NUANS-Green-Institute.pdf',
          size: 184320,
          type: 'application/pdf',
        },
        date: '2026-08-15',
      },
    ],
  };
}

export function hasForm1Step1Data(step1: Form1Step1Data | undefined | null) {
  return Boolean(step1?.cooperativeName.trim());
}

type LegacyForm1Step1Data = {
  languageOption?: string;
  cooperativeName?: string;
  englishName?: string;
  frenchName?: string;
  nuansDate?: string;
  nuansDateEn?: string;
  nuansDateFr?: string;
  nuansFile?: UploadedFileMeta | null;
  nuansFileEn?: UploadedFileMeta | null;
  nuansFileFr?: UploadedFileMeta | null;
  nuansReports?: NuansReportEntry[];
};

/** Normalize current or legacy Step 1 shapes into name + NUANS report list. */
export function normalizeStep1(raw: unknown): Form1Step1Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep1();
  }

  const value = raw as LegacyForm1Step1Data;

  if (Array.isArray(value.nuansReports) && value.nuansReports.length > 0) {
    return {
      cooperativeName: value.cooperativeName ?? '',
      nuansReports: value.nuansReports.map((report) => ({
        id: report.id || crypto.randomUUID(),
        file: report.file ?? null,
        date: report.date ?? '',
      })),
    };
  }

  const reports: NuansReportEntry[] = [];
  const separate = value.languageOption === 'separate';

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
    cooperativeName:
      value.cooperativeName?.trim() ||
      value.englishName?.trim() ||
      value.frenchName?.trim() ||
      '',
    nuansReports: reports.length > 0 ? reports : [createEmptyNuansReport()],
  };
}

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
  unitType: string;
  roomNumber: string;
  streetNumber: string;
  streetName: string;
  streetNumberSuffix: string;
  streetType: string;
  streetDirection: string;
  poBox: string;
  station: string;
  ruralRoute: string;
  lotPartBlockSection: string;
  concessionOrPlan: string;
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
  unitType: string;
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
  /** Share details when alsoIncorporator is yes — carried into Step 8. */
  numberOfShares: string;
  classDesignation: string;
  amountToBePaid: string;
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

/** Plain free-text share-structure article fields. */
export type Form1Step5Data = {
  businessPowersRestrictions: string;
  authorizedCapital: string;
  preferenceShareTerms: string;
  shareTransferRestrictions: string;
};

export type IncorporatorType = 'individual' | 'corporation';

export type Form1Incorporator = {
  id: string;
  type: IncorporatorType;
  /** When set, name/address come from the linked first director. */
  linkedDirectorId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  residentCanadian: YesNoAnswer | '';
  address: DirectorResidentialAddress;
  numberOfShares: string;
  classDesignation: string;
  amountToBePaid: string;
  corporationName: string;
  ocn: string;
  signerPosition: string;
};

/** Membership classes, stakeholder groups, and special provisions. */
export type Form1Step6Data = {
  membershipClasses: string;
  membershipClassTerms: string;
  stakeholderGroups: string;
  stakeholderGroupTerms: string;
  specialProvisions: string;
};

export type Form1Step7Data = {
  incorporators: Form1Incorporator[];
};

/** Review and validation (UI step 9) — authorization + signed PDF. */
export type Form1Step8Data = {
  authorizationConfirmed: boolean;
  signedPdf: UploadedFileMeta | null;
};

export type Form1Draft = {
  step1: Form1Step1Data;
  step2: Form1Step2Data;
  step3: Form1Step3Data;
  step4: Form1Step4Data;
  step5: Form1Step5Data;
  step6: Form1Step6Data;
  step7: Form1Step7Data;
  step8: Form1Step8Data;
  savedAt: string;
  mode: 'continue' | 'draft' | 'submitted';
  lastCompletedStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  confirmationNumber?: string;
};

/** Prefer `emptyStep1()` when resetting so each report gets a fresh id. */
export const EMPTY_STEP1: Form1Step1Data = {
  cooperativeName: '',
  nuansReports: [],
};

export const EMPTY_STEP2: Form1Step2Data = {
  cooperativeSubtype: '',
  primaryActivity: '',
  email: '',
  confirmEmail: '',
};

export function formatCooperativeSubtype(step2: Form1Step2Data) {
  return step2.cooperativeSubtype.trim();
}

export function hasForm1Step2Data(step2: Form1Step2Data | undefined | null) {
  return Boolean(step2?.email.trim() && step2?.primaryActivity.trim());
}

export const EMPTY_STEP3: Form1Step3Data = {
  postalCodeLookup: '',
  enterManually: false,
  selectedAddressId: '',
  unitType: '',
  roomNumber: '',
  streetNumber: '',
  streetName: '',
  streetNumberSuffix: '',
  streetType: '',
  streetDirection: '',
  poBox: '',
  station: '',
  ruralRoute: '',
  lotPartBlockSection: '',
  concessionOrPlan: '',
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
  unitType: '',
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
    numberOfShares: '',
    classDesignation: '',
    amountToBePaid: '',
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

export const EMPTY_STEP5: Form1Step5Data = {
  businessPowersRestrictions: '',
  authorizedCapital: '',
  preferenceShareTerms: '',
  shareTransferRestrictions: '',
};

export const EMPTY_STEP6: Form1Step6Data = {
  membershipClasses: '',
  membershipClassTerms: '',
  stakeholderGroups: '',
  stakeholderGroupTerms: '',
  specialProvisions: '',
};

export const EMPTY_STEP7: Form1Step7Data = {
  incorporators: [],
};

export const EMPTY_STEP8: Form1Step8Data = {
  authorizationConfirmed: false,
  signedPdf: null,
};

export const FORM1_RICH_TEXT_MAX_CHARS = 900_000;

export const MEMBERSHIP_NOT_APPLICABLE_HINT =
  'Enter the information required, or enter “Not applicable” if none.';

export const INCORPORATOR_INFO =
  'An incorporator is the person who signs or otherwise authorizes the articles of incorporation.';

function newIncorporatorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `incorporator-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyIncorporator(
  type: IncorporatorType = 'individual',
  id = newIncorporatorId(),
): Form1Incorporator {
  return {
    id,
    type,
    linkedDirectorId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    residentCanadian: '',
    address: { ...EMPTY_DIRECTOR_ADDRESS },
    numberOfShares: '',
    classDesignation: '',
    amountToBePaid: '',
    corporationName: '',
    ocn: '',
    signerPosition: '',
  };
}

/** Prefill an incorporator from a first director (name, address, and shares). */
export function incorporatorFromDirector(
  director: Form1Director,
  id?: string,
): Form1Incorporator {
  return {
    ...createEmptyIncorporator('individual', id),
    linkedDirectorId: director.id,
    firstName: director.firstName,
    middleName: director.middleName,
    lastName: director.lastName,
    residentCanadian: director.residentCanadian,
    address: structuredClone(director.address),
    numberOfShares: director.numberOfShares,
    classDesignation: director.classDesignation,
    amountToBePaid: director.amountToBePaid,
  };
}

/**
 * Keep Step 8 in sync with first directors who are also incorporators.
 * Auto-adds directors with alsoIncorporator = yes (including share fields),
 * refreshes their name/address/shares, and drops links when the director
 * is removed or answers no.
 */
export function syncIncorporatorsFromDirectors(
  directors: Form1Director[],
  incorporators: Form1Incorporator[],
): Form1Incorporator[] {
  const alsoIncorporators = directors.filter(
    (director) => director.alsoIncorporator === 'yes',
  );
  const alsoIds = new Set(alsoIncorporators.map((director) => director.id));

  const existingByDirectorId = new Map<string, Form1Incorporator>();
  for (const entry of incorporators) {
    if (entry.linkedDirectorId && alsoIds.has(entry.linkedDirectorId)) {
      existingByDirectorId.set(entry.linkedDirectorId, entry);
    }
  }

  const linked = alsoIncorporators.map((director) => {
    const existing = existingByDirectorId.get(director.id);
    return {
      ...(existing
        ? { ...existing, type: 'individual' as const }
        : createEmptyIncorporator('individual')),
      linkedDirectorId: director.id,
      firstName: director.firstName,
      middleName: director.middleName,
      lastName: director.lastName,
      residentCanadian: director.residentCanadian,
      address: structuredClone(director.address),
      numberOfShares: director.numberOfShares,
      classDesignation: director.classDesignation,
      amountToBePaid: director.amountToBePaid,
      corporationName: '',
      ocn: '',
      signerPosition: '',
    };
  });

  const nonLinked = incorporators.filter((entry) => !entry.linkedDirectorId);

  return [...linked, ...nonLinked];
}

/** Head office must be in Ontario, Canada. */
export const HEAD_OFFICE_PROVINCE_OPTIONS = [{ value: 'Ontario', label: 'Ontario' }] as const;

export const HEAD_OFFICE_COUNTRY_OPTIONS = [{ value: 'Canada', label: 'Canada' }] as const;

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

/** Unit / suite designator shown beside unit number on Canadian addresses. */
export const UNIT_TYPE_OPTIONS = [
  { value: 'Apt', label: 'Apt' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Unit', label: 'Unit' },
  { value: 'Floor', label: 'Floor' },
  { value: 'Rm', label: 'Rm' },
  { value: 'PH', label: 'PH' },
];

export const STREET_NUMBER_SUFFIX_OPTIONS = [
  { value: '1/2', label: '1/2' },
  { value: '1/4', label: '1/4' },
  { value: '3/4', label: '3/4' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

/** Unit type is required whenever a unit/suite number is present. */
export function unitTypeRequiredError(unitNumber: string, unitType: string) {
  if (unitNumber.trim() && !unitType.trim()) {
    return 'Select a unit type.';
  }
  return undefined;
}

export function formatUnitLabel(unitType: string, unitNumber: string) {
  const number = unitNumber.trim();
  if (!number) {
    return '';
  }
  const type = unitType.trim();
  return type ? `${type} ${number}` : `Unit ${number}`;
}

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

function isLegacyStep1Draft(value: unknown): value is LegacyForm1Step1Data & {
  savedAt?: string;
  mode?: 'continue' | 'draft';
} {
  return Boolean(
    value &&
      typeof value === 'object' &&
      ('languageOption' in value ||
        'cooperativeName' in value ||
        'nuansReports' in value),
  );
}

function normalizeLastCompletedStep(value: unknown): Form1Draft['lastCompletedStep'] {
  if (
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8 ||
    value === 9
  ) {
    return value;
  }
  return 0;
}

function normalizeStep5(raw: Partial<Form1Step5Data> | undefined): Form1Step5Data {
  return {
    ...EMPTY_STEP5,
    ...(raw ?? {}),
  };
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

function normalizeStep6(raw: Partial<Form1Step6Data> | undefined): Form1Step6Data {
  return {
    ...EMPTY_STEP6,
    ...(raw ?? {}),
  };
}

function normalizeStep8(raw: Partial<Form1Step8Data> | undefined): Form1Step8Data {
  return {
    ...EMPTY_STEP8,
    ...(raw ?? {}),
    signedPdf: raw?.signedPdf ?? null,
  };
}

function normalizeStep7(
  raw: Partial<Form1Step7Data> | undefined,
  directors: Form1Director[] = [],
): Form1Step7Data {
  const incorporators = Array.isArray(raw?.incorporators)
    ? raw.incorporators.map((entry) => ({
        ...createEmptyIncorporator(
          entry.type === 'corporation' ? 'corporation' : 'individual',
          entry.id || newIncorporatorId(),
        ),
        ...entry,
        address: {
          ...EMPTY_DIRECTOR_ADDRESS,
          ...(entry.address ?? {}),
        },
      }))
    : [];

  return {
    incorporators: syncIncorporatorsFromDirectors(directors, incorporators),
  };
}

function isLegacyIncorporatorsStep6(
  value: unknown,
): value is { incorporators?: Form1Incorporator[] } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'incorporators' in value &&
      !('membershipClasses' in value),
  );
}

export function saveForm1Draft(draft: Form1Draft) {
  sessionStorage.setItem(FORM1_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  sessionStorage.removeItem(LEGACY_STEP1_STORAGE_KEY);
}

export function readForm1Draft(): Form1Draft | null {
  const raw = sessionStorage.getItem(FORM1_DRAFT_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Form1Draft> & {
        step6?: Partial<Form1Step6Data> & { incorporators?: Form1Incorporator[] };
        step7?: Partial<Form1Step7Data>;
      };
      const step4 = normalizeStep4(parsed.step4);
      const legacyIncorporators = isLegacyIncorporatorsStep6(parsed.step6);
      const step6 = legacyIncorporators
        ? { ...EMPTY_STEP6 }
        : normalizeStep6(parsed.step6);
      const step7 = normalizeStep7(
        legacyIncorporators
          ? { incorporators: parsed.step6?.incorporators }
          : parsed.step7,
        step4.directors,
      );
      let lastCompletedStep = normalizeLastCompletedStep(parsed.lastCompletedStep);
      if (legacyIncorporators && lastCompletedStep === 6) {
        lastCompletedStep = 7;
      }
      return {
        step1: normalizeStep1(parsed.step1),
        step2: { ...EMPTY_STEP2, ...(parsed.step2 ?? {}) },
        step3: { ...EMPTY_STEP3, ...(parsed.step3 ?? {}) },
        step4,
        step5: normalizeStep5(parsed.step5),
        step6,
        step7,
        step8: normalizeStep8(parsed.step8),
        savedAt: parsed.savedAt ?? new Date().toISOString(),
        mode: parsed.mode ?? 'draft',
        lastCompletedStep,
        confirmationNumber: parsed.confirmationNumber,
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
      step1: normalizeStep1(step1Fields),
      step2: { ...EMPTY_STEP2 },
      step3: { ...EMPTY_STEP3 },
      step4: { ...EMPTY_STEP4 },
      step5: { ...EMPTY_STEP5 },
      step6: { ...EMPTY_STEP6 },
      step7: { ...EMPTY_STEP7 },
      step8: { ...EMPTY_STEP8 },
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
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
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
  if (!hasForm1Step1Data(existing?.step1)) {
    return null;
  }
  const draft: Form1Draft = {
    ...existing,
    step2,
    step3: existing.step3 ?? { ...EMPTY_STEP3 },
    step4: existing.step4 ?? { ...EMPTY_STEP4 },
    step5: existing.step5 ?? { ...EMPTY_STEP5 },
    step6: existing.step6 ?? { ...EMPTY_STEP6 },
    step7: existing.step7 ?? { ...EMPTY_STEP7 },
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
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
  if (!hasForm1Step1Data(existing?.step1) || !hasForm1Step2Data(existing.step2)) {
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
    step5: existing.step5 ?? { ...EMPTY_STEP5 },
    step6: existing.step6 ?? { ...EMPTY_STEP6 },
    step7: existing.step7 ?? { ...EMPTY_STEP7 },
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
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
    !hasForm1Step1Data(existing?.step1) ||
    !hasForm1Step2Data(existing.step2)
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
      return {
        ...director,
        numberOfShares: '',
        classDesignation: '',
        amountToBePaid: '',
      };
    }),
  };

  const draft: Form1Draft = {
    ...existing,
    step4: normalized,
    step5: existing.step5 ?? { ...EMPTY_STEP5 },
    step6: existing.step6 ?? { ...EMPTY_STEP6 },
    step7: {
      incorporators: syncIncorporatorsFromDirectors(
        normalized.directors,
        existing.step7?.incorporators ?? [],
      ),
    },
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step5(
  step5: Form1Step5Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 5,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (
    !hasForm1Step1Data(existing?.step1) ||
    !hasForm1Step2Data(existing.step2) ||
    !existing.step3.streetNumber ||
    !existing.step4.directors.length
  ) {
    return null;
  }

  const draft: Form1Draft = {
    ...existing,
    step5: normalizeStep5(step5),
    step6: existing.step6 ?? { ...EMPTY_STEP6 },
    step7: existing.step7 ?? { ...EMPTY_STEP7 },
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step6(
  step6: Form1Step6Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 6,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (
    !hasForm1Step1Data(existing?.step1) ||
    !hasForm1Step2Data(existing.step2) ||
    !existing.step3.streetNumber ||
    !existing.step4.directors.length ||
    !existing.step5.authorizedCapital.trim()
  ) {
    return null;
  }

  const draft: Form1Draft = {
    ...existing,
    step6: normalizeStep6(step6),
    step7: existing.step7 ?? { ...EMPTY_STEP7 },
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step7(
  step7: Form1Step7Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 7,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (
    !hasForm1Step1Data(existing?.step1) ||
    !hasForm1Step2Data(existing.step2)
  ) {
    return null;
  }

  // Keep director share fields aligned when a linked incorporator is edited on Step 8.
  const nextDirectors = existing.step4.directors.map((director) => {
    const linked = step7.incorporators.find(
      (entry) => entry.linkedDirectorId === director.id,
    );
    if (!linked || director.alsoIncorporator !== 'yes') {
      return director;
    }
    return {
      ...director,
      numberOfShares: linked.numberOfShares,
      classDesignation: linked.classDesignation,
      amountToBePaid: linked.amountToBePaid,
    };
  });

  const draft: Form1Draft = {
    ...existing,
    step4: { ...existing.step4, directors: nextDirectors },
    step6: existing.step6 ?? { ...EMPTY_STEP6 },
    step7: normalizeStep7(step7, nextDirectors),
    step8: existing.step8 ?? { ...EMPTY_STEP8 },
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep: maxStep(existing.lastCompletedStep, lastCompletedStep),
  };
  saveForm1Draft(draft);
  return draft;
}

export function upsertForm1Step8(
  step8: Form1Step8Data,
  mode: Form1Draft['mode'],
  lastCompletedStep: Form1Draft['lastCompletedStep'] = 8,
  confirmationNumber?: string,
): Form1Draft | null {
  const existing = readForm1Draft();
  if (
    !hasForm1Step1Data(existing?.step1) ||
    !hasForm1Step2Data(existing.step2) ||
    !existing.step3.streetNumber ||
    !existing.step4.directors.length ||
    !existing.step5.authorizedCapital.trim() ||
    !existing.step7.incorporators.length
  ) {
    return null;
  }

  const draft: Form1Draft = {
    ...existing,
    step8: normalizeStep8(step8),
    savedAt: new Date().toISOString(),
    mode,
    lastCompletedStep:
      mode === 'submitted'
        ? 9
        : maxStep(existing.lastCompletedStep, lastCompletedStep),
    confirmationNumber: confirmationNumber ?? existing.confirmationNumber,
  };
  saveForm1Draft(draft);
  return draft;
}

export function createForm1ConfirmationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `F1-${stamp}-${rand}`;
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

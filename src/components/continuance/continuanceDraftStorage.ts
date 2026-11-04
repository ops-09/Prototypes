import { SIGNED_IN_INDIVIDUAL } from '../../mock/signedInIndividual';
import {
  EMPTY_DIRECTOR_ADDRESS,
  EMPTY_STEP3 as EMPTY_HEAD_OFFICE,
  type DirectorAddressType,
  type DirectorCountMode,
  type DirectorResidentialAddress,
  type Form1Step3Data,
  type YesNoAnswer,
} from '../form1/form1DraftStorage';
import {
  emptyNameNuans,
  normalizeNameNuans,
  type NameNuansFields,
} from '../form7/form7DraftStorage';

export const CONTINUANCE_TOTAL_STEPS = 10;
export const CONTINUANCE_MAX_NUANS_REPORTS = 2;

export type ContinuanceFormId = 14 | 15;
export type ContinuanceLastCompletedStep = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ContinuanceStakeholderGroupId = 'A' | 'B' | 'C' | 'D';
export type ContinuanceOriginalAct = 'bca-ontario' | 'ca-ontario' | 'other' | '';

export type ContinuanceStep2Data = {
  cooperativeSubtype: string;
  primaryActivity: string;
  email: string;
  confirmEmail: string;
};

export type ContinuanceStep3Data = NameNuansFields;

export type ContinuanceStep4Data = {
  originalAct: ContinuanceOriginalAct;
  otherActJurisdiction: string;
};

export type ContinuanceStep5Data = Form1Step3Data;

export type ContinuanceStakeholderGroup = {
  name: string;
  minimumNumber: string;
  maximumNumber: string;
};

export type ContinuanceDirector = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  residentCanadian: YesNoAnswer | '';
  address: DirectorResidentialAddress;
  addedFromAccount: boolean;
};

export type ContinuanceStep6Data = {
  countMode: DirectorCountMode | '';
  fixedNumber: string;
  minimumNumber: string;
  maximumNumber: string;
  multiStakeholder: YesNoAnswer | '';
  groups: Record<ContinuanceStakeholderGroupId, ContinuanceStakeholderGroup>;
  consentConfirmed: boolean;
  directors: ContinuanceDirector[];
};

/** Form 14 share-capital fields and Form 15 member-loan / membership-fee fields. */
export type ContinuanceStep7Data = {
  businessPowersRestrictions: string;
  authorizedCapital: string;
  preferenceShareTerms: string;
  issuedCapitalContinued: string;
  shareTransferRestrictions: string;
  minimumMemberLoan: string;
  memberLoanTransferRestrictions: string;
  membershipFee: string;
};

export type ContinuanceStep8Data = {
  membershipClasses: string;
  membershipClassTerms: string;
  stakeholderGroups: string;
  stakeholderGroupTerms: string;
  specialProvisions: string;
};

export type ContinuanceStep9Data = {
  cooperativeBasisConfirmed: boolean;
  subsection158Confirmed: boolean;
  continuedUnderActConfirmed: boolean;
  notInsolventConfirmed: boolean;
  attestationConfirmed: boolean;
  authorizingAct: ContinuanceOriginalAct;
  otherActJurisdiction: string;
  authorizationDate: string;
};

export type ContinuanceDraft = {
  step2: ContinuanceStep2Data;
  step3: ContinuanceStep3Data;
  step4: ContinuanceStep4Data;
  step5: ContinuanceStep5Data;
  step6: ContinuanceStep6Data;
  step7: ContinuanceStep7Data;
  step8: ContinuanceStep8Data;
  step9: ContinuanceStep9Data;
  savedAs: 'draft' | 'continue' | 'submitted';
  savedAt: string;
  lastCompletedStep: ContinuanceLastCompletedStep;
};

const STORAGE_KEYS: Record<ContinuanceFormId, string> = {
  14: 'ops-rbac.form14.draft',
  15: 'ops-rbac.form15.draft',
};

export const CONTINUANCE_FILING_TITLE: Record<ContinuanceFormId, string> = {
  14: 'Articles of Continuance as a Co-operative with Share Capital',
  15: 'Articles of Continuance as a Co-operative without Share Capital',
};

/** Story order for Type of Co-operative; Other is last. */
export const CONTINUANCE_COOPERATIVE_SUBTYPES = [
  'Child-Care Co-operative',
  'Consumer Co-operative',
  'Farming and Supply Co-operative',
  'Financing Co-operative',
  'Housing Co-operative',
  'Housing Development Co-operative',
  'Marketing Co-operative',
  'Milk Transport Co-operative',
  'Renewable Energy Co-operative',
  'Service Co-operative',
  'Wholesale Supply Co-operative',
  'Worker Co-operative',
  'Other',
] as const;

export const CONTINUANCE_COOPERATIVE_SUBTYPE_OPTIONS = CONTINUANCE_COOPERATIVE_SUBTYPES.map(
  (label) => ({ value: label, label }),
);

export const OBR_CORPORATION_NAME = 'MAPLE LEAF WORKERS CO-OPERATIVE INC.';
export const OBR_COOPERATIVE_NAME = OBR_CORPORATION_NAME;
export const OBR_PRIMARY_ACTIVITY = '4521 - Department stores';
export const OBR_OFFICIAL_EMAIL = 'registry@mapleleafworkers.coop';
export const OBR_COOPERATIVE_SUBTYPE = 'Worker Co-operative';
export const OBR_INCORPORATION_DATE = '2008-06-15';

export const EMPTY_STEP2: ContinuanceStep2Data = {
  cooperativeSubtype: '',
  primaryActivity: '',
  email: '',
  confirmEmail: '',
};

export const EMPTY_STEP4: ContinuanceStep4Data = {
  originalAct: '',
  otherActJurisdiction: '',
};

export const EMPTY_STEP5: ContinuanceStep5Data = { ...EMPTY_HEAD_OFFICE };

export const CONTINUANCE_STAKEHOLDER_GROUP_IDS: ContinuanceStakeholderGroupId[] = [
  'A',
  'B',
  'C',
  'D',
];

export const EMPTY_STAKEHOLDER_GROUP: ContinuanceStakeholderGroup = {
  name: '',
  minimumNumber: '',
  maximumNumber: '',
};

export function emptyStakeholderGroups(): Record<
  ContinuanceStakeholderGroupId,
  ContinuanceStakeholderGroup
> {
  return {
    A: { ...EMPTY_STAKEHOLDER_GROUP },
    B: { ...EMPTY_STAKEHOLDER_GROUP },
    C: { ...EMPTY_STAKEHOLDER_GROUP },
    D: { ...EMPTY_STAKEHOLDER_GROUP },
  };
}

export const EMPTY_STEP6: ContinuanceStep6Data = {
  countMode: '',
  fixedNumber: '',
  minimumNumber: '',
  maximumNumber: '',
  multiStakeholder: '',
  groups: emptyStakeholderGroups(),
  consentConfirmed: false,
  directors: [],
};

export const EMPTY_STEP7: ContinuanceStep7Data = {
  businessPowersRestrictions: '',
  authorizedCapital: '',
  preferenceShareTerms: '',
  issuedCapitalContinued: '',
  shareTransferRestrictions: '',
  minimumMemberLoan: '',
  memberLoanTransferRestrictions: '',
  membershipFee: '',
};

export const EMPTY_STEP8: ContinuanceStep8Data = {
  membershipClasses: '',
  membershipClassTerms: '',
  stakeholderGroups: '',
  stakeholderGroupTerms: '',
  specialProvisions: '',
};

export const EMPTY_STEP9: ContinuanceStep9Data = {
  cooperativeBasisConfirmed: false,
  subsection158Confirmed: false,
  continuedUnderActConfirmed: false,
  notInsolventConfirmed: false,
  attestationConfirmed: false,
  authorizingAct: '',
  otherActJurisdiction: '',
  authorizationDate: '',
};

export const CONTINUANCE_RICH_TEXT_MAX_CHARS = 900_000;

export const CONTINUANCE_ORIGINAL_ACT_OPTIONS = [
  {
    value: 'bca-ontario',
    label: 'Business Corporations Act (Ontario)',
  },
  {
    value: 'ca-ontario',
    label: 'Corporations Act (Ontario)',
  },
  {
    value: 'other',
    label: 'Other Act (specify Act and jurisdiction)',
  },
] as const;

export const ORIGINAL_ACT_ERROR =
  'Please select the Act and jurisdiction the corporation was originally incorporated/amalgamated under';

export const OTHER_ACT_ERROR = 'Enter the Act and jurisdiction.';

export const STATEMENT_CONFIRM_ERROR = 'This statement must be confirmed to continue.';
export const AUTHORIZING_ACT_ERROR =
  'Select the Act under which the continuation was authorized.';
export const REQUIRED_FIELD_ERROR = 'Required Field.';
export const INVALID_DATE_ERROR = 'Please enter a valid date.';
export const FUTURE_AUTHORIZATION_DATE_ERROR = 'The date cannot be in the future.';

export function originalActLabel(value: ContinuanceOriginalAct): string {
  if (!value) {
    return '—';
  }
  return CONTINUANCE_ORIGINAL_ACT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Bound OBR profile used to pre-populate Step 2. */
export const OBR_STEP2_DEFAULTS: ContinuanceStep2Data = {
  cooperativeSubtype: OBR_COOPERATIVE_SUBTYPE,
  primaryActivity: OBR_PRIMARY_ACTIVITY,
  email: OBR_OFFICIAL_EMAIL,
  confirmEmail: OBR_OFFICIAL_EMAIL,
};

export const OFFICIAL_EMAIL_INFO =
  'The Official Email is not available to the public. Official documents and notices for the co-operative are sent to it, and the contact person also receives correspondence related only to this filing.';

export const PRIMARY_ACTIVITY_HINT =
  'The primary activity is the main activity of your corporation. Please refer to <a href="https://www.statcan.gc.ca/en/concepts/searchclasscod" target="_blank" rel="noopener noreferrer">North American Industry Classification System (NAICS) Canada</a> for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form.';

export const CONTINUANCE_NAME_VALIDATION_ERROR =
  "The co-operative name must include 'CO-OPERATIVE' or 'COOPÉRATIVE' and ends with one of the permitted legal elements — INCORPORATED, INCORPORÉE, CORPORATION, INC., CORP. Please refer information for name rules";

export const CONTINUANCE_NUANS_EXPIRED_ERROR =
  'The attached Nuans Report is no longer valid. A Nuans Report must be issued within 90 days of the filing date. Please provide a current report.';

export const CONTINUANCE_NUANS_DATE_HINT =
  'Report is valid for 90 days from the date it is issued.';

export const CONTINUANCE_PROPOSED_NAME_LEAD = [
  'An Ontario Nuans name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report.',
  'The name of the co-operative must have “CO-OPERATIVE” or “COOPÉRATIVE” in the name. The name of the co-operative must end with one of the following legal elements: “INCORPORATED”, “INCORPORÉE”, “CORPORATION”, “INC.” or “CORP.”.',
] as const;

function capNuansReports(fields: NameNuansFields): ContinuanceStep3Data {
  const reports = fields.nuansReports.slice(0, CONTINUANCE_MAX_NUANS_REPORTS);
  return {
    proposedName: fields.proposedName,
    nuansReports: reports.length > 0 ? reports : emptyNameNuans().nuansReports,
  };
}

function emptyStep3(): ContinuanceStep3Data {
  return capNuansReports(emptyNameNuans());
}

function emptyStep4(): ContinuanceStep4Data {
  return { ...EMPTY_STEP4 };
}

function emptyStep5(): ContinuanceStep5Data {
  return { ...EMPTY_STEP5 };
}

function emptyStep6(): ContinuanceStep6Data {
  return {
    ...EMPTY_STEP6,
    groups: emptyStakeholderGroups(),
    directors: [],
  };
}

function emptyStep7(): ContinuanceStep7Data {
  return { ...EMPTY_STEP7 };
}

function emptyStep8(): ContinuanceStep8Data {
  return { ...EMPTY_STEP8 };
}

function emptyStep9(): ContinuanceStep9Data {
  return { ...EMPTY_STEP9 };
}

function newDirectorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `director-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAddressType(value: unknown): DirectorAddressType | '' {
  if (value === 'canadian' || value === 'us' || value === 'international') {
    return value;
  }
  return '';
}

function normalizeYesNo(value: unknown): YesNoAnswer | '' {
  if (value === 'yes' || value === 'no') {
    return value;
  }
  return '';
}

function normalizeCountMode(value: unknown): DirectorCountMode | '' {
  if (value === 'fixed' || value === 'minMax') {
    return value;
  }
  return '';
}

function normalizeDirectorAddress(raw: unknown): DirectorResidentialAddress {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_DIRECTOR_ADDRESS };
  }
  const value = raw as Partial<DirectorResidentialAddress>;
  const addressType = normalizeAddressType(value.addressType);
  return {
    ...EMPTY_DIRECTOR_ADDRESS,
    ...value,
    addressType,
    country:
      addressType === 'canadian'
        ? 'Canada'
        : addressType === 'us'
          ? 'United States'
          : typeof value.country === 'string'
            ? value.country
            : '',
  };
}

export function createEmptyDirector(id = newDirectorId()): ContinuanceDirector {
  return {
    id,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    residentCanadian: '',
    address: { ...EMPTY_DIRECTOR_ADDRESS },
    addedFromAccount: false,
  };
}

export function createAccountDirector(id = newDirectorId()): ContinuanceDirector {
  return {
    ...createEmptyDirector(id),
    firstName: SIGNED_IN_INDIVIDUAL.firstName,
    middleName: SIGNED_IN_INDIVIDUAL.middleName,
    lastName: SIGNED_IN_INDIVIDUAL.lastName,
    email: SIGNED_IN_INDIVIDUAL.email,
    addedFromAccount: true,
  };
}

function normalizeDirector(raw: unknown): ContinuanceDirector {
  if (!raw || typeof raw !== 'object') {
    return createEmptyDirector();
  }
  const value = raw as Partial<ContinuanceDirector>;
  return {
    ...createEmptyDirector(typeof value.id === 'string' ? value.id : undefined),
    firstName: typeof value.firstName === 'string' ? value.firstName : '',
    middleName: typeof value.middleName === 'string' ? value.middleName : '',
    lastName: typeof value.lastName === 'string' ? value.lastName : '',
    email: typeof value.email === 'string' ? value.email : '',
    residentCanadian: normalizeYesNo(value.residentCanadian),
    address: normalizeDirectorAddress(value.address),
    addedFromAccount: Boolean(value.addedFromAccount),
  };
}

function normalizeStakeholderGroup(raw: unknown): ContinuanceStakeholderGroup {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_STAKEHOLDER_GROUP };
  }
  const value = raw as Partial<ContinuanceStakeholderGroup>;
  return {
    name: typeof value.name === 'string' ? value.name : '',
    minimumNumber: typeof value.minimumNumber === 'string' ? value.minimumNumber : '',
    maximumNumber: typeof value.maximumNumber === 'string' ? value.maximumNumber : '',
  };
}

export function stakeholderGroupIsEmpty(group: ContinuanceStakeholderGroup) {
  return !group.name.trim() && !group.minimumNumber.trim() && !group.maximumNumber.trim();
}

export function stakeholderGroupIsPartial(group: ContinuanceStakeholderGroup) {
  const filled = [group.name, group.minimumNumber, group.maximumNumber].filter((field) =>
    field.trim(),
  ).length;
  return filled > 0 && filled < 3;
}

function normalizeStep6(raw: unknown): ContinuanceStep6Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep6();
  }
  const value = raw as Partial<ContinuanceStep6Data>;
  const multiStakeholder = normalizeYesNo(value.multiStakeholder);
  const groupsSource =
    value.groups && typeof value.groups === 'object' ? value.groups : emptyStakeholderGroups();
  return {
    countMode: normalizeCountMode(value.countMode),
    fixedNumber: typeof value.fixedNumber === 'string' ? value.fixedNumber : '',
    minimumNumber: typeof value.minimumNumber === 'string' ? value.minimumNumber : '',
    maximumNumber: typeof value.maximumNumber === 'string' ? value.maximumNumber : '',
    multiStakeholder,
    groups:
      multiStakeholder === 'yes'
        ? {
            A: normalizeStakeholderGroup(groupsSource.A),
            B: normalizeStakeholderGroup(groupsSource.B),
            C: normalizeStakeholderGroup(groupsSource.C),
            D: normalizeStakeholderGroup(groupsSource.D),
          }
        : emptyStakeholderGroups(),
    consentConfirmed: Boolean(value.consentConfirmed),
    directors: Array.isArray(value.directors) ? value.directors.map(normalizeDirector) : [],
  };
}

export function getDirectorLimit(step6: ContinuanceStep6Data): number | null {
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

export function getDirectorMinimum(step6: ContinuanceStep6Data): number | null {
  if (step6.countMode === 'fixed') {
    const fixed = Number.parseInt(step6.fixedNumber, 10);
    return Number.isFinite(fixed) && fixed > 0 ? fixed : null;
  }
  if (step6.countMode === 'minMax') {
    const min = Number.parseInt(step6.minimumNumber, 10);
    return Number.isFinite(min) && min > 0 ? min : null;
  }
  return null;
}

function emptyDraft(): ContinuanceDraft {
  return {
    step2: { ...EMPTY_STEP2 },
    step3: emptyStep3(),
    step4: emptyStep4(),
    step5: emptyStep5(),
    step6: emptyStep6(),
    step7: emptyStep7(),
    step8: emptyStep8(),
    step9: emptyStep9(),
    savedAs: 'draft',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 0,
  };
}

function normalizeLastCompletedStep(value: unknown): ContinuanceLastCompletedStep {
  if (value === 10) {
    return 10;
  }
  if (value === 9) {
    return 9;
  }
  if (value === 8) {
    return 8;
  }
  if (value === 7) {
    return 7;
  }
  if (value === 6) {
    return 6;
  }
  if (value === 5) {
    return 5;
  }
  if (value === 4) {
    return 4;
  }
  if (value === 3) {
    return 3;
  }
  if (value === 2) {
    return 2;
  }
  return 0;
}

function atLeast(
  current: ContinuanceLastCompletedStep,
  step: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
): ContinuanceLastCompletedStep {
  return current >= step ? current : step;
}

function sentenceCaseNotApplicable(value: string) {
  return value.trim().toLowerCase() === 'not applicable' ? 'Not applicable' : value;
}

function normalizeStep7(raw: unknown): ContinuanceStep7Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep7();
  }
  const value = raw as Partial<ContinuanceStep7Data>;
  return {
    businessPowersRestrictions: sentenceCaseNotApplicable(
      typeof value.businessPowersRestrictions === 'string' ? value.businessPowersRestrictions : '',
    ),
    authorizedCapital: sentenceCaseNotApplicable(
      typeof value.authorizedCapital === 'string' ? value.authorizedCapital : '',
    ),
    preferenceShareTerms: sentenceCaseNotApplicable(
      typeof value.preferenceShareTerms === 'string' ? value.preferenceShareTerms : '',
    ),
    issuedCapitalContinued: sentenceCaseNotApplicable(
      typeof value.issuedCapitalContinued === 'string' ? value.issuedCapitalContinued : '',
    ),
    shareTransferRestrictions: sentenceCaseNotApplicable(
      typeof value.shareTransferRestrictions === 'string' ? value.shareTransferRestrictions : '',
    ),
    minimumMemberLoan: sentenceCaseNotApplicable(
      typeof value.minimumMemberLoan === 'string' ? value.minimumMemberLoan : '',
    ),
    memberLoanTransferRestrictions: sentenceCaseNotApplicable(
      typeof value.memberLoanTransferRestrictions === 'string'
        ? value.memberLoanTransferRestrictions
        : '',
    ),
    membershipFee: sentenceCaseNotApplicable(
      typeof value.membershipFee === 'string' ? value.membershipFee : '',
    ),
  };
}

function normalizeStep8(raw: unknown): ContinuanceStep8Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep8();
  }
  const value = raw as Partial<ContinuanceStep8Data>;
  return {
    membershipClasses: sentenceCaseNotApplicable(
      typeof value.membershipClasses === 'string' ? value.membershipClasses : '',
    ),
    membershipClassTerms: sentenceCaseNotApplicable(
      typeof value.membershipClassTerms === 'string' ? value.membershipClassTerms : '',
    ),
    stakeholderGroups: sentenceCaseNotApplicable(
      typeof value.stakeholderGroups === 'string' ? value.stakeholderGroups : '',
    ),
    stakeholderGroupTerms: sentenceCaseNotApplicable(
      typeof value.stakeholderGroupTerms === 'string' ? value.stakeholderGroupTerms : '',
    ),
    specialProvisions: sentenceCaseNotApplicable(
      typeof value.specialProvisions === 'string' ? value.specialProvisions : '',
    ),
  };
}

function normalizeIsoDate(value: unknown): string {
  if (typeof value !== 'string' || value.length < 10) {
    return '';
  }
  const dayPart = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dayPart) ? dayPart : '';
}

function normalizeStep9(raw: unknown): ContinuanceStep9Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep9();
  }
  const value = raw as Partial<ContinuanceStep9Data>;
  const authorizingAct = normalizeOriginalAct(value.authorizingAct);
  return {
    cooperativeBasisConfirmed: value.cooperativeBasisConfirmed === true,
    subsection158Confirmed: value.subsection158Confirmed === true,
    continuedUnderActConfirmed: value.continuedUnderActConfirmed === true,
    notInsolventConfirmed: value.notInsolventConfirmed === true,
    attestationConfirmed: value.attestationConfirmed === true,
    authorizingAct,
    otherActJurisdiction:
      authorizingAct === 'other' && typeof value.otherActJurisdiction === 'string'
        ? value.otherActJurisdiction
        : '',
    authorizationDate: normalizeIsoDate(value.authorizationDate),
  };
}

function normalizeStep5(raw: unknown): ContinuanceStep5Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep5();
  }
  return {
    ...EMPTY_STEP5,
    ...(raw as Partial<ContinuanceStep5Data>),
    province: 'Ontario',
    country: 'Canada',
  };
}

function normalizeOriginalAct(value: unknown): ContinuanceOriginalAct {
  if (value === 'bca-ontario' || value === 'ca-ontario' || value === 'other') {
    return value;
  }
  return '';
}

function normalizeStep4(raw: unknown): ContinuanceStep4Data {
  if (!raw || typeof raw !== 'object') {
    return emptyStep4();
  }
  const value = raw as Partial<ContinuanceStep4Data>;
  const originalAct = normalizeOriginalAct(value.originalAct);
  return {
    originalAct,
    otherActJurisdiction:
      originalAct === 'other' && typeof value.otherActJurisdiction === 'string'
        ? value.otherActJurisdiction
        : '',
  };
}

export function readContinuanceDraft(formId: ContinuanceFormId): ContinuanceDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS[formId]);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ContinuanceDraft>;
    return {
      step2: {
        ...EMPTY_STEP2,
        ...(parsed.step2 ?? {}),
      },
      step3: capNuansReports(normalizeNameNuans(parsed.step3)),
      step4: normalizeStep4(parsed.step4),
      step5: normalizeStep5(parsed.step5),
      step6: normalizeStep6(parsed.step6),
      step7: normalizeStep7(parsed.step7),
      step8: normalizeStep8(parsed.step8),
      step9: normalizeStep9(parsed.step9),
      savedAs: parsed.savedAs === 'continue' || parsed.savedAs === 'submitted' ? parsed.savedAs : 'draft',
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      lastCompletedStep: normalizeLastCompletedStep(parsed.lastCompletedStep),
    };
  } catch {
    return null;
  }
}

export function saveContinuanceDraft(formId: ContinuanceFormId, draft: ContinuanceDraft) {
  sessionStorage.setItem(STORAGE_KEYS[formId], JSON.stringify(draft));
}

export function upsertContinuanceStep2(
  formId: ContinuanceFormId,
  step2: ContinuanceStep2Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step2,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 2)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep3(
  formId: ContinuanceFormId,
  step3: ContinuanceStep3Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step3: capNuansReports(step3),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 3)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep4(
  formId: ContinuanceFormId,
  step4: ContinuanceStep4Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step4: normalizeStep4(step4),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 4)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep5(
  formId: ContinuanceFormId,
  step5: ContinuanceStep5Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step5: normalizeStep5(step5),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 5)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep6(
  formId: ContinuanceFormId,
  step6: ContinuanceStep6Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step6: normalizeStep6(step6),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 6)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep7(
  formId: ContinuanceFormId,
  step7: ContinuanceStep7Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step7: normalizeStep7(step7),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 7)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep8(
  formId: ContinuanceFormId,
  step8: ContinuanceStep8Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step8: normalizeStep8(step8),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 8)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

export function upsertContinuanceStep9(
  formId: ContinuanceFormId,
  step9: ContinuanceStep9Data,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    step9: normalizeStep9(step9),
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 9)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

function seedContinuanceDraft(): ContinuanceDraft {
  return {
    step2: { ...OBR_STEP2_DEFAULTS },
    step3: emptyStep3(),
    step4: emptyStep4(),
    step5: emptyStep5(),
    step6: emptyStep6(),
    step7: emptyStep7(),
    step8: emptyStep8(),
    step9: emptyStep9(),
    savedAs: 'continue',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 0,
  };
}

/** Playground / first visit: seed OBR co-operative details when no draft exists. */
export function ensureContinuanceStep2Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded = seedContinuanceDraft();
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep OBR Step 2 and an empty Step 3 name/Nuans block. */
export function ensureContinuanceStep3Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 2,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and an empty original-Act selection. */
export function ensureContinuanceStep4Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 3,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and an empty head office address. */
export function ensureContinuanceStep5Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 4,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and an empty directors step. */
export function ensureContinuanceStep6Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 5,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and empty restrictions / share capital fields. */
export function ensureContinuanceStep7Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 6,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and empty membership / provisions fields. */
export function ensureContinuanceStep8Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 7,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps and empty declarations / authorization. */
export function ensureContinuanceStep9Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 8,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

/** Playground deep-link: keep prior steps for the review page. */
export function ensureContinuanceStep10Draft(formId: ContinuanceFormId): ContinuanceDraft {
  const existing = readContinuanceDraft(formId);
  if (existing) {
    return existing;
  }
  const seeded: ContinuanceDraft = {
    ...seedContinuanceDraft(),
    lastCompletedStep: 9,
  };
  saveContinuanceDraft(formId, seeded);
  return seeded;
}

export function upsertContinuanceReview(
  formId: ContinuanceFormId,
  savedAs: ContinuanceDraft['savedAs'],
  lastCompletedStep?: ContinuanceDraft['lastCompletedStep'],
): ContinuanceDraft {
  const existing = readContinuanceDraft(formId) ?? emptyDraft();
  const draft: ContinuanceDraft = {
    ...existing,
    savedAs,
    savedAt: new Date().toISOString(),
    lastCompletedStep:
      lastCompletedStep !== undefined
        ? lastCompletedStep
        : savedAs === 'continue'
          ? atLeast(existing.lastCompletedStep, 10)
          : existing.lastCompletedStep,
  };
  saveContinuanceDraft(formId, draft);
  return draft;
}

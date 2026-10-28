import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import {
  contactFromSignedInProfile,
  readCoverLetterContact,
  type CoverLetterContact,
} from '../cover-letter/coverLetterContactStorage';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { validateDirector } from './Form2DirectorEditor';
import { validateIncorporator } from './Form2IncorporatorEditor';
import {
  formatCooperativeSubtype,
  formatUnitLabel,
  unitTypeRequiredError,
  type Form2Draft,
  type Form2Step1Data,
  type Form2Step3Data,
  type Form2Step4Data,
} from './form2DraftStorage';
import {
  buildDirectorGroups,
  buildIncorporatorGroups,
  type PersonReviewGroup,
} from '../shared/personReviewRows';
import { validateNuansDate } from '../form7/nuansValidation';
import { validateCooperativeName } from './nameValidation';

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey =
  | 'contact'
  | 'cooperativeName'
  | 'typeAndContact'
  | 'headOffice'
  | 'firstDirectors'
  | 'memberLoansRestrictions'
  | 'membershipProvisions'
  | 'incorporators';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
  /** Per-person summary lists, each with its own h2, rendered after `rows`. */
  groups?: PersonReviewGroup[];
};

function displayOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : 'Not provided';
}

function textPreview(value: string, max = 160) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Not provided';
  }
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

function yesNo(value: string) {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  return 'Not provided';
}

function formatHeadOffice(step3: Form2Step3Data) {
  const street = [
    formatUnitLabel(step3.unitType, step3.roomNumber),
    [
      step3.streetNumber,
      step3.streetNumberSuffix,
      step3.streetName,
      step3.streetType,
      step3.streetDirection,
    ]
      .filter(Boolean)
      .join(' '),
    step3.poBox?.trim() ? `PO Box ${step3.poBox.trim()}` : '',
    step3.station?.trim() ? `Station ${step3.station.trim()}` : '',
    step3.ruralRoute?.trim() ? `RR ${step3.ruralRoute.trim()}` : '',
    step3.lotPartBlockSection?.trim() ?? '',
    step3.concessionOrPlan?.trim() ?? '',
    step3.cityTown,
    step3.province,
    step3.postalCode,
    step3.country,
  ]
    .filter(Boolean)
    .join(', ');
  return street || 'Not provided';
}

function formatDirectorCount(step4: Form2Step4Data) {
  if (step4.countMode === 'fixed') {
    return `Fixed number: ${displayOrEmpty(step4.fixedNumber)}`;
  }
  if (step4.countMode === 'minMax') {
    return `Minimum ${displayOrEmpty(step4.minimumNumber)}, maximum ${displayOrEmpty(step4.maximumNumber)}`;
  }
  return 'Not provided';
}

function isNameStepComplete(step1: Form2Step1Data) {
  if (!step1.nonProfitOrganization) {
    return false;
  }
  if (validateCooperativeName(step1.cooperativeName)) {
    return false;
  }
  const reports = step1.nuansReports ?? [];
  if (reports.length === 0) {
    return false;
  }
  return reports.every(
    (report) => Boolean(report.file) && !validateNuansDate(report.date),
  );
}

function isTypeContactComplete(draft: Form2Draft) {
  const s = draft.step2;
  return Boolean(
    s.primaryActivity.trim() &&
      s.email.trim() &&
      s.confirmEmail.trim() &&
      s.email.trim().toLowerCase() === s.confirmEmail.trim().toLowerCase(),
  );
}

function isHeadOfficeComplete(step3: Form2Step3Data) {
  if (unitTypeRequiredError(step3.roomNumber, step3.unitType)) {
    return false;
  }
  return Boolean(
    step3.streetNumber.trim() &&
      step3.streetName.trim() &&
      step3.cityTown.trim() &&
      step3.postalCode.trim(),
  );
}

function isDirectorsComplete(step4: Form2Step4Data) {
  if (!step4.countMode || step4.directors.length === 0) {
    return false;
  }
  if (step4.multiStakeholder === 'yes' && !step4.stakeholderDirectorsText.trim()) {
    return false;
  }
  return step4.directors.every(
    (director) => Object.keys(validateDirector(director)).length === 0,
  );
}

function isMemberLoansComplete(draft: Form2Draft) {
  const s = draft.step5;
  return Boolean(
    s.businessPowersRestrictions.trim() &&
      s.minimumMemberLoan.trim() &&
      s.memberLoanTransferRestrictions.trim() &&
      s.membershipFee.trim(),
  );
}

function isMembershipComplete(draft: Form2Draft) {
  const s = draft.step6;
  const classes = s.membershipClasses.trim();
  const classTerms = s.membershipClassTerms.trim();
  const groups = s.stakeholderGroups.trim();
  const groupTerms = s.stakeholderGroupTerms.trim();
  const special = s.specialProvisions.trim();
  const stakeholderRequired = draft.step4.multiStakeholder === 'yes';

  if (!classes || !classTerms || !special) {
    return false;
  }
  if (stakeholderRequired) {
    return Boolean(groups && groupTerms);
  }
  // Optional when not multi-stakeholder; if one is entered, both are needed.
  if (groups || groupTerms) {
    return Boolean(groups && groupTerms);
  }
  return true;
}

function isIncorporatorsComplete(draft: Form2Draft) {
  const list = draft.step7.incorporators;
  const subtype = draft.step2.cooperativeSubtype.trim();
  if (!subtype) {
    if (list.length === 0) {
      return false;
    }
  } else {
    const minimum = subtype === 'Worker Co-operative' ? 5 : 3;
    if (list.length < minimum) {
      return false;
    }
  }
  return list.every(
    (entry) => Object.keys(validateIncorporator(entry)).length === 0,
  );
}

function isContactComplete(contact: CoverLetterContact) {
  return Boolean(
    contact.firstName.trim() &&
      contact.lastName.trim() &&
      contact.phoneNumber.trim() &&
      contact.email.trim() &&
      contact.confirmEmail.trim(),
  );
}

function buildNameRows(step1: Form2Step1Data): ReviewRow[] {
  const rows: ReviewRow[] = [
    {
      name: 'Non-profit organization',
      description:
        step1.nonProfitOrganization === 'yes'
          ? 'Yes'
          : step1.nonProfitOrganization === 'no'
            ? 'No'
            : 'Not provided',
    },
    {
      name: 'Co-operative name',
      description: displayOrEmpty(step1.cooperativeName),
    },
  ];

  const reports = step1.nuansReports ?? [];
  if (reports.length === 0) {
    rows.push(
      {
        name: 'NUANS report',
        description: 'Not provided',
      },
      {
        name: 'NUANS report date',
        description: 'Not provided',
      },
    );
    return rows;
  }

  reports.forEach((report, index) => {
    const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
    rows.push(
      {
        name: `NUANS report${ordinal}`,
        description: report.file?.name ?? 'Not provided',
        files: report.file ? [report.file] : undefined,
      },
      {
        name: `NUANS report${ordinal} date`,
        description: formatIsoDateDisplay(report.date),
      },
    );
  });

  return rows;
}

export function resolveCoverLetterContact(): CoverLetterContact {
  return readCoverLetterContact() ?? contactFromSignedInProfile();
}

export function buildReviewSections(draft: Form2Draft): ReviewSection[] {
  const contact = resolveCoverLetterContact();
  const contactName = [contact.firstName, contact.middleName, contact.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return [
    {
      key: 'contact',
      caption: 'Contact information',
      editHref: '/form-2',
      complete: isContactComplete(contact),
      rows: [
        { name: 'Name', description: displayOrEmpty(contactName) },
        {
          name: 'Phone number',
          description: contact.phoneExtension.trim()
            ? `${displayOrEmpty(contact.phoneNumber)} ext. ${contact.phoneExtension}`
            : displayOrEmpty(contact.phoneNumber),
        },
        { name: 'Email', description: displayOrEmpty(contact.email) },
      ],
    },
    {
      key: 'cooperativeName',
      caption: 'Co-operative name',
      editHref: '/form-2/step-2',
      complete: isNameStepComplete(draft.step1),
      rows: buildNameRows(draft.step1),
    },
    {
      key: 'typeAndContact',
      caption: 'Co-operative type and official contact',
      editHref: '/form-2/step-3',
      complete: isTypeContactComplete(draft),
      rows: [
        {
          name: 'Type of co-operative',
          description: displayOrEmpty(formatCooperativeSubtype(draft.step2)),
        },
        {
          name: 'Primary activity',
          description: displayOrEmpty(draft.step2.primaryActivity),
        },
        {
          name: 'Official email',
          description: displayOrEmpty(draft.step2.email),
        },
      ],
    },
    {
      key: 'headOffice',
      caption: 'Head office address',
      editHref: '/form-2/step-4',
      complete: isHeadOfficeComplete(draft.step3),
      rows: [
        {
          name: 'Head office address',
          description: formatHeadOffice(draft.step3),
        },
        {
          name: 'Municipality',
          description:
            draft.step3.municipalityStatus.trim() && draft.step3.cityTown.trim()
              ? `${draft.step3.municipalityStatus} of ${draft.step3.cityTown}`
              : 'Not provided',
        },
        {
          name: 'County / region',
          description: draft.step3.countyName.trim()
            ? `${draft.step3.countyStatus} of ${draft.step3.countyName}`.trim()
            : 'Not provided',
        },
      ],
    },
    {
      key: 'firstDirectors',
      caption: 'First directors',
      editHref: '/form-2/step-5',
      complete: isDirectorsComplete(draft.step4),
      rows: [
        {
          name: 'Number of directors',
          description: formatDirectorCount(draft.step4),
        },
        {
          name: 'Multi-stakeholder co-operative',
          description: yesNo(draft.step4.multiStakeholder),
        },
        ...(draft.step4.multiStakeholder === 'yes'
          ? [
              {
                name: 'Stakeholder directors',
                description: textPreview(draft.step4.stakeholderDirectorsText),
              },
            ]
          : []),
      ],
      groups: buildDirectorGroups(draft.step4.directors, {
        editHref: (id) => `/form-2/step-5/directors/${id}`,
        includeShares: false,
      }),
    },
    {
      key: 'memberLoansRestrictions',
      caption: 'Member loans and restrictions',
      editHref: '/form-2/step-6',
      complete: isMemberLoansComplete(draft),
      rows: [
        {
          name: 'Business / powers restrictions',
          description: textPreview(draft.step5.businessPowersRestrictions),
        },
        {
          name: 'Minimum member loan',
          description: textPreview(draft.step5.minimumMemberLoan),
        },
        {
          name: 'Restrictions on transfer of member loans',
          description: textPreview(draft.step5.memberLoanTransferRestrictions),
        },
        {
          name: 'Membership fee',
          description: textPreview(draft.step5.membershipFee),
        },
      ],
    },
    {
      key: 'membershipProvisions',
      caption: 'Membership and provisions',
      editHref: '/form-2/step-7',
      complete: isMembershipComplete(draft),
      rows: [
        {
          name: 'Classes of membership',
          description: textPreview(draft.step6.membershipClasses),
        },
        {
          name: 'Membership class terms',
          description: textPreview(draft.step6.membershipClassTerms),
        },
        {
          name: 'Stakeholder groups',
          description: textPreview(draft.step6.stakeholderGroups),
        },
        {
          name: 'Stakeholder group terms',
          description: textPreview(draft.step6.stakeholderGroupTerms),
        },
        {
          name: 'Special provisions',
          description: textPreview(draft.step6.specialProvisions),
        },
      ],
    },
    {
      key: 'incorporators',
      caption: 'Incorporators',
      editHref: '/form-2/step-8',
      complete: isIncorporatorsComplete(draft),
      rows:
        draft.step7.incorporators.length === 0
          ? [{ name: 'Incorporators', description: 'Not provided' }]
          : [],
      groups: buildIncorporatorGroups(draft.step7.incorporators, draft.step4.directors, {
        editHref: (id) => `/form-2/step-8/incorporators/${id}`,
        includeShares: false,
      }),
    },
  ];
}

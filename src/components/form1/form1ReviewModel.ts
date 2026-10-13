import {
  contactFromSignedInProfile,
  readCoverLetterContact,
  type CoverLetterContact,
} from '../cover-letter/coverLetterContactStorage';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { validateDirector, formatDirectorFullName } from './Form1DirectorEditor';
import {
  formatIncorporatorFullName,
  formatIncorporatorListDescription,
  validateIncorporator,
} from './Form1IncorporatorEditor';
import type {
  Form1Draft,
  Form1Step1Data,
  Form1Step3Data,
  Form1Step4Data,
} from './form1DraftStorage';
import type { NameLanguageOption } from './nameValidation';

export type ReviewRow = {
  name: string;
  description: string;
};

export type ReviewSectionKey =
  | 'contact'
  | 'cooperativeName'
  | 'typeAndContact'
  | 'headOffice'
  | 'firstDirectors'
  | 'shareInformation'
  | 'membershipProvisions'
  | 'incorporators';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
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

function nameFormatLabel(option: NameLanguageOption | '') {
  switch (option) {
    case 'english':
      return 'English';
    case 'french':
      return 'French';
    case 'combined':
      return 'Combined English and French';
    case 'separate':
      return 'Separate English and French';
    default:
      return 'Not provided';
  }
}

function yesNo(value: string) {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  return 'Not provided';
}

function formatHeadOffice(step3: Form1Step3Data) {
  const street = [
    step3.roomNumber ? `Room ${step3.roomNumber}` : '',
    [
      step3.streetNumber,
      step3.streetNumberSuffix,
      step3.streetName,
      step3.streetType,
      step3.streetDirection,
    ]
      .filter(Boolean)
      .join(' '),
    step3.cityTown,
    step3.province,
    step3.postalCode,
    step3.country,
  ]
    .filter(Boolean)
    .join(', ');
  return street || 'Not provided';
}

function formatDirectorCount(step4: Form1Step4Data) {
  if (step4.countMode === 'fixed') {
    return `Fixed number: ${displayOrEmpty(step4.fixedNumber)}`;
  }
  if (step4.countMode === 'minMax') {
    return `Minimum ${displayOrEmpty(step4.minimumNumber)}, maximum ${displayOrEmpty(step4.maximumNumber)}`;
  }
  return 'Not provided';
}

function isNameStepComplete(step1: Form1Step1Data) {
  if (!step1.languageOption) {
    return false;
  }
  if (step1.languageOption === 'separate') {
    return Boolean(
      step1.englishName.trim() &&
        step1.frenchName.trim() &&
        step1.nuansFileEn &&
        step1.nuansDateEn &&
        step1.nuansFileFr &&
        step1.nuansDateFr,
    );
  }
  return Boolean(step1.cooperativeName.trim() && step1.nuansFile && step1.nuansDate);
}

function isTypeContactComplete(draft: Form1Draft) {
  const s = draft.step2;
  return Boolean(
    s.cooperativeSubtype.trim() &&
      s.primaryActivity.trim() &&
      s.email.trim() &&
      s.confirmEmail.trim() &&
      s.email.trim().toLowerCase() === s.confirmEmail.trim().toLowerCase(),
  );
}

function isHeadOfficeComplete(step3: Form1Step3Data) {
  return Boolean(
    step3.streetNumber.trim() &&
      step3.streetName.trim() &&
      step3.cityTown.trim() &&
      step3.postalCode.trim(),
  );
}

function isDirectorsComplete(step4: Form1Step4Data) {
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

function isShareComplete(draft: Form1Draft) {
  return Boolean(
    draft.step5.authorizedCapital.trim() &&
      draft.step5.shareTransferRestrictions.trim(),
  );
}

function isMembershipComplete(draft: Form1Draft) {
  const s = draft.step6;
  const classes = s.membershipClasses.trim();
  const classTerms = s.membershipClassTerms.trim();
  const groups = s.stakeholderGroups.trim();
  const groupTerms = s.stakeholderGroupTerms.trim();
  const special = s.specialProvisions.trim();

  if (!classes || !classTerms || !groups || !groupTerms || !special) {
    return false;
  }
  return true;
}

function isIncorporatorsComplete(draft: Form1Draft) {
  const list = draft.step7.incorporators;
  if (list.length === 0) {
    return false;
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

function buildNameRows(step1: Form1Step1Data): ReviewRow[] {
  const rows: ReviewRow[] = [
    {
      name: 'Name format',
      description: nameFormatLabel(step1.languageOption),
    },
  ];

  if (step1.languageOption === 'separate') {
    rows.push(
      {
        name: 'English co-operative name',
        description: displayOrEmpty(step1.englishName),
      },
      {
        name: 'English NUANS report',
        description: step1.nuansFileEn?.name ?? 'Not provided',
      },
      {
        name: 'English NUANS report date',
        description: formatIsoDateDisplay(step1.nuansDateEn),
      },
      {
        name: 'French co-operative name',
        description: displayOrEmpty(step1.frenchName),
      },
      {
        name: 'French NUANS report',
        description: step1.nuansFileFr?.name ?? 'Not provided',
      },
      {
        name: 'French NUANS report date',
        description: formatIsoDateDisplay(step1.nuansDateFr),
      },
    );
    return rows;
  }

  rows.push(
    {
      name: 'Co-operative name',
      description: displayOrEmpty(step1.cooperativeName),
    },
    {
      name: 'NUANS report',
      description: step1.nuansFile?.name ?? 'Not provided',
    },
    {
      name: 'NUANS report date',
      description: formatIsoDateDisplay(step1.nuansDate),
    },
  );
  return rows;
}

export function resolveCoverLetterContact(): CoverLetterContact {
  return readCoverLetterContact() ?? contactFromSignedInProfile();
}

export function buildReviewSections(draft: Form1Draft): ReviewSection[] {
  const contact = resolveCoverLetterContact();
  const contactName = [contact.firstName, contact.middleName, contact.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return [
    {
      key: 'contact',
      caption: 'Contact information',
      editHref: '/form-1',
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
      editHref: '/form-1/step-2',
      complete: isNameStepComplete(draft.step1),
      rows: buildNameRows(draft.step1),
    },
    {
      key: 'typeAndContact',
      caption: 'Co-operative type and official contact',
      editHref: '/form-1/step-3',
      complete: isTypeContactComplete(draft),
      rows: [
        {
          name: 'Type of Co-operative',
          description: displayOrEmpty(draft.step2.cooperativeSubtype),
        },
        {
          name: 'Primary Activity',
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
      editHref: '/form-1/step-4',
      complete: isHeadOfficeComplete(draft.step3),
      rows: [
        {
          name: 'Head office address',
          description: formatHeadOffice(draft.step3),
        },
        {
          name: 'Municipality',
          description: draft.step3.municipalityName.trim()
            ? `${draft.step3.municipalityStatus} of ${draft.step3.municipalityName}`.trim()
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
      editHref: '/form-1/step-5',
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
        ...draft.step4.directors.map((director, index) => ({
          name: `Director ${index + 1}`,
          description:
            formatDirectorFullName(director) ||
            `Director ${index + 1} (incomplete)`,
        })),
      ],
    },
    {
      key: 'shareInformation',
      caption: 'Share information',
      editHref: '/form-1/step-6',
      complete: isShareComplete(draft),
      rows: [
        {
          name: 'Business / powers restrictions',
          description: textPreview(draft.step5.businessPowersRestrictions),
        },
        {
          name: 'Authorized capital',
          description: textPreview(draft.step5.authorizedCapital),
        },
        {
          name: 'Preference share terms',
          description: textPreview(draft.step5.preferenceShareTerms),
        },
        {
          name: 'Share transfer restrictions',
          description: textPreview(draft.step5.shareTransferRestrictions),
        },
      ],
    },
    {
      key: 'membershipProvisions',
      caption: 'Membership and provisions',
      editHref: '/form-1/step-7',
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
      editHref: '/form-1/step-8',
      complete: isIncorporatorsComplete(draft),
      rows:
        draft.step7.incorporators.length === 0
          ? [{ name: 'Incorporators', description: 'Not provided' }]
          : draft.step7.incorporators.map((entry, index) => {
              const name =
                entry.type === 'corporation'
                  ? entry.corporationName || `Incorporator ${index + 1}`
                  : formatIncorporatorFullName(entry) ||
                    `Incorporator ${index + 1}`;
              return {
                name: `Incorporator ${index + 1}`,
                description: `${name} · ${formatIncorporatorListDescription(entry)}`,
              };
            }),
    },
  ];
}

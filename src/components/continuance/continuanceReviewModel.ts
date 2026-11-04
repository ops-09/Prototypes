import {
  contactFromSignedInProfile,
  readCoverLetterContact,
  type CoverLetterContact,
} from '../cover-letter/coverLetterContactStorage';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import {
  formatMailingAddress,
  formatPersonName,
  type PersonReviewGroup,
} from '../shared/personReviewRows';
import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import { formatDirectorFullName } from './ContinuanceDirectorEditor';
import {
  CONTINUANCE_STAKEHOLDER_GROUP_IDS,
  OBR_CORPORATION_NAME,
  OBR_INCORPORATION_DATE,
  originalActLabel,
  stakeholderGroupIsEmpty,
  type ContinuanceDraft,
  type ContinuanceFormId,
  type ContinuanceStep5Data,
  type ContinuanceStep6Data,
  type ContinuanceStep7Data,
  type ContinuanceStep9Data,
} from './continuanceDraftStorage';
import { coverLetterReviewHref, withReviewReturn } from './continuanceReviewReturn';

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey =
  | 'contact'
  | 'corporationDetails'
  | 'cooperativeName'
  | 'originalAct'
  | 'headOffice'
  | 'directors'
  | 'restrictions'
  | 'membership'
  | 'declarations';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
  groups?: PersonReviewGroup[];
};

function displayOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : 'Not provided';
}

function enteredOrEmpty(value: string) {
  return value;
}

function yesNo(value: string) {
  if (value === 'yes') {
    return 'Yes';
  }
  if (value === 'no') {
    return 'No';
  }
  return 'Not provided';
}

function confirmed(value: boolean) {
  return value ? 'Confirmed' : 'Not confirmed';
}

function resolveCoverLetterContact(): CoverLetterContact {
  return readCoverLetterContact() ?? contactFromSignedInProfile();
}

function isContactComplete(contact: CoverLetterContact) {
  return Boolean(
    contact.firstName.trim() &&
      contact.lastName.trim() &&
      contact.email.trim() &&
      contact.phoneNumber.trim(),
  );
}

function formatDirectorCount(step6: ContinuanceStep6Data) {
  if (step6.countMode === 'fixed') {
    return `Fixed number: ${displayOrEmpty(step6.fixedNumber)}`;
  }
  if (step6.countMode === 'minMax') {
    return `Minimum ${displayOrEmpty(step6.minimumNumber)}, maximum ${displayOrEmpty(step6.maximumNumber)}`;
  }
  return 'Not provided';
}

function streetAddress(step5: ContinuanceStep5Data) {
  return [
    step5.streetNumber,
    step5.streetNumberSuffix,
    step5.streetName,
    step5.streetType,
    step5.streetDirection,
  ]
    .filter(Boolean)
    .join(' ');
}

function isHeadOfficeComplete(step5: ContinuanceStep5Data) {
  return Boolean(
    step5.streetNumber.trim() &&
      step5.streetName.trim() &&
      step5.cityTown.trim() &&
      step5.postalCode.trim() &&
      step5.province.trim(),
  );
}

function isDirectorsComplete(step6: ContinuanceStep6Data) {
  if (!step6.countMode || !step6.consentConfirmed || step6.directors.length === 0) {
    return false;
  }
  if (step6.multiStakeholder === 'yes') {
    return CONTINUANCE_STAKEHOLDER_GROUP_IDS.some(
      (id) => !stakeholderGroupIsEmpty(step6.groups[id]),
    );
  }
  return step6.multiStakeholder === 'no';
}

function isRestrictionsComplete(formId: ContinuanceFormId, step7: ContinuanceStep7Data) {
  if (!step7.businessPowersRestrictions.trim()) {
    return false;
  }
  if (formId === 15) {
    return Boolean(
      step7.minimumMemberLoan.trim() &&
        step7.memberLoanTransferRestrictions.trim() &&
        step7.membershipFee.trim(),
    );
  }
  return Boolean(
    step7.authorizedCapital.trim() &&
      step7.preferenceShareTerms.trim() &&
      step7.issuedCapitalContinued.trim() &&
      step7.shareTransferRestrictions.trim(),
  );
}

function isDeclarationsComplete(step9: ContinuanceStep9Data) {
  if (
    !step9.cooperativeBasisConfirmed ||
    !step9.subsection158Confirmed ||
    !step9.continuedUnderActConfirmed ||
    !step9.notInsolventConfirmed ||
    !step9.attestationConfirmed ||
    !step9.authorizingAct ||
    !step9.authorizationDate
  ) {
    return false;
  }
  if (step9.authorizingAct === 'other' && !step9.otherActJurisdiction.trim()) {
    return false;
  }
  return true;
}

function stepHref(formId: ContinuanceFormId, step: number) {
  return withReviewReturn(`/form-${formId}/step-${step}`, true);
}

export function buildContinuanceReviewSections(
  formId: ContinuanceFormId,
  draft: ContinuanceDraft,
): ReviewSection[] {
  const contact = resolveCoverLetterContact();
  const contactName = [contact.firstName, contact.middleName, contact.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const proposedName = draft.step3.proposedName.trim();
  const continuedNameDifferent =
    proposedName && proposedName.toUpperCase() !== OBR_CORPORATION_NAME.toUpperCase();
  const nuansReports = draft.step3.nuansReports.filter(
    (report) => report.file || report.date.trim(),
  );

  const nameRows: ReviewRow[] = [
    { name: 'Name of the corporation', description: OBR_CORPORATION_NAME },
  ];
  if (continuedNameDifferent) {
    nameRows.push({ name: 'Continued name', description: proposedName });
  }
  nuansReports.forEach((report, index, reports) => {
    const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
    if (report.file) {
      nameRows.push({
        name: `Nuans report${ordinal} document name`,
        description: report.file.name,
        files: [report.file],
      });
    }
    if (report.date.trim()) {
      nameRows.push({
        name: `Nuans report${ordinal} date`,
        description: formatIsoDateDisplay(report.date),
      });
    }
  });

  const headOfficeRows: ReviewRow[] = [
    {
      name: 'Head office municipality',
      description: displayOrEmpty(formatHeadOfficeLocation(draft.step5) || draft.step5.cityTown),
    },
    {
      name: 'Street address',
      description: displayOrEmpty(streetAddress(draft.step5)),
    },
  ];
  if (draft.step5.unitType.trim()) {
    headOfficeRows.push({
      name: 'Unit type',
      description: draft.step5.unitType,
    });
  }
  if (draft.step5.roomNumber.trim()) {
    headOfficeRows.push({
      name: 'Unit/suite number',
      description: draft.step5.roomNumber,
    });
  }
  headOfficeRows.push(
    { name: 'City/town', description: displayOrEmpty(draft.step5.cityTown) },
    { name: 'Province', description: displayOrEmpty(draft.step5.province) },
    { name: 'Postal code', description: displayOrEmpty(draft.step5.postalCode) },
  );

  const directorRows: ReviewRow[] = [
    {
      name: 'Number of directors',
      description: formatDirectorCount(draft.step6),
    },
  ];
  if (draft.step6.multiStakeholder === 'yes') {
    CONTINUANCE_STAKEHOLDER_GROUP_IDS.forEach((id) => {
      const group = draft.step6.groups[id];
      if (stakeholderGroupIsEmpty(group)) {
        return;
      }
      directorRows.push({
        name: `Stakeholder group ${id}`,
        description: `${displayOrEmpty(group.name)} — minimum ${displayOrEmpty(group.minimumNumber)}, maximum ${displayOrEmpty(group.maximumNumber)}`,
      });
    });
  }
  directorRows.push({
    name: 'Written consent for first directors',
    description: confirmed(draft.step6.consentConfirmed),
  });

  const directorGroups: PersonReviewGroup[] = draft.step6.directors.map((director, index) => ({
    key: director.id,
    caption: `Director ${index + 1}`,
    editHref: withReviewReturn(
      `/form-${formId}/step-6/directors/${director.id}`,
      true,
    ),
    rows: [
      {
        name: 'Full name',
        description: formatDirectorFullName(director) || formatPersonName(director),
      },
      {
        name: 'Residential address',
        description: formatMailingAddress(director.address),
      },
      {
        name: 'Resident Canadian',
        description: yesNo(director.residentCanadian),
      },
    ],
  }));

  const restrictionRows: ReviewRow[] =
    formId === 15
      ? [
          {
            name: 'Restrictions on the business and powers',
            description: displayOrEmpty(enteredOrEmpty(draft.step7.businessPowersRestrictions)),
          },
          {
            name: 'Minimum member loan',
            description: displayOrEmpty(draft.step7.minimumMemberLoan),
          },
          {
            name: 'Restrictions on transfer of member loans',
            description: displayOrEmpty(draft.step7.memberLoanTransferRestrictions),
          },
          {
            name: 'Membership fee',
            description: displayOrEmpty(draft.step7.membershipFee),
          },
        ]
      : [
          {
            name: 'Restrictions on the business and powers',
            description: displayOrEmpty(draft.step7.businessPowersRestrictions),
          },
          {
            name: 'Authorized capital for each class of share',
            description: displayOrEmpty(draft.step7.authorizedCapital),
          },
          {
            name: 'Terms attaching to the preference shares',
            description: displayOrEmpty(draft.step7.preferenceShareTerms),
          },
          {
            name: 'Issued capital that is continued',
            description: displayOrEmpty(draft.step7.issuedCapitalContinued),
          },
          {
            name: 'Restrictions on the allotment, issue or transfer of shares',
            description: displayOrEmpty(draft.step7.shareTransferRestrictions),
          },
        ];

  const declarationRows: ReviewRow[] = [
    {
      name: 'Organized and operated on a co-operative basis',
      description: confirmed(draft.step9.cooperativeBasisConfirmed),
    },
    {
      name: 'Complied with subsection 158(3) or 158.1(3)',
      description: confirmed(draft.step9.subsection158Confirmed),
    },
    {
      name: 'Act under which the continuation was authorized',
      description: originalActLabel(draft.step9.authorizingAct),
    },
  ];
  if (draft.step9.authorizingAct === 'other') {
    declarationRows.push({
      name: 'Specify Act and jurisdiction',
      description: displayOrEmpty(draft.step9.otherActJurisdiction),
    });
  }
  declarationRows.push(
    {
      name: 'Date of the authorization',
      description: formatIsoDateDisplay(draft.step9.authorizationDate),
    },
    {
      name: 'Continued to the same extent as if incorporated under the Co-operative Corporations Act',
      description: confirmed(draft.step9.continuedUnderActConfirmed),
    },
    {
      name: 'Not insolvent',
      description: confirmed(draft.step9.notInsolventConfirmed),
    },
    {
      name: 'Declaration and attestation',
      description: confirmed(draft.step9.attestationConfirmed),
    },
  );

  return [
    {
      key: 'contact',
      caption: 'Cover letter information',
      editHref: coverLetterReviewHref(formId),
      complete: isContactComplete(contact),
      rows: [
        { name: 'Contact name', description: displayOrEmpty(contactName) },
        { name: 'Contact email address', description: displayOrEmpty(contact.email) },
        {
          name: 'Contact phone number',
          description: contact.phoneExtension.trim()
            ? `${displayOrEmpty(contact.phoneNumber)} ext. ${contact.phoneExtension}`
            : displayOrEmpty(contact.phoneNumber),
        },
        { name: 'Contact mailing address', description: 'Not provided' },
      ],
    },
    {
      key: 'corporationDetails',
      caption: 'Corporation details',
      editHref: stepHref(formId, 2),
      complete: Boolean(draft.step2.primaryActivity.trim() && draft.step2.email.trim()),
      rows: [
        {
          name: 'Primary activity',
          description: displayOrEmpty(draft.step2.primaryActivity),
        },
        {
          name: 'Official email address',
          description: displayOrEmpty(draft.step2.email),
        },
      ],
    },
    {
      key: 'cooperativeName',
      caption: 'Co-operative name',
      editHref: stepHref(formId, 3),
      complete: Boolean(proposedName),
      rows: nameRows,
    },
    {
      key: 'originalAct',
      caption: 'Act/jurisdiction and date of incorporation/amalgamation',
      editHref: stepHref(formId, 4),
      complete: Boolean(
        draft.step4.originalAct &&
          (draft.step4.originalAct !== 'other' || draft.step4.otherActJurisdiction.trim()),
      ),
      rows: [
        {
          name: 'Original incorporating Act and jurisdiction',
          description:
            draft.step4.originalAct === 'other'
              ? displayOrEmpty(draft.step4.otherActJurisdiction)
              : originalActLabel(draft.step4.originalAct),
        },
        {
          name: 'Date of incorporation/amalgamation',
          description: formatIsoDateDisplay(OBR_INCORPORATION_DATE),
        },
      ],
    },
    {
      key: 'headOffice',
      caption: 'Head office address',
      editHref: stepHref(formId, 5),
      complete: isHeadOfficeComplete(draft.step5),
      rows: headOfficeRows,
    },
    {
      key: 'directors',
      caption: 'Directors',
      editHref: stepHref(formId, 6),
      complete: isDirectorsComplete(draft.step6),
      rows: directorRows,
      groups: directorGroups,
    },
    {
      key: 'restrictions',
      caption:
        formId === 15
          ? 'Restrictions, member loans and membership fee'
          : 'Restrictions and share capital',
      editHref: stepHref(formId, 7),
      complete: isRestrictionsComplete(formId, draft.step7),
      rows: restrictionRows,
    },
    {
      key: 'membership',
      caption: 'Membership, stakeholder groups and special provisions',
      editHref: stepHref(formId, 8),
      complete: Boolean(
        draft.step8.membershipClasses.trim() &&
          draft.step8.membershipClassTerms.trim() &&
          draft.step8.stakeholderGroups.trim() &&
          draft.step8.stakeholderGroupTerms.trim() &&
          draft.step8.specialProvisions.trim(),
      ),
      rows: [
        {
          name: 'Classes of membership',
          description: displayOrEmpty(draft.step8.membershipClasses),
        },
        {
          name: 'Terms and conditions of each class of membership',
          description: displayOrEmpty(draft.step8.membershipClassTerms),
        },
        {
          name: 'Stakeholder groups',
          description: displayOrEmpty(draft.step8.stakeholderGroups),
        },
        {
          name: 'Terms and conditions of membership in each stakeholder group',
          description: displayOrEmpty(draft.step8.stakeholderGroupTerms),
        },
        {
          name: 'Special provisions',
          description: displayOrEmpty(draft.step8.specialProvisions),
        },
      ],
    },
    {
      key: 'declarations',
      caption: 'Declarations and authorization of continuance',
      editHref: stepHref(formId, 9),
      complete: isDeclarationsComplete(draft.step9),
      rows: declarationRows,
    },
  ];
}

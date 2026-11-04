import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import {
  form11AmalgamatedName,
  form11HeadOfficeLine,
  hasForm11Agreement,
  hasForm11DirectorsComplete,
  hasForm11HeadOffice,
  MIN_AMALGAMATING_NFPS,
  type Form11Draft,
} from './form11DraftStorage';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import {
  displayValue,
  formatMailingAddress,
  formatPersonName,
  type PersonReviewGroup,
} from '../shared/personReviewRows';

export const FORM11_AMALGAMATED_NAME_CAPTION =
  'Name of the amalgamated corporation: (Set out in Block Capital Letters)';
export const FORM11_AGREEMENT_STATEMENT =
  'The amalgamation agreement has been duly approved as required by section 113(3) of the Corporations Act.';
export const FORM11_AMALGAMATING_NAMES_CAPTION =
  'The names of the amalgamating corporations and the dates on which the amalgamation agreement was approved by the shareholders/members of each of the amalgamating corporations are:';
export const FORM11_HEAD_OFFICE_LOCATION_CAPTION = 'The head office is at the:';
export const FORM11_HEAD_OFFICE_ADDRESS_CAPTION = 'The address of the head office is:';
export const FORM11_HEAD_OFFICE_CAPTION =
  'The address of the head office of the amalgamated corporation is:';
export const FORM11_DIRECTORS_CAPTION =
  'The persons who are to be directors of the amalgamated corporation are:';
export const FORM11_DIRECTOR_NAME_COLUMN = 'Name in full';
export const FORM11_DIRECTOR_ADDRESS_COLUMN =
  'Address for service: giving Street & Number, or R.R. Number or Lot & Concession Number, or Lot & Plan Number, and Postal Code (Post Office Box Number not acceptable)';
export const FORM11_CERTIFIED_AGREEMENT_CAPTION =
  'The following is a copy of the amalgamation agreement duly certified under corporate seal by the secretary of each of the amalgamating corporations:';
export const FORM11_SIGNATURE_INTRO = [
  'The corporations named below apply jointly for letters patent confirming the agreement and amalgamating the said corporations.',
  'Names and seals of the amalgamating corporations, full name and signatures and descriptions of office of their proper officers',
] as const;

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey =
  | 'corporation'
  | 'amalgamating'
  | 'amalgamatedName'
  | 'headOffice'
  | 'directors'
  | 'agreement'
  | 'supportingDocuments';

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

function isAmalgamatingComplete(draft: Form11Draft) {
  const named = draft.step3.corporations.filter((entry) => entry.legalName.trim());
  return (
    named.length >= MIN_AMALGAMATING_NFPS &&
    named.every((entry) => entry.ocn.trim() && entry.membersApprovalDate.trim())
  );
}

function isNameComplete(draft: Form11Draft) {
  if (draft.step4.changeName === 'no') {
    return Boolean(form11AmalgamatedName(draft));
  }
  if (draft.step4.changeName === 'yes') {
    return Boolean(
      draft.step4.nameNuans.proposedName.trim() &&
        draft.step4.nameNuans.nuansReports.every((report) => report.file && report.date),
    );
  }
  return false;
}

export function buildReviewSections(draft: Form11Draft): ReviewSection[] {
  const namingOption =
    draft.step4.changeName === 'yes'
      ? 'New corporation name'
      : draft.step4.changeName === 'no'
        ? 'Existing corporation name'
        : 'Not provided';

  const nameRows: ReviewRow[] = [
    { name: 'Selected naming option', description: namingOption },
    {
      name: FORM11_AMALGAMATED_NAME_CAPTION,
      description: displayOrEmpty(form11AmalgamatedName(draft)),
    },
  ];

  if (draft.step4.changeName === 'yes') {
    draft.step4.nameNuans.nuansReports.forEach((report, index, reports) => {
      const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
      nameRows.push(
        {
          name: `Nuans report${ordinal} document`,
          description: report.file?.name ?? 'Not provided',
        files: report.file ? [report.file] : undefined,
        },
        {
          name: `Nuans report${ordinal} date`,
          description: formatIsoDateDisplay(report.date),
        },
      );
    });
  }

  const headOfficeRows: ReviewRow[] = [
    {
      name: FORM11_HEAD_OFFICE_ADDRESS_CAPTION,
      description: displayOrEmpty(form11HeadOfficeLine(draft.step5)),
    },
    {
      name: FORM11_HEAD_OFFICE_LOCATION_CAPTION,
      description: displayOrEmpty(formatHeadOfficeLocation(draft.step5)),
    },
  ];

  const directorRows: ReviewRow[] =
    draft.step6.directors.length === 0
      ? [{ name: 'Directors', description: 'Not provided' }]
      : [];

  const directorGroups: PersonReviewGroup[] = draft.step6.directors.map((director, index) => ({
    key: director.id,
    caption: `Director ${index + 1}`,
    editHref: `/form-11/step-6/directors/${director.id}`,
    rows: [
      { name: 'Name', description: formatPersonName(director) },
      { name: 'Email', description: displayValue(director.email) },
      { name: 'Address for service', description: formatMailingAddress(director.address) },
    ],
  }));

  const supportingRows = draft.step7.additionalDocuments.map((file, index) => ({
    name:
      draft.step7.additionalDocuments.length > 1
        ? `Supporting document ${index + 1}`
        : 'Supporting document',
    description: file.name,
          files: [file],
  }));

  const sections: ReviewSection[] = [
    {
      key: 'corporation',
      caption: 'Corporation details',
      editHref: '/form-11/step-2',
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
      key: 'amalgamating',
      caption: 'Amalgamating corporations',
      editHref: '/form-11/step-3',
      complete: isAmalgamatingComplete(draft),
      rows:
        draft.step3.corporations.length === 0
          ? [{ name: 'Amalgamating corporations', description: 'Not provided' }]
          : [],
      groups: draft.step3.corporations.map((entry, index) => ({
        key: entry.id,
        caption: `Amalgamating corporation ${index + 1}`,
        editHref: `/form-11/step-3/corporations/${entry.id}`,
        rows: [
          { name: 'Name', description: displayOrEmpty(entry.legalName) },
          { name: 'Ontario Corporation Number (OCN)', description: displayOrEmpty(entry.ocn) },
          {
            name: "Date of shareholders/members' approval",
            description: formatIsoDateDisplay(entry.membersApprovalDate),
          },
        ],
      })),
    },
    {
      key: 'amalgamatedName',
      caption: 'Amalgamated corporation name',
      editHref: '/form-11/step-4',
      complete: isNameComplete(draft),
      rows: nameRows,
    },
    {
      key: 'headOffice',
      caption: 'Head office address',
      editHref: '/form-11/step-5',
      complete: hasForm11HeadOffice(draft.step5),
      rows: headOfficeRows,
    },
    {
      key: 'directors',
      caption: 'Directors',
      editHref: '/form-11/step-6',
      complete: hasForm11DirectorsComplete(draft.step6),
      rows: directorRows,
      groups: directorGroups,
    },
    {
      key: 'agreement',
      caption: 'Amalgamation agreement',
      editHref: '/form-11/step-7',
      complete: hasForm11Agreement(draft.step7),
      rows: [
        {
          name: FORM11_CERTIFIED_AGREEMENT_CAPTION,
          description: displayOrEmpty(draft.step7.amalgamationAgreement?.name ?? ''),
          files: draft.step7.amalgamationAgreement
            ? [draft.step7.amalgamationAgreement]
            : undefined,
        },
      ],
    },
  ];

  if (supportingRows.length > 0) {
    sections.push({
      key: 'supportingDocuments',
      caption: 'Supporting documents',
      editHref: '/form-11/step-7',
      complete: true,
      rows: supportingRows,
    });
  }

  return sections;
}

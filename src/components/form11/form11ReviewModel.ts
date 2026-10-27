import {
  formatBytes,
  formatIsoDateDisplay,
  formatUploadedAt,
} from '../form7/form7Labels';
import {
  form11AmalgamatedName,
  form11HeadOfficeLine,
  hasForm11Agreement,
  hasForm11DirectorsComplete,
  hasForm11HeadOffice,
  MIN_AMALGAMATING_NFPS,
  type Form11Draft,
} from './form11DraftStorage';
import {
  displayValue,
  formatMailingAddress,
  formatPersonName,
  formatYesNoAnswer,
  type PersonReviewGroup,
} from '../shared/personReviewRows';

export type ReviewRow = {
  name: string;
  description: string;
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
      name: 'Amalgamated corporation name',
      description: displayOrEmpty(form11AmalgamatedName(draft)),
    },
  ];

  if (draft.step4.changeName === 'yes') {
    draft.step4.nameNuans.nuansReports.forEach((report, index, reports) => {
      const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
      nameRows.push(
        {
          name: `NUANS report${ordinal} document`,
          description: report.file?.name ?? 'Not provided',
        },
        {
          name: `NUANS report${ordinal} date`,
          description: formatIsoDateDisplay(report.date),
        },
      );
    });
  }

  const headOfficeRows: ReviewRow[] = [
    {
      name: 'Head office address',
      description: displayOrEmpty(form11HeadOfficeLine(draft.step5)),
    },
    {
      name: 'Municipality',
      description:
        draft.step5.municipalityStatus.trim() && draft.step5.cityTown.trim()
          ? `${draft.step5.municipalityStatus} of ${draft.step5.cityTown}`
          : 'Not provided',
    },
    {
      name: 'County / region',
      description: draft.step5.countyName.trim()
        ? `${draft.step5.countyStatus} of ${draft.step5.countyName}`.trim()
        : 'Not provided',
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
      { name: 'Also an incorporator', description: formatYesNoAnswer(director.alsoIncorporator) },
      { name: 'Address for service', description: formatMailingAddress(director.address) },
    ],
  }));

  const supportingRows = draft.step7.additionalDocuments.map((file, index) => ({
    name:
      draft.step7.additionalDocuments.length > 1
        ? `Supporting document ${index + 1}`
        : 'Supporting document',
    description: `${file.name}\nUploaded ${formatUploadedAt(file.uploadedAt)}\n${formatBytes(file.size)}`,
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
      caption: 'Registered head office address',
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
          name: 'Copy of the amalgamation agreement',
          description: displayOrEmpty(draft.step7.amalgamationAgreement),
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

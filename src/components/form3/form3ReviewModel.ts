import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import { validateNameFormat } from '../form1/nameFormatRules';
import { PERMITTED_LEGAL_ELEMENTS } from '../form2/nameValidation';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { validateNameNuansFields } from '../form7/ProposedNameAndNuans';
import type { Form3Draft } from './form3DraftStorage';

/** Same legal-element list as Form 2, worded for a corporation name. */
export const FORM3_CORP_NAME_INFO =
  'The name of the corporation must end with one of the following legal elements: “INCORPORATED”, “INCORPORÉE”, “CORPORATION”, “INC.” or “CORP.”.';

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey = 'corporation' | 'nameChange' | 'provisions';

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

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function endsWithForm3LegalElement(normalized: string) {
  return PERMITTED_LEGAL_ELEMENTS.some((element) => {
    const needle = element.toUpperCase();
    return (
      normalized === needle ||
      normalized.endsWith(` ${needle}`) ||
      normalized.endsWith(needle)
    );
  });
}

export function validateForm3CorpName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Enter the corporation name.';
  }

  const formatError = validateNameFormat(trimmed);
  if (formatError) {
    return formatError;
  }

  const normalized = normalizeName(trimmed);
  if (!endsWithForm3LegalElement(normalized)) {
    return FORM3_CORP_NAME_INFO;
  }

  return undefined;
}

function isNameChangeComplete(draft: Form3Draft) {
  const change = draft.nameChange;
  if (change.changeCorporationName === 'no') {
    return true;
  }
  if (change.changeCorporationName !== 'change') {
    return false;
  }
  return (
    Object.keys(
      validateNameNuansFields(change.nameNuans, 'corporation', validateForm3CorpName),
    ).length === 0
  );
}

function isProvisionsComplete(draft: Form3Draft) {
  return Boolean(
    draft.step4.resolutionConfirmedDate && draft.step4.requestedProvisions.trim(),
  );
}

export function buildReviewSections(draft: Form3Draft): ReviewSection[] {
  const change = draft.nameChange;
  const nameRows: ReviewRow[] =
    change.changeCorporationName === 'no'
      ? [{ name: 'Name change', description: 'No corporation name change requested.' }]
      : [
          {
            name: 'Name change indicator',
            description: change.changeCorporationName === 'change' ? 'Yes' : 'Not provided',
          },
          {
            name: 'The name of the corporation is changed to (if applicable): (Set out in Block Capital Letters)',
            description: displayOrEmpty(change.nameNuans.proposedName),
          },
          ...change.nameNuans.nuansReports.flatMap((report, index, reports) => {
            const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
            return [
              {
                name: `NUANS report${ordinal}`,
                description: report.file?.name ?? 'Not provided',
        files: report.file ? [report.file] : undefined,
              },
              {
                name: `NUANS report${ordinal} date`,
                description: formatIsoDateDisplay(report.date),
              },
            ];
          }),
        ];

  const provisionRows: ReviewRow[] = [
    {
      name: 'The resolution authorizing this application was confirmed by the shareholders/members of the corporation on:',
      description: formatIsoDateDisplay(draft.step4.resolutionConfirmedDate),
    },
    {
      name: 'The corporation applies for the issue of supplementary letters patent to provide as follows:',
      description: displayOrEmpty(draft.step4.requestedProvisions),
    },
    ...(draft.step4.additional.length === 0
      ? [{ name: 'Supporting documents', description: 'None uploaded' }]
      : draft.step4.additional.map((file, index) => ({
          name:
            draft.step4.additional.length > 1
              ? `Supporting document ${index + 1}`
              : 'Supporting document',
          description: file.name,
          files: [file],
        }))),
  ];

  return [
    {
      key: 'corporation',
      caption: 'Corporation information',
      editHref: '/form-3/step-2',
      complete: Boolean(draft.step1.corporationName && draft.step1.primaryActivity.trim()),
      rows: [
        {
          name: 'Name of the applicant corporation: (Set out in Block Capital Letters)',
          description: displayOrEmpty(draft.step1.corporationName),
        },
        {
          name: 'Date of incorporation/amalgamation:',
          description: formatIsoDateDisplay(draft.step1.incorporationDate),
        },
      ],
    },
    {
      key: 'nameChange',
      caption: 'Name change information',
      editHref: '/form-3/step-3',
      complete: isNameChangeComplete(draft),
      rows: nameRows,
    },
    {
      key: 'provisions',
      caption: 'Supplementary letters patent information',
      editHref: '/form-3/step-4',
      complete: isProvisionsComplete(draft),
      rows: provisionRows,
    },
  ];
}

import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { validateCooperativeName } from '../form2/nameValidation';
import { validateNameNuansFields } from '../form7/ProposedNameAndNuans';
import type { PersonReviewGroup } from '../shared/personReviewRows';
import {
  MIN_AMALGAMATING_COOPS,
  type Form10Draft,
  type SupportingDocMeta,
} from './form10DraftStorage';

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey =
  | 'coopDetails'
  | 'amalgamatingCooperatives'
  | 'nameChange'
  | 'supportingDocs';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
  /** Per-entry summary lists, each with its own h2, rendered after `rows`. */
  groups?: PersonReviewGroup[];
};

function displayOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed || 'Not provided';
}

function docFields(docs: SupportingDocMeta[], emptyLabel: string) {
  if (docs.length === 0) {
    return { description: emptyLabel };
  }
  return { description: docs.map((doc) => doc.name).join('\n'), files: docs };
}

function isCoopDetailsComplete(draft: Form10Draft) {
  return Boolean(
    draft.step1.primaryActivity.trim() &&
      draft.step1.email.trim() &&
      draft.step1.cooperativeType.trim(),
  );
}

function isAmalgamatingComplete(draft: Form10Draft) {
  return (
    draft.step2.agreementApproved &&
    draft.step2.amalgamatingCooperatives.length >= MIN_AMALGAMATING_COOPS &&
    draft.step2.amalgamatingCooperatives.every(
      (coop) =>
        coop.legalName.trim() &&
        coop.ocn.trim() &&
        coop.membersApprovalDate.trim(),
    )
  );
}

function selectedAmalgamatedCooperativeName(draft: Form10Draft) {
  return (
    draft.step2.amalgamatingCooperatives.find(
      (coop) => coop.id === draft.nameChange.selectedAmalgamatedCooperativeId,
    )?.legalName.trim() ?? ''
  );
}

function isNameChangeComplete(draft: Form10Draft) {
  if (!draft.nameChange.changeCooperativeName) {
    return false;
  }
  if (draft.nameChange.changeCooperativeName === 'no') {
    return Boolean(selectedAmalgamatedCooperativeName(draft));
  }
  return (
    Object.keys(
      validateNameNuansFields(
        draft.nameChange.nameNuans,
        'cooperative',
        validateCooperativeName,
      ),
    ).length === 0
  );
}

function isSupportingDocsComplete(draft: Form10Draft) {
  if (draft.step3.certifiedAgreement.length !== 1) {
    return false;
  }
  return draft.step2.amalgamatingCooperatives.every((coop) => {
    const row = draft.step3.documentsByCooperative.find(
      (doc) => doc.cooperativeId === coop.id,
    );
    return (row?.affidavits.length ?? 0) === 2;
  });
}

export function buildReviewSections(draft: Form10Draft): ReviewSection[] {
  const amalgamatingRows: ReviewRow[] = [
    {
      name: 'Amalgamation agreement confirmation',
      description: draft.step2.agreementApproved
        ? 'The amalgamation agreement has been duly approved as required by section 156 of the Co-operative Corporations Act.'
        : 'Not confirmed',
    },
  ];

  const amalgamatingGroups: PersonReviewGroup[] = draft.step2.amalgamatingCooperatives.map(
    (coop, index) => ({
      key: coop.id,
      caption: `Amalgamating co-operative ${index + 1}`,
      editHref: `/form-10/step-3/cooperatives/${coop.id}`,
      rows: [
        { name: 'Name', description: displayOrEmpty(coop.legalName) },
        { name: 'Ontario Corporation Number (OCN)', description: displayOrEmpty(coop.ocn) },
        {
          name: 'Date of members’ approval',
          description: coop.membersApprovalDate
            ? formatIsoDateDisplay(coop.membersApprovalDate)
            : 'Not provided',
        },
      ],
    }),
  );

  const supportingRows: ReviewRow[] = [
    {
      name: 'Certified copy of the amalgamation agreement',
      ...docFields(draft.step3.certifiedAgreement, 'Not uploaded'),
    },
  ];
  draft.step2.amalgamatingCooperatives.forEach((coop, index) => {
    const row = draft.step3.documentsByCooperative.find(
      (doc) => doc.cooperativeId === coop.id,
    );
    const label = coop.legalName.trim() || `Co-operative ${index + 1}`;
    supportingRows.push({
      name: `${label} — Affidavit of solvency 1`,
      ...docFields(row?.affidavits[0] ? [row.affidavits[0]] : [], 'Not uploaded'),
    });
    supportingRows.push({
      name: `${label} — Affidavit of solvency 2`,
      ...docFields(row?.affidavits[1] ? [row.affidavits[1]] : [], 'Not uploaded'),
    });
  });

  return [
    {
      key: 'coopDetails',
      caption: 'Co-operative details',
      editHref: '/form-10/step-2',
      complete: isCoopDetailsComplete(draft),
      rows: [
        {
          name: 'Co-operative legal name',
          description: displayOrEmpty(draft.step1.cooperativeName),
        },
        {
          name: 'Ontario Corporation Number (OCN)',
          description: displayOrEmpty(draft.step1.ocn),
        },
        {
          name: 'Primary activity',
          description: displayOrEmpty(draft.step1.primaryActivity),
        },
        {
          name: 'Type of co-operative',
          description: displayOrEmpty(draft.step1.cooperativeType),
        },
        {
          name: 'Official email',
          description: displayOrEmpty(draft.step1.email),
        },
      ],
    },
    {
      key: 'amalgamatingCooperatives',
      caption: 'Amalgamating co-operatives',
      editHref: '/form-10/step-3',
      complete: isAmalgamatingComplete(draft),
      rows: amalgamatingRows,
      groups: amalgamatingGroups,
    },
    {
      key: 'nameChange',
      caption: 'Co-operative name',
      editHref: '/form-10/step-4',
      complete: isNameChangeComplete(draft),
      rows:
        draft.nameChange.changeCooperativeName === 'change'
          ? [
              {
                name: 'Change co-operative name',
                description: 'Yes',
              },
              {
                name: 'New co-operative name (proposed)',
                description: displayOrEmpty(draft.nameChange.nameNuans.proposedName),
              },
              ...draft.nameChange.nameNuans.nuansReports.flatMap((report, index, reports) => {
                const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
                return [
                  {
                    name: `NUANS report${ordinal}`,
                    description: report.file?.name ?? 'Not uploaded',
                    files: report.file ? [report.file] : undefined,
                  },
                  {
                    name: `NUANS report${ordinal} date`,
                    description: report.date ? formatIsoDateDisplay(report.date) : 'Not provided',
                  },
                ];
              }),
            ]
          : [
              {
                name: 'Change co-operative name',
                description:
                  draft.nameChange.changeCooperativeName === 'no' ? 'No' : 'Not provided',
              },
              ...(draft.nameChange.changeCooperativeName === 'no'
                ? [
                    {
                      name: 'Amalgamated co-operative name',
                      description: displayOrEmpty(
                        selectedAmalgamatedCooperativeName(draft),
                      ),
                    },
                  ]
                : []),
            ],
    },
    {
      key: 'supportingDocs',
      caption: 'Supporting documents',
      editHref: '/form-10/step-5',
      complete: isSupportingDocsComplete(draft),
      rows: supportingRows,
    },
  ];
}

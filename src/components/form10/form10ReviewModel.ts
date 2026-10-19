import { formatBytes, formatIsoDateDisplay } from '../form7/form7Labels';
import {
  MIN_AMALGAMATING_COOPS,
  type Form10Draft,
  type SupportingDocMeta,
} from './form10DraftStorage';

export type ReviewRow = {
  name: string;
  description: string;
};

export type ReviewSectionKey =
  | 'coopDetails'
  | 'amalgamatingCooperatives'
  | 'supportingDocs';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
};

function displayOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed || 'Not provided';
}

function docLabel(docs: SupportingDocMeta[], emptyLabel: string) {
  if (docs.length === 0) {
    return emptyLabel;
  }
  return docs
    .map(
      (doc) =>
        `${doc.name} (${formatBytes(doc.size)}${
          doc.uploadedAt ? `, ${formatIsoDateDisplay(doc.uploadedAt.slice(0, 10))}` : ''
        })`,
    )
    .join('\n');
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

function isSupportingDocsComplete(draft: Form10Draft) {
  return draft.step2.amalgamatingCooperatives.every((coop) => {
    const row = draft.step3.documentsByCooperative.find(
      (doc) => doc.cooperativeId === coop.id,
    );
    return (
      (row?.certifiedAgreement.length ?? 0) === 1 &&
      (row?.affidavits.length ?? 0) === 2
    );
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
    {
      name: 'Amalgamated co-operative name',
      description: displayOrEmpty(draft.step1.cooperativeName),
    },
  ];

  draft.step2.amalgamatingCooperatives.forEach((coop, index) => {
    amalgamatingRows.push(
      {
        name: `Amalgamating co-operative ${index + 1} — Name`,
        description: displayOrEmpty(coop.legalName),
      },
      {
        name: `Amalgamating co-operative ${index + 1} — OCN`,
        description: displayOrEmpty(coop.ocn),
      },
      {
        name: `Amalgamating co-operative ${index + 1} — Dates of Members’ Approval`,
        description: coop.membersApprovalDate
          ? formatIsoDateDisplay(coop.membersApprovalDate)
          : 'Not provided',
      },
    );
  });

  const supportingRows: ReviewRow[] = [];
  draft.step2.amalgamatingCooperatives.forEach((coop, index) => {
    const row = draft.step3.documentsByCooperative.find(
      (doc) => doc.cooperativeId === coop.id,
    );
    const label = coop.legalName.trim() || `Co-operative ${index + 1}`;
    supportingRows.push({
      name: `${label} — Certified Copy of the Amalgamation Agreement`,
      description: docLabel(row?.certifiedAgreement ?? [], 'Not uploaded'),
    });
    supportingRows.push({
      name: `${label} — Affidavit of Solvency #1`,
      description: row?.affidavits[0]
        ? docLabel([row.affidavits[0]], 'Not uploaded')
        : 'Not uploaded',
    });
    supportingRows.push({
      name: `${label} — Affidavit of Solvency #2`,
      description: row?.affidavits[1]
        ? docLabel([row.affidavits[1]], 'Not uploaded')
        : 'Not uploaded',
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
    },
    {
      key: 'supportingDocs',
      caption: 'Supporting documents',
      editHref: '/form-10/step-4',
      complete: isSupportingDocsComplete(draft),
      rows: supportingRows,
    },
  ];
}

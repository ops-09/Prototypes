import type { ReviewFileLink } from '../shared/uploadedFilePreview';
import { validateCooperativeName } from '../form1/nameValidation';
import {
  validateCorporationName,
  validateNfpCorporationName,
} from './corpNameValidation';
import {
  affidavitsRequired,
  type Form7Draft,
  type Form7NameLanguage,
  type NameNuansFields,
  type SupportingDocMeta,
} from './form7DraftStorage';
import { amendmentTypeLabel, formatIsoDateDisplay } from './form7Labels';
import { validateNameNuansFields } from './ProposedNameAndNuans';

export type ReviewRow = {
  name: string;
  description: string;
  files?: ReviewFileLink[];
};

export type ReviewSectionKey = 'coopDetails' | 'amendmentDetails' | 'supportingDocs';

export type ReviewSection = {
  key: ReviewSectionKey;
  caption: string;
  editHref: string;
  complete: boolean;
  rows: ReviewRow[];
};

const LANGUAGE_LABELS: Record<Exclude<Form7NameLanguage, ''>, string> = {
  english: 'English name',
  french: 'French name',
  combined: 'Combination of English and French',
  separate: 'English and French names used separately',
};

function displayOrEmpty(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : 'Not provided';
}

function yesNo(value: 'yes' | 'no' | '') {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  return 'Not provided';
}

function nuansRows(
  fields: NameNuansFields,
  prefix = '',
  proposedNameLabel?: string,
): ReviewRow[] {
  const labelPrefix = prefix ? `${prefix} ` : '';
  const rows: ReviewRow[] = [
    {
      name: proposedNameLabel ?? `${labelPrefix}Proposed name`.trim(),
      description: displayOrEmpty(fields.proposedName),
    },
  ];

  const reports = fields.nuansReports ?? [];
  if (reports.length === 0) {
    rows.push(
      {
        name: `${labelPrefix}NUANS report`.trim(),
        description: 'Not provided',
      },
      {
        name: `${labelPrefix}NUANS report date`.trim(),
        description: 'Not provided',
      },
    );
    return rows;
  }

  reports.forEach((report, index) => {
    const ordinal = reports.length > 1 ? ` ${index + 1}` : '';
    rows.push(
      {
        name: `${labelPrefix}NUANS report${ordinal}`.trim(),
        description: report.file?.name ?? 'Not provided',
        files: report.file ? [report.file] : undefined,
      },
      {
        name: `${labelPrefix}NUANS report${ordinal} date`.trim(),
        description: formatIsoDateDisplay(report.date),
      },
    );
  });

  return rows;
}

function isNameNuansComplete(
  fields: NameNuansFields,
  kind: 'cooperative' | 'corporation' | 'nfp',
) {
  const validateName =
    kind === 'cooperative'
      ? validateCooperativeName
      : kind === 'nfp'
        ? validateNfpCorporationName
        : validateCorporationName;
  return Object.keys(validateNameNuansFields(fields, kind, validateName)).length === 0;
}

function docRows(docs: SupportingDocMeta[], label: string): ReviewRow[] {
  if (docs.length === 0) {
    return [{ name: label, description: 'Not provided' }];
  }
  return docs.map((doc, index) => ({
    name: docs.length > 1 ? `${label} (${index + 1})` : label,
    description: doc.name,
    files: [doc],
  }));
}

export function buildAmendmentRows(draft: Form7Draft): ReviewRow[] {
  const { step2 } = draft;
  const type = step2.amendmentType;
  const rows: ReviewRow[] = [
    {
      name: 'Amendment type',
      description: amendmentTypeLabel(type),
    },
  ];

  if (type === 'change-name') {
    rows.push({
      name: 'Change co-operative name',
      description:
        step2.changeCooperativeName === 'change'
          ? 'Yes'
          : step2.changeCooperativeName === 'no'
            ? 'No'
            : 'Not provided',
    });
    if (step2.changeCooperativeName === 'change') {
      rows.push(
        ...nuansRows(
          step2.nameNuans,
          'Co-operative',
          'The name of the co-operative is: (Set out in Block Capital Letters)',
        ),
      );
    }
    return rows;
  }

  if (type === 'convert-business-corp') {
    rows.push({
      name: 'Number name',
      description: yesNo(step2.hasNumberName),
    });
    if (step2.hasNumberName === 'yes') {
      rows.push({
        name: 'Legal element',
        description: displayOrEmpty(step2.legalElement),
      });
    } else if (step2.hasNumberName === 'no') {
      rows.push({
        name: 'Name language',
        description: step2.nameLanguage
          ? LANGUAGE_LABELS[step2.nameLanguage]
          : 'Not provided',
      });
      if (step2.nameLanguage === 'separate') {
        rows.push({
          name: 'Corporation proposed name (French)',
          description: displayOrEmpty(step2.proposedNameFr),
        });
      }
      rows.push(
        ...nuansRows(
          step2.nameNuans,
          'Corporation',
          'The name of the co-operative is: (Set out in Block Capital Letters)',
        ),
      );
    }
    return rows;
  }

  if (type === 'convert-not-for-profit') {
    rows.push({
      name: 'Number name',
      description: yesNo(step2.hasNumberName),
    });
    if (step2.hasNumberName === 'no') {
      rows.push({
        name: 'Name language',
        description: step2.nameLanguage
          ? LANGUAGE_LABELS[step2.nameLanguage]
          : 'Not provided',
      });
      if (step2.nameLanguage === 'separate') {
        rows.push({
          name: 'Not-for-Profit proposed name (French)',
          description: displayOrEmpty(step2.proposedNameFr),
        });
      }
      rows.push(
        ...nuansRows(
          step2.nameNuans,
          'Not-for-Profit',
          'The name of the co-operative is: (Set out in Block Capital Letters)',
        ),
      );
    }
    return rows;
  }

  if (type === 'reduction-capital') {
    rows.push(
      {
        name: 'Revised authorized capital structure',
        description: displayOrEmpty(step2.capitalReductionDescription),
      },
      {
        name: 'Capital reduction details',
        description: displayOrEmpty(step2.capitalReductionDetails),
      },
    );
    return rows;
  }

  if (type === 'amend-other') {
    rows.push({
      name: 'Proposed amendment details',
      description: displayOrEmpty(step2.otherAmendmentDetails),
    });
  }

  return rows;
}

function isAmendmentComplete(draft: Form7Draft) {
  const { step2 } = draft;
  const type = step2.amendmentType;
  if (!type) {
    return false;
  }

  if (type === 'change-name') {
    if (!step2.changeCooperativeName) {
      return false;
    }
    if (step2.changeCooperativeName === 'no') {
      return true;
    }
    return isNameNuansComplete(step2.nameNuans, 'cooperative');
  }

  if (type === 'convert-business-corp') {
    if (!step2.hasNumberName) {
      return false;
    }
    if (step2.hasNumberName === 'yes') {
      return Boolean(step2.legalElement.trim());
    }
    if (!step2.nameLanguage) {
      return false;
    }
    if (
      step2.nameLanguage === 'separate' &&
      Boolean(validateCorporationName(step2.proposedNameFr))
    ) {
      return false;
    }
    return isNameNuansComplete(step2.nameNuans, 'corporation');
  }

  if (type === 'convert-not-for-profit') {
    if (!step2.hasNumberName) {
      return false;
    }
    if (step2.hasNumberName === 'yes') {
      return true;
    }
    if (!step2.nameLanguage) {
      return false;
    }
    if (
      step2.nameLanguage === 'separate' &&
      Boolean(validateNfpCorporationName(step2.proposedNameFr))
    ) {
      return false;
    }
    return isNameNuansComplete(step2.nameNuans, 'nfp');
  }

  if (type === 'reduction-capital') {
    return Boolean(
      step2.capitalReductionDescription.trim() || step2.capitalReductionDetails.trim(),
    );
  }

  if (type === 'amend-other') {
    return Boolean(step2.otherAmendmentDetails.trim());
  }

  return false;
}

function isSupportingDocsComplete(draft: Form7Draft) {
  const needAffidavits = affidavitsRequired(
    draft.step2.amendmentType,
    draft.step2.changeCooperativeName,
  );
  if (draft.step3.authorizationSubsections.length === 0) {
    return false;
  }
  if (draft.step3.certifiedResolution.length === 0) {
    return false;
  }
  if (needAffidavits && draft.step3.affidavits.length === 0) {
    return false;
  }
  if (!draft.step3.resolutionConfirmedDate) {
    return false;
  }
  return true;
}

function isCoopDetailsComplete(draft: Form7Draft) {
  const s = draft.step1;
  return Boolean(
    s.cooperativeName.trim() &&
      s.ocn.trim() &&
      s.cooperativeType.trim() &&
      s.primaryActivity.trim() &&
      s.email.trim() &&
      draft.step2.amendmentType,
  );
}

export function buildReviewSections(draft: Form7Draft): ReviewSection[] {
  const needAffidavits = affidavitsRequired(
    draft.step2.amendmentType,
    draft.step2.changeCooperativeName,
  );

  const supportingRows: ReviewRow[] = [
    ...docRows(draft.step3.certifiedResolution, 'The following is a certified copy of the resolution amending the articles of the co-operative:'),
    {
      name: 'The above amendment has been duly authorized as required by subsections 151(1), (2), (2.1), (3) and/or (4) of the Co-operative Corporations Act. Please choose the applicable subsections below:',
      description:
        draft.step3.authorizationSubsections.length > 0
          ? draft.step3.authorizationSubsections.join(', ')
          : 'Not provided',
    },
    {
      name: 'The resolution authorizing the amendment was confirmed by the members of the co-operative',
      description: formatIsoDateDisplay(draft.step3.resolutionConfirmedDate),
    },
  ];
  if (needAffidavits) {
    supportingRows.push(...docRows(draft.step3.affidavits, 'Affidavit of solvency'));
  }
  if (draft.step3.additional.length > 0) {
    supportingRows.push(...docRows(draft.step3.additional, 'Additional document'));
  }

  return [
    {
      key: 'coopDetails',
      caption: 'Co-operative details',
      editHref: '/form-7/step-2',
      complete: isCoopDetailsComplete(draft),
      rows: [
        {
          name: 'The name of the co-operative is: (Set out in Block Capital Letters)',
          description: displayOrEmpty(draft.step1.cooperativeName),
        },
        {
          name: 'Date of incorporation/amalgamation:',
          description: formatIsoDateDisplay(draft.step1.incorporationDate),
        },
        {
          name: 'Ontario Corporation Number (OCN)',
          description: displayOrEmpty(draft.step1.ocn),
        },
        {
          name: 'Type of co-operative',
          description: displayOrEmpty(draft.step1.cooperativeType),
        },
        {
          name: 'Amendment type',
          description: amendmentTypeLabel(draft.step2.amendmentType),
        },
        {
          name: 'Primary activity',
          description: displayOrEmpty(draft.step1.primaryActivity),
        },
        {
          name: 'Official email',
          description: displayOrEmpty(draft.step1.email),
        },
      ],
    },
    {
      key: 'amendmentDetails',
      caption: 'Amendment details',
      editHref: '/form-7/step-3',
      complete: isAmendmentComplete(draft),
      rows: buildAmendmentRows(draft),
    },
    {
      key: 'supportingDocs',
      caption: 'Supporting documents',
      editHref: '/form-7/step-4',
      complete: isSupportingDocsComplete(draft),
      rows: supportingRows,
    },
  ];
}

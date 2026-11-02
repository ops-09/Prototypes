import { formatIsoDateDisplay } from '../form7/form7Labels';
import {
  NOT_PROVIDED,
  openArticlesPdf,
  tableHtml,
  valueHtml,
} from '../shared/articlesPdf';
import type { Form10Draft } from './form10DraftStorage';
import {
  amalgamatedCooperativeName,
  FORM10_AMALGAMATED_NAME_CAPTION,
  FORM10_AMALGAMATING_NAMES_CAPTION,
  FORM10_SIGNATURE_INTRO,
} from './form10ReviewModel';

function formatPdfName(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : NOT_PROVIDED;
}

export function generateForm10ReviewPdf(args: { draft: Form10Draft }) {
  const { draft } = args;
  const amalgamatedName = amalgamatedCooperativeName(draft);
  const coopRows = draft.step2.amalgamatingCooperatives.map((coop) => [
    formatPdfName(coop.legalName),
    coop.ocn.trim() || NOT_PROVIDED,
    coop.membersApprovalDate
      ? formatIsoDateDisplay(coop.membersApprovalDate)
      : NOT_PROVIDED,
  ]);
  const signatureRows = draft.step2.amalgamatingCooperatives.flatMap((coop) => {
    const coopName = formatPdfName(coop.legalName);
    const nameValue = coopName === NOT_PROVIDED ? '' : coopName;
    return [
      [nameValue, ''],
      [nameValue, ''],
    ];
  });

  return openArticlesPdf({
    documentTitle: 'Articles of Amalgamation, Form 10',
    titleLines: ['Articles of Amalgamation', 'Form 10'],
    items: [
      [FORM10_AMALGAMATED_NAME_CAPTION, valueHtml(amalgamatedName.toUpperCase())],
      [
        FORM10_AMALGAMATING_NAMES_CAPTION,
        tableHtml(
          ['Name', 'Ontario Corporation Number', 'Date of members’ approval'],
          coopRows,
        ),
      ],
    ],
    signatureIntro: [...FORM10_SIGNATURE_INTRO],
    signatureCaptions: [
      'Name of amalgamating co-operative',
      'Description of office',
    ],
    signatureRows: signatureRows.length > 0 ? signatureRows : [['', '']],
  });
}

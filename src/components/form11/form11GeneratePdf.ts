import { formatIsoDateDisplay } from '../form7/form7Labels';
import { formatMailingAddress, formatPersonName } from '../shared/personReviewRows';
import {
  NOT_PROVIDED,
  openArticlesPdf,
  tableHtml,
  valueHtml,
} from '../shared/articlesPdf';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import {
  form11AmalgamatedName,
  form11HeadOfficeLine,
  type Form11Draft,
} from './form11DraftStorage';
import {
  FORM11_AMALGAMATED_NAME_CAPTION,
  FORM11_AMALGAMATING_NAMES_CAPTION,
  FORM11_DIRECTORS_CAPTION,
  FORM11_HEAD_OFFICE_ADDRESS_CAPTION,
  FORM11_HEAD_OFFICE_LOCATION_CAPTION,
  FORM11_SIGNATURE_INTRO,
} from './form11ReviewModel';

function formatPdfName(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : NOT_PROVIDED;
}

export function generateForm11ReviewPdf(args: { draft: Form11Draft }) {
  const { draft } = args;
  const amalgamatedName = form11AmalgamatedName(draft);
  const corpRows = draft.step3.corporations.map((corp) => [
    formatPdfName(corp.legalName),
    corp.ocn.trim() || NOT_PROVIDED,
    corp.membersApprovalDate
      ? formatIsoDateDisplay(corp.membersApprovalDate)
      : NOT_PROVIDED,
  ]);
  const directorRows = draft.step6.directors.map((director) => {
    const name = formatPersonName(director);
    return [
      name === NOT_PROVIDED ? NOT_PROVIDED : name.toUpperCase(),
      formatMailingAddress(director.address),
    ];
  });
  const signatureRows = draft.step3.corporations.flatMap((corp) => {
    const corpName = formatPdfName(corp.legalName);
    const nameValue = corpName === NOT_PROVIDED ? '' : corpName;
    return [
      [nameValue, ''],
      [nameValue, ''],
    ];
  });

  return openArticlesPdf({
    documentTitle: 'Application for Letters Patent of Amalgamation, Form 11',
    titleLines: ['Application for Letters Patent', 'of Amalgamation', 'Form 11'],
    actName: 'Corporations Act',
    items: [
      [FORM11_AMALGAMATED_NAME_CAPTION, valueHtml(amalgamatedName.toUpperCase())],
      [
        FORM11_AMALGAMATING_NAMES_CAPTION,
        tableHtml(
          ['Name', 'OCN', 'Date of shareholders/members’ approval'],
          corpRows,
        ),
      ],
      [
        FORM11_HEAD_OFFICE_LOCATION_CAPTION,
        valueHtml(formatHeadOfficeLocation(draft.step5)),
      ],
      [
        FORM11_HEAD_OFFICE_ADDRESS_CAPTION,
        valueHtml(form11HeadOfficeLine(draft.step5)),
      ],
      [
        FORM11_DIRECTORS_CAPTION,
        tableHtml(['Name', 'Address for service'], directorRows),
      ],
    ],
    signatureIntro: [...FORM11_SIGNATURE_INTRO],
    signatureCaptions: [
      'Name of amalgamating corporation',
      'Description of office',
    ],
    signatureRows: signatureRows.length > 0 ? signatureRows : [['', '']],
  });
}

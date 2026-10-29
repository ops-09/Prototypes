import {
  NOT_PROVIDED,
  openArticlesPdf,
  tableHtml,
  valueHtml,
  type ArticlesPdfItem,
} from '../shared/articlesPdf';
import type { Form7Draft } from './form7DraftStorage';
import { formatIsoDateDisplay } from './form7Labels';
import { buildAmendmentRows } from './form7ReviewModel';

/** Online-flow answers and attachments that are not part of the filed articles. */
function isArticlesRow(name: string) {
  return !name.includes('NUANS') && name !== 'Change co-operative name';
}

function buildItems(draft: Form7Draft): ArticlesPdfItem[] {
  const { step1, step3 } = draft;
  const amendmentRows = buildAmendmentRows(draft)
    .filter((row) => isArticlesRow(row.name))
    .map((row) => [row.name, row.description]);

  return [
    [
      'The name of the co-operative is: (Set out in Block Capital Letters)',
      valueHtml(step1.cooperativeName.toUpperCase()),
    ],
    ['Date of incorporation/amalgamation:', valueHtml(formatIsoDateDisplay(step1.incorporationDate))],
    [
      'The following is a certified copy of the resolution amending the articles of the co-operative:',
      tableHtml(['Amendment', 'Details'], amendmentRows),
    ],
    [
      'The above amendment has been duly authorized as required by subsections 151(1), (2), (2.1), (3) and/or (4) of the Co-operative Corporations Act. Please choose the applicable subsections below:',
      valueHtml(step3.authorizationSubsections.join(', ')),
    ],
    [
      'The resolution authorizing the amendment was confirmed by the members of the co-operative',
      valueHtml(
        step3.resolutionConfirmedDate
          ? formatIsoDateDisplay(step3.resolutionConfirmedDate)
          : NOT_PROVIDED,
      ),
    ],
  ];
}

export function generateForm7ReviewPdf(args: { draft: Form7Draft }) {
  const { draft } = args;
  return openArticlesPdf({
    documentTitle: 'Articles of Amendment, Form 7',
    titleLines: ['Articles of Amendment', 'Form 7'],
    items: buildItems(draft),
    signatureIntro: ['This application is executed in duplicate.'],
    signatureCaptions: ['Name', 'Description of office'],
    // Articles of Amendment typically require two authorizing signatures.
    signatureRows: [[], []],
  });
}

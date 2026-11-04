import {
  NOT_PROVIDED,
  escapeHtml,
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
  return !/nuans/i.test(name) && name !== 'Change co-operative name';
}

function isChangingCooperativeName(draft: Form7Draft) {
  return (
    draft.step2.amendmentType === 'change-name' &&
    draft.step2.changeCooperativeName === 'change'
  );
}

function buildItems(draft: Form7Draft): ArticlesPdfItem[] {
  const { step1, step3 } = draft;
  const changingName = isChangingCooperativeName(draft);
  const cooperativeName = changingName
    ? draft.step2.nameNuans.proposedName
    : step1.cooperativeName;
  const amendmentRows = buildAmendmentRows(draft)
    .filter((row) => isArticlesRow(row.name))
    .map((row) => [row.name, row.description]);

  const items: ArticlesPdfItem[] = [
    [
      'The name of the co-operative is:',
      valueHtml(cooperativeName.toUpperCase()),
    ],
    ['Date of incorporation/amalgamation:', valueHtml(formatIsoDateDisplay(step1.incorporationDate))],
  ];

  if (!changingName) {
    items.push([
      'Amendment details',
      tableHtml(['Amendment', 'Details'], amendmentRows),
    ]);
  }

  const resolutionText = step3.certifiedResolutionText?.trim() ?? '';
  items.push([
    'The following is a certified copy of the resolution amending the articles of the co-operative:',
    valueHtml(resolutionText, ''),
  ]);

  items.push(
    [
      'The above amendment has been duly authorized as required by subsections 151(1), (2), (2.1), (3) and/or (4) of the Co-operative Corporations Act. Please choose the applicable subsections below:',
      valueHtml(step3.authorizationSubsections.join(', ')),
    ],
    [
      'The resolution authorizing the amendment was confirmed by the members of the co-operative on:',
      valueHtml(
        step3.resolutionConfirmedDate
          ? formatIsoDateDisplay(step3.resolutionConfirmedDate)
          : NOT_PROVIDED,
      ),
    ],
    [
      'These articles are executed for delivery to the Minister.',
      `
    <div class="certified-block">
      <p class="certified-label">Certified</p>
      <div class="certified-name"></div>
      <span class="certified-caption">(Name of Co-operative)</span>
      <p class="certified-by">By:</p>
    </div>`,
    ],
  );

  return items;
}

export function generateForm7ReviewPdf(args: { draft: Form7Draft }) {
  const { draft } = args;
  return openArticlesPdf({
    documentTitle: 'Articles of Amendment, Form 7',
    titleLines: ['Articles of Amendment', 'Form 7'],
    items: buildItems(draft),
    signatureIntro: [],
    signatureHeading: '',
    signatureCaptions: ['Name', 'Description of office'],
    signatureRows: [[], []],
  });
}

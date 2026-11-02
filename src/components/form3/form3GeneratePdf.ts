import {
  NOT_APPLICABLE,
  openArticlesPdf,
  valueHtml,
  type ArticlesPdfItem,
} from '../shared/articlesPdf';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import type { Form3Draft } from './form3DraftStorage';

function buildItems(draft: Form3Draft): ArticlesPdfItem[] {
  const { step1, nameChange, step4 } = draft;
  const newName =
    nameChange.changeCorporationName === 'change' ? nameChange.nameNuans.proposedName : '';

  return [
    [
      'Name of the applicant corporation: (Set out in Block Capital Letters)',
      valueHtml(step1.corporationName.toUpperCase()),
    ],
    [
      'The name of the corporation is changed to (if applicable): (Set out in Block Capital Letters)',
      valueHtml(newName.toUpperCase(), NOT_APPLICABLE),
    ],
    ['Date of incorporation/amalgamation:', valueHtml(formatIsoDateDisplay(step1.incorporationDate))],
    [
      'The resolution authorizing this application was confirmed by the shareholders/members of the corporation on:',
      valueHtml(
        `${formatIsoDateDisplay(step4.resolutionConfirmedDate)} under section 34 or 131 of the Corporations Act.`,
      ),
    ],
    [
      'The corporation applies for the issue of supplementary letters patent to provide as follows:',
      valueHtml(step4.requestedProvisions),
    ],
  ];
}

export function generateForm3ReviewPdf(args: { draft: Form3Draft }) {
  const { draft } = args;
  return openArticlesPdf({
    documentTitle: 'Application for Supplementary Letters Patent, Form 3',
    titleLines: ['Application for', 'Supplementary Letters Patent', 'Form 3'],
    actName: 'Corporations Act',
    items: buildItems(draft),
    signatureIntro: [],
    signatureCaptions: ['Name of signatory', 'Description of office'],
    signatureRows: [[], []],
  });
}

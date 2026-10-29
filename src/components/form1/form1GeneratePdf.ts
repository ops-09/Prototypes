import {
  NOT_APPLICABLE,
  NOT_PROVIDED,
  firstDirectorsTableHtml,
  formatDirectorCount,
  incorporatorAddressesTableHtml,
  incorporatorName,
  incorporatorSignatureName,
  openArticlesPdf,
  tableHtml,
  valueHtml,
  type ArticlesPdfItem,
} from '../shared/articlesPdf';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import { formatShareSummary } from '../shared/personReviewRows';
import type { Form1Draft } from './form1DraftStorage';
import { formatHeadOffice } from './form1ReviewModel';

function buildItems(draft: Form1Draft): ArticlesPdfItem[] {
  const { step1, step4, step5, step6, step7 } = draft;
  const multiStakeholder = step4.multiStakeholder === 'yes';
  const stakeholderFallback = multiStakeholder ? NOT_PROVIDED : NOT_APPLICABLE;

  return [
    [
      'The name of the co-operative is: (Set out in Block Capital Letters)',
      valueHtml(step1.cooperativeName.toUpperCase()),
    ],
    ['The head office is at the:', valueHtml(formatHeadOfficeLocation(draft.step3))],
    ['The address of the head office is:', valueHtml(formatHeadOffice(draft.step3))],
    ['Number of directors is/are:', valueHtml(formatDirectorCount(step4))],
    [
      'The number (or minimum and maximum number) of directors each stakeholder group in a multi-stakeholder co-operative may elect is:',
      valueHtml(multiStakeholder ? step4.stakeholderDirectorsText : '', stakeholderFallback),
    ],
    ['The first directors are:', firstDirectorsTableHtml(step4.directors)],
    [
      'Restrictions, if any, on the business the co-operative may carry on or on powers the co-operative may exercise:',
      valueHtml(step5.businessPowersRestrictions),
    ],
    ['The authorized capital for each class of share is:', valueHtml(step5.authorizedCapital)],
    [
      'The designations, preferences, rights, conditions, restrictions, limitations or prohibitions attaching to the preference shares, if any, are:',
      valueHtml(step5.preferenceShareTerms),
    ],
    [
      'The restrictions on the allotment, issue or transfer of shares are:',
      valueHtml(step5.shareTransferRestrictions),
    ],
    ['The classes of membership, if any, are:', valueHtml(step6.membershipClasses)],
    [
      'The terms and conditions attaching to each class of membership are:',
      valueHtml(step6.membershipClassTerms),
    ],
    [
      'The stakeholder groups, if any, are:',
      valueHtml(step6.stakeholderGroups, stakeholderFallback),
    ],
    [
      'The terms and conditions for membership in each stakeholder group are:',
      valueHtml(step6.stakeholderGroupTerms, stakeholderFallback),
    ],
    ['Special provisions, if any, are:', valueHtml(step6.specialProvisions)],
    [
      'The shares to be taken by the incorporators are:',
      tableHtml(
        ['Incorporator', 'Shares'],
        step7.incorporators.map((incorporator) => [
          incorporatorName(incorporator, step4.directors),
          formatShareSummary(incorporator),
        ]),
      ),
    ],
    [
      'The names and residential addresses of the incorporators are:',
      incorporatorAddressesTableHtml(step7.incorporators, step4.directors),
    ],
  ];
}

export function generateForm1ReviewPdf(args: { draft: Form1Draft }) {
  const { draft } = args;
  return openArticlesPdf({
    documentTitle: 'Articles of Incorporation, Form 1',
    titleLines: ['Articles of Incorporation of a', 'Co-operative with Share Capital', 'Form 1'],
    items: buildItems(draft),
    signatureRows: draft.step7.incorporators.map((entry) => [incorporatorSignatureName(entry)]),
  });
}

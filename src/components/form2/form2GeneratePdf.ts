import {
  NOT_APPLICABLE,
  NOT_PROVIDED,
  firstDirectorsTableHtml,
  formatDirectorCount,
  incorporatorAddressesTableHtml,
  incorporatorSignatureName,
  openArticlesPdf,
  valueHtml,
  type ArticlesPdfItem,
} from '../shared/articlesPdf';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import type { Form2Draft } from './form2DraftStorage';
import { formatHeadOffice } from './form2ReviewModel';

function buildItems(draft: Form2Draft): ArticlesPdfItem[] {
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
    ['The amount of the minimum member loan, if any:', valueHtml(step5.minimumMemberLoan)],
    [
      'The restrictions on transfer of member loans are:',
      valueHtml(step5.memberLoanTransferRestrictions),
    ],
    ['The amount of membership fee is:', valueHtml(step5.membershipFee)],
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
      'The names and residential addresses of the incorporators are:',
      incorporatorAddressesTableHtml(step7.incorporators, step4.directors),
    ],
  ];
}

export function generateForm2ReviewPdf(args: { draft: Form2Draft }) {
  const { draft } = args;
  return openArticlesPdf({
    documentTitle: 'Articles of Incorporation, Form 2',
    titleLines: ['Articles of Incorporation of a', 'Co-operative without Share Capital', 'Form 2'],
    items: buildItems(draft),
    signatureRows: draft.step7.incorporators.map((entry) => [incorporatorSignatureName(entry)]),
  });
}

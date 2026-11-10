import { formatIsoDateDisplay } from '../form7/form7Labels';
import {
  NOT_APPLICABLE,
  NOT_PROVIDED,
  firstDirectorsTableHtml,
  formatDirectorCount,
  openArticlesPdf,
  valueHtml,
  type ArticlesPdfItem,
} from '../shared/articlesPdf';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import { formatHeadOfficeAddressLine } from '../shared/OntarioHeadOfficeAddressFields';
import {
  CONTINUANCE_FILING_TITLE,
  CONTINUANCE_STAKEHOLDER_GROUP_IDS,
  OBR_CORPORATION_NAME,
  originalActLabel,
  stakeholderGroupIsEmpty,
  type ContinuanceDraft,
  type ContinuanceFormId,
  type ContinuanceStep6Data,
} from './continuanceDraftStorage';

function originalActText(draft: ContinuanceDraft) {
  if (draft.step4.originalAct === 'other') {
    return draft.step4.otherActJurisdiction.trim() || NOT_PROVIDED;
  }
  const label = originalActLabel(draft.step4.originalAct);
  return label === '—' ? NOT_PROVIDED : label;
}

function authorizingActText(draft: ContinuanceDraft) {
  if (draft.step9.authorizingAct === 'other') {
    return draft.step9.otherActJurisdiction.trim() || NOT_PROVIDED;
  }
  const label = originalActLabel(draft.step9.authorizingAct);
  return label === '—' ? NOT_PROVIDED : label;
}

function stakeholderDirectorsText(step6: ContinuanceStep6Data) {
  if (step6.multiStakeholder !== 'yes') {
    return '';
  }
  return CONTINUANCE_STAKEHOLDER_GROUP_IDS.map((id) => {
    const group = step6.groups[id];
    if (stakeholderGroupIsEmpty(group)) {
      return '';
    }
    return `Group ${id}: ${group.name.trim() || NOT_PROVIDED} — minimum ${
      group.minimumNumber.trim() || NOT_PROVIDED
    }, maximum ${group.maximumNumber.trim() || NOT_PROVIDED}`;
  })
    .filter(Boolean)
    .join('\n');
}

function confirmedText(value: boolean) {
  return value ? 'Confirmed' : 'Not confirmed';
}

function continuedNameIfDifferent(draft: ContinuanceDraft) {
  if (draft.step3.continueUnderName === 'yes') {
    return { value: '', fallback: NOT_APPLICABLE };
  }
  return { value: draft.step3.proposedName, fallback: NOT_PROVIDED };
}

function writtenConsentConfirmed(step6: ContinuanceStep6Data) {
  return (
    step6.directors.length > 0 &&
    step6.directors.every((director) => director.consentConfirmed)
  );
}

function isoDateValue(value: string) {
  return value ? formatIsoDateDisplay(value) : '';
}

function buildForm14Items(draft: ContinuanceDraft): ArticlesPdfItem[] {
  const { step6, step7, step8, step9 } = draft;
  const multiStakeholder = step6.multiStakeholder === 'yes';
  const stakeholderFallback = multiStakeholder ? NOT_PROVIDED : NOT_APPLICABLE;
  const continuedName = continuedNameIfDifferent(draft);

  return [
    ['The name of the corporation is:', valueHtml(OBR_CORPORATION_NAME)],
    [
      'The corporation is to be continued as a co-operative under the name (if different from 1):',
      valueHtml(continuedName.value, continuedName.fallback),
    ],
    [
      'The corporation was originally incorporated/amalgamated under the (pick one):',
      valueHtml(originalActText(draft)),
    ],
    ['Date of incorporation/amalgamation:', valueHtml(isoDateValue(draft.step4.incorporationDate))],
    [
      'The head office is located in the municipality of:',
      valueHtml(formatHeadOfficeLocation(draft.step5)),
    ],
    [
      'The address of the head office is:',
      valueHtml(formatHeadOfficeAddressLine(draft.step5)),
    ],
    ['Number of directors is/are:', valueHtml(formatDirectorCount(step6))],
    [
      'The number of directors each stakeholder group in a multi-stakeholder co-operative may elect is:',
      valueHtml(stakeholderDirectorsText(step6), stakeholderFallback),
    ],
    [
      'Written consent has been received and is available in the corporate records for the first directors.',
      valueHtml(confirmedText(writtenConsentConfirmed(step6))),
    ],
    ['The first directors are:', firstDirectorsTableHtml(step6.directors, { uppercaseNames: false })],
    [
      'Restrictions, if any, on the business the co-operative may carry on or on powers the co-operative may exercise:',
      valueHtml(step7.businessPowersRestrictions),
    ],
    ['The authorized capital for each class of share is:', valueHtml(step7.authorizedCapital)],
    [
      'The designations, preferences, rights, conditions, restrictions, limitations or prohibitions attaching to the preference shares, if any, are:',
      valueHtml(step7.preferenceShareTerms),
    ],
    [
      'The issued capital of the corporation is continued as issued capital of the co-operative as follows:',
      valueHtml(step7.issuedCapitalContinued),
    ],
    [
      'The restrictions on the allotment, issue or transfer of shares are:',
      valueHtml(step7.shareTransferRestrictions),
    ],
    ['The classes of membership, if any, are:', valueHtml(step8.membershipClasses)],
    [
      'The terms and conditions attaching to each class of membership are:',
      valueHtml(step8.membershipClassTerms),
    ],
    [
      'The stakeholder groups, if any, are:',
      valueHtml(step8.stakeholderGroups, stakeholderFallback),
    ],
    [
      'The terms and conditions for membership in each stakeholder group are:',
      valueHtml(step8.stakeholderGroupTerms, stakeholderFallback),
    ],
    ['Special provisions, if any, are:', valueHtml(step8.specialProvisions)],
    [
      'The co-operative will be organized and operated and will carry on business on a co-operative basis.',
      valueHtml(confirmedText(step9.cooperativeBasisConfirmed)),
    ],
    [
      'The corporation has complied with subsection 158(3) or 158.1(3), as applicable, of the Co-operative Corporations Act.',
      valueHtml(confirmedText(step9.subsection158Confirmed)),
    ],
    [
      'The continuation of the corporation under the Co-operative Corporations Act has been properly authorized under the (pick one):',
      valueHtml(authorizingActText(draft)),
    ],
    [
      'The corporation is to be continued under the Co-operative Corporations Act to the same extent as if it had been incorporated thereunder.',
      valueHtml(confirmedText(step9.continuedUnderActConfirmed)),
    ],
    [
      'The corporation is not insolvent within the meaning of subsection 1(5) of the Co-operative Corporations Act.',
      valueHtml(confirmedText(step9.notInsolventConfirmed)),
    ],
  ];
}

function buildForm15Items(draft: ContinuanceDraft): ArticlesPdfItem[] {
  const { step6, step7, step8, step9 } = draft;
  const multiStakeholder = step6.multiStakeholder === 'yes';
  const stakeholderFallback = multiStakeholder ? NOT_PROVIDED : NOT_APPLICABLE;
  const continuedName = continuedNameIfDifferent(draft);

  return [
    ['The name of the corporation is:', valueHtml(OBR_CORPORATION_NAME)],
    [
      'The corporation is to be continued as a co-operative under the name (if different from 1):',
      valueHtml(continuedName.value, continuedName.fallback),
    ],
    [
      'The corporation was originally incorporated/amalgamated under the (pick one):',
      valueHtml(originalActText(draft)),
    ],
    ['Date of incorporation/amalgamation:', valueHtml(isoDateValue(draft.step4.incorporationDate))],
    [
      'The head office is located in the municipality of:',
      valueHtml(formatHeadOfficeLocation(draft.step5)),
    ],
    [
      'The address of the head office is:',
      valueHtml(formatHeadOfficeAddressLine(draft.step5)),
    ],
    ['Number of directors is/are:', valueHtml(formatDirectorCount(step6))],
    [
      'The number of directors each stakeholder group in a multi-stakeholder co-operative may elect is:',
      valueHtml(stakeholderDirectorsText(step6), stakeholderFallback),
    ],
    [
      'Written consent has been received and is available in the corporate records for the first directors.',
      valueHtml(confirmedText(writtenConsentConfirmed(step6))),
    ],
    ['The first directors are:', firstDirectorsTableHtml(step6.directors, { uppercaseNames: false })],
    [
      'Restrictions, if any, on the business the co-operative may carry on or on powers the co-operative may exercise:',
      valueHtml(step7.businessPowersRestrictions),
    ],
    ['The amount of the minimum member loan, if any:', valueHtml(step7.minimumMemberLoan)],
    [
      'The restrictions on transfer of member loans are:',
      valueHtml(step7.memberLoanTransferRestrictions),
    ],
    ['The amount of the membership fee, if any, is:', valueHtml(step7.membershipFee)],
    ['The classes of membership, if any, are:', valueHtml(step8.membershipClasses)],
    [
      'The terms and conditions attaching to each class of membership are:',
      valueHtml(step8.membershipClassTerms),
    ],
    [
      'The stakeholder groups, if any, are:',
      valueHtml(step8.stakeholderGroups, stakeholderFallback),
    ],
    [
      'The terms and conditions for membership in each stakeholder group are:',
      valueHtml(step8.stakeholderGroupTerms, stakeholderFallback),
    ],
    ['Special provisions, if any, are:', valueHtml(step8.specialProvisions)],
    [
      'The co-operative will be organized and operated and will carry on business on a co-operative basis.',
      valueHtml(confirmedText(step9.cooperativeBasisConfirmed)),
    ],
    [
      'The corporation has complied with subsection 158(3) or 158.1(3), as applicable, of the Co-operative Corporations Act.',
      valueHtml(confirmedText(step9.subsection158Confirmed)),
    ],
    [
      'The continuation of the corporation under the Co-operative Corporations Act has been properly authorized under the (pick one):',
      valueHtml(authorizingActText(draft)),
    ],
    [
      'The corporation is to be continued under the Co-operative Corporations Act to the same extent as if it had been incorporated thereunder.',
      valueHtml(confirmedText(step9.continuedUnderActConfirmed)),
    ],
    [
      'The corporation is not insolvent within the meaning of subsection 1(5) of the Co-operative Corporations Act.',
      valueHtml(confirmedText(step9.notInsolventConfirmed)),
    ],
  ];
}

function buildItems(formId: ContinuanceFormId, draft: ContinuanceDraft): ArticlesPdfItem[] {
  return formId === 15 ? buildForm15Items(draft) : buildForm14Items(draft);
}

function officerSignatureRow() {
  return `
    <div class="signature-row signature-row--wide">
      <div class="name-col">
        <div class="name-line"></div>
        <span class="field-label">Name</span>
      </div>
      <div class="name-col">
        <div class="name-line"></div>
        <span class="field-label">Position/Office</span>
      </div>
      <div class="signature-col">
        <div class="signature-line"></div>
        <span class="field-label">Signature</span>
      </div>
    </div>`;
}

function declarationSignatureBody(formId: ContinuanceFormId) {
  const shareCapital = formId === 15 ? 'without Share Capital' : 'with Share Capital';
  return `
    <p class="signature-intro">I hereby certify that I am an authorized officer of the Corporation applying to continue as a Co-operative ${shareCapital} under the <em>Co-operative Corporations Act</em> and that the statements made in this application are true, accurate and complete.</p>
    ${officerSignatureRow()}
    ${officerSignatureRow()}
    <p class="signature-intro">These articles <strong>must</strong> be signed by two directors or officers of the corporation (e.g. president, secretary).</p>`;
}

export function generateContinuanceReviewPdf(args: {
  formId: ContinuanceFormId;
  draft: ContinuanceDraft;
}) {
  const { formId, draft } = args;
  const shareLine =
    formId === 15
      ? 'Co-operative without Share Capital'
      : 'Co-operative with Share Capital';

  return openArticlesPdf({
    documentTitle: `${CONTINUANCE_FILING_TITLE[formId]}, Form ${formId}`,
    titleLines: ['Articles of Continuance of a', shareLine, `Form ${formId}`],
    items: buildItems(formId, draft),
    signatureRows: [],
    signatureIntro: [],
    signatureHeading: 'Declaration and Attestation',
    signatureBodyHtml: declarationSignatureBody(formId),
  });
}

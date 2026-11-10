/** Copy for Form 14 and Form 15 Before you begin. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';
import {
  BYB_PAYMENT_LEAD,
  BYB_PAYMENT_REVIEW_FEES,
} from '../shared/beforeYouBeginPaymentContent';
import type { ContinuanceFormId } from './continuanceDraftStorage';

export const BYB_ESTIMATED_TIME = 'Approximately 10 minutes';

export const BYB_FORM_NAME: Record<ContinuanceFormId, string> = {
  14: 'Articles of Continuance as a Co\u2011operative with Share Capital Form 14',
  15: 'Articles of Continuance as a Co\u2011operative without Share Capital Form 15',
};

const SHARE_CAPITAL_PHRASE: Record<ContinuanceFormId, string> = {
  14: 'with share capital',
  15: 'without share capital',
};

export function continuanceEligibilityIntro(formId: ContinuanceFormId) {
  return `This form together with the required supporting documents and fee must be filed with the Ministry by a corporation that is incorporated under the laws of another Act or another jurisdiction to apply to continue as a co-operative, ${SHARE_CAPITAL_PHRASE[formId]} under the Ontario Co-operative Corporations Act (CCA).`;
}

export const BYB_OTHER_JURISDICTION =
  'Corporations incorporated under the laws of any jurisdiction other than Ontario may, if authorized by the laws of that jurisdiction, apply for continuance in accordance with section 158(1) of the CCA.';

export const BYB_ONTARIO_ACTS_INTRO =
  'Corporations incorporated under the following Acts may apply for continuance in accordance with section 158.1 of the CCA:';

export const BYB_ONTARIO_ACTS = [
  'Business Corporations Act (Ontario)',
  'Corporations Act (Ontario)',
] as const;

export const BYB_STEPS_HEADING = 'Steps in this process';

export const BYB_STEPS_INTRO =
  'Complete the following steps for a successful submission:';

export type BeforeYouBeginStep = {
  title: string;
  description: string;
};

const BYB_STEP_7: Record<ContinuanceFormId, BeforeYouBeginStep> = {
  14: {
    title: 'Step 7: Restrictions and share capital',
    description:
      'Enter restrictions, authorized capital, preference terms, and issued capital that is continued.',
  },
  15: {
    title: 'Step 7: Restrictions, member loans and membership fee',
    description:
      'Enter restrictions, the minimum member loan, loan-transfer restrictions, and the membership fee.',
  },
};

export function continuanceBeforeYouBeginSteps(
  formId: ContinuanceFormId,
): readonly BeforeYouBeginStep[] {
  return [
    {
      title: 'Step 1: Contact information',
      description: 'Enter the contact details for the person filing these articles.',
    },
    {
      title: 'Step 2: Co-operative details',
      description:
        'Provide the co-operative sub-type, primary activity, and official email.',
    },
    {
      title: 'Step 3: Co-operative name',
      description:
        'Choose whether to continue under the current corporation name. If not, enter a new co-operative name and upload the Nuans report.',
    },
    {
      title: 'Step 4: Original incorporation',
      description:
        'Identify the original incorporating Act and the date of incorporation or amalgamation.',
    },
    {
      title: 'Step 5: Head office address',
      description: 'Enter the head office address for the co-operative.',
    },
    {
      title: 'Step 6: Directors',
      description: 'Set the board size and enter director details.',
    },
    BYB_STEP_7[formId],
    {
      title: 'Step 8: Membership and provisions',
      description:
        'Enter membership classes, stakeholder groups, and special provisions.',
    },
    {
      title: 'Step 9: Declarations and authorization',
      description:
        'Complete the declarations and identify the Act and date that authorized the continuation.',
    },
    {
      title: 'Step 10: Review and certify',
      description: 'Review the filing and generate the PDF.',
    },
    {
      title: 'Step 11: Submit',
      description: 'Upload the signed PDF, authorize, and submit.',
    },
  ];
}

export const BYB_DOCUMENTS_HEADING = 'Submission checklist';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export const BYB_NUANS_INSTRUCTION =
  'An Ontario Nuans name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report.';

export const BYB_NUANS_SUPPLIERS_BEFORE =
  'Suppliers of Nuans reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s Nuans site at ';

export const BYB_NUANS_SITE_URL = 'https://www.nuans.com';

export const BYB_NUANS_SITE_LABEL = 'www.nuans.com';

export const BYB_NUANS_SUPPLIERS_AFTER =
  ' for a list of registered search houses that can assist you with obtaining a Nuans search report.';

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  {
    text: 'The application must include appropriate authorizations of the director(s) and shareholders/membership for the continuance under the CCA as per the requirements of the entity’s original incorporating Act.',
  },
  {
    text: 'If the corporation is not an Ontario corporation, the application must also include confirmation in writing issued by the proper office of the jurisdiction in which the corporation is incorporated indicating the corporation is duly authorized under its laws to apply for continuance under the Co-operative Corporations Act.',
  },
  {
    text: 'If the corporation is not an Ontario corporation, the application must include a copy of the incorporating document together with all amendments to the document. If the corporation has continued into its current jurisdiction, a copy of the continuation documents and all amendments since continuation is required. If the continuation documents do not contain the original date of incorporation a copy of the original incorporation document will also be required.',
  },
  {
    text: BYB_NUANS_INSTRUCTION,
  },
  {
    beforeLink: BYB_NUANS_SUPPLIERS_BEFORE,
    linkLabel: BYB_NUANS_SITE_LABEL,
    linkHref: BYB_NUANS_SITE_URL,
    afterLink: BYB_NUANS_SUPPLIERS_AFTER,
  },
];

export const BYB_PAYMENT_LEAD_TEXT = BYB_PAYMENT_LEAD;

export const BYB_PAYMENT_ITEMS: readonly string[] = [
  'A valid payment method available.',
  BYB_PAYMENT_REVIEW_FEES,
  'The filing fee is $200.00.',
  'No fee is required if the corporation that is applying for continuance was incorporated under the Business Corporations Act or the Corporations Act.',
];

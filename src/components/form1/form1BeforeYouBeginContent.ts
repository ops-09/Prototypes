/** Copy for Form 1 Before you begin — edit here without changing layout. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';
import {
  BYB_PAYMENT_LEAD,
  BYB_PAYMENT_REVIEW_FEES,
} from '../shared/beforeYouBeginPaymentContent';
import { DIRECTOR_CONSENT_FORM_URL } from './form1DraftStorage';

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  // Non-breaking hyphen so “Co-operative” does not wrap after “Co-”.
  'Articles of Incorporation of a Co\u2011operative with Share Capital Form 1',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Co-operative Corporations Act';

export const BYB_FORM_TITLE = [...BYB_FORM_TITLE_LINES, BYB_FORM_ACT_LINE].join(
  ' ',
);

export const BYB_FORM_NAME = BYB_FORM_TITLE_LINES.join(' ');

export const BYB_ESTIMATED_TIME = 'Approximately 10 minutes';

export const BYB_STEPS_HEADING = 'Steps in this process';

export const BYB_STEPS_INTRO =
  'Complete the following steps for a successful submission:';

export type BeforeYouBeginStep = {
  title: string;
  description: string;
};

export const BYB_STEPS: readonly BeforeYouBeginStep[] = [
  {
    title: 'Step 1: Contact information',
    description: 'Enter the contact details for the person filing these articles.',
  },
  {
    title: 'Step 2: Co-operative sub-type, primary activity, official email',
    description:
      'Provide the co-operative sub-type, primary activity, and official email.',
  },
  {
    title: 'Step 3: Co-operative name',
    description:
      'Enter the proposed co-operative name, upload the Nuans report, and provide the Nuans issue date.',
  },
  {
    title: 'Step 4: Registered office address',
    description: 'Enter the registered office address for the co-operative.',
  },
  {
    title: 'Step 5: Add directors information',
    description: 'Set the board size and enter director details.',
  },
  {
    title: 'Step 6: Shares information',
    description: 'Enter authorized capital, preference terms, and share restrictions.',
  },
  {
    title: 'Step 7: Membership and provisions',
    description:
      'Enter membership classes, stakeholder groups, and special provisions.',
  },
  {
    title: 'Step 8: Add incorporators details',
    description: 'Add incorporator details for the co-operative.',
  },
  {
    title: 'Step 9: Review and certify — I acknowledge',
    description: 'Review the filing and complete the acknowledgement.',
  },
];

export const BYB_DOCUMENTS_HEADING = 'Submission checklist';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export const BYB_PAYMENT_LEAD_TEXT = BYB_PAYMENT_LEAD;

export const BYB_PAYMENT_ITEMS: readonly string[] = [
  'A valid payment method available.',
  BYB_PAYMENT_REVIEW_FEES,
  'The filing fee for Articles of Incorporation: $335 for a standard co-operative.',
];

export const BYB_NAICS_INSTRUCTION_BEFORE =
  'The primary activity is the main activity of your corporation. Please refer to the ';

export const BYB_NAICS_INSTRUCTION_AFTER =
  ' for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form. This information will not appear in the public record and is collected for administrative purposes only.';

export const BYB_NAICS_URL =
  'https://www.statcan.gc.ca/en/concepts/searchclasscod';

export const BYB_NAICS_LINK_LABEL =
  'North American Industry Classification System (NAICS)';

export const BYB_FORM3_INSTRUCTION =
  'If applicable, a completed Consent to Act as a First Director form, Form 3. Only to be used when there are first directors who are not incorporators.';

export const BYB_FORM3_DOWNLOAD_LABEL = 'Download Form 3';

export const BYB_NUANS_INSTRUCTION =
  'An Ontario Nuans name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report.';

export const BYB_NUANS_SUPPLIERS_BEFORE =
  'Suppliers of Nuans reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s Nuans site at ';

export const BYB_NUANS_SITE_URL = 'https://www.nuans.com';

export const BYB_NUANS_SITE_LABEL = 'www.nuans.com';

export const BYB_NUANS_SUPPLIERS_AFTER =
  ' for a list of registered search houses that can assist you with obtaining a Nuans search report.';

export const NOTICE_CCA_FILINGS_URL =
  'https://forms.mgcs.gov.on.ca/en/dataset/on00232';

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  {
    beforeLink: BYB_NAICS_INSTRUCTION_BEFORE,
    linkLabel: BYB_NAICS_LINK_LABEL,
    linkHref: BYB_NAICS_URL,
    afterLink: BYB_NAICS_INSTRUCTION_AFTER,
  },
  {
    beforeLink: `${BYB_FORM3_INSTRUCTION} `,
    linkLabel: BYB_FORM3_DOWNLOAD_LABEL,
    linkHref: DIRECTOR_CONSENT_FORM_URL,
    afterLink: '.',
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
  {
    beforeLink:
      'For additional information regarding the required documents, information and other filing requirements, please see the following: ',
    linkLabel:
      'Notice – Co-operative Corporations Act – Filings by Co-operative Corporations',
    linkHref: NOTICE_CCA_FILINGS_URL,
  },
];

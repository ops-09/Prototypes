/** Copy for Form 10 Before you begin — edit here without changing layout. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Articles of Amalgamation Form 10',
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
    description:
      'Enter the contact details for the person filing these articles.',
  },
  {
    title: 'Step 2: Business details',
    description:
      'Provide the amalgamated co-operative’s primary activity, type, and official email.',
  },
  {
    title: 'Step 3: Amalgamation details',
    description:
      'Identify each amalgamating co-operative and confirm amalgamation agreement approval.',
  },
  {
    title: 'Step 4: Co-operative name',
    description:
      'Enter the amalgamated co-operative’s name and Nuans report details when a new name is proposed.',
  },
  {
    title: 'Step 5: Supporting documents',
    description:
      'Upload the amalgamation agreement, affidavits of solvency, and any other required documents.',
  },
  {
    title: 'Step 6: Review and certify',
    description: 'Review the filing and complete the acknowledgement.',
  },
];

export const BYB_DOCUMENTS_HEADING = 'Submission checklist';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export const BYB_NAICS_URL =
  'https://www.statcan.gc.ca/en/concepts/searchclasscod';

export const BYB_NAICS_LINK_LABEL =
  'North American Industry Classification System (NAICS) Canada';

export const BYB_NUANS_SUPPLIERS_BEFORE =
  'Suppliers of Nuans reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s Nuans site at ';

export const BYB_NUANS_SITE_URL = 'https://www.nuans.com';

export const BYB_NUANS_SITE_LABEL = 'www.nuans.com';

export const BYB_NUANS_SUPPLIERS_AFTER =
  ' for a list of registered search houses that can assist you with obtaining a Nuans search report.';

/** Prototype link — Central Forms Repository search for Affidavit of Solvency. */
export const AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL =
  'https://www.forms.ssb.gov.on.ca/mbs/ssb/forms/ssbforms.nsf';

export const NOTICE_CCA_FILINGS_URL =
  'https://forms.mgcs.gov.on.ca/en/dataset/on00232';

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  {
    text: 'A certified copy of the amalgamation agreement approved by each of the amalgamating co-operatives. The effective date of the amalgamation agreement must be within six (6) months of the submission of the Articles of Amalgamation.',
  },
  {
    beforeLink:
      'Affidavits of Solvency (Amalgamation) of two officers or of one officer and one director for each of the co-operative corporations that are being amalgamated. ',
    linkLabel: 'Affidavit of Solvency (Amalgamation)',
    linkHref: AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL,
  },
  {
    text: 'If the amalgamated co-operative has a new name, an Ontario Nuans report.',
  },
  {
    text: 'The Nuans report must be dated within 90 days of the submission date.',
  },
  {
    beforeLink: BYB_NUANS_SUPPLIERS_BEFORE,
    linkLabel: BYB_NUANS_SITE_LABEL,
    linkHref: BYB_NUANS_SITE_URL,
    afterLink: BYB_NUANS_SUPPLIERS_AFTER,
  },
  {
    beforeLink:
      'The primary activity must correspond to a valid NAICS activity code. Refer to the ',
    linkLabel: BYB_NAICS_LINK_LABEL,
    linkHref: BYB_NAICS_URL,
    afterLink: ' for the list of activities.',
  },
  {
    beforeLink:
      'For additional information regarding the required documents, information and other filing requirements, please see the following: ',
    linkLabel:
      'Notice – Co-operative Corporations Act – Filings by Co-operative Corporations',
    linkHref: NOTICE_CCA_FILINGS_URL,
  },
];

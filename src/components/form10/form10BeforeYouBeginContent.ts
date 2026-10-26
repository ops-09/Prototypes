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
      'Enter the amalgamated co-operative’s name and NUANS report details when a new name is proposed.',
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

export const BYB_NUANS_INSTRUCTION =
  'Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

/** Prototype link — Central Forms Repository search for Affidavit of Solvency. */
export const AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL =
  'https://www.forms.ssb.gov.on.ca/mbs/ssb/forms/ssbforms.nsf';

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  { text: 'Legal name of each amalgamating co-operative.' },
  { text: 'Ontario Corporation Number (OCN) for each amalgamating co-operative.' },
  { text: 'Official email address of the amalgamated co-operative.' },
  { text: 'Primary activity of the amalgamated co-operative.' },
  { text: 'Type of co-operative.' },
  { text: 'An Ontario NUANS name search report for the proposed name, if the amalgamated co-operative will operate under a new name.' },
  {
    text: 'The NUANS report must be dated within 90 days of the submission date.',
  },
  {
    text: 'A certified copy of the amalgamation agreement approved by each of the amalgamating co-operatives.',
  },
  {
    text: 'The effective date of the amalgamation agreement must be within six (6) months of the submission of the Articles of Amalgamation. If a certified copy of the amalgamation agreement is not set out in the articles, please upload through additional documents.',
  },
  {
    beforeLink:
      'Affidavits of Solvency (Amalgamation) of two officers or of one officer and one director for each of the co-operative corporations that are being amalgamated. Download the ',
    linkLabel: 'Affidavit of Solvency form',
    linkHref: AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL,
    afterLink: '.',
  },
  {
    beforeLink:
      'The primary activity must correspond to a valid NAICS activity code. Refer to the ',
    linkLabel: BYB_NAICS_LINK_LABEL,
    linkHref: BYB_NAICS_URL,
    afterLink: ' for the list of activities.',
  },
  {
    beforeLink: `${BYB_NUANS_INSTRUCTION} `,
    linkLabel: BYB_NUANS_SITE_LABEL,
    linkHref: BYB_NUANS_SITE_URL,
    afterLink: '.',
  },
];

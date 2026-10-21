/** Copy for Form 1 Before you begin — edit here without changing layout. */

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Articles of Incorporation of a Co-operative with Share Capital Form 1',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Co-operative Corporations Act';

export const BYB_FORM_TITLE = [...BYB_FORM_TITLE_LINES, BYB_FORM_ACT_LINE].join(
  ' ',
);

export const BYB_INTRO =
  'Please review the following information before starting your Articles of Incorporation filing.';

export const BYB_ESTIMATED_TIME_HEADING = 'Estimated time to complete';

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
    title: 'Step 2: Co-operative name',
    description:
      'Enter the proposed co-operative name, upload the NUANS report, and provide the NUANS issue date.',
  },
  {
    title: 'Step 3: Co-operative sub-type, primary activity, official email',
    description:
      'Provide the co-operative sub-type, primary activity, and official email.',
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

export const BYB_DOCUMENTS_HEADING = 'Gather your supporting documents';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export type BeforeYouBeginDocument = {
  beforeLink?: string;
  linkLabel?: string;
  afterLink?: string;
  text?: string;
};

export const BYB_DOCUMENTS: readonly BeforeYouBeginDocument[] = [
  {
    text: 'An Ontario NUANS name search report for the proposed name of the co-operative.',
  },
  {
    beforeLink: 'A completed ',
    linkLabel: 'Consent to Act as First Director (Form 3)',
    afterLink:
      ', required only for a first director who is not also an incorporator.',
  },
];

export const BYB_COST_HEADING = 'Cost';

export const BYB_COST_INTRO =
  'A filing fee is required to submit Articles of Incorporation.';

export const BYB_COST_ITEMS: readonly string[] = [
  'The filing fee for Articles of Incorporation: $335 for a standard co-operative.',
  'A valid payment method available.',
];

export const BYB_INSTRUCTIONS_HEADING = 'Instructions';

export const BYB_INSTRUCTIONS_INTRO =
  'Please keep the following guidelines in mind while completing your filing.';

export type BeforeYouBeginInstruction = {
  text: string;
  /** When set, append a link after the text. */
  linkHref?: string;
  linkLabel?: string;
};

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
  'An Ontario NUANS name search report for the proposed name of the co-operative. The search report must be submitted with the application within 90 days of the production of the report. Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

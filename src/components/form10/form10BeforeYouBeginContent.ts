/** Copy for Form 10 Before you begin — edit here without changing layout. */

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Articles of Amalgamation',
  'Form 10',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Co-operative Corporations Act';

export const BYB_FORM_TITLE = [...BYB_FORM_TITLE_LINES, BYB_FORM_ACT_LINE].join(
  ' ',
);

export const BYB_INTRO =
  'This form, together with the required supporting documents, must be filed with the Ministry to amalgamate two or more Ontario co-operatives under the Co-operative Corporations Act. Please review the following information before starting your filing.';

export const BYB_ESTIMATED_TIME_HEADING = 'Estimated time to complete';

export const BYB_ESTIMATED_TIME = 'Approximately 10 minutes';

export const BYB_COOP_DETAILS_HEADING = 'Co-operative details';

export const BYB_COOP_DETAILS_INTRO =
  'You must have the following information available to complete your submission:';

export const BYB_COOP_DETAILS_ITEMS: readonly string[] = [
  'Legal name of each amalgamating co-operative.',
  'Ontario Corporation Number (OCN) for each amalgamating co-operative.',
  'Official email address of the amalgamated co-operative.',
  'Primary activity of the amalgamated co-operative.',
  'Type of co-operative.',
];

export const BYB_NAICS_NOTE =
  'The primary activity must correspond to a valid NAICS activity code. Refer to the North American Industry Classification System (NAICS) for the list of activities.';

export const BYB_NAICS_URL =
  'https://www.statcan.gc.ca/en/concepts/searchclasscod';

export const BYB_NAICS_LINK_LABEL =
  'North American Industry Classification System (NAICS) Canada';

export const BYB_NAME_HEADING = 'Name requirements';

export const BYB_NAME_INTRO =
  'If the amalgamated co-operative will operate under a new name, you may be required to provide:';

export const BYB_NAME_ITEMS: readonly string[] = [
  'An Ontario NUANS name search report for the proposed name.',
  'The NUANS report must be dated within 90 days of the submission date.',
];

export const BYB_NUANS_INSTRUCTION =
  'Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

export const BYB_AMALGAMATION_DOCS_HEADING = 'Amalgamation documents';

export const BYB_AMALGAMATION_DOCS_INTRO =
  'You must have the following documents available to complete your submission:';

export type BeforeYouBeginListItem = {
  text?: string;
  beforeLink?: string;
  linkLabel?: string;
  afterLink?: string;
};

export const BYB_AMALGAMATION_DOCS: readonly BeforeYouBeginListItem[] = [
  {
    text: 'A certified copy of the amalgamation agreement approved by each of the amalgamating co-operatives.',
  },
  {
    text: 'The effective date of the amalgamation agreement must be within six (6) months of the submission of the Articles of Amalgamation. If a certified copy of the amalgamation agreement is not set out in the articles, please upload through additional documents.',
  },
  {
    beforeLink: 'Affidavits of Solvency (Amalgamation) of two officers or of one officer and one director for each of the co-operative corporations that are being amalgamated. Download the ',
    linkLabel: 'Affidavit of Solvency form',
    afterLink: '.',
  },
];

/** Prototype link — Central Forms Repository search for Affidavit of Solvency. */
export const AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL =
  'https://www.forms.ssb.gov.on.ca/mbs/ssb/forms/ssbforms.nsf';

export const BYB_COST_HEADING = 'Cost';

export const BYB_COST_INTRO =
  'There is no filing fee when submitting Articles of Amalgamation.';

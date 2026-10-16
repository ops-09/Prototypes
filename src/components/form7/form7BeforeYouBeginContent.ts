/** Copy for Form 7 Before you begin — edit here without changing layout. */

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Articles of Amendment',
  'Form 7',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Co-operative Corporations Act';

export const BYB_FORM_TITLE = [...BYB_FORM_TITLE_LINES, BYB_FORM_ACT_LINE].join(
  ' ',
);

export const BYB_INTRO =
  'Please review the following information before starting your Articles of Amendment filing.';

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
    description:
      'Enter the contact details for the person filing these articles.',
  },
  {
    title: 'Step 2: Business details',
    description:
      'Confirm the co-operative’s Ontario corporation number, legal name, incorporation date, primary activity, and official email.',
  },
  {
    title: 'Step 3: Amendment details',
    description:
      'Select the amendment type and provide the details required for that amendment, including a proposed name and NUANS report when changing the name.',
  },
  {
    title: 'Step 4: Supporting documents',
    description:
      'Upload the certified resolution and any other required supporting documents, and confirm the authorizing subsections of the Act.',
  },
  {
    title: 'Step 5: Review and certify',
    description: 'Review the filing and complete the acknowledgement.',
  },
];

export const BYB_DOCUMENTS_HEADING = 'Gather your supporting documents';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export type BeforeYouBeginDocument = {
  text: string;
};

export const BYB_DOCUMENTS: readonly BeforeYouBeginDocument[] = [
  {
    text: 'A certified copy of the resolution authorizing the amendment.',
  },
  {
    text: 'An Ontario NUANS name search report, if you are changing the co-operative’s name.',
  },
  {
    text: 'Any affidavits or other supporting documents required for your amendment type.',
  },
];

export const BYB_COST_HEADING = 'Cost';

export const BYB_COST_INTRO =
  'A filing fee is required to submit Articles of Amendment. The fee depends on the amendment type.';

export const BYB_COST_ITEMS: readonly string[] = [
  'Name change or other amendment: $155.',
  'Conversion to a Business Corporations Act or Not-for-Profit Corporations Act corporation: $330.',
  'Reduction of authorized capital: $155.',
  'A valid payment method available.',
];

export const BYB_INSTRUCTIONS_HEADING = 'Instructions';

export const BYB_INSTRUCTIONS_INTRO =
  'Please keep the following guidelines in mind while completing your filing.';

export const BYB_NAICS_INSTRUCTION =
  'The primary activity is the main activity of your corporation. Please refer to the North American Industry Classification System (NAICS) for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form. This information will not appear in the public record and is collected for administrative purposes only.';

export const BYB_NUANS_INSTRUCTION =
  'If you are changing the co-operative’s name, an Ontario NUANS name search report for the proposed name must be submitted with the application within 90 days of the production of the report. Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

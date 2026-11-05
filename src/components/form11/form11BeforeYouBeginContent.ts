/** Copy for Form 11 Before you begin — edit here without changing layout. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Application for Letters Patent of Amalgamation Form 11',
] as const;

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
      'Enter the contact details for the person filing this application.',
  },
  {
    title: 'Step 2: Corporation details',
    description:
      'Provide the primary activity and official email for the amalgamated corporation.',
  },
  {
    title: 'Step 3: Amalgamating corporations',
    description:
      'Add each amalgamating corporation, including its Ontario corporation number and the date of shareholders/members approval.',
  },
  {
    title: 'Step 4: Amalgamated corporation name',
    description:
      'Keep the name of an amalgamating corporation or propose a new name with a Nuans report.',
  },
  {
    title: 'Step 5: Head office address',
    description:
      'Enter the head office address of the amalgamated corporation.',
  },
  {
    title: 'Step 6: Directors',
    description:
      'Add the first directors of the amalgamated corporation and their addresses for service.',
  },
  {
    title: 'Step 7: Supporting documents',
    description:
      'Upload a certified copy of the amalgamation agreement and any other supporting documents.',
  },
  {
    title: 'Step 8: Review and certify',
    description: 'Review the application and generate the PDF.',
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

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  {
    text: 'The legal name and Ontario Corporation Number of each amalgamating corporation.',
  },
  {
    text: 'The date on which the shareholders or members of each amalgamating corporation approved the amalgamation agreement.',
  },
  {
    text: 'A certified copy of the amalgamation agreement, certified under corporate seal by the secretary of each of the amalgamating corporations.',
  },
  {
    text: 'The amalgamation agreement has been duly approved as required by section 113(3) of the Corporations Act.',
  },
  {
    text: 'If the amalgamated corporation has a new name, an Ontario Nuans report dated within 90 days of the submission date.',
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
    text: 'The head office address of the amalgamated corporation.',
  },
  {
    text: 'The full names and addresses for service of the first directors.',
  },
];

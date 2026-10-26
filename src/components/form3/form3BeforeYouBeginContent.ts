/** Copy for Form 3 Before you begin — edit here without changing layout. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';
/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Application for Supplementary Letters Patent Form 3',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Corporations Act';

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
      'Confirm the corporation’s Ontario corporation number, legal name, and incorporation date, then provide the primary activity and official email.',
  },
  {
    title: 'Step 3: Corporation name',
    description:
      'Indicate whether the application includes a name change, and provide a NUANS report when a new name is proposed.',
  },
  {
    title: 'Step 4: Supplementary letters patent',
    description:
      'Enter the resolution confirmation date, describe the provisions being requested, and upload any additional supporting documents.',
  },
  {
    title: 'Step 5: Review and certify',
    description: 'Review the filing and complete the acknowledgement.',
  },
];

export const BYB_DOCUMENTS_HEADING = 'Submission checklist';

export const BYB_DOCUMENTS_INTRO =
  'You should have the following information available to complete your submission:';

export const BYB_NUANS_INSTRUCTION =
  'Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  { text: 'The Ontario Corporation Number (OCN) of the corporation.' },
  {
    text: 'The date on which the shareholders/members approved the resolution authorizing the application.',
  },
  {
    text: 'Details of the provisions for which Supplementary Letters Patent are being requested.',
  },
  { text: 'A NUANS Name Search Report is required when the application includes a name change.' },
  {
    text: 'The NUANS Report must be dated within 90 days of the filing date.',
  },
  {
    text: 'A separate NUANS Report may be required for English and French names that are to be used separately.',
  },
  {
    text: 'If the proposed name of the corporation is similar to the name of an existing corporation, organization, registered business or includes the name of a person, consent to use the name may be requested from the corporation, organization, business or individual.',
  },
  {
    text: 'If the application includes a proposed new name, the following statement must be included in item 5, “The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.”',
  },
  { text: 'Certified copy of the authorizing resolution.' },
  { text: 'Supporting legal documents.' },
  { text: 'Consent documents (if required).' },
  { text: 'NUANS Report (if a name change is requested).' },
  {
    beforeLink: `${BYB_NUANS_INSTRUCTION} `,
    linkLabel: BYB_NUANS_SITE_LABEL,
    linkHref: BYB_NUANS_SITE_URL,
    afterLink: '.',
  },
  { text: 'Uploaded files must be PDF format only.' },
  { text: 'Uploaded files must be 20 MB maximum file size.' },
];

/** Copy for Form 3 Before you begin — edit here without changing layout. */

/** Title lines — break early so lines wrap cleanly at form column widths. */
export const BYB_FORM_TITLE_LINES = [
  'Application for Supplementary Letters Patent Form 3',
] as const;

/** Act line — body text under the page title, not part of the h1. */
export const BYB_FORM_ACT_LINE = 'Corporations Act';

export const BYB_INTRO =
  'Please review the following information before starting your Application for Supplementary Letters Patent.';

export const BYB_ABOUT_HEADING = 'About this filing';

export const BYB_ABOUT_BODY =
  'A corporation may apply for Supplementary Letters Patent to change its name, to amend the objects or provisions set out in the original Letters Patent or an earlier Supplementary Letters Patent or any other matter set out in Section 131 of the Corporations Act.';

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
      'Indicate whether the application includes a name change, and provide a NUANS report and insolvency confirmation when a new name is proposed.',
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

export const BYB_START_HEADING = 'Before you start';

export const BYB_START_INTRO =
  'Before completing this application, ensure you have:';

export const BYB_START_ITEMS: readonly string[] = [
  'The Ontario Corporation Number (OCN) of the corporation.',
  'The date on which the shareholders/members approved the resolution authorizing the application.',
  'Details of the provisions for which Supplementary Letters Patent are being requested.',
  'All supporting documents required to support the application.',
];

export const BYB_NAME_HEADING = 'Corporation name change requirements';

export const BYB_NAME_INTRO =
  'If the application includes a proposed corporation name change:';

export const BYB_NAME_ITEMS: readonly string[] = [
  'A NUANS Name Search Report is required.',
  'The NUANS Report must be dated within 90 days of the filing date.',
  'A separate NUANS Report may be required for English and French names that are to be used separately.',
  'If the proposed name of the corporation is similar to the name of an existing corporation, organization, registered business or includes the name of a person, consent to use the name may be requested from the corporation, organization, business or individual.',
  'If the application includes a proposed new name, the following statement must be included in item 5, “The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.”',
];

export const BYB_NUANS_INSTRUCTION =
  'Suppliers of NUANS reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s NUANS site.';

export const BYB_NUANS_SITE_URL =
  'https://ised-isde.canada.ca/site/nuans-corporate-name-search/en';

export const BYB_NUANS_SITE_LABEL = 'NUANS site';

export const BYB_DOCUMENTS_HEADING = 'Supporting documents';

export const BYB_DOCUMENTS_INTRO =
  'Examples of supporting documentation may include:';

export const BYB_DOCUMENTS: readonly string[] = [
  'Certified copy of the authorizing resolution.',
  'Supporting legal documents.',
  'Consent documents (if required).',
  'NUANS Report (if a name change is requested).',
];

export const BYB_DOCUMENTS_FORMAT_INTRO = 'Uploaded files must be:';

export const BYB_DOCUMENTS_FORMAT_ITEMS: readonly string[] = [
  'PDF format only',
  '20 MB maximum file size.',
];

export const BYB_SUBMIT_HEADING = 'Before you submit';

export const BYB_SUBMIT_INTRO =
  'By submitting this application, you confirm that:';

export const BYB_SUBMIT_ITEMS: readonly string[] = [
  'You are authorized to act on behalf of the corporation.',
];

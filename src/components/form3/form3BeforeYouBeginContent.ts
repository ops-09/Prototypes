/** Copy for Form 3 Before you begin — edit here without changing layout. */

import type { BeforeYouBeginChecklistItem } from '../shared/beforeYouBeginChecklist';
import {
  BYB_PAYMENT_LEAD,
  BYB_PAYMENT_REVIEW_FEES,
} from '../shared/beforeYouBeginPaymentContent';
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
      'Indicate whether the application includes a name change, and provide a Nuans report when a new name is proposed.',
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

export const BYB_PAYMENT_LEAD_TEXT = BYB_PAYMENT_LEAD;

export const BYB_PAYMENT_ITEMS: readonly string[] = [
  'A valid payment method available.',
  BYB_PAYMENT_REVIEW_FEES,
  'The filing fee is $130',
];

export const BYB_NUANS_SUPPLIERS_BEFORE =
  'Suppliers of Nuans reports are listed in the Yellow Pages under the heading “Searchers of Records” or visit Innovation, Science and Economic Development Canada’s Nuans site at ';

export const BYB_NUANS_SITE_URL = 'https://www.nuans.com';

export const BYB_NUANS_SITE_LABEL = 'www.nuans.com';

export const BYB_NUANS_SUPPLIERS_AFTER =
  ' for a list of registered search houses that can assist you with obtaining a Nuans search report.';

export const BYB_NAICS_URL =
  'https://www.statcan.gc.ca/en/concepts/searchclasscod';

export const BYB_NAICS_LINK_LABEL =
  'North American Industry Classification System (NAICS)';

export const NOTICE_CCA_FILINGS_URL =
  'https://forms.mgcs.gov.on.ca/en/dataset/on00232';

export const BYB_FILING_INSTRUCTIONS: readonly BeforeYouBeginChecklistItem[] = [
  {
    beforeLink:
      'The primary activity is the main activity of your corporation. Please refer to the ',
    linkLabel: BYB_NAICS_LINK_LABEL,
    linkHref: BYB_NAICS_URL,
    afterLink:
      ' for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form. This information will not appear in the public record and is collected for administrative purposes only.',
  },
  {
    text: 'If the application is being made to change the name of the corporation, an Ontario Nuans name search report, dated not more than 90 days before the submission of the application, is required for the proposed name.',
  },
  {
    text: 'If the proposed name of the corporation is similar to the name of an existing corporation, organization, registered business or includes the name of a person, we may require consent to the use of the proposed name from the corporation, organization, business or individual.',
  },
  {
    text: 'Name Change. For a name change request, the Business and Personal Property Branch (BPPB) requires an Ontario Nuans search for the proposed new name. The Nuans name search must be obtained from a private name search company and cannot be dated more than 90 days before the submission of the application. For example, applications submitted on November 28th could be accompanied by a Nuans name search report dated as early as August 30th, but not dated earlier. If the report is dated earlier, a new report will be required. Name search companies are listed in the Yellow Pages under the heading “Searchers of Records”. The name set out in the application must be exactly the same as the name set out in the Nuans name search report. The Ministry will not grant a name that is identical to another corporation or that contravenes the Corporations Act or Regulations. If the proposed name is similar to that of a known corporation, association, partnership, individual or business, or contains the family name of an individual, the consent in writing of the existing corporation, association, partnership, individual or business may be required or BPPB may require that the existing entity dissolve or change its name.',
  },
  {
    text: 'If the application includes a proposed new name, the following statement must be included in item 5, “The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.”',
  },
  {
    beforeLink:
      'For additional information regarding the required documents, information and other filing requirements, please see the following: ',
    linkLabel:
      'Notice – Co-operative Corporations Act – Filings by Co-operative Corporations',
    linkHref: NOTICE_CCA_FILINGS_URL,
  },
];

export const BYB_DOCUMENTS: readonly BeforeYouBeginChecklistItem[] = [
  { text: 'The Ontario Corporation Number (OCN) of the corporation.' },
  {
    text: 'The date on which the shareholders/members approved the resolution authorizing the application.',
  },
  {
    text: 'Details of the provisions for which Supplementary Letters Patent are being requested.',
  },
  { text: 'A Nuans Name Search Report is required when the application includes a name change.' },
  {
    text: 'The Nuans Report must be dated within 90 days of the filing date.',
  },
  {
    text: 'A separate Nuans Report may be required for English and French names that are to be used separately.',
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
  { text: 'Nuans Report (if a name change is requested).' },
  {
    beforeLink: BYB_NUANS_SUPPLIERS_BEFORE,
    linkLabel: BYB_NUANS_SITE_LABEL,
    linkHref: BYB_NUANS_SITE_URL,
    afterLink: BYB_NUANS_SUPPLIERS_AFTER,
  },
  { text: 'Uploaded files must be PDF format only.' },
  { text: 'Uploaded files must be 20 MB maximum file size.' },
];

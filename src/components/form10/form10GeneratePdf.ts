import { formatIsoDateDisplay } from '../form7/form7Labels';
import {
  NOT_PROVIDED,
  escapeHtml,
  openArticlesPdf,
  tableHtml,
  valueHtml,
} from '../shared/articlesPdf';
import type { Form10Draft } from './form10DraftStorage';
import {
  amalgamatedCooperativeName,
  FORM10_AGREEMENT_STATEMENT,
  FORM10_AMALGAMATED_NAME_CAPTION,
  FORM10_AMALGAMATING_NAMES_CAPTION,
  FORM10_CERTIFIED_AGREEMENT_CAPTION,
  FORM10_SIGNATURE_INTRO,
} from './form10ReviewModel';

function formatPdfName(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : NOT_PROVIDED;
}

export function generateForm10ReviewPdf(args: { draft: Form10Draft }) {
  const { draft } = args;
  const amalgamatedName = amalgamatedCooperativeName(draft);
  const coopRows = draft.step2.amalgamatingCooperatives.map((coop) => [
    formatPdfName(coop.legalName),
    coop.ocn.trim() || NOT_PROVIDED,
    coop.membersApprovalDate
      ? formatIsoDateDisplay(coop.membersApprovalDate)
      : NOT_PROVIDED,
  ]);
  const agreementText = draft.step3.certifiedAgreementText?.trim() ?? '';
  const signatureCoops =
    draft.step2.amalgamatingCooperatives.length > 0
      ? draft.step2.amalgamatingCooperatives
      : [{ legalName: '' }];
  const signatureBlocks = signatureCoops
    .map((coop) => {
      const coopName = coop.legalName.trim().toUpperCase();
      return `
    <div class="coop-signature">
      <div class="name-line">${escapeHtml(coopName)}</div>
      <span class="field-label">Name of Co-operative</span>
      <div class="signature-row signature-row--wide">
        <div class="signature-col">
          <div class="signature-line"></div>
          <span class="field-label">Signature</span>
        </div>
        <div class="name-col">
          <div class="name-line"></div>
          <span class="field-label">Print name of signatory</span>
        </div>
        <div class="name-col">
          <div class="name-line"></div>
          <span class="field-label">Description of Office</span>
        </div>
      </div>
    </div>`;
    })
    .join('');

  return openArticlesPdf({
    documentTitle: 'Articles of Amalgamation, Form 10',
    titleLines: ['Articles of Amalgamation', 'Form 10'],
    items: [
      [FORM10_AMALGAMATED_NAME_CAPTION, valueHtml(amalgamatedName.toUpperCase())],
      [FORM10_AGREEMENT_STATEMENT, ''],
      [
        FORM10_AMALGAMATING_NAMES_CAPTION,
        tableHtml(
          [
            'Name of the Co-operatives',
            'Ontario Corporation Number',
            'Dates of Members’ Approval (Year, Month, Day)',
          ],
          coopRows,
        ),
      ],
      [FORM10_CERTIFIED_AGREEMENT_CAPTION, valueHtml(agreementText, '')],
      [
        'These articles are executed for delivery to the Minister.',
        `
    <div class="certified-block">
      <p class="certified-label">Certified</p>
      <p class="certified-intro">${escapeHtml(FORM10_SIGNATURE_INTRO[0])}</p>
      <p class="certified-by">By:</p>
      ${signatureBlocks}
    </div>`,
      ],
    ],
    signatureRows: [],
    omitSignatureSection: true,
  });
}

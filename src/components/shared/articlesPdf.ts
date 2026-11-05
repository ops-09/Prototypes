import { formatMailingAddress, formatPersonName } from './personReviewRows';
import type { DirectorResidentialAddress } from '../form1/form1DraftStorage';

export const NOT_PROVIDED = 'Not provided';
export const NOT_APPLICABLE = 'Not applicable';

export type ArticlesPdfItem = [label: string, html: string];

type PdfPerson = {
  firstName: string;
  middleName: string;
  lastName: string;
  address: DirectorResidentialAddress;
};

type PdfDirector = PdfPerson & { id: string; residentCanadian: string };

type PdfIncorporator = PdfPerson & {
  type: string;
  linkedDirectorId: string;
  corporationName: string;
  signerPosition: string;
  numberOfShares?: string;
  classDesignation?: string;
  amountToBePaid?: string;
};

type DirectorCount = {
  countMode: string;
  fixedNumber: string;
  minimumNumber: string;
  maximumNumber: string;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function valueHtml(value: string, fallback = NOT_PROVIDED) {
  return `<p class="item-value">${escapeHtml(value.trim() || fallback)}</p>`;
}

export function tableHtml(headers: string[], rows: string[][]) {
  if (rows.length === 0) {
    return valueHtml('');
  }
  return `
    <table>
      <thead><tr>${headers
        .map(
          (header) =>
            `<th scope="col">${escapeHtml(header).replace(/\n/g, '<br />')}</th>`,
        )
        .join('')}</tr></thead>
      <tbody>${rows
        .map((cells) => `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>
    </table>`;
}

/** Block capitals for PDF names; leave the empty-state label as written. */
function formatPdfName(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === NOT_PROVIDED) {
    return NOT_PROVIDED;
  }
  return trimmed.toUpperCase();
}

function formatPdfPersonName(person: PdfPerson) {
  const name = formatPersonName(person);
  return name === NOT_PROVIDED ? NOT_PROVIDED : name.toUpperCase();
}

function formatPdfShareAmount(amount: string) {
  const raw = amount.trim().replace(/[$,\s]/g, '');
  if (!raw) {
    return NOT_PROVIDED;
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    return amount.trim();
  }
  const hasCents = raw.includes('.');
  return value.toLocaleString('en-CA', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatDirectorCount(step4: DirectorCount) {
  if (step4.countMode === 'fixed') {
    return step4.fixedNumber.trim()
      ? `Fixed number of directors: ${step4.fixedNumber.trim()}`
      : NOT_PROVIDED;
  }
  if (step4.countMode === 'minMax') {
    return `Minimum number of directors: ${step4.minimumNumber.trim() || NOT_PROVIDED}\nMaximum number of directors: ${step4.maximumNumber.trim() || NOT_PROVIDED}`;
  }
  return NOT_PROVIDED;
}

export function firstDirectorsTableHtml(directors: PdfDirector[]) {
  return tableHtml(
    ['Name in full, including all given names', 'Address', 'Resident Canadian'],
    directors.map((director) => [
      formatPdfPersonName(director),
      formatMailingAddress(director.address),
      director.residentCanadian === 'yes'
        ? 'Yes'
        : director.residentCanadian === 'no'
          ? 'No'
          : NOT_PROVIDED,
    ]),
  );
}

function linkedDirector<D extends PdfDirector>(incorporator: PdfIncorporator, directors: D[]) {
  return incorporator.linkedDirectorId
    ? directors.find((director) => director.id === incorporator.linkedDirectorId)
    : undefined;
}

export function incorporatorName(incorporator: PdfIncorporator, directors: PdfDirector[]) {
  if (incorporator.type === 'corporation') {
    return formatPdfName(incorporator.corporationName);
  }
  return formatPdfPersonName(linkedDirector(incorporator, directors) ?? incorporator);
}

export function incorporatorAddressesTableHtml(
  incorporators: PdfIncorporator[],
  directors: PdfDirector[],
) {
  return tableHtml(
    ['Incorporators full names, including all given names', 'Residential address'],
    incorporators.map((incorporator) => [
      incorporatorName(incorporator, directors),
      formatMailingAddress((linkedDirector(incorporator, directors) ?? incorporator).address),
    ]),
  );
}

export function incorporatorSharesTableHtml(
  incorporators: PdfIncorporator[],
  directors: PdfDirector[],
) {
  return tableHtml(
    [
      'Incorporators full names, including all given names',
      'Number\nof shares',
      'Class/\nDesignation',
      'Amount to\nbe Paid',
    ],
    incorporators.map((incorporator) => [
      incorporatorName(incorporator, directors),
      incorporator.numberOfShares?.trim() || NOT_PROVIDED,
      incorporator.classDesignation?.trim() || NOT_PROVIDED,
      formatPdfShareAmount(incorporator.amountToBePaid ?? ''),
    ]),
  );
}

/** Signature line name: person, or corporation with signing officer and office. */
export function incorporatorSignatureName(incorporator: PdfIncorporator) {
  const person = [incorporator.firstName, incorporator.middleName, incorporator.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (incorporator.type === 'corporation') {
    const corp = incorporator.corporationName.trim();
    const office = incorporator.signerPosition.trim();
    return [corp, person, office]
      .filter(Boolean)
      .map((part) => part.toUpperCase())
      .join(', ');
  }
  return person ? person.toUpperCase() : '';
}

function itemHtml(number: number, label: string, html: string) {
  return `
    <section class="item">
      <h2><span class="item-number">${number}.</span> ${escapeHtml(withoutBlockCapitalNote(label))}</h2>
      ${html}
    </section>`;
}

/** Paper-form instruction. It is omitted from every generated articles PDF. */
function withoutBlockCapitalNote(value: string) {
  return value.replace(/\s*\(Set out in Block Capital Letters\)/g, '');
}

const INCORPORATOR_SIGNATURE_INTRO =
  'Full name(s) and signature(s) of incorporator(s). In the case of a corporation set out the name of the corporation and the name and office of the person signing on behalf of the corporation';
const INCORPORATOR_NAME_CAPTION =
  'Name of incorporator (or corporation name & signatories name and office)';

function signatureRowHtml(values: string[], captions: string[]) {
  const rowClass = captions.length > 1 ? 'signature-row signature-row--wide' : 'signature-row';
  return `
    <div class="${rowClass}">
      <div class="signature-col">
        <div class="signature-line"></div>
        <span class="field-label">Signature</span>
      </div>${captions
        .map(
          (caption, index) => `
      <div class="name-col">
        <div class="name-line">${escapeHtml(values[index] ?? '')}</div>
        <span class="field-label">${escapeHtml(caption)}</span>
      </div>`,
        )
        .join('')}
    </div>`;
}

const DEFAULT_MINISTRY_LABEL = 'Ministry of Public\nand Business Service Delivery';

/** Header label on Form 1 and Form 2 articles PDFs. */
export const FORM_1_2_MINISTRY_LABEL = 'Ministry of Government\nand Consumer Services';

/** Ministry-style articles PDF: header, ministry-use block, numbered items, and signatures. */
export function openArticlesPdf(args: {
  documentTitle: string;
  titleLines: string[];
  items: ArticlesPdfItem[];
  /** One entry per signature row; each entry holds the pre-filled value for each caption column. */
  signatureRows: string[][];
  /** Captions for the columns after "Signature". Defaults to the incorporator name column. */
  signatureCaptions?: string[];
  signatureIntro?: string[];
  actName?: string;
  /** Heading above signature rows. Pass an empty string to omit it. */
  signatureHeading?: string;
  /** Ministry name under the Ontario logo. A newline becomes a line break. */
  ministryLabel?: string;
  /**
   * When set, the signature block is the next numbered item with this label.
   * The "Signatures" heading is omitted. Intro copy, when present, sits under
   * the numbered label and above the signature lines.
   */
  signatureItemLabel?: string;
  /** When set, replaces the generated signature rows. The caller supplies the markup. */
  signatureBodyHtml?: string;
  /** When true, no signature section is appended. The caller includes it in an item. */
  omitSignatureSection?: boolean;
}) {
  const {
    documentTitle,
    titleLines,
    items,
    signatureRows,
    signatureCaptions = [INCORPORATOR_NAME_CAPTION],
    signatureIntro = [INCORPORATOR_SIGNATURE_INTRO],
    actName = 'Co-operative Corporations Act',
    signatureHeading = 'Signatures',
    ministryLabel = DEFAULT_MINISTRY_LABEL,
    signatureItemLabel,
    omitSignatureSection = false,
    signatureBodyHtml,
  } = args;
  const logoSrc = `${window.location.origin}${import.meta.env.BASE_URL}assets/ontario-logo--desktop.svg`;
  const itemsHtml = items.map(([label, html], index) => itemHtml(index + 1, label, html)).join('');
  const signatureRowsHtml =
    signatureBodyHtml ??
    (signatureRows.length > 0 ? signatureRows : [[]])
      .map((values) => signatureRowHtml(values, signatureCaptions))
      .join('');
  const signatureIntroHtml = signatureIntro
    .map((paragraph) => `<p class="signature-intro">${escapeHtml(paragraph)}</p>`)
    .join('\n    ');
  const signatureHeadingHtml = signatureHeading
    ? `<h2 class="signature-heading">${escapeHtml(signatureHeading)}</h2>`
    : '';
  const signatureSectionClass = signatureHeading
    ? 'signature-section'
    : 'signature-section signature-section--after-execution';
  const signatureBlockHtml = omitSignatureSection
    ? ''
    : signatureItemLabel
    ? itemHtml(
        items.length + 1,
        signatureItemLabel,
        `
    <div class="signature-section signature-section--after-execution">
      ${signatureIntroHtml}
      ${signatureRowsHtml}
    </div>`,
      )
    : `
  <section class="${signatureSectionClass}">
    ${signatureHeadingHtml}
    ${signatureIntroHtml}
    ${signatureRowsHtml}
  </section>`;

  const html = withoutBlockCapitalNote(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    body { font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 2rem; line-height: 1.5; }
    h1, h2 { font-family: "Raleway Modified", "Open Sans", sans-serif; }
    .doc-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: start;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #1a1a1a;
    }
    /* The ODS logo asset is white for the dark app header; invert it for print on white. */
    .doc-logo { width: 9rem; height: auto; filter: invert(1); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-ministry { margin: 0.35rem 0 0; font-size: 0.8125rem; font-weight: 700; line-height: 1.3; }
    .doc-title { margin: 0; font-size: 1.25rem; line-height: 1.3; }
    .doc-title span { display: block; }
    .doc-act { margin: 0; font-style: italic; }
    .item { margin-bottom: 1.5rem; page-break-inside: avoid; }
    .item h2 { display: flex; margin: 0 0 0.5rem; font-size: 1rem; line-height: 1.4; }
    .item-number { flex: 0 0 1.75rem; }
    .item-value { margin: 0 0 0 1.75rem; white-space: pre-wrap; }
    table { width: calc(100% - 1.75rem); margin-left: 1.75rem; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid #ccc; }
    td { white-space: pre-wrap; }
    th { font-weight: 700; border-bottom-color: #1a1a1a; white-space: normal; }
    .certified-block { margin: 0.5rem 0 0 1.75rem; }
    .certified-label {
      margin: 0 0 0.5rem;
      font-family: "Raleway Modified", "Open Sans", sans-serif;
      font-size: 1rem;
      font-weight: 700;
    }
    .certified-name {
      box-sizing: border-box;
      min-height: 2.5rem;
      display: flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      background-color: #dce6ff;
      font-weight: 700;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .certified-caption {
      display: block;
      margin: 0.25rem 0 1rem;
      text-align: center;
      font-size: 0.875rem;
    }
    .certified-caption--block {
      text-align: left;
    }
    .certified-intro { margin: 0 0 1rem; }
    .certified-by { margin: 0 0 0.75rem; font-size: 1rem; }
    .signature-section { margin-top: 2.5rem; page-break-inside: avoid; }
    .signature-section--after-execution { margin-top: 0; margin-left: 1.75rem; }
    .signature-heading { margin: 0 0 0.5rem; font-size: 1rem; }
    .signature-intro { margin: 0 0 1.5rem; }
    .signature-intro + .signature-intro { margin-top: -1.25rem; }
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 1.5rem;
      align-items: end;
      margin-bottom: 1.75rem;
    }
    .signature-row--wide { grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; }
    .coop-signature { margin: 1.25rem 0 0.5rem; }
    .coop-signature > .field-label { margin-bottom: 1.25rem; }
    .corp-signature-block {
      margin: 0 0 1rem;
      page-break-inside: avoid;
    }
    .corp-signature-block + .corp-signature-block {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 2px solid #1a1a1a;
    }
    .signature-col,
    .name-col {
      min-width: 0;
    }
    .signature-line {
      box-sizing: border-box;
      width: 100%;
      min-height: 2.5rem;
      border-bottom: 1px solid #1a1a1a;
    }
    .name-line {
      box-sizing: border-box;
      width: 100%;
      min-height: 2.5rem;
      border-bottom: 1px solid #1a1a1a;
      display: flex;
      align-items: flex-end;
      padding-bottom: 0.25rem;
      font-size: 1rem;
    }
    .field-label {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      line-height: 1.3;
      color: #1a1a1a;
    }
    .stamp-section {
      margin: 0 0 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #1a1a1a;
      page-break-inside: avoid;
    }
    .stamp-top {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1.5rem;
      align-items: end;
      margin-bottom: 0.75rem;
    }
    .stamp-heading {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }
    .ocn-field { width: 16rem; margin: 0; justify-self: end; }
    .ocn-line {
      box-sizing: border-box;
      width: 100%;
      min-height: 2.5rem;
      border-bottom: 1px solid #1a1a1a;
    }
    .stamp-box {
      box-sizing: border-box;
      min-height: 12rem;
      border: 2px dashed #1a1a1a;
      border-radius: 4px;
      background-color: #f2f2f2;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <img class="doc-logo" src="${escapeHtml(logoSrc)}" alt="Ontario" />
    <p class="doc-ministry">${escapeHtml(ministryLabel).replace(/\n/g, '<br />')}</p>
    <div>
      <h1 class="doc-title">
${titleLines.map((line) => `        <span>${escapeHtml(line)}</span>`).join('\n')}
      </h1>
      <p class="doc-act">${escapeHtml(actName)}</p>
    </div>
  </header>
  <section class="stamp-section" aria-label="This space is for Ministry use only">
    <div class="stamp-top">
      <h2 class="stamp-heading">This space is for Ministry use only</h2>
      <div class="ocn-field">
        <div class="ocn-line"></div>
        <span class="field-label">Ontario Corporation Number</span>
      </div>
    </div>
    <div class="stamp-box"></div>
  </section>
  ${itemsHtml}
  ${signatureBlockHtml}
</body>
</html>`);

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    return false;
  }
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
    URL.revokeObjectURL(url);
  });
  return true;
}

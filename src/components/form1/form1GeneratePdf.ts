import {
  formatMailingAddress,
  formatPersonName,
  formatShareSummary,
} from '../shared/personReviewRows';
import type { Form1Draft, Form1Incorporator, Form1Step4Data } from './form1DraftStorage';
import { formatIncorporatorFullName } from './Form1IncorporatorEditor';
import { formatHeadOffice } from './form1ReviewModel';

const NOT_PROVIDED = 'Not provided';
const NOT_APPLICABLE = 'Not applicable';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function text(value: string, fallback = NOT_PROVIDED) {
  return escapeHtml(value.trim() || fallback);
}

function incorporatorDisplayName(incorporator: Form1Incorporator): string {
  if (incorporator.type === 'corporation') {
    const corp = incorporator.corporationName.trim();
    const signer = formatIncorporatorFullName(incorporator);
    const office = incorporator.signerPosition.trim();
    return [corp, signer, office].filter(Boolean).join(', ') || '';
  }
  return formatIncorporatorFullName(incorporator);
}

function formatDirectorCount(step4: Form1Step4Data) {
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

function formatHeadOfficeLocation(draft: Form1Draft) {
  const step3 = draft.step3;
  const municipality = step3.municipalityName.trim() || step3.cityTown.trim();
  const municipalityLine = municipality
    ? [step3.municipalityStatus.trim(), municipality].filter(Boolean).join(' of ')
    : '';
  const countyLine = step3.countyName.trim()
    ? [step3.countyStatus.trim(), step3.countyName.trim()].filter(Boolean).join(' of ')
    : '';
  return [municipalityLine, countyLine].filter(Boolean).join(', ');
}

function itemHtml(number: number, label: string, valueHtml: string) {
  return `
    <section class="item">
      <h2><span class="item-number">${number}.</span> ${escapeHtml(label)}</h2>
      ${valueHtml}
    </section>`;
}

function valueHtml(value: string, fallback = NOT_PROVIDED) {
  return `<p class="item-value">${text(value, fallback)}</p>`;
}

function tableHtml(headers: string[], rows: string[][]) {
  if (rows.length === 0) {
    return valueHtml('');
  }
  return `
    <table>
      <thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>${rows
        .map((cells) => `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>
    </table>`;
}

function incorporatorPerson(draft: Form1Draft, incorporator: Form1Incorporator) {
  return incorporator.linkedDirectorId
    ? draft.step4.directors.find((director) => director.id === incorporator.linkedDirectorId)
    : undefined;
}

function incorporatorName(draft: Form1Draft, incorporator: Form1Incorporator) {
  if (incorporator.type === 'corporation') {
    return incorporator.corporationName.trim() || NOT_PROVIDED;
  }
  return formatPersonName(incorporatorPerson(draft, incorporator) ?? incorporator);
}

function signatureRowHtml(name: string) {
  return `
    <div class="signature-row">
      <div class="signature-col">
        <div class="signature-line"></div>
        <span class="field-label">Signature</span>
      </div>
      <div class="name-col">
        <div class="name-line">${escapeHtml(name)}</div>
        <span class="field-label">Name of incorporator (or corporation name &amp; signatories name and office)</span>
      </div>
    </div>`;
}

function buildItemsHtml(draft: Form1Draft) {
  const { step1, step4, step5, step6, step7 } = draft;
  const multiStakeholder = step4.multiStakeholder === 'yes';
  const stakeholderFallback = multiStakeholder ? NOT_PROVIDED : NOT_APPLICABLE;

  const items: Array<[string, string]> = [
    ['Name of the co-operative', valueHtml(step1.cooperativeName)],
    [
      'Head office (status/name of municipality, county/district)',
      valueHtml(formatHeadOfficeLocation(draft)),
    ],
    ['Address of head office', valueHtml(formatHeadOffice(draft.step3))],
    ['Number of directors', valueHtml(formatDirectorCount(step4))],
    [
      'Number of directors each stakeholder group may elect',
      valueHtml(multiStakeholder ? step4.stakeholderDirectorsText : '', stakeholderFallback),
    ],
    [
      'First directors (name, address, resident Canadian)',
      tableHtml(
        ['Name', 'Address', 'Resident Canadian'],
        step4.directors.map((director) => [
          formatPersonName(director),
          formatMailingAddress(director.address),
          director.residentCanadian === 'yes'
            ? 'Yes'
            : director.residentCanadian === 'no'
              ? 'No'
              : NOT_PROVIDED,
        ]),
      ),
    ],
    ['Restrictions on business/powers', valueHtml(step5.businessPowersRestrictions)],
    ['Authorized capital for each class of share', valueHtml(step5.authorizedCapital)],
    [
      'Designations/preferences/rights of preference shares',
      valueHtml(step5.preferenceShareTerms),
    ],
    [
      'Restrictions on allotment, issue or transfer of shares',
      valueHtml(step5.shareTransferRestrictions),
    ],
    ['Classes of membership', valueHtml(step6.membershipClasses)],
    ['Terms and conditions of membership classes', valueHtml(step6.membershipClassTerms)],
    ['Stakeholder groups', valueHtml(step6.stakeholderGroups, stakeholderFallback)],
    [
      'Terms and conditions for stakeholder group membership',
      valueHtml(step6.stakeholderGroupTerms, stakeholderFallback),
    ],
    ['Special provisions', valueHtml(step6.specialProvisions)],
    [
      'Shares to be taken by incorporators',
      tableHtml(
        ['Incorporator', 'Shares'],
        step7.incorporators.map((incorporator) => [
          incorporatorName(draft, incorporator),
          formatShareSummary(incorporator),
        ]),
      ),
    ],
    [
      'Names and residential addresses of incorporators',
      tableHtml(
        ['Name', 'Residential address'],
        step7.incorporators.map((incorporator) => [
          incorporatorName(draft, incorporator),
          formatMailingAddress((incorporatorPerson(draft, incorporator) ?? incorporator).address),
        ]),
      ),
    ],
  ];

  return items.map(([label, html], index) => itemHtml(index + 1, label, html)).join('');
}

export function generateForm1ReviewPdf(args: { draft: Form1Draft }) {
  const { draft } = args;
  const logoSrc = `${window.location.origin}${import.meta.env.BASE_URL}assets/ontario-logo--desktop.svg`;

  const incorporators = draft.step7.incorporators;
  const signatureRowsHtml =
    incorporators.length > 0
      ? incorporators
          .map((entry) => signatureRowHtml(incorporatorDisplayName(entry)))
          .join('')
      : signatureRowHtml('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Articles of Incorporation, Form 1</title>
  <style>
    body { font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 2rem; line-height: 1.5; }
    h1, h2 { font-family: "Raleway Modified", "Open Sans", sans-serif; }
    .doc-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: start;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #1a1a1a;
    }
    /* The ODS logo asset is white for the dark app header; invert it for print on white. */
    .doc-logo { width: 9rem; height: auto; filter: invert(1); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-ministry { margin: 0.35rem 0 0; font-size: 0.8125rem; font-weight: 700; line-height: 1.3; }
    .doc-title { margin: 0; font-size: 1.25rem; line-height: 1.3; }
    .doc-title span { display: block; }
    .doc-act { margin: 0; font-style: italic; }
    .item { margin-bottom: 1.5rem; page-break-inside: avoid; }
    .item h2 { margin: 0 0 0.5rem; font-size: 1rem; line-height: 1.4; }
    .item-number { display: inline-block; min-width: 1.75rem; }
    .item-value { margin: 0 0 0 1.75rem; white-space: pre-wrap; }
    table { width: calc(100% - 1.75rem); margin-left: 1.75rem; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid #ccc; }
    td { white-space: pre-wrap; }
    th { font-weight: 700; border-bottom-color: #1a1a1a; }
    .signature-section { margin-top: 2.5rem; page-break-inside: avoid; }
    .signature-heading { margin: 0 0 0.5rem; font-size: 1rem; }
    .signature-intro { margin: 0 0 0.25rem; }
    .signature-intro-detail { margin: 0 0 1.5rem; }
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 1.5rem;
      align-items: end;
      margin-bottom: 1.75rem;
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
      margin-top: 2.5rem;
      page-break-inside: avoid;
    }
    .stamp-heading {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 700;
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
    <p class="doc-ministry">Ministry of Public<br />and Business Service Delivery</p>
    <div>
      <h1 class="doc-title">
        <span>Articles of Incorporation of a</span>
        <span>Co-operative with Share Capital</span>
        <span>Form 1</span>
      </h1>
      <p class="doc-act">Co-operative Corporations Act</p>
    </div>
  </header>
  ${buildItemsHtml(draft)}
  <section class="signature-section">
    <h2 class="signature-heading">Signatures</h2>
    <p class="signature-intro">These articles are signed in duplicate.</p>
    <p class="signature-intro-detail">
      Full name(s) and signature(s) of incorporator(s). In the case of a corporation set out the name of the corporation and the name and office of the person signing on behalf of the corporation
    </p>
    ${signatureRowsHtml}
  </section>
  <footer class="stamp-section" aria-label="This space for ministry use only">
    <h2 class="stamp-heading">This space for ministry use only</h2>
    <div class="stamp-box"></div>
  </footer>
</body>
</html>`;

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

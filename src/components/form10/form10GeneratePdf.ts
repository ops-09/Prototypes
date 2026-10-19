import type { Form10Draft } from './form10DraftStorage';
import { buildReviewSections } from './form10ReviewModel';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function signatureBlockHtml(cooperativeName: string, blockIndex: number) {
  return `
    <div class="signature-block">
      <h3>Signature ${blockIndex} — ${escapeHtml(cooperativeName)}</h3>
      <p class="coop-name-label">Name of co-operative</p>
      <p class="coop-name-value">${escapeHtml(cooperativeName)}</p>
      <div class="signature-row">
        <div class="signature-col">
          <div class="signature-line"></div>
          <span class="field-label">Signature</span>
        </div>
        <div class="name-col">
          <div class="name-line"></div>
          <span class="field-label">Name of signatory</span>
        </div>
        <div class="office-col">
          <div class="name-line"></div>
          <span class="field-label">Description of office</span>
        </div>
      </div>
    </div>`;
}

export function generateForm10ReviewPdf(args: { draft: Form10Draft }) {
  const { draft } = args;
  const sections = buildReviewSections(draft);

  const sectionHtml = sections
    .map((section) => {
      const rows = section.rows
        .filter((row) => row.name !== 'Official email')
        .map(
          (row) => `
          <tr>
            <th scope="row">${escapeHtml(row.name)}</th>
            <td>${escapeHtml(row.description).replace(/\n/g, '<br />')}</td>
          </tr>`,
        )
        .join('');
      return `
        <section>
          <h2>${escapeHtml(section.caption)} (${section.complete ? 'Complete' : 'Incomplete'})</h2>
          <table>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    })
    .join('');

  // Two signature blocks per amalgamating co-operative (director/officer).
  const signatureBlocksHtml = draft.step2.amalgamatingCooperatives
    .map((coop) => {
      const name = coop.legalName.trim() || 'Amalgamating co-operative';
      return `${signatureBlockHtml(name, 1)}${signatureBlockHtml(name, 2)}`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Articles of Amalgamation — Review PDF</title>
  <style>
    body { font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 2rem; line-height: 1.5; }
    h1, h2, h3 { font-family: "Raleway Modified", "Open Sans", sans-serif; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid #ccc; }
    th { width: 40%; font-weight: 700; }
    .meta { margin-bottom: 2rem; font-style: italic; }
    .signature-section { margin-top: 2.5rem; }
    .signature-intro { margin: 0 0 0.25rem; }
    .signature-intro-detail { margin: 0 0 1.5rem; }
    .signature-block { margin-bottom: 2rem; page-break-inside: avoid; }
    .signature-block h3 { margin: 0 0 0.75rem; font-size: 1.05rem; }
    .coop-name-label { margin: 0; font-size: 0.75rem; }
    .coop-name-value { margin: 0 0 1rem; font-weight: 700; }
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      align-items: end;
    }
    .signature-col,
    .name-col,
    .office-col { min-width: 0; }
    .signature-line,
    .name-line {
      box-sizing: border-box;
      width: 100%;
      min-height: 2.5rem;
      border-bottom: 1px solid #1a1a1a;
    }
    .field-label {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      line-height: 1.3;
    }
    .stamp-section { margin-top: 2.5rem; page-break-inside: avoid; }
    .stamp-heading { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 700; }
    .stamp-box {
      box-sizing: border-box;
      min-height: 12rem;
      border: 2px dashed #1a1a1a;
      border-radius: 4px;
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <h1>Articles of Amalgamation</h1>
  <p class="meta">Form 10 Co-operative Corporations Act</p>
  ${sectionHtml}
  <section class="signature-section">
    <p class="signature-intro">These articles must be signed by a director or officer (e.g. president, secretary) of each amalgamating corporation.</p>
    <p class="signature-intro-detail">
      Two signature blocks are provided for each amalgamating co-operative.
    </p>
    ${signatureBlocksHtml}
  </section>
  <section class="stamp-section" aria-label="This space is for Ministry Use Only">
    <h2 class="stamp-heading">This space is for Ministry Use Only</h2>
    <div class="stamp-box"></div>
  </section>
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

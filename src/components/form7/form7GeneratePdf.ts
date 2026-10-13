import type { Form7Draft } from './form7DraftStorage';
import { amendmentTypeLabel } from './form7Labels';
import { buildReviewSections } from './form7ReviewModel';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function signatureRowHtml(name = '', office = '') {
  return `
    <div class="signature-row">
      <div class="signature-col">
        <div class="signature-line"></div>
        <span class="field-label">Signature</span>
      </div>
      <div class="name-col">
        <div class="name-line">${escapeHtml(name)}</div>
        <span class="field-label">Name</span>
      </div>
      <div class="office-col">
        <div class="name-line">${escapeHtml(office)}</div>
        <span class="field-label">Description of office</span>
      </div>
    </div>`;
}

export function generateForm7ReviewPdf(args: { draft: Form7Draft }) {
  const { draft } = args;
  const sections = buildReviewSections(draft);

  const sectionHtml = sections
    .map((section) => {
      const rows = section.rows
        // Official email stays on the review page; omit it from the printable PDF.
        .filter((row) => row.name !== 'Official email')
        .map(
          (row) => `
          <tr>
            <th scope="row">${escapeHtml(row.name)}</th>
            <td>${escapeHtml(row.description)}</td>
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

  // Articles of Amendment typically require two authorizing signatures.
  const signatureRowsHtml = `${signatureRowHtml()}${signatureRowHtml()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Articles of Amendment — Review PDF</title>
  <style>
    body { font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 2rem; line-height: 1.5; }
    h1, h2 { font-family: "Raleway Modified", "Open Sans", sans-serif; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid #ccc; }
    th { width: 40%; font-weight: 700; }
    .meta { margin-bottom: 2rem; }
    .signature-section { margin-top: 2.5rem; page-break-inside: avoid; }
    .signature-intro { margin: 0 0 0.25rem; }
    .signature-intro-detail { margin: 0 0 1.5rem; }
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      align-items: end;
      margin-bottom: 1.75rem;
    }
    .signature-col,
    .name-col,
    .office-col {
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
    }
  </style>
</head>
<body>
  <h1>Articles of Amendment</h1>
  <p class="meta">Amendment type: ${escapeHtml(amendmentTypeLabel(draft.step2.amendmentType))}</p>
  ${sectionHtml}
  <section class="signature-section">
    <p class="signature-intro">These articles are signed in duplicate.</p>
    <p class="signature-intro-detail">
      Signature, name, and description of office of the person(s) authorizing the amendment.
    </p>
    ${signatureRowsHtml}
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

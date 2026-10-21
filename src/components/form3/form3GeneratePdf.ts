import type { Form3Draft } from './form3DraftStorage';
import { buildReviewSections } from './form3ReviewModel';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function signatureRowHtml() {
  return `
    <div class="signature-row">
      <div class="signature-col">
        <div class="signature-line"></div>
        <span class="field-label">Signature</span>
      </div>
      <div class="name-col">
        <div class="name-line"></div>
        <span class="field-label">Name of Signatory</span>
      </div>
      <div class="office-col">
        <div class="name-line"></div>
        <span class="field-label">Description of Office</span>
      </div>
    </div>`;
}

export function generateForm3ReviewPdf(args: { draft: Form3Draft }) {
  const { draft } = args;
  const sections = buildReviewSections(draft);

  const sectionHtml = sections
    .map((section) => {
      const rows = section.rows
        .filter((row) => row.name.toUpperCase() !== 'OCN')
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
          <h2>${escapeHtml(section.caption)}</h2>
          <table>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Application for Supplementary Letters Patent, Form 3, Corporations Act</title>
  <style>
    body { font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 2rem; line-height: 1.5; }
    h1, h2 { font-family: "Raleway Modified", "Open Sans", sans-serif; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid #ccc; }
    th { width: 40%; font-weight: 700; }
    .meta { margin-bottom: 2rem; }
    .signature-section { margin-top: 2.5rem; page-break-inside: avoid; }
    .signature-intro { margin: 0 0 1.5rem; }
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      align-items: end;
      margin-bottom: 1.75rem;
    }
    .signature-line, .name-line {
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
    .stamp-box {
      box-sizing: border-box;
      min-height: 12rem;
      border: 2px dashed #1a1a1a;
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <h1>Application for Supplementary Letters Patent, Form 3, Corporations Act</h1>
  <p class="meta">Corporation: ${escapeHtml(draft.step1.corporationName)}</p>
  ${sectionHtml}
  <section class="signature-section">
    <p class="signature-intro">These articles are signed in duplicate.</p>
    ${signatureRowHtml()}
    ${signatureRowHtml()}
  </section>
  <section class="stamp-section" aria-label="This space is for Ministry Use Only">
    <h2>This space is for Ministry Use Only</h2>
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

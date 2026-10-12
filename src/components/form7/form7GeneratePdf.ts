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

export function generateForm7ReviewPdf(args: { draft: Form7Draft }) {
  const { draft } = args;
  const generatedAt = new Date().toLocaleString('en-CA');
  const sections = buildReviewSections(draft);

  const sectionHtml = sections
    .map((section) => {
      const rows = section.rows
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
    .signature-section { margin-top: 2rem; page-break-inside: avoid; }
    .signature-box {
      box-sizing: border-box;
      width: 100%;
      min-height: 7rem;
      margin: 0.75rem 0 1.5rem;
      border: 2px solid #1a1a1a;
      background: #fff;
    }
    .signature-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 2rem;
    }
    .signature-field {
      border-bottom: 1px solid #1a1a1a;
      padding-bottom: 0.25rem;
      min-height: 2.5rem;
    }
    .signature-field-label {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.875rem;
    }
    .signature-instruction { margin: 0 0 0.75rem; }
  </style>
</head>
<body>
  <h1>Articles of Amendment</h1>
  <p class="meta">PDF generated: ${escapeHtml(generatedAt)}</p>
  <p class="meta">Amendment type: ${escapeHtml(amendmentTypeLabel(draft.step2.amendmentType))}</p>
  ${sectionHtml}
  <section class="signature-section">
    <h2>Signature</h2>
    <p class="signature-instruction">
      Sign in the box below. After signing, upload the signed PDF on the filing review page.
    </p>
    <div class="signature-box" aria-label="Signature area"></div>
    <div class="signature-fields">
      <div>
        <div class="signature-field"></div>
        <span class="signature-field-label">Print name</span>
      </div>
      <div>
        <div class="signature-field"></div>
        <span class="signature-field-label">Date</span>
      </div>
    </div>
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

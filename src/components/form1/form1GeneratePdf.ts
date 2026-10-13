import type { Form1Draft, Form1Incorporator } from './form1DraftStorage';
import { formatIncorporatorFullName } from './Form1IncorporatorEditor';
import { buildReviewSections } from './form1ReviewModel';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

export function generateForm1ReviewPdf(args: { draft: Form1Draft }) {
  const { draft } = args;
  const sections = buildReviewSections(draft);
  const coopName =
    draft.step1.languageOption === 'separate'
      ? draft.step1.englishName || draft.step1.frenchName
      : draft.step1.cooperativeName;

  const sectionHtml = sections
    // Cover letter contact stays on the review page; omit it from the printable PDF.
    .filter((section) => section.key !== 'contact')
    .map((section) => {
      const rows = section.rows
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
  <title>Articles of Incorporation — Review PDF</title>
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      min-height: 12rem;
      padding: 2rem 1rem;
      border: 2px dashed #1a1a1a;
      border-radius: 4px;
      background-color: #f2f2f2;
      text-align: center;
    }
    .stamp-lead {
      margin: 0;
      font-weight: 700;
    }
    .stamp-hint {
      margin: 0;
      font-size: 0.875rem;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Articles of Incorporation</h1>
  <p class="meta">Co-operative: ${escapeHtml(coopName.trim() || 'Not provided')}</p>
  ${sectionHtml}
  <section class="signature-section">
    <p class="signature-intro">These articles are signed in duplicate.</p>
    <p class="signature-intro-detail">
      Full name(s) and signature(s) of incorporator(s). In the case of a corporation set out the name of the corporation and the name and office of the person signing on behalf of the corporation
    </p>
    ${signatureRowsHtml}
  </section>
  <section class="stamp-section" aria-label="Stamp area">
    <h2 class="stamp-heading">Stamp</h2>
    <div class="stamp-box">
      <p class="stamp-lead">Official stamp area</p>
      <p class="stamp-hint">For office use only</p>
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

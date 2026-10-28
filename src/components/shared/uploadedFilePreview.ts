/**
 * Drafts only persist file metadata in sessionStorage, so the File objects picked during
 * this page session are kept in memory to let review pages open them in a new tab.
 */
export type ReviewFileLink = {
  name: string;
  size: number;
};

const filesByKey = new Map<string, File>();

function fileKey(file: ReviewFileLink) {
  return `${file.name}:${file.size}`;
}

export function rememberUploadedFile(file: File) {
  filesByKey.set(fileKey(file), file);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function previewUnavailablePage(name: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(
    name,
  )}</title></head><body style="font-family: sans-serif; padding: 2rem"><h1>${escapeHtml(
    name,
  )}</h1><p>A preview isn't available because the file was uploaded before the page was reloaded. Upload the file again to preview it.</p></body></html>`;
}

export function openUploadedFile(file: ReviewFileLink) {
  const stored = filesByKey.get(fileKey(file));
  const blob = stored ?? new Blob([previewUnavailablePage(file.name)], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

import type { AmendmentType } from './form7DraftStorage';

export const AMENDMENT_TYPE_LABELS: Record<AmendmentType, string> = {
  'change-name': 'Articles of Amendment',
  'convert-business-corp':
    'Articles of Amendment (converting to a Business Corporations Act Corporation)',
  'convert-not-for-profit':
    'Articles of Amendment (converting to a Not-for-Profit Corporations Act, 2010 Corporation)',
  'reduction-capital': 'Reduction of Authorized Capital',
  'amend-other': 'Other Amendment',
};

export function amendmentTypeLabel(type: AmendmentType | '') {
  if (!type) {
    return 'Not provided';
  }
  return AMENDMENT_TYPE_LABELS[type];
}

export function formatIsoDateDisplay(value: string) {
  if (!value) {
    return 'Not provided';
  }
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return value;
  }
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('en-CA');
}

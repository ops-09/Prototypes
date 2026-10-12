import { isIsoDateComplete } from '../form1/nameValidation';

export const NUANS_EXPIRED_ERROR =
  'The attached NUANS Report is no longer valid. A NUANS Report must be issued within 90 days of the filing date. Please provide a current report.';

export const NUANS_REQUIRED_ERROR = 'Upload a NUANS report.';
export const NUANS_DATE_REQUIRED_ERROR = 'Enter the NUANS report date.';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDay(value: string): Date | null {
  if (!isIsoDateComplete(value)) {
    return null;
  }
  const dayPart = value.slice(0, 10);
  const [y, m, d] = dayPart.split('-').map(Number);
  if (!y || !m || !d) {
    return null;
  }
  return new Date(Date.UTC(y, m - 1, d));
}

/** Returns an error if the NUANS report date is missing or older than 90 days from today. */
export function validateNuansDate(value: string, today: Date = new Date()): string | undefined {
  if (!isIsoDateComplete(value)) {
    return NUANS_DATE_REQUIRED_ERROR;
  }

  const reportDay = parseIsoDay(value);
  if (!reportDay) {
    return NUANS_DATE_REQUIRED_ERROR;
  }

  const todayUtc = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const ageDays = Math.floor((todayUtc.getTime() - reportDay.getTime()) / MS_PER_DAY);
  if (ageDays > 90) {
    return NUANS_EXPIRED_ERROR;
  }

  return undefined;
}

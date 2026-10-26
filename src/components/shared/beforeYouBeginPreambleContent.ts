/** Shared copy for Before you begin preamble (ODS template). */

export const BYB_PAGE_TITLE = 'Before you begin';

export const BYB_ESTIMATED_TIME_HEADING = 'Estimated time to complete';

export function buildBybLead(formName: string): string {
  return `Please review the following information before starting your ${formName}.`;
}

/** Display name inserted into the lead — join title lines from form content. */
export function bybFormNameFromTitleLines(
  lines: readonly string[],
): string {
  return lines.join(' ');
}

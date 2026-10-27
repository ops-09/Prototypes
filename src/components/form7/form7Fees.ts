import type { AmendmentType } from './form7DraftStorage';

export type FilingFeeLine = {
  label: string;
  amount: number;
};

/** Prototype fee schedule for Articles of Amendment (Form 7). */
const FEE_BY_TYPE: Record<AmendmentType, FilingFeeLine> = {
  'change-name': { label: 'Name change fee', amount: 155 },
  'convert-business-corp': { label: 'Conversion fee', amount: 330 },
  'convert-not-for-profit': { label: 'Conversion fee', amount: 330 },
  'reduce-authorized-capital': {
    label: 'Reduction of authorized capital fee',
    amount: 155,
  },
  'amend-other': { label: 'Other amendment fee', amount: 155 },
};

export function getFilingFees(amendmentType: AmendmentType | ''): FilingFeeLine[] {
  if (!amendmentType) {
    return [];
  }

  return [FEE_BY_TYPE[amendmentType]];
}

export function getFilingFeeTotal(lines: FilingFeeLine[]) {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export function formatCad(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

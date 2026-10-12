/**
 * Prototype phone validation aligned with typical Account / Profile rules
 * (Canadian NANP 10-digit number in a single field; optional numeric extension).
 * Replace with shared Account validation when #68749 lands.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizePhoneNumber(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value.trim();
}

export type PhoneFieldErrors = {
  phoneNumber?: string;
  phoneExtension?: string;
};

export function validatePhoneFields(args: {
  phoneNumber: string;
  phoneExtension: string;
}): PhoneFieldErrors {
  const errors: PhoneFieldErrors = {};
  const digits = digitsOnly(args.phoneNumber);
  const extension = args.phoneExtension.trim();

  if (!digits) {
    errors.phoneNumber = 'Enter your phone number.';
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // Accept leading country code 1; normalize on save.
  } else if (digits.length !== 10) {
    errors.phoneNumber = 'Enter a 10-digit phone number (for example, 555-555-5555).';
  }

  if (extension && !/^\d{1,10}$/.test(digitsOnly(extension))) {
    errors.phoneExtension = 'Enter a valid extension using digits only.';
  }

  return errors;
}

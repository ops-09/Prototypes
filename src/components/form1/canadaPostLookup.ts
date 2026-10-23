/** Prototype Canada Post address lookup for Form 1 head office (Ontario only). */

export type AddressLookupResult = {
  id: string;
  /** One-line label shown in the results list. */
  label: string;
  unitType: string;
  roomNumber: string;
  streetNumber: string;
  streetName: string;
  streetNumberSuffix: string;
  streetType: string;
  streetDirection: string;
  cityTown: string;
  postalCode: string;
  municipalityStatus: string;
  municipalityName: string;
  countyStatus: string;
  countyName: string;
};

export const FIND_POSTAL_CODE_URL =
  'https://www.canadapost-postescanada.ca/cpc/en/tools/find-a-postal-code.page';

export const POSTAL_CODE_FORMAT_ERROR = 'Please enter a valid postal code.';
export const POSTAL_CODE_ONTARIO_ERROR =
  'The head office address must be located in Ontario.';
export const POSTAL_CODE_NOT_FOUND_ERROR =
  'No address was found for the postal code entered. Please check the postal code and try again.';

const ONTARIO_FSA_LETTERS = new Set(['K', 'L', 'M', 'N', 'P']);

/** Normalize to uppercase letters/digits only (no space). */
export function normalizePostalCode(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** Format as A1A 1A1 when possible. */
export function formatPostalCode(value: string) {
  const compact = normalizePostalCode(value);
  if (compact.length <= 3) {
    return compact;
  }
  return `${compact.slice(0, 3)} ${compact.slice(3, 6)}`;
}

export function isValidPostalCodeFormat(value: string) {
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalizePostalCode(value));
}

export function isOntarioPostalCode(value: string) {
  const compact = normalizePostalCode(value);
  return ONTARIO_FSA_LETTERS.has(compact.charAt(0));
}

/** Suggestion line: postal code first, then street address. */
export function formatAddressSuggestion(entry: AddressLookupResult) {
  return `${entry.postalCode} — ${entry.label.replace(`, ON ${entry.postalCode}`, '')}`;
}

/** Street line used when lookup results populate Street & Number (or R.R. Number). */
export function formatStreetAndNumber(entry: AddressLookupResult) {
  return [
    entry.streetNumber,
    entry.streetNumberSuffix,
    entry.streetName,
    entry.streetType,
    entry.streetDirection,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

export const MOCK_ADDRESSES: AddressLookupResult[] = [
  {
    id: 'm5h-1',
    label: '100 Queen St W, Toronto, ON M5H 2N2',
    unitType: '',
    roomNumber: '',
    streetNumber: '100',
    streetName: 'Queen',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: 'W',
    cityTown: 'Toronto',
    postalCode: 'M5H 2N2',
    municipalityStatus: 'City',
    municipalityName: 'Toronto',
    countyStatus: 'Regional Municipality',
    countyName: 'Toronto',
  },
  {
    id: 'm5h-suite',
    label: 'Suite 400, 123 King St W, Toronto, ON M5H 1A1',
    unitType: 'Suite',
    roomNumber: '400',
    streetNumber: '123',
    streetName: 'King',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: 'W',
    cityTown: 'Toronto',
    postalCode: 'M5H 1A1',
    municipalityStatus: 'City',
    municipalityName: 'Toronto',
    countyStatus: 'Regional Municipality',
    countyName: 'Toronto',
  },
  {
    id: 'm5j-1',
    label: '200 Bay St, Toronto, ON M5J 2J2',
    unitType: '',
    roomNumber: '',
    streetNumber: '200',
    streetName: 'Bay',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: '',
    cityTown: 'Toronto',
    postalCode: 'M5J 2J2',
    municipalityStatus: 'City',
    municipalityName: 'Toronto',
    countyStatus: 'Regional Municipality',
    countyName: 'Toronto',
  },
  {
    id: 'm5v-1',
    label: '250 Fort York Blvd, Toronto, ON M5V 3K9',
    unitType: '',
    roomNumber: '',
    streetNumber: '250',
    streetName: 'Fort York',
    streetNumberSuffix: '',
    streetType: 'Blvd',
    streetDirection: '',
    cityTown: 'Toronto',
    postalCode: 'M5V 3K9',
    municipalityStatus: 'City',
    municipalityName: 'Toronto',
    countyStatus: 'Regional Municipality',
    countyName: 'Toronto',
  },
  {
    id: 'k1a-1',
    label: '111 Wellington St, Ottawa, ON K1A 0A6',
    unitType: '',
    roomNumber: '',
    streetNumber: '111',
    streetName: 'Wellington',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: '',
    cityTown: 'Ottawa',
    postalCode: 'K1A 0A6',
    municipalityStatus: 'City',
    municipalityName: 'Ottawa',
    countyStatus: 'Regional Municipality',
    countyName: 'Ottawa',
  },
  {
    id: 'k1p-1',
    label: '90 Sparks St, Ottawa, ON K1P 5B4',
    unitType: '',
    roomNumber: '',
    streetNumber: '90',
    streetName: 'Sparks',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: '',
    cityTown: 'Ottawa',
    postalCode: 'K1P 5B4',
    municipalityStatus: 'City',
    municipalityName: 'Ottawa',
    countyStatus: 'Regional Municipality',
    countyName: 'Ottawa',
  },
  {
    id: 'l5b-1',
    label: '300 City Centre Dr, Mississauga, ON L5B 3C1',
    unitType: '',
    roomNumber: '',
    streetNumber: '300',
    streetName: 'City Centre',
    streetNumberSuffix: '',
    streetType: 'Dr',
    streetDirection: '',
    cityTown: 'Mississauga',
    postalCode: 'L5B 3C1',
    municipalityStatus: 'City',
    municipalityName: 'Mississauga',
    countyStatus: 'Regional Municipality',
    countyName: 'Peel',
  },
  {
    id: 'n2g-1',
    label: '200 King St E, Kitchener, ON N2G 2L1',
    unitType: '',
    roomNumber: '',
    streetNumber: '200',
    streetName: 'King',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: 'E',
    cityTown: 'Kitchener',
    postalCode: 'N2G 2L1',
    municipalityStatus: 'City',
    municipalityName: 'Kitchener',
    countyStatus: 'Regional Municipality',
    countyName: 'Waterloo',
  },
  {
    id: 'p3e-1',
    label: '200 Brady St, Sudbury, ON P3E 3L9',
    unitType: '',
    roomNumber: '',
    streetNumber: '200',
    streetName: 'Brady',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: '',
    cityTown: 'Sudbury',
    postalCode: 'P3E 3L9',
    municipalityStatus: 'City',
    municipalityName: 'Greater Sudbury',
    countyStatus: 'District',
    countyName: 'Sudbury',
  },
  // Canada-wide examples for director residential addresses (not Ontario-only).
  {
    id: 'v6b-1',
    label: '401 W Georgia St, Vancouver, BC V6B 5A1',
    unitType: '',
    roomNumber: '',
    streetNumber: '401',
    streetName: 'Georgia',
    streetNumberSuffix: '',
    streetType: 'St',
    streetDirection: 'W',
    cityTown: 'Vancouver',
    postalCode: 'V6B 5A1',
    municipalityStatus: 'City',
    municipalityName: 'Vancouver',
    countyStatus: '',
    countyName: '',
  },
  {
    id: 'h3b-1',
    label: '1000 Rue De La Gauchetière O, Montréal, QC H3B 4W5',
    unitType: '',
    roomNumber: '',
    streetNumber: '1000',
    streetName: 'De La Gauchetière',
    streetNumberSuffix: '',
    streetType: '',
    streetDirection: 'O',
    cityTown: 'Montréal',
    postalCode: 'H3B 4W5',
    municipalityStatus: 'City',
    municipalityName: 'Montréal',
    countyStatus: '',
    countyName: '',
  },
  {
    id: 't2p-1',
    label: '308 4 Ave SW, Calgary, AB T2P 0H7',
    unitType: '',
    roomNumber: '',
    streetNumber: '308',
    streetName: '4',
    streetNumberSuffix: '',
    streetType: 'Ave',
    streetDirection: 'SW',
    cityTown: 'Calgary',
    postalCode: 'T2P 0H7',
    municipalityStatus: 'City',
    municipalityName: 'Calgary',
    countyStatus: '',
    countyName: '',
  },
];

/** Infer province/territory label from Canadian postal FSA first letter. */
export function provinceFromPostalCode(postalCode: string): string {
  const letter = normalizePostalCode(postalCode).charAt(0);
  switch (letter) {
    case 'A':
      return 'Newfoundland and Labrador';
    case 'B':
      return 'Nova Scotia';
    case 'C':
      return 'Prince Edward Island';
    case 'E':
      return 'New Brunswick';
    case 'G':
    case 'H':
    case 'J':
      return 'Quebec';
    case 'K':
    case 'L':
    case 'M':
    case 'N':
    case 'P':
      return 'Ontario';
    case 'R':
      return 'Manitoba';
    case 'S':
      return 'Saskatchewan';
    case 'T':
      return 'Alberta';
    case 'V':
      return 'British Columbia';
    case 'X':
      return 'Northwest Territories';
    case 'Y':
      return 'Yukon';
    default:
      return '';
  }
}

export function getAddressById(id: string) {
  return MOCK_ADDRESSES.find((entry) => entry.id === id) ?? null;
}

/**
 * Filter dummy Ontario addresses by postal code or street/city text
 * (same idea as NAICS example filtering).
 */
export function filterAddressExamples(query: string, limit = 8): AddressLookupResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const compactQuery = normalizePostalCode(query);

  return MOCK_ADDRESSES.filter((entry) => {
    const compactPostal = normalizePostalCode(entry.postalCode);
    if (compactQuery && compactPostal.includes(compactQuery)) {
      return true;
    }
    const haystack = `${entry.postalCode} ${entry.label} ${entry.cityTown}`.toLowerCase();
    return haystack.includes(normalized);
  }).slice(0, limit);
}

/**
 * Mock Canada Post lookup by postal code (exact or FSA match).
 */
export function lookupAddressesByPostalCode(postalCode: string): AddressLookupResult[] {
  const compact = normalizePostalCode(postalCode);
  const fsa = compact.slice(0, 3);

  return MOCK_ADDRESSES.filter((address) => {
    const addressCompact = normalizePostalCode(address.postalCode);
    return addressCompact === compact || addressCompact.startsWith(fsa);
  });
}

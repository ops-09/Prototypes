/**
 * Mock signed-in individual profile (Account Creation / Settings).
 * Maps INDIVIDUAL.* and ADDRESS_VIRTUAL.PHONE_NUMBER / PHONE_EXT for the cover-letter preform.
 */
export type SignedInIndividual = {
  firstName: string;
  middleName: string;
  lastName: string;
  /** Full phone from ADDRESS_VIRTUAL.PHONE_NUMBER (e.g. 555-555-5555). */
  phoneNumber: string;
  phoneExtension: string;
  email: string;
};

/** Prototype signed-in filer — aligns with Form7 authorized filer name where helpful. */
export const SIGNED_IN_INDIVIDUAL: SignedInIndividual = {
  firstName: 'Alex',
  middleName: 'Jordan',
  lastName: 'Rivera',
  phoneNumber: '555-555-5555',
  phoneExtension: '42',
  email: 'alex.rivera@example.com',
};

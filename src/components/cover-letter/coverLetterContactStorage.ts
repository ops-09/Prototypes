import type { SignedInIndividual } from '../../mock/signedInIndividual';
import { SIGNED_IN_INDIVIDUAL } from '../../mock/signedInIndividual';

const STORAGE_KEY = 'ops-rbac.cover-letter.contact';

export type CoverLetterContact = {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  phoneExtension: string;
  email: string;
  confirmEmail: string;
};

export function contactFromSignedInProfile(
  profile: SignedInIndividual = SIGNED_IN_INDIVIDUAL,
): CoverLetterContact {
  return {
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber,
    phoneExtension: profile.phoneExtension,
    email: profile.email,
    confirmEmail: profile.email,
  };
}

export function readCoverLetterContact(): CoverLetterContact | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CoverLetterContact;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCoverLetterContact(contact: CoverLetterContact): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
}

export function clearCoverLetterContact(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

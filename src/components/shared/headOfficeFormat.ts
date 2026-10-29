export type HeadOfficeLocationFields = {
  municipalityStatus: string;
  municipalityName: string;
  cityTown: string;
  countyStatus: string;
  countyName: string;
};

/** e.g. "City of Toronto, County of York"; empty when nothing is entered. */
export function formatHeadOfficeLocation(step3: HeadOfficeLocationFields) {
  const municipality = step3.municipalityName.trim() || step3.cityTown.trim();
  const municipalityLine = municipality
    ? [step3.municipalityStatus.trim(), municipality].filter(Boolean).join(' of ')
    : '';
  const countyLine = step3.countyName.trim()
    ? [step3.countyStatus.trim(), step3.countyName.trim()].filter(Boolean).join(' of ')
    : '';
  return [municipalityLine, countyLine].filter(Boolean).join(', ');
}

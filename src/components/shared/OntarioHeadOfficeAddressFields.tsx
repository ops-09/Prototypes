import {
  OntarioDropdownList,
  OntarioInput,
} from '@ongov/ontario-design-system-component-library-react';
import {
  formatAddressSuggestion,
  formatPostalCode,
  isOntarioPostalCode,
  isValidPostalCodeFormat,
  type AddressLookupResult,
} from '../form1/canadaPostLookup';
import {
  COUNTY_STATUS_OPTIONS,
  formatUnitLabel,
  HEAD_OFFICE_COUNTRY_OPTIONS,
  HEAD_OFFICE_PROVINCE_OPTIONS,
  MUNICIPALITY_STATUS_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_TYPE_OPTIONS,
  UNIT_TYPE_OPTIONS,
  unitTypeRequiredError,
  type Form1Step3Data,
} from '../form1/form1DraftStorage';
import { PostalCodeSearchAutosuggest } from '../form1/PostalCodeSearchAutosuggest';
import formStyles from '../form1/Form1Step1.module.scss';
import addressStyles from '../form1/Form1Step3.module.scss';

export type HeadOfficeAddress = Form1Step3Data;

export type HeadOfficeFieldKey =
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'cityTown'
  | 'municipalityStatus'
  | 'countyStatus'
  | 'countyName'
  | 'province'
  | 'postalCode';

export type HeadOfficeErrors = Partial<Record<HeadOfficeFieldKey, string>>;

export const HEAD_OFFICE_FIELD_ANCHORS: Record<HeadOfficeFieldKey, string> = {
  postalCodeLookup: 'postal-code-lookup',
  unitType: 'unit-type',
  streetNumber: 'street-number',
  streetName: 'street-name',
  cityTown: 'city-town',
  municipalityStatus: 'municipality-status',
  countyStatus: 'county-status',
  countyName: 'county-name',
  province: 'province-territory',
  postalCode: 'postal-code',
};

/** Error summary order; matches the on-page field order. */
export const HEAD_OFFICE_FIELD_ORDER: HeadOfficeFieldKey[] = [
  'postalCodeLookup',
  'municipalityStatus',
  'countyStatus',
  'countyName',
  'unitType',
  'streetNumber',
  'streetName',
  'province',
  'postalCode',
];

const ALL_FIELD_KEYS = HEAD_OFFICE_FIELD_ORDER;

export const HEAD_OFFICE_ERRORS = {
  streetNumber: 'Enter the street number.',
  streetName: 'Enter the street name.',
  municipalityStatus: 'Select the status of the municipality.',
  countyStatus: 'Select the county, district or regional municipality.',
  countyName: 'Enter the name of the county, district or regional municipality.',
  province: 'Select a province or territory.',
  provinceNotOntario: 'Select Ontario. The head office must be located in Ontario.',
  postalCode: 'Enter the postal code.',
  postalCodeFormat: 'Enter a postal code in the format A1A 1A1.',
  postalCodeNotOntario:
    'Enter an Ontario postal code. Ontario postal codes start with K, L, M, N or P.',
} as const;

export function validateHeadOfficeAddress(address: HeadOfficeAddress): HeadOfficeErrors {
  const next: HeadOfficeErrors = {};
  const unitTypeError = unitTypeRequiredError(address.roomNumber, address.unitType);
  if (unitTypeError) {
    next.unitType = unitTypeError;
  }
  if (!address.streetNumber.trim()) {
    next.streetNumber = HEAD_OFFICE_ERRORS.streetNumber;
  }
  if (!address.streetName.trim()) {
    next.streetName = HEAD_OFFICE_ERRORS.streetName;
  }
  if (!address.municipalityStatus.trim()) {
    next.municipalityStatus = HEAD_OFFICE_ERRORS.municipalityStatus;
  }
  if (!address.countyStatus.trim()) {
    next.countyStatus = HEAD_OFFICE_ERRORS.countyStatus;
  }
  if (!address.countyName.trim()) {
    next.countyName = HEAD_OFFICE_ERRORS.countyName;
  }
  if (!address.province.trim()) {
    next.province = HEAD_OFFICE_ERRORS.province;
  } else if (address.province !== 'Ontario') {
    next.province = HEAD_OFFICE_ERRORS.provinceNotOntario;
  }
  if (!address.postalCode.trim()) {
    next.postalCode = HEAD_OFFICE_ERRORS.postalCode;
  } else if (!isValidPostalCodeFormat(address.postalCode)) {
    next.postalCode = HEAD_OFFICE_ERRORS.postalCodeFormat;
  } else if (!isOntarioPostalCode(address.postalCode)) {
    next.postalCode = HEAD_OFFICE_ERRORS.postalCodeNotOntario;
  }
  return next;
}

/** One-line address for review and summary pages; empty string when nothing is entered. */
export function formatHeadOfficeAddressLine(address: HeadOfficeAddress): string {
  return [
    formatUnitLabel(address.unitType, address.roomNumber),
    [
      address.streetNumber,
      address.streetNumberSuffix,
      address.streetName,
      address.streetType,
      address.streetDirection,
    ]
      .filter(Boolean)
      .join(' '),
    address.poBox?.trim() ? `PO Box ${address.poBox.trim()}` : '',
    address.station?.trim() ? `Station ${address.station.trim()}` : '',
    address.ruralRoute?.trim() ? `RR ${address.ruralRoute.trim()}` : '',
    address.lotPartBlockSection?.trim() ?? '',
    address.concessionOrPlan?.trim() ?? '',
    address.cityTown,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function applyLookup<T extends HeadOfficeAddress>(prev: T, result: AddressLookupResult): T {
  return {
    ...prev,
    postalCodeLookup: formatAddressSuggestion(result),
    enterManually: false,
    selectedAddressId: result.id,
    unitType: result.unitType,
    roomNumber: result.roomNumber,
    streetNumber: result.streetNumber,
    streetName: result.streetName,
    streetNumberSuffix: result.streetNumberSuffix,
    streetType: result.streetType,
    streetDirection: result.streetDirection,
    cityTown: result.cityTown,
    province: 'Ontario',
    postalCode: result.postalCode,
    country: 'Canada',
    municipalityStatus: result.municipalityStatus,
    municipalityName: result.cityTown,
    countyStatus: result.countyStatus,
    countyName: result.countyName,
  };
}

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

type OntarioHeadOfficeAddressFieldsProps<T extends HeadOfficeAddress> = {
  address: T;
  errors?: HeadOfficeErrors;
  /** `clearedErrors` lists fields whose error should be removed after this edit. */
  onChange: (address: T, clearedErrors: HeadOfficeFieldKey[]) => void;
  searchLabel?: string;
  municipalityStatusCaption?: string;
  /** Paper item 2. Shown as an h4 over municipality fields when provided. */
  locationHeading?: string;
  /** Paper item 3. Shown as an h4 over street address fields when provided. */
  addressHeading?: string;
};

/** Ontario-only head office address: search, then one field per row. */
export function OntarioHeadOfficeAddressFields<T extends HeadOfficeAddress>({
  address,
  errors = {},
  onChange,
  searchLabel = 'Search address',
  municipalityStatusCaption = 'Status of municipality',
  locationHeading,
  addressHeading,
}: OntarioHeadOfficeAddressFieldsProps<T>) {
  function patch(partial: Partial<HeadOfficeAddress>, ...cleared: HeadOfficeFieldKey[]) {
    const next = { ...address, ...partial };
    onChange(
      {
        ...next,
        // City field doubles as the municipality name, so it is not asked twice.
        municipalityName: next.cityTown,
        country: next.country || 'Canada',
      },
      cleared,
    );
  }

  const locationFields = (
    <>
      <div id={HEAD_OFFICE_FIELD_ANCHORS.municipalityStatus}>
        <OntarioDropdownList
          elementId={HEAD_OFFICE_FIELD_ANCHORS.municipalityStatus}
          caption={municipalityStatusCaption}
          name="municipality-status"
          required
          isEmptyStartOption
          value={address.municipalityStatus}
          options={[...MUNICIPALITY_STATUS_OPTIONS]}
          errorMessage={errors.municipalityStatus}
          customOnChange={(event) =>
            patch({ municipalityStatus: getEventValue(event) }, 'municipalityStatus')
          }
        />
      </div>
      <div id={HEAD_OFFICE_FIELD_ANCHORS.countyStatus}>
        <OntarioDropdownList
          elementId={HEAD_OFFICE_FIELD_ANCHORS.countyStatus}
          caption="County, district or regional municipality"
          name="county-status"
          required
          isEmptyStartOption
          value={address.countyStatus}
          options={[...COUNTY_STATUS_OPTIONS]}
          errorMessage={errors.countyStatus}
          customOnChange={(event) =>
            patch({ countyStatus: getEventValue(event) }, 'countyStatus')
          }
        />
      </div>
      <div id={HEAD_OFFICE_FIELD_ANCHORS.countyName}>
        <OntarioInput
          elementId={HEAD_OFFICE_FIELD_ANCHORS.countyName}
          caption="Name of county, district or regional municipality"
          name="county-name"
          type="text"
          required
          requiredValidationMessage={HEAD_OFFICE_ERRORS.countyName}
          value={address.countyName}
          errorMessage={errors.countyName}
          customOnInput={(event) => patch({ countyName: getEventValue(event) }, 'countyName')}
        />
      </div>
    </>
  );

  return (
    <div className={addressStyles.fieldGroups}>
      <div id={HEAD_OFFICE_FIELD_ANCHORS.postalCodeLookup} className={addressStyles.searchBlock}>
        <p className={addressStyles.searchLabel}>{searchLabel}</p>
        <p className={addressStyles.searchIntro}>
          Type a street address or postal code. If you can&apos;t find your address, you can
          enter it manually.
        </p>
        <div className={formStyles.naicsSearch}>
          <PostalCodeSearchAutosuggest
            elementId={`${HEAD_OFFICE_FIELD_ANCHORS.postalCodeLookup}-input`}
            value={address.postalCodeLookup}
            hintText=""
            ontarioOnly
            errorMessage={errors.postalCodeLookup}
            onChange={(value) =>
              patch({ postalCodeLookup: value, selectedAddressId: '' }, 'postalCodeLookup')
            }
            onSelect={(result) => onChange(applyLookup(address, result), ALL_FIELD_KEYS)}
          />
        </div>
      </div>

      <div className={addressStyles.section}>
        {locationHeading ? (
          <h4 className={`ontario-h4 ${addressStyles.sectionHeading}`}>{locationHeading}</h4>
        ) : null}
        <div className={addressStyles.addressStack}>{locationFields}</div>
      </div>

      <div className={addressStyles.section}>
        {addressHeading ? (
          <h4 className={`ontario-h4 ${addressStyles.sectionHeading}`}>{addressHeading}</h4>
        ) : null}
        <div className={addressStyles.addressFields}>
          <div className={addressStyles.addressStack}>
          <OntarioInput
            elementId="unit-number"
            caption="Unit, suite or apartment number"
            name="unit-number"
            type="text"
            inputWidth="10-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.roomNumber}
            customOnInput={(event) => {
              const roomNumber = getEventValue(event);
              if (roomNumber.trim()) {
                patch({ roomNumber });
              } else {
                patch({ roomNumber, unitType: '' }, 'unitType');
              }
            }}
          />
          <div id={HEAD_OFFICE_FIELD_ANCHORS.unitType}>
            <OntarioDropdownList
              elementId={HEAD_OFFICE_FIELD_ANCHORS.unitType}
              caption="Unit type"
              name="unit-type"
              required={Boolean(address.roomNumber.trim())}
              isEmptyStartOption
              value={address.unitType}
              options={[...UNIT_TYPE_OPTIONS]}
              errorMessage={errors.unitType}
              customOnChange={(event) => patch({ unitType: getEventValue(event) }, 'unitType')}
            />
          </div>
          <OntarioInput
            elementId="street-number-suffix"
            caption="Suffix"
            name="street-number-suffix"
            type="text"
            inputWidth="5-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.streetNumberSuffix}
            customOnInput={(event) => patch({ streetNumberSuffix: getEventValue(event) })}
          />
          <div id={HEAD_OFFICE_FIELD_ANCHORS.streetNumber}>
            <OntarioInput
              elementId={HEAD_OFFICE_FIELD_ANCHORS.streetNumber}
              caption="Street number"
              name="street-number"
              type="text"
              inputWidth="10-char-width"
              required
              requiredValidationMessage={HEAD_OFFICE_ERRORS.streetNumber}
              value={address.streetNumber}
              errorMessage={errors.streetNumber}
              customOnInput={(event) =>
                patch({ streetNumber: getEventValue(event) }, 'streetNumber')
              }
            />
          </div>
          <div id={HEAD_OFFICE_FIELD_ANCHORS.streetName}>
            <OntarioInput
              elementId={HEAD_OFFICE_FIELD_ANCHORS.streetName}
              caption="Street name"
              name="street-name"
              type="text"
              required
              requiredValidationMessage={HEAD_OFFICE_ERRORS.streetName}
              value={address.streetName}
              errorMessage={errors.streetName}
              customOnInput={(event) => patch({ streetName: getEventValue(event) }, 'streetName')}
            />
          </div>
          <OntarioDropdownList
            elementId="street-type"
            caption="Street type"
            name="street-type"
            isEmptyStartOption
            value={address.streetType}
            options={[...STREET_TYPE_OPTIONS]}
            customOnChange={(event) => patch({ streetType: getEventValue(event) })}
          />
          <OntarioDropdownList
            elementId="street-direction"
            caption="Street direction"
            name="street-direction"
            isEmptyStartOption
            value={address.streetDirection}
            options={[...STREET_DIRECTION_OPTIONS]}
            customOnChange={(event) => patch({ streetDirection: getEventValue(event) })}
          />
          <OntarioInput
            elementId="po-box"
            caption="PO box"
            name="po-box"
            type="text"
            inputWidth="10-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.poBox}
            customOnInput={(event) => patch({ poBox: getEventValue(event) })}
          />
          <OntarioInput
            elementId="station"
            caption="Station"
            name="station"
            type="text"
            inputWidth="10-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.station}
            customOnInput={(event) => patch({ station: getEventValue(event) })}
          />
          <OntarioInput
            elementId="rural-route"
            caption="Rural route"
            name="rural-route"
            type="text"
            inputWidth="10-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.ruralRoute}
            customOnInput={(event) => patch({ ruralRoute: getEventValue(event) })}
          />
          <OntarioInput
            elementId="lot-part-block"
            caption="Lot, part, block or section"
            name="lot-part-block"
            type="text"
            inputWidth="20-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.lotPartBlockSection}
            customOnInput={(event) => patch({ lotPartBlockSection: getEventValue(event) })}
          />
          <OntarioInput
            elementId="concession-plan"
            caption="Concession or plan"
            name="concession-plan"
            type="text"
            inputWidth="20-char-width"
            required={false}
            requiredValidationMessage=""
            value={address.concessionOrPlan}
            customOnInput={(event) => patch({ concessionOrPlan: getEventValue(event) })}
          />
          <div id={HEAD_OFFICE_FIELD_ANCHORS.province}>
            <OntarioDropdownList
              elementId={HEAD_OFFICE_FIELD_ANCHORS.province}
              caption="Province or territory"
              name="province-territory"
              required
              isEmptyStartOption
              value={address.province}
              options={[...HEAD_OFFICE_PROVINCE_OPTIONS]}
              errorMessage={errors.province}
              customOnChange={(event) => patch({ province: getEventValue(event) }, 'province')}
            />
          </div>
          <div id={HEAD_OFFICE_FIELD_ANCHORS.postalCode}>
            <OntarioInput
              elementId={HEAD_OFFICE_FIELD_ANCHORS.postalCode}
              caption="Postal code"
              name="postal-code"
              type="text"
              inputWidth="7-char-width"
              required
              requiredValidationMessage={HEAD_OFFICE_ERRORS.postalCode}
              value={address.postalCode}
              errorMessage={errors.postalCode}
              customOnInput={(event) => patch({ postalCode: getEventValue(event) }, 'postalCode')}
              customOnBlur={(event) =>
                patch({ postalCode: formatPostalCode(getEventValue(event)) })
              }
            />
          </div>
          <OntarioDropdownList
            elementId="country"
            caption="Country"
            name="country"
            required
            value={address.country || 'Canada'}
            options={[...HEAD_OFFICE_COUNTRY_OPTIONS]}
            customOnChange={(event) => patch({ country: getEventValue(event) || 'Canada' })}
          />
          </div>
        </div>
      </div>
    </div>
  );
}

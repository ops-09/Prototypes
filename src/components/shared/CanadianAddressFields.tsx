import {
  OntarioDropdownList,
  OntarioInput,
} from '@ongov/ontario-design-system-component-library-react';
import {
  formatAddressSuggestion,
  formatPostalCode,
  isValidPostalCodeFormat,
  provinceFromPostalCode,
  type AddressLookupResult,
} from '../form1/canadaPostLookup';
import {
  CANADIAN_PROVINCE_OPTIONS,
  HEAD_OFFICE_COUNTRY_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_TYPE_OPTIONS,
  UNIT_TYPE_OPTIONS,
  unitTypeRequiredError,
  type DirectorResidentialAddress,
} from '../form1/form1DraftStorage';
import { PostalCodeSearchAutosuggest } from '../form1/PostalCodeSearchAutosuggest';
import formStyles from '../form1/Form1Step1.module.scss';
import addressStyles from '../form1/Form1Step3.module.scss';

export type CanadianAddressErrorKey =
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'cityTown'
  | 'provinceState'
  | 'postalCode';

export type CanadianAddressErrors = Partial<Record<CanadianAddressErrorKey, string>>;

export const CANADIAN_ADDRESS_ERRORS = {
  streetNumber: 'Enter the street number.',
  streetName: 'Enter the street name.',
  cityTown: 'Enter the city, town, village or municipality.',
  provinceState: 'Select a province or territory.',
  postalCode: 'Enter the postal code.',
  postalCodeFormat: 'Enter a postal code in the format A1A 1A1.',
} as const;

export function validateCanadianAddress(
  address: DirectorResidentialAddress,
): CanadianAddressErrors {
  const next: CanadianAddressErrors = {};
  const unitTypeError = unitTypeRequiredError(address.unitNumber, address.unitType);
  if (unitTypeError) {
    next.unitType = unitTypeError;
  }
  if (!address.streetNumber.trim()) {
    next.streetNumber = CANADIAN_ADDRESS_ERRORS.streetNumber;
  }
  if (!address.streetName.trim()) {
    next.streetName = CANADIAN_ADDRESS_ERRORS.streetName;
  }
  if (!address.cityTown.trim()) {
    next.cityTown = CANADIAN_ADDRESS_ERRORS.cityTown;
  }
  if (!address.provinceState.trim()) {
    next.provinceState = CANADIAN_ADDRESS_ERRORS.provinceState;
  }
  if (!address.postalCode.trim()) {
    next.postalCode = CANADIAN_ADDRESS_ERRORS.postalCode;
  } else if (!isValidPostalCodeFormat(address.postalCode)) {
    next.postalCode = CANADIAN_ADDRESS_ERRORS.postalCodeFormat;
  }
  return next;
}

function applyLookup(
  prev: DirectorResidentialAddress,
  result: AddressLookupResult,
): DirectorResidentialAddress {
  return {
    ...prev,
    postalCodeLookup: formatAddressSuggestion(result),
    enterManually: false,
    selectedAddressId: result.id,
    unitType: result.unitType,
    unitNumber: result.roomNumber,
    streetNumber: result.streetNumber,
    streetName: result.streetName,
    streetNumberSuffix: result.streetNumberSuffix,
    streetType: result.streetType,
    streetDirection: result.streetDirection,
    cityTown: result.cityTown,
    provinceState: provinceFromPostalCode(result.postalCode) || prev.provinceState,
    postalCode: result.postalCode,
    country: 'Canada',
  };
}

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

type CanadianAddressFieldsProps<T extends DirectorResidentialAddress> = {
  /** Element id prefix; field ids are `${idPrefix}-unit`, `${idPrefix}-street-name`, etc. */
  idPrefix: string;
  address: T;
  errors?: CanadianAddressErrors;
  onChange: (address: T) => void;
};

/** Stacked Canadian address (any province): search, then one field per row. */
export function CanadianAddressFields<T extends DirectorResidentialAddress>({
  idPrefix,
  address,
  errors = {},
  onChange,
}: CanadianAddressFieldsProps<T>) {
  function patch(partial: Partial<DirectorResidentialAddress>) {
    onChange({ ...address, ...partial });
  }

  return (
    <div className={addressStyles.addressFields}>
      <div id={`${idPrefix}-postal-lookup`} className={addressStyles.searchBlock}>
        <p className={addressStyles.searchLabel}>Search address</p>
        <p className={addressStyles.searchIntro}>
          Type a street address or postal code. If you can&apos;t find the address, you can
          enter it manually.
        </p>
        <div className={formStyles.naicsSearch}>
          <PostalCodeSearchAutosuggest
            elementId={`${idPrefix}-postal-lookup-input`}
            value={address.postalCodeLookup}
            hintText=""
            errorMessage={errors.postalCodeLookup}
            onChange={(value) => patch({ postalCodeLookup: value, selectedAddressId: '' })}
            onSelect={(result) => onChange({ ...address, ...applyLookup(address, result) })}
          />
        </div>
      </div>

      <div className={addressStyles.addressStack}>
        <OntarioInput
          elementId={`${idPrefix}-unit`}
          caption="Unit, suite or apartment number"
          name={`${idPrefix}-unit`}
          type="text"
          inputWidth="10-char-width"
          required={false}
          requiredValidationMessage=""
          value={address.unitNumber}
          customOnInput={(event) => {
            const unitNumber = getEventValue(event);
            patch({ unitNumber, unitType: unitNumber.trim() ? address.unitType : '' });
          }}
        />
        <OntarioDropdownList
          elementId={`${idPrefix}-unit-type`}
          caption="Unit type"
          name={`${idPrefix}-unit-type`}
          required={Boolean(address.unitNumber.trim())}
          isEmptyStartOption
          value={address.unitType}
          options={[...UNIT_TYPE_OPTIONS]}
          errorMessage={errors.unitType}
          customOnChange={(event) => patch({ unitType: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${idPrefix}-street-suffix`}
          caption="Suffix"
          name={`${idPrefix}-street-suffix`}
          type="text"
          inputWidth="5-char-width"
          required={false}
          requiredValidationMessage=""
          value={address.streetNumberSuffix}
          customOnInput={(event) => patch({ streetNumberSuffix: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${idPrefix}-street-number`}
          caption="Street number"
          name={`${idPrefix}-street-number`}
          type="text"
          inputWidth="10-char-width"
          required
          requiredValidationMessage={CANADIAN_ADDRESS_ERRORS.streetNumber}
          value={address.streetNumber}
          errorMessage={errors.streetNumber}
          customOnInput={(event) => patch({ streetNumber: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${idPrefix}-street-name`}
          caption="Street name"
          name={`${idPrefix}-street-name`}
          type="text"
          required
          requiredValidationMessage={CANADIAN_ADDRESS_ERRORS.streetName}
          value={address.streetName}
          errorMessage={errors.streetName}
          customOnInput={(event) => patch({ streetName: getEventValue(event) })}
        />
        <OntarioDropdownList
          elementId={`${idPrefix}-street-type`}
          caption="Street type"
          name={`${idPrefix}-street-type`}
          isEmptyStartOption
          options={[...STREET_TYPE_OPTIONS]}
          value={address.streetType}
          customOnChange={(event) => patch({ streetType: getEventValue(event) })}
        />
        <OntarioDropdownList
          elementId={`${idPrefix}-street-direction`}
          caption="Street direction"
          name={`${idPrefix}-street-direction`}
          isEmptyStartOption
          options={[...STREET_DIRECTION_OPTIONS]}
          value={address.streetDirection}
          customOnChange={(event) => patch({ streetDirection: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${idPrefix}-city`}
          caption="City, town, village or municipality"
          name={`${idPrefix}-city`}
          type="text"
          required
          requiredValidationMessage={CANADIAN_ADDRESS_ERRORS.cityTown}
          value={address.cityTown}
          errorMessage={errors.cityTown}
          customOnInput={(event) => patch({ cityTown: getEventValue(event) })}
        />
        <OntarioDropdownList
          elementId={`${idPrefix}-province`}
          caption="Province or territory"
          name={`${idPrefix}-province`}
          required
          isEmptyStartOption
          options={[...CANADIAN_PROVINCE_OPTIONS]}
          value={address.provinceState}
          errorMessage={errors.provinceState}
          customOnChange={(event) => patch({ provinceState: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${idPrefix}-postal`}
          caption="Postal code"
          name={`${idPrefix}-postal`}
          type="text"
          inputWidth="7-char-width"
          required
          requiredValidationMessage={CANADIAN_ADDRESS_ERRORS.postalCode}
          value={address.postalCode}
          errorMessage={errors.postalCode}
          customOnInput={(event) => patch({ postalCode: getEventValue(event) })}
          customOnBlur={(event) =>
            patch({ postalCode: formatPostalCode(getEventValue(event)) })
          }
        />
        <OntarioDropdownList
          elementId={`${idPrefix}-country`}
          caption="Country"
          name={`${idPrefix}-country`}
          required
          value={address.country || 'Canada'}
          options={[...HEAD_OFFICE_COUNTRY_OPTIONS]}
          customOnChange={(event) => patch({ country: getEventValue(event) || 'Canada' })}
        />
      </div>
    </div>
  );
}

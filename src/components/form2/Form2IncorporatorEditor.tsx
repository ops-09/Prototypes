import { useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  EMPTY_DIRECTOR_ADDRESS,
  formatUnitLabel,
  type DirectorAddressType,
  type Form2Director,
  type Form2Incorporator,
  type IncorporatorType,
  type YesNoAnswer,
} from './form2DraftStorage';
import {
  formatCorporationSuggestion,
  type OntarioCorporationResult,
} from './ontarioCorporationLookup';
import { OntarioCorporationSearchAutosuggest } from './OntarioCorporationSearchAutosuggest';
import styles from './Form2Step1.module.scss';
import step3Styles from './Form2Step3.module.scss';
import step4Styles from './Form2Step4.module.scss';
import {
  CanadianAddressFields,
  validateCanadianAddress,
} from '../shared/CanadianAddressFields';

const SHARES_WHOLE_NUMBER = 'Enter the number of shares as a whole number greater than 0.';
const AMOUNT_INVALID = 'Enter the amount in dollars, like 1000.00.';
const CORP_NOT_FOUND_ALERT =
  'No corporation was found for that search. Enter the corporation name and OCN below, or try a different search.';
const CORP_DUPLICATE = 'This corporation has already been added.';

function isOcnLikeQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 2 && digits === trimmed.replace(/\s/g, '');
}

export type IncorporatorFieldKey =
  | 'type'
  | 'firstName'
  | 'lastName'
  | 'addressType'
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'addressLine1'
  | 'cityTown'
  | 'provinceState'
  | 'postalCode'
  | 'country'
  | 'numberOfShares'
  | 'classDesignation'
  | 'amountToBePaid'
  | 'corporationSearch'
  | 'corporation'
  | 'signerPosition';

export type IncorporatorErrors = Partial<Record<IncorporatorFieldKey, string>>;

const ADDRESS_TYPE_OPTIONS = [
  { value: 'canadian', label: 'Canadian address' },
  { value: 'us', label: 'US address' },
  { value: 'international', label: 'International address' },
];

const TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporation', label: 'Corporation' },
];

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

function clearAddressForType(
  addressType: DirectorAddressType | '',
): Form2Incorporator['address'] {
  const base = { ...EMPTY_DIRECTOR_ADDRESS, addressType };
  if (addressType === 'canadian') {
    return { ...base, country: 'Canada', provinceState: 'Ontario' };
  }
  if (addressType === 'us') {
    return { ...base, country: 'United States' };
  }
  return base;
}

function isWholeNumberGreaterThanZero(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return false;
  }
  return Number.parseInt(value.trim(), 10) > 0;
}

/** Accepts dollars with optional commas and up to 2 decimal places. */
function isValidDollarAmount(value: string) {
  const trimmed = value.trim().replace(/[$,\s]/g, '');
  if (!trimmed) {
    return false;
  }
  return /^\d+(\.\d{1,2})?$/.test(trimmed);
}

function validateAddress(
  address: Form2Incorporator['address'],
  next: IncorporatorErrors,
) {
  if (!address.addressType) {
    next.addressType = 'Select the type of address.';
  }

  if (address.addressType === 'canadian') {
    Object.assign(next, validateCanadianAddress(address));
  }

  if (address.addressType === 'us' || address.addressType === 'international') {
    if (!address.addressLine1.trim()) {
      next.addressLine1 = 'Enter address line 1.';
    }
    if (!address.cityTown.trim()) {
      next.cityTown = 'Enter the city or town.';
    }
    if (!address.provinceState.trim()) {
      next.provinceState = 'Enter the state, province or region.';
    }
    if (!address.postalCode.trim()) {
      next.postalCode = 'Enter the ZIP or postal code.';
    }
    if (address.addressType === 'international' && !address.country.trim()) {
      next.country = 'Enter the country.';
    }
  }
}

function validateShareFields(
  incorporator: Form2Incorporator,
  next: IncorporatorErrors,
) {
  if (!incorporator.numberOfShares.trim()) {
    next.numberOfShares = 'Enter the number of shares.';
  } else if (!isWholeNumberGreaterThanZero(incorporator.numberOfShares)) {
    next.numberOfShares = SHARES_WHOLE_NUMBER;
  }

  if (!incorporator.classDesignation.trim()) {
    next.classDesignation = 'Enter the class or designation of the shares.';
  }

  if (!incorporator.amountToBePaid.trim()) {
    next.amountToBePaid = 'Enter the amount to be paid.';
  } else if (!isValidDollarAmount(incorporator.amountToBePaid)) {
    next.amountToBePaid = AMOUNT_INVALID;
  }
}

export function validateIncorporator(
  incorporator: Form2Incorporator,
  options: { existingOcns?: string[] } = {},
): IncorporatorErrors {
  const next: IncorporatorErrors = {};
  const isLinked = Boolean(incorporator.linkedDirectorId);

  if (isLinked || incorporator.type === 'individual') {
    if (!isLinked) {
      if (!incorporator.firstName.trim()) {
        next.firstName = 'Enter the first name.';
      }
      if (!incorporator.lastName.trim()) {
        next.lastName = 'Enter the last name.';
      }
      validateAddress(incorporator.address, next);
    }
    // Form 2 (without share capital): no share details for incorporators.
    return next;
  }

  if (!incorporator.corporationName.trim()) {
    next.corporation = 'Enter the corporation name.';
  }
  if (!incorporator.ocn.trim()) {
    next.corporationSearch = 'Enter the Ontario Corporation Number (OCN).';
  } else if (
    options.existingOcns?.some(
      (ocn) => ocn === incorporator.ocn && ocn.length > 0,
    )
  ) {
    next.corporationSearch = CORP_DUPLICATE;
  }

  if (!incorporator.firstName.trim()) {
    next.firstName = 'Enter the first name of the person signing.';
  }
  if (!incorporator.lastName.trim()) {
    next.lastName = 'Enter the last name of the person signing.';
  }
  if (!incorporator.signerPosition.trim()) {
    next.signerPosition = 'Enter the position of the person signing.';
  }

  return next;
}

export function formatIncorporatorFullName(incorporator: Form2Incorporator): string {
  return [incorporator.firstName, incorporator.middleName, incorporator.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatIncorporatorAddressLine(
  incorporator: Form2Incorporator,
): string {
  const { address } = incorporator;
  if (address.addressType === 'canadian') {
    return (
      [
        formatUnitLabel(address.unitType, address.unitNumber),
        [
          address.streetNumber,
          address.streetNumberSuffix,
          address.streetName,
          address.streetType,
          address.streetDirection,
        ]
          .filter(Boolean)
          .join(' '),
        address.cityTown,
        address.provinceState,
        address.postalCode,
      ]
        .filter(Boolean)
        .join(', ') || '—'
    );
  }
  return (
    [
      address.addressLine1,
      address.addressLine2,
      address.cityTown,
      address.provinceState,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(', ') || '—'
  );
}

function formatYesNo(value: YesNoAnswer | '') {
  if (value === 'yes') {
    return 'Yes';
  }
  if (value === 'no') {
    return 'No';
  }
  return '—';
}

export type IncorporatorListDescription = {
  details: string;
  address: string;
};

export function formatIncorporatorListDescription(
  incorporator: Form2Incorporator,
  linkedDirector?: Form2Director | null,
): IncorporatorListDescription {
  if (incorporator.type === 'corporation') {
    const signer = formatIncorporatorFullName(incorporator);
    const position = incorporator.signerPosition.trim();
    const parts = [
      incorporator.ocn ? `OCN ${incorporator.ocn}` : '',
      signer && position ? `${signer}, ${position}` : signer || position,
    ].filter(Boolean);
    return {
      details: parts.join(' · ') || 'Corporation incorporator',
      address: '',
    };
  }

  const addressLine = formatIncorporatorAddressLine(incorporator);
  const director = linkedDirector ?? null;
  const details = [
    director?.residentCanadian
      ? `Resident Canadian: ${formatYesNo(director.residentCanadian)}`
      : '',
    director?.alsoIncorporator
      ? `Also an incorporator: ${formatYesNo(director.alsoIncorporator)}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    details: details || 'Incorporator details',
    address: addressLine !== '—' ? addressLine : '',
  };
}

type Form2IncorporatorBlockProps = {
  incorporator: Form2Incorporator;
  errors?: IncorporatorErrors;
  /** When adding, allow choosing Individual or Corporation. */
  allowTypeChange?: boolean;
  /** OCNs already on the list (excluding current). */
  existingOcns?: string[];
  onChange: (incorporator: Form2Incorporator) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function Form2IncorporatorBlock({
  incorporator,
  errors = {},
  allowTypeChange = false,
  existingOcns = [],
  onChange,
  onSave,
  onCancel,
}: Form2IncorporatorBlockProps) {
  const prefix = `inc-${incorporator.id}`;
  const isLinked = Boolean(incorporator.linkedDirectorId);
  const showManualForeign =
    incorporator.address.addressType === 'us' ||
    incorporator.address.addressType === 'international';

  const [typeSelection, setTypeSelection] = useState<IncorporatorType>(
    incorporator.type,
  );
  const [searchQuery, setSearchQuery] = useState(() =>
    incorporator.ocn && incorporator.corporationName
      ? formatCorporationSuggestion({
          ocn: incorporator.ocn,
          legalName: incorporator.corporationName,
          status: 'Active',
        })
      : incorporator.corporationName,
  );
  const [searchError, setSearchError] = useState('');
  const [enterCorporationManually, setEnterCorporationManually] = useState(false);
  const [showCorporationNotFound, setShowCorporationNotFound] = useState(false);

  function patch(partial: Partial<Form2Incorporator>) {
    onChange({ ...incorporator, ...partial });
  }

  function patchAddress(partial: Partial<Form2Incorporator['address']>) {
    onChange({
      ...incorporator,
      address: { ...incorporator.address, ...partial },
    });
  }

  function handleTypeSelection(value: IncorporatorType) {
    setTypeSelection(value);
    setSearchError('');
    setSearchQuery('');
    setEnterCorporationManually(false);
    setShowCorporationNotFound(false);

    if (value === 'individual') {
      onChange({
        ...incorporator,
        type: 'individual',
        firstName: '',
        middleName: '',
        lastName: '',
        corporationName: '',
        ocn: '',
        signerPosition: '',
      });
      return;
    }

    onChange({
      ...incorporator,
      type: 'corporation',
      firstName: '',
      middleName: '',
      lastName: '',
      address: { ...EMPTY_DIRECTOR_ADDRESS },
      numberOfShares: '',
      classDesignation: '',
      amountToBePaid: '',
    });
  }

  function setAddressType(value: DirectorAddressType) {
    onChange({
      ...incorporator,
      address: clearAddressForType(value),
    });
  }

  function selectedCorporationLabel() {
    if (!incorporator.ocn || !incorporator.corporationName) {
      return '';
    }
    return formatCorporationSuggestion({
      ocn: incorporator.ocn,
      legalName: incorporator.corporationName,
      status: 'Active',
    });
  }

  function handleCorporationQueryChange(value: string) {
    setSearchQuery(value);
    setSearchError('');
    setShowCorporationNotFound(false);
    const selectedLabel = selectedCorporationLabel();
    if (selectedLabel && value !== selectedLabel && !enterCorporationManually) {
      patch({ corporationName: '', ocn: '' });
    }
  }

  function selectCorporation(result: OntarioCorporationResult) {
    if (existingOcns.includes(result.ocn)) {
      setSearchError(CORP_DUPLICATE);
      return;
    }
    setSearchError('');
    setShowCorporationNotFound(false);
    setEnterCorporationManually(false);
    setSearchQuery(formatCorporationSuggestion(result));
    patch({
      corporationName: result.legalName,
      ocn: result.ocn,
    });
  }

  function handleCorporationNoResults(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    setSearchError('');
    setShowCorporationNotFound(true);
    setEnterCorporationManually(true);
    if (isOcnLikeQuery(trimmed)) {
      patch({
        ocn: trimmed.replace(/\s/g, ''),
        corporationName: incorporator.corporationName,
      });
      return;
    }
    patch({
      corporationName: trimmed,
      ocn: incorporator.ocn,
    });
  }

  function handleEnterCorporationManually(checked: boolean) {
    setEnterCorporationManually(checked);
    if (!checked) {
      setShowCorporationNotFound(false);
      return;
    }
    setSearchError('');
  }

  return (
    <div className={step4Styles.blockFields}>
      {isLinked ? (
        <div className={step4Styles.linkedDirectorAlert}>
          <OntarioPageAlert
            type="informational"
            heading="Director details"
            content="Name and residential address are edited on the directors step. Share details were collected there and can be updated below if needed."
          />
        </div>
      ) : null}

      {allowTypeChange && !isLinked ? (
        <div id={`${prefix}-type`}>
          <OntarioRadioButtons
            caption="Type of incorporator"
            name={`${prefix}-type`}
            required
            value={typeSelection}
            options={TYPE_OPTIONS.map((opt) => ({
              ...opt,
              elementId: `${prefix}-type-${opt.value}`,
            }))}
            errorMessage={errors.type}
            customOnChange={(event) =>
              handleTypeSelection(getEventValue(event) as IncorporatorType)
            }
          />
        </div>
      ) : null}

      {incorporator.type === 'individual' || isLinked ? (
        <>
          {!isLinked ? (
            <>
              <div className={step4Styles.nameRow}>
                <OntarioInput
                  elementId={`${prefix}-first-name`}
                  caption="First name"
                  inputWidth="20-char-width"
                  name={`${prefix}-first-name`}
                  type="text"
                  required
                  requiredValidationMessage="Enter the first name."
                  value={incorporator.firstName}
                  errorMessage={errors.firstName}
                  customOnInput={(event) =>
                    patch({ firstName: getEventValue(event) })
                  }
                />
                <OntarioInput
                  elementId={`${prefix}-middle-name`}
                  caption="Middle name(s)"
                  inputWidth="20-char-width"
                  name={`${prefix}-middle-name`}
                  type="text"
                  required={false}
                  requiredValidationMessage=""
                  value={incorporator.middleName}
                  customOnInput={(event) =>
                    patch({ middleName: getEventValue(event) })
                  }
                />
                <OntarioInput
                  elementId={`${prefix}-last-name`}
                  caption="Last name"
                  inputWidth="20-char-width"
                  name={`${prefix}-last-name`}
                  type="text"
                  required
                  requiredValidationMessage="Enter the last name."
                  value={incorporator.lastName}
                  errorMessage={errors.lastName}
                  customOnInput={(event) =>
                    patch({ lastName: getEventValue(event) })
                  }
                />
              </div>

              <div id={`${prefix}-address-type`}>
                <OntarioRadioButtons
                  caption="The names and residential addresses of the incorporators are:"
                  name={`${prefix}-address-type`}
                  required
                  hintText="Select Canadian, US, or International. Canadian addresses are not limited to Ontario."
                  value={incorporator.address.addressType}
                  options={ADDRESS_TYPE_OPTIONS.map((opt) => ({
                    ...opt,
                    elementId: `${prefix}-addr-${opt.value}`,
                  }))}
                  errorMessage={errors.addressType}
                  customOnChange={(event) =>
                    setAddressType(getEventValue(event) as DirectorAddressType)
                  }
                />
              </div>

              {incorporator.address.addressType === 'canadian' ? (
                <CanadianAddressFields
                  idPrefix={prefix}
                  address={incorporator.address}
                  errors={errors}
                  onChange={(address) => onChange({ ...incorporator, address })}
                />
              ) : null}

              {showManualForeign ? (
                <div className={step3Styles.addressFields}>
                  <OntarioInput
                    elementId={`${prefix}-line1`}
                    caption="Address line 1"
                    name={`${prefix}-line1`}
                    type="text"
                    required
                    requiredValidationMessage="Enter address line 1."
                    value={incorporator.address.addressLine1}
                    errorMessage={errors.addressLine1}
                    customOnInput={(event) =>
                      patchAddress({ addressLine1: getEventValue(event) })
                    }
                  />
                  <OntarioInput
                    elementId={`${prefix}-line2`}
                    caption="Address line 2"
                    name={`${prefix}-line2`}
                    type="text"
                    required={false}
                    requiredValidationMessage=""
                    value={incorporator.address.addressLine2}
                    customOnInput={(event) =>
                      patchAddress({ addressLine2: getEventValue(event) })
                    }
                  />
                  <OntarioInput
                    elementId={`${prefix}-foreign-city`}
                    caption="City/Town"
                    name={`${prefix}-foreign-city`}
                    type="text"
                    required
                    requiredValidationMessage="Enter the city or town."
                    value={incorporator.address.cityTown}
                    errorMessage={errors.cityTown}
                    customOnInput={(event) =>
                      patchAddress({ cityTown: getEventValue(event) })
                    }
                  />
                  <OntarioInput
                    elementId={`${prefix}-state-region`}
                    caption={
                      incorporator.address.addressType === 'us'
                        ? 'State'
                        : 'Province/Region'
                    }
                    name={`${prefix}-state-region`}
                    type="text"
                    required
                    requiredValidationMessage="Enter the state, province or region."
                    value={incorporator.address.provinceState}
                    errorMessage={errors.provinceState}
                    customOnInput={(event) =>
                      patchAddress({ provinceState: getEventValue(event) })
                    }
                  />
                  <OntarioInput
                    elementId={`${prefix}-zip`}
                    caption={
                      incorporator.address.addressType === 'us'
                        ? 'ZIP code'
                        : 'Postal code'
                    }
                    name={`${prefix}-zip`}
                    type="text"
                    required
                    requiredValidationMessage="Enter the ZIP or postal code."
                    value={incorporator.address.postalCode}
                    errorMessage={errors.postalCode}
                    customOnInput={(event) =>
                      patchAddress({ postalCode: getEventValue(event) })
                    }
                  />
                  {incorporator.address.addressType === 'us' ? (
                    <div className={step4Styles.readOnlyField}>
                      <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>
                        Country
                      </h5>
                      <p className={step4Styles.readOnlyValue}>United States</p>
                    </div>
                  ) : (
                    <OntarioInput
                      elementId={`${prefix}-country`}
                      caption="Country"
                      name={`${prefix}-country`}
                      type="text"
                      required
                      requiredValidationMessage="Enter the country."
                      value={incorporator.address.country}
                      errorMessage={errors.country}
                      customOnInput={(event) =>
                        patchAddress({ country: getEventValue(event) })
                      }
                    />
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className={step4Styles.readOnlyField}>
              <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>
                Incorporator
              </h5>
              <p className={step4Styles.readOnlyValue}>
                {formatIncorporatorFullName(incorporator) || '—'}
              </p>
              <p className={step4Styles.readOnlyValue}>
                {formatIncorporatorAddressLine(incorporator)}
              </p>
            </div>
          )}

        </>
      ) : (
        <>
          <div id={`${prefix}-corporation-search`} className={styles.naicsBlock}>
            <label
              className={styles.naicsLabel}
              htmlFor={`${prefix}-corporation-search-input`}
            >
              Corporation name or OCN
              <span className={styles.requiredFlag}> (required)</span>
            </label>
            <div className={styles.naicsSearch}>
              <OntarioCorporationSearchAutosuggest
                elementId={`${prefix}-corporation-search-input`}
                value={searchQuery}
                errorMessage={
                  enterCorporationManually
                    ? undefined
                    : searchError || errors.corporation || errors.corporationSearch
                }
                hintText="Example: 1001234, maple, or GREEN INSTITUTE. If you cannot find the corporation, select “Enter the corporation name and OCN manually” below."
                onChange={handleCorporationQueryChange}
                onSelect={selectCorporation}
                onNoResults={handleCorporationNoResults}
              />
            </div>

            <div className={step3Styles.manualToggle}>
              <OntarioCheckboxes
                caption="Manual corporation entry"
                name={`${prefix}-enter-corporation-manually`}
                value={enterCorporationManually ? ['manual'] : []}
                options={[
                  {
                    value: 'manual',
                    elementId: `${prefix}-enter-corporation-manually`,
                    label: 'Enter the corporation name and OCN manually',
                  },
                ]}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  handleEnterCorporationManually(Boolean(target?.checked));
                }}
              />
            </div>
          </div>

          {showCorporationNotFound ? (
            <div className={step4Styles.linkedDirectorAlert}>
              <OntarioPageAlert
                type="informational"
                heading="Corporation not found"
                content={CORP_NOT_FOUND_ALERT}
              />
            </div>
          ) : null}

          {enterCorporationManually ? (
            <>
              <OntarioInput
                elementId={`${prefix}-corporation-name`}
                caption="Corporation name"
                name={`${prefix}-corporation-name`}
                type="text"
                required
                requiredValidationMessage="Enter the corporation name."
                hintText="Enter the legal name of the corporation."
                value={incorporator.corporationName}
                errorMessage={errors.corporation}
                customOnInput={(event) =>
                  patch({ corporationName: getEventValue(event) })
                }
              />
              <OntarioInput
                elementId={`${prefix}-ocn`}
                caption="Ontario Corporation Number (OCN)"
                name={`${prefix}-ocn`}
                type="text"
                required
                requiredValidationMessage="Enter the Ontario Corporation Number (OCN)."
                hintText="Enter the Ontario corporation number."
                value={incorporator.ocn}
                errorMessage={searchError || errors.corporationSearch}
                customOnInput={(event) => {
                  const nextOcn = getEventValue(event).trim();
                  if (nextOcn && existingOcns.some((ocn) => ocn === nextOcn)) {
                    setSearchError(CORP_DUPLICATE);
                  } else {
                    setSearchError('');
                  }
                  patch({ ocn: getEventValue(event) });
                }}
              />
            </>
          ) : null}

          {!enterCorporationManually && incorporator.corporationName ? (
            <div className={step4Styles.readOnlyField}>
              <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>
                Selected corporation
              </h5>
              <p className={step4Styles.readOnlyValue}>
                {incorporator.corporationName}
              </p>
              <p className={step4Styles.readOnlyValue}>OCN {incorporator.ocn}</p>
            </div>
          ) : null}

          <p className={step4Styles.sectionLead}>
            Person signing on behalf of the corporation
          </p>
          <div className={step4Styles.nameRow}>
            <OntarioInput
              elementId={`${prefix}-signer-first`}
              caption="First name"
              inputWidth="20-char-width"
              name={`${prefix}-signer-first`}
              type="text"
              required
              requiredValidationMessage="Enter the first name of the person signing."
              value={incorporator.firstName}
              errorMessage={errors.firstName}
              customOnInput={(event) =>
                patch({ firstName: getEventValue(event) })
              }
            />
            <OntarioInput
              elementId={`${prefix}-signer-middle`}
              caption="Middle name(s)"
              inputWidth="20-char-width"
              name={`${prefix}-signer-middle`}
              type="text"
              required={false}
              requiredValidationMessage=""
              value={incorporator.middleName}
              customOnInput={(event) =>
                patch({ middleName: getEventValue(event) })
              }
            />
            <OntarioInput
              elementId={`${prefix}-signer-last`}
              caption="Last name"
              inputWidth="20-char-width"
              name={`${prefix}-signer-last`}
              type="text"
              required
              requiredValidationMessage="Enter the last name of the person signing."
              value={incorporator.lastName}
              errorMessage={errors.lastName}
              customOnInput={(event) =>
                patch({ lastName: getEventValue(event) })
              }
            />
          </div>
          <OntarioInput
            elementId={`${prefix}-position`}
            caption="Position"
            name={`${prefix}-position`}
            type="text"
            required
            requiredValidationMessage="Enter the position of the person signing."
            value={incorporator.signerPosition}
            errorMessage={errors.signerPosition}
            customOnInput={(event) =>
              patch({ signerPosition: getEventValue(event) })
            }
          />
        </>
      )}

      <div className={step4Styles.doneActions}>
        <div className={step4Styles.doneButtons}>
          <OntarioButton
            type="primary"
            htmlType="button"
            label="Save"
            onClick={onSave}
          />
          <OntarioButton
            type="tertiary"
            htmlType="button"
            label="Cancel"
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  );
}

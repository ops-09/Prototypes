import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDropdownList,
  OntarioIconDelete,
  OntarioIconEdit,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  FIND_POSTAL_CODE_URL,
  formatPostalCode,
  isValidPostalCodeFormat,
  POSTAL_CODE_FORMAT_ERROR,
  provinceFromPostalCode,
  type AddressLookupResult,
} from './canadaPostLookup';
import { FileUpload } from './FileUpload';
import {
  CANADIAN_PROVINCE_OPTIONS,
  DIRECTOR_CONSENT_FORM_URL,
  EMPTY_DIRECTOR_ADDRESS,
  formatUnitLabel,
  STREET_DIRECTION_OPTIONS,
  STREET_NUMBER_SUFFIX_OPTIONS,
  STREET_TYPE_OPTIONS,
  UNIT_TYPE_OPTIONS,
  unitTypeRequiredError,
  type DirectorAddressType,
  type Form2Director,
  type YesNoAnswer,
} from './form2DraftStorage';
import { PostalCodeSearchAutosuggest } from './PostalCodeSearchAutosuggest';
import styles from './Form2Step1.module.scss';
import step3Styles from './Form2Step3.module.scss';
import step4Styles from './Form2Step4.module.scss';

const REQUIRED = 'Required Field.';
const EMAIL_INVALID = 'Please enter a valid email address.';
const SHARES_WHOLE_NUMBER = 'Please enter a whole number greater than zero.';
const AMOUNT_INVALID = 'Please enter a valid amount.';
const CONSENT_CHECKBOX_REQUIRED =
  'Confirm that this director has given consent to act as first director.';
const CONSENT_FILE_REQUIRED =
  'Upload the completed consent form (PDF).';

export type DirectorFieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'residentCanadian'
  | 'alsoIncorporator'
  | 'numberOfShares'
  | 'classDesignation'
  | 'amountToBePaid'
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
  | 'consent'
  | 'consentFile';

export type DirectorErrors = Partial<Record<DirectorFieldKey, string>>;

/** Display order for director field errors in the page alert summary. */
export const DIRECTOR_ERROR_FIELD_ORDER: DirectorFieldKey[] = [
  'firstName',
  'lastName',
  'email',
  'residentCanadian',
  'alsoIncorporator',
  'numberOfShares',
  'classDesignation',
  'amountToBePaid',
  'consent',
  'consentFile',
  'addressType',
  'postalCodeLookup',
  'unitType',
  'streetNumber',
  'streetName',
  'addressLine1',
  'cityTown',
  'provinceState',
  'postalCode',
  'country',
];

const DIRECTOR_FIELD_LABELS: Record<DirectorFieldKey, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address',
  residentCanadian: 'Resident Canadian',
  alsoIncorporator: 'Also an incorporator',
  numberOfShares: 'Number of Shares',
  classDesignation: 'Class/Designation',
  amountToBePaid: 'Amount to be Paid',
  consent: 'Director consent',
  consentFile: 'Upload consent form',
  addressType: 'Residential Address',
  postalCodeLookup: 'Find the address using a postal code',
  unitType: 'Unit type',
  streetNumber: 'Street number',
  streetName: 'Street name',
  addressLine1: 'Address line 1',
  cityTown: 'City/Town',
  provinceState: 'Province/Territory or state/region',
  postalCode: 'Postal code',
  country: 'Country',
};

export function getDirectorFieldLabel(field: DirectorFieldKey): string {
  return DIRECTOR_FIELD_LABELS[field];
}

/** Element id used to scroll/focus a director field from the error summary. */
export function getDirectorFieldAnchor(
  directorId: string,
  field: DirectorFieldKey,
  addressType: DirectorAddressType | '' = '',
): string {
  const prefix = `dir-${directorId}`;
  const isForeign = addressType === 'us' || addressType === 'international';
  switch (field) {
    case 'firstName':
      return `${prefix}-first-name`;
    case 'lastName':
      return `${prefix}-last-name`;
    case 'email':
      return `${prefix}-email`;
    case 'residentCanadian':
      return `${prefix}-resident-canadian`;
    case 'alsoIncorporator':
      return `${prefix}-also-incorporator`;
    case 'numberOfShares':
      return `${prefix}-shares`;
    case 'classDesignation':
      return `${prefix}-class`;
    case 'amountToBePaid':
      return `${prefix}-amount`;
    case 'consent':
      return `${prefix}-consent`;
    case 'consentFile':
      return `${prefix}-consent-file`;
    case 'addressType':
      return `${prefix}-address-type`;
    case 'postalCodeLookup':
      return `${prefix}-postal-lookup`;
    case 'unitType':
      return `${prefix}-unit-type`;
    case 'streetNumber':
      return `${prefix}-street-number`;
    case 'streetName':
      return `${prefix}-street-name`;
    case 'addressLine1':
      return `${prefix}-line1`;
    case 'cityTown':
      return isForeign ? `${prefix}-foreign-city` : `${prefix}-city`;
    case 'provinceState':
      return isForeign ? `${prefix}-state-region` : `${prefix}-province`;
    case 'postalCode':
      return isForeign ? `${prefix}-zip` : `${prefix}-postal`;
    case 'country':
      return `${prefix}-country`;
  }
}

const ADDRESS_TYPE_OPTIONS = [
  { value: 'canadian', label: 'Canadian Address' },
  { value: 'us', label: 'US Address' },
  { value: 'international', label: 'International Address' },
];

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function clearAddressForType(addressType: DirectorAddressType | ''): Form2Director['address'] {
  const base = { ...EMPTY_DIRECTOR_ADDRESS, addressType };
  if (addressType === 'canadian') {
    return { ...base, country: 'Canada', provinceState: 'Ontario' };
  }
  if (addressType === 'us') {
    return { ...base, country: 'United States' };
  }
  return base;
}

function applyCanadianLookup(
  prev: Form2Director['address'],
  result: AddressLookupResult,
): Form2Director['address'] {
  return {
    ...prev,
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

export function validateDirector(director: Form2Director): DirectorErrors {
  const next: DirectorErrors = {};
  const needsConsent = director.alsoIncorporator === 'no';

  if (!director.firstName.trim()) {
    next.firstName = REQUIRED;
  }
  if (!director.lastName.trim()) {
    next.lastName = REQUIRED;
  }
  if (director.email.trim() && !isValidEmail(director.email.trim())) {
    next.email = EMAIL_INVALID;
  }
  if (!director.residentCanadian) {
    next.residentCanadian = REQUIRED;
  }
  if (!director.alsoIncorporator) {
    next.alsoIncorporator = REQUIRED;
  }
  // Form 2 (without share capital): no share details when also an incorporator.
  if (!director.address.addressType) {
    next.addressType = REQUIRED;
  }

  if (director.address.addressType === 'canadian') {
    if (!director.address.enterManually && !director.address.selectedAddressId) {
      next.postalCodeLookup = REQUIRED;
    }
    const unitTypeError = unitTypeRequiredError(
      director.address.unitNumber,
      director.address.unitType,
    );
    if (unitTypeError) {
      next.unitType = unitTypeError;
    }
    if (!director.address.streetNumber.trim()) {
      next.streetNumber = REQUIRED;
    }
    if (!director.address.streetName.trim()) {
      next.streetName = REQUIRED;
    }
    if (!director.address.cityTown.trim()) {
      next.cityTown = REQUIRED;
    }
    if (!director.address.provinceState.trim()) {
      next.provinceState = REQUIRED;
    }
    if (!director.address.postalCode.trim()) {
      next.postalCode = REQUIRED;
    } else if (!isValidPostalCodeFormat(director.address.postalCode)) {
      next.postalCode = POSTAL_CODE_FORMAT_ERROR;
    }
  }

  if (director.address.addressType === 'us' || director.address.addressType === 'international') {
    if (!director.address.addressLine1.trim()) {
      next.addressLine1 = REQUIRED;
    }
    if (!director.address.cityTown.trim()) {
      next.cityTown = REQUIRED;
    }
    if (!director.address.provinceState.trim()) {
      next.provinceState = REQUIRED;
    }
    if (!director.address.postalCode.trim()) {
      next.postalCode = REQUIRED;
    }
    if (director.address.addressType === 'international' && !director.address.country.trim()) {
      next.country = REQUIRED;
    }
  }

  if (needsConsent) {
    if (!director.consentConfirmed) {
      next.consent = CONSENT_CHECKBOX_REQUIRED;
    }
    if (!director.consentFile) {
      next.consentFile = CONSENT_FILE_REQUIRED;
    }
  }

  return next;
}

export function isDirectorComplete(director: Form2Director) {
  return Object.keys(validateDirector(director)).length === 0;
}

export function formatDirectorFullName(director: Form2Director): string {
  return [director.firstName, director.middleName, director.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export type DirectorListDescription = {
  details: string;
  address: string;
};

export function formatDirectorListDescription(
  director: Form2Director,
): DirectorListDescription {
  const email = director.email.trim();
  const addressLine = formatDirectorAddressLine(director);
  const details = [
    email || '',
    director.residentCanadian
      ? `Resident Canadian: ${formatYesNo(director.residentCanadian)}`
      : '',
    director.alsoIncorporator
      ? `Also an incorporator: ${formatYesNo(director.alsoIncorporator)}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    details: details || 'Director details',
    address: addressLine !== '—' ? addressLine : '',
  };
}

export function formatDirectorAddressLine(director: Form2Director): string {
  const { address } = director;
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

type Form2DirectorBlockProps = {
  director: Form2Director;
  index?: number;
  errors?: DirectorErrors;
  expanded: boolean;
  onChange: (director: Form2Director) => void;
  onRemove?: () => void;
  onEdit?: () => void;
  onSave: () => void;
  onCancel: () => void;
  canRemove?: boolean;
  /** When false, render fields + Save/Cancel only (subflow page). */
  showChrome?: boolean;
};

/** Director form — inline card or bare fields for the add/edit subflow. */
export function Form2DirectorBlock({
  director,
  index = 0,
  errors = {},
  expanded,
  onChange,
  onRemove,
  onEdit,
  onSave,
  onCancel,
  canRemove = false,
  showChrome = true,
}: Form2DirectorBlockProps) {
  const prefix = `dir-${director.id}`;
  const needsConsent = director.alsoIncorporator === 'no';
  const showCanadianFields =
    director.address.addressType === 'canadian' &&
    (director.address.enterManually || Boolean(director.address.selectedAddressId));
  const showManualForeign =
    director.address.addressType === 'us' || director.address.addressType === 'international';

  const fullName = [director.firstName, director.middleName, director.lastName]
    .filter(Boolean)
    .join(' ');

  function patch(partial: Partial<Form2Director>) {
    onChange({ ...director, ...partial });
  }

  function patchAddress(partial: Partial<Form2Director['address']>) {
    onChange({
      ...director,
      address: { ...director.address, ...partial },
    });
  }

  function setAlsoIncorporator(value: YesNoAnswer) {
    onChange({
      ...director,
      alsoIncorporator: value,
      numberOfShares: '',
      classDesignation: '',
      amountToBePaid: '',
      ...(value === 'yes'
        ? { consentConfirmed: false, consentFile: null }
        : {}),
    });
  }

  function setAddressType(value: DirectorAddressType) {
    onChange({
      ...director,
      address: clearAddressForType(value),
    });
  }

  if (!expanded) {
    return (
      <section
        className={`${step4Styles.directorBlock} ${step4Styles.directorBlockCollapsed}`}
        aria-labelledby={`${prefix}-heading`}
      >
        <div className={step4Styles.blockHeader}>
          <h3 id={`${prefix}-heading`} className={`ontario-h3 ${step4Styles.blockTitle}`}>
            Director {index + 1}
          </h3>
          <div className={step4Styles.headerActions}>
            {onEdit ? (
              <button
                type="button"
                className={step4Styles.editLink}
                onClick={onEdit}
                aria-label={`Edit director ${index + 1}`}
              >
                <OntarioIconEdit colour="blue" iconWidth={24} isDecorative />
                Edit
              </button>
            ) : null}
            {canRemove && onRemove ? (
              <button
                type="button"
                className={step4Styles.removeLink}
                onClick={onRemove}
                aria-label={`Remove director ${index + 1}`}
              >
                <OntarioIconDelete colour="inherit" iconWidth={24} isDecorative />
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {/* ODS has no readOnly inputs — label + value stack composed with tokens. */}
        <div className={step4Styles.readOnlyFields}>
          <div className={step4Styles.readOnlyField}>
            <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Name</h5>
            <p className={step4Styles.readOnlyValue}>{fullName || '—'}</p>
          </div>
          <div className={step4Styles.readOnlyField}>
            <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Email</h5>
            <p className={step4Styles.readOnlyValue}>{director.email.trim() || '—'}</p>
          </div>
          <div className={step4Styles.readOnlyField}>
            <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Resident Canadian</h5>
            <p className={step4Styles.readOnlyValue}>{formatYesNo(director.residentCanadian)}</p>
          </div>
          <div className={step4Styles.readOnlyField}>
            <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Also an incorporator</h5>
            <p className={step4Styles.readOnlyValue}>{formatYesNo(director.alsoIncorporator)}</p>
          </div>
          <div className={step4Styles.readOnlyField}>
            <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Residential address</h5>
            <p className={step4Styles.readOnlyValue}>{formatDirectorAddressLine(director)}</p>
          </div>
          {needsConsent ? (
            <>
              <div className={step4Styles.readOnlyField}>
                <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Director consent</h5>
                <p className={step4Styles.readOnlyValue}>
                  {director.consentConfirmed ? 'Consent confirmed' : '—'}
                </p>
              </div>
              <div className={step4Styles.readOnlyField}>
                <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>
                  Consent form upload
                </h5>
                <p className={step4Styles.readOnlyValue}>
                  {director.consentFile
                    ? `Consent file: ${director.consentFile.name}`
                    : '—'}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </section>
    );
  }

  const fields = (
      <div className={step4Styles.blockFields}>
        <div className={step4Styles.nameRow}>
          <OntarioInput
            elementId={`${prefix}-first-name`}
            caption="First Name"
            name={`${prefix}-first-name`}
            type="text"
            required
            requiredValidationMessage={REQUIRED}
            value={director.firstName}
            errorMessage={errors.firstName}
            customOnInput={(event) => patch({ firstName: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-middle-name`}
            caption="Middle Name(s)"
            name={`${prefix}-middle-name`}
            type="text"
            required={false}
            requiredValidationMessage=""
            value={director.middleName}
            customOnInput={(event) => patch({ middleName: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-last-name`}
            caption="Last Name"
            name={`${prefix}-last-name`}
            type="text"
            required
            requiredValidationMessage={REQUIRED}
            value={director.lastName}
            errorMessage={errors.lastName}
            customOnInput={(event) => patch({ lastName: getEventValue(event) })}
          />
        </div>

        <OntarioInput
          elementId={`${prefix}-email`}
          caption="Email Address"
          name={`${prefix}-email`}
          type="email"
          required={false}
          requiredValidationMessage=""
          value={director.email}
          errorMessage={errors.email}
          customOnInput={(event) => patch({ email: getEventValue(event) })}
        />

        <div id={`${prefix}-resident-canadian`}>
          <OntarioRadioButtons
            caption="Resident Canadian"
            name={`${prefix}-resident-canadian`}
            required
            value={director.residentCanadian}
            options={[
              { value: 'yes', elementId: `${prefix}-resident-yes`, label: 'Yes' },
              { value: 'no', elementId: `${prefix}-resident-no`, label: 'No' },
            ]}
            errorMessage={errors.residentCanadian}
            customOnChange={(event) =>
              patch({ residentCanadian: getEventValue(event) as YesNoAnswer })
            }
          />
        </div>

        {director.residentCanadian === 'yes' ? (
          <div className={step4Styles.residentCanadianAlert}>
            <OntarioPageAlert
              type="informational"
              heading="Resident Canadian requirement"
              content="The requirement for at least 50 per cent of the directors to be resident Canadian under the Co-operative Corporations Act. Indication of resident Canadian status (yes or no) is still required for all corporation types."
            />
          </div>
        ) : null}

        <div id={`${prefix}-also-incorporator`}>
          <OntarioRadioButtons
            caption="Also an incorporator"
            name={`${prefix}-also-incorporator`}
            required
            value={director.alsoIncorporator}
            options={[
              { value: 'yes', elementId: `${prefix}-incorporator-yes`, label: 'Yes' },
              { value: 'no', elementId: `${prefix}-incorporator-no`, label: 'No' },
            ]}
            errorMessage={errors.alsoIncorporator}
            customOnChange={(event) =>
              setAlsoIncorporator(getEventValue(event) as YesNoAnswer)
            }
          />
        </div>

        {needsConsent ? (
          <div className={step4Styles.consentBlock}>
            <h4 className={`ontario-h4 ${step4Styles.sectionHeading}`}>Director Consent</h4>
            <div id={`${prefix}-consent`}>
              <OntarioCheckboxes
                caption="Director consent"
                name={`${prefix}-consent`}
                required
                hintText="Confirm that consent has been given. You must still upload the completed consent form below."
                value={director.consentConfirmed ? ['consent'] : []}
                options={[
                  {
                    value: 'consent',
                    elementId: `${prefix}-consent-given`,
                    label:
                      'This director has given consent to act as first director in the approved form.',
                  },
                ]}
                errorMessage={errors.consent}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  const checked = Boolean(target?.checked);
                  patch({ consentConfirmed: checked });
                }}
              />
            </div>
            <p className={step4Styles.consentLink}>
              <a href={DIRECTOR_CONSENT_FORM_URL} target="_blank" rel="noopener noreferrer">
                Download a copy of the approved form to consent to act as first director
              </a>
            </p>
            <p className={step4Styles.consentNote}>
              This consent is required to be available for inspection at the head office address
              in accordance with the Act.
            </p>
            <div id={`${prefix}-consent-file`}>
              <FileUpload
                inputId={`${prefix}-consent-file-input`}
                label="Upload consent form (PDF)"
                required
                hintText="Upload the completed Consent to Act as a First Director (Form 3). PDF only, maximum 20 MB."
                value={director.consentFile}
                errorMessage={errors.consentFile}
                onChange={(file) => patch({ consentFile: file })}
              />
            </div>
          </div>
        ) : null}

        <div id={`${prefix}-address-type`}>
          <OntarioRadioButtons
            caption="Residential Address"
            name={`${prefix}-address-type`}
            required
            hintText="Select Canadian, US, or International. Canadian addresses are not limited to Ontario."
            value={director.address.addressType}
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

        {director.address.addressType === 'canadian' ? (
          <div className={step3Styles.addressFields}>
            {!director.address.enterManually ? (
              <div className={step3Styles.lookupBlock}>
                <label className={styles.naicsLabel} htmlFor={`${prefix}-postal-lookup`}>
                  Find the address using a postal code
                  <span className={styles.requiredFlag}> (required)</span>
                </label>
                <div className={styles.naicsSearch}>
                  <PostalCodeSearchAutosuggest
                    elementId={`${prefix}-postal-lookup`}
                    value={director.address.postalCodeLookup}
                    errorMessage={errors.postalCodeLookup}
                    hintText="Example: M5H 2N2, V6B 5A1, or Calgary (Canada-wide)"
                    onChange={(value) => patchAddress({ postalCodeLookup: value })}
                    onSelect={(result) => {
                      onChange({
                        ...director,
                        address: {
                          ...applyCanadianLookup(director.address, result),
                          postalCodeLookup: formatPostalCode(result.postalCode),
                          enterManually: false,
                        },
                      });
                    }}
                  />
                </div>
                <p className={step3Styles.postalCodeHint}>
                  Need help finding a postal code?{' '}
                  <a href={FIND_POSTAL_CODE_URL} target="_blank" rel="noopener noreferrer">
                    Find a postal code
                  </a>
                </p>
              </div>
            ) : null}

            <div className={step3Styles.manualToggle}>
              <OntarioCheckboxes
                caption="Manual address entry"
                name={`${prefix}-enter-manually`}
                value={director.address.enterManually ? ['manual'] : []}
                options={[
                  {
                    value: 'manual',
                    elementId: `${prefix}-enter-manually`,
                    label: 'Enter the address manually',
                  },
                ]}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  const checked = Boolean(target?.checked);
                  onChange({
                    ...director,
                    address: {
                      ...clearAddressForType('canadian'),
                      enterManually: checked,
                    },
                  });
                }}
              />
            </div>

            {showCanadianFields ? (
              <>
                <div className={step3Styles.addressGrid}>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId={`${prefix}-unit-type`}
                      caption="Unit type"
                      name={`${prefix}-unit-type`}
                      required={Boolean(director.address.unitNumber.trim())}
                      isEmptyStartOption
                      value={director.address.unitType}
                      options={UNIT_TYPE_OPTIONS}
                      errorMessage={errors.unitType}
                      customOnChange={(event) =>
                        patchAddress({ unitType: getEventValue(event) })
                      }
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioInput
                      elementId={`${prefix}-unit`}
                      caption="Unit number"
                      name={`${prefix}-unit`}
                      type="text"
                      required={false}
                      requiredValidationMessage=""
                      value={director.address.unitNumber}
                      customOnInput={(event) => {
                        const unitNumber = getEventValue(event);
                        patchAddress({
                          unitNumber,
                          unitType: unitNumber.trim()
                            ? director.address.unitType
                            : '',
                        });
                      }}
                    />
                  </div>
                </div>
                <div className={step3Styles.addressGrid}>
                  <div className={step3Styles.gridHalf}>
                    <OntarioInput
                      elementId={`${prefix}-street-number`}
                      caption="Street number"
                      name={`${prefix}-street-number`}
                      type="text"
                      required
                      requiredValidationMessage={REQUIRED}
                      value={director.address.streetNumber}
                      errorMessage={errors.streetNumber}
                      customOnInput={(event) =>
                        patchAddress({ streetNumber: getEventValue(event) })
                      }
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId={`${prefix}-street-suffix`}
                      caption="Street number suffix"
                      name={`${prefix}-street-suffix`}
                      isEmptyStartOption
                      options={STREET_NUMBER_SUFFIX_OPTIONS}
                      value={director.address.streetNumberSuffix}
                      customOnChange={(event) =>
                        patchAddress({ streetNumberSuffix: getEventValue(event) })
                      }
                    />
                  </div>
                </div>
                <OntarioInput
                  elementId={`${prefix}-street-name`}
                  caption="Street name"
                  name={`${prefix}-street-name`}
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED}
                  value={director.address.streetName}
                  errorMessage={errors.streetName}
                  customOnInput={(event) =>
                    patchAddress({ streetName: getEventValue(event) })
                  }
                />
                <div className={step3Styles.addressGrid}>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId={`${prefix}-street-type`}
                      caption="Street type"
                      name={`${prefix}-street-type`}
                      isEmptyStartOption
                      options={STREET_TYPE_OPTIONS}
                      value={director.address.streetType}
                      customOnChange={(event) =>
                        patchAddress({ streetType: getEventValue(event) })
                      }
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId={`${prefix}-street-direction`}
                      caption="Street direction"
                      name={`${prefix}-street-direction`}
                      isEmptyStartOption
                      options={STREET_DIRECTION_OPTIONS}
                      value={director.address.streetDirection}
                      customOnChange={(event) =>
                        patchAddress({ streetDirection: getEventValue(event) })
                      }
                    />
                  </div>
                </div>
                <OntarioInput
                  elementId={`${prefix}-city`}
                  caption="City/Town"
                  name={`${prefix}-city`}
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED}
                  value={director.address.cityTown}
                  errorMessage={errors.cityTown}
                  customOnInput={(event) =>
                    patchAddress({ cityTown: getEventValue(event) })
                  }
                />
                <OntarioDropdownList
                  elementId={`${prefix}-province`}
                  caption="Province/Territory"
                  name={`${prefix}-province`}
                  required
                  isEmptyStartOption
                  options={CANADIAN_PROVINCE_OPTIONS}
                  value={director.address.provinceState}
                  errorMessage={errors.provinceState}
                  customOnChange={(event) =>
                    patchAddress({ provinceState: getEventValue(event) })
                  }
                />
                <OntarioInput
                  elementId={`${prefix}-postal`}
                  caption="Postal code"
                  name={`${prefix}-postal`}
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED}
                  value={director.address.postalCode}
                  errorMessage={errors.postalCode}
                  customOnInput={(event) =>
                    patchAddress({ postalCode: getEventValue(event) })
                  }
                  customOnBlur={(event) =>
                    patchAddress({ postalCode: formatPostalCode(getEventValue(event)) })
                  }
                />
                <div className={step4Styles.readOnlyField}>
                  <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Country</h5>
                  <p className={step4Styles.readOnlyValue}>Canada</p>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {showManualForeign ? (
          <div className={step3Styles.addressFields}>
            <OntarioInput
              elementId={`${prefix}-line1`}
              caption="Address line 1"
              name={`${prefix}-line1`}
              type="text"
              required
              requiredValidationMessage={REQUIRED}
              value={director.address.addressLine1}
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
              value={director.address.addressLine2}
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
              requiredValidationMessage={REQUIRED}
              value={director.address.cityTown}
              errorMessage={errors.cityTown}
              customOnInput={(event) =>
                patchAddress({ cityTown: getEventValue(event) })
              }
            />
            <OntarioInput
              elementId={`${prefix}-state-region`}
              caption={
                director.address.addressType === 'us' ? 'State' : 'Province/Region'
              }
              name={`${prefix}-state-region`}
              type="text"
              required
              requiredValidationMessage={REQUIRED}
              value={director.address.provinceState}
              errorMessage={errors.provinceState}
              customOnInput={(event) =>
                patchAddress({ provinceState: getEventValue(event) })
              }
            />
            <OntarioInput
              elementId={`${prefix}-zip`}
              caption={
                director.address.addressType === 'us' ? 'ZIP code' : 'Postal code'
              }
              name={`${prefix}-zip`}
              type="text"
              required
              requiredValidationMessage={REQUIRED}
              value={director.address.postalCode}
              errorMessage={errors.postalCode}
              customOnInput={(event) =>
                patchAddress({ postalCode: getEventValue(event) })
              }
            />
            {director.address.addressType === 'us' ? (
              <div className={step4Styles.readOnlyField}>
                <h5 className={`ontario-h5 ${step4Styles.readOnlyLabel}`}>Country</h5>
                <p className={step4Styles.readOnlyValue}>United States</p>
              </div>
            ) : (
              <OntarioInput
                elementId={`${prefix}-country`}
                caption="Country"
                name={`${prefix}-country`}
                type="text"
                required
                requiredValidationMessage={REQUIRED}
                value={director.address.country}
                errorMessage={errors.country}
                customOnInput={(event) =>
                  patchAddress({ country: getEventValue(event) })
                }
              />
            )}
          </div>
        ) : null}

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

  if (!showChrome) {
    return fields;
  }

  return (
    <section className={step4Styles.directorBlock} aria-labelledby={`${prefix}-heading`}>
      <div className={step4Styles.blockHeader}>
        <h3 id={`${prefix}-heading`} className={`ontario-h3 ${step4Styles.blockTitle}`}>
          Director {index + 1}
        </h3>
        {canRemove && onRemove ? (
          <button
            type="button"
            className={step4Styles.removeLink}
            onClick={onRemove}
            aria-label={`Remove director ${index + 1}`}
          >
            <OntarioIconDelete colour="inherit" iconWidth={24} isDecorative />
            Remove
          </button>
        ) : null}
      </div>
      {fields}
    </section>
  );
}

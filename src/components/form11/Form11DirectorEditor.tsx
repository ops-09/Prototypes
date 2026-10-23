import { useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDropdownList,
  OntarioInput,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  FIND_POSTAL_CODE_URL,
  formatPostalCode,
  isValidPostalCodeFormat,
  lookupAddressesByPostalCode,
  POSTAL_CODE_FORMAT_ERROR,
  POSTAL_CODE_NOT_FOUND_ERROR,
  provinceFromPostalCode,
  type AddressLookupResult,
} from '../form1/canadaPostLookup';
import { FileUpload } from '../form1/FileUpload';
import {
  CANADIAN_PROVINCE_OPTIONS,
  DIRECTOR_CONSENT_FORM_URL,
  formatUnitLabel,
  STREET_DIRECTION_OPTIONS,
  STREET_NUMBER_SUFFIX_OPTIONS,
  STREET_TYPE_OPTIONS,
  UNIT_TYPE_OPTIONS,
  unitTypeRequiredError,
  type YesNoAnswer,
} from '../form1/form1DraftStorage';
import { PostalCodeSearchAutosuggest } from '../form1/PostalCodeSearchAutosuggest';
import styles from './Form11Step2.module.scss';
import step3Styles from '../form1/Form1Step3.module.scss';
import step4Styles from '../form1/Form1Step4.module.scss';
import { getEventValue, isValidEmail } from './form11Focus';
import { type Form11Director } from './form11DraftStorage';

const REQUIRED = 'Required Field.';
const EMAIL_INVALID = 'Please enter a valid email address.';
const ADDRESS_REQUIRED = 'Address for Service must be entered.';
const CONSENT_CHECKBOX_REQUIRED =
  'Confirm that this director has given consent to act as first director.';
const CONSENT_FILE_REQUIRED = 'Upload the completed consent form (PDF).';

export type DirectorFieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'alsoIncorporator'
  | 'addressType'
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'cityTown'
  | 'provinceState'
  | 'postalCode'
  | 'consent'
  | 'consentFile';

export type DirectorErrors = Partial<Record<DirectorFieldKey, string>>;

export const DIRECTOR_ERROR_FIELD_ORDER: DirectorFieldKey[] = [
  'firstName',
  'lastName',
  'email',
  'alsoIncorporator',
  'consent',
  'consentFile',
  'addressType',
  'postalCodeLookup',
  'unitType',
  'streetNumber',
  'streetName',
  'cityTown',
  'provinceState',
  'postalCode',
];

export function getDirectorFieldAnchor(directorId: string, field: DirectorFieldKey): string {
  const prefix = `dir-${directorId}`;
  switch (field) {
    case 'firstName':
      return `${prefix}-first-name`;
    case 'lastName':
      return `${prefix}-last-name`;
    case 'email':
      return `${prefix}-email`;
    case 'alsoIncorporator':
      return `${prefix}-also-incorporator`;
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
    case 'cityTown':
      return `${prefix}-city`;
    case 'provinceState':
      return `${prefix}-province`;
    case 'postalCode':
      return `${prefix}-postal`;
  }
}

function clearCanadianAddress(): Form11Director['address'] {
  return {
    addressType: 'canadian',
    postalCodeLookup: '',
    enterManually: false,
    selectedAddressId: '',
    unitType: '',
    unitNumber: '',
    streetNumber: '',
    streetName: '',
    streetNumberSuffix: '',
    streetType: '',
    streetDirection: '',
    addressLine1: '',
    addressLine2: '',
    cityTown: '',
    provinceState: '',
    postalCode: '',
    country: 'Canada',
  };
}

function applyCanadianLookup(
  prev: Form11Director['address'],
  result: AddressLookupResult,
): Form11Director['address'] {
  return {
    ...prev,
    addressType: 'canadian',
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
    enterManually: false,
  };
}

function hasAddressContent(director: Form11Director) {
  return Boolean(
    director.address.streetNumber.trim() &&
      director.address.streetName.trim() &&
      director.address.cityTown.trim() &&
      director.address.provinceState.trim() &&
      director.address.postalCode.trim(),
  );
}

export function validateDirector(director: Form11Director): DirectorErrors {
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
  if (!director.alsoIncorporator) {
    next.alsoIncorporator = REQUIRED;
  }
  if (director.address.addressType !== 'canadian') {
    next.addressType = REQUIRED;
  }

  if (director.address.addressType === 'canadian') {
    const canValidateFields =
      director.address.enterManually ||
      Boolean(director.address.selectedAddressId) ||
      hasAddressContent(director);
    if (!canValidateFields) {
      next.postalCodeLookup = ADDRESS_REQUIRED;
    } else {
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

export function formatDirectorFullName(director: Form11Director): string {
  return [director.firstName, director.middleName, director.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatDirectorAddressLine(director: Form11Director): string {
  const { address } = director;
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
      .join(', ') || ''
  );
}

export function formatDirectorListDescription(director: Form11Director) {
  const email = director.email.trim();
  const incorporator =
    director.alsoIncorporator === 'yes'
      ? 'Also an incorporator: Yes'
      : director.alsoIncorporator === 'no'
        ? 'Also an incorporator: No'
        : '';
  return {
    details: [email, incorporator].filter(Boolean).join(' · ') || 'Director details',
    address: formatDirectorAddressLine(director),
  };
}

type Form11DirectorEditorProps = {
  director: Form11Director;
  errors?: DirectorErrors;
  onChange: (director: Form11Director) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function Form11DirectorEditor({
  director,
  errors = {},
  onChange,
  onSave,
  onCancel,
}: Form11DirectorEditorProps) {
  const prefix = `dir-${director.id}`;
  const needsConsent = director.alsoIncorporator === 'no';
  const showCanadianFields =
    director.address.addressType === 'canadian' &&
    (director.address.enterManually || Boolean(director.address.selectedAddressId));
  const [findError, setFindError] = useState('');

  function patch(partial: Partial<Form11Director>) {
    onChange({ ...director, ...partial });
  }

  function patchAddress(partial: Partial<Form11Director['address']>) {
    onChange({
      ...director,
      address: { ...director.address, ...partial },
    });
  }

  function setAlsoIncorporator(value: YesNoAnswer) {
    onChange({
      ...director,
      alsoIncorporator: value,
      ...(value === 'yes' ? { consentConfirmed: false, consentFile: null } : {}),
    });
  }

  function handleFindAddress(query: string) {
    if (!isValidPostalCodeFormat(query)) {
      setFindError(POSTAL_CODE_FORMAT_ERROR);
      return;
    }
    const matches = lookupAddressesByPostalCode(query);
    if (matches.length === 0) {
      setFindError(POSTAL_CODE_NOT_FOUND_ERROR);
      return;
    }
    setFindError('');
  }

  const lookupError = findError || errors.postalCodeLookup;

  return (
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
          customOnChange={(event) => setAlsoIncorporator(getEventValue(event) as YesNoAnswer)}
        />
      </div>

      {needsConsent ? (
        <div className={step4Styles.consentBlock}>
          <h2 className={`ontario-h2 ${step4Styles.sectionHeading}`}>Director Consent</h2>
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
                patch({ consentConfirmed: Boolean(target?.checked) });
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
          caption="Address for Service"
          name={`${prefix}-address-type`}
          required
          hintText="A director’s address for service can be a Canadian address and is not limited to Ontario."
          value={director.address.addressType}
          options={[
            {
              value: 'canadian',
              elementId: `${prefix}-addr-canadian`,
              label: 'Canadian Address',
            },
          ]}
          errorMessage={errors.addressType}
          customOnChange={() => {
            onChange({
              ...director,
              address: clearCanadianAddress(),
            });
          }}
        />
      </div>

      {director.address.addressType === 'canadian' ? (
        <div className={step3Styles.addressFields}>
          {!director.address.enterManually ? (
            <div id={`${prefix}-postal-lookup`} className={step3Styles.lookupBlock}>
              <label className={styles.naicsLabel} htmlFor={`${prefix}-postal-lookup-input`}>
                Find the address using a postal code
                <span className={styles.requiredFlag}> (required)</span>
              </label>
              <div className={styles.naicsSearch}>
                <PostalCodeSearchAutosuggest
                  elementId={`${prefix}-postal-lookup-input`}
                  value={director.address.postalCodeLookup}
                  errorMessage={lookupError}
                  hintText="Example: M5H 2N2, V6B 5A1, or Calgary"
                  onChange={(value) => {
                    setFindError('');
                    patchAddress({ postalCodeLookup: value });
                  }}
                  onSearch={handleFindAddress}
                  onSelect={(result) => {
                    setFindError('');
                    onChange({
                      ...director,
                      address: {
                        ...applyCanadianLookup(director.address, result),
                        postalCodeLookup: formatPostalCode(result.postalCode),
                      },
                    });
                  }}
                />
              </div>
              <p className={step3Styles.postalCodeHint}>
                If you do not know your postal code you can find it{' '}
                <a href={FIND_POSTAL_CODE_URL} target="_blank" rel="noopener noreferrer">
                  here
                </a>
                .
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
                    ...clearCanadianAddress(),
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
                    options={[...UNIT_TYPE_OPTIONS]}
                    errorMessage={errors.unitType}
                    customOnChange={(event) => patchAddress({ unitType: getEventValue(event) })}
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
                        unitType: unitNumber.trim() ? director.address.unitType : '',
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
                    options={[...STREET_NUMBER_SUFFIX_OPTIONS]}
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
                customOnInput={(event) => patchAddress({ streetName: getEventValue(event) })}
              />
              <div className={step3Styles.addressGrid}>
                <div className={step3Styles.gridHalf}>
                  <OntarioDropdownList
                    elementId={`${prefix}-street-type`}
                    caption="Street type"
                    name={`${prefix}-street-type`}
                    isEmptyStartOption
                    options={[...STREET_TYPE_OPTIONS]}
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
                    options={[...STREET_DIRECTION_OPTIONS]}
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
                customOnInput={(event) => patchAddress({ cityTown: getEventValue(event) })}
              />
              <OntarioDropdownList
                elementId={`${prefix}-province`}
                caption="Province/Territory"
                name={`${prefix}-province`}
                required
                isEmptyStartOption
                options={[...CANADIAN_PROVINCE_OPTIONS]}
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
                customOnInput={(event) => patchAddress({ postalCode: getEventValue(event) })}
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

      <div className={step4Styles.doneActions}>
        <div className={step4Styles.doneButtons}>
          <OntarioButton type="primary" htmlType="button" label="Done" onClick={onSave} />
          <OntarioButton type="tertiary" htmlType="button" label="Cancel" onClick={onCancel} />
        </div>
      </div>
    </div>
  );
}

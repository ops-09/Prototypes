import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioInput,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import {
  DIRECTOR_CONSENT_FORM_URL,
  EMPTY_DIRECTOR_ADDRESS,
  formatUnitLabel,
  type DirectorAddressType,
} from '../form1/form1DraftStorage';
import step3Styles from '../form1/Form1Step3.module.scss';
import step4Styles from '../form1/Form1Step4.module.scss';
import { getEventValue, isValidEmail } from './form11Focus';
import { type Form11Director } from './form11DraftStorage';
import {
  CanadianAddressFields,
  validateCanadianAddress,
} from '../shared/CanadianAddressFields';

const EMAIL_INVALID = 'Enter a valid email address, like name@example.com.';
const CONSENT_CHECKBOX_REQUIRED =
  'Confirm that this director has given consent to act as first director.';
const CONSENT_FILE_REQUIRED = 'Upload the completed consent form (PDF).';

const ADDRESS_TYPE_OPTIONS = [
  { value: 'canadian', label: 'Canadian address' },
  { value: 'us', label: 'US address' },
  { value: 'international', label: 'International address' },
];

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
  | 'addressLine1'
  | 'cityTown'
  | 'provinceState'
  | 'postalCode'
  | 'country'
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
  'addressLine1',
  'cityTown',
  'provinceState',
  'postalCode',
  'country',
];

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

function clearAddressForType(addressType: DirectorAddressType | ''): Form11Director['address'] {
  const base = { ...EMPTY_DIRECTOR_ADDRESS, addressType };
  if (addressType === 'canadian') {
    return { ...base, country: 'Canada' };
  }
  if (addressType === 'us') {
    return { ...base, country: 'United States' };
  }
  return base;
}

export function validateDirector(director: Form11Director): DirectorErrors {
  const next: DirectorErrors = {};
  const needsConsent = director.alsoIncorporator === 'no';

  if (!director.firstName.trim()) {
    next.firstName = 'Enter the first name.';
  }
  if (!director.lastName.trim()) {
    next.lastName = 'Enter the last name.';
  }
  if (director.email.trim() && !isValidEmail(director.email.trim())) {
    next.email = EMAIL_INVALID;
  }
  if (!director.address.addressType) {
    next.addressType = 'Select the type of address.';
  }

  if (director.address.addressType === 'canadian') {
    Object.assign(next, validateCanadianAddress(director.address));
  }

  if (director.address.addressType === 'us' || director.address.addressType === 'international') {
    if (!director.address.addressLine1.trim()) {
      next.addressLine1 = 'Enter address line 1.';
    }
    if (!director.address.cityTown.trim()) {
      next.cityTown = 'Enter the city or town.';
    }
    if (!director.address.provinceState.trim()) {
      next.provinceState = 'Enter the state, province or region.';
    }
    if (!director.address.postalCode.trim()) {
      next.postalCode = 'Enter the ZIP or postal code.';
    }
    if (director.address.addressType === 'international' && !director.address.country.trim()) {
      next.country = 'Enter the country.';
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
        .join(', ') || ''
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
      .join(', ') || ''
  );
}

export function formatDirectorListDescription(director: Form11Director) {
  const email = director.email.trim();
  return {
    details: email || 'Director details',
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
  const showManualForeign =
    director.address.addressType === 'us' || director.address.addressType === 'international';

  function patch(partial: Partial<Form11Director>) {
    onChange({ ...director, ...partial });
  }

  function patchAddress(partial: Partial<Form11Director['address']>) {
    onChange({
      ...director,
      address: { ...director.address, ...partial },
    });
  }

  function setAddressType(value: DirectorAddressType) {
    onChange({
      ...director,
      address: clearAddressForType(value),
    });
  }

  return (
    <div className={step4Styles.blockFields}>
      <div className={step4Styles.nameRow}>
        <OntarioInput
          elementId={`${prefix}-first-name`}
          caption="First name"
          inputWidth="20-char-width"
          name={`${prefix}-first-name`}
          type="text"
          required
          requiredValidationMessage="Enter the first name."
          value={director.firstName}
          errorMessage={errors.firstName}
          customOnInput={(event) => patch({ firstName: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${prefix}-middle-name`}
          caption="Middle name(s)"
          inputWidth="20-char-width"
          name={`${prefix}-middle-name`}
          type="text"
          required={false}
          requiredValidationMessage=""
          value={director.middleName}
          customOnInput={(event) => patch({ middleName: getEventValue(event) })}
        />
        <OntarioInput
          elementId={`${prefix}-last-name`}
          caption="Last name"
          inputWidth="20-char-width"
          name={`${prefix}-last-name`}
          type="text"
          required
          requiredValidationMessage="Enter the last name."
          value={director.lastName}
          errorMessage={errors.lastName}
          customOnInput={(event) => patch({ lastName: getEventValue(event) })}
        />
      </div>

      <OntarioInput
        elementId={`${prefix}-email`}
        caption="Email address"
        name={`${prefix}-email`}
        type="email"
        required={false}
        requiredValidationMessage=""
        value={director.email}
        errorMessage={errors.email}
        customOnInput={(event) => patch({ email: getEventValue(event) })}
      />

      {needsConsent ? (
        <div className={step4Styles.consentBlock}>
          <h2 className={`ontario-h2 ${step4Styles.sectionHeading}`}>Director consent</h2>
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
          caption="Address for service"
          name={`${prefix}-address-type`}
          required
          hintText="Select Canadian, US, or International. A director’s address for service is not limited to Ontario."
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
        <CanadianAddressFields
          idPrefix={prefix}
          address={director.address}
          errors={errors}
          onChange={(address) => onChange({ ...director, address })}
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
            value={director.address.addressLine1}
            errorMessage={errors.addressLine1}
            customOnInput={(event) => patchAddress({ addressLine1: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-line2`}
            caption="Address line 2"
            name={`${prefix}-line2`}
            type="text"
            required={false}
            requiredValidationMessage=""
            value={director.address.addressLine2}
            customOnInput={(event) => patchAddress({ addressLine2: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-foreign-city`}
            caption="City/Town"
            name={`${prefix}-foreign-city`}
            type="text"
            required
            requiredValidationMessage="Enter the city or town."
            value={director.address.cityTown}
            errorMessage={errors.cityTown}
            customOnInput={(event) => patchAddress({ cityTown: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-state-region`}
            caption={director.address.addressType === 'us' ? 'State' : 'Province/Region'}
            name={`${prefix}-state-region`}
            type="text"
            required
            requiredValidationMessage="Enter the state, province or region."
            value={director.address.provinceState}
            errorMessage={errors.provinceState}
            customOnInput={(event) => patchAddress({ provinceState: getEventValue(event) })}
          />
          <OntarioInput
            elementId={`${prefix}-zip`}
            caption={director.address.addressType === 'us' ? 'ZIP code' : 'Postal code'}
            name={`${prefix}-zip`}
            type="text"
            required
            requiredValidationMessage="Enter the ZIP or postal code."
            value={director.address.postalCode}
            errorMessage={errors.postalCode}
            customOnInput={(event) => patchAddress({ postalCode: getEventValue(event) })}
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
              requiredValidationMessage="Enter the country."
              value={director.address.country}
              errorMessage={errors.country}
              customOnInput={(event) => patchAddress({ country: getEventValue(event) })}
            />
          )}
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

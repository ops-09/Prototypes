import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioInput,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import {
  DIRECTOR_CONSENT_FORM_URL,
  formatUnitLabel,
  type YesNoAnswer,
} from '../form1/form1DraftStorage';
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
  if (!director.alsoIncorporator) {
    next.alsoIncorporator = 'Select whether the director is also an incorporator.';
  }
  if (director.address.addressType !== 'canadian') {
    next.addressType = 'Select the type of address.';
  }

  if (director.address.addressType === 'canadian') {
    Object.assign(next, validateCanadianAddress(director.address));
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

  function patch(partial: Partial<Form11Director>) {
    onChange({ ...director, ...partial });
  }

  function setAlsoIncorporator(value: YesNoAnswer) {
    onChange({
      ...director,
      alsoIncorporator: value,
      ...(value === 'yes' ? { consentConfirmed: false, consentFile: null } : {}),
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
          hintText="A director’s address for service can be a Canadian address and is not limited to Ontario."
          value={director.address.addressType}
          options={[
            {
              value: 'canadian',
              elementId: `${prefix}-addr-canadian`,
              label: 'Canadian address',
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
        <CanadianAddressFields
          idPrefix={prefix}
          address={director.address}
          errors={errors}
          onChange={(address) => onChange({ ...director, address })}
        />
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

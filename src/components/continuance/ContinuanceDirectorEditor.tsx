import {
  OntarioButton,
  OntarioInput,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  EMPTY_DIRECTOR_ADDRESS,
  formatUnitLabel,
  type DirectorAddressType,
  type YesNoAnswer,
} from '../form1/form1DraftStorage';
import step3Styles from '../form1/Form1Step3.module.scss';
import step4Styles from '../form1/Form1Step4.module.scss';
import {
  CanadianAddressFields,
  validateCanadianAddress,
} from '../shared/CanadianAddressFields';
import { getEventValue, isValidEmail } from './continuanceFocus';
import { type ContinuanceDirector } from './continuanceDraftStorage';

const REQUIRED_FIELD = 'Required Field.';
const EMAIL_INVALID = 'Please enter a valid email address.';

const ADDRESS_TYPE_OPTIONS = [
  { value: 'canadian', label: 'Canadian Address' },
  { value: 'us', label: 'US Address' },
  { value: 'international', label: 'International Address' },
];

export type DirectorFieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'residentCanadian'
  | 'addressType'
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'addressLine1'
  | 'cityTown'
  | 'provinceState'
  | 'postalCode'
  | 'country';

export type DirectorErrors = Partial<Record<DirectorFieldKey, string>>;

export const DIRECTOR_ERROR_FIELD_ORDER: DirectorFieldKey[] = [
  'firstName',
  'lastName',
  'email',
  'residentCanadian',
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
    case 'residentCanadian':
      return `${prefix}-resident-canadian`;
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

function clearAddressForType(
  addressType: DirectorAddressType | '',
): ContinuanceDirector['address'] {
  const base = { ...EMPTY_DIRECTOR_ADDRESS, addressType };
  if (addressType === 'canadian') {
    return { ...base, country: 'Canada' };
  }
  if (addressType === 'us') {
    return { ...base, country: 'United States' };
  }
  return base;
}

export function validateDirector(director: ContinuanceDirector): DirectorErrors {
  const next: DirectorErrors = {};

  if (!director.firstName.trim()) {
    next.firstName = REQUIRED_FIELD;
  }
  if (!director.lastName.trim()) {
    next.lastName = REQUIRED_FIELD;
  }
  if (director.email.trim() && !isValidEmail(director.email.trim())) {
    next.email = EMAIL_INVALID;
  }
  if (!director.residentCanadian) {
    next.residentCanadian = REQUIRED_FIELD;
  }
  if (!director.address.addressType) {
    next.addressType = REQUIRED_FIELD;
  }

  if (director.address.addressType === 'canadian') {
    Object.assign(next, validateCanadianAddress(director.address));
  }

  if (director.address.addressType === 'us' || director.address.addressType === 'international') {
    if (!director.address.addressLine1.trim()) {
      next.addressLine1 = REQUIRED_FIELD;
    }
    if (!director.address.cityTown.trim()) {
      next.cityTown = REQUIRED_FIELD;
    }
    if (!director.address.provinceState.trim()) {
      next.provinceState = REQUIRED_FIELD;
    }
    if (!director.address.postalCode.trim()) {
      next.postalCode = REQUIRED_FIELD;
    }
    if (director.address.addressType === 'international' && !director.address.country.trim()) {
      next.country = REQUIRED_FIELD;
    }
  }

  return next;
}

export function formatDirectorFullName(director: ContinuanceDirector): string {
  return [director.firstName, director.middleName, director.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatDirectorAddressLine(director: ContinuanceDirector): string {
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

export function formatDirectorListDescription(director: ContinuanceDirector) {
  const details: string[] = [];
  if (director.residentCanadian === 'yes') {
    details.push('Resident Canadian: Yes');
  } else if (director.residentCanadian === 'no') {
    details.push('Resident Canadian: No');
  }
  if (director.email.trim()) {
    details.push(director.email.trim());
  }
  return {
    details,
    address: formatDirectorAddressLine(director),
  };
}

type ContinuanceDirectorEditorProps = {
  director: ContinuanceDirector;
  errors?: DirectorErrors;
  onChange: (director: ContinuanceDirector) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ContinuanceDirectorEditor({
  director,
  errors = {},
  onChange,
  onSave,
  onCancel,
}: ContinuanceDirectorEditorProps) {
  const prefix = `dir-${director.id}`;
  const showManualForeign =
    director.address.addressType === 'us' || director.address.addressType === 'international';

  function patch(partial: Partial<ContinuanceDirector>) {
    onChange({ ...director, ...partial });
  }

  function patchAddress(partial: Partial<ContinuanceDirector['address']>) {
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
          requiredValidationMessage={REQUIRED_FIELD}
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
          requiredValidationMessage={REQUIRED_FIELD}
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

      <div id={`${prefix}-address-type`}>
        <OntarioRadioButtons
          caption="Residential address"
          name={`${prefix}-address-type`}
          required
          hintText="Select Canadian, US, or International. A director’s residential address is not limited to Ontario."
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
            requiredValidationMessage={REQUIRED_FIELD}
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
            requiredValidationMessage={REQUIRED_FIELD}
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
            requiredValidationMessage={REQUIRED_FIELD}
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
            requiredValidationMessage={REQUIRED_FIELD}
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
              requiredValidationMessage={REQUIRED_FIELD}
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

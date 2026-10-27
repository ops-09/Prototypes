import { OntarioInput } from '@ongov/ontario-design-system-component-library-react';
import {
  PHONE_EXTENSION_INPUT_WIDTH,
  PHONE_NUMBER_INPUT_WIDTH,
} from '../cover-letter/phoneFieldSizing';
import type { PhoneFieldErrors } from '../cover-letter/phoneValidation';

type PhoneNumberFieldsProps = {
  phoneNumber: string;
  phoneExtension: string;
  errors?: PhoneFieldErrors;
  phoneElementId: string;
  extensionElementId: string;
  phoneName?: string;
  extensionName?: string;
  onPhoneNumberChange: (value: string) => void;
  onPhoneExtensionChange: (value: string) => void;
  phoneRequired?: boolean;
  phoneCaption?: string;
  extensionCaption?: string;
};

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

/** Phone number + extension with ODS character-based input widths. */
export function PhoneNumberFields({
  phoneNumber,
  phoneExtension,
  errors,
  phoneElementId,
  extensionElementId,
  phoneName = 'phone-number',
  extensionName = 'phone-extension',
  onPhoneNumberChange,
  onPhoneExtensionChange,
  phoneRequired = true,
  phoneCaption = 'Phone number',
  extensionCaption = 'Ext',
}: PhoneNumberFieldsProps) {
  return (
    <>
      <OntarioInput
        elementId={phoneElementId}
        caption={phoneCaption}
        name={phoneName}
        type="tel"
        inputWidth={PHONE_NUMBER_INPUT_WIDTH}
        required={phoneRequired}
        requiredValidationMessage={
          phoneRequired ? 'Enter your phone number.' : ''
        }
        value={phoneNumber}
        errorMessage={errors?.phoneNumber}
        customOnInput={(event) => onPhoneNumberChange(getEventValue(event))}
      />
      <OntarioInput
        elementId={extensionElementId}
        caption={extensionCaption}
        name={extensionName}
        type="tel"
        inputWidth={PHONE_EXTENSION_INPUT_WIDTH}
        required={false}
        requiredValidationMessage=""
        value={phoneExtension}
        errorMessage={errors?.phoneExtension}
        customOnInput={(event) => onPhoneExtensionChange(getEventValue(event))}
      />
    </>
  );
}

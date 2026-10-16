import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDropdownList,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  FIND_POSTAL_CODE_URL,
  formatAddressSuggestion,
  formatPostalCode,
  isOntarioPostalCode,
  isValidPostalCodeFormat,
  POSTAL_CODE_FORMAT_ERROR,
  POSTAL_CODE_ONTARIO_ERROR,
  type AddressLookupResult,
} from './canadaPostLookup';
import {
  COUNTY_STATUS_OPTIONS,
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  hasForm1Step1Data,
  HEAD_OFFICE_INFO,
  MUNICIPALITY_STATUS_OPTIONS,
  readForm1Draft,
  saveForm1Draft,
  STREET_DIRECTION_OPTIONS,
  STREET_NUMBER_SUFFIX_OPTIONS,
  STREET_TYPE_OPTIONS,
  UNIT_TYPE_OPTIONS,
  unitTypeRequiredError,
  upsertForm1Step3,
  type Form1Draft,
  type Form1Step3Data,
  hasForm1Step2Data,
} from './form1DraftStorage';
import { PostalCodeSearchAutosuggest } from './PostalCodeSearchAutosuggest';
import styles from './Form1Step1.module.scss';
import step3Styles from './Form1Step3.module.scss';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 9;

const REQUIRED_FIELD_ERROR = 'Required Field. Please try again.';
const HEAD_OFFICE_REQUIRED_ERROR = 'Head Office Address must be entered.';

type FieldKey =
  | 'postalCodeLookup'
  | 'unitType'
  | 'streetNumber'
  | 'streetName'
  | 'cityTown'
  | 'postalCode'
  | 'municipalityStatus'
  | 'municipalityName'
  | 'countyStatus'
  | 'countyName'
  | 'headOffice';

type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  postalCodeLookup: 'postal-code-lookup',
  unitType: 'unit-type',
  streetNumber: 'street-number',
  streetName: 'street-name',
  cityTown: 'city-town',
  postalCode: 'postal-code',
  municipalityStatus: 'municipality-status',
  municipalityName: 'municipality-name',
  countyStatus: 'county-status',
  countyName: 'county-name',
  headOffice: 'head-office-address',
};

const FIELD_ORDER: FieldKey[] = [
  'postalCodeLookup',
  'headOffice',
  'unitType',
  'streetNumber',
  'streetName',
  'cityTown',
  'postalCode',
  'municipalityStatus',
  'municipalityName',
  'countyStatus',
  'countyName',
];

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-input, ontario-dropdown-list, ontario-search-box, ontario-checkboxes, ontario-button',
  );
  const nestedShadowControl = nestedHost?.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button',
  );
  if (nestedShadowControl) {
    nestedShadowControl.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
}

function clearAddressFields(prev: Form1Step3Data): Form1Step3Data {
  return {
    ...prev,
    selectedAddressId: '',
    unitType: '',
    roomNumber: '',
    streetNumber: '',
    streetName: '',
    streetNumberSuffix: '',
    streetType: '',
    streetDirection: '',
    cityTown: '',
    province: 'Ontario',
    postalCode: '',
    country: 'Canada',
    municipalityStatus: '',
    municipalityName: '',
    countyStatus: '',
    countyName: '',
  };
}

function applyLookupResult(
  prev: Form1Step3Data,
  result: AddressLookupResult,
): Form1Step3Data {
  return {
    ...prev,
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
    municipalityName: result.municipalityName,
    countyStatus: result.countyStatus,
    countyName: result.countyName,
  };
}

function hasAddressContent(step3: Form1Step3Data) {
  return Boolean(
    step3.streetNumber.trim() &&
      step3.streetName.trim() &&
      step3.cityTown.trim() &&
      step3.postalCode.trim(),
  );
}

/** Prototype deep-link: seed Steps 1–2 so /form-1/step-4 opens from the playground. */
function ensureStep3Draft(): Form1Draft {
  const existing = readForm1Draft();
  if (
    hasForm1Step1Data(existing?.step1) &&
    hasForm1Step2Data(existing.step2) &&
    existing.step2.primaryActivity &&
    existing.step2.email
  ) {
    return {
      ...existing,
      step3: { ...EMPTY_STEP3, ...(existing.step3 ?? {}) },
      step4: existing.step4 ?? { ...EMPTY_STEP4 },
      step5: existing.step5 ?? { ...EMPTY_STEP5 },
      step6: existing.step6 ?? { ...EMPTY_STEP6 },
      step7: existing.step7 ?? { ...EMPTY_STEP7 },
    };
  }

  const now = new Date().toISOString();
  const seeded: Form1Draft = {
    step1: createSeedStep1(),
    step2: {
      ...EMPTY_STEP2,
      cooperativeSubtype: 'Worker Co-operative',
      primaryActivity: '4521 - Department stores',
      email: 'registry@greeninstitute.coop',
      confirmEmail: 'registry@greeninstitute.coop',
    },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 2,
  };
  saveForm1Draft(seeded);
  return seeded;
}

export function Form1Step3() {
  const navigate = useNavigate();
  const draft = ensureStep3Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step3, setStep3] = useState<Form1Step3Data>(() => ({
    ...EMPTY_STEP3,
    ...(draft.step3 ?? {}),
    province: 'Ontario',
    country: 'Canada',
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const showAddressFields = step3.enterManually || Boolean(step3.selectedAddressId);

  const errorSummaryItems = useMemo(
    () =>
      FIELD_ORDER.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
      }),
    [errors],
  );

  function patchStep3(partial: Partial<Form1Step3Data>) {
    setStep3((prev) => ({ ...prev, ...partial, province: 'Ontario', country: 'Canada' }));
  }

  function clearError(...keys: FieldKey[]) {
    setErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }

  function handlePostalLookupChange(next: string) {
    patchStep3({
      postalCodeLookup: next,
      selectedAddressId: '',
    });
    clearError('postalCodeLookup', 'headOffice');
  }

  function handlePostalLookupSelect(entry: AddressLookupResult) {
    setStep3((prev) =>
      applyLookupResult(
        {
          ...prev,
          postalCodeLookup: formatAddressSuggestion(entry),
          enterManually: false,
        },
        entry,
      ),
    );
    clearError(
      'postalCodeLookup',
      'headOffice',
      'unitType',
      'streetNumber',
      'streetName',
      'cityTown',
      'postalCode',
      'municipalityStatus',
      'municipalityName',
      'countyStatus',
      'countyName',
    );
  }

  function handleManualToggle(checked: boolean) {
    if (checked) {
      setStep3((prev) => ({
        ...clearAddressFields(prev),
        enterManually: true,
        postalCodeLookup: '',
      }));
      clearError('postalCodeLookup');
    } else {
      setStep3((prev) => ({
        ...clearAddressFields(prev),
        enterManually: false,
        postalCodeLookup: '',
      }));
    }
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    if (!step3.enterManually && !step3.selectedAddressId) {
      const query = step3.postalCodeLookup.trim();
      if (!query) {
        next.postalCodeLookup = HEAD_OFFICE_REQUIRED_ERROR;
      } else if (isValidPostalCodeFormat(query) && !isOntarioPostalCode(query)) {
        next.postalCodeLookup = POSTAL_CODE_ONTARIO_ERROR;
      } else if (isValidPostalCodeFormat(query)) {
        next.postalCodeLookup = HEAD_OFFICE_REQUIRED_ERROR;
      } else {
        next.postalCodeLookup = HEAD_OFFICE_REQUIRED_ERROR;
      }
      return next;
    }

    if (!hasAddressContent(step3)) {
      next.headOffice = HEAD_OFFICE_REQUIRED_ERROR;
      if (!step3.streetNumber.trim()) {
        next.streetNumber = REQUIRED_FIELD_ERROR;
      }
      if (!step3.streetName.trim()) {
        next.streetName = REQUIRED_FIELD_ERROR;
      }
      if (!step3.cityTown.trim()) {
        next.cityTown = REQUIRED_FIELD_ERROR;
      }
      if (!step3.postalCode.trim()) {
        next.postalCode = REQUIRED_FIELD_ERROR;
      }
      return next;
    }

    if (step3.postalCode.trim() && !isValidPostalCodeFormat(step3.postalCode)) {
      next.postalCode = POSTAL_CODE_FORMAT_ERROR;
    } else if (step3.postalCode.trim() && !isOntarioPostalCode(step3.postalCode)) {
      next.postalCode = POSTAL_CODE_ONTARIO_ERROR;
    }

    const unitTypeError = unitTypeRequiredError(step3.roomNumber, step3.unitType);
    if (unitTypeError) {
      next.unitType = unitTypeError;
    }

    if (!step3.municipalityStatus.trim()) {
      next.municipalityStatus = REQUIRED_FIELD_ERROR;
    }
    if (!step3.municipalityName.trim()) {
      next.municipalityName = REQUIRED_FIELD_ERROR;
    }
    if (!step3.countyStatus.trim()) {
      next.countyStatus = REQUIRED_FIELD_ERROR;
    }
    if (!step3.countyName.trim()) {
      next.countyName = REQUIRED_FIELD_ERROR;
    }

    return next;
  }

  function handleContinue() {
    const nextErrors = validateAll();
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm1Step3(step3, 'continue', 3);
    navigate('/form-1/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm1Step3(step3, 'draft', draft.lastCompletedStep >= 3 ? 3 : 2);
    navigate('/form-1/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-1/step-3"
          currentStep={CURRENT_STEP}
          numberOfSteps={TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && errorSummaryItems.length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errorSummaryItems.map((item) => (
                    <li key={item.key}>
                      <a
                        className={styles.errorSummaryLink}
                        href={item.href}
                        onClick={(event) => handleSummaryLinkClick(event, item.href)}
                      >
                        {item.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Head office address</h1>

          <p className={styles.lead}>{HEAD_OFFICE_INFO}</p>

          <div className={styles.formStack} id={FIELD_ANCHORS.headOffice}>
            <h2 className={`ontario-h2 ${step3Styles.sectionHeading}`}>Physical Address</h2>

            {!step3.enterManually ? (
              <div id={FIELD_ANCHORS.postalCodeLookup} className={step3Styles.lookupBlock}>
                <label
                  className={styles.naicsLabel}
                  htmlFor={`${FIELD_ANCHORS.postalCodeLookup}-input`}
                >
                  Find the address using a postal code
                  <span className={styles.requiredFlag}> (required)</span>
                </label>

                <div className={styles.naicsSearch}>
                  <PostalCodeSearchAutosuggest
                    elementId={`${FIELD_ANCHORS.postalCodeLookup}-input`}
                    value={step3.postalCodeLookup}
                    errorMessage={errors.postalCodeLookup}
                    onChange={handlePostalLookupChange}
                    onSelect={handlePostalLookupSelect}
                  />
                </div>

                <p className={step3Styles.postalCodeHint}>
                  If you do not know your postal code you can find it{' '}
                  <a
                    href={FIND_POSTAL_CODE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                  </a>
                  .
                </p>
              </div>
            ) : null}

            <div className={step3Styles.manualToggle}>
              <OntarioCheckboxes
                caption={{
                  captionText: 'Address entry options',
                  captionType: 'default',
                }}
                name="enter-address-manually"
                options={[
                  {
                    value: 'manual',
                    elementId: 'enter-address-manually',
                    label: 'Enter address manually',
                  },
                ]}
                value={step3.enterManually ? ['manual'] : []}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean' ? selected : !step3.enterManually;
                  handleManualToggle(nextChecked);
                }}
              />
            </div>

            {showAddressFields ? (
              <div className={step3Styles.addressFields}>
                <div className={step3Styles.addressGrid}>
                  <div className={step3Styles.gridHalf} id={FIELD_ANCHORS.unitType}>
                    <OntarioDropdownList
                      elementId={FIELD_ANCHORS.unitType}
                      caption="Unit type"
                      name="unit-type"
                      required={Boolean(step3.roomNumber.trim())}
                      isEmptyStartOption
                      value={step3.unitType}
                      options={[...UNIT_TYPE_OPTIONS]}
                      errorMessage={errors.unitType}
                      customOnChange={(event) => {
                        patchStep3({ unitType: getEventValue(event) });
                        clearError('unitType');
                      }}
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioInput
                      elementId="unit-number"
                      caption="Unit number"
                      name="unit-number"
                      type="text"
                      inputWidth="10-char-width"
                      required={false}
                      requiredValidationMessage=""
                      value={step3.roomNumber}
                      customOnInput={(event) => {
                        const roomNumber = getEventValue(event);
                        patchStep3({
                          roomNumber,
                          unitType: roomNumber.trim() ? step3.unitType : '',
                        });
                        if (!roomNumber.trim()) {
                          clearError('unitType');
                        }
                      }}
                    />
                  </div>
                  <div className={step3Styles.gridHalf} id={FIELD_ANCHORS.streetNumber}>
                    <OntarioInput
                      elementId={FIELD_ANCHORS.streetNumber}
                      caption="Street number"
                      name="street-number"
                      type="text"
                      inputWidth="10-char-width"
                      required
                      requiredValidationMessage={REQUIRED_FIELD_ERROR}
                      value={step3.streetNumber}
                      errorMessage={errors.streetNumber}
                      customOnInput={(event) => {
                        patchStep3({ streetNumber: getEventValue(event) });
                        clearError('streetNumber', 'headOffice');
                      }}
                    />
                  </div>
                  <div className={step3Styles.gridHalf} id={FIELD_ANCHORS.streetName}>
                    <OntarioInput
                      elementId={FIELD_ANCHORS.streetName}
                      caption="Street name"
                      name="street-name"
                      type="text"
                      required
                      requiredValidationMessage={REQUIRED_FIELD_ERROR}
                      value={step3.streetName}
                      errorMessage={errors.streetName}
                      customOnInput={(event) => {
                        patchStep3({ streetName: getEventValue(event) });
                        clearError('streetName', 'headOffice');
                      }}
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId="street-number-suffix"
                      caption="Street number suffix"
                      name="street-number-suffix"
                      isEmptyStartOption
                      value={step3.streetNumberSuffix}
                      options={[...STREET_NUMBER_SUFFIX_OPTIONS]}
                      customOnChange={(event) =>
                        patchStep3({ streetNumberSuffix: getEventValue(event) })
                      }
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId="street-type"
                      caption="Street type"
                      name="street-type"
                      isEmptyStartOption
                      value={step3.streetType}
                      options={[...STREET_TYPE_OPTIONS]}
                      customOnChange={(event) =>
                        patchStep3({ streetType: getEventValue(event) })
                      }
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId="street-direction"
                      caption="Street direction"
                      name="street-direction"
                      isEmptyStartOption
                      value={step3.streetDirection}
                      options={[...STREET_DIRECTION_OPTIONS]}
                      customOnChange={(event) =>
                        patchStep3({ streetDirection: getEventValue(event) })
                      }
                    />
                  </div>
                </div>

                <div id={FIELD_ANCHORS.cityTown}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.cityTown}
                    caption="City/Town"
                    name="city-town"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED_FIELD_ERROR}
                    value={step3.cityTown}
                    errorMessage={errors.cityTown}
                    customOnInput={(event) => {
                      patchStep3({ cityTown: getEventValue(event) });
                      clearError('cityTown', 'headOffice');
                    }}
                  />
                </div>

                <div className={step3Styles.lockedField}>
                  <p className={step3Styles.lockedLabel}>Province/Territory</p>
                  <p className={step3Styles.lockedValue}>Ontario</p>
                </div>

                <div id={FIELD_ANCHORS.postalCode}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.postalCode}
                    caption="Postal code"
                    name="postal-code"
                    type="text"
                    inputWidth="7-char-width"
                    required
                    requiredValidationMessage={REQUIRED_FIELD_ERROR}
                    value={step3.postalCode}
                    errorMessage={errors.postalCode}
                    customOnInput={(event) => {
                      patchStep3({ postalCode: getEventValue(event) });
                      clearError('postalCode', 'headOffice');
                    }}
                    customOnBlur={(event) => {
                      patchStep3({ postalCode: formatPostalCode(getEventValue(event)) });
                    }}
                  />
                </div>

                <div className={step3Styles.lockedField}>
                  <p className={step3Styles.lockedLabel}>Country</p>
                  <p className={step3Styles.lockedValue}>Canada</p>
                </div>

                <div id={FIELD_ANCHORS.municipalityStatus}>
                  <OntarioDropdownList
                    elementId={FIELD_ANCHORS.municipalityStatus}
                    caption="Status of Municipality"
                    name="municipality-status"
                    required
                    isEmptyStartOption
                    value={step3.municipalityStatus}
                    options={[...MUNICIPALITY_STATUS_OPTIONS]}
                    errorMessage={errors.municipalityStatus}
                    customOnChange={(event) => {
                      patchStep3({ municipalityStatus: getEventValue(event) });
                      clearError('municipalityStatus');
                    }}
                  />
                </div>

                <div id={FIELD_ANCHORS.municipalityName}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.municipalityName}
                    caption="Name of Municipality"
                    name="municipality-name"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED_FIELD_ERROR}
                    value={step3.municipalityName}
                    errorMessage={errors.municipalityName}
                    customOnInput={(event) => {
                      patchStep3({ municipalityName: getEventValue(event) });
                      clearError('municipalityName');
                    }}
                  />
                </div>

                <div id={FIELD_ANCHORS.countyStatus}>
                  <OntarioDropdownList
                    elementId={FIELD_ANCHORS.countyStatus}
                    caption="County, District or Regional Municipality"
                    name="county-status"
                    required
                    isEmptyStartOption
                    value={step3.countyStatus}
                    options={[...COUNTY_STATUS_OPTIONS]}
                    errorMessage={errors.countyStatus}
                    customOnChange={(event) => {
                      patchStep3({ countyStatus: getEventValue(event) });
                      clearError('countyStatus');
                    }}
                  />
                </div>

                <div id={FIELD_ANCHORS.countyName}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.countyName}
                    caption="Name of County, District or Regional Municipality"
                    name="county-name"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED_FIELD_ERROR}
                    value={step3.countyName}
                    errorMessage={errors.countyName}
                    customOnInput={(event) => {
                      patchStep3({ countyName: getEventValue(event) });
                      clearError('countyName');
                    }}
                  />
                </div>
              </div>
            ) : null}

            {errors.headOffice && !showAddressFields ? (
              <p className={styles.fieldError} role="alert">
                {errors.headOffice}
              </p>
            ) : null}
          </div>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Continue"
              onClick={handleContinue}
            />
            <OntarioButton
              type="secondary"
              htmlType="button"
              label="Save as Draft"
              onClick={handleSaveAsDraft}
            />
            <OntarioButton
              type="tertiary"
              htmlType="button"
              label="Cancel / Exit"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}

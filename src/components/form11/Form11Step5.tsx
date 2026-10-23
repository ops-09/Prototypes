import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  FIND_POSTAL_CODE_URL,
  formatPostalCode,
  formatStreetAndNumber,
  isOntarioPostalCode,
  isValidPostalCodeFormat,
  lookupAddressesByPostalCode,
  normalizePostalCode,
  POSTAL_CODE_FORMAT_ERROR,
  POSTAL_CODE_NOT_FOUND_ERROR,
  POSTAL_CODE_ONTARIO_ERROR,
  type AddressLookupResult,
} from '../form1/canadaPostLookup';
import { UNIT_TYPE_OPTIONS } from '../form1/form1DraftStorage';
import { PostalCodeSearchAutosuggest } from '../form1/PostalCodeSearchAutosuggest';
import step3Styles from '../form1/Form1Step3.module.scss';
import { emptyNameNuans } from '../form7/form7DraftStorage';
import { focusField, getEventValue } from './form11Focus';
import {
  createAccountAmalgamatingNfp,
  createEmptyAmalgamatingNfp,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  FORM11_TOTAL_STEPS,
  HEAD_OFFICE_INFO,
  MIN_AMALGAMATING_NFPS,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  saveForm11Draft,
  upsertForm11Step5,
  type Form11Draft,
  type Form11Step5Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 5;
const HEAD_OFFICE_REQUIRED_ERROR = 'Head Office Address must be entered.';

type FieldKey = 'postalCodeLookup' | 'headOffice' | 'streetAndNumber' | 'municipality' | 'postalCode';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  postalCodeLookup: 'postal-code-lookup',
  headOffice: 'head-office-address',
  streetAndNumber: 'street-and-number',
  municipality: 'municipality',
  postalCode: 'postal-code',
};

const FIELD_ORDER: FieldKey[] = [
  'postalCodeLookup',
  'headOffice',
  'streetAndNumber',
  'municipality',
  'postalCode',
];

function hasPriorSteps(draft: Form11Draft | null) {
  return Boolean(
    draft?.step2.email.trim() &&
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length >=
        MIN_AMALGAMATING_NFPS &&
      (draft.step4.changeName === 'yes' || draft.step4.changeName === 'no'),
  );
}

/** Prototype deep-link: seed Steps 2–4 so /form-11/step-5 opens from the playground. */
function ensureStep5Draft(): Form11Draft {
  const existing = readForm11Draft();
  if (hasPriorSteps(existing)) {
    return existing as Form11Draft;
  }

  const account = createAccountAmalgamatingNfp();
  const other = {
    ...createEmptyAmalgamatingNfp(),
    legalName: 'RIVERDALE COMMUNITY HEALTH CENTRE',
    ocn: '100009001',
    membersApprovalDate: '2026-03-01',
  };
  const draft: Form11Draft = {
    step2: { ...OBR_STEP2_DEFAULTS },
    step3: {
      corporations: [account, other],
      agreementApproved: true,
    },
    step4: {
      changeName: 'no',
      nameNuans: emptyNameNuans(),
      selectedAmalgamatedCorporationId: account.id,
    },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs: 'continue',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 4,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm11Draft(draft);
  return draft;
}

function applyLookupResult(prev: Form11Step5Data, entry: AddressLookupResult): Form11Step5Data {
  return {
    ...prev,
    selectedAddressId: entry.id,
    postalCodeLookup: formatPostalCode(entry.postalCode),
    streetAndNumber: formatStreetAndNumber(entry),
    unitType: entry.unitType,
    roomNumber: entry.roomNumber,
    municipality: entry.cityTown,
    province: 'Ontario',
    postalCode: formatPostalCode(entry.postalCode),
  };
}

function hasSelectedAddress(step5: Form11Step5Data) {
  return Boolean(
    step5.selectedAddressId.trim() &&
      step5.streetAndNumber.trim() &&
      step5.municipality.trim() &&
      step5.postalCode.trim() &&
      isOntarioPostalCode(step5.postalCode),
  );
}

export function Form11Step5() {
  const navigate = useNavigate();
  const existing = readForm11Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => {
    if (hasPriorSteps(existing)) {
      return existing as Form11Draft;
    }
    if (!existing) {
      return ensureStep5Draft();
    }
    return existing;
  });

  const [step5, setStep5] = useState<Form11Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft.step5 ?? {}),
    province: 'Ontario',
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const showAddressFields = Boolean(
    step5.selectedAddressId.trim() ||
      step5.streetAndNumber.trim() ||
      step5.municipality.trim() ||
      step5.postalCode.trim(),
  );

  const errorSummaryItems = useMemo(() => {
    return FIELD_ORDER.flatMap((key) => {
      const message = errors[key];
      if (!message) {
        return [];
      }
      return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
    });
  }, [errors]);

  function patchStep5(partial: Partial<Form11Step5Data>) {
    setStep5((prev) => ({ ...prev, ...partial, province: 'Ontario' }));
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
    setStep5((prev) => {
      const keepsSelection =
        Boolean(prev.selectedAddressId) &&
        normalizePostalCode(next) === normalizePostalCode(prev.postalCode);
      if (keepsSelection) {
        return { ...prev, postalCodeLookup: next, province: 'Ontario' };
      }
      return {
        ...prev,
        postalCodeLookup: next,
        selectedAddressId: '',
        streetAndNumber: '',
        unitType: '',
        roomNumber: '',
        municipality: '',
        province: 'Ontario',
        postalCode: '',
      };
    });
    clearError('postalCodeLookup', 'headOffice', 'streetAndNumber', 'municipality', 'postalCode');
  }

  function handleFindAddress(query: string) {
    const nextErrors: FieldErrors = {};
    if (!isValidPostalCodeFormat(query)) {
      nextErrors.postalCodeLookup = POSTAL_CODE_FORMAT_ERROR;
    } else if (!isOntarioPostalCode(query)) {
      nextErrors.postalCodeLookup = POSTAL_CODE_ONTARIO_ERROR;
    } else {
      const matches = lookupAddressesByPostalCode(query).filter((entry) =>
        isOntarioPostalCode(entry.postalCode),
      );
      if (matches.length === 0) {
        nextErrors.postalCodeLookup = POSTAL_CODE_NOT_FOUND_ERROR;
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.postalCodeLookup;
      delete next.headOffice;
      return { ...next, ...nextErrors };
    });
  }

  function handlePostalLookupSelect(entry: AddressLookupResult) {
    if (!isOntarioPostalCode(entry.postalCode)) {
      setErrors((prev) => ({
        ...prev,
        postalCodeLookup: POSTAL_CODE_ONTARIO_ERROR,
      }));
      return;
    }
    setStep5((prev) => applyLookupResult(prev, entry));
    clearError('postalCodeLookup', 'headOffice', 'streetAndNumber', 'municipality', 'postalCode');
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!hasSelectedAddress(step5)) {
      next.postalCodeLookup = HEAD_OFFICE_REQUIRED_ERROR;
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    const hasErrors = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertForm11Step5(step5, 'continue');
    navigate('/form-11/step-6');
  }

  function handleSaveAsDraft() {
    upsertForm11Step5(step5, 'draft', readForm11Draft()?.lastCompletedStep ?? 4);
    navigate('/form-11/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  if (!hasPriorSteps(draft)) {
    if (!draft.step2.email.trim()) {
      return <Navigate to="/form-11/step-2" replace />;
    }
    if (
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length <
      MIN_AMALGAMATING_NFPS
    ) {
      return <Navigate to="/form-11/step-3" replace />;
    }
    return <Navigate to="/form-11/step-4" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-4"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
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
                  value={step5.postalCodeLookup}
                  ontarioOnly
                  hintText="Example: M5H 2N2"
                  errorMessage={errors.postalCodeLookup || errors.headOffice}
                  onChange={handlePostalLookupChange}
                  onSearch={handleFindAddress}
                  onSelect={handlePostalLookupSelect}
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

            {showAddressFields ? (
              <div className={step3Styles.addressFields}>
                <div id={FIELD_ANCHORS.streetAndNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.streetAndNumber}
                    caption="Street & Number (or R.R. Number)"
                    name="street-and-number"
                    type="text"
                    required
                    requiredValidationMessage={HEAD_OFFICE_REQUIRED_ERROR}
                    value={step5.streetAndNumber}
                    errorMessage={errors.streetAndNumber}
                    customOnInput={(event) => {
                      patchStep5({ streetAndNumber: getEventValue(event) });
                      clearError('streetAndNumber', 'headOffice');
                    }}
                  />
                </div>

                <div className={step3Styles.addressGrid}>
                  <div className={step3Styles.gridHalf}>
                    <OntarioDropdownList
                      elementId="unit-type"
                      caption="Unit Type"
                      name="unit-type"
                      isEmptyStartOption
                      value={step5.unitType}
                      options={[...UNIT_TYPE_OPTIONS]}
                      customOnChange={(event) => patchStep5({ unitType: getEventValue(event) })}
                    />
                  </div>
                  <div className={step3Styles.gridHalf}>
                    <OntarioInput
                      elementId="room-number"
                      caption="Room Number"
                      name="room-number"
                      type="text"
                      inputWidth="10-char-width"
                      required={false}
                      requiredValidationMessage=""
                      value={step5.roomNumber}
                      customOnInput={(event) => patchStep5({ roomNumber: getEventValue(event) })}
                    />
                  </div>
                </div>

                <div id={FIELD_ANCHORS.municipality}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.municipality}
                    caption="Name of Municipality or Post Office"
                    name="municipality"
                    type="text"
                    required
                    requiredValidationMessage={HEAD_OFFICE_REQUIRED_ERROR}
                    value={step5.municipality}
                    errorMessage={errors.municipality}
                    customOnInput={(event) => {
                      patchStep5({ municipality: getEventValue(event) });
                      clearError('municipality', 'headOffice');
                    }}
                  />
                </div>

                <div className={step3Styles.lockedField}>
                  <p className={step3Styles.lockedLabel}>Province</p>
                  <p className={step3Styles.lockedValue}>Ontario</p>
                </div>

                <div id={FIELD_ANCHORS.postalCode}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.postalCode}
                    caption="Postal Code"
                    name="postal-code"
                    type="text"
                    inputWidth="7-char-width"
                    required
                    requiredValidationMessage={HEAD_OFFICE_REQUIRED_ERROR}
                    value={step5.postalCode}
                    errorMessage={errors.postalCode}
                    customOnInput={(event) => {
                      patchStep5({ postalCode: getEventValue(event) });
                      clearError('postalCode', 'headOffice');
                    }}
                    customOnBlur={(event) => {
                      patchStep5({ postalCode: formatPostalCode(getEventValue(event)) });
                    }}
                  />
                </div>
              </div>
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
              label="Cancel"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}

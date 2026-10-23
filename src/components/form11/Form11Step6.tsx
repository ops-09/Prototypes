import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FieldErrorMessage } from '../form1/FieldErrorMessage';
import type { DirectorCountMode } from '../form1/form1DraftStorage';
import { emptyNameNuans } from '../form7/form7DraftStorage';
import {
  formatDirectorFullName,
  formatDirectorListDescription,
} from './Form11DirectorEditor';
import { focusField, getEventValue } from './form11Focus';
import {
  createAccountAmalgamatingNfp,
  createEmptyAmalgamatingNfp,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  FORM11_TOTAL_STEPS,
  getDirectorLimit,
  getDirectorMinimum,
  hasForm11HeadOffice,
  MIN_AMALGAMATING_NFPS,
  MIN_DIRECTORS,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  saveForm11Draft,
  upsertForm11Step6,
  type Form11Draft,
  type Form11Step6Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';
import step4Styles from '../form1/Form1Step4.module.scss';

const CURRENT_STEP = 6;
const REQUIRED = 'Required Field.';
const DIRECTORS_AT_LEAST_THREE_ERROR = 'The number of directors must be at least 3.';
const MIN_MAX_ORDER_ERROR =
  'The minimum number of directors cannot be greater than the maximum.';
const FIXED_DIRECTORS_COUNT_ERROR =
  'The number of directors added must match the fixed number of directors.';

function minDirectorsCountError(minimum: number) {
  return `At least ${minimum} directors must be added.`;
}

type PageFieldKey = 'countMode' | 'fixedNumber' | 'minimumNumber' | 'maximumNumber' | 'directors';
type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  countMode: 'director-count-mode',
  fixedNumber: 'fixed-number-of-directors',
  minimumNumber: 'minimum-number-of-directors',
  maximumNumber: 'maximum-number-of-directors',
  directors: 'first-directors',
};

const FIELD_ORDER: PageFieldKey[] = [
  'countMode',
  'fixedNumber',
  'minimumNumber',
  'maximumNumber',
  'directors',
];

const COUNT_MODE_OPTIONS = [
  { value: 'fixed', elementId: 'count-fixed', label: 'Fixed Number' },
  { value: 'minMax', elementId: 'count-min-max', label: 'Minimum/Maximum' },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function parseDirectorCount(value: string) {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function areDirectorCountFieldsValid(data: Form11Step6Data) {
  if (data.countMode === 'fixed') {
    const fixed = parseDirectorCount(data.fixedNumber);
    return fixed !== null && fixed >= MIN_DIRECTORS;
  }
  if (data.countMode === 'minMax') {
    const min = parseDirectorCount(data.minimumNumber);
    const max = parseDirectorCount(data.maximumNumber);
    return min !== null && max !== null && min >= MIN_DIRECTORS && min <= max;
  }
  return false;
}

function directorCountFieldError(value: string): string | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = parseDirectorCount(value);
  if (parsed === null || parsed < MIN_DIRECTORS) {
    return DIRECTORS_AT_LEAST_THREE_ERROR;
  }
  return undefined;
}

function getDirectorsCountError(data: Form11Step6Data): string | undefined {
  const addedCount = data.directors.length;
  const minimum = getDirectorMinimum(data);
  const maximum = getDirectorLimit(data);

  if (data.countMode === 'fixed' && minimum !== null && addedCount !== minimum) {
    return FIXED_DIRECTORS_COUNT_ERROR;
  }
  if (data.countMode === 'minMax' && minimum !== null && addedCount < minimum) {
    return minDirectorsCountError(minimum);
  }
  if (data.countMode === 'minMax' && maximum !== null && addedCount > maximum) {
    return `No more than ${maximum} directors may be added.`;
  }
  return undefined;
}

function formatDirectorSelectionSummary(data: Form11Step6Data) {
  if (data.countMode === 'fixed') {
    return `You selected a fixed number of ${data.fixedNumber.trim()} directors.`;
  }
  return `You selected a minimum of ${data.minimumNumber.trim()} and a maximum of ${data.maximumNumber.trim()} directors.`;
}

function hasPriorSteps(draft: Form11Draft | null) {
  return Boolean(
    draft?.step2.email.trim() &&
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length >=
        MIN_AMALGAMATING_NFPS &&
      (draft.step4.changeName === 'yes' || draft.step4.changeName === 'no') &&
      hasForm11HeadOffice(draft.step5),
  );
}

function ensureStep6Draft(): Form11Draft {
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
    step5: {
      ...EMPTY_STEP5,
      postalCodeLookup: 'M5H 2N2',
      selectedAddressId: 'm5h-1',
      streetAndNumber: '100 Queen St W',
      municipality: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5H 2N2',
    },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs: 'continue',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 5,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm11Draft(draft);
  return draft;
}

export function Form11Step6() {
  const navigate = useNavigate();
  const existing = readForm11Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => {
    if (hasPriorSteps(existing)) {
      return existing as Form11Draft;
    }
    if (!existing) {
      return ensureStep6Draft();
    }
    return existing;
  });

  const [step6, setStep6] = useState<Form11Step6Data>(() => ({
    ...EMPTY_STEP6,
    ...(draft.step6 ?? {}),
    directors: draft.step6?.directors ?? [],
  }));
  const [errors, setErrors] = useState<PageErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

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

  const directorLimit = getDirectorLimit(step6);
  const atDirectorLimit = directorLimit !== null && step6.directors.length >= directorLimit;
  const accountAlreadyAdded = step6.directors.some((entry) => entry.addedFromAccount);
  const showDirectorList = areDirectorCountFieldsValid(step6);

  function patchStep6(partial: Partial<Form11Step6Data>) {
    setStep6((prev) => ({ ...prev, ...partial }));
  }

  function clearError(key: PageFieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function syncLiveMinMaxCountErrors(data: Form11Step6Data) {
    const countError = directorCountFieldError(data.minimumNumber);
    if (countError) {
      setErrors((prev) => ({ ...prev, minimumNumber: countError }));
      return;
    }
    const min = parseDirectorCount(data.minimumNumber);
    const max = parseDirectorCount(data.maximumNumber);
    if (min !== null && max !== null && min > max) {
      setErrors((prev) => ({ ...prev, minimumNumber: MIN_MAX_ORDER_ERROR }));
      return;
    }
    clearError('minimumNumber');
  }

  function validatePage(): PageErrors {
    const page: PageErrors = {};
    if (!step6.countMode) {
      page.countMode = REQUIRED;
    }
    if (step6.countMode === 'fixed') {
      if (!step6.fixedNumber.trim()) {
        page.fixedNumber = REQUIRED;
      } else {
        const fixed = Number.parseInt(step6.fixedNumber, 10);
        if (!Number.isFinite(fixed) || fixed < MIN_DIRECTORS) {
          page.fixedNumber = DIRECTORS_AT_LEAST_THREE_ERROR;
        }
      }
    }
    if (step6.countMode === 'minMax') {
      if (!step6.minimumNumber.trim()) {
        page.minimumNumber = REQUIRED;
      } else {
        const min = Number.parseInt(step6.minimumNumber, 10);
        if (!Number.isFinite(min) || min < MIN_DIRECTORS) {
          page.minimumNumber = DIRECTORS_AT_LEAST_THREE_ERROR;
        }
      }
      if (!step6.maximumNumber.trim()) {
        page.maximumNumber = REQUIRED;
      }
      const min = Number.parseInt(step6.minimumNumber, 10);
      const max = Number.parseInt(step6.maximumNumber, 10);
      if (
        step6.minimumNumber.trim() &&
        step6.maximumNumber.trim() &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min >= MIN_DIRECTORS &&
        min > max
      ) {
        page.minimumNumber = MIN_MAX_ORDER_ERROR;
      }
    }
    const directorsError = getDirectorsCountError(step6);
    if (directorsError) {
      page.directors = directorsError;
    }
    return page;
  }

  function persistStep6(next: Form11Step6Data) {
    upsertForm11Step6(next, 'draft', readForm11Draft()?.lastCompletedStep ?? 5);
  }

  function handleContinue() {
    const page = validatePage();
    setErrors(page);
    const hasErrors = Object.keys(page).length > 0;
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertForm11Step6(step6, 'continue');
    navigate('/form-11/step-7');
  }

  function handleSaveAsDraft() {
    upsertForm11Step6(step6, 'draft', readForm11Draft()?.lastCompletedStep ?? 5);
    navigate('/form-11/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function startAddDirector(fromAccount = false) {
    if (atDirectorLimit) {
      return;
    }
    clearError('directors');
    persistStep6(step6);
    navigate(
      fromAccount ? '/form-11/step-6/directors/new?fromAccount=1' : '/form-11/step-6/directors/new',
    );
  }

  function editDirector(id: string) {
    persistStep6(step6);
    navigate(`/form-11/step-6/directors/${id}`);
  }

  function removeDirector(id: string) {
    setStep6((prev) => {
      const next = {
        ...prev,
        directors: prev.directors.filter((entry) => entry.id !== id),
      };
      persistStep6(next);
      return next;
    });
    clearError('directors');
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
    if (draft.step4.changeName !== 'yes' && draft.step4.changeName !== 'no') {
      return <Navigate to="/form-11/step-4" replace />;
    }
    return <Navigate to="/form-11/step-5" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-5"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Directors</h1>
          <p className={styles.lead}>
            Provide the first directors of the amalgamated not-for-profit corporation and their
            addresses for service. At least {MIN_DIRECTORS} directors must be added.
          </p>

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.countMode}>
              <OntarioRadioButtons
                caption="How is the number of directors specified?"
                name="director-count-mode"
                required
                hintText="The amalgamated not-for-profit corporation must have at least 3 directors."
                value={step6.countMode}
                options={COUNT_MODE_OPTIONS}
                errorMessage={errors.countMode}
                customOnChange={(event) => {
                  const value = getEventValue(event) as DirectorCountMode;
                  patchStep6({
                    countMode: value,
                    ...(value === 'fixed'
                      ? { minimumNumber: '', maximumNumber: '' }
                      : { fixedNumber: '' }),
                  });
                  clearError('countMode');
                  clearError('fixedNumber');
                  clearError('minimumNumber');
                  clearError('maximumNumber');
                  clearError('directors');
                }}
              />
            </div>

            {step6.countMode === 'fixed' ? (
              <div id={FIELD_ANCHORS.fixedNumber} className={step4Styles.countFields}>
                <OntarioInput
                  elementId={FIELD_ANCHORS.fixedNumber}
                  caption="Fixed Number of Directors"
                  name="fixed-number-of-directors"
                  type="text"
                  required
                  requiredValidationMessage={REQUIRED}
                  hintText="Enter the fixed number of directors. The number must be at least 3."
                  inputWidth="5-char-width"
                  value={step6.fixedNumber}
                  errorMessage={errors.fixedNumber}
                  customOnInput={(event) => {
                    const fixedNumber = digitsOnly(getEventValue(event));
                    patchStep6({ fixedNumber });
                    clearError('directors');
                    const countError = directorCountFieldError(fixedNumber);
                    if (countError) {
                      setErrors((prev) => ({ ...prev, fixedNumber: countError }));
                    } else {
                      clearError('fixedNumber');
                    }
                  }}
                />
              </div>
            ) : null}

            {step6.countMode === 'minMax' ? (
              <div className={step4Styles.countFields}>
                <div id={FIELD_ANCHORS.minimumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.minimumNumber}
                    caption="Minimum number of directors"
                    name="minimum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED}
                    hintText="Enter the minimum number of directors. The number must be at least 3."
                    inputWidth="5-char-width"
                    value={step6.minimumNumber}
                    errorMessage={errors.minimumNumber}
                    customOnInput={(event) => {
                      const minimumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step6, minimumNumber };
                      patchStep6({ minimumNumber });
                      clearError('directors');
                      syncLiveMinMaxCountErrors(next);
                    }}
                  />
                </div>
                <div id={FIELD_ANCHORS.maximumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.maximumNumber}
                    caption="Maximum number of directors"
                    name="maximum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage={REQUIRED}
                    hintText="Please enter the maximum number of directors."
                    inputWidth="5-char-width"
                    value={step6.maximumNumber}
                    errorMessage={errors.maximumNumber}
                    customOnInput={(event) => {
                      const maximumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step6, maximumNumber };
                      patchStep6({ maximumNumber });
                      clearError('maximumNumber');
                      clearError('directors');
                      syncLiveMinMaxCountErrors(next);
                    }}
                  />
                </div>
              </div>
            ) : null}

            {showDirectorList ? (
              <div id={FIELD_ANCHORS.directors} className={step4Styles.directorsSection}>
                <div>
                  <h2 className={`ontario-h2 ${step4Styles.sectionHeading}`}>Add directors</h2>
                  <p className={step4Styles.sectionLead}>{formatDirectorSelectionSummary(step6)}</p>
                </div>

                <FieldErrorMessage message={errors.directors} />

                {step6.directors.length > 0 ? (
                  <ul className={step4Styles.summaryList}>
                    {step6.directors.map((director) => {
                      const name = formatDirectorFullName(director) || 'Director';
                      const description = formatDirectorListDescription(director);
                      return (
                        <li key={director.id} className={step4Styles.summaryItem}>
                          <div className={step4Styles.summaryMain}>
                            <button
                              type="button"
                              className={step4Styles.summaryTitle}
                              onClick={() => editDirector(director.id)}
                            >
                              {name}
                            </button>
                            <div className={step4Styles.summaryDescription}>
                              <div>{description.details}</div>
                              {description.address ? <div>{description.address}</div> : null}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={step4Styles.summaryRemove}
                            onClick={() => removeDirector(director.id)}
                            aria-label={`Remove ${name}`}
                          >
                            <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {!atDirectorLimit ? (
                  <div
                    className={
                      step6.directors.length === 0
                        ? `${step4Styles.addActions} ${step4Styles.addActionsAlone}`
                        : step4Styles.addActions
                    }
                  >
                    <button
                      type="button"
                      className={step4Styles.addLink}
                      onClick={() => startAddDirector(false)}
                    >
                      <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                      Add a Director
                    </button>
                    {!accountAlreadyAdded ? (
                      <button
                        type="button"
                        className={step4Styles.addLink}
                        onClick={() => startAddDirector(true)}
                      >
                        <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                        Add Me as Director
                      </button>
                    ) : null}
                  </div>
                ) : null}
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

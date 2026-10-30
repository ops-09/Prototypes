import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import {
  formatDirectorFullName,
  formatDirectorListDescription,
} from './Form2DirectorEditor';
import { FieldErrorMessage } from './FieldErrorMessage';
import {
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  getDirectorLimit,
  getDirectorMinimum,
  hasForm2Step1Data,
  readForm2Draft,
  saveForm2Draft,
  upsertForm2Step4,
  type DirectorCountMode,
  type Form2Draft,
  type Form2Step4Data,
  type YesNoAnswer,
  hasForm2Step2Data,
} from './form2DraftStorage';
import styles from './Form2Step1.module.scss';
import step4Styles from './Form2Step4.module.scss';

const CURRENT_STEP = 5;
const TOTAL_STEPS = 10;

const MIN_DIRECTORS_ALLOWED = 3;
const DIRECTORS_AT_LEAST_THREE_ERROR =
  'The number of directors must be at least 3.';
const MIN_MAX_ORDER_ERROR =
  'The minimum number of directors cannot be greater than the maximum.';
const FIXED_DIRECTORS_COUNT_ERROR =
  'The number of directors added must match the fixed number of directors.';

function minDirectorsCountError(minimum: number) {
  return `At least ${minimum} directors must be added.`;
}

function maxDirectorsCountError(maximum: number) {
  return `No more than ${maximum} directors may be added.`;
}

/** Count mismatch vs fixed / min / max — used on Continue and live when fields change. */
function getDirectorsCountError(data: Form2Step4Data): string | undefined {
  const addedCount = data.directors.length;
  const minimum = getDirectorMinimum(data);
  const maximum = getDirectorLimit(data);

  if (data.countMode === 'fixed' && minimum !== null && addedCount !== minimum) {
    return FIXED_DIRECTORS_COUNT_ERROR;
  }

  if (data.countMode === 'minMax' && minimum !== null) {
    if (addedCount < minimum) {
      return minDirectorsCountError(minimum);
    }
    if (maximum !== null && addedCount > maximum) {
      return maxDirectorsCountError(maximum);
    }
  }

  return undefined;
}

type PageFieldKey =
  | 'countMode'
  | 'fixedNumber'
  | 'minimumNumber'
  | 'maximumNumber'
  | 'multiStakeholder'
  | 'stakeholderDirectorsText'
  | 'directors';

type PageErrors = Partial<Record<PageFieldKey, string>>;

const FIELD_ANCHORS: Record<PageFieldKey, string> = {
  countMode: 'director-count-mode',
  fixedNumber: 'fixed-number-of-directors',
  minimumNumber: 'minimum-number-of-directors',
  maximumNumber: 'maximum-number-of-directors',
  multiStakeholder: 'multi-stakeholder',
  stakeholderDirectorsText: 'stakeholder-directors-text',
  directors: 'first-directors',
};

const FIELD_ORDER: PageFieldKey[] = [
  'countMode',
  'fixedNumber',
  'minimumNumber',
  'maximumNumber',
  'multiStakeholder',
  'stakeholderDirectorsText',
  'directors',
];

const COUNT_MODE_OPTIONS = [
  { value: 'fixed', elementId: 'count-fixed', label: 'Fixed number' },
  { value: 'minMax', elementId: 'count-min-max', label: 'Minimum and maximum' },
];

const YES_NO_OPTIONS = [
  { value: 'yes', elementId: 'multi-yes', label: 'Yes' },
  { value: 'no', elementId: 'multi-no', label: 'No' },
];

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

const ODS_FOCUSABLE =
  'ontario-input, ontario-radio-buttons, ontario-textarea, ontario-checkboxes, ontario-dropdown-list, ontario-button';

function focusShadowControl(host: HTMLElement) {
  const nested = host.shadowRoot?.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, button',
  );
  nested?.focus({ preventScroll: true });
}

/**
 * ODS puts `elementId` on the inner shadow input, so document.getElementById often fails.
 * Resolve light-DOM wrappers, `[element-id]`, or the host that owns the shadow id.
 */
function focusField(anchorId: string) {
  const byId = document.getElementById(anchorId);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const host = byId.matches(ODS_FOCUSABLE)
      ? byId
      : byId.querySelector<HTMLElement>(ODS_FOCUSABLE);
    if (host) {
      focusShadowControl(host);
      return;
    }
    if (typeof byId.focus === 'function') {
      byId.focus({ preventScroll: true });
    }
    return;
  }

  const byElementId = document.querySelector<HTMLElement>(
    `[element-id="${CSS.escape(anchorId)}"]`,
  );
  if (byElementId) {
    byElementId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (byElementId.matches(ODS_FOCUSABLE)) {
      focusShadowControl(byElementId);
    } else {
      const nestedHost = byElementId.querySelector<HTMLElement>(ODS_FOCUSABLE);
      if (nestedHost) {
        focusShadowControl(nestedHost);
      } else if (typeof byElementId.focus === 'function') {
        byElementId.focus({ preventScroll: true });
      }
    }
    return;
  }

  for (const host of document.querySelectorAll<HTMLElement>(ODS_FOCUSABLE)) {
    const inner = host.shadowRoot?.getElementById(anchorId);
    if (inner) {
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inner.focus({ preventScroll: true });
      return;
    }
  }
}

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

/** Fixed / minimum director counts must be at least 3 (and min ≤ max for range). */
function areDirectorCountFieldsValid(data: Form2Step4Data) {
  if (data.countMode === 'fixed') {
    const fixed = parseDirectorCount(data.fixedNumber);
    return fixed !== null && fixed >= MIN_DIRECTORS_ALLOWED;
  }

  if (data.countMode === 'minMax') {
    const min = parseDirectorCount(data.minimumNumber);
    const max = parseDirectorCount(data.maximumNumber);
    return (
      min !== null &&
      max !== null &&
      min >= MIN_DIRECTORS_ALLOWED &&
      min <= max
    );
  }

  return false;
}

function directorCountFieldError(value: string): string | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = parseDirectorCount(value);
  if (parsed === null || parsed < MIN_DIRECTORS_ALLOWED) {
    return DIRECTORS_AT_LEAST_THREE_ERROR;
  }
  return undefined;
}

/** True when count + multi-stakeholder questions (and their follow-ups) are filled and valid. */
function areDirectorQuestionsComplete(data: Form2Step4Data) {
  if (!data.countMode || !data.multiStakeholder) {
    return false;
  }

  if (!areDirectorCountFieldsValid(data)) {
    return false;
  }

  if (data.multiStakeholder === 'yes' && !data.stakeholderDirectorsText.trim()) {
    return false;
  }

  return true;
}

function formatDirectorSelectionSummary(data: Form2Step4Data) {
  const countPart =
    data.countMode === 'fixed'
      ? `You selected a fixed number of ${data.fixedNumber.trim()} directors.`
      : `You selected a minimum of ${data.minimumNumber.trim()} and a maximum of ${data.maximumNumber.trim()} directors.`;

  const stakeholderPart =
    data.multiStakeholder === 'yes'
      ? 'This is a multi-stakeholder co-operative.'
      : 'This is not a multi-stakeholder co-operative.';

  return `${countPart} ${stakeholderPart}`;
}

/** Prototype deep-link: seed Steps 1–3 so /form-2/step-5 opens from the playground. */
function ensureStep4Draft(): Form2Draft {
  const existing = readForm2Draft();
  if (
    hasForm2Step1Data(existing?.step1) &&
    hasForm2Step2Data(existing.step2)
  ) {
    const step4 = { ...EMPTY_STEP4, ...(existing.step4 ?? {}) };
    return {
      ...existing,
      step4: {
        ...step4,
        directors: step4.directors ?? [],
      },
      step5: existing.step5 ?? { ...EMPTY_STEP5 },
      step6: existing.step6 ?? { ...EMPTY_STEP6 },
      step7: existing.step7 ?? { ...EMPTY_STEP7 },
    };
  }

  const now = new Date().toISOString();
  const seeded: Form2Draft = {
    step1: createSeedStep1(),
    step2: {
      ...EMPTY_STEP2,
      cooperativeSubtype: 'Worker Co-operative',
      primaryActivity: '4521 - Department stores',
      email: 'registry@greeninstitute.coop',
      confirmEmail: 'registry@greeninstitute.coop',
    },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: {
      ...EMPTY_STEP4,
      ...(existing?.step4 ?? {}),
      directors: existing?.step4?.directors ?? [],
    },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 3,
  };
  saveForm2Draft(seeded);
  return seeded;
}

export function Form2Step4() {
  const navigate = useNavigate();
  const draft = ensureStep4Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4, setStep4] = useState<Form2Step4Data>(() => {
    const initial = { ...EMPTY_STEP4, ...(draft.step4 ?? {}) };
    return {
      ...initial,
      directors: initial.directors ?? [],
    };
  });
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

  const directorLimit = getDirectorLimit(step4);
  const atDirectorLimit =
    directorLimit !== null && step4.directors.length >= directorLimit;

  function patchStep4(partial: Partial<Form2Step4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
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

  /** Live field errors for min/max counts (at least 3, and min ≤ max). */
  function syncLiveMinMaxCountErrors(data: Form2Step4Data) {
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

    if (!step4.countMode) {
      page.countMode = 'Select how the number of directors is determined.';
    }

    if (step4.countMode === 'fixed') {
      if (!step4.fixedNumber.trim()) {
        page.fixedNumber = 'Enter the fixed number of directors.';
      } else {
        const fixed = Number.parseInt(step4.fixedNumber, 10);
        if (!Number.isFinite(fixed) || fixed < MIN_DIRECTORS_ALLOWED) {
          page.fixedNumber = DIRECTORS_AT_LEAST_THREE_ERROR;
        }
      }
    }

    if (step4.countMode === 'minMax') {
      if (!step4.minimumNumber.trim()) {
        page.minimumNumber = 'Enter the minimum number of directors.';
      } else {
        const min = Number.parseInt(step4.minimumNumber, 10);
        if (!Number.isFinite(min) || min < MIN_DIRECTORS_ALLOWED) {
          page.minimumNumber = DIRECTORS_AT_LEAST_THREE_ERROR;
        }
      }
      if (!step4.maximumNumber.trim()) {
        page.maximumNumber = 'Enter the maximum number of directors.';
      }
      const min = Number.parseInt(step4.minimumNumber, 10);
      const max = Number.parseInt(step4.maximumNumber, 10);
      if (
        step4.minimumNumber.trim() &&
        step4.maximumNumber.trim() &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min >= MIN_DIRECTORS_ALLOWED &&
        min > max
      ) {
        page.minimumNumber = MIN_MAX_ORDER_ERROR;
      }
    }

    if (!step4.multiStakeholder) {
      page.multiStakeholder = 'Select whether this is a multi-stakeholder co-operative.';
    }

    if (step4.multiStakeholder === 'yes' && !step4.stakeholderDirectorsText.trim()) {
      page.stakeholderDirectorsText = 'Enter the number of directors each stakeholder group may elect.';
    }

    const directorsError = getDirectorsCountError(step4);
    if (directorsError) {
      page.directors = directorsError;
    }

    return page;
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

    upsertForm2Step4(step4, 'continue', 4);
    navigate('/form-2/step-6');
  }

  function handleSaveAsDraft() {
    upsertForm2Step4(
      step4,
      'draft',
      draft.lastCompletedStep >= 4 ? 4 : draft.lastCompletedStep >= 3 ? 3 : 2,
    );
    navigate('/form-2/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
    if (leave) {
      navigate('/');
    }
  }

  function persistStep4(next: Form2Step4Data) {
    upsertForm2Step4(next, 'continue', 3);
  }

  function startAddDirectorSubflow() {
    if (atDirectorLimit) {
      return;
    }
    clearError('directors');
    persistStep4(step4);
    navigate('/form-2/step-5/directors/new');
  }

  function editDirector(id: string) {
    persistStep4(step4);
    navigate(`/form-2/step-5/directors/${id}`);
  }

  function removeDirector(id: string) {
    setStep4((prev) => {
      const next = {
        ...prev,
        directors: prev.directors.filter((entry) => entry.id !== id),
      };
      persistStep4(next);
      return next;
    });
    clearError('directors');
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
          backButtonUrl="/form-2/step-4"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Directors</h1>

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.countMode}>
              <OntarioRadioButtons
                caption="Number of directors is/are:"
                name="director-count-mode"
                required
                hintText="Please provide us how many directors the co-operative can have."
                value={step4.countMode}
                options={COUNT_MODE_OPTIONS}
                errorMessage={errors.countMode}
                customOnChange={(event) => {
                  const value = getEventValue(event) as DirectorCountMode;
                  patchStep4({
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

            {step4.countMode === 'fixed' ? (
              <div id={FIELD_ANCHORS.fixedNumber} className={step4Styles.countFields}>
                <OntarioInput
                  elementId={FIELD_ANCHORS.fixedNumber}
                  caption="Fixed number of directors"
                  name="fixed-number-of-directors"
                  type="text"
                  required
                  requiredValidationMessage="Enter the fixed number of directors."
                  hintText="Enter the fixed number of directors. The number must be at least 3."
                  inputWidth="5-char-width"
                  value={step4.fixedNumber}
                  errorMessage={errors.fixedNumber}
                  customOnInput={(event) => {
                    const fixedNumber = digitsOnly(getEventValue(event));
                    patchStep4({ fixedNumber });
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

            {step4.countMode === 'minMax' ? (
              <div className={step4Styles.countFields}>
                <div id={FIELD_ANCHORS.minimumNumber}>
                  <OntarioInput
                    elementId={FIELD_ANCHORS.minimumNumber}
                    caption="Minimum number of directors"
                    name="minimum-number-of-directors"
                    type="text"
                    required
                    requiredValidationMessage="Enter the minimum number of directors."
                    hintText="Enter the minimum number of directors. The number must be at least 3."
                    inputWidth="5-char-width"
                    value={step4.minimumNumber}
                    errorMessage={errors.minimumNumber}
                    customOnInput={(event) => {
                      const minimumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step4, minimumNumber };
                      patchStep4({ minimumNumber });
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
                    requiredValidationMessage="Enter the maximum number of directors."
                    hintText="Please enter the maximum number of directors."
                    inputWidth="5-char-width"
                    value={step4.maximumNumber}
                    errorMessage={errors.maximumNumber}
                    customOnInput={(event) => {
                      const maximumNumber = digitsOnly(getEventValue(event));
                      const next = { ...step4, maximumNumber };
                      patchStep4({ maximumNumber });
                      clearError('maximumNumber');
                      clearError('directors');
                      syncLiveMinMaxCountErrors(next);
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div id={FIELD_ANCHORS.multiStakeholder}>
              <OntarioRadioButtons
                caption="Is this a multi-stakeholder co-operative?"
                name="multi-stakeholder"
                required
                value={step4.multiStakeholder}
                options={YES_NO_OPTIONS}
                errorMessage={errors.multiStakeholder}
                customOnChange={(event) => {
                  const value = getEventValue(event) as YesNoAnswer;
                  patchStep4({
                    multiStakeholder: value,
                    ...(value === 'no' ? { stakeholderDirectorsText: '' } : {}),
                  });
                  clearError('multiStakeholder');
                  clearError('stakeholderDirectorsText');
                }}
              />
            </div>

            {step4.multiStakeholder === 'yes' ? (
              <div id={FIELD_ANCHORS.stakeholderDirectorsText}>
                <OntarioTextarea
                  elementId={FIELD_ANCHORS.stakeholderDirectorsText}
                  caption="The number (or minimum and maximum number) of directors each stakeholder group in a multi-stakeholder co-operative may elect is:"
                  name="stakeholder-directors-text"
                  required
                  value={step4.stakeholderDirectorsText}
                  errorMessage={errors.stakeholderDirectorsText}
                  customOnInput={(event) => {
                    patchStep4({ stakeholderDirectorsText: getEventValue(event) });
                    clearError('stakeholderDirectorsText');
                  }}
                />
              </div>
            ) : null}

            {areDirectorQuestionsComplete(step4) ? (
              <div id={FIELD_ANCHORS.directors} className={step4Styles.directorsSection}>
                <div>
                  <p className={step4Styles.sectionLabel}>
                    The first directors are:{' '}
                    <span className={step4Styles.sectionLabelFlag}>(required)</span>
                  </p>
                  {areDirectorQuestionsComplete(step4) ? (
                    <p className={step4Styles.sectionLead}>
                      {formatDirectorSelectionSummary(step4)}
                    </p>
                  ) : null}
                </div>

                <FieldErrorMessage message={errors.directors} />

                {step4.directors.length > 0 ? (
                  <ul className={step4Styles.summaryList}>
                    {step4.directors.map((director) => {
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
                              {description.details.map((line) => (
                                <div key={line}>{line}</div>
                              ))}
                              {description.address ? (
                                <div>{description.address}</div>
                              ) : null}
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
                      step4.directors.length === 0
                        ? `${step4Styles.addActions} ${step4Styles.addActionsAlone}`
                        : step4Styles.addActions
                    }
                  >
                    <button
                      type="button"
                      className={step4Styles.addLink}
                      onClick={startAddDirectorSubflow}
                    >
                      <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                      Add director(s)
                    </button>
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
              label="Save as draft"
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

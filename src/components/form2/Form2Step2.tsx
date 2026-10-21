import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDropdownList,
  OntarioHintExpander,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { NaicsSearchAutosuggest } from '../form7/NaicsSearchAutosuggest';
import {
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  FORM2_COOPERATIVE_SUBTYPE_OPTIONS,
  hasForm2Step1Data,
  OFFICIAL_EMAIL_INFO,
  readForm2Draft,
  saveForm2Draft,
  upsertForm2Step2,
  type Form2Draft,
  type Form2Step2Data,
} from './form2DraftStorage';
import styles from './Form2Step1.module.scss';

const CURRENT_STEP = 3;
const TOTAL_STEPS = 9;

const REQUIRED_FIELD_ERROR = 'Required Field. Please try again.';
const EMAIL_FORMAT_ERROR = 'Please enter a valid email address.';
const EMAIL_MATCH_ERROR =
  'The email addresses you entered do not match. Please try again.';

type FieldKey =
  | 'cooperativeSubtype'
  | 'primaryActivity'
  | 'email'
  | 'confirmEmail';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  cooperativeSubtype: 'cooperative-subtype',
  primaryActivity: 'primary-activity',
  email: 'official-email',
  confirmEmail: 'confirm-official-email',
};

const FIELD_ORDER: FieldKey[] = [
  'cooperativeSubtype',
  'primaryActivity',
  'email',
  'confirmEmail',
];

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | null;
  return target?.value ?? '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Selected NAICS labels follow `code - description` (e.g. 4521 - Department stores). */
function isSelectedNaicsLabel(value: string) {
  return /^\d{4,6}\s+-\s+\S/.test(value.trim());
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-input, ontario-dropdown-list, ontario-search-box',
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

/** Prototype deep-link: seed Step 1 so /form-2/step-3 opens from the playground. */
function ensureStep2Draft(): Form2Draft {
  const existing = readForm2Draft();
  if (hasForm2Step1Data(existing?.step1)) {
    return existing;
  }

  const now = new Date().toISOString();
  const seeded: Form2Draft = {
    step1: createSeedStep1(),
    step2: existing?.step2 ?? { ...EMPTY_STEP2 },
    step3: existing?.step3 ?? { ...EMPTY_STEP3 },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 1,
  };
  saveForm2Draft(seeded);
  return seeded;
}

export function Form2Step2() {
  const navigate = useNavigate();
  const draft = ensureStep2Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step2, setStep2] = useState<Form2Step2Data>(() => ({
    ...EMPTY_STEP2,
    ...(draft.step2 ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [showContinueSuccess, setShowContinueSuccess] = useState(false);

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

  function patchStep2(partial: Partial<Form2Step2Data>) {
    setStep2((prev) => ({ ...prev, ...partial }));
    setShowContinueSuccess(false);
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    if (!step2.primaryActivity.trim() || !isSelectedNaicsLabel(step2.primaryActivity)) {
      next.primaryActivity = REQUIRED_FIELD_ERROR;
    }

    if (!step2.email.trim()) {
      next.email = REQUIRED_FIELD_ERROR;
    } else if (!isValidEmail(step2.email)) {
      next.email = EMAIL_FORMAT_ERROR;
    }

    if (!step2.confirmEmail.trim()) {
      next.confirmEmail = REQUIRED_FIELD_ERROR;
    } else if (!isValidEmail(step2.confirmEmail)) {
      next.confirmEmail = EMAIL_FORMAT_ERROR;
    } else if (
      step2.email.trim().toLowerCase() !== step2.confirmEmail.trim().toLowerCase()
    ) {
      next.confirmEmail = EMAIL_MATCH_ERROR;
    }

    return next;
  }

  function handleContinue() {
    const nextErrors = validateAll();
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);
    setShowContinueSuccess(!hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm2Step2(step2, 'continue', 2);
    navigate('/form-2/step-4');
  }

  function handleSaveAsDraft() {
    upsertForm2Step2(step2, 'draft', draft.lastCompletedStep >= 2 ? 2 : 1);
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

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-2/step-2"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>
            Co-operative type and contact
          </h1>

          <p className={styles.lead}>
            Optionally select the co-operative sub-type, choose the primary business activity
            (NAICS), and provide the official email address where the co-operative will receive
            official documents and notices.
          </p>

          {showContinueSuccess ? (
            <div className={styles.alert}>
              <OntarioPageAlert
                type="success"
                heading="Step 2 saved"
                content="Your co-operative type and contact information was saved."
              />
            </div>
          ) : null}

          <div className={styles.formStack}>
            <div id={FIELD_ANCHORS.cooperativeSubtype}>
              <OntarioDropdownList
                elementId={FIELD_ANCHORS.cooperativeSubtype}
                caption="Co-operative sub-type"
                name="cooperative-subtype"
                isEmptyStartOption
                value={step2.cooperativeSubtype}
                options={[...FORM2_COOPERATIVE_SUBTYPE_OPTIONS]}
                errorMessage={errors.cooperativeSubtype}
                customOnChange={(event) => {
                  patchStep2({ cooperativeSubtype: getEventValue(event) });
                  clearError('cooperativeSubtype');
                }}
              />
            </div>

            <div id={FIELD_ANCHORS.primaryActivity} className={styles.naicsBlock}>
              <label
                className={styles.naicsLabel}
                htmlFor="ontario-search-input-field"
              >
                Primary Activity
                <span className={styles.requiredFlag}> (required)</span>
              </label>
              <div className={styles.naicsSearch}>
                <NaicsSearchAutosuggest
                  elementId={`${FIELD_ANCHORS.primaryActivity}-input`}
                  value={step2.primaryActivity}
                  errorMessage={errors.primaryActivity}
                  onChange={(next) => {
                    patchStep2({ primaryActivity: next });
                    clearError('primaryActivity');
                  }}
                />
              </div>

              <OntarioHintExpander
                hint="What is the primary activity?"
                hintContentType="html"
                content={
                  'The primary activity is the main activity of your corporation. Please refer to <a href="https://www.statcan.gc.ca/en/concepts/searchclasscod" target="_blank" rel="noopener noreferrer">North American Industry Classification System (NAICS) Canada</a> for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form. Example: 4521 - Department stores.'
                }
              />
            </div>

            <div id={FIELD_ANCHORS.email} className={styles.emailField}>
              <OntarioInput
                elementId={FIELD_ANCHORS.email}
                caption="Official Email"
                name="official-email"
                type="email"
                required
                requiredValidationMessage={REQUIRED_FIELD_ERROR}
                value={step2.email}
                errorMessage={errors.email}
                customOnInput={(event) => {
                  patchStep2({ email: getEventValue(event) });
                  clearError('email');
                  clearError('confirmEmail');
                }}
              />
              <OntarioHintExpander
                hint="What is official email?"
                content={OFFICIAL_EMAIL_INFO}
              />
            </div>

            <div id={FIELD_ANCHORS.confirmEmail}>
              <OntarioInput
                elementId={FIELD_ANCHORS.confirmEmail}
                caption="Confirm Official Email"
                name="confirm-official-email"
                type="email"
                required
                requiredValidationMessage={REQUIRED_FIELD_ERROR}
                value={step2.confirmEmail}
                errorMessage={errors.confirmEmail}
                customOnInput={(event) => {
                  patchStep2({ confirmEmail: getEventValue(event) });
                  clearError('confirmEmail');
                }}
              />
            </div>
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

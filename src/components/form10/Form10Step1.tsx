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
  OBR_COOPERATIVE_NAME,
  OBR_COOPERATIVE_TYPE,
  OBR_INCORPORATION_DATE,
  OBR_OCN,
  OBR_OFFICIAL_EMAIL,
  OBR_PRIMARY_ACTIVITY,
  readForm10Draft,
  upsertForm10Step1,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 2;
const TOTAL_STEPS = 5;

const COOPERATIVE_TYPE_LABELS = [
  'Child-Care Co-operative',
  'Consumer Co-operative',
  'Farming and Supply Co-operative',
  'Financing Co-operative',
  'Housing Co-operative',
  'Housing Development Co-operative',
  'Marketing Co-operative',
  'Milk Transport Co-operative',
  'Renewable Energy Co-operative',
  'Service Co-operative',
  'Wholesale Supply Co-operative',
  'Worker Co-operative',
  'Other',
] as const;

const COOPERATIVE_TYPE_OPTIONS = COOPERATIVE_TYPE_LABELS.map((label) => ({
  value: label,
  label,
}));

type FieldKey = 'primaryActivity' | 'email' | 'confirmEmail' | 'cooperativeType';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  primaryActivity: 'primary-activity',
  email: 'coop-email',
  confirmEmail: 'coop-confirm-email',
  cooperativeType: 'cooperative-type',
};

const FIELD_ORDER: FieldKey[] = [
  'primaryActivity',
  'email',
  'confirmEmail',
  'cooperativeType',
];

const EMAIL_MISMATCH_ERROR =
  'Official Email and Confirm Official Email must match';

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  return target?.value ?? '';
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const shadowControl = target.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  if (shadowControl) {
    shadowControl.focus({ preventScroll: true });
    return;
  }

  if (target.matches('input, select, textarea, button, a, [tabindex]')) {
    target.focus({ preventScroll: true });
    return;
  }

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-textarea, ontario-input, ontario-radio-buttons, ontario-dropdown-list, ontario-search-box',
  );
  const nestedShadowControl = nestedHost?.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea',
  );
  if (nestedShadowControl) {
    nestedShadowControl.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function Form10Step1() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const existing = readForm10Draft();

  const cooperativeName = OBR_COOPERATIVE_NAME;
  const ocn = OBR_OCN;
  const incorporationDate = OBR_INCORPORATION_DATE;

  const [primaryActivity, setPrimaryActivity] = useState(() => {
    const saved = existing?.step1.primaryActivity?.trim() ?? '';
    return !saved || saved === OBR_PRIMARY_ACTIVITY ? '' : saved;
  });
  const [email, setEmail] = useState(existing?.step1.email || OBR_OFFICIAL_EMAIL);
  const [confirmEmail, setConfirmEmail] = useState(
    existing?.step1.email || OBR_OFFICIAL_EMAIL,
  );
  const [cooperativeType, setCooperativeType] = useState(() => {
    const saved = existing?.step1.cooperativeType || OBR_COOPERATIVE_TYPE;
    return COOPERATIVE_TYPE_LABELS.includes(
      saved as (typeof COOPERATIVE_TYPE_LABELS)[number],
    )
      ? saved
      : OBR_COOPERATIVE_TYPE;
  });
  const [errors, setErrors] = useState<FieldErrors>({});
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

  function buildStep1() {
    return {
      cooperativeName,
      ocn,
      primaryActivity: primaryActivity.trim(),
      email: email.trim(),
      cooperativeType: cooperativeType.trim(),
      incorporationDate,
    };
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!primaryActivity.trim()) {
      next.primaryActivity = 'Enter the NAICS (primary activity).';
    }
    if (!email.trim()) {
      next.email = 'Enter the official email.';
    } else if (!isValidEmail(email)) {
      next.email = 'Enter a valid official email.';
    }
    if (!confirmEmail.trim()) {
      next.confirmEmail = 'Confirm the official email.';
    } else if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      next.confirmEmail = EMAIL_MISMATCH_ERROR;
    }
    if (!cooperativeType.trim()) {
      next.cooperativeType = 'Select the type of co-operative.';
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

    upsertForm10Step1(buildStep1(), 'continue');
    navigate('/form-10/step-3');
  }

  function handleSaveAsDraft() {
    upsertForm10Step1(buildStep1(), 'draft');
    navigate('/form-10/draft-summary');
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
          backButtonUrl="/form-10/step-1"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Business details</h1>

          <p className={styles.lead}>
            Update the primary activity, official email, and type of co-operative as needed,
            then continue.
          </p>

          <div className={styles.formStack}>
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
                  value={primaryActivity}
                  errorMessage={errors.primaryActivity}
                  onChange={(next) => {
                    setPrimaryActivity(next);
                    clearError('primaryActivity');
                  }}
                />
              </div>
              <OntarioHintExpander
                hint="What is a Primary Activity (NAICS)?"
                hintContentType="html"
                content={
                  'The primary activity is the main activity of your corporation. Please refer to <a href="https://www.statcan.gc.ca/en/concepts/searchclasscod" target="_blank" rel="noopener noreferrer">North American Industry Classification System (NAICS) Canada</a> for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form.'
                }
              />
            </div>

            <div id={FIELD_ANCHORS.email}>
              <OntarioInput
                elementId={FIELD_ANCHORS.email}
                caption="Official Email"
                name="coop-email"
                type="email"
                required
                requiredValidationMessage="Enter the official email."
                value={email}
                errorMessage={errors.email}
                customOnInput={(event) => {
                  setEmail(getEventValue(event));
                  clearError('email');
                  clearError('confirmEmail');
                }}
              />
            </div>

            <div id={FIELD_ANCHORS.confirmEmail}>
              <OntarioInput
                elementId={FIELD_ANCHORS.confirmEmail}
                caption="Confirm Official Email"
                name="coop-confirm-email"
                type="email"
                required
                requiredValidationMessage="Confirm the official email."
                value={confirmEmail}
                errorMessage={errors.confirmEmail}
                customOnInput={(event) => {
                  setConfirmEmail(getEventValue(event));
                  clearError('confirmEmail');
                }}
              />
            </div>

            <div id={FIELD_ANCHORS.cooperativeType}>
              <OntarioDropdownList
                elementId={FIELD_ANCHORS.cooperativeType}
                caption="Type of Co-operative"
                name="cooperative-type"
                required
                isEmptyStartOption
                value={cooperativeType}
                options={COOPERATIVE_TYPE_OPTIONS}
                errorMessage={errors.cooperativeType}
                customOnChange={(event) => {
                  setCooperativeType(getEventValue(event));
                  clearError('cooperativeType');
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

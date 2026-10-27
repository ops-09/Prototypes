import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioHintExpander,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { NaicsSearchAutosuggest } from '../form7/NaicsSearchAutosuggest';
import { focusField, getEventValue, isValidEmail } from './form3Focus';
import {
  FORM3_TOTAL_STEPS,
  OBR_CORPORATION_NAME,
  OBR_INCORPORATION_DATE,
  OBR_OCN,
  OBR_OFFICIAL_EMAIL,
  OBR_PRIMARY_ACTIVITY,
  readForm3Draft,
  upsertForm3Step1,
} from './form3DraftStorage';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 2;
const EMAIL_MISMATCH_ERROR =
  'Official emails must match.';

type FieldKey = 'primaryActivity' | 'email' | 'confirmEmail';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  primaryActivity: 'primary-activity',
  email: 'corp-email',
  confirmEmail: 'corp-confirm-email',
};

const FIELD_ORDER: FieldKey[] = ['primaryActivity', 'email', 'confirmEmail'];

export function Form3Step1() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const existing = readForm3Draft();

  const corporationName = OBR_CORPORATION_NAME;
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
      corporationName,
      ocn,
      primaryActivity: primaryActivity.trim(),
      email: email.trim(),
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
    upsertForm3Step1(buildStep1(), 'continue');
    navigate('/form-3/step-3');
  }

  function handleSaveAsDraft() {
    upsertForm3Step1(buildStep1(), 'draft');
    navigate('/form-3/draft-summary');
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
          backButtonUrl="/form-3/step-1"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM3_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Corporation details</h1>
          <p className={styles.lead}>
            Update primary activity and official email as needed, then continue.
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
                hint="What is a primary activity (NAICS):"
                hintContentType="html"
                content={
                  'The primary activity is the main activity of your corporation. Please refer to <a href="https://www.statcan.gc.ca/en/concepts/searchclasscod" target="_blank" rel="noopener noreferrer">North American Industry Classification System (NAICS) Canada</a> for the list of activities. Select the activity that best describes the primary activity carried on by the corporation and provide the activity code from the link in this form.'
                }
              />
            </div>

            <div id={FIELD_ANCHORS.email}>
              <OntarioInput
                elementId={FIELD_ANCHORS.email}
                caption="Official email"
                name="corp-email"
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
                caption="Confirm official email"
                name="corp-confirm-email"
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

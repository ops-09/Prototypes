import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
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
  CONTINUANCE_COOPERATIVE_SUBTYPE_OPTIONS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP2,
  ensureContinuanceStep2Draft,
  OFFICIAL_EMAIL_INFO,
  PRIMARY_ACTIVITY_HINT,
  readContinuanceDraft,
  upsertContinuanceStep2,
  type ContinuanceFormId,
  type ContinuanceStep2Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 2;
const EMAIL_FORMAT_ERROR = 'Enter a valid email address, like name@example.com.';
const EMAIL_MATCH_ERROR = 'Official Email and Confirm Official Email must match';

type FieldKey = 'cooperativeSubtype' | 'primaryActivity' | 'email' | 'confirmEmail';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = [
  'cooperativeSubtype',
  'primaryActivity',
  'email',
  'confirmEmail',
];

function fieldAnchors(formId: ContinuanceFormId): Record<FieldKey, string> {
  const prefix = `form${formId}`;
  return {
    cooperativeSubtype: `${prefix}-cooperative-subtype`,
    primaryActivity: `${prefix}-primary-activity`,
    email: `${prefix}-official-email`,
    confirmEmail: `${prefix}-confirm-official-email`,
  };
}

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

type ContinuanceStep2Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep2({ formId }: ContinuanceStep2Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep2Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const anchors = fieldAnchors(formId);
  const instructionsHref = `/form-${formId}/step-1`;
  const continueHref = `/form-${formId}/step-3`;
  const draftSummaryHref = `/form-${formId}/draft-summary`;

  const [step2, setStep2] = useState<ContinuanceStep2Data>(() => ({
    ...EMPTY_STEP2,
    ...(draft.step2 ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(
    () =>
      FIELD_ORDER.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${anchors[key]}` }];
      }),
    [anchors, errors],
  );

  function patchStep2(partial: Partial<ContinuanceStep2Data>) {
    setStep2((prev) => ({ ...prev, ...partial }));
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

    if (!step2.cooperativeSubtype.trim()) {
      next.cooperativeSubtype = 'Select the type of co-operative.';
    }

    if (!step2.primaryActivity.trim() || !isSelectedNaicsLabel(step2.primaryActivity)) {
      next.primaryActivity = 'Enter the NAICS (primary activity).';
    }

    if (!step2.email.trim()) {
      next.email = 'Enter the official email.';
    } else if (!isValidEmail(step2.email)) {
      next.email = EMAIL_FORMAT_ERROR;
    }

    if (!step2.confirmEmail.trim()) {
      next.confirmEmail = 'Confirm the official email.';
    } else if (!isValidEmail(step2.confirmEmail)) {
      next.confirmEmail = EMAIL_FORMAT_ERROR;
    } else if (step2.email.trim().toLowerCase() !== step2.confirmEmail.trim().toLowerCase()) {
      next.confirmEmail = EMAIL_MATCH_ERROR;
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

    upsertContinuanceStep2(formId, step2, 'continue');
    navigate(afterSave(continueHref));
  }

  function handleSaveAsDraft() {
    const existing = readContinuanceDraft(formId);
    upsertContinuanceStep2(formId, step2, 'draft', existing?.lastCompletedStep ?? 0);
    navigate(draftSummaryHref);
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

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={instructionsHref}
          currentStep={CURRENT_STEP}
          numberOfSteps={CONTINUANCE_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Co-operative details</h1>
          <p className={styles.lead}>
            Select the co-operative’s sub-type, select its primary business activity, and provide
            its official email address. This information is collected for administrative purposes
            and will not appear in the public record.
          </p>

          <div className={styles.formStack}>
            <div id={anchors.cooperativeSubtype}>
              <OntarioDropdownList
                elementId={anchors.cooperativeSubtype}
                caption="Type of Co-operative"
                name="cooperative-subtype"
                required
                isEmptyStartOption
                value={step2.cooperativeSubtype}
                options={[...CONTINUANCE_COOPERATIVE_SUBTYPE_OPTIONS]}
                errorMessage={errors.cooperativeSubtype}
                customOnChange={(event) => {
                  patchStep2({ cooperativeSubtype: getEventValue(event) });
                  clearError('cooperativeSubtype');
                }}
              />
            </div>

            <div id={anchors.primaryActivity} className={styles.naicsBlock}>
              <label className={styles.naicsLabel} htmlFor="ontario-search-input-field">
                Primary Activity
                <span className={styles.requiredFlag}> (required)</span>
              </label>
              <div className={styles.naicsSearch}>
                <NaicsSearchAutosuggest
                  elementId={`${anchors.primaryActivity}-input`}
                  value={step2.primaryActivity}
                  errorMessage={errors.primaryActivity}
                  onChange={(next) => {
                    patchStep2({ primaryActivity: next });
                    clearError('primaryActivity');
                  }}
                />
              </div>
              <OntarioHintExpander
                hint="What is a Primary Activity (NAICS)?"
                hintContentType="html"
                content={PRIMARY_ACTIVITY_HINT}
              />
            </div>

            <div id={anchors.email} className={styles.emailField}>
              <OntarioInput
                elementId={anchors.email}
                caption="Official Email"
                name="official-email"
                type="email"
                required
                requiredValidationMessage="Enter the official email."
                value={step2.email}
                errorMessage={errors.email}
                customOnInput={(event) => {
                  patchStep2({ email: getEventValue(event) });
                  clearError('email');
                  clearError('confirmEmail');
                }}
              />
              <OntarioHintExpander hint="What is official email?" content={OFFICIAL_EMAIL_INFO} />
            </div>

            <div id={anchors.confirmEmail}>
              <OntarioInput
                elementId={anchors.confirmEmail}
                caption="Confirm Official Email"
                name="confirm-official-email"
                type="email"
                required
                requiredValidationMessage="Confirm the official email."
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

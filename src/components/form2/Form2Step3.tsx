import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  createSeedStep1,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  hasForm2Step1Data,
  hasForm2Step2Data,
  HEAD_OFFICE_INFO,
  readForm2Draft,
  saveForm2Draft,
  upsertForm2Step3,
  type Form2Draft,
  type Form2Step3Data,
} from './form2DraftStorage';
import {
  HEAD_OFFICE_FIELD_ANCHORS,
  HEAD_OFFICE_FIELD_ORDER,
  OntarioHeadOfficeAddressFields,
  validateHeadOfficeAddress,
  type HeadOfficeErrors,
} from '../shared/OntarioHeadOfficeAddressFields';
import styles from './Form2Step1.module.scss';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 9;

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

/** Prototype deep-link: seed Steps 1–2 so /form-2/step-4 opens from the playground. */
function ensureStep3Draft(): Form2Draft {
  const existing = readForm2Draft();
  if (
    hasForm2Step1Data(existing?.step1) &&
    hasForm2Step2Data(existing.step2) &&
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
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    step5: existing?.step5 ?? { ...EMPTY_STEP5 },
    step6: existing?.step6 ?? { ...EMPTY_STEP6 },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    savedAt: now,
    mode: 'continue',
    lastCompletedStep: 2,
  };
  saveForm2Draft(seeded);
  return seeded;
}

export function Form2Step3() {
  const navigate = useNavigate();
  const draft = ensureStep3Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step3, setStep3] = useState<Form2Step3Data>(() => ({
    ...EMPTY_STEP3,
    ...(draft.step3 ?? {}),
    province: 'Ontario',
    country: 'Canada',
  }));
  const [errors, setErrors] = useState<HeadOfficeErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Leaving by the back link or browser history skips Continue/Save, so edits are kept here.
  useEffect(() => {
    upsertForm2Step3(step3, readForm2Draft()?.mode ?? 'draft', 2);
  }, [step3]);

  const errorSummaryItems = useMemo(
    () =>
      HEAD_OFFICE_FIELD_ORDER.flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${HEAD_OFFICE_FIELD_ANCHORS[key]}` }];
      }),
    [errors],
  );

  function handleAddressChange(next: Form2Step3Data, cleared: (keyof HeadOfficeErrors)[]) {
    setStep3(next);
    if (cleared.length === 0) {
      return;
    }
    setErrors((prev) => {
      if (!cleared.some((key) => prev[key])) {
        return prev;
      }
      const remaining = { ...prev };
      cleared.forEach((key) => delete remaining[key]);
      return remaining;
    });
  }

  function handleContinue() {
    const nextErrors = validateHeadOfficeAddress(step3);
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertForm2Step3(step3, 'continue', 3);
    navigate('/form-2/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm2Step3(step3, 'draft', draft.lastCompletedStep >= 3 ? 3 : 2);
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
          backButtonUrl="/form-2/step-3"
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

          <div className={styles.formStack} id="head-office-address">
            <OntarioHeadOfficeAddressFields
              address={step3}
              errors={errors}
              onChange={handleAddressChange}
              locationHeading="The head office is at the:"
              addressHeading="The address of the head office is:"
            />
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

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { HEAD_OFFICE_INFO } from '../form1/form1DraftStorage';
import {
  HEAD_OFFICE_FIELD_ANCHORS,
  HEAD_OFFICE_FIELD_ORDER,
  OntarioHeadOfficeAddressFields,
  validateHeadOfficeAddress,
  type HeadOfficeErrors,
} from '../shared/OntarioHeadOfficeAddressFields';
import {
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP5,
  ensureContinuanceStep5Draft,
  readContinuanceDraft,
  upsertContinuanceStep5,
  type ContinuanceFormId,
  type ContinuanceStep5Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 5;

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

type ContinuanceStep5Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep5({ formId }: ContinuanceStep5Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep5Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const backHref = `/form-${formId}/step-4`;
  const continueHref = `/form-${formId}/step-6`;
  const draftSummaryHref = `/form-${formId}/draft-summary`;

  const [step5, setStep5] = useState<ContinuanceStep5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft.step5 ?? {}),
    province: 'Ontario',
    country: 'Canada',
  }));
  const [errors, setErrors] = useState<HeadOfficeErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

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

  function handleAddressChange(next: ContinuanceStep5Data, cleared: (keyof HeadOfficeErrors)[]) {
    setStep5(next);
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
    const nextErrors = validateHeadOfficeAddress(step5);
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertContinuanceStep5(formId, step5, 'continue');
    navigate(afterSave(continueHref));
  }

  function handleSaveAsDraft() {
    const existing = readContinuanceDraft(formId);
    upsertContinuanceStep5(formId, step5, 'draft', existing?.lastCompletedStep ?? 0);
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
          backButtonUrl={backHref}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Head office address</h1>
          <p className={styles.lead}>{HEAD_OFFICE_INFO}</p>

          <div className={styles.formStack} id="head-office-address">
            <OntarioHeadOfficeAddressFields
              address={step5}
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

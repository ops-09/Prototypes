import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  HEAD_OFFICE_FIELD_ANCHORS,
  HEAD_OFFICE_FIELD_ORDER,
  OntarioHeadOfficeAddressFields,
  validateHeadOfficeAddress,
  type HeadOfficeErrors,
} from '../shared/OntarioHeadOfficeAddressFields';
import { focusField } from './form11Focus';
import {
  EMPTY_STEP5,
  ensureForm11PlaygroundDraft,
  FORM11_TOTAL_STEPS,
  HEAD_OFFICE_INFO,
  readForm11Draft,
  upsertForm11Step5,
  type Form11Step5Data,
} from './form11DraftStorage';
import {
  FORM11_HEAD_OFFICE_ADDRESS_CAPTION,
  FORM11_HEAD_OFFICE_LOCATION_CAPTION,
} from './form11ReviewModel';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 5;

export function Form11Step5() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureForm11PlaygroundDraft(5));

  const [step5, setStep5] = useState<Form11Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft.step5 ?? {}),
    province: 'Ontario',
    country: 'Canada',
  }));
  const [errors, setErrors] = useState<HeadOfficeErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Leaving by the back link or browser history skips Continue/Save, so edits are kept here.
  useEffect(() => {
    const existing = readForm11Draft();
    const savedAs = existing?.savedAs === 'submitted' ? 'draft' : (existing?.savedAs ?? 'draft');
    const prior = existing?.lastCompletedStep ?? 0;
    upsertForm11Step5(step5, savedAs, prior > 4 ? prior : 4);
  }, [step5]);

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

  function handleAddressChange(next: Form11Step5Data, cleared: (keyof HeadOfficeErrors)[]) {
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

          <div className={styles.formStack} id="head-office-address">
            <OntarioHeadOfficeAddressFields
              address={step5}
              errors={errors}
              onChange={handleAddressChange}
              locationHeading={FORM11_HEAD_OFFICE_LOCATION_CAPTION}
              addressHeading={FORM11_HEAD_OFFICE_ADDRESS_CAPTION}
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

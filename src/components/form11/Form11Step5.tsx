import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { emptyNameNuans } from '../form7/form7DraftStorage';
import {
  HEAD_OFFICE_FIELD_ANCHORS,
  HEAD_OFFICE_FIELD_ORDER,
  OntarioHeadOfficeAddressFields,
  validateHeadOfficeAddress,
  type HeadOfficeErrors,
} from '../shared/OntarioHeadOfficeAddressFields';
import { focusField } from './form11Focus';
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

  function handleAddressChange(next: Form11Step5Data, cleared: (keyof HeadOfficeErrors)[]) {
    setStep5({ ...next, province: next.province || 'Ontario' });
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

          <div className={styles.formStack} id="head-office-address">
            <OntarioHeadOfficeAddressFields
              address={step5}
              errors={errors}
              onChange={handleAddressChange}
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

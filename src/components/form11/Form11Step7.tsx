import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { emptyNameNuans, type SupportingDocMeta } from '../form7/form7DraftStorage';
import { focusField, getEventValue } from './form11Focus';
import {
  AGREEMENT_EMPTY_ERROR,
  AGREEMENT_MAX_LENGTH_ERROR,
  createAccountAmalgamatingNfp,
  createEmptyAmalgamatingNfp,
  createSeedDirector,
  SAMPLE_HEAD_OFFICE,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  FORM11_RICH_TEXT_MAX_CHARS,
  FORM11_TOTAL_STEPS,
  hasForm11DirectorsComplete,
  hasForm11HeadOffice,
  MIN_AMALGAMATING_NFPS,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  saveForm11Draft,
  upsertForm11Step7,
  type Form11Draft,
  type Form11Step7Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 7;

function plainText(value: string) {
  if (!value.includes('<')) {
    return value;
  }
  const container = document.createElement('div');
  container.innerHTML = value;
  return (container.textContent ?? '').replace(/\u00a0/g, ' ');
}

type FieldKey = 'amalgamationAgreement';
type FieldErrors = Partial<Record<FieldKey, string>>;

function hasPriorSteps(draft: Form11Draft | null) {
  return Boolean(
    draft?.step2.email.trim() &&
      draft.step3.corporations.filter((entry) => entry.legalName.trim()).length >=
        MIN_AMALGAMATING_NFPS &&
      (draft.step4.changeName === 'yes' || draft.step4.changeName === 'no') &&
      hasForm11HeadOffice(draft.step5) &&
      hasForm11DirectorsComplete(draft.step6),
  );
}

function ensureStep7Draft(): Form11Draft {
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
    step5: { ...SAMPLE_HEAD_OFFICE },
    step6: {
      ...EMPTY_STEP6,
      countMode: 'fixed',
      fixedNumber: '3',
      directors: [createSeedDirector(0), createSeedDirector(1), createSeedDirector(2)],
    },
    step7: existing?.step7 ?? { ...EMPTY_STEP7 },
    step8: existing?.step8 ?? { ...EMPTY_STEP8 },
    savedAs: 'continue',
    savedAt: new Date().toISOString(),
    lastCompletedStep: 6,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm11Draft(draft);
  return draft;
}

export function Form11Step7() {
  const navigate = useNavigate();
  const existing = readForm11Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => {
    if (hasPriorSteps(existing)) {
      return existing as Form11Draft;
    }
    if (!existing) {
      return ensureStep7Draft();
    }
    return existing;
  });

  const [step7, setStep7] = useState<Form11Step7Data>(() => ({
    ...EMPTY_STEP7,
    ...(draft.step7 ?? {}),
    amalgamationAgreement: plainText(draft.step7?.amalgamationAgreement ?? ''),
    additionalDocuments: draft.step7?.additionalDocuments ?? [],
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(() => {
    if (!errors.amalgamationAgreement) {
      return [];
    }
    return [
      {
        key: 'amalgamationAgreement',
        message: errors.amalgamationAgreement,
        href: '#amalgamation-agreement',
      },
    ];
  }, [errors]);

  function clearAgreementError() {
    setErrors((prev) => {
      if (!prev.amalgamationAgreement) {
        return prev;
      }
      const next = { ...prev };
      delete next.amalgamationAgreement;
      return next;
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const text = step7.amalgamationAgreement;
    if (text.length > FORM11_RICH_TEXT_MAX_CHARS) {
      next.amalgamationAgreement = AGREEMENT_MAX_LENGTH_ERROR;
    } else if (!text.trim()) {
      next.amalgamationAgreement = AGREEMENT_EMPTY_ERROR;
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
    upsertForm11Step7(step7, 'continue');
    navigate('/form-11/step-8');
  }

  function handleSaveAsDraft() {
    upsertForm11Step7(step7, 'draft', readForm11Draft()?.lastCompletedStep ?? 6);
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
    if (draft.step4.changeName !== 'yes' && draft.step4.changeName !== 'no') {
      return <Navigate to="/form-11/step-4" replace />;
    }
    if (!hasForm11HeadOffice(draft.step5)) {
      return <Navigate to="/form-11/step-5" replace />;
    }
    return <Navigate to="/form-11/step-6" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-6"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Supporting documents</h1>
          <p className={styles.lead}>
            Upload a copy of the approved amalgamation agreement. You may also attach other
            documents that support this application.
          </p>

          <div className={styles.formStack}>
            <div id="amalgamation-agreement">
              {/* Same OntarioTextarea pattern as Form 1 / Form 2 membership fields. */}
              <OntarioTextarea
                elementId="amalgamation-agreement-input"
                caption="The following is a copy of the amalgamation agreement duly certified under corporate seal by the secretary of each of the amalgamating corporations:"
                name="amalgamation-agreement"
                required
                value={step7.amalgamationAgreement}
                errorMessage={errors.amalgamationAgreement}
                customOnInput={(event) => {
                  setStep7((prev) => ({
                    ...prev,
                    amalgamationAgreement: getEventValue(event),
                  }));
                  clearAgreementError();
                }}
              />
            </div>

            <SupportingDocumentsUpload
              label="Upload any other document to support this application"
              hintText="PDF only, maximum 20 MB per file."
              value={step7.additionalDocuments}
              showUploadedAt
              onChange={(files: SupportingDocMeta[]) =>
                setStep7((prev) => ({ ...prev, additionalDocuments: files }))
              }
              inputId="form11-additional-docs"
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

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCallout,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import {
  emptyDocsForCooperatives,
  readForm10Draft,
  upsertForm10Step3,
  type AmalgamatingCoopDocuments,
  type Form10Step3Data,
  type SupportingDocMeta,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 5;

const AGREEMENT_HINT =
  'A certified copy of the amalgamation agreement approved by each of the amalgamating co-operatives. The effective date of the amalgamation agreement must be within six (6) months of the submission of the Articles of Amalgamation.';

const AFFIDAVIT_HINT =
  'Affidavits of Solvency (Amalgamation) of two officers or of one officer and one director for each of the co-operative corporations that are being amalgamated.';

const AGREEMENT_REQUIRED_ERROR =
  'A Certified Copy of the Amalgamation Agreement is required for each amalgamating co-operative.';

const AFFIDAVITS_REQUIRED_ERROR =
  'Two Affidavits of Solvency are required for each amalgamating co-operative.';

type FieldKey = `agreement-${string}` | `affidavits-${string}`;

type FieldErrors = Partial<Record<FieldKey, string>>;

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = target.matches('input, select, textarea, button, a, [tabindex]')
    ? target
    : target.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
  focusable?.focus({ preventScroll: true });
}

function isStep3Ready() {
  const existing = readForm10Draft();
  return Boolean(
    existing?.step1.cooperativeName &&
      existing.step2.amalgamatingCooperatives.length >= 2 &&
      existing.step2.agreementApproved,
  );
}

function toForm7Docs(files: SupportingDocMeta[]) {
  return files;
}

export function Form10Step3() {
  const navigate = useNavigate();
  const draft = readForm10Draft();
  const ready = isStep3Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const cooperatives = draft?.step2.amalgamatingCooperatives ?? [];

  const [step3, setStep3] = useState<Form10Step3Data>(() => ({
    documentsByCooperative: emptyDocsForCooperatives(
      cooperatives,
      draft?.step3.documentsByCooperative,
    ),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const lastCompletedStep = draft?.lastCompletedStep ?? 0;

  useEffect(() => {
    if (!ready) {
      return;
    }
    upsertForm10Step3(step3, 'draft', lastCompletedStep >= 3 ? 3 : 2);
  }, [lastCompletedStep, ready, step3]);

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    cooperatives.forEach((coop, index) => {
      const agreementKey = `agreement-${coop.id}` as const;
      const affidavitsKey = `affidavits-${coop.id}` as const;
      if (errors[agreementKey]) {
        items.push({
          key: agreementKey,
          message: `Co-operative ${index + 1}: ${errors[agreementKey]}`,
          href: `#${agreementKey}`,
        });
      }
      if (errors[affidavitsKey]) {
        items.push({
          key: affidavitsKey,
          message: `Co-operative ${index + 1}: ${errors[affidavitsKey]}`,
          href: `#${affidavitsKey}`,
        });
      }
    });
    return items;
  }, [cooperatives, errors]);

  if (!ready || !draft) {
    return <Navigate to="/form-10/step-3" replace />;
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

  function patchCoopDocs(
    cooperativeId: string,
    patch: Partial<AmalgamatingCoopDocuments>,
    errorKey: FieldKey,
  ) {
    setStep3((prev) => ({
      ...prev,
      documentsByCooperative: prev.documentsByCooperative.map((row) =>
        row.cooperativeId === cooperativeId ? { ...row, ...patch } : row,
      ),
    }));
    clearError(errorKey);
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    cooperatives.forEach((coop) => {
      const row = step3.documentsByCooperative.find(
        (doc) => doc.cooperativeId === coop.id,
      ) ?? { cooperativeId: coop.id, certifiedAgreement: [], affidavits: [] };

      if (row.certifiedAgreement.length !== 1) {
        next[`agreement-${coop.id}`] = AGREEMENT_REQUIRED_ERROR;
      }
      if (row.affidavits.length !== 2) {
        next[`affidavits-${coop.id}`] = AFFIDAVITS_REQUIRED_ERROR;
      }
    });

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

    upsertForm10Step3(step3, 'continue', 3);
    navigate('/form-10/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm10Step3(step3, 'draft', 2);
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
          backButtonUrl="/form-10/step-3"
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Supporting documents</h1>
          <p className={styles.lead}>
            Upload documentation required to support this Articles of Amalgamation filing.
            Required uploads are based on the {cooperatives.length} amalgamating
            co-operative{cooperatives.length === 1 ? '' : 's'} entered in the previous step.
          </p>

          <div className={styles.formStack}>
            <div className={styles.requiredDocsCallout}>
              <OntarioCallout
                headingContentType="string"
                headingContent="Required for this amalgamation"
                content={`For each amalgamating co-operative: one Certified Copy of the Amalgamation Agreement and two Affidavits of Solvency (Amalgamation). PDF only, maximum 20 MB per file.`}
              />
            </div>

            {cooperatives.map((coop, index) => {
              const row =
                step3.documentsByCooperative.find(
                  (doc) => doc.cooperativeId === coop.id,
                ) ?? {
                  cooperativeId: coop.id,
                  certifiedAgreement: [],
                  affidavits: [],
                };
              const agreementKey = `agreement-${coop.id}` as const;
              const affidavitsKey = `affidavits-${coop.id}` as const;

              return (
                <section
                  key={coop.id}
                  className={styles.formStack}
                  aria-labelledby={`coop-docs-heading-${coop.id}`}
                >
                  <div className={styles.coopDocsIdentity}>
                    <h2
                      id={`coop-docs-heading-${coop.id}`}
                      className={`ontario-h3 ${styles.coopDocsName}`}
                    >
                      {coop.legalName || `Amalgamating co-operative ${index + 1}`}
                    </h2>
                    <p className={styles.coopDocsOcn}>OCN {coop.ocn || '—'}</p>
                  </div>

                  <div id={agreementKey}>
                    <SupportingDocumentsUpload
                      label="Certified Copy of the Amalgamation Agreement"
                      required
                      maxFiles={1}
                      hintText={AGREEMENT_HINT}
                      value={toForm7Docs(row.certifiedAgreement)}
                      errorMessage={errors[agreementKey]}
                      onChange={(files) =>
                        patchCoopDocs(
                          coop.id,
                          { certifiedAgreement: files },
                          agreementKey,
                        )
                      }
                      inputId={`agreement-upload-${coop.id}`}
                    />
                  </div>

                  <div id={affidavitsKey}>
                    <SupportingDocumentsUpload
                      label="Affidavits of Solvency (Amalgamation)"
                      required
                      maxFiles={2}
                      hintText={AFFIDAVIT_HINT}
                      value={toForm7Docs(row.affidavits)}
                      errorMessage={errors[affidavitsKey]}
                      onChange={(files) =>
                        patchCoopDocs(coop.id, { affidavits: files }, affidavitsKey)
                      }
                      inputId={`affidavits-upload-${coop.id}`}
                    />
                  </div>
                </section>
              );
            })}
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

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import { GeneratePdfSection } from '../shared/GeneratePdfSection';
import {
  createSeedAmalgamatingCooperatives,
  emptyDocsForCooperatives,
  EMPTY_NAME_CHANGE,
  EMPTY_STEP3,
  EMPTY_STEP4,
  FORM10_TOTAL_STEPS,
  OBR_STEP1_DEFAULTS,
  readForm10Draft,
  saveForm10Draft,
  upsertForm10Step4,
  type Form10Draft,
  type Form10Step4Data,
} from './form10DraftStorage';
import { generateForm10ReviewPdf } from './form10GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form10ReviewModel';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 6;

type ReviewErrors = Partial<{
  sections: string;
}>;

export function isStep4Ready() {
  const existing = readForm10Draft();
  return Boolean(
    existing?.step1.cooperativeName &&
      existing.step2.amalgamatingCooperatives.length >= 2 &&
      existing.step2.agreementApproved &&
      existing.nameChange.changeCooperativeName &&
      existing.lastCompletedStep >= 4,
  );
}

export function ensureReviewDraft(): Form10Draft {
  const existing = readForm10Draft();
  if (existing && isStep4Ready()) {
    return existing;
  }

  const now = new Date().toISOString();
  const cooperatives =
    existing?.step2.amalgamatingCooperatives.length &&
    existing.step2.amalgamatingCooperatives.length >= 2
      ? existing.step2.amalgamatingCooperatives
      : createSeedAmalgamatingCooperatives();
  const seeded: Form10Draft = {
    step1: {
      ...OBR_STEP1_DEFAULTS,
      ...(existing?.step1 ?? {}),
      primaryActivity:
        existing?.step1.primaryActivity.trim() || '4521 - Department stores',
    },
    step2: {
      amalgamatingCooperatives: cooperatives,
      agreementApproved: true,
    },
    nameChange: {
      ...EMPTY_NAME_CHANGE,
      ...(existing?.nameChange ?? {}),
      changeCooperativeName: existing?.nameChange.changeCooperativeName || 'no',
      selectedAmalgamatedCooperativeId:
        existing?.nameChange.selectedAmalgamatedCooperativeId || cooperatives[0].id,
    },
    step3: {
      ...EMPTY_STEP3,
      ...(existing?.step3 ?? {}),
      certifiedAgreement:
        existing?.step3.certifiedAgreement.length
          ? existing.step3.certifiedAgreement
          : [
              {
                id: 'seed-agreement',
                name: 'Amalgamation-Agreement.pdf',
                size: 184320,
                type: 'application/pdf',
                uploadedAt: now,
              },
            ],
      documentsByCooperative: emptyDocsForCooperatives(
        cooperatives,
        existing?.step3.documentsByCooperative,
      ).map((row, index) => ({
        ...row,
        affidavits:
          row.affidavits.length >= 2
            ? row.affidavits
            : [
                {
                  id: `seed-affidavit-${index}-1`,
                  name: `Affidavit-of-Solvency-${index + 1}A.pdf`,
                  size: 102400,
                  type: 'application/pdf',
                  uploadedAt: now,
                },
                {
                  id: `seed-affidavit-${index}-2`,
                  name: `Affidavit-of-Solvency-${index + 1}B.pdf`,
                  size: 102400,
                  type: 'application/pdf',
                  uploadedAt: now,
                },
              ],
      })),
    },
    step4: { ...EMPTY_STEP4, ...(existing?.step4 ?? {}) },
    savedAs: 'continue',
    savedAt: now,
    lastCompletedStep: 4,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm10Draft(seeded);
  return seeded;
}

export function Form10Step4() {
  const navigate = useNavigate();
  const draft = ensureReviewDraft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4] = useState<Form10Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft.step4 ?? {}),
    signedPdf: draft.step4?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const sections = useMemo(() => buildReviewSections(draft), [draft]);
  const incompleteKeys = useMemo(
    () =>
      new Set(
        sections.filter((section) => !section.complete).map((section) => section.key),
      ),
    [sections],
  );

  function validate(): ReviewErrors {
    const next: ReviewErrors = {};
    if (incompleteKeys.size > 0) {
      next.sections =
        'One or more sections are incomplete. Use Change to correct the information before continuing.';
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

    upsertForm10Step4(step4, 'continue', 5);
    navigate('/form-10/step-7');
  }

  function handleSaveAsDraft() {
    upsertForm10Step4(step4, 'draft', 5);
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

  function handleGeneratePdf() {
    const opened = generateForm10ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    (
      ['coopDetails', 'amalgamatingCooperatives', 'nameChange', 'supportingDocs'] as const
    ).find((key) => incompleteKeys.has(key)) ?? 'coopDetails';

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    const target = document.getElementById(href.replace('#', ''));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sectionAnchor = (key: ReviewSectionKey) => `review-${key}`;

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-10/step-5"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM10_TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && Object.keys(errors).length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errors.sections ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href={`#${sectionAnchor(firstIncompleteKey)}`}
                        onClick={(event) =>
                          handleSummaryLinkClick(
                            event,
                            `#${sectionAnchor(firstIncompleteKey)}`,
                          )
                        }
                      >
                        {errors.sections}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Review</h1>
          <p className={styles.lead}>
            Review the information you entered for this Articles of Amalgamation filing.
            Use Change to correct a section, then generate a PDF to sign. Continue to the
            next step to upload the signed copy and authorize the filing. There is no filing
            fee for Form 10.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div
                key={section.key}
                id={sectionAnchor(section.key)}
                className={section.groups?.length ? styles.formStack : undefined}
              >
                {section.rows.length > 0 || !section.groups?.length ? (
                  <Form7SummaryList
                    caption={section.caption}
                    headingLevel="h2"
                    captionActionLink={{ href: section.editHref, label: 'Change' }}
                    items={section.rows}
                    columnRatio="1-2"
                  />
                ) : null}
                {section.groups?.map((group) => (
                  <Form7SummaryList
                    key={group.key}
                    caption={group.caption}
                    headingLevel="h2"
                    captionActionLink={{ href: group.editHref, label: 'Change' }}
                    items={group.rows}
                    columnRatio="1-2"
                  />
                ))}
              </div>
            ))}

            <GeneratePdfSection
              idPrefix="form10"
              pdfBlocked={pdfBlocked}
              pdfGenerated={pdfGenerated}
              onGenerate={handleGeneratePdf}
              bodyText="Generate a PDF of the Articles of Amalgamation, including signature blocks for each amalgamating co-operative. Print or save the PDF, then sign it. Continue to the next step to upload the signed copy and authorize the filing."
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

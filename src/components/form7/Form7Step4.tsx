import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  createEmptyNuansReport,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  OBR_STEP1_DEFAULTS,
  readForm7Draft,
  saveForm7Draft,
  upsertForm7Step4,
  type Form7Step4Data,
} from './form7DraftStorage';
import { GeneratePdfSection } from '../shared/GeneratePdfSection';
import { generateForm7ReviewPdf } from './form7GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form7ReviewModel';
import { Form7SummaryList } from './Form7SummaryList';
import styles from './Form7Step1.module.scss';

const CURRENT_STEP = 5;
const TOTAL_STEPS = 6;

type ReviewErrors = Partial<{
  sections: string;
}>;

export function ensureStep4Draft() {
  const existing = readForm7Draft();
  if (
    existing?.step1.cooperativeName &&
    existing.step2.amendmentType &&
    existing.lastCompletedStep >= 3
  ) {
    return existing;
  }

  // Prototype deep-link: seed Steps 1–3 so /form-7/step-5 opens from the playground.
  const now = new Date().toISOString();
  const seeded = {
    step1: { ...OBR_STEP1_DEFAULTS },
    step2: {
      ...EMPTY_STEP2,
      nameNuans: {
        proposedName: 'MAPLE LEAF WORKERS CO-OPERATIVE INC.',
        nuansReports: [
          {
            ...createEmptyNuansReport(),
            file: {
              name: 'NUANS-Maple-Leaf.pdf',
              size: 245760,
              type: 'application/pdf',
            },
            date: '2026-08-15',
          },
        ],
      },
      amendmentType: 'change-name' as const,
      changeCooperativeName: 'change' as const,
    },
    step3: {
      ...EMPTY_STEP3,
      certifiedResolution: [
        {
          id: 'seed-resolution',
          name: 'Certified-Resolution.pdf',
          size: 184320,
          type: 'application/pdf',
          uploadedAt: now,
        },
      ],
      affidavits: [
        {
          id: 'seed-affidavit',
          name: 'Affidavit-of-Solvency.pdf',
          size: 102400,
          type: 'application/pdf',
          uploadedAt: now,
        },
      ],
      additional: existing?.step3?.additional ?? [],
      authorizationSubsections:
        existing?.step3?.authorizationSubsections?.length
          ? existing.step3.authorizationSubsections
          : ['151(1)', '151(2)'],
      resolutionConfirmedDate:
        existing?.step3?.resolutionConfirmedDate || '2026-09-01',
    },
    step4: {
      ...EMPTY_STEP4,
      ...(existing?.step4 ?? {}),
    },
    savedAs: 'continue' as const,
    savedAt: now,
    lastCompletedStep: 3 as const,
  };
  saveForm7Draft(seeded);
  return seeded;
}

export function Form7Step4() {
  const navigate = useNavigate();
  const draft = ensureStep4Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4] = useState<Form7Step4Data>(() => ({
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
  if (!draft.step1.cooperativeName || !draft.step2.amendmentType) {
    return <Navigate to="/form-7/step-2" replace />;
  }

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

    upsertForm7Step4(step4, 'continue', 4);
    navigate('/form-7/step-6');
  }

  function handleSaveAsDraft() {
    upsertForm7Step4(step4, 'draft', 4);
    navigate('/form-7/draft-summary');
  }

  function handleCancel() {
    navigate('/');
  }

  function handleGeneratePdf() {
    const opened = generateForm7ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    (['coopDetails', 'amendmentDetails', 'supportingDocs'] as const).find((key) =>
      incompleteKeys.has(key),
    ) ?? 'coopDetails';

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
          backButtonUrl="/form-7/step-4"
          currentStep={CURRENT_STEP}
          numberOfSteps={TOTAL_STEPS}
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
            Review the information you entered for this Articles of Amendment filing.
            Use Change to correct a section, then generate a PDF to sign. Continue to the
            next step to upload the signed copy and authorize the filing.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div key={section.key} id={sectionAnchor(section.key)}>
                <Form7SummaryList
                  caption={section.caption}
                  headingLevel="h2"
                  captionActionLink={{ href: section.editHref, label: 'Change' }}
                  items={section.rows}
                  columnRatio="1-2"
                />
              </div>
            ))}

            <GeneratePdfSection
              idPrefix="form7"
              pdfBlocked={pdfBlocked}
              pdfGenerated={pdfGenerated}
              onGenerate={handleGeneratePdf}
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

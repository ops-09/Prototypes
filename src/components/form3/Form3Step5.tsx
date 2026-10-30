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
  EMPTY_NAME_CHANGE,
  EMPTY_STEP4,
  EMPTY_STEP5,
  FORM3_TOTAL_STEPS,
  OBR_STEP1_DEFAULTS,
  readForm3Draft,
  saveForm3Draft,
  upsertForm3Step5,
  type Form3Draft,
  type Form3Step5Data,
} from './form3DraftStorage';
import { generateForm3ReviewPdf } from './form3GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form3ReviewModel';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 5;

type ReviewErrors = Partial<{
  sections: string;
}>;

export function isStep5Ready() {
  const existing = readForm3Draft();
  return Boolean(
    existing?.step1.corporationName &&
      existing.nameChange.changeCorporationName &&
      existing.step4.resolutionConfirmedDate &&
      existing.lastCompletedStep >= 3,
  );
}

export function ensureStep5Draft(): Form3Draft {
  const existing = readForm3Draft();
  if (existing && isStep5Ready()) {
    return existing;
  }

  const now = new Date().toISOString();
  const seeded: Form3Draft = {
    step1: {
      ...OBR_STEP1_DEFAULTS,
      ...(existing?.step1 ?? {}),
      primaryActivity:
        existing?.step1.primaryActivity.trim() || '4521 - Department stores',
    },
    nameChange: {
      ...EMPTY_NAME_CHANGE,
      ...(existing?.nameChange ?? {}),
      changeCorporationName: existing?.nameChange.changeCorporationName || 'no',
    },
    step4: {
      ...EMPTY_STEP4,
      ...(existing?.step4 ?? {}),
      resolutionConfirmedDate: existing?.step4.resolutionConfirmedDate || '2026-09-01',
      requestedProvisions:
        existing?.step4.requestedProvisions.trim() ||
        'Amend the objects of the corporation as set out in this application.',
    },
    step5: { ...EMPTY_STEP5, ...(existing?.step5 ?? {}) },
    savedAs: 'continue',
    savedAt: now,
    lastCompletedStep: 3,
    confirmationNumber: existing?.confirmationNumber,
  };
  saveForm3Draft(seeded);
  return seeded;
}

export function Form3Step5() {
  const navigate = useNavigate();
  const draft = ensureStep5Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step5] = useState<Form3Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft?.step5 ?? {}),
    signedPdf: draft?.step5?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const sections = useMemo(() => buildReviewSections(draft), [draft]);
  const incompleteKeys = useMemo(
    () => new Set(sections.filter((section) => !section.complete).map((section) => section.key)),
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
    upsertForm3Step5(step5, 'continue', 4);
    navigate('/form-3/step-6');
  }

  function handleSaveAsDraft() {
    upsertForm3Step5(step5, 'draft', 4);
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

  function handleGeneratePdf() {
    const opened = generateForm3ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    (['corporation', 'nameChange', 'provisions'] as const).find((key) =>
      incompleteKeys.has(key),
    ) ?? 'corporation';

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    document.getElementById(href.replace('#', ''))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const sectionAnchor = (key: ReviewSectionKey) => `review-${key}`;

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-3/step-4"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM3_TOTAL_STEPS}
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
            Review the information you entered for this Application for Supplementary
            Letters Patent. Use Change to correct a section, then generate a PDF to sign.
            Continue to the next step to upload the signed copy and authorize the filing.
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
              idPrefix="form3"
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

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import { GeneratePdfSection } from '../shared/GeneratePdfSection';
import { focusField } from './form11Focus';
import { generateForm11ReviewPdf } from './form11GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form11ReviewModel';
import {
  EMPTY_STEP8,
  ensureForm11PlaygroundDraft,
  FORM11_TOTAL_STEPS,
  readForm11Draft,
  upsertForm11Step8,
  type Form11Draft,
  type Form11Step8Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 8;

type ReviewErrors = Partial<{
  sections: string;
}>;

export function ensureStep8Draft(): Form11Draft {
  return ensureForm11PlaygroundDraft(8);
}

export function Form11Step8() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureForm11PlaygroundDraft(8));

  const [step8] = useState<Form11Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
    signedPdf: draft.step8?.signedPdf ?? null,
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
    upsertForm11Step8(step8, 'continue', 8);
    navigate('/form-11/step-9');
  }

  function handleSaveAsDraft() {
    upsertForm11Step8(step8, 'draft', readForm11Draft()?.lastCompletedStep ?? 8);
    navigate('/form-11/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleGeneratePdf() {
    const opened = generateForm11ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  const firstIncompleteKey =
    (
      [
        'corporation',
        'amalgamating',
        'amalgamatedName',
        'headOffice',
        'directors',
        'agreement',
        'supportingDocuments',
      ] as const
    ).find((key) => incompleteKeys.has(key)) ?? 'corporation';

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  const sectionAnchor = (key: ReviewSectionKey) => `review-${key}`;

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-7"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
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
                          handleSummaryLinkClick(event, `#${sectionAnchor(firstIncompleteKey)}`)
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
            Review the information you entered for this Application for Letters Patent of
            Amalgamation. Use Change to correct a section, then generate a PDF to sign.
            Continue to the next step to upload the signed copy and authorize the filing.
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
              idPrefix="form11"
              pdfBlocked={pdfBlocked}
              pdfGenerated={pdfGenerated}
              onGenerate={handleGeneratePdf}
              successContent="Sign the PDF, then continue to upload the signed copy and authorize the filing. Two signatures are required for each amalgamating corporation."
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

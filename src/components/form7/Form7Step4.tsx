import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { isIsoDateComplete } from '../form1/nameValidation';
import {
  createForm7ConfirmationNumber,
  createEmptyNuansReport,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  OBR_STEP1_DEFAULTS,
  readForm7Draft,
  saveForm7Draft,
  upsertForm7Step4,
  type Form7Step4Data,
} from './form7DraftStorage';
import { generateForm7ReviewPdf } from './form7GeneratePdf';
import { formatIsoDateDisplay } from './form7Labels';
import { buildReviewSections, type ReviewSectionKey } from './form7ReviewModel';
import { Form7SummaryList } from './Form7SummaryList';
import styles from './Form7Step1.module.scss';
import reviewStyles from './Form7Step4.module.scss';

const CURRENT_STEP = 5;
const TOTAL_STEPS = 5;
const AUTH_OPTION_VALUE = 'authorized';

type ReviewErrors = Partial<{
  sections: string;
  signedPdf: string;
  authorization: string;
}>;

const SIGNED_PDF_REQUIRED =
  'Upload the signed PDF before submitting this filing.';

function ensureStep4Draft() {
  const existing = readForm7Draft();
  if (
    existing?.step1.cooperativeName &&
    existing.step2.amendmentType &&
    existing.lastCompletedStep >= 3
  ) {
    return existing;
  }

  // Prototype deep-link: seed Steps 1–3 so /form-7/step-4 opens from the playground.
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

  const [step4, setStep4] = useState<Form7Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft.step4 ?? {}),
    signedPdf: draft.step4?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const filerName = `${OBR_FILER_FIRST_NAME} ${OBR_FILER_LAST_NAME}`;
  const sections = useMemo(() => buildReviewSections(draft), [draft]);
  const incompleteKeys = useMemo(
    () =>
      new Set(
        sections.filter((section) => !section.complete).map((section) => section.key),
      ),
    [sections],
  );
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form7-authorization-confirm',
        label: `I, ${filerName}, confirm that: The resolution authorizing the amendment was confirmed by the members of the co-operative on ${
          draft.step3.resolutionConfirmedDate &&
          isIsoDateComplete(draft.step3.resolutionConfirmedDate)
            ? formatIsoDateDisplay(draft.step3.resolutionConfirmedDate)
            : '(Date)'
        }.`,
      },
    ],
    [filerName, draft.step3.resolutionConfirmedDate],
  );

  if (!draft.step1.cooperativeName || !draft.step2.amendmentType) {
    return <Navigate to="/form-7" replace />;
  }

  function clearError(key: keyof ReviewErrors) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): ReviewErrors {
    const next: ReviewErrors = {};
    if (incompleteKeys.size > 0) {
      next.sections =
        'One or more sections are incomplete. Use Edit to correct the information before submitting.';
    }
    if (!step4.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step4.authorizationConfirmed) {
      next.authorization =
        'Confirm the authorization statement before submitting the filing.';
    }
    return next;
  }

  function handleSubmit() {
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

    const confirmationNumber = createForm7ConfirmationNumber();
    upsertForm7Step4(step4, 'submitted', 4, confirmationNumber);
    navigate('/form-7/draft-summary');
  }

  function handleSaveAsDraft() {
    upsertForm7Step4(step4, 'draft', 3);
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

  function patchStep4(partial: Partial<Form7Step4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
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
          backButtonUrl="/form-7/step-3"
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
                  {errors.signedPdf ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form7-signed-pdf"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form7-signed-pdf')
                        }
                      >
                        {errors.signedPdf}
                      </a>
                    </li>
                  ) : null}
                  {errors.authorization ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form7-authorization"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form7-authorization')
                        }
                      >
                        {errors.authorization}
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
            Use Edit to correct a section, generate a PDF to sign, upload the signed copy,
            then authorize and submit.
          </p>

          <div className={styles.formStack}>
            {sections.map((section) => (
              <div key={section.key} id={sectionAnchor(section.key)}>
                <Form7SummaryList
                  caption={section.caption}
                  headingLevel="h2"
                  captionActionLink={{ href: section.editHref, label: 'Edit' }}
                  items={section.rows}
                  columnRatio="1-2"
                />
              </div>
            ))}

            <section
              id="form7-generate-upload"
              className={reviewStyles.pdfSection}
              aria-labelledby="generate-upload-heading"
            >
              <h2 id="generate-upload-heading" className={reviewStyles.sectionHeading}>
                Generate and upload PDF
              </h2>
              <div className={reviewStyles.pdfSectionBody}>
                <div className={reviewStyles.pdfStep}>
                  <h3 className={reviewStyles.pdfStepTitle}>1. Generate PDF</h3>
                  <p className={reviewStyles.pdfStepText}>
                    Generate a PDF of the information prepared for this filing. Print or save
                    the PDF, then sign it. After signing, upload the signed PDF below.
                  </p>
                  <OntarioButton
                    type="secondary"
                    htmlType="button"
                    label="Generate PDF"
                    onClick={handleGeneratePdf}
                  />
                  {pdfBlocked ? (
                    <OntarioPageAlert
                      type="warning"
                      heading="Pop-up blocked"
                      content="Allow pop-ups for this site to open the printable PDF preview."
                    />
                  ) : null}
                  {pdfGenerated && !pdfBlocked ? (
                    <OntarioPageAlert
                      type="success"
                      heading="PDF generated"
                      content="Sign the PDF, then upload the signed copy below."
                    />
                  ) : null}
                </div>

                <div id="form7-signed-pdf" className={reviewStyles.pdfStep}>
                  <FileUpload
                    inputId="form7-signed-pdf-upload"
                    label="2. Upload signed PDF"
                    required
                    hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB."
                    buttonLabel="Upload signed PDF"
                    value={step4.signedPdf}
                    errorMessage={errors.signedPdf}
                    onChange={(file) => {
                      patchStep4({ signedPdf: file });
                      clearError('signedPdf');
                    }}
                  />
                </div>
              </div>
            </section>

            <section
              id="form7-authorization"
              className={reviewStyles.authSection}
              aria-labelledby="authorization-heading"
            >
              <h2 id="authorization-heading" className={reviewStyles.sectionHeading}>
                Authorization
              </h2>
              <OntarioCheckboxes
                caption={{
                  captionText: 'Authorization declaration',
                  captionType: 'default',
                }}
                name="form7-authorization"
                required
                options={authOptions}
                value={step4.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
                errorMessage={errors.authorization}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean'
                      ? selected
                      : !step4.authorizationConfirmed;
                  patchStep4({ authorizationConfirmed: nextChecked });
                  clearError('authorization');
                }}
              />
            </section>
          </div>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Submit"
              onClick={handleSubmit}
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

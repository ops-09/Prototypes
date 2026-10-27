import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { Form7SummaryList } from '../form7/Form7SummaryList';
import {
  createForm3ConfirmationNumber,
  EMPTY_STEP5,
  FORM3_TOTAL_STEPS,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  readForm3Draft,
  upsertForm3Step5,
  type Form3Step5Data,
} from './form3DraftStorage';
import { generateForm3ReviewPdf } from './form3GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form3ReviewModel';
import styles from './Form3Step1.module.scss';
import reviewStyles from './Form3Step5.module.scss';

const CURRENT_STEP = 5;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type ReviewErrors = Partial<{
  sections: string;
  signedPdf: string;
  authorization: string;
}>;

function isStep5Ready() {
  const existing = readForm3Draft();
  return Boolean(
    existing?.step1.corporationName &&
      existing.nameChange.changeCorporationName &&
      existing.step4.resolutionConfirmedDate &&
      existing.lastCompletedStep >= 3,
  );
}

export function Form3Step5() {
  const navigate = useNavigate();
  const draft = readForm3Draft();
  const ready = isStep5Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step5, setStep5] = useState<Form3Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft?.step5 ?? {}),
    signedPdf: draft?.step5?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pdfBlocked, setPdfBlocked] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const filerName = `${OBR_FILER_FIRST_NAME} ${OBR_FILER_LAST_NAME}`;
  const sections = useMemo(
    () => (draft && ready ? buildReviewSections(draft) : []),
    [draft, ready],
  );
  const incompleteKeys = useMemo(
    () => new Set(sections.filter((section) => !section.complete).map((section) => section.key)),
    [sections],
  );
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form3-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

  if (!ready || !draft) {
    return <Navigate to="/form-3/step-4" replace />;
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
        'One or more sections are incomplete. Use Change to correct the information before submitting.';
    }
    if (!step5.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step5.authorizationConfirmed) {
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
    const confirmationNumber = createForm3ConfirmationNumber();
    upsertForm3Step5(step5, 'submitted', 4, confirmationNumber);
    navigate('/form-3/draft-summary');
  }

  function handleSaveAsDraft() {
    upsertForm3Step5(step5, 'draft', 3);
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
    if (!draft) {
      return;
    }
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
                  {errors.signedPdf ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form3-signed-pdf"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form3-signed-pdf')
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
                        href="#form3-authorization"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form3-authorization')
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
            Review the information you entered for this Application for Supplementary
            Letters Patent. Use Change to correct a section, generate a PDF to sign, upload
            the signed copy, then authorize and submit.
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

            <section
              id="form3-generate-upload"
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
                    Generate a PDF to review the information that you have prepared to be
                    filed.
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

                <div id="form3-signed-pdf" className={reviewStyles.pdfStep}>
                  <FileUpload
                    inputId="form3-signed-pdf-upload"
                    label="2. Upload signed PDF"
                    required
                    hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
                    buttonLabel="Upload signed PDF"
                    value={step5.signedPdf}
                    errorMessage={errors.signedPdf}
                    onChange={(file) => {
                      setStep5((prev) => ({ ...prev, signedPdf: file }));
                      clearError('signedPdf');
                    }}
                  />
                </div>
              </div>
            </section>

            <section
              id="form3-authorization"
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
                name="form3-authorization"
                required
                options={authOptions}
                value={step5.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
                errorMessage={errors.authorization}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean'
                      ? selected
                      : !step5.authorizationConfirmed;
                  setStep5((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
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

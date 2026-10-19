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
  createForm10ConfirmationNumber,
  EMPTY_STEP4,
  FORM10_TOTAL_STEPS,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  readForm10Draft,
  upsertForm10Step4,
  type Form10Step4Data,
} from './form10DraftStorage';
import { generateForm10ReviewPdf } from './form10GeneratePdf';
import { buildReviewSections, type ReviewSectionKey } from './form10ReviewModel';
import styles from './Form10Step1.module.scss';
import reviewStyles from './Form10Step4.module.scss';

const CURRENT_STEP = 6;
const AUTH_OPTION_VALUE = 'authorized';

type ReviewErrors = Partial<{
  sections: string;
  signedPdf: string;
  authorization: string;
}>;

const SIGNED_PDF_REQUIRED =
  'Upload the signed PDF before submitting this filing.';

function isStep4Ready() {
  const existing = readForm10Draft();
  return Boolean(
    existing?.step1.cooperativeName &&
      existing.step2.amalgamatingCooperatives.length >= 2 &&
      existing.step2.agreementApproved &&
      existing.nameChange.changeCooperativeName &&
      existing.lastCompletedStep >= 4,
  );
}

export function Form10Step4() {
  const navigate = useNavigate();
  const draft = readForm10Draft();
  const ready = isStep4Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4, setStep4] = useState<Form10Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft?.step4 ?? {}),
    signedPdf: draft?.step4?.signedPdf ?? null,
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
        elementId: 'form10-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

  if (!ready || !draft) {
    return <Navigate to="/form-10/step-5" replace />;
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

    const confirmationNumber = createForm10ConfirmationNumber();
    upsertForm10Step4(step4, 'submitted', 5, confirmationNumber);
    navigate('/form-10/draft-summary');
  }

  function handleSaveAsDraft() {
    upsertForm10Step4(step4, 'draft', 4);
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
    if (!draft) {
      return;
    }
    const opened = generateForm10ReviewPdf({ draft });
    setPdfBlocked(!opened);
    if (opened) {
      setPdfGenerated(true);
    }
  }

  function patchStep4(partial: Partial<Form10Step4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
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
                  {errors.signedPdf ? (
                    <li>
                      <a
                        className={styles.errorSummaryLink}
                        href="#form10-signed-pdf"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form10-signed-pdf')
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
                        href="#form10-authorization"
                        onClick={(event) =>
                          handleSummaryLinkClick(event, '#form10-authorization')
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
            Review the information you entered for this Articles of Amalgamation filing.
            Use Edit to correct a section, generate a PDF to sign, upload the signed copy,
            then authorize and submit. There is no filing fee for Form 10.
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
              id="form10-generate-upload"
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
                    Generate a PDF of the Articles of Amalgamation, including signature
                    blocks for each amalgamating co-operative. Print or save the PDF, then
                    sign it. After signing, upload the signed PDF below.
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

                <div id="form10-signed-pdf" className={reviewStyles.pdfStep}>
                  <FileUpload
                    inputId="form10-signed-pdf-upload"
                    label="2. Upload signed PDF"
                    required
                    hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
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
              id="form10-authorization"
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
                name="form10-authorization"
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
